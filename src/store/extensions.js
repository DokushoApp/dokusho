import { atom } from 'jotai';
import { invoke } from "@tauri-apps/api/core";
import { BaseDirectory } from "@tauri-apps/api/path";
import { exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

// Default extensions database data structure
const defaultExtensionsData = {
  repositories: [],
  extensions: [],
  updated_at: new Date().toISOString()
};

// Main extensions atom
export const extensionsAtom = atom(defaultExtensionsData);

// Initialize extensions from storage
export const initializeExtensionsAtom = atom(null, async (get, set) => {
  try {
    const fileExists = await exists("extensions.json", {
      baseDir: BaseDirectory.AppData,
    });

    if (!fileExists) {
      // Create default extensions file if it doesn't exist
      await writeTextFile("extensions.json", JSON.stringify(defaultExtensionsData), {
        baseDir: BaseDirectory.AppData,
      });
      set(extensionsAtom, defaultExtensionsData);
    } else {
      // Read existing extensions file
      const extensionsFile = await readTextFile("extensions.json", {
        baseDir: BaseDirectory.AppData,
      });
      set(extensionsAtom, JSON.parse(extensionsFile));
    }

    // After initialization, fetch the latest data from backend
    await get(refreshExtensionsAtom)();
  } catch (error) {
    console.error("Failed to initialize extensions:", error);
  }
});

// Load extensions from storage
export const loadExtensionsAtom = atom(null, async (get, set) => {
  try {
    const extensionsData = await readTextFile("extensions.json", {
      baseDir: BaseDirectory.AppData,
    });
    set(extensionsAtom, JSON.parse(extensionsData));
  } catch (error) {
    console.error("Failed to load extensions:", error);
  }
});

// Save extensions to storage
export const saveExtensionsAtom = atom(null, async (get, set) => {
  try {
    const extensions = get(extensionsAtom);
    await writeTextFile("extensions.json", JSON.stringify(extensions), {
      baseDir: BaseDirectory.AppData,
    });
  } catch (error) {
    console.error("Failed to save extensions:", error);
  }
});

// Refresh extensions data from backend
export const refreshExtensionsAtom = atom(null, async (get, set) => {
  try {
    // Call backend to get extensions list
    const result = await invoke("get_extensions_list");
    if (result) {
      // Parse and update the atom
      const data = JSON.parse(result);
      set(extensionsAtom, {
        ...data,
        updated_at: new Date().toISOString()
      });

      // Save to file
      await get(saveExtensionsAtom)();
    }
  } catch (error) {
    console.error("Failed to refresh extensions:", error);
  }
});