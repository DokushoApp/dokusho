import {exists, readTextFile, writeTextFile} from "@tauri-apps/plugin-fs";
import {BaseDirectory} from "@tauri-apps/api/path";
import {atom, useAtom} from "jotai";

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

const loadLibraryAtom = atom(null, async (get, set) => {
  const libraryData = await readTextFile("library.json", {
    baseDir: BaseDirectory.AppData,
  })
  set(libraryAtom,JSON.parse(libraryData))
})

export {libraryAtom, loadLibraryAtom};