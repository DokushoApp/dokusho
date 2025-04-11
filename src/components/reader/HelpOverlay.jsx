import {X} from "lucide-react";
import React from "react";

const HelpOverlay = ({readingMode, handleClose}) => {
  return (
    <div className="fixed inset-0 bg-background/70 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 text-foreground hover:text-muted-foreground p-2"
      >
        <X size={24}/>
      </button>

      <h2 className="text-foreground text-2xl font-bold mb-8">Reader Controls</h2>

      {readingMode === "webtoon" ? (
        // Webtoon mode controls
        <div className="w-full max-w-md px-4">
          <div className="relative h-80 border-2 border-border rounded-lg overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1/3 flex items-center justify-center">
              <div className="bg-primary/30 w-full h-full flex items-center justify-center">
                <span className="text-foreground font-semibold">Scroll to read</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-foreground text-center">
            <p>In Webtoon mode, simply scroll to read.<br/>Use pinch gestures or +/- keys to zoom.</p>
          </div>
        </div>
      ) : (
        // Page-based mode controls
        <div className="w-full max-w-md px-4">
          <div className="relative h-80 border-2 border-border rounded-lg overflow-hidden">
            {/* Left tap zone */}
            <div className="absolute top-0 bottom-0 left-0 w-1/3 flex items-center justify-center bg-destructive/20">
                  <span className="text-foreground font-semibold">
                    {readingMode === 'right-to-left' ? 'Next' : 'Previous'}
                  </span>
            </div>

            {/* Center tap zone */}
            <div className="absolute top-0 bottom-0 left-1/3 w-1/3 flex items-center justify-center bg-accent/20">
              <span className="text-foreground font-semibold">Menu</span>
            </div>

            {/* Right tap zone */}
            <div className="absolute top-0 bottom-0 right-0 w-1/3 flex items-center justify-center bg-primary/20">
                  <span className="text-foreground font-semibold">
                    {readingMode === 'right-to-left' ? 'Previous' : 'Next'}
                  </span>
            </div>
          </div>

          <div className="mt-6 text-foreground text-center">
            <p>Tap the left or right side to navigate pages.<br/>Tap the center to show/hide controls.</p>
          </div>
          <div className="flex flex-col items-center mt-6 border-t border-border pt-4">
            <p className="text-xs text-muted-foreground mb-2">Keyboard Shortcuts</p>
            <div className="grid grid-cols-2 gap-x-15 gap-y-2 text-xs text-foreground">
              <p>← → keys: Navigate</p>
              <p>Space: Next page</p>
              <p>+/- keys: Zoom</p>
              <p>0: Reset zoom</p>
              <p>H: Show help</p>
              <p>Esc: Close reader</p>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleClose}
        className="mt-8 bg-primary text-primary-foreground py-2 px-6 rounded-md hover:bg-primary/90 font-medium"
      >
        Got it
      </button>
    </div>
  )
}

export default HelpOverlay;