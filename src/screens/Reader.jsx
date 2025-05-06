import React, {useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router';
import MangaReader from '@/components/reader/MangaReader.jsx';
import useFetchMangaPages from "@/hooks/useFetchMangaPages.js";

const Reader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const manga = location.state.manga;
  const chapter = location.state.chapter;

  const { pages, loading, error } = useFetchMangaPages(manga, chapter);

  useEffect(() => {
    console.log(pages);
  }, [pages]);

  useEffect(() => {
    if(error){
      navigate(-1);
    }
  }, [error])


  // Handle back navigation
  const handleClose = () => {
    navigate('/');
  };

  // Show loading spinner while loading or if manga not found
  if (loading || !manga || pages?.pages?.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Render the reader with loaded manga
  return (
    <div className="h-screen w-screen">
      <MangaReader
        pages={pages}
        manga={manga}
        onClose={handleClose}
        initialPage={0}
        chapterTitle={manga.title}
      />
    </div>
  );
};

export default Reader;