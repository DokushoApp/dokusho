import { atom } from 'jotai';
import { invoke } from '@tauri-apps/api/core';
import {BaseDirectory} from "@tauri-apps/api/path";
import {exists, readFile, readTextFile, stat, writeTextFile} from "@tauri-apps/plugin-fs";
import {save} from "@tauri-apps/plugin-dialog";


// Default settings values
export const defaultSettings = {
  theme: 'system',
  sidebar_collapsed: false,
  default_category_tab: "reading",
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
const fileExists = await exists("settings.json", {
  baseDir: BaseDirectory.AppData,
});

console.log({fileExists});
if(!fileExists) {
  await writeTextFile("settings.json", JSON.stringify(defaultSettings),{
    baseDir: BaseDirectory.AppData,
  });
}
const file = await readTextFile("settings.json", {
  baseDir: BaseDirectory.AppData,
})

const settings = JSON.parse(file);
export const settingsAtom = atom(settings);

// Loading state atom
export const isLoadingAtom = atom(true);
export const errorAtom = atom(null);

export const loadSettingsAtom = atom(
  null,
  async (get, set) => {
    try {
      set(isLoadingAtom, true);
      set(errorAtom, null);

      const fileExists = await exists("settings.json", {
        baseDir: BaseDirectory.AppData,
      });

      console.log({fileExists});
      if(!fileExists) {
        await writeTextFile("settings.json", JSON.stringify(defaultSettings),{
          baseDir: BaseDirectory.AppData,
        });
      }
      const file = await readTextFile("settings.json", {
        baseDir: BaseDirectory.AppData,
      })

      const settings = JSON.parse(file);
      set(settingsAtom, settings);

      return settings;
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
      const settings = get(settingsAtom);
      await writeTextFile("settings.json", JSON.stringify(settings),{
        baseDir: BaseDirectory.AppData,
      });
      console.log(true)
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
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

      await writeTextFile("settings.json", JSON.stringify(defaultSettings),{
        baseDir: BaseDirectory.AppData,
      });
      return true;
    } catch (error) {
      console.error('Failed to reset settings:', error);
      set(errorAtom, error.toString());
      return false;
    }
  }
);