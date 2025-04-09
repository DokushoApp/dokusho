import React from 'react';
import { X, BookOpen, Columns } from 'lucide-react';
import { useAtom } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { settingsAtom, saveSettingsAtom } from '@/store/settings';
import { cn } from '@/lib/utils';

// Reading mode atoms from settings
const readingModeAtom = focusAtom(settingsAtom, optic => optic.prop("reading_mode"));
const readingPageLayoutAtom = focusAtom(settingsAtom, optic => optic.prop("reading_page_layout"));
const readerZoomAtom = focusAtom(settingsAtom, optic => optic.prop("reader_zoom"));

const ReaderCustomization = ({ onClose, showBackdrop = true, onZoomChange, currentZoom = 1 }) => {
  const [readingMode, setReadingMode] = useAtom(readingModeAtom);
  const [pageLayout, setPageLayout] = useAtom(readingPageLayoutAtom);
  const [defaultZoom, setDefaultZoom] = useAtom(readerZoomAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  // Handle reading mode change
  const handleReadingModeChange = (mode) => {
    setReadingMode(mode);
    saveSettings();
  };

  // Handle page layout change
  const handlePageLayoutChange = (layout) => {
    setPageLayout(layout);
    saveSettings();
  };

  // Update zoom
  const handleZoomChange = (zoom) => {
    if (onZoomChange) {
      onZoomChange(zoom);
    }
  };

  return (
    <>
      {showBackdrop && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      <div className="fixed top-20 right-6 bg-neutral-800 rounded-lg shadow-lg z-50 w-72 overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b border-neutral-700">
          <h3 className="font-medium text-white">Reader Settings</h3>
          <button
            onClick={onClose}
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
                onClick={() => handleReadingModeChange('left-to-right')}
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
                onClick={() => handleReadingModeChange('right-to-left')}
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
                onClick={() => handleReadingModeChange('webtoon')}
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
          {readingMode !== 'webtoon' && (
            <div className="space-y-2">
              <label className="block text-sm text-neutral-300">Page Layout</label>
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handlePageLayoutChange('single')}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1",
                    pageLayout === 'single'
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  <BookOpen size={14} />
                  Single Page
                </button>
                <button
                  onClick={() => handlePageLayoutChange('double')}
                  className={cn(
                    "px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1",
                    pageLayout === 'double'
                      ? "bg-blue-600 text-white"
                      : "bg-neutral-700 text-neutral-300 hover:bg-neutral-600"
                  )}
                >
                  <Columns size={14} />
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
                onClick={() => handleZoomChange(Math.max(currentZoom - 0.1, 0.5))}
                className="w-8 h-8 flex items-center justify-center rounded bg-neutral-700 text-white hover:bg-neutral-600"
              >
                -
              </button>
              <div className="flex-1 bg-neutral-700 rounded-md h-1 relative">
                <div
                  className="absolute top-0 left-0 h-1 bg-blue-600 rounded-md"
                  style={{ width: `${Math.min(Math.max((currentZoom - 0.5) / 1.5, 0), 1) * 100}%` }}
                />
              </div>
              <button
                onClick={() => handleZoomChange(Math.min(currentZoom + 0.1, 2))}
                className="w-8 h-8 flex items-center justify-center rounded bg-neutral-700 text-white hover:bg-neutral-600"
              >
                +
              </button>
              <span className="text-white text-xs w-12 text-center">
                {Math.round(currentZoom * 100)}%
              </span>
            </div>
            <button
              onClick={() => handleZoomChange(1)}
              className="text-xs px-2 py-1 bg-neutral-700 hover:bg-neutral-600 rounded text-neutral-300"
            >
              Reset Zoom
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReaderCustomization;