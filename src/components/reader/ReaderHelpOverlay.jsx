import React from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Component that shows a help overlay with tap zones for the manga reader
 */
const ReaderHelpOverlay = ({ readingMode, isWebtoonMode, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2"
      >
        <X size={24} />
      </button>

      <h2 className="text-white text-2xl font-bold mb-8">Reader Controls</h2>

      {isWebtoonMode ? (
        // Webtoon mode controls
        <div className="w-full max-w-md px-4">
          <div className="relative h-80 border-2 border-white/30 rounded-lg overflow-hidden">
            {/* Scroll indicator */}
            <div className="absolute inset-x-0 top-0 h-1/3 flex items-center justify-center">
              <div className="bg-blue-500/30 w-full h-full flex items-center justify-center">
                <span className="text-white font-semibold">Scroll to read</span>
              </div>
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 right-4 p-2 rounded-full">
              <ZoomIn className="text-white" size={24} />
            </div>
          </div>

          <div className="mt-6 text-white text-center">
            <p>In Webtoon mode, simply scroll to read.<br/>Use pinch gestures or +/- keys to zoom.</p>
          </div>
        </div>
      ) : (
        // Page-based mode controls
        <div className="w-full max-w-md px-4">
          <div className="relative h-80 border-2 rounded-lg overflow-hidden">
            {/* Left tap zone */}
            <div
              className={cn(
                "absolute top-0 bottom-0 left-0 w-1/3 flex items-center justify-center"
              )}
            >
              <div className="p-2 rounded-full">
                <ChevronLeft className="text-white" size={24} />
              </div>
              <span className="absolute bottom-2 text-xs font-semibold">
                {readingMode === 'right-to-left' ? 'Next' : 'Previous'}
              </span>
            </div>

            {/* Center tap zone */}
            <div className="absolute top-0 bottom-0 left-1/3 w-1/3 flex items-center justify-center bg-green-500/20">
              <span className="text-white font-semibold">Menu</span>
            </div>

            {/* Right tap zone */}
            <div
              className={cn(
                "absolute top-0 bottom-0 right-0 w-1/3 flex items-center justify-center",
                "bg-blue-500/20"
              )}
            >
              <div className="bg-black/40 p-2 rounded-full">
                <ChevronRight className="text-white" size={24} />
              </div>
              <span className="absolute bottom-2 text-white text-xs font-semibold">
                {readingMode === 'right-to-left' ? 'Previous' : 'Next'}
              </span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p>Tap the left or right side to navigate pages.<br/>Tap the center to show/hide controls.</p>
            <p className="mt-2">Current mode: <span className="font-bold">{readingMode === 'right-to-left' ? 'Right to Left' : 'Left to Right'}</span></p>
          </div>
        </div>
      )}

      <div className="mt-8 text-center max-w-md px-4">
        <h3 className="font-semibold mb-2">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-left">
            <p>→/← keys: Navigate pages</p>
            <p>Space: Next page</p>
          </div>
          <div className="text-left">
            <p>+/- keys: Zoom in/out</p>
            <p>D: Toggle double page</p>
          </div>
        </div>
      </div>

      <button
        onClick={onClose}
        className="mt-8 py-2 px-6 rounded-md font-medium"
      >
        Got it
      </button>
    </div>
  );
};

export default ReaderHelpOverlay;