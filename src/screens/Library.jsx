import React, {useEffect, useState} from "react";
import {useNavigate} from "react-router";
import {Origami, Plus} from "lucide-react";
import {nanoid} from "nanoid";
import {open} from '@tauri-apps/plugin-dialog';
import {readDir} from '@tauri-apps/plugin-fs';
import {convertFileSrc, invoke} from '@tauri-apps/api/core';
import {useAtom, useAtomValue} from "jotai";
import {focusAtom} from "jotai-optics";

import {settingsAtom, saveSettingsAtom} from "@/store/settings";
import {libraryAtom, saveLibraryAtom} from "@/store/library.js";

import {Button} from "@/components/ui/button";
import DraggableMenuBar from "@/components/library/DraggableMenuBar";
import MangaCard from "@/components/library/MangaCard.jsx";

// Settings Jotai Atoms for categories
const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
const defaultCategoryAtom = focusAtom(settingsAtom, optic => optic.prop("default_category"));
const mangaAtom = focusAtom(libraryAtom, optic => optic.prop("manga"));

function Library() {
  const [mangaList, setMangaList] = useAtom(mangaAtom);
  const [isLoading, setIsLoading] = useState(false);

  // Get categories from settings
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [defaultCategory] = useAtom(defaultCategoryAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);
  const [, saveLibrary] = useAtom(saveLibraryAtom);

  useEffect( () => {
    saveLibrary();
  }, [mangaList]);

  // Use the default category from settings as the initial active category
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const navigate = useNavigate();

  const handleAddManga = async () => {
    try {
      setIsLoading(true);

      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Source'
      });

      if (selected) {
        const folderPath = selected.toString();
        const folderName = folderPath.split('/').pop().split('\\').pop();

        // Try to find a cover image in the folder
        const entries = await readDir(folderPath);

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
          ? convertFileSrc(folderPath + "/" + imageFiles[0].name)
          : 'https://placehold.co/200x300/png?text=No+Cover';


        // Create a new manga entry
        const mangaInput = {
          title: folderName,
          path: folderPath,
          category: selectedCategory,
        };

        await invoke("import_manga_folder", {mangaInput})

        // setMangaList([...mangaList, newManga]);
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Error adding manga:', err);
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleMangaSelect = (manga) => {
    // Navigate to the reader with the manga path
    navigate('/reader', {state: {mangaPath: manga.path}});
  };

  // Handle categories reordering
  const handleCategoriesReordered = (newCategories) => {
    setCategories(newCategories);
    setTimeout(() => saveSettings(), 0);
  };

  // Filter manga by "all" or specific category
  const filteredManga = selectedCategory === "all" && mangaList.length !== 0
    ? mangaList
    : mangaList.filter(manga => manga.category === selectedCategory);

  return (
    <div className="flex flex-1 flex-col">
      <DraggableMenuBar
        menuItems={categories}
        initialItem={selectedCategory}
        onItemSelect={handleCategorySelect}
        onItemsReordered={handleCategoriesReordered}
        allowAddItem={true}
        addItemTitle="Add New Category"
        addItemPlaceholder="Enter category name"
      />

      {filteredManga.length > 0 ? (
        <div className="flex flex-wrap gap-6 p-4 justify-center md:justify-start">
          {filteredManga.map((manga) => (
            <MangaCard
              key={manga.id}
              manga={manga}
              onClick={handleMangaSelect}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-full w-full flex-1 flex-col justify-center m-auto gap-2 p-2 md:p-10">
          <div className="flex flex-col items-center">
            <Origami size={200} strokeWidth={0.25} className="mb-6"/>
            <h1 className="mb-6 text-xl">Your library is empty</h1>
          </div>
        </div>
      )}

      {/* Floating action button to add manga */}
      <Button
        onClick={handleAddManga}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 shadow-lg"
        disabled={isLoading}
      >
        <Plus className="!h-6 !w-6"/>
      </Button>
    </div>
  );
}

export default Library;