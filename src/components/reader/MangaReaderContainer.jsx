import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import MinimalReader from './MinimalReader';
import { atom, useAtom } from 'jotai';
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { convertFileSrc } from '@tauri-apps/api/core';
import { BookOpen, FolderOpen } from 'lucide-react';

// Store for recently opened manga
export const recentMangaAtom = atom([]);

const MangaReaderContainer = ({ initialPath, onClose }) => {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mangaTitle, setMangaTitle] = useState('');
  const [mangaPath, setMangaPath] = useState(initialPath || '');
  const [recentManga, setRecentManga] = useAtom(recentMangaAtom);

  const navigate = useNavigate();
  const location = useLocation();

  // Load manga from location state or initial path
  useEffect(() => {
    const pathToLoad = initialPath || location.state?.mangaPath;
    if (pathToLoad) {
      setMangaPath(pathToLoad);
      loadMangaFromPath(pathToLoad);
    }
  }, [initialPath, location.state]);

  // Handle close
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    } else {
      navigate('/');
    }
  };

  // Load manga from path
  const loadMangaFromPath = async (folderPath) => {
    try {
      setIsLoading(true);
      setError(null);

      if (folderPath) {
        // Extract folder name for manga title
        const folderName = folderPath.split('/').pop().split('\\').pop();
        setMangaTitle(folderName);

        // Read all files in the directory
        const entries = await readDir(folderPath, {recursive: false});

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
          src: convertFileSrc(`${folderPath}/${file.name}`),
          name: file.name
        }));

        setPages(loadedPages);

        // Add to recent manga
        addToRecentManga(folderPath, folderName, loadedPages.length);
      }
    } catch (err) {
      console.error('Error loading manga:', err);
      setError('Failed to load manga: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to recent manga list
  const addToRecentManga = (path, title, pageCount) => {
    const newEntry = {
      path,
      title,
      pageCount,
      lastOpened: new Date().toISOString()
    };

    setRecentManga(prev => {
      // Remove if already exists
      const filtered = prev.filter(item => item.path !== path);
      // Add to beginning of array (most recent first)
      return [newEntry, ...filtered.slice(0, 19)]; // Keep only 20 most recent
    });
  };

  // Open manga folder dialog
  const openMangaFolder = async () => {
    try {
      setIsLoading(true);

      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Manga Folder'
      });

      if (selected) {
        setMangaPath(selected);
        await loadMangaFromPath(selected);
      }
    } catch (err) {
      console.error('Error opening manga folder:', err);
      setError('Failed to open folder: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-neutral-900 text-white">
        <div className="text-center">
          <div
            className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-xl">Loading manga...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-neutral-900 text-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24"
                 stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Manga</h2>
          <p className="text-neutral-300 mb-4">{error}</p>
          <button
            onClick={openMangaFolder}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state - no manga loaded
  if (pages.length === 0) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-neutral-900 text-white">
        <div className="text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-4 text-neutral-500"/>
          <h2 className="text-2xl font-semibold mb-4">Manga Reader</h2>
          <p className="text-neutral-400 mb-6">Select a manga folder to start reading</p>
          <button
            onClick={openMangaFolder}
            className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <FolderOpen className="h-5 w-5"/>
            Open Manga Folder
          </button>
        </div>
      </div>
    );
  }

  // Render the reader with loaded manga
  return (
    <div className="h-full w-full">
      <MinimalReader
        pages={pages}
        onClose={handleClose}
        initialPage={0}
        chapterTitle={mangaTitle}
      />
    </div>
  )
};

export default MangaReaderContainer;