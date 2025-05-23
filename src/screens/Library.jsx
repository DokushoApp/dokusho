import React, {useState} from "react";
import {Origami, Plus, FolderUp, Archive, X} from "lucide-react";
import {open} from '@tauri-apps/plugin-dialog';
import {invoke} from '@tauri-apps/api/core';
import {useAtom} from "jotai";
import {focusAtom} from "jotai-optics";

import {settingsAtom, saveSettingsAtom} from "@/store/settings";
import {libraryAtom, loadLibraryAtom} from "@/store/library.js";

import {Button} from "@/components/ui/button";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DraggableMenuBar from "@/components/library/DraggableMenuBar";
import MangaCard from "@/components/base/MangaCard.jsx";

const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
const defaultCategoryAtom = focusAtom(settingsAtom, optic => optic.prop("default_category"));
const mangaAtom = focusAtom(libraryAtom, optic => optic.prop("manga"));

function Library() {
  const [mangaList, setMangaList] = useAtom(mangaAtom);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [categories, setCategories] = useAtom(categoriesAtom);
  const [defaultCategory] = useAtom(defaultCategoryAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);
  const [, loadLibrary] = useAtom(loadLibraryAtom);

  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  const handleAddMangaFolder = async () => {
    try {
      setIsMenuOpen(false); // Close the menu

      const selected = await open({
        directory: true,
        multiple: false,
        title: 'Select Manga Folder'
      });

      if (selected) {
        const folderPath = selected.toString();
        const folderName = folderPath.split('/').pop().split('\\').pop();

        const mangaInput = {
          title: folderName,
          path: folderPath,
          category: selectedCategory,
        };

        await invoke("import_manga_folder", {mangaInput})
        await loadLibrary();
      }
    } catch (err) {
      console.error('Error adding manga folder:', err);
    }
  };

  const handleAddMangaCBZ = async () => {
    try {
      setIsMenuOpen(false); // Close the menu

      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Comic Book Archive',
          extensions: ['cbz']
        }],
        title: 'Select Manga CBZ File'
      });

      if (selected) {
        const filePath = selected.toString();
        const fileName = filePath.split('/').pop().split('\\').pop();
        const title = fileName.replace(/\.cbz$/i, '');

        const mangaInput = {
          title: title,
          path: filePath,
          category: selectedCategory,
        };

        await invoke("import_manga_cbz", {mangaInput})
        await loadLibrary();

      }
    } catch (err) {
      console.error('Error adding manga CBZ:', err);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleCategoriesReordered = (newCategories) => {
    setCategories(newCategories);
    setTimeout(() => saveSettings(), 0);
  };

  const filteredManga = selectedCategory === "all" && mangaList.length !== 0
    ? mangaList
    : mangaList.filter(manga => manga.category === selectedCategory);

  return (
    <div className="flex flex-1 flex-col w-full">
      <DraggableMenuBar
        menuItems={categories}
        initialItem={selectedCategory}
        onItemSelect={handleCategorySelect}
        onItemsReordered={handleCategoriesReordered}
        allowAddItem={true}
        addItemTitle="Add New Category"
        addItemPlaceholder="Enter category name"
      />
      <div className={"flex-1 overflow-y-auto no-scrollbar p-4"}>
        {filteredManga.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {filteredManga.map((manga) => (
              <MangaCard
                key={manga.id}
                manga={manga}
                isLibrary={true}
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
      </div>

      <TooltipProvider>
        <div className="fixed bottom-6 right-6 flex flex-col-reverse items-center gap-4 z-50">
          <Button
            onClick={toggleMenu}
            size="icon"
            variant="outline"
            className="rounded-full h-14 w-14 shadow-lg transition-all duration-300"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 transition-transform duration-300"/>
            ) : (
              <Plus className="h-6 w-6 transition-transform duration-300"/>
            )}
          </Button>

          <div
            className={`flex flex-col gap-3 items-center ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-all duration-300`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleAddMangaFolder}
                  size="icon"
                  variant="outline"
                  className={`rounded-full h-12 w-12 shadow-md ${isMenuOpen ? 'transform translate-y-0' : 'transform translate-y-10'} transition-all duration-300`}
                >
                  <FolderUp className="h-5 w-5"/>
                </Button>
              </TooltipTrigger>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleAddMangaCBZ}
                  size="icon"
                  variant="outline"
                  className={`rounded-full h-12 w-12 shadow-md ${isMenuOpen ? 'transform translate-y-0' : 'transform translate-y-10'} transition-all duration-300 delay-75`}
                >
                  <Archive className="h-5 w-5"/>
                </Button>
              </TooltipTrigger>
            </Tooltip>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}

export default Library;