import React from 'react';
import { useNavigate } from "react-router";
import { convertFileSrc } from "@tauri-apps/api/core";
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

const MangaCard = ({
                     manga,
                     onEdit,
                     onDelete,
                     onViewDetails,
                     onAddToCategory,
                     onArchive,
                     onShare
                   }) => {
  const navigate = useNavigate();

  const handleClick = (manga) => {
    navigate('/reader', { state: { manga } });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className="group relative rounded-md shadow-sm overflow-hidden transition-all hover:shadow-md bg-card text-card-foreground cursor-pointer"
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
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                <div
                  className="h-1 bg-primary"
                  style={{ width: `${manga.progress}%` }}
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
          <BookOpen className="mr-2 h-4 w-4" />
          <span>Read Now</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(manga);
          }}
        >
          <Info className="mr-2 h-4 w-4" />
          <span>View Details</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Category Submenu */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Tags className="mr-2 h-4 w-4" />
            <span>Change Category</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAddToCategory?.(manga, "reading");
              }}
            >
              <span>Reading</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAddToCategory?.(manga, "completed");
              }}
            >
              <span>Completed</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAddToCategory?.(manga, "plan-to-read");
              }}
            >
              <span>Plan to Read</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAddToCategory?.(manga, "on-hold");
              }}
            >
              <span>On Hold</span>
            </ContextMenuItem>
            <ContextMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onAddToCategory?.(manga, "dropped");
              }}
            >
              <span>Dropped</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        {/* Management Options */}
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(manga);
          }}
        >
          <Pencil className="mr-2 h-4 w-4" />
          <span>Edit</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onShare?.(manga);
          }}
        >
          <Share className="mr-2 h-4 w-4" />
          <span>Share</span>
        </ContextMenuItem>

        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onArchive?.(manga);
          }}
        >
          <Archive className="mr-2 h-4 w-4" />
          <span>Archive</span>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Danger Zone */}
        <ContextMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(manga);
          }}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <Trash className="mr-2 h-4 w-4" />
          <span>Delete</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default MangaCard;