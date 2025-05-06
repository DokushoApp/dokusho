import React, {useState} from 'react';
import {useLocation, useNavigate} from 'react-router';
import {useAtomValue} from 'jotai';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Filter,
  Plus,
  Library,
  SortAsc,
  User,
  AlertCircle, ChevronLeft
} from 'lucide-react';

import useFetchMangaDetails from "@/hooks/useFetchMangaDetails"
import useFetchMangaChapters from "@/hooks/useFetchMangaChapters";

// Import UI components
import {Button} from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';
import {mangaListAtom} from "@/store/library.js";
import {categoriesAtom} from "@/store/settings.js"
import {useMangaLibrary} from "@/hooks/useMangaLibrary.js";
import {convertFileSrc} from "@tauri-apps/api/core";

/**
 * Manga details page component
 * Displays manga information, chapters, and related actions
 */
const MangaDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const mangaList = useAtomValue(mangaListAtom)
  const categories = useAtomValue(categoriesAtom);
  const manga = location.state?.manga;

  const {
    addMangaToLibrary
  } = useMangaLibrary();

  // Local state for chapter sorting
  const [sortOrder, setSortOrder] = useState('desc');

  // Use custom hooks to fetch data and functionality
  const {data: details, error: detailsError, loading: detailsLoading} = useFetchMangaDetails(manga);
  const {chapters, error: chaptersError, loading: chaptersLoading} = useFetchMangaChapters(manga);

  // Handle sorting order change
  const handleSort = () => {
    setSortOrder(prevOrder => prevOrder === 'desc' ? 'asc' : 'desc');
  };

  const isInLibrary = mangaList.some(m =>
    (m.id === manga.id && m.source_id === manga.source_id)
  );

  // Navigate to reader with selected chapter
  const handleReadChapter = (chapter) => {
    if (chapter.isLocal) {
      // Navigate to reader with local manga
      navigate('/reader', {
        state: {
          manga: {
            ...manga,
            path: chapter.path || manga.path
          }
        }
      });
    } else {
      // For extension manga
      navigate('/reader', {
        state: {
          manga,
          chapter
        }
      });
    }
  };

  // Safety check
  if (!manga) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-medium">Manga not found</h3>
          <p className="text-muted-foreground">The manga information could not be loaded.</p>
          <Button
            onClick={() => navigate('/')}
            className="mt-4"
          >
            Return to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto no-scrollbar">
      <div className="flex items-center ">
        <div
          onClick={() => navigate(-1)}
          className="flex flex-row gap-1 py-4 text-bold text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={24} strokeWidth={2}/>
          Back
        </div>

      </div>

      {/* Manga info section */}
      <div className="flex flex-row gap-6">
        {/* Cover image */}
        <div className="flex-shrink-0">
          <div className="relative overflow-hidden rounded-lg shadow-md"
               style={{width: '280px', maxWidth: '100%'}}>
            <img
              src={manga.source_id === "local" ? convertFileSrc(manga.cover) : manga.cover}
              alt={manga.title}
              className="w-full object-cover"
              style={{aspectRatio: '2/3'}}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://placehold.co/400x600?text=No+Cover';
              }}
            />
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col gap-2">
            <Button
              className="w-full"
              onClick={() => chapters.length > 0 && handleReadChapter(chapters[0])}
              disabled={chapters.length === 0 || chaptersLoading}
            >
              <BookOpen className="mr-2 h-4 w-4"/>
              Start Reading
            </Button>

            {isInLibrary ? (
              <Button variant="outline" className="w-full">
                <Library className="mr-2 h-4 w-4"/>
                In Library
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger className="w-full">
                  <div className={`inline-flex items-center justify-center gap-2 w-full px-4 py-2 
                      rounded-md text-sm font-medium border border-input bg-background 
                      shadow-xs hover:bg-accent hover:text-accent-foreground 
                      dark:bg-input/30 dark:border-input dark:hover:bg-input/50`}>
                    <Plus className="h-4 w-4"/>
                    Add to Library
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {categories.map(category => (
                    <DropdownMenuItem key={category.id} value={category.id} className={'w-full'}
                                      onClick={async () => await addMangaToLibrary(manga, category.id)}>
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Details section */}
        <div className="flex-1">
          {/* Metadata */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold">{manga.title}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {details?.status && (
                <Badge variant="outline" className="capitalize">
                  {details.status}
                </Badge>
              )}

              {details?.tags && details.tags.length > 0 && (
                <>
                  {details.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}

                  {details.tags.length > 3 && (
                    <HoverCard>
                      <HoverCardTrigger>
                        <Badge variant="outline" className="cursor-pointer">
                          +{details.tags.length - 3} more
                        </Badge>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div className="flex flex-wrap gap-1">
                          {details.tags.slice(3).map((tag, index) => (
                            <Badge key={index + 3} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  )}
                </>
              )}

              {/* Skeleton badges for loading state */}
              {manga.source !== 'local' && detailsLoading && (
                <>
                  <Skeleton className="h-6 w-16 rounded-full"/>
                  <Skeleton className="h-6 w-20 rounded-full"/>
                  <Skeleton className="h-6 w-24 rounded-full"/>
                </>
              )}
            </div>

            {/* Author and artist info with skeleton loading */}
            <div className="space-y-2 mb-4">
              {details?.authors && details.authors.length > 0 ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground"/>
                  <span className="text-sm font-medium mr-2">Author:</span>
                  <span className="text-sm">{details.authors.join(', ')}</span>
                </div>
              ) : manga.source !== 'local' && detailsLoading ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground"/>
                  <span className="text-sm font-medium mr-2">Author:</span>
                  <Skeleton className="h-4 w-32"/>
                </div>
              ) : null}

              {details?.artists && details.artists.length > 0 ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground"/>
                  <span className="text-sm font-medium mr-2">Artist:</span>
                  <span className="text-sm">{details.artists.join(', ')}</span>
                </div>
              ) : manga.source !== 'local' && detailsLoading ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-muted-foreground"/>
                  <span className="text-sm font-medium mr-2">Artist:</span>
                  <Skeleton className="h-4 w-32"/>
                </div>
              ) : null}
            </div>

            {/* Description with skeleton loading */}
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Description</h3>
              <div className="text-sm text-muted-foreground">
                {manga?.description ? (
                  <p className="whitespace-pre-line">{manga.description}</p>
                ) : manga.source !== 'local' && detailsLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="w-full h-4"/>
                    <Skeleton className="w-full h-4"/>
                    <Skeleton className="w-3/4 h-4"/>
                  </div>
                ) : (
                  <p>No description available.</p>
                )}
              </div>
            </div>
          </div>

          {/* Chapters section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Chapters</h3>
              {manga.source !== 'local' && (
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSort}
                  >
                    <SortAsc className="h-4 w-4 mr-2"/>
                    {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </Button>

                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4"/>
                  </Button>
                </div>
              )}
            </div>

            {/* Chapter list */}
            {chaptersLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="flex items-center justify-between p-3 rounded-md border"
                  >
                    <div className="flex-1">
                      <Skeleton className="w-3/4 h-5 mb-2"/>
                      <Skeleton className="w-1/4 h-3"/>
                    </div>
                    <Skeleton className="w-8 h-8 rounded-md"/>
                  </div>
                ))}
              </div>
            ) : chaptersError ? (
              <div
                className="flex flex-col items-center justify-center p-8 rounded-md border border-destructive/20 bg-destructive/5 text-center">
                <AlertCircle className="h-8 w-8 text-destructive mb-2"/>
                <p className="text-destructive">{chaptersError}</p>
              </div>
            ) : chapters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border rounded-md p-4">
                <p>No chapters available.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-3 rounded-md border hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleReadChapter(chapter)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        {chapter.volume ? `Vol. ${chapter.volume} ` : ''}
                        {chapter.number && !chapter.isLocal ? `Ch. ${chapter.number}` : ''}
                        {chapter.title && !chapter.title.includes(`Chapter ${chapter.number}`) &&
                          (chapter.isLocal ? chapter.title : ` - ${chapter.title}`)}
                      </div>
                      {chapter.publishedAt && (
                        <div className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1"/>
                          {chapter.publishedAt}
                        </div>
                      )}
                    </div>
                    <Button size="sm" variant="ghost">
                      <BookOpen className="h-4 w-4"/>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaDetails;