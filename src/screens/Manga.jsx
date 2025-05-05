import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useAtom, useAtomValue } from 'jotai';
import { focusAtom } from 'jotai-optics';
import { convertFileSrc } from "@tauri-apps/api/core";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  ExternalLink,
  Filter,
  Layers,
  Library,
  Plus,
  SortAsc,
  Star,
  Tags,
  User
} from 'lucide-react';
import axios from 'axios';

// Import UI components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card';

// Import store state
import { libraryAtom, saveLibraryAtom } from '@/store/library';
import { settingsAtom } from '@/store/settings';
import { nanoid } from 'nanoid';

// Focus atoms for specific parts of the state
const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop('categories'));
const mangaListAtom = focusAtom(libraryAtom, optic => optic.prop('manga'));

const Manga = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const manga = location.state?.manga;

  // State
  const [chapters, setChapters] = useState([]);
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [additionalDetails, setAdditionalDetails] = useState(null);

  // Atoms
  const categories = useAtomValue(categoriesAtom);
  const [mangaList, setMangaList] = useAtom(mangaListAtom);
  const [, saveLibrary] = useAtom(saveLibraryAtom);

  // Check if manga is in library
  const isInLibrary = mangaList.some(m =>
    (m.sourceId === manga?.id && m.source === manga?.source) ||
    (m.title === manga?.title && m.source === manga?.source)
  );

  useEffect(() => {
    // Guard against no manga data
    if (!manga) {
      navigate('/');
      return;
    }

    // Load chapters and additional details
    if (manga.source === 'local') {
      // For local manga, just create a placeholder chapter
      setChapters([{
        id: 'chapter-0',
        title: 'Chapter 0',
        number: '0',
        isLocal: true,
        path: manga.path,
        mangaPath: manga.path // Add the manga path for direct access
      }]);
    } else {
      // For extension manga, fetch chapters
      fetchChapters();
      // Fetch additional manga details if needed
      fetchMangaDetails();
    }
  }, [manga]);

  const fetchChapters = async () => {
    if (!manga || !manga.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Handle MangaDex specifically as an example
      if (manga.source === 'mangadex') {
        const { data } = await axios.get(`https://api.mangadex.org/manga/${manga.id}/feed`, {
          params: {
            limit: 100,
            translatedLanguage: ['en'],
            order: { chapter: sortOrder }
          }
        });

        if (data && data.data) {
          const formattedChapters = data.data.map(chapter => ({
            id: chapter.id,
            title: chapter.attributes.title || `Chapter ${chapter.attributes.chapter}`,
            number: chapter.attributes.chapter,
            volume: chapter.attributes.volume,
            publishedAt: new Date(chapter.attributes.publishAt).toLocaleDateString(),
            pages: chapter.attributes.pages,
            source: 'mangadex',
            mangaId: manga.id
          }));

          // Sort chapters if needed
          if (sortOrder === 'asc') {
            formattedChapters.sort((a, b) => {
              const aNum = parseFloat(a.number) || 0;
              const bNum = parseFloat(b.number) || 0;
              return aNum - bNum;
            });
          } else {
            formattedChapters.sort((a, b) => {
              const aNum = parseFloat(a.number) || 0;
              const bNum = parseFloat(b.number) || 0;
              return bNum - aNum;
            });
          }

          setChapters(formattedChapters);
        } else {
          // Handle case when no chapters are returned
          setChapters([]);
        }
      } else if (manga.chapters && Array.isArray(manga.chapters)) {
        // If the manga object already has chapters, use those
        setChapters(manga.chapters);
      } else {
        // Generic handling for other extensions
        // This would need to be implemented based on extension API
        setChapters([
          { id: '1', title: 'Chapter 1', number: '1', source: manga.source },
          { id: '2', title: 'Chapter 2', number: '2', source: manga.source }
        ]);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError('Failed to load chapters. Please try again later.');
      // Set empty chapters array to avoid undefined issues
      setChapters([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMangaDetails = async () => {
    if (!manga || !manga.id) return;

    try {
      // Handle MangaDex as an example
      if (manga.source === 'mangadex') {
        const { data } = await axios.get(`https://api.mangadex.org/manga/${manga.id}`, {
          params: {
            includes: ['author', 'artist', 'cover_art']
          }
        });

        if (data && data.data) {
          setAdditionalDetails({
            description: data.data.attributes.description?.en || 'No description available',
            authors: data.data.relationships
              .filter(rel => rel.type === 'author')
              .map(author => author.attributes?.name || 'Unknown'),
            artists: data.data.relationships
              .filter(rel => rel.type === 'artist')
              .map(artist => artist.attributes?.name || 'Unknown'),
            tags: data.data.attributes.tags
              .map(tag => tag.attributes?.name?.en || 'Unknown Tag'),
            status: data.data.attributes.status,
            demographic: data.data.attributes.publicationDemographic
          });
        }
      } else {
        // Generic handling for other extensions
        // This would depend on the specific extension API
      }
    } catch (err) {
      console.error('Error fetching manga details:', err);
    }
  };

  const handleSort = () => {
    const newOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    setSortOrder(newOrder);

    // Re-sort the chapters
    setChapters(prevChapters =>
      [...prevChapters].sort((a, b) => {
        const aNum = parseFloat(a.number) || 0;
        const bNum = parseFloat(b.number) || 0;
        return newOrder === 'asc' ? aNum - bNum : bNum - aNum;
      })
    );
  };

  const handleReadChapter = (chapter) => {
    if (chapter.isLocal) {
      // Navigate to reader with local manga
      // Make sure we pass both manga and chapter information
      navigate('/reader', {
        state: {
          manga: {
            ...manga,
            path: chapter.mangaPath || manga.path // Ensure the path is available
          },
          chapter
        }
      });
    } else {
      // For extension manga, we'd need to fetch the chapter pages first
      navigate('/reader', {
        state: {
          manga,
          chapter
        }
      });
    }
  };

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
        mangaId: manga.mangaId || manga.id,
        coverFileName: manga.coverFileName || '',
        createdAt: new Date().toISOString()
      };

      setMangaList([...mangaList, newManga]);
    }

    // Save to storage
    setTimeout(() => saveLibrary(), 0);
  };

  // Function to get cover image from different sources
  const getCoverImage = () => {
    // For local manga, use Tauri's asset protocol through convertFileSrc
    if (manga.source === 'local' && manga.cover) {
      try {
        return convertFileSrc(manga.cover);
      } catch (err) {
        console.error('Error converting local file source:', err);
        // Direct path as fallback
        return manga.cover;
      }
    }

    // For MangaDex format
    if (manga.source === 'mangadex') {
      // If we have the manga ID and cover filename directly
      if (manga.mangaId && manga.coverFileName) {
        return `https://uploads.mangadex.org/covers/${manga.mangaId}/${manga.coverFileName}.512.jpg`;
      }

      // If the cover is in relationships array (from MangaDex API)
      if (manga.relationships && Array.isArray(manga.relationships)) {
        const coverRel = manga.relationships.find(rel => rel.type === 'cover_art');
        if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
          return `https://uploads.mangadex.org/covers/${manga.id}/${coverRel.attributes.fileName}.512.jpg`;
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

    // If the manga has a cover path without a URL
    if (manga.cover) {
      // Try to convert from local path if it seems to be one
      if (manga.cover.includes('/') || manga.cover.includes('\\')) {
        try {
          return convertFileSrc(manga.cover);
        } catch (err) {
          // Just use the path if conversion fails
          return manga.cover;
        }
      }
      return manga.cover;
    }

    // If the manga has a base URL and filename
    if (manga.baseUrl && manga.cover) {
      return `${manga.baseUrl}/${manga.cover}`;
    }

    // Default placeholder
    return 'https://placehold.co/400x600?text=No+Cover';
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
    <div className="h-full w-full overflow-auto">
      {/* Mobile header bar */}
      <div className="lg:hidden flex items-center p-4 border-b sticky top-0 bg-background z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold truncate">{manga.title}</h1>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Desktop header - only visible on large screens */}
        <div className="hidden lg:flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mr-4"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{manga.title}</h1>
        </div>

        {/* Manga info section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Cover image */}
          <div className="flex-shrink-0">
            <div className="relative overflow-hidden rounded-lg shadow-md"
                 style={{ width: '280px', maxWidth: '100%' }}>
              <img
                src={getCoverImage()}
                alt={manga.title}
                className="w-full object-cover"
                style={{ aspectRatio: '2/3' }}
                onError={(e) => {
                  e.target.onerror = null;
                  // For MangaDex, try alternative thumbnail sizes before falling back
                  if (manga.source === 'mangadex' && e.target.src.includes('.512.jpg')) {
                    e.target.src = e.target.src.replace('.512.jpg', '.256.jpg');
                  } else if (manga.source === 'mangadex' && e.target.src.includes('.256.jpg')) {
                    // Try original image if both thumbnails fail
                    const id = manga.mangaId || manga.id;
                    const fileName = manga.coverFileName || (manga.relationships?.find(rel => rel.type === 'cover_art')?.attributes?.fileName);
                    if (id && fileName) {
                      e.target.src = `https://uploads.mangadex.org/covers/${id}/${fileName}`;
                    } else {
                      e.target.src = 'https://placehold.co/400x600?text=No+Cover';
                    }
                  } else {
                    // Final fallback
                    e.target.src = 'https://placehold.co/400x600?text=No+Cover';
                  }
                }}
              />

              {/* Source badge */}
              <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded-sm">
                {manga.source === 'mangadex' ? 'MangaDex' : manga.source}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-4 flex flex-col gap-2">
              <Button
                className="w-full"
                onClick={() => handleReadChapter(chapters[0])}
                disabled={chapters.length === 0}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Start Reading
              </Button>

              {isInLibrary ? (
                <Button variant="outline" className="w-full">
                  <Library className="mr-2 h-4 w-4" />
                  In Library
                </Button>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Library
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {categories.map(category => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={() => addToLibrary(category.id)}
                      >
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* External link for MangaDex */}
              {manga.source === 'mangadex' && manga.id && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => window.open(`https://mangadex.org/title/${manga.id}`, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on MangaDex
                </Button>
              )}
            </div>
          </div>

          {/* Details section */}
          <div className="flex-1">
            {/* Metadata */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {manga.source === 'mangadex' && additionalDetails?.status && (
                  <Badge variant="outline" className="capitalize">
                    {additionalDetails.status}
                  </Badge>
                )}

                {manga.source === 'mangadex' && additionalDetails?.demographic && (
                  <Badge variant="secondary" className="capitalize">
                    {additionalDetails.demographic}
                  </Badge>
                )}

                {additionalDetails?.tags && additionalDetails.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}

                {additionalDetails?.tags && additionalDetails.tags.length > 3 && (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Badge variant="outline" className="cursor-pointer">
                        +{additionalDetails.tags.length - 3} more
                      </Badge>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="flex flex-wrap gap-1">
                        {additionalDetails.tags.slice(3).map((tag, index) => (
                          <Badge key={index + 3} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                )}

                {/* Skeleton badges for loading state */}
                {manga.source !== 'local' && !additionalDetails && (
                  <>
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </>
                )}
              </div>

              {/* Author and artist info with skeleton loading */}
              <div className="space-y-2 mb-4">
                {additionalDetails?.authors && additionalDetails.authors.length > 0 ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium mr-2">Author:</span>
                    <span className="text-sm">{additionalDetails.authors.join(', ')}</span>
                  </div>
                ) : manga.source !== 'local' && !additionalDetails ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium mr-2">Author:</span>
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : null}

                {additionalDetails?.artists && additionalDetails.artists.length > 0 ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium mr-2">Artist:</span>
                    <span className="text-sm">{additionalDetails.artists.join(', ')}</span>
                  </div>
                ) : manga.source !== 'local' && !additionalDetails ? (
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium mr-2">Artist:</span>
                    <Skeleton className="h-4 w-32" />
                  </div>
                ) : null}
              </div>

              {/* Description with skeleton loading */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <div className="text-sm text-muted-foreground">
                  {additionalDetails?.description ? (
                    <p className="whitespace-pre-line">{additionalDetails.description}</p>
                  ) : manga.source !== 'local' && !additionalDetails ? (
                    <div className="space-y-2">
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-full h-4" />
                      <Skeleton className="w-3/4 h-4" />
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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSort}
                  >
                    <SortAsc className="h-4 w-4 mr-2" />
                    {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
                  </Button>

                  {/* Filter button - could be expanded for more functionality */}
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Chapter list */}
              {isLoading ? (
                <div className="space-y-2">
                  {/* Generate 5 skeleton items when loading */}
                  {[...Array(5)].map((_, index) => (
                    <div
                      key={`skeleton-${index}`}
                      className="flex items-center justify-between p-3 rounded-md border"
                    >
                      <div className="flex-1">
                        <Skeleton className="w-3/4 h-5 mb-2" />
                        <Skeleton className="w-1/4 h-3" />
                      </div>
                      <Skeleton className="w-8 h-8 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>{error}</p>
                </div>
              ) : chapters.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
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
                          {chapter.number ? `Ch. ${chapter.number}` : 'Chapter 0'}
                          {chapter.title && chapter.title !== `Chapter ${chapter.number}` && ` - ${chapter.title}`}
                        </div>
                        {chapter.publishedAt && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {chapter.publishedAt}
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="ghost">
                        <BookOpen className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Manga;