// src/hooks/useMangaPages.js
import { useState, useEffect } from 'react';
import { readDir } from '@tauri-apps/plugin-fs';
import { convertFileSrc } from '@tauri-apps/api/core';

/**
 * Custom hook to load manga pages from a directory path
 * @param {string} mangaPath - Path to the manga directory
 * @returns {Object} - Object containing pages array and loading state
 */
function useMangaPages(mangaPath) {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Skip if path is not provided
    if (!mangaPath) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const loadPages = async () => {
      try {
        setIsLoading(true);

        // Read all files in the directory
        const entries = await readDir(mangaPath, { recursive: false });

        // Don't update state if component unmounted during async operation
        if (!isMounted) return;

        // Filter for image files only
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
        const imageFiles = entries
          .filter(entry => {
            const lowerCaseName = entry.name?.toLowerCase() || '';
            return entry.children === undefined &&
              imageExtensions.some(ext => lowerCaseName.endsWith(ext));
          })
          .sort((a, b) => {
            // Try to sort numerically by extracting numbers from filenames
            const aMatch = a.name.match(/\d+/);
            const bMatch = b.name.match(/\d+/);

            if (aMatch && bMatch) {
              return parseInt(aMatch[0]) - parseInt(bMatch[0]);
            }

            // Fallback to alphabetical sort
            return a.name.localeCompare(b.name);
          });

        // Create page objects
        const loadedPages = imageFiles.map((file, index) => ({
          id: index,
          src: convertFileSrc(`${mangaPath}/${file.name}`),
          name: file.name
        }));

        setPages(loadedPages);
      } catch (err) {
        console.error('Error loading manga pages:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPages();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [mangaPath]);

  return { pages, isLoading };
}

export default useMangaPages;