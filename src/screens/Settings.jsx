import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-8 pb-16">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Configure your manga reader preferences
          </p>
        </div>

        <Menubar
          menuItems={settingsTabs}
          initialItem={activeTab}
          onItemSelect={setActiveTab}
          allowAddItem={false}
        />

        {/* Settings Content */}
        <div className="space-y-4">
          {/* General Settings */}
          {activeTab === "general" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure the appearance and behavior of the app
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Category Tab */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="defaultCategoryTab">Default Category Tab</Label>
                  </div>
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

                {/* Manga Card Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="mangaCardGrid">Manga Card Grid</Label>
                    <span className="text-sm text-muted-foreground">
                      {mangaCardGrid} columns
                    </span>
                  </div>
                  <Select
                    value={mangaCardGrid}
                    onValueChange={setMangaCardGrid}
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
                </div>

                {/* Manga Card Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cardSize">Manga Card Size</Label>
                    <span className="text-sm text-muted-foreground">
                      {mangaCardSize}%
                    </span>
                  </div>
                  <Slider
                    id="cardSize"
                    min={25}
                    max={100}
                    step={5}
                    value={[mangaCardSize]}
                    onValueChange={(value) => setMangaCardSize(value[0])}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Library Settings */}
          {activeTab === "library" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Library Settings
                </CardTitle>
                <CardDescription>
                  Configure how your manga library is organized
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Edit Categories */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Edit Categories</Label>
                    <Button variant="outline" size="sm" className="gap-1">
                      Manage
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add, remove, or rearrange your manga categories
                  </p>
                </div>

                {/* Default Category */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="defaultCategory">Default Category</Label>
                  </div>
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
              </CardContent>
            </Card>
          )}

          {/* Reader Settings */}
          {activeTab === "reader" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Reader Settings
                </CardTitle>
                <CardDescription>
                  Configure your reading experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Reading Mode */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="readingMode">Reading Mode</Label>
                  </div>
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

                {/* Reading Page Layout */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="readingLayout">Reading Page Layout</Label>
                  </div>
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

                {/* Reader Zoom */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="readerZoom">Reader Zoom</Label>
                    <span className="text-sm text-muted-foreground">
                      {readerZoom}%
                    </span>
                  </div>
                  <Slider
                    id="readerZoom"
                    min={50}
                    max={200}
                    step={10}
                    value={[readerZoom]}
                    onValueChange={(value) => setReaderZoom(value[0])}
                  />
                </div>

                {/* Reader Padding */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="readerPadding">Reader Padding</Label>
                    <span className="text-sm text-muted-foreground">
                      {readerPadding}px
                    </span>
                  </div>
                  <Slider
                    id="readerPadding"
                    min={0}
                    max={50}
                    step={5}
                    value={[readerPadding]}
                    onValueChange={(value) => setReaderPadding(value[0])}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Extension Settings */}
          {activeTab === "extension" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  Extension Settings
                </CardTitle>
                <CardDescription>
                  Configure extension sources and filters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Extension Repository */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Extension Repository</Label>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Add, remove, or update manga source extensions
                  </p>
                </div>

                {/* Show NSFW */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="showNSFW">Show NSFW</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow mature content to be displayed
                    </p>
                  </div>
                  <Switch
                    id="showNSFW"
                    checked={showNSFW}
                    onCheckedChange={setShowNSFW}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* About */}
          {activeTab === "about" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  About
                </CardTitle>
                <CardDescription>
                  Information about the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold">Manga Reader</h3>
                  <p className="text-sm text-muted-foreground">Version 1.0.0 Beta</p>

                  <div className="py-4">
                    <p className="text-sm">
                      A modern manga reader application with library management
                    </p>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" size="sm" className="mx-auto">
                      Check for Updates
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;