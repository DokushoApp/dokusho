import React, { useState, useEffect } from 'react';
import {useLocation, useNavigate} from 'react-router';
import MangaReader from '@/components/reader/MangaReader.jsx';
import { readDir } from '@tauri-apps/plugin-fs';
import { convertFileSrc } from '@tauri-apps/api/core';

const Reader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const manga = location.state.manga;
  const [pages, setPages] = useState([]);
  const [mangaTitle, setMangaTitle] = useState('');

  // Load manga pages when component mounts or manga changes
  useEffect(() => {
    const loadMangaPages = async () => {
      try {
        const mangaPath = manga.path;

        // Set manga title from manga object
        setMangaTitle(manga.title || '');

        // Read all files in the directory
        const entries = await readDir(mangaPath);

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
        navigate('/');
      }
    };

    loadMangaPages();
  }, [manga]);

  // Handle back navigation
  const handleClose = () => {
    navigate('/');
  };

  // Simple loading indicator while pages are loading
  if (!manga || pages.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render the reader with loaded manga
  return (
    <div className="h-screen w-screen overflow-hidden">
      <MangaReader
        pages={pages}
        onClose={handleClose}
        initialPage={0}
        chapterTitle={mangaTitle}
      />
    </div>
  );
};

export default Reader;