import React, {useState, useRef, useEffect} from 'react';
import {X, Settings, HelpCircle} from 'lucide-react';
import {useAtom} from 'jotai';
import {cn} from '@/lib/utils';
import HelpOverlay from "@/components/reader/HelpOverlay.jsx";
import SettingsOverlay from "@/components/reader/SettingsOverlay.jsx";
import {Button} from "@/components/ui/button.jsx";
import {readerPageLayoutAtom, readerZoomAtom, readingModeAtom} from "@/store/settings.js";
import {useNavigate, useLocation} from "react-router";
import {convertFileSrc} from "@tauri-apps/api/core";
import useFetchMangaChapters from "@/hooks/useFetchMangaChapters";

const MangaReader = ({
                       pages,
                       manga,
                       initialPage = 0,
                       chapterTitle = "",
                       onClose,
                       chapters = [],
                       chapterId
                     }) => {
  // State from Jotai store
  const [readingMode, setReadingMode] = useAtom(readingModeAtom);
  const [readerPageLayout, setReaderPageLayout] = useAtom(readerPageLayoutAtom);
  const [readerZoom, setReaderZoom] = useAtom(readerZoomAtom);

  const navigate = useNavigate();
  const location = useLocation();
  const chapter = location.state?.chapter;

  // Local state that doesn't need to persist
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPage);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // References
  const containerRef = useRef(null);
  const webtoonRef = useRef(null);

  // Directly access chapter from location state - avoid recalculation
  const currentChapterIndex = React.useMemo(() => {
    if (!chapters || chapters.length === 0) return -1;

    return chapters.findIndex(ch => ch.id === (chapter?.id || chapterId));
  }, [chapters, chapter?.id, chapterId]);

  // Setup end detection for webtoon mode
  useEffect(() => {
    if (readingMode === 'webtoon' && webtoonRef.current) {
      const webtoonElement = webtoonRef.current;

      const handleScroll = () => {
        // Check if we've scrolled to the bottom (with a small buffer)
        const isAtBottom =
          webtoonElement.scrollHeight - webtoonElement.scrollTop - webtoonElement.clientHeight < 50;

        if (isAtBottom) {
          // Small delay to make sure we're really at the bottom and not just passing by
          setTimeout(() => {
            const stillAtBottom =
              webtoonElement.scrollHeight - webtoonElement.scrollTop - webtoonElement.clientHeight < 50;

            if (stillAtBottom) {
              goToNextChapter();
            }
          }, 300);
        }
      };

      webtoonElement.addEventListener('scroll', handleScroll);
      return () => webtoonElement.removeEventListener('scroll', handleScroll);
    }
  }, [readingMode, webtoonRef.current]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Navigation based on reading mode
      if (readingMode === 'left-to-right') {
        if (e.key === 'ArrowRight' || e.key === ' ') {
          nextPage();
        } else if (e.key === 'ArrowLeft') {
          prevPage();
        }
      } else if (readingMode === 'right-to-left') {
        if (e.key === 'ArrowLeft' || e.key === ' ') {
          nextPage();
        } else if (e.key === 'ArrowRight') {
          prevPage();
        }
      } else if (readingMode === 'webtoon') {
        if (e.key === ' ' || e.key === 'ArrowDown') {
          if (webtoonRef.current) {
            webtoonRef.current.scrollBy({top: window.innerHeight * 0.8, behavior: 'smooth'});
          }
        } else if (e.key === 'ArrowUp') {
          if (webtoonRef.current) {
            webtoonRef.current.scrollBy({top: -window.innerHeight * 0.8, behavior: 'smooth'});
          }
        }
      }

      // Zoom controls
      if (e.key === '+' || e.key === '=') {
        setReaderZoom(Math.min(readerZoom + 0.1, 2));
      } else if (e.key === '-') {
        setReaderZoom(Math.max(readerZoom - 0.1, 0.5));
      } else if (e.key === '0') {
        setReaderZoom(1.0);
      }

      // Toggle page layout with 'd' key
      if (e.key.toLowerCase() === 'd' && readingMode !== "webtoon") {
        setReaderPageLayout(readerPageLayout === 'single' ? 'double' : 'single');
      }

      // Toggle help overlay with 'h' key
      if (e.key.toLowerCase() === 'h') {
        setShowHelp(prev => !prev);
      }

      // Toggle settings with 's' key
      if (e.key.toLowerCase() === 's') {
        setShowSettings(prev => !prev);
      }

      // Close reader with Escape key
      if (e.key === 'Escape' && !showHelp) {
        handleReaderClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [readingMode, readerZoom, readerPageLayout, pages?.pages?.length, currentPageIndex]);

  // Detect whether the chapters list is in ascending or descending order
  // Default to descending order (newest first) as that's the app's default
  const isDescendingOrder = React.useMemo(() => {
    if (!chapters || chapters.length < 2) return true; // Default to descending

    // Try to determine order based on chapter numbers
    const firstChapterWithNumber = chapters.find(ch => ch.number);
    const lastChapterWithNumber = [...chapters].reverse().find(ch => ch.number);

    if (firstChapterWithNumber && lastChapterWithNumber) {
      const firstNum = parseFloat(firstChapterWithNumber.number) || 0;
      const lastNum = parseFloat(lastChapterWithNumber.number) || 0;
      return firstNum > lastNum; // If first chapter number > last, it's descending
    }

    // Default assumption: descending order (newest first)
    return true;
  }, [chapters]);

  // Function to handle moving to the next chapter with debounce to prevent multiple triggers
  const [isNavigating, setIsNavigating] = useState(false);

  const goToNextChapter = () => {
    // Prevent multiple rapid navigation attempts
    if (isNavigating) return;

    setIsNavigating(true);

    // Important: Use the chapters array passed as prop
    if (chapters && chapters.length > 0) {
      // Find current chapter index
      const currentIndex = chapters.findIndex(ch =>
        ch.id === (chapter?.id || chapterId)
      );

      // If we have a valid index
      if (currentIndex !== -1) {
        // Determine next chapter based on order
        let nextIndex;

        if (isDescendingOrder) {
          // For descending order (newest first), go to lower index (older chapter)
          nextIndex = currentIndex + 1;
        } else {
          // For ascending order (oldest first), go to higher index (newer chapter)
          nextIndex = currentIndex + 1;
        }

        // Check if next index is valid
        if (nextIndex >= 0 && nextIndex < chapters.length) {
          const nextChapter = chapters[nextIndex];
          console.log("Navigating to chapter:", nextChapter.title || nextChapter.id, "Index:", nextIndex);

          // Navigate to the reader with the next chapter
          navigate('/reader', {
            state: {
              manga,
              chapter: nextChapter
            },
            replace: true // Replace current history entry to avoid back button issues
          });

          // Reset navigation lock after delay
          setTimeout(() => setIsNavigating(false), 1000);
          return;
        }
      }

      // If we get here, there's no valid next chapter
      console.log("No next chapter available, returning to details");
      navigate(-1);
    } else {
      // No chapters available, go back
      navigate(-1);
    }

    // Reset navigation lock after delay
    setTimeout(() => setIsNavigating(false), 1000);
  };

  // Function to handle moving to the previous chapter
  const goToPreviousChapter = () => {
    if (isNavigating) return;
    setIsNavigating(true);

    if (chapters && chapters.length > 0) {
      const currentIndex = chapters.findIndex(ch =>
        ch.id === (chapter?.id || chapterId)
      );

      if (currentIndex !== -1) {
        // Determine previous chapter based on order
        let prevIndex;

        if (isDescendingOrder) {
          // For descending order (newest first), go to higher index (newer chapter)
          prevIndex = currentIndex - 1;
        } else {
          // For ascending order (oldest first), go to lower index (older chapter)
          prevIndex = currentIndex - 1;
        }

        // Check if previous index is valid
        if (prevIndex >= 0 && prevIndex < chapters.length) {
          const prevChapter = chapters[prevIndex];
          console.log("Navigating to previous chapter:", prevChapter.title || prevChapter.id);

          navigate('/reader', {
            state: {
              manga,
              chapter: prevChapter
            },
            replace: true
          });

          setTimeout(() => setIsNavigating(false), 1000);
          return;
        }
      }
    }

    // If no valid previous chapter, just go to first page of current chapter
    setCurrentPageIndex(0);
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleReaderClose = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // Navigation functions
  const nextPage = () => {
    if (currentPageIndex < pages.pages.length - 1) {
      if (readerPageLayout === "double" && readingMode === 'left-to-right' && currentPageIndex % 2 === 0) {
        // In double page mode with left-to-right, advance by 2 pages when on an even page
        setCurrentPageIndex(Math.min(currentPageIndex + 2, pages.pages.length - 1));
      } else if (readerPageLayout === "double" && readingMode === 'right-to-left') {
        // In double page mode with right-to-left, advance by 2 pages
        setCurrentPageIndex(Math.min(currentPageIndex + 2, pages.pages.length - 1));
      } else {
        setCurrentPageIndex(currentPageIndex + 1);
      }
    } else {
      // At the end of the chapter, automatically go to the next chapter
      goToNextChapter();
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      if (readerPageLayout === "double" && readingMode === 'left-to-right' && currentPageIndex % 2 === 1) {
        // In double page mode with left-to-right, go back by 2 pages when on an odd page
        setCurrentPageIndex(Math.max(currentPageIndex - 2, 0));
      } else if (readerPageLayout === "double" && readingMode === 'right-to-left') {
        // In double page mode with right-to-left, go back by 2 pages
        setCurrentPageIndex(Math.max(currentPageIndex - 2, 0));
      } else {
        // Default single page back
        setCurrentPageIndex(currentPageIndex - 1);
      }
    } else {
      // At the beginning of the chapter, try to go to the previous chapter
      goToPreviousChapter();
    }
  };

  // Handle tap zones
  const handleTapZone = (zone) => {
    if (zone === 'center') {
      return;
    }

    if (readingMode === "webtoon") return; // No navigation in webtoon mode

    if (readingMode === 'left-to-right') {
      if (zone === 'right') nextPage();
      else if (zone === 'left') prevPage();
    } else {
      if (zone === 'left') nextPage();
      else if (zone === 'right') prevPage();
    }
  };

  // Get current page
  const getCurrentPage = () => {
    if (!pages?.pages || pages.pages.length === 0) return null;
    return pages.pages[currentPageIndex];
  };

  // Empty state
  if (!pages?.pages || pages.pages.length === 0) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-background text-foreground">
        <div className="text-center">
          <p>No pages to display</p>
          <button
            onClick={handleReaderClose}
            className="mt-4 px-4 py-2 bg-accent text-accent-foreground rounded hover:bg-accent/90 transition-colors"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-full w-full relative bg-background"
      ref={containerRef}
    >
      {/* Reader Content */}
      <div className="h-full w-full" onClick={() => handleTapZone('center')}>
        {/* Webtoon Mode */}
        {readingMode === "webtoon" ? (
          <div
            ref={webtoonRef}
            className="h-full w-full overflow-auto"
          >
            <div
              className="flex flex-col items-center px-4"
              style={{
                maxWidth: `${500 * readerZoom}px`,
                margin: '0 auto',
                width: `${Math.min(100 / readerZoom, 100)}%`
              }}
            >
              {pages.pages.map((page, index) => {
                return <img
                  key={index}
                  src={manga.source_id === "local" ? convertFileSrc(pages.base_url + "/" + page) : pages.base_url + "/" + page}
                  alt={`Page ${index + 1}`}
                  className="w-auto max-w-full object-contain"
                  style={{transform: `scale(${readerZoom})`, transformOrigin: 'top center'}}
                  loading="lazy"
                />
              })}

              {/* Small indicator at the bottom that user has reached the end */}
              <div className="w-full py-8 text-center text-muted-foreground text-sm">
                Loading next chapter...
              </div>
            </div>
          </div>
        ) : (
          /* Paged Mode (Left-to-Right or Right-to-Left) */
          <div className="h-full w-full flex justify-center items-center overflow-hidden">
            <div className="relative h-full w-full flex justify-center items-center">
              {readerPageLayout === "double" ? (
                // Double page view
                <div
                  className="flex justify-center items-center"
                  style={{transform: `scale(${readerZoom})`, transition: 'transform 0.2s ease'}}
                >
                  {/* Handle double page layout - show two pages side by side */}
                  {readingMode === 'right-to-left' ? (
                    // For right-to-left manga, the right page comes first
                    <>
                      {/* Right page (current page) */}
                      <img
                        src={manga.source_id === "local" ? convertFileSrc(pages.base_url + "/" + getCurrentPage()) : pages.base_url + "/" + getCurrentPage()}
                        alt={`Page ${currentPageIndex + 1}`}
                        className="max-h-[calc(100vh-40px)] object-contain"
                      />

                      {/* Left page (next page) if available */}
                      {currentPageIndex < pages.pages.length - 1 && (
                        <img
                          src={manga.source_id === "local" ?
                            convertFileSrc(pages.base_url + "/" + pages.pages[currentPageIndex + 1]) :
                            pages.base_url + "/" + pages.pages[currentPageIndex + 1]}
                          alt={`Page ${currentPageIndex + 2}`}
                          className="max-h-[calc(100vh-40px)] object-contain"
                        />
                      )}
                    </>
                  ) : (
                    // For left-to-right manga, the left page comes first
                    <>
                      {/* Left page (previous page) if available and not the first page */}
                      {currentPageIndex > 0 && currentPageIndex % 2 === 1 && (
                        <img
                          src={manga.source_id === "local" ?
                            convertFileSrc(pages.base_url + "/" + pages.pages[currentPageIndex - 1]) :
                            pages.base_url + "/" + pages.pages[currentPageIndex - 1]}
                          alt={`Page ${currentPageIndex}`}
                          className="max-h-[calc(100vh-40px)] object-contain"
                        />
                      )}

                      {/* Right page (current page) */}
                      <img
                        src={manga.source_id === "local" ?
                          convertFileSrc(pages.base_url + "/" + getCurrentPage()) :
                          pages.base_url + "/" + getCurrentPage()}
                        alt={`Page ${currentPageIndex + 1}`}
                        className="max-h-[calc(100vh-40px)] object-contain"
                      />
                    </>
                  )}
                </div>
              ) : (
                // Single page view
                <img
                  src={manga.source_id === "local" ?
                    convertFileSrc(pages.base_url + "/" + getCurrentPage()) :
                    pages.base_url + "/" + getCurrentPage()}
                  alt={`Page ${currentPageIndex + 1}`}
                  className="max-h-full max-w-full object-contain"
                  style={{transform: `scale(${readerZoom})`, transition: 'transform 0.2s ease'}}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tap Zones */}
      {readingMode !== "webtoon" && (
        <>
          <div
            className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleTapZone('left');
            }}
          />
          <div
            className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation();
              handleTapZone('right');
            }}
          />
        </>
      )}

      <div className="absolute top-0 left-0 right-0 z-20 group">
        {/* Invisible hover area - larger than the visible bar for easier interaction */}
        <div className="w-full h-16 absolute top-0 bg-transparent"/>

        {/* Actual control bar - only visible on hover */}
        <div className={cn(
          "w-full bg-background/50 backdrop-blur-sm p-4 flex justify-between items-center transition-opacity duration-300",
          showSettings || showHelp ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleReaderClose}
              size={"icon"}
              variant={"ghost"}
              className="rounded-full p-2"
            >
              <X strokeWidth={1.5} className="!w-5 !h-5"/>
            </Button>

            <div className="text-sm px-3 py-1 text-foreground">
              {readingMode === "webtoon"
                ? `${chapterTitle || chapter?.title || "Chapter"}`
                : `${currentPageIndex + 1} / ${pages.pages.length} ${chapterTitle || chapter?.title ? `• ${chapterTitle || chapter?.title}` : ""}`
              }
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowHelp(true)}
              size={"icon"}
              variant={"ghost"}
              className={"rounded-full p-2 text-foreground"}
            >
              <HelpCircle strokeWidth={1.5} className={"!w-5 !h-5"}/>
            </Button>
            <Button
              onClick={() => setShowSettings(prev => !prev)}
              size={"icon"}
              variant="ghost"
              className={"rounded-full p-2 text-foreground"}
            >
              <Settings strokeWidth={1.5} className={"!w-5 !h-5"}/>
            </Button>
          </div>
        </div>
      </div>



      {/* Settings Panel */}
      {showSettings && (
        <SettingsOverlay handleClose={() => setShowSettings(false)}/>
      )}

      {/* Help Overlay */}
      {showHelp && (
        <HelpOverlay handleClose={() => setShowHelp(false)} readingMode={readingMode}/>
      )}
    </div>
  );
};

export default MangaReader;