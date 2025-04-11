import React, {useState, useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router';
import MangaReader from '@/components/reader/MangaReader.jsx';
import {readDir} from '@tauri-apps/plugin-fs';
import {convertFileSrc} from '@tauri-apps/api/core';

const Reader = () => {
  const location = useLocation();
  const mangaPath = location.state.mangaPath;
  const [pages, setPages] = useState([]);
  const [error, setError] = useState(null);
  const [mangaTitle, setMangaTitle] = useState('');

  const navigate = useNavigate();

  // Load manga from location state or initial path
  useEffect(() => {
    if (mangaPath) {
      loadMangaFromPath(mangaPath)
    }
    console.log(mangaPath);
  }, []);

  // Handle close
  const handleClose = () => {
      navigate('/');
  };

  // Load manga from path
  const loadMangaFromPath = async (folderPath) => {
    try {
      setError(null);

      if (folderPath) {
        console.log({folderPath});
        const folderName = folderPath.split('/').pop().split('\\').pop();
        setMangaTitle(folderName);

        // Read all files in the directory
        const entries = await readDir(folderPath);

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
      }
    } catch (err) {
      console.error('Error loading manga:', err);
      setError('Failed to load manga: ' + err.message);
    }
  };

  // Empty state - no manga loaded
  if (pages.length === 0) {
    navigate("/");
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
  )
};

export default Reader;