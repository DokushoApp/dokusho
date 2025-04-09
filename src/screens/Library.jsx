import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { Origami, BookOpen, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import MenuBar from "@/components/ui/menubar.jsx";
import MangaGrid from "@/components/library/MangaGrid.jsx";
import { open } from '@tauri-apps/plugin-dialog';
import { readDir } from '@tauri-apps/plugin-fs';
import { convertFileSrc } from '@tauri-apps/api/core';

function Library() {
  const [mangaList, setMangaList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('reading');
  const [selectedCategory, setSelectedCategory] = useState('reading');
  const navigate = useNavigate();

  const categories = [
    {id: "plan-to-read", name: "Plan to Read"},
    {id: "reading", name: "Reading"},
    {id: "on-hold", name: "On Hold"},
    {id: "completed", name: "Completed"},
    {id: "dropped", name: "Dropped"}
  ];

  // Load previously opened manga from storage
  useEffect(() => {
    const loadSavedManga = async () => {
      try {
        const savedManga = [];
        setMangaList(savedManga);
      } catch (error) {
        console.error("Error loading saved manga:", error);
      }
    };

    loadSavedManga();
  }, []);

  const addMangaFolder = async () => {
    try {
      setIsLoading(true);

      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Manga Folder'
      });

      if (selected) {
        const folderPath = selected.toString();
        const folderName = folderPath.split('/').pop().split('\\').pop();

        // Try to find a cover image in the folder
        const entries = await readDir(folderPath, { recursive: false });

        // Filter for image files
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
        const imageFiles = entries
          .filter(entry => {
            const lowerCaseName = entry.name?.toLowerCase() || '';
            return entry.children === undefined &&
              imageExtensions.some(ext => lowerCaseName.endsWith(ext));
          })
          .sort((a, b) => {
            // Sort images to try to get cover image first
            const aName = a.name?.toLowerCase() || '';
            const bName = b.name?.toLowerCase() || '';

            // Prioritize files that might be covers
            const coverKeywords = ['cover', 'front', 'page0', 'page1', 'page01', '001', '0001'];
            const aIsCover = coverKeywords.some(keyword => aName.includes(keyword));
            const bIsCover = coverKeywords.some(keyword => bName.includes(keyword));

            if (aIsCover && !bIsCover) return -1;
            if (!aIsCover && bIsCover) return 1;

            return 0;
          });

        const coverImage = imageFiles.length > 0
          ? convertFileSrc(folderPath+"/"+imageFiles[0].name)
          : 'https://placehold.co/200x300/png?text=No+Cover';


        // Create a new manga entry
        const newManga = {
          id: Date.now().toString(),
          title: folderName,
          path: folderPath,
          coverImage: coverImage,
          lastRead: 'Just added',
          progress: 0,
          category: selectedCategory,
          totalPages: imageFiles.length
        };

        // Add to our manga list
        setMangaList(prev => [...prev, newManga]);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error adding manga:', err);
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setActiveCategory(categoryId);
  };

  const handleMangaSelect = (manga) => {
    // Navigate to the reader with the manga path
    navigate('/reader', { state: { mangaPath: manga.path } });
  };

  const filteredManga = mangaList.filter(manga => manga.category === selectedCategory);

  return (
    <div className="flex flex-1 flex-col">
      <MenuBar
        menuItems={categories}
        initialItem={selectedCategory}
        onItemSelect={handleCategorySelect}
        allowAddItem={true}
        addItemTitle="Add New Category"
        addItemPlaceholder="Enter category name"
      />

      {filteredManga.length > 0 ? (
        <MangaGrid items={filteredManga} onMangaSelect={handleMangaSelect} />
      ) : (
        <div className="flex h-full w-full flex-1 flex-col justify-center m-auto gap-2 p-2 md:p-10">
          <div className="flex flex-col items-center">
            <Origami size={200} strokeWidth={0.25} className="mb-6" />
            <h1 className="mb-6 text-xl">Your library is empty</h1>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={addMangaFolder} className="flex items-center gap-2">
                <FolderPlus className="h-4 w-4" />
                Add Manga Folder
              </Button>

              <Link to="/reader">
                <Button variant="outline" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Open Reader
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Floating action button to add manga */}
      <Button
        onClick={addMangaFolder}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
        disabled={isLoading}
      >
        <FolderPlus className="h-6 w-6" />
      </Button>
    </div>
  );
}

export default Library;