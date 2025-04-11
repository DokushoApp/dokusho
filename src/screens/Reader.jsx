import React from 'react';
import {useLocation, useNavigate, useParams} from 'react-router';
import MangaReader from '@/components/reader/MangaReader.jsx';
import useMangaPages from '@/hooks/useMangaPages';

const Reader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const manga = location.state.manga;

  const { pages, isLoading } = useMangaPages(manga.path);

  // Handle back navigation
  const handleClose = () => {
    navigate('/');
  };

  // Show loading spinner while loading or if manga not found
  if (isLoading || !manga || pages.length === 0) {
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
        chapterTitle={manga.title}
      />
    </div>
  );
};

export default Reader;