import React, { useState, useRef, useEffect } from 'react';
import { X, Settings, HelpCircle } from 'lucide-react';
import { atom, useAtom } from 'jotai';
import { cn } from '@/lib/utils';

// Define the reader settings atom
export const readerSettingsAtom = atom({
  readingMode: 'left-to-right', // 'left-to-right', 'right-to-left', 'webtoon'
  pageLayout: 'single', // 'single', 'double'
  zoom: 1.0,
  autoHideControls: true
});

const MangaReader = ({
                         pages = [],
                         onClose,
                         initialPage = 0,
                         chapterTitle = ""
                       }) => {
  // State from Jotai store
  const [settings, setSettings] = useAtom(readerSettingsAtom);

  // Local state that doesn't need to persist
  const [currentPageIndex, setCurrentPageIndex] = useState(initialPage);
  const [showControls, setShowControls] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // References
  const containerRef = useRef(null);
  const webtoonRef = useRef(null);
  const inactivityTimer = useRef(null);

  // Shortcuts for current settings
  const { readingMode, pageLayout, zoom } = settings;
  const isWebtoonMode = readingMode === 'webtoon';
  const isDoublePage = !isWebtoonMode && pageLayout === 'double';

  // Reset inactivity timer to hide controls
  const resetInactivityTimer = () => {
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }

    if (settings.autoHideControls) {
      inactivityTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  // Setup inactivity timer
  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [settings.autoHideControls]);

  // Mouse movement to show controls
  useEffect(() => {
    const handleMouseMove = () => {
      setShowControls(true);
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Keyboard shortcuts
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
            webtoonRef.current.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' });
          }
        } else if (e.key === 'ArrowUp') {
          if (webtoonRef.current) {
            webtoonRef.current.scrollBy({ top: -window.innerHeight * 0.8, behavior: 'smooth' });
          }
        }
      }

      // Zoom controls
      if (e.key === '+' || e.key === '=') {
        setSettings({...settings, zoom: Math.min(settings.zoom + 0.1, 2)});
      } else if (e.key === '-') {
        setSettings({...settings, zoom: Math.max(settings.zoom - 0.1, 0.5)});
      } else if (e.key === '0') {
        setSettings({...settings, zoom: 1.0});
      }

      // Toggle page layout with 'd' key
      if (e.key.toLowerCase() === 'd' && !isWebtoonMode) {
        setSettings({
          ...settings,
          pageLayout: settings.pageLayout === 'single' ? 'double' : 'single'
        });
      }

      // Toggle help overlay with 'h' key
      if (e.key.toLowerCase() === 'h') {
        setShowHelp(prev => !prev);
      }

      // Toggle settings with 's' key
      if (e.key.toLowerCase() === 's') {
        setShowSettings(prev => !prev);
      }

      // Show controls when any key is pressed
      setShowControls(true);
      resetInactivityTimer();

      // Close reader with Escape key
      if (e.key === 'Escape' && !showSettings && !showHelp) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [readingMode, isWebtoonMode, pages.length, currentPageIndex, settings]);

  // Navigation functions
  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      if (isDoublePage && readingMode === 'left-to-right' && currentPageIndex % 2 === 0) {
        // In double page mode with left-to-right, advance by 2 pages when on an even page
        setCurrentPageIndex(Math.min(currentPageIndex + 2, pages.length - 1));
      } else if (isDoublePage && readingMode === 'right-to-left') {
        // In double page mode with right-to-left, advance by 2 pages
        setCurrentPageIndex(Math.min(currentPageIndex + 2, pages.length - 1));
      } else {
        // Default single page advance
        setCurrentPageIndex(currentPageIndex + 1);
      }
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      if (isDoublePage && readingMode === 'left-to-right' && currentPageIndex % 2 === 1) {
        // In double page mode with left-to-right, go back by 2 pages when on an odd page
        setCurrentPageIndex(Math.max(currentPageIndex - 2, 0));
      } else if (isDoublePage && readingMode === 'right-to-left') {
        // In double page mode with right-to-left, go back by 2 pages
        setCurrentPageIndex(Math.max(currentPageIndex - 2, 0));
      } else {
        // Default single page back
        setCurrentPageIndex(currentPageIndex - 1);
      }
    }
  };

  // Handle tap zones
  const handleTapZone = (zone) => {
    if (zone === 'center') {
      setShowControls(prev => !prev);
      return;
    }

    if (isWebtoonMode) return; // No navigation in webtoon mode

    if (readingMode === 'left-to-right') {
      if (zone === 'right') nextPage();
      else if (zone === 'left') prevPage();
    } else {
      if (zone === 'left') nextPage();
      else if (zone === 'right') prevPage();
    }
  };

  // Safe close handler
  const handleClose = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  // Get current page
  const getCurrentPage = () => {
    if (pages.length === 0) return null;
    return pages[currentPageIndex];
  };

  // Calculate reader styles
  const getReaderStyles = () => {
    if (isWebtoonMode) {
      return {
        container: "h-full w-full overflow-auto",
        imageContainer: "flex flex-col items-center px-4",
        image: "w-auto max-w-full object-contain"
      };
    } else {
      return {
        container: "h-full w-full flex justify-center items-center overflow-hidden",
        imageContainer: "relative h-full w-full flex justify-center items-center",
        image: "max-h-full max-w-full object-contain"
      };
    }
  };

  const styles = getReaderStyles();

  // Empty state
  if (pages.length === 0) {
    return (
      <div className="h-full w-full flex justify-center items-center bg-neutral-900 text-white">
        <div className="text-center">
          <p>No pages to display</p>
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-neutral-700 rounded hover:bg-neutral-600"
          >
            Return to Library
          </button>
        </div>
      </div>
    );
  }

  // Update reading mode
  const changeReadingMode = (mode) => {
    setSettings({...settings, readingMode: mode});
  };

  // Update page layout
  const changePageLayout = (layout) => {
    setSettings({...settings, pageLayout: layout});
  };

  // Update zoom
  const changeZoom = (newZoom) => {
    setSettings({...settings, zoom: newZoom});
  };

  return (
    <div
      className="h-full w-full relative"
      ref={containerRef}
    >
      {/* Reader Content */}
      <div className="h-full w-full" onClick={() => handleTapZone('center')}>
        {/* Webtoon Mode */}
        {isWebtoonMode ? (
          <div
            ref={webtoonRef}
            className={styles.container}
          >
            <div
              className={styles.imageContainer}
              style={{
                maxWidth: '900px',
                margin: '0 auto',
                width: `${Math.min(100 / zoom, 100)}%`
              }}
            >
              {pages.map((page, index) => (
                <img
                  key={index}
                  src={page.src || page}
                  alt={`Page ${index + 1}`}
                  className={styles.image}
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        ) : (
          /* Paged Mode (Left-to-Right or Right-to-Left) */
          <div className={styles.container}>
            <div className={styles.imageContainer}>
              {isDoublePage ? (
                // Double page view
                <div
                  className="flex justify-center items-center"
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }}
                >
                  {/* Handle double page layout - show two pages side by side */}
                  {readingMode === 'right-to-left' ? (
                    // For right-to-left manga, the right page comes first
                    <>
                      {/* Right page (current page) */}
                      <img
                        src={getCurrentPage()?.src || getCurrentPage()}
                        alt={`Page ${currentPageIndex + 1}`}
                        className="max-h-[calc(100vh-40px)] object-contain"
                      />

                      {/* Left page (next page) if available */}
                      {currentPageIndex < pages.length - 1 && (
                        <img
                          src={pages[currentPageIndex + 1]?.src || pages[currentPageIndex + 1]}
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
                          src={pages[currentPageIndex - 1]?.src || pages[currentPageIndex - 1]}
                          alt={`Page ${currentPageIndex}`}
                          className="max-h-[calc(100vh-40px)] object-contain"
                        />
                      )}

                      {/* Right page (current page) */}
                      <img
                        src={getCurrentPage()?.src || getCurrentPage()}
                        alt={`Page ${currentPageIndex + 1}`}
                        className="max-h-[calc(100vh-40px)] object-contain"
                      />
                    </>
                  )}
                </div>
              ) : (
                // Single page view
                <img
                  src={getCurrentPage()?.src || getCurrentPage()}
                  alt={`Page ${currentPageIndex + 1}`}
                  className={styles.image}
                  style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s ease' }}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tap Zones */}
      {!isWebtoonMode && (
        <>
          <div
            className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10"
            onClick={(e) => { e.stopPropagation(); handleTapZone('left'); }}
          />
          <div
            className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10"
            onClick={(e) => { e.stopPropagation(); handleTapZone('right'); }}
          />
        </>
      )}

      {/* Controls */}
      <div className={cn(
        "absolute top-0 left-0 right-0 p-4 flex justify-between items-center transition-opacity duration-300 z-20",
        showControls ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <button
          onClick={handleClose}
          className="rounded-full p-2 bg-black/50 hover:bg-black/70 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-sm bg-black/50 px-3 py-1 rounded-full">
          {isWebtoonMode
            ? `${chapterTitle || "Chapter"}`
            : `${currentPageIndex + 1} / ${pages.length} ${chapterTitle ? `• ${chapterTitle}` : ""}`
          }
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHelp(true)}
            className="rounded-full p-2 bg-black/50 hover:bg-black/70 transition-colors"
          >
            <HelpCircle size={20} />
          </button>
          <button
            onClick={() => setShowSettings(prev => !prev)}
            className={cn(
              "rounded-full p-2 transition-colors",
              showSettings ? "bg-white/30 text-white" : "bg-black/50 hover:bg-black/70"
            )}
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && showControls && (
        <div className="fixed top-20 right-6 bg-neutral-800 rounded-lg shadow-lg z-50 w-72 overflow-hidden">
          <div className="flex items-center justify-between p-3 border-b border-neutral-700">
            <h3 className="font-medium text-white">Reader Settings</h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-4 space-y-4">
            {/* Reading Mode */}
            <div className="space-y-2">
              <label className="block text-sm text-neutral-300">Reading Mode</label>
              <div className="grid grid-cols-3 gap-1">
                <button
                  onClick={() => changeReadingMode('left-to-right')}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded",
                    readingMode === 'left-to-right'
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  Left to Right
                </button>
                <button
                  onClick={() => changeReadingMode('right-to-left')}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded",
                    readingMode === 'right-to-left'
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  Right to Left
                </button>
                <button
                  onClick={() => changeReadingMode('webtoon')}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded",
                    readingMode === 'webtoon'
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  Webtoon
                </button>
              </div>
            </div>

            {/* Page Layout - only show when not in webtoon mode */}
            {!isWebtoonMode && (
              <div className="space-y-2">
                <label className="block text-sm text-neutral-300">Page Layout</label>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => changePageLayout('single')}
                    className={cn(
                      "px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1",
                      pageLayout === 'single'
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                    )}
                  >
                    Single Page
                  </button>
                  <button
                    onClick={() => changePageLayout('double')}
                    className={cn(
                      "px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1",
                      pageLayout === 'double'
                        ? "bg-blue-600 text-white"
                        : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                    )}
                  >
                    Double Page
                  </button>
                </div>
              </div>
            )}

            {/* Zoom */}
            <div className="space-y-2">
              <label className="block text-sm text-neutral-300">Zoom</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => changeZoom(Math.max(zoom - 0.1, 0.5))}
                  className="w-8 h-8 flex items-center justify-center rounded bg-neutral-700 text-white hover:bg-neutral-600"
                >
                  -
                </button>
                <div className="flex-1 bg-neutral-700 rounded-md h-1 relative">
                  <div
                    className="absolute top-0 left-0 h-1 bg-blue-600 rounded-md"
                    style={{ width: `${Math.min(Math.max((zoom - 0.5) / 1.5, 0), 1) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => changeZoom(Math.min(zoom + 0.1, 2))}
                  className="w-8 h-8 flex items-center justify-center rounded bg-neutral-700 text-white hover:bg-neutral-600"
                >
                  +
                </button>
                <span className="text-white text-xs w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
              </div>
              <button
                onClick={() => changeZoom(1.0)}
                className="text-xs px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
              >
                Reset Zoom
              </button>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="mt-4 border-t border-neutral-700 pt-4">
              <p className="text-xs text-neutral-400 mb-2">Keyboard Shortcuts</p>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-neutral-300">
                <p>← → keys: Navigate</p>
                <p>Space: Next page</p>
                <p>+/- keys: Zoom</p>
                <p>0: Reset zoom</p>
                <p>D: Toggle double page</p>
                <p>H: Show help</p>
                <p>Esc: Close reader</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Help Overlay */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <button
            onClick={() => setShowHelp(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
          >
            <X size={24} />
          </button>

          <h2 className="text-white text-2xl font-bold mb-8">Reader Controls</h2>

          {isWebtoonMode ? (
            // Webtoon mode controls
            <div className="w-full max-w-md px-4">
              <div className="relative h-80 border-2 border-white/30 rounded-lg overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1/3 flex items-center justify-center">
                  <div className="bg-blue-500/30 w-full h-full flex items-center justify-center">
                    <span className="text-white font-semibold">Scroll to read</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-white text-center">
                <p>In Webtoon mode, simply scroll to read.<br/>Use pinch gestures or +/- keys to zoom.</p>
              </div>
            </div>
          ) : (
            // Page-based mode controls
            <div className="w-full max-w-md px-4">
              <div className="relative h-80 border-2 border-white/30 rounded-lg overflow-hidden">
                {/* Left tap zone */}
                <div className="absolute top-0 bottom-0 left-0 w-1/3 flex items-center justify-center bg-red-500/20">
                  <span className="text-white font-semibold">
                    {readingMode === 'right-to-left' ? 'Next' : 'Previous'}
                  </span>
                </div>

                {/* Center tap zone */}
                <div className="absolute top-0 bottom-0 left-1/3 w-1/3 flex items-center justify-center bg-green-500/20">
                  <span className="text-white font-semibold">Menu</span>
                </div>

                {/* Right tap zone */}
                <div className="absolute top-0 bottom-0 right-0 w-1/3 flex items-center justify-center bg-blue-500/20">
                  <span className="text-white font-semibold">
                    {readingMode === 'right-to-left' ? 'Previous' : 'Next'}
                  </span>
                </div>
              </div>

              <div className="mt-6 text-white text-center">
                <p>Tap the left or right side to navigate pages.<br/>Tap the center to show/hide controls.</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowHelp(false)}
            className="mt-8 bg-white text-black py-2 px-6 rounded-md hover:bg-gray-200 font-medium"
          >
            Got it
          </button>
        </div>
      )}
    </div>
  );
};

export default MangaReader;