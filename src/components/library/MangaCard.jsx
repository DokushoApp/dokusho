import React from 'react';
import {MoreVertical} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {convertFileSrc} from "@tauri-apps/api/core";
import {useNavigate} from "react-router";

const MangaCard = ({manga}) => {
  const navigate = useNavigate();
  const handleClick = (manga) => {
    // Navigate to the reader with the manga path
    navigate('/reader', {state: {mangaPath: manga.path}});
  };
  console.log(manga);
  return (
    <div
      className="group relative rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md bg-white dark:bg-neutral-800 cursor-pointer"
      style={{width: '200px'}}
      onClick={() => {
        handleClick(manga)
      }}>
      {/* Cover Image */}
      <div className="relative overflow-hidden" style={{height: '200px'}}>
        <img
          src={convertFileSrc(manga.cover)}
          alt={manga.title}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
        />

        {/* Hover overlay effect */}
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity"/>

        {/* Reading progress indicator */}
        {manga.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-neutral-600">
            <div
              className="h-1 bg-primary"
              style={{width: `${manga.progress}%`}}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-1">{manga.title}</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation(); // Prevent card click from triggering
              // Add your menu logic here
            }}
          >
            <MoreVertical className="h-3 w-3"/>
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {manga.lastRead && (
            <span>Last read: {manga.lastRead}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MangaCard;