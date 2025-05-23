import { atom } from 'jotai';
import {BaseDirectory} from "@tauri-apps/api/path";
import {exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import {focusAtom} from "jotai-optics";


// Default settings values
export const defaultSettings = {
  theme: 'system',
  sidebar_collapsed: false,
  default_category: "HjFCo9Zlih",
  selected_category_tab: "reading",
  manga_card_size: "default",
  categories:[
    {id: "HjFCo9Zlih", name: "Picked Up"},
    {id: "M6wEcKUjJO", name: "Reading"},
    {id: "NOQI3t7Xuo", name: "On Hold"},
    {id: "LmGttS3i8c", name: "Completed"},
    {id: "ut8dw483Cj", name: "Dropped"}
  ],
  reading_mode:"left-to-right",
  reading_page_layout:"one-page",
  reader_zoom:1.0,
  extension_repos: [],
  show_nsfw: false,
};


export const settingsAtom = atom(defaultSettings);
export const showNsfwAtom = focusAtom(settingsAtom, optic => optic.prop("show_nsfw"));
export const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
export const readingModeAtom = focusAtom(settingsAtom, optic => optic.prop("reading_mode"));
export const readerPageLayoutAtom = focusAtom(settingsAtom, optic => optic.prop("reading_page_layout"));
export const readerZoomAtom = focusAtom(settingsAtom, optic => optic.prop("reader_zoom"));



export const initializeSettingsAtom = atom(null, async(get, set)=>{
  const fileExists = await exists("settings.json", {
    baseDir: BaseDirectory.AppData,
  });

  if(!fileExists) {
    await writeTextFile("settings.json", JSON.stringify(defaultSettings),{
      baseDir: BaseDirectory.AppData,
    });
    set(settingsAtom, defaultSettings);
  }else{
    const file = await readTextFile("settings.json", {
      baseDir: BaseDirectory.AppData,
    })

    const settings = JSON.parse(file);

    // Ensure all default settings exist
    const updatedSettings = {
      ...defaultSettings,
      ...settings,
    };

    // If extension_repos doesn't exist, add it
    if (!settings.extension_repos) {
      updatedSettings.extension_repos = [];
    }

    set(settingsAtom, updatedSettings);
  }
})

export const loadSettingsAtom = atom(
  null,
  async (get, set) => {
    try {
      const file = await readTextFile("settings.json", {
        baseDir: BaseDirectory.AppData,
      })

      const settings = JSON.parse(file);

      // Ensure all default settings exist
      const updatedSettings = {
        ...defaultSettings,
        ...settings,
      };

      set(settingsAtom, updatedSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
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
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
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
      return false;
    }
  }
);