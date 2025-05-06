import { invoke } from "@tauri-apps/api/core";
import { useAtom } from "jotai";
import { libraryAtom, saveLibraryAtom } from "@/store/library.js";
import { focusAtom } from "jotai-optics";
import { useCallback } from "react";
import { nanoid } from "nanoid";

// Create a focused atom for the manga list for better performance
const mangaListAtom = focusAtom(libraryAtom, optic => optic.prop("manga"));

/**
 * Custom hook for manga library operations
 * @returns {Object} Library operations
 */
export function useMangaLibrary() {
  const [mangaList, setMangaList] = useAtom(mangaListAtom);
  const [, saveLibrary] = useAtom(saveLibraryAtom);

  /**
   * Add a manga to the library
   * @param {Object} manga - The manga to add
   * @param {string} categoryId - The category id to add the manga to
   * @returns {Promise<boolean>} Success status
   */
  const addMangaToLibrary = useCallback(async (manga, categoryId) => {
    try {
      // Check if manga already exists
      const existingManga = mangaList.find(m =>
        (m.id === manga.id) ||
        (m.source_id === manga.source_id && m.title === manga.title)
      );

      if (existingManga) {
        // Update existing manga
        const updatedList = mangaList.map(m =>
          m.id === existingManga.id
            ? { ...m, category: categoryId, updated_at: new Date().toISOString() }
            : m
        );

        setMangaList(updatedList);
      } else {
        // Create a new manga entry
        const newManga = {
          id: manga.id || nanoid(),
          title: manga.title,
          cover: manga.cover,
          category: categoryId,
          progress: 0,
          last_read: null,
          path: manga.path || '',
          source_id: manga.source_id || 'local',
          description: manga.description || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        setMangaList([...mangaList, newManga]);
      }

      // Save to storage
      await saveLibrary();
      return true;

    } catch (error) {
      console.error("Error adding manga to library:", error);
      return false;
    }
  }, [mangaList, setMangaList, saveLibrary]);

  /**
   * Update a manga's category
   * @param {Object} manga - The manga to update
   * @param {string} categoryId - The new category id
   * @returns {Promise<boolean>} Success status
   */
  const updateMangaCategory = useCallback(async (manga, categoryId) => {
    try {
      const mangaId = manga.id;

      // Find manga in list
      const mangaIndex = mangaList.findIndex(m => m.id === mangaId);

      if (mangaIndex === -1) {
        console.error(`Manga with id ${mangaId} not found`);
        return false;
      }

      // Create updated list
      const updatedList = [...mangaList];
      updatedList[mangaIndex] = {
        ...updatedList[mangaIndex],
        category: categoryId,
        updated_at: new Date().toISOString()
      };

      // Update state
      setMangaList(updatedList);

      // Save to storage
      await saveLibrary();
      return true;

    } catch (error) {
      console.error("Error updating manga category:", error);
      return false;
    }
  }, [mangaList, setMangaList, saveLibrary]);

  /**
   * Delete a manga from the library
   * @param {Object} manga - The manga to delete
   * @returns {Promise<boolean>} Success status
   */
  const deleteMangaFromLibrary = useCallback(async (manga) => {
    try {
      // Remove from state
      const updatedList = mangaList.filter(m => m.id !== manga.id);
      setMangaList(updatedList);

      // If it's a local manga, delete the files
      if (manga.source_id === 'local' && manga.path) {
        try {
          await invoke("delete_manga", { path: manga.path });
        } catch (err) {
          console.error("Error deleting manga files:", err);
          // Continue with library update even if file deletion fails
        }
      }

      // Save to storage
      await saveLibrary();
      return true;

    } catch (error) {
      console.error("Error deleting manga:", error);
      return false;
    }
  }, [mangaList, setMangaList, saveLibrary]);

  return {
    addMangaToLibrary,
    updateMangaCategory,
    deleteMangaFromLibrary
  };
}

/**
 * Check if a manga is in the library - Utility function that needs to be used with the hook
 * @param {Array} mangaList - The manga list to check against
 * @param {Object} manga - The manga to check
 * @returns {boolean} True if manga is in library
 */
export function isInLibrary(mangaList, manga) {
  return mangaList.some(m =>
    (m.id === manga.id) ||
    (m.source_id === manga.source_id && m.title === manga.title)
  );
}