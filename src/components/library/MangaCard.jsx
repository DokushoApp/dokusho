import React from 'react';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { convertFileSrc } from "@tauri-apps/api/core";
import { useNavigate } from "react-router";

const MangaCard = ({ manga }) => {
  const navigate = useNavigate();

  const handleClick = (manga) => {
    navigate('/reader', { state: { manga } });
  };

  return (
    <div
      className="group relative rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md bg-white dark:bg-neutral-800 cursor-pointer"
      style={{ width: '200px' }}
      onClick={() => handleClick(manga)}
    >
      {/* Cover Image with Overlay Title */}
      <div className="relative overflow-hidden" style={{ height: '280px' }}>
        <img
          src={convertFileSrc(manga.cover)}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Gradient overlay for title text contrast */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />

        {/* Title on cover image */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
          <h3 className="text-white font-medium text-sm line-clamp-2">{manga.title}</h3>
        </div>

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Reading progress indicator */}
        {manga.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-neutral-600">
            <div
              className="h-1 bg-primary"
              style={{ width: `${manga.progress}%` }}
            />
          </div>
        )}

        {/* Menu button - top right, visible on hover */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 h-7 w-7 p-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click from triggering
            // Add your menu logic here
          }}
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>

      {/* Additional Info Panel - only show if lastRead exists */}
      {manga.lastRead && (
        <div className="p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>Last read: {manga.lastRead}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MangaCard;