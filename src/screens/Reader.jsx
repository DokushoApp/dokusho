import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate} from 'react-router';
import MangaReader from '@/components/reader/MangaReader.jsx';
import useFetchMangaPages from "@/hooks/useFetchMangaPages.js";
import useFetchMangaChapters from "@/hooks/useFetchMangaChapters";

const Reader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const manga = location.state?.manga;
  const chapter = location.state?.chapter;

  // Track current chapter ID
  const [currentChapterId, setCurrentChapterId] = useState(chapter?.id);

  // Fetch manga pages for the current chapter
  const { pages, loading: pagesLoading, error: pagesError } = useFetchMangaPages(manga, chapter);

  // Fetch all chapters for navigation between chapters
  const { chapters, loading: chaptersLoading, error: chaptersError } = useFetchMangaChapters(manga);

  useEffect(() => {
    // Update current chapter ID when chapter changes
    if (chapter?.id && chapter.id !== currentChapterId) {
      setCurrentChapterId(chapter.id);
    }
  }, [chapter]);

  useEffect(() => {
    if(pagesError){
      console.error("Error loading manga pages:", pagesError);
      navigate(-1);
    }
  }, [pagesError, navigate]);

  // Handle back navigation
  const handleClose = () => {
    navigate(-1);
  };

  // Show loading spinner while loading
  if (pagesLoading || chaptersLoading || !manga || pages?.pages?.length === 0) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  // Render the reader with loaded manga and chapter information
  return (
    <div className="h-screen w-screen">
      <MangaReader
        pages={pages}
        manga={manga}
        onClose={handleClose}
        initialPage={0}
        chapters={chapters}
      />
    </div>
  );
};

export default Reader;