import React from 'react';
import {useNavigate} from "react-router";
import {convertFileSrc, invoke} from "@tauri-apps/api/core";
import {
  Pencil,
  Trash,
  Info,
  BookOpen,
  Tags,
  Archive,
  Share
} from 'lucide-react';

// Import ShadCN UI components
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {settingsAtom} from "@/store/settings.js";
import {focusAtom} from "jotai-optics";
import {libraryAtom, saveLibraryAtom} from "@/store/library.js";
import {useAtom, useAtomValue} from "jotai";

const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
const selectedCategoryAtom = focusAtom(settingsAtom, optic => optic.prop("selected_category"))
const mangaListAtom = focusAtom(libraryAtom, optic => optic.prop("manga"))

const MangaCard = ({manga}) => {
  const navigate = useNavigate();
  const categories = useAtomValue(categoriesAtom);
  const [mangaList, setMangaList] = useAtom(mangaListAtom);
  const selectedCategory = useAtomValue(selectedCategoryAtom);

  const [, saveLibrary] = useAtom(saveLibraryAtom);

  const handleClick = (manga) => {
    // Navigate to Manga detail screen instead of directly to reader
    navigate('/manga', {state: {manga}});
  };

  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveLibrary(), 0);
  };

  const onChangeToCategory = (categoryId) => {
    const item = mangaList.filter(m => m.id === manga.id)[0];
    item.category = categoryId;
    const finalList = mangaList.filter(m => m.id !== manga.id);
    setMangaList([...finalList, item]);
  }

  const onDeleteManga = () => {
    const items = mangaList.filter(m => m.id !== manga.id);
    setMangaList(items);
    setTimeout(() => invoke("delete_manga", {path:manga.path}), 0)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="group relative rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md bg-card text-card-foreground cursor-pointer"
          style={{width: '200px'}}
          onClick={() => handleClick(manga)}
        >
          {/* Cover Image with Overlay Title */}
          <div className="relative overflow-hidden" style={{height: '280px'}}>
            <img
              src={convertFileSrc(manga.cover)}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />

            {/* Gradient overlay for title text contrast */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent"/>

            {/* Title on cover image */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-white font-medium text-sm line-clamp-2">{manga.title}</h3>
            </div>

            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"/>

            {/* Reading progress indicator */}
            {manga.progress > 0 && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-1 bg-primary"
                  style={{width: `${manga.progress}%`}}
                />
              </div>
            )}
          </div>

          {/* Additional Info Panel - only show if lastRead exists */}
          {manga.lastRead && (
            <div className="p-3">
              <div className="text-xs text-muted-foreground">
                <span>Last read: {manga.lastRead}</span>
              </div>
            </div>
          )}
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleClick(manga);
          }}
        >
          <Info className="mr-2 h-4 w-4"/>
          <span>View Details</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            // Navigate directly to reader if needed
            navigate('/reader', {state: {manga}});
          }}
        >
          <BookOpen className="mr-2 h-4 w-4"/>
          <span>Read Now</span>
        </ContextMenuItem>

        <ContextMenuSeparator/>

        {/* Category Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Tags className="mr-2 h-4 w-4"/>
            <span>Change Category</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {
              categories.filter(category => category.id !== selectedCategory).map(category => (
                <ContextMenuItem
                  key={category.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleValueChange(onChangeToCategory, category.id);
                  }}
                >
                  <span>{category.name}</span>
                </ContextMenuItem>
              ))
            }
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator/>

        {/* Danger Zone */}
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleValueChange(onDeleteManga);
          }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash className="mr-2 h-4 w-4"/>
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MangaCard;