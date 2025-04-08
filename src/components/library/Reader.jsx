import React, {useState, useRef, useEffect, forwardRef, useImperativeHandle} from 'react';
import {Button} from '@/components/ui/button';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Separator} from '@/components/ui/separator';
import {ChevronLeft, ChevronRight, Upload, ZoomIn, ZoomOut, RefreshCw, BookOpen} from 'lucide-react';

// Import Tauri APIs
import {open} from '@tauri-apps/plugin-dialog';
import {readDir} from '@tauri-apps/plugin-fs';
import {convertFileSrc} from '@tauri-apps/api/core';

const Reader = forwardRef(({initialPath}, ref) => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [mangaTitle, setMangaTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Expose loadMangaFromPath method via ref
  useImperativeHandle(ref, () => ({
    loadMangaFromPath: (path) => {
      if (path) {
        loadMangaFromPath(path);
      }
      console.log(path)
    }
  }));

  // Function to load manga directly from a specified path
  const loadMangaFromPath = async (folderPath) => {
    try {
      setIsLoading(true);

      if (folderPath) {
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
            // Sort based on name - attempts to handle numeric sorting
            // (e.g., page1.jpg comes before page10.jpg)
            const aName = a.name?.replace(/\D/g, '') || '0';
            const bName = b.name?.replace(/\D/g, '') || '0';
            return parseInt(aName) - parseInt(bName);
          });

        // Create page objects using Tauri's convertFileSrc to safely access local files
        const loadedPages = imageFiles.map((file, index) => ({
          id: index,
          src: convertFileSrc(folderPath + "/" + file.name),
          name: file.name
        }));
        console.log(loadedPages);

        setPages(loadedPages);
        setCurrentPage(0);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error loading manga:', err);
      setIsLoading(false);
    }
  };

  // Load from initialPath when component mounts
  useEffect(() => {
    if (initialPath) {
      loadMangaFromPath(initialPath);
    }
  }, [initialPath]);

  // Function to open file dialog and select manga/manhwa folder
  const openManga = async () => {
    try {
      setIsLoading(true);

      // Open a selection dialog for directories
      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Manga Folder'
      });

      if (selected) {
        await loadMangaFromPath(selected);

        // Save to recently read list (simplified for this example)
        // In a real app, you would use localStorage or Tauri's fs API to persist this
        // saveToRecentList(selected, mangaTitle);
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error opening manga folder:', err);
      setIsLoading(false);
    }
  };

  const nextPage = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);

      // Reset scroll position when changing pages
      if (scrollRef.current) {
        scrollRef.current.scrollTo({top: 0});
      }
    }
  };

  const prevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);

      // Reset scroll position when changing pages
      if (scrollRef.current) {
        scrollRef.current.scrollTo({top: 0});
      }
    }
  };

  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.1, 2));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.1, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === '+') {
        zoomIn();
      } else if (e.key === '-') {
        zoomOut();
      } else if (e.key === '0') {
        resetZoom();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentPage, pages.length, zoomLevel]);

  return (
    <div className="flex flex-col h-full w-full bg-white dark:bg-neutral-900">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-neutral-800">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={openManga}>
            <Upload className="h-4 w-4"/>
          </Button>
          <h2 className="text-black dark:text-white text-sm font-medium truncate max-w-xs">
            {mangaTitle || 'No manga loaded'}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={resetZoom}>
                  <RefreshCw className="h-4 w-4"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset Zoom</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4"/>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Separator/>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {pages.length > 0 ? (
          <div className="flex flex-col h-full">
            {/* Reader */}
            <div className="flex-1 relative">
              <ScrollArea className="h-full w-full" scrollRef={scrollRef}>
                <div className="flex justify-center min-h-full py-2">
                  <div
                    style={{
                      transform: `scale(${zoomLevel})`,
                      transition: 'transform 0.2s ease-in-out'
                    }}
                    className="origin-center"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    ) : (
                      pages[currentPage] && (
                        <img
                          src={pages[currentPage].src}
                          alt={`Page ${currentPage + 1}`}
                          className="max-w-full mx-auto"
                          style={{maxHeight: 'calc(100vh - 130px)'}}
                        />
                      )
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Navigation buttons - side overlays */}
              <div className="absolute inset-y-0 left-0 flex items-center">
                <Button
                  variant="ghost"
                  onClick={prevPage}
                  disabled={currentPage === 0 || pages.length === 0}
                  className="h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40"
                >
                  <ChevronLeft className="h-6 w-6"/>
                </Button>
              </div>

              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button
                  variant="ghost"
                  onClick={nextPage}
                  disabled={currentPage === pages.length - 1 || pages.length === 0}
                  className="h-12 w-12 rounded-full bg-black/20 text-white hover:bg-black/40"
                >
                  <ChevronRight className="h-6 w-6"/>
                </Button>
              </div>
            </div>

            {/* Footer with pagination */}
            <div className="p-2 bg-gray-100 dark:bg-neutral-800 flex justify-between items-center">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Page {currentPage + 1} of {pages.length}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage === pages.length - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <BookOpen className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4"/>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No manga loaded</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Open a manga folder to start reading</p>
            <Button onClick={openManga}>
              Open Manga Folder
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});

export default Reader;