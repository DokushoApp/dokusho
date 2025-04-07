import React, { useState } from "react";
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
import Menubar from "@/components/ui/menubar.jsx";

const SettingsScreen = () => {
  // Default settings values
  const [defaultCategoryTab, setDefaultCategoryTab] = useState("reading");
  const [mangaCardGrid, setMangaCardGrid] = useState("3");
  const [mangaCardSize, setMangaCardSize] = useState(50);
  const [defaultCategory, setDefaultCategory] = useState("reading");
  const [readingMode, setReadingMode] = useState("leftToRight");
  const [readingLayout, setReadingLayout] = useState("continuous");
  const [readerZoom, setReaderZoom] = useState(100);
  const [readerPadding, setReaderPadding] = useState(10);
  const [showNSFW, setShowNSFW] = useState(false);

  // Active settings tab
  const [activeTab, setActiveTab] = useState("general");

  // Settings tabs for the MenuBar
  const settingsTabs = [
    { id: "general", name: "General" },
    { id: "library", name: "Library" },
    { id: "reader", name: "Reader" },
    { id: "extension", name: "Extension" },
    { id: "about", name: "About" }
  ];

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col">
        <Menubar
          menuItems={settingsTabs}
          initialItem={activeTab}
          onItemSelect={setActiveTab}
          allowAddItem={false}
        />

        <div>
          {/* General Settings */}
          {activeTab === "general" && (
            <div className="space-y-6">
              <p className="text-muted-foreground text-left mb-4">
                Configure the appearance and behavior of the app
              </p>



              {/* Default Category Tab */}
              <div className="flex items-center">
                <Label htmlFor="defaultCategoryTab" className="w-48">Default Category Tab</Label>
                <div className="w-64">
                  <Select
                    value={defaultCategoryTab}
                    onValueChange={setDefaultCategoryTab}
                  >
                    <SelectTrigger id="defaultCategoryTab">
                      <SelectValue placeholder="Select default category tab" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                      <SelectItem value="plan-to-read">Plan to Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Manga Card Grid */}
              <div className="flex items-center">
                <Label htmlFor="mangaCardGrid" className="w-48">Manga Card Grid</Label>
                <div className="flex items-center gap-4">
                  <Select
                    value={mangaCardGrid}
                    onValueChange={setMangaCardGrid}
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
                  <Slider
                    id="cardSize"
                    className="w-48"
                    min={25}
                    max={100}
                    step={5}
                    value={[mangaCardSize]}
                    onValueChange={(value) => setMangaCardSize(value[0])}
                  />
                  <span className="text-sm text-muted-foreground w-16">
                    {mangaCardSize}%
                  </span>
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
                    onValueChange={setDefaultCategory}
                  >
                    <SelectTrigger id="defaultCategory">
                      <SelectValue placeholder="Select default category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="dropped">Dropped</SelectItem>
                      <SelectItem value="plan-to-read">Plan to Read</SelectItem>
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
                    onValueChange={setReadingMode}
                  >
                    <SelectTrigger id="readingMode">
                      <SelectValue placeholder="Select reading mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leftToRight">Left to Right</SelectItem>
                      <SelectItem value="rightToLeft">Right to Left</SelectItem>
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
                    onValueChange={setReadingLayout}
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
                    onValueChange={(value) => setReaderZoom(value[0])}
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
                    onValueChange={(value) => setReaderPadding(value[0])}
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
                    onCheckedChange={setShowNSFW}
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
                  <p className="text-sm">April 7, 2025</p>
                </div>
              </div>

              <div className="flex items-center">
                <Label className="w-48">GitHub</Label>
                <div>
                  <a href="https://github.com/uday-samsani/dokusho" className="text-sm text-blue-500 hover:underline">github.com/uday-samsani/dokusho</a>
                </div>
              </div>

              <div className="flex items-center">
                <Label className="w-48">Website</Label>
                <div>
                  <a href="https://dokusho.app" className="text-sm text-blue-500 hover:underline">dokusho.app</a>
                </div>
              </div>

              <div className="flex items-center pt-2">
                <div className="w-48"></div>
                <div>
                  <Button variant="outline" size="sm">
                    Check for Updates
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