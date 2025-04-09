import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Reader settings with persistence
export const readerSettingsAtom = atomWithStorage('reader_settings', {
  readingMode: 'left-to-right', // 'left-to-right', 'right-to-left', 'webtoon'
  pageLayout: 'single', // 'single', 'double'
  zoom: 1.0,
  autoHideControls: true
});

// Reading progress atom with persistence
export const readingProgressAtom = atomWithStorage('reading_progress', new Map());

// Recent manga atom with persistence
export const recentMangaAtom = atomWithStorage('recent_manga', []);

// Current manga atom (no persistence needed)
export const currentMangaAtom = atom(null);

// Helper function to update reading progress
export const updateReadingProgress = (
  setProgress,
  mangaPath,
  currentPage,
  totalPages
) => {
  if (!mangaPath) return;

  const progressData = {
    currentPage,
    totalPages,
    lastRead: new Date().toISOString(),
    percentage: Math.round((currentPage / Math.max(totalPages - 1, 1)) * 100)
  };

  // Update the progress map
  setProgress(prev => {
    // Create a new Map from the previous one
    const newMap = new Map(prev);
    // Set the new progress
    newMap.set(mangaPath, progressData);
    return newMap;
  });
};

// Helper function to get reading progress
export const getReadingProgress = (progress, mangaPath) => {
  if (!mangaPath || !progress || !progress.has) return null;
  return progress.get(mangaPath);
};