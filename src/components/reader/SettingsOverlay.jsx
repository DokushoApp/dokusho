import React from "react";
import {useAtom} from "jotai";
import {focusAtom} from "jotai-optics";
import {RotateCcw, X, Minus, Plus} from 'lucide-react';
import {
  readerPageLayoutAtom,
  readerZoomAtom,
  readingModeAtom,
  saveSettingsAtom,
  settingsAtom
} from "@/store/settings.js";
import {cn} from "@/lib/utils.js";
import {Button} from "@/components/ui/button.jsx";

const SettingsOverlay = ({handleClose}) => {
  const [readingMode, setReadingMode] = useAtom(readingModeAtom);
  const [readerPageLayout, setReaderPageLayout] = useAtom(readerPageLayoutAtom);
  const [readerZoom, setReaderZoom] = useAtom(readerZoomAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  return (
    <div className="fixed top-20 right-6 bg-card rounded-lg shadow-lg z-50 w-72 overflow-hidden border border-border">
      <div className="flex items-center justify-between p-3 border-b border-border">
        <h3 className="font-medium text-card-foreground">Reader Settings</h3>
        <button
          onClick={handleClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X size={18} strokeWidth={1.5}/>
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm text-muted-foreground">Reading Mode</label>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={() => handleValueChange(setReadingMode, 'left-to-right')}
              className={cn(
                "px-2 py-1.5 text-xs rounded",
                readingMode === 'left-to-right'
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Left to Right
            </button>
            <button
              onClick={() => handleValueChange(setReadingMode, 'right-to-left')}
              className={cn(
                "px-2 py-1.5 text-xs rounded",
                readingMode === 'right-to-left'
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Right to Left
            </button>
            <button
              onClick={() => handleValueChange(setReadingMode, 'webtoon')}
              className={cn(
                "px-2 py-1.5 text-xs rounded",
                readingMode === 'webtoon'
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              Webtoon
            </button>
          </div>
        </div>

        {readingMode !== "webtoon" && (
          <div className="space-y-2">
            <label className="block text-sm text-muted-foreground">Page Layout</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleValueChange(setReaderPageLayout, 'single')}
                className={cn(
                  "px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1",
                  readerPageLayout === 'single'
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                Single Page
              </button>
              <button
                onClick={() => handleValueChange(setReaderPageLayout, 'double')}
                className={cn(
                  "px-2 py-1.5 text-xs rounded flex items-center justify-center gap-1",
                  readerPageLayout === 'double'
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                Double Page
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="flex flex-row gap-x-2 text-sm text-muted-foreground">
            <span>Zoom</span>
            <span className="text-foreground text-xs w-12 text-center">
                  {Math.round(readerZoom * 100)}%
                </span></label>
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleValueChange(setReaderZoom, Math.max(readerZoom - 0.1, 0.5))}
              size={"icon"}
              variant="outline"
            >
              <Minus/>
            </Button>
            <div className="flex-1 bg-muted rounded-md h-1 relative">
              <div
                className="absolute top-0 left-0 h-1 bg-primary rounded-md"
                style={{width: `${Math.min(Math.max((readerZoom - 0.5) / 1.5, 0), 1) * 100}%`}}
              />
            </div>
            <Button
              onClick={() => handleValueChange(setReaderZoom, Math.min(readerZoom + 0.1, 2))}
              size={"icon"}
              variant="outline"
            >
              <Plus/>
            </Button>
            <Button
              onClick={() => handleValueChange(setReaderZoom, 1.0)}
              size={"icon"}
              variant="outline"
            >
              <RotateCcw/>
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}
export default SettingsOverlay