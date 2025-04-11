import { atom } from 'jotai';
import {BaseDirectory} from "@tauri-apps/api/path";
import {exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";


// Default settings values
export const defaultSettings = {
  theme: 'system',
  sidebar_collapsed: false,
  default_category_tab: "reading",
  manga_card_size: "medium",
  categories:[
    {id: "all", name: "All"},
    {id: "plan-to-read", name: "Plan to Read"},
    {id: "reading", name: "Reading"},
    {id: "on-hold", name: "On Hold"},
    {id: "completed", name: "Completed"},
    {id: "dropped", name: "Dropped"}
  ],
  default_category: "plan-to-read",
  reading_mode:"left-to-right",
  reading_page_layout:"one-page",
  reader_zoom:1.0,
  extension_repo: "",
  show_nsfw: false,
};

const settingsAtom = atom(defaultSettings);

const initializeSettingsAtom = atom(null, async(get, set)=>{
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
    set(settingsAtom, settings);
  }
})

const loadSettingsAtom = atom(
  null,
  async (get, set) => {
    try {
      const file = await readTextFile("settings.json", {
        baseDir: BaseDirectory.AppData,
      })

      const settings = JSON.parse(file);
      set(settingsAtom, settings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null;
    }
  }
);

// Atom to save settings to storage
const saveSettingsAtom = atom(
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
const resetSettingsAtom = atom(
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

export {settingsAtom, initializeSettingsAtom, loadSettingsAtom,saveSettingsAtom, resetSettingsAtom};