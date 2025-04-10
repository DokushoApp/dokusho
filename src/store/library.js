import {exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import {BaseDirectory} from "@tauri-apps/api/path";
import {atom} from "jotai";

const fileExists = await exists("library.json", {
  baseDir: BaseDirectory.AppData,
});

const defaultLibrary = {
  manga: [],
  createdAt: Date.now(),
  updatedAt: Date.now()
}

if (!fileExists) {
  await writeTextFile("library.json", JSON.stringify(defaultLibrary), {
    baseDir: BaseDirectory.AppData,
  });
}

const libraryFile = await readTextFile("library.json", {
  baseDir: BaseDirectory.AppData,
})

const library = JSON.parse(libraryFile);
const libraryAtom = atom(library);

const saveLibraryAtom = atom(null, async (get, set) => {
  const library = get(libraryAtom)
  await writeTextFile("library.json", JSON.stringify(library), {
    baseDir: BaseDirectory.AppData,
  })
})

export {libraryAtom, saveLibraryAtom};