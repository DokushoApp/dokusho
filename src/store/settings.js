import { atom } from 'jotai';
import { invoke } from '@tauri-apps/api/core';
import {BaseDirectory} from "@tauri-apps/api/path";
import {readFile, stat} from "@tauri-apps/plugin-fs";


// Default settings values
export const defaultSettings = {
  theme: 'system',
  sidebar_collapsed: false,
  default_category_tab: "Reading",
  manga_card_grid: 3,
  manga_card_size: "medium",
  categories:[
    {id: "plan-to-read", name: "Plan to Read"},
    {id: "reading", name: "Reading"},
    {id: "on-hold", name: "On Hold"},
    {id: "completed", name: "Completed"},
    {id: "dropped", name: "Dropped"}
  ],
  default_category: "plan-to-read",
  reading_mode:"left-to-right",
  reading_page_layout:"continuous",
  reader_zoom:100,
  reader_padding:10,
  extension_repo: "",
  show_nsfw: false,
};

// Create a single settings atom
export const settingsAtom = atom(defaultSettings);

// Loading state atom
export const isLoadingAtom = atom(true);
export const errorAtom = atom(null);

// Atom to load settings from storage
export const loadSettingsAtom = atom(
  null,
  async (get, set) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);
<<<<<<< Updated upstream
<<<<<<< Updated upstream
=======


>>>>>>> Stashed changes
=======


>>>>>>> Stashed changes
      // const settings = await invoke('get_settings');
      // set(settingsAtom, settings);

      // return settings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      set(errorAtom, error.toString());
      return null;
    } finally {
      set(isLoadingAtom, false);
    }
  }
);

// Atom to save settings to storage
export const saveSettingsAtom = atom(
  null,
  async (get, set) => {
    try {
      // const settings = get(settingsAtom);
      // await invoke('save_settings', { settings });
      // return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      set(errorAtom, error.toString());
      return false;
    }
  }
);

// Function to update a specific setting
export const updateSettingAtom = atom(
  null,
  async (get, set, { key, value }) => {
    try {
      const currentSettings = get(settingsAtom);
      const newSettings = {
        ...currentSettings,
        [key]: value
      };

      set(settingsAtom, newSettings);

      // Save settings after updating
      const write = get(saveSettingsAtom);
      return await write();
    } catch (error) {
      console.error(`Failed to update setting ${key}:`, error);
      set(errorAtom, error.toString());
      return false;
    }
  }
);

// Function to reset all settings to defaults
export const resetSettingsAtom = atom(
  null,
  async (get, set) => {
    try {
      set(settingsAtom, defaultSettings);

      // Save the default settings
      const write = get(saveSettingsAtom);
      return await write();
    } catch (error) {
      console.error('Failed to reset settings:', error);
      set(errorAtom, error.toString());
      return false;
    }
  }
);