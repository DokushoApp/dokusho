// src/store/extensions.js
import { atom } from 'jotai';
import { invoke } from "@tauri-apps/api/core";

// Main extensions atom - initialize as an empty array
export const extensionsAtom = atom([]);

// Selected extension atom
export const selectedExtensionAtom = atom(null);

// Load extensions from backend
export const loadExtensionsAtom = atom(
  (get) => get(extensionsAtom),
  async (get, set) => {
    try {
      // Call the Tauri backend to get extensions
      const result = await invoke("get_all_extensions");

      // Normalize result structure to ensure we always have an array
      const extensionList = result?.extensions || [];

      // Update the extensions atom with the fetched data
      set(extensionsAtom, extensionList);

      // Return the extensions for convenience
      return extensionList;
    } catch (error) {
      console.error("Failed to load extensions:", error);
      // On error, set an empty array to avoid null/undefined issues
      set(extensionsAtom, []);
      return [];
    }
  }
);

// Initialize extensions atom
export const initializeExtensionsAtom = atom(
  null,
  async (get, set) => {
    try {
      // Simply call loadExtensionsAtom directly
      const loadFunction = get(loadExtensionsAtom);
      if (typeof loadFunction === 'function') {
        await loadFunction();
      } else {
        // Fallback in case the getter is not callable
        const result = await invoke("get_all_extensions");
        set(extensionsAtom, result?.extensions || []);
      }
    } catch (error) {
      console.error("Failed to initialize extensions:", error);
      set(extensionsAtom, []);
    }
  }
);