import React from 'react';
import { useNavigate } from "react-router";
import {
  BookOpen,
  BookPlus,
  FolderPlus,
  Info,
  ExternalLink
} from 'lucide-react';
import { useAtom, useAtomValue } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom } from "@/store/settings.js";
import { libraryAtom, saveLibraryAtom } from "@/store/library.js";
import { nanoid } from 'nanoid';

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

const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
const mangaListAtom = focusAtom(libraryAtom, optic => optic.prop("manga"));

const MangaCard = ({ manga }) => {
  const navigate = useNavigate();
  const categories = useAtomValue(categoriesAtom);
  const [mangaList, setMangaList] = useAtom(mangaListAtom);
  const [, saveLibrary] = useAtom(saveLibraryAtom);

  // Handle clicking on the card to view details
  const handleViewDetails = () => {
    // Navigate to manga details page with the manga data
    navigate('/manga', { state: { manga } });
  };

  // Handle reading the manga
  const handleReadNow = () => {
    // Navigate directly to reader
    navigate('/reader', { state: { manga } });
  };

  // Add manga to library with specified category
  const addToLibrary = (categoryId) => {
    // Check if manga already exists in library
    const existingManga = mangaList.find(m =>
      (m.sourceId === manga.id && m.source === manga.source) ||
      (m.title === manga.title && m.source === manga.source)
    );

    if (existingManga) {
      // If already exists, just update category
      const updatedList = mangaList.map(m =>
        (m.id === existingManga.id)
          ? { ...m, category: categoryId }
          : m
      );
      setMangaList(updatedList);
    } else {
      // Create a new manga entry for the library
      const newManga = {
        id: nanoid(),
        title: manga.title,
        cover: manga.cover || '', // Local path for downloaded cover
        coverUrl: manga.coverUrl || '', // URL for extension manga
        source: manga.source,
        category: categoryId,
        progress: 0,
        lastRead: null,
        path: manga.path || '',
        sourceId: manga.id,
        mangaId: manga.mangaId || manga.id, // Crucial for MangaDex
        coverFileName: manga.coverFileName || '', // Store the cover filename for MangaDex
        createdAt: new Date().toISOString()
      };

      setMangaList([...mangaList, newManga]);
    }

    // Save to storage
    setTimeout(() => saveLibrary(), 0);
  };

  // Handle getting cover image from different sources
  const getCoverImage = () => {
    // For MangaDex format
    if (manga.source === 'mangadex') {
      // If we have the manga ID and cover filename directly
      if (manga.mangaId && manga.coverFileName) {
        return `https://uploads.mangadex.org/covers/${manga.mangaId}/${manga.coverFileName}.512.jpg`;
      }

      // If the cover is in relationships array (from MangaDex API)
      if (manga.relationships && Array.isArray(manga.relationships)) {
        const coverArt = manga.relationships.find(rel => rel.type === 'cover_art');
        if (coverArt && coverArt.attributes && coverArt.attributes.fileName) {
          return `https://uploads.mangadex.org/covers/${manga.id}/${coverArt.attributes.fileName}.512.jpg`;
        }
      }

      // If the manga id is stored in a different property
      const id = manga.mangaId || manga.id;
      if (id && manga.coverFileName) {
        return `https://uploads.mangadex.org/covers/${id}/${manga.coverFileName}.512.jpg`;
      }
    }

    // If the manga has a direct coverUrl, use that
    if (manga.coverUrl) {
      return manga.coverUrl;
    }

    // If the manga has a base URL and filename
    if (manga.baseUrl && manga.cover) {
      return `${manga.baseUrl}/${manga.cover}`;
    }

    // Default placeholder
    return 'https://placehold.co/200x280?text=No+Cover';
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="group relative rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md bg-card text-card-foreground cursor-pointer"
          style={{ width: '200px' }}
          onClick={handleViewDetails}
        >
          {/* Cover Image */}
          <div className="relative overflow-hidden" style={{ height: '280px' }}>
            <img
              src={getCoverImage()}
              alt={manga.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                // Try the smaller thumbnail if the large one fails
                if (e.target.src.includes('.512.jpg')) {
                  e.target.src = e.target.src.replace('.512.jpg', '.256.jpg');
                } else if (manga.source === 'mangadex' && (manga.mangaId || manga.id) && manga.coverFileName) {
                  // Try the original image if both thumbnails fail
                  const id = manga.mangaId || manga.id;
                  e.target.src = `https://uploads.mangadex.org/covers/${id}/${manga.coverFileName}`;
                } else {
                  // Final fallback
                  e.target.src = 'https://placehold.co/200x280?text=No+Cover';
                }
              }}
            />

            {/* Source badge */}
            {manga.source && (
              <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded-sm">
                {manga.source === 'mangadex' ? 'MangaDex' : manga.source}
              </div>
            )}

            {/* Gradient overlay for title text contrast */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

            {/* Title on cover image */}
            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
              <h3 className="text-white font-medium text-sm line-clamp-2">{manga.title}</h3>
            </div>

            {/* Hover overlay effect */}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </ContextMenuTrigger>

      <ContextMenuContent className="w-64">
        <ContextMenuItem onClick={handleViewDetails}>
          <Info className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Add to Library Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <BookPlus className="mr-2 h-4 w-4" />
            <span>Add to Library</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            {categories.map(category => (
              <ContextMenuItem
                key={category.id}
                onClick={() => addToLibrary(category.id)}
              >
                <span>{category.name}</span>
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuItem onClick={() => addToLibrary(categories[0]?.id || "default")}>
          <FolderPlus className="mr-2 h-4 w-4" />
          <span>Quick Add</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Read Now - This would take them directly to the reader */}
        <ContextMenuItem onClick={handleReadNow}>
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Read Now</span>
        </ContextMenuItem>

        {/* External Link - If the manga has a source URL */}
        {manga.source === 'mangadex' && manga.id && (
          <ContextMenuItem
            onClick={() => window.open(`https://mangadex.org/title/${manga.id}`, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            <span>View on MangaDex</span>
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MangaCard;