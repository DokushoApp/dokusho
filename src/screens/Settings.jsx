import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Menubar from "@/components/ui/menubar";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom, resetSettingsAtom } from "@/store/settings";
import ThemeSelector from "@/components/library/ThemeSelector.jsx";

// Settings Jotai Atoms using focusAtom for precise targeting
const defaultCategoryTabAtom = focusAtom(settingsAtom, optic => optic.prop("default_category_tab"));
const mangaCardGridAtom = focusAtom(settingsAtom, optic => optic.prop("manga_card_grid"));
const mangaCardSizeAtom = focusAtom(settingsAtom, optic => optic.prop("manga_card_size"));
const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
const defaultCategoryAtom = focusAtom(settingsAtom, optic => optic.prop("default_category"));
const readingModeAtom = focusAtom(settingsAtom, optic => optic.prop("reading_mode"));
const readingPageLayoutAtom = focusAtom(settingsAtom, optic => optic.prop("reading_page_layout"));
const readerZoomAtom = focusAtom(settingsAtom, optic => optic.prop("reader_zoom"));
const readerPaddingAtom = focusAtom(settingsAtom, optic => optic.prop("reader_padding"));
const showNsfwAtom = focusAtom(settingsAtom, optic => optic.prop("show_nsfw"));

const SettingsScreen = () => {
  // Get individual atoms for each setting
  const [defaultCategoryTab, setDefaultCategoryTab] = useAtom(defaultCategoryTabAtom);
  const [mangaCardGrid, setMangaCardGrid] = useAtom(mangaCardGridAtom);
  const [mangaCardSize, setMangaCardSize] = useAtom(mangaCardSizeAtom);
  const [categories] = useAtom(categoriesAtom); // Read-only for now
  const [defaultCategory, setDefaultCategory] = useAtom(defaultCategoryAtom);
  const [readingMode, setReadingMode] = useAtom(readingModeAtom);
  const [readingLayout, setReadingLayout] = useAtom(readingPageLayoutAtom);
  const [readerZoom, setReaderZoom] = useAtom(readerZoomAtom);
  const [readerPadding, setReaderPadding] = useAtom(readerPaddingAtom);
  const [showNSFW, setShowNSFW] = useAtom(showNsfwAtom);

  // Get save & reset actions
  const [, saveSettings] = useAtom(saveSettingsAtom);
  const [, resetSettings] = useAtom(resetSettingsAtom);

  // Active settings tab
  const [activeTab, setActiveTab] = React.useState("general");

  // Settings tabs for the MenuBar
  const settingsTabs = [
    { id: "general", name: "General" },
    { id: "library", name: "Library" },
    { id: "reader", name: "Reader" },
    { id: "extension", name: "Extension" },
    { id: "about", name: "About" }
  ];

  // Auto-save handler for form elements
  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col">
        <Menubar
          menuItems={settingsTabs}
          initialItem={activeTab}
          onItemSelect={setActiveTab}
          allowAddItem={false}
        />

        <div className="py-6">
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-left mb-4">
                Configure the appearance and behavior of the app
              </p>

              {/* Theme - Using the dedicated component */}
              <ThemeSelector />

              {/* Default Category Tab */}
              <div className="flex items-center">
                <Label htmlFor="defaultCategoryTab" className="w-48">Default Category Tab</Label>
                <div className="w-64">
                  <Select
                    value={defaultCategoryTab}
                    onValueChange={(value) => handleValueChange(setDefaultCategoryTab, value)}
                  >
                    <SelectTrigger id="defaultCategoryTab">
                      <SelectValue placeholder="Select default category tab" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Manga Card Grid */}
              <div className="flex items-center">
                <Label htmlFor="mangaCardGrid" className="w-48">Manga Card Grid</Label>
                <div className="flex items-center gap-4">
                  <Select
                    value={mangaCardGrid.toString()}
                    onValueChange={(value) => handleValueChange(setMangaCardGrid, parseInt(value, 10))}
                    className="w-64"
                  >
                    <SelectTrigger id="mangaCardGrid">
                      <SelectValue placeholder="Select grid columns" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                      <SelectItem value="6">6 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                  <span className="text-sm text-muted-foreground w-24">
                    {mangaCardGrid} columns
                  </span>
                </div>
              </div>

              {/* Manga Card Size */}
              <div className="flex items-center">
                <Label htmlFor="cardSize" className="w-48">Manga Card Size</Label>
                <div className="flex items-center gap-4">
                  <Select
                    value={mangaCardSize}
                    onValueChange={(value) => handleValueChange(setMangaCardSize, value)}
                    className="w-64"
                  >
                    <SelectTrigger id="cardSize">
                      <SelectValue placeholder="Select card size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Library Settings */}
          {activeTab === "library" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-left mb-4">
                Configure how your manga library is organized
              </p>

              {/* Edit Categories */}
              <div className="flex items-center">
                <Label className="w-48">Edit Categories</Label>
                <div>
                  <Button variant="outline" size="sm" className="gap-1">
                    Manage
                  </Button>
                </div>
              </div>

              {/* Default Category */}
              <div className="flex items-center">
                <Label htmlFor="defaultCategory" className="w-48">Default Category</Label>
                <div className="w-64">
                  <Select
                    value={defaultCategory}
                    onValueChange={(value) => handleValueChange(setDefaultCategory, value)}
                  >
                    <SelectTrigger id="defaultCategory">
                      <SelectValue placeholder="Select default category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Reader Settings */}
          {activeTab === "reader" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-left mb-4">
                Configure your reading experience
              </p>

              {/* Reading Mode */}
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

              {/* Reading Page Layout */}
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

              {/* Reader Zoom */}
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

              {/* Reader Padding */}
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
          )}

          {/* Extension Settings */}
          {activeTab === "extension" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-left mb-4">
                Configure extension sources and filters
              </p>

              {/* Extension Repository */}
              <div className="flex items-center">
                <Label className="w-48">Extension Repository</Label>
                <div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>

              {/* Show NSFW */}
              <div className="flex items-center">
                <Label htmlFor="showNSFW" className="w-48">Show NSFW</Label>
                <div>
                  <Switch
                    id="showNSFW"
                    checked={showNSFW}
                    onCheckedChange={(value) => handleValueChange(setShowNSFW, value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* About */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <p className="text-muted-foreground text-left mb-4">
                Information about the application
              </p>
              <div className="flex items-center">
                <Label className="w-48">Version</Label>
                <div>
                  <p className="text-sm">1.0.0 Beta</p>
                </div>
              </div>

              <div className="flex items-center">
                <Label className="w-48">Last Updated</Label>
                <div>
                  <p className="text-sm">April 8, 2025</p>
                </div>
              </div>

              <div className="flex items-center">
                <Label className="w-48">GitHub</Label>
                <div>
                  <a href="https://github.com/uday-samsani/dokusho"
                     className="text-sm text-blue-500 hover:underline">github.com/uday-samsani/dokusho</a>
                </div>
              </div>

              <div className="flex items-center">
                <Label className="w-48">Website</Label>
                <div>
                  <a href="https://dokusho.app" className="text-sm text-blue-500 hover:underline">dokusho.app</a>
                </div>
              </div>

              <div className="mt-8 border-t pt-6">
                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => resetSettings()}>
                    Reset All Settings
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;