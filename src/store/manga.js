import {atom} from "jotai";
import {focusAtom} from "jotai-optics";

const defaultManga = {
  chapters: [],
  created_at: Date.now(),
  updated_at: Date.now(),
}

export const mangaAtom = atom(defaultManga);
export const chaptersAtom = focusAtom(mangaAtom, optic => optic.prop("chapters"))

export const loadMangaAtom = atom(null, async ()=>{

});

export const saveMangaAtom = atom(null, async ()=>{

})

