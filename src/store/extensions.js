// src/store/extensions.js
import { atom } from 'jotai';
import { invoke } from "@tauri-apps/api/core";

// Main extensions atom
export const extensionsAtom = atom({
  extensions: [],
  last_updated: new Date().toISOString()
});

// Load extensions from backend
export const loadExtensionsAtom = atom(null, async (get, set) => {
  try {
    const result = await invoke("get_all_extensions");
    set(extensionsAtom, {
      extensions: result.extensions || [],
      last_updated: result.last_updated
    });
    return result.extensions || [];
  } catch (error) {
    console.error("Failed to load extensions:", error);
    return [];
  }
});

// Add extension atom
export const addExtensionAtom = atom(null, async (get, set, extension) => {
  try {
    await invoke("add_extension", { extension });
    // Reload extensions after adding
    await get(loadExtensionsAtom)();
    return true;
  } catch (error) {
    console.error("Failed to add extension:", error);
    return false;
  }
});

// Remove extension atom
export const removeExtensionAtom = atom(null, async (get, set, extensionId) => {
  try {
    await invoke("remove_extension", { extensionId });
    // Reload extensions after removing
    await get(loadExtensionsAtom)();
    return true;
  } catch (error) {
    console.error("Failed to remove extension:", error);
    return false;
  }
});

// Validate extension file atom
export const validateExtensionFileAtom = atom(null, async (get, set, path) => {
  try {
    return await invoke("validate_extension_file", { path });
  } catch (error) {
    console.error("Failed to validate extension file:", error);
    throw error;
  }
});

// Validate extension URL atom
export const validateExtensionUrlAtom = atom(null, async (get, set, url) => {
  try {
    return await invoke("validate_extension_url", { url });
  } catch (error) {
    console.error("Failed to validate extension URL:", error);
    throw error;
  }
});

// Initialize extensions atom
export const initializeExtensionsAtom = atom(null, async (get, set) => {
  try {
    // Simply load extensions from backend
    await get(loadExtensionsAtom)();
  } catch (error) {
    console.error("Failed to initialize extensions:", error);
  }
});