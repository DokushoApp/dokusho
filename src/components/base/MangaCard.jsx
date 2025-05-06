import React from 'react';
import {useNavigate} from "react-router";
import {
  BookOpen,
  BookPlus,
  FolderPlus,
  Info,
  ExternalLink,
  Star, Trash
} from 'lucide-react';
import {useAtom, useAtomValue} from "jotai";
import {focusAtom} from "jotai-optics";
import {categoriesAtom, settingsAtom} from "@/store/settings.js";
import {libraryAtom, mangaListAtom, saveLibraryAtom} from "@/store/library.js";
import {nanoid} from 'nanoid';
import {cn} from "@/lib/utils";

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
import {Badge} from "@/components/ui/badge";
import {convertFileSrc, invoke} from "@tauri-apps/api/core";
import {
  isInLibrary,
  useMangaLibrary,
} from "@/hooks/useMangaLibrary.js";


/**
 * MangaCard component displays a manga item with cover, title and context menu
 *
 * @param {Object} props
 * @param {Object} props.manga - Manga data object
 * @param {Function} props.onClick - Optional click handler for the card
 * @param {string} props.className - Optional class names
 * @returns {JSX.Element}
 */
const MangaCard = ({manga, onClick, isLibrary}) => {
  const navigate = useNavigate();
  const categories = useAtomValue(categoriesAtom);
  const mangaList = useAtomValue(mangaListAtom);

  const {
    addMangaToLibrary,
    updateMangaCategory,
    deleteMangaFromLibrary
  } = useMangaLibrary();

  // Check if manga is already in library
  const inLibrary = isInLibrary(mangaList, manga);

  // Handle viewing manga details
  const handleViewDetails = () => {
    if (onClick) {
      onClick(manga);
    } else {
      // Default navigation
      navigate('/manga/', {state: {manga}});
    }
  };

  // Handle reading the manga
  const handleReadNow = () => {
    // Navigate to reader with the first chapter if available
    if (manga.firstChapter) {
      navigate('/reader', {state: {manga, chapter: manga.firstChapter}});
    } else {
      // If no chapter info, just show details
      handleViewDetails();
    }
  };

  // Handle getting cover image based on source
  const getCoverImage = () => {
    if (manga.source_id === "local") {
      return convertFileSrc(manga.cover)
    } else {
      return manga.cover;
    }

    // Default placeholder
    return 'https://placehold.co/200x280?text=No+Cover';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "group relative rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md bg-card text-card-foreground cursor-pointer h-full",
          )}
          onClick={handleViewDetails}
        >
          {/* Cover Image */}
          <div className="relative overflow-hidden aspect-[2/3]">
            <img
              src={getCoverImage()}
              alt={manga.title}
              className="w-60 h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                // Try a smaller thumbnail if the large one fails
                if (e.target.src.includes('.512.jpg')) {
                  e.target.src = e.target.src.replace('.512.jpg', '.256.jpg');
                } else {
                  // Final fallback
                  e.target.src = 'https://placehold.co/200x280?text=No+Cover';
                }
              }}
            />

            {/* Source badge */}
            <div className="absolute top-2 left-2 flex gap-1">
              {isLibrary && (
                <Badge variant="primary" className="text-xs px-1.5 py-0 font-normal bg-background text-foreground">
                  {manga.source_id}
                </Badge>
              )}

              {!isLibrary && inLibrary && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                  <Star className="w-3 h-3 mr-0.5"/>
                  Library
                </Badge>
              )}
            </div>

            {/* Gradient overlay for title text contrast */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent"/>

            {/* Title on cover image */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-white font-medium text-sm line-clamp-2">{manga.title}</h3>
            </div>

            {/* Hover overlay with quick actions */}
            {!isLibrary && (
              <div
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReadNow();
                  }}
                  className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                  title="Read Now"
                >
                  <BookOpen className="w-5 h-5"/>
                </button>

                <button
                  onClick={async () => await addMangaToLibrary(manga, categories[0]?.id)}
                  className="bg-primary text-primary-foreground p-2 rounded-full hover:bg-primary/90 transition-colors"
                  title={"Add to Library"}
                >
                  <BookPlus className="w-5 h-5"/>
                </button>
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleViewDetails}>
          <Info className="mr-2 h-4 w-4"/>
          <span>View</span>
        </ContextMenuItem>

        <ContextMenuItem onClick={handleReadNow}>
          <BookOpen className="mr-2 h-4 w-4"/>
          <span>Read Now</span>
        </ContextMenuItem>

        <ContextMenuSeparator/>

        {/* Add to Library Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <BookPlus className="mr-2 h-4 w-4"/>
            <span>{inLibrary ? "Update Category" : "Add to Library"}</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {categories.map(category => (
              <ContextMenuItem
                key={category.id}
                onClick={async () => {
                  if (inLibrary) {
                    await addMangaToLibrary(manga, category.id);
                  } else {
                    await updateMangaCategory(manga, category.id);
                  }
                }}
              >
                <span>{category.name}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>
        {inLibrary && (
          <>
            <ContextMenuSeparator/>
            {/* Danger Zone */}
            <ContextMenuItem
              onClick={async () => await deleteMangaFromLibrary(manga)}
              className="text-destructive focus:text-destructive focus:bg-destructive/10"
            >
              <Trash className="mr-2 h-4 w-4"/>
              <span>Delete</span>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MangaCard;