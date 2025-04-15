import {exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import {BaseDirectory} from "@tauri-apps/api/path";
import {atom} from "jotai";

const defaultLibrary = {
  manga: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
}
const libraryAtom = atom(defaultLibrary);

const initializeLibraryAtom = atom(null, async (get, set) => {
  const fileExists = await exists("library.json", {
    baseDir: BaseDirectory.AppData,
  });

  if (!fileExists) {
    await writeTextFile("library.json", JSON.stringify(defaultLibrary), {
      baseDir: BaseDirectory.AppData,
    });
    set(libraryAtom, defaultLibrary);
  } else {
    const libraryFile = await readTextFile("library.json", {
      baseDir: BaseDirectory.AppData,
    })
    const library = JSON.parse(libraryFile);
    set(libraryAtom, library);
  }
})

const loadLibraryAtom = atom(null, async (get, set) => {
  const libraryData = await readTextFile("library.json", {
    baseDir: BaseDirectory.AppData,
  })
  set(libraryAtom, JSON.parse(libraryData))
})

const saveLibraryAtom = atom(null, async (get, set) => {
  await writeTextFile("library.json", JSON.stringify(get(libraryAtom)), {
    baseDir: BaseDirectory.AppData,
  });
})

export {libraryAtom, initializeLibraryAtom,loadLibraryAtom, saveLibraryAtom};