import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
const readingModeAtom = focusAtom(settingsAtom, optic => optic.prop("reading_mode"));
const readingPageLayoutAtom = focusAtom(settingsAtom, optic => optic.prop("reading_page_layout"));
const readerZoomAtom = focusAtom(settingsAtom, optic => optic.prop("reader_zoom"));
const readerPaddingAtom = focusAtom(settingsAtom, optic => optic.prop("reader_padding"));

const ReaderSettings = () => {
  const [readingMode, setReadingMode] = useAtom(readingModeAtom);
  const [readingLayout, setReadingLayout] = useAtom(readingPageLayoutAtom);
  const [readerZoom, setReaderZoom] = useAtom(readerZoomAtom);
  const [readerPadding, setReaderPadding] = useAtom(readerPaddingAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-left mb-4">
        Configure your reading experience
      </p>

      <div className="flex items-center">
        <Label htmlFor="readingMode" className="w-48">Reading Mode</Label>
        <div className="w-64">
          <Select
            value={readingMode}
            onValueChange={(value) => handleValueChange(setReadingMode, value)}
          >
            <SelectTrigger id="readingMode">
              <SelectValue placeholder="Select reading mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="left-to-right">Left to Right</SelectItem>
              <SelectItem value="right-to-left">Right to Left</SelectItem>
              <SelectItem value="vertical">Vertical</SelectItem>
              <SelectItem value="webtoon">Webtoon</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center">
        <Label htmlFor="readingLayout" className="w-48">Reading Page Layout</Label>
        <div className="w-64">
          <Select
            value={readingLayout}
            onValueChange={(value) => handleValueChange(setReadingLayout, value)}
          >
            <SelectTrigger id="readingLayout">
              <SelectValue placeholder="Select page layout" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single Page</SelectItem>
              <SelectItem value="double">Double Page</SelectItem>
              <SelectItem value="continuous">Continuous</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center">
        <Label htmlFor="readerZoom" className="w-48">Reader Zoom</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="readerZoom"
            className="w-48"
            min={50}
            max={200}
            step={10}
            value={[readerZoom]}
            onValueChange={(value) => handleValueChange(setReaderZoom, value[0])}
          />
          <span className="text-sm text-muted-foreground w-16">
            {readerZoom}%
          </span>
        </div>
      </div>

      <div className="flex items-center">
        <Label htmlFor="readerPadding" className="w-48">Reader Padding</Label>
        <div className="flex items-center gap-4">
          <Slider
            id="readerPadding"
            className="w-48"
            min={0}
            max={50}
            step={5}
            value={[readerPadding]}
            onValueChange={(value) => handleValueChange(setReaderPadding, value[0])}
          />
          <span className="text-sm text-muted-foreground w-16">
            {readerPadding}px
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReaderSettings;