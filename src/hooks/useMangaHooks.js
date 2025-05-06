// src/hooks/useMangaHooks.js
import { useState, useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useNavigate } from "react-router";
import { focusAtom } from "jotai-optics";
import axios from 'axios';
import { nanoid } from 'nanoid';
import { convertFileSrc } from "@tauri-apps/api/core";
import {extensionsAtom} from '@/store/extensions';
import { libraryAtom, saveLibraryAtom } from "@/store/library";
import { settingsAtom } from "@/store/settings";

// Focus atoms for specific parts of the state
const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
const mangaListAtom = focusAtom(libraryAtom, optic => optic.prop("manga"));

/**
 * Hook to fetch manga details
 * @param {Object} manga - Manga object
 * @returns {Object} - { data, error, loading }
 */
export const useFetchMangaDetails = (manga) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const extensions = useAtomValue(extensionsAtom);

  useEffect(() => {
    // Skip if manga is not provided or already has details
    if (!manga || manga.details) {
      setData(manga?.details || null);
      setLoading(false);
      return;
    }

    // Skip if manga is local (no details to fetch)
    if (manga.source === 'local') {
      setLoading(false);
      return;
    }

    async function fetchMangaDetails() {
      setLoading(true);
      setError(null);

      try {
        // Find the extension for this manga
        const extension = extensions.find(ext => ext.id === manga.source || ext.name?.toLowerCase() === manga.source);

        if (!extension || !extension.api || !extension.api.manga_details) {
          throw new Error(`No API configuration found for source: ${manga.source}`);
        }

        const endpoint = extension.api.manga_details;
        const url = endpoint.url.replace('{mangaId}', manga.id);

        // Make request
        const { data: response } = await axios({
          method: endpoint.method || 'GET',
          url: url,
          params: endpoint.params || {},
          headers: endpoint.headers || {},
          timeout: 15000
        });

        // Extract and normalize details
        const normalizedDetails = normalizeDetails(response, extension);
        setData(normalizedDetails);
      } catch (e) {
        console.error('Error fetching manga details:', e);
        setError(e.message || 'Failed to fetch manga details');
      } finally {
        setLoading(false);
      }
    }

    fetchMangaDetails();
  }, [manga, extensions]);

  return { data, error, loading };
};

/**
 * Hook to fetch manga chapters
 * @param {Object} manga - Manga object
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {Object} - { chapters, error, loading }
 */
export const useFetchMangaChapters = (manga, sortOrder = 'desc') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chapters, setChapters] = useState([]);
  const extensions = useAtomValue(extensionsAtom);

  useEffect(() => {
    // Skip if manga is not provided
    if (!manga) {
      setLoading(false);
      return;
    }

    // For local manga, create a single chapter entry
    if (manga.source === 'local') {
      setChapters([{
        id: 'local-chapter',
        title: 'Read',
        number: '1',
        isLocal: true,
        path: manga.path
      }]);
      setLoading(false);
      return;
    }

    async function fetchChapters() {
      setLoading(true);
      setError(null);

      try {
        // Find the extension for this manga
        const extension = extensions.find(ext => ext.id === manga.source || ext.name?.toLowerCase() === manga.source);

        if (!extension || !extension.api || !extension.api.chapter_list) {
          throw new Error(`No API configuration found for source: ${manga.source}`);
        }

        const endpoint = extension.api.chapter_list;
        const url = endpoint.url.replace('{mangaId}', manga.id);

        // Make request
        const { data: response } = await axios({
          method: endpoint.method || 'GET',
          url: url,
          params: {
            ...(endpoint.params || {}),
            order: sortOrder === 'asc' ? { chapter: 'asc' } : { chapter: 'desc' }
          },
          headers: endpoint.headers || {},
          timeout: 15000
        });

        // Process chapter data
        const formattedChapters = normalizeChapters(response, extension, manga.id);

        // Sort chapters
        setChapters(formattedChapters);
      } catch (e) {
        console.error('Error fetching chapters:', e);
        setError(e.message || 'Failed to fetch chapters');
        setChapters([]);
      } finally {
        setLoading(false);
      }
    }

    fetchChapters();
  }, [manga, extensions, sortOrder]);

  return { chapters, error, loading };
};

/**
 * Hook to get cover image URL
 * @param {Object} manga - Manga object
 * @returns {string} - Cover image URL
 */
export const useMangaCoverImage = (manga) => {
  const [coverUrl, setCoverUrl] = useState(null);
  const extensions = useAtomValue(extensionsAtom);

  useEffect(() => {
    if (!manga) {
      setCoverUrl('https://placehold.co/400x600?text=No+Cover');
      return;
    }

    // For local manga, use Tauri's asset protocol
    if (manga.source === 'local' && manga.cover) {
      try {
        setCoverUrl(convertFileSrc(manga.cover));
      } catch (err) {
        console.error('Error converting local file source:', err);
        setCoverUrl(manga.cover);
      }
      return;
    }

    // Find the extension for this manga
    const extension = extensions.find(ext => ext.id === manga.source || ext.name?.toLowerCase() === manga.source);

    console.log(extension);
    if (extension?.api?.cover_art) {
      // Use the extension's cover URL template
      console.log({manga})
      const coverTemplate = extension.api.cover_art.url;
      console.log('template:', coverTemplate);
      const url = coverTemplate
        .replace('{id}', manga.id)
        .replace('{filename}', manga.coverFileName || '')
        .replace('{size}', '512');
      console.log('url:', url);

      setCoverUrl(url);
    } else if (manga.cover) {
      // If there's a cover with a path
      setCoverUrl(manga.cover);
    } else {
      // Default placeholder
      setCoverUrl('https://placehold.co/400x600?text=No+Cover');
    }
  }, [manga, extensions]);

  return coverUrl;
};

/**
 * Hook that provides all the functionality needed for a manga card
 * @param {Object} manga - The manga object
 * @returns {Object} - Functions and data for the manga card
 */
export const useMangaCard = (manga) => {
  const navigate = useNavigate();
  const categories = useAtomValue(categoriesAtom);
  const [mangaList, setMangaList] = useAtom(mangaListAtom);
  const [, saveLibrary] = useAtom(saveLibraryAtom);
  const extensions = useAtomValue(extensionsAtom);
  const coverImageUrl = useMangaCoverImage(manga);

  // Check if manga is already in library
  const isInLibrary = mangaList.some(m =>
    (m.sourceId === manga.id && m.source === manga.source) ||
    (m.title === manga.title && m.source === manga.source)
  );

  // Navigate to manga details page
  const handleViewDetails = () => {
    navigate('/manga', { state: { manga } });
  };

  // Navigate directly to reader
  const handleReadNow = () => {
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
        cover: manga.cover || '',
        coverUrl: manga.coverUrl || '',
        coverFileName: manga.coverFileName || '',
        source: manga.source,
        category: categoryId,
        progress: 0,
        lastRead: null,
        path: manga.path || '',
        sourceId: manga.id,
        addedAt: new Date().toISOString()
      };

      setMangaList([...mangaList, newManga]);
    }

    // Save to storage
    setTimeout(() => saveLibrary(), 0);
  };

  // Open external link if available
  const handleOpenExternal = () => {
    // Find the extension
    const extension = extensions.find(ext =>
      ext.id === manga.source || ext.name?.toLowerCase() === manga.source
    );

    // Get external URL
    let externalUrl = manga.externalUrl;

    // If manga doesn't have an external URL but extension has a template
    if (!externalUrl && extension?.api?.external_url_template) {
      externalUrl = extension.api.external_url_template.replace('{mangaId}', manga.id);
    }

    // Use source-specific default if no template exists
    if (!externalUrl && manga.id) {
      if (manga.source === 'mangadex') {
        externalUrl = `https://mangadex.org/title/${manga.id}`;
      }
    }

    // Open the URL if available
    if (externalUrl) {
      window.open(externalUrl, '_blank');
    }
  };

  return {
    coverImageUrl,
    categories,
    isInLibrary,
    handleViewDetails,
    handleReadNow,
    addToLibrary,
    handleOpenExternal
  };
};

// Helper functions for normalizing data from different sources

/**
 * Normalize manga details from different sources
 * @param {Object} data - Raw API response
 * @param {Object} extension - Extension object
 * @returns {Object} - Normalized manga details
 */
function normalizeDetails(data, extension) {
  if (!data) return null;

  let result = {
    status: null,
    demographic: null,
    authors: [],
    artists: [],
    tags: [],
    description: null
  };

  // MangaDex specific normalization
  if (extension.id === 'mangadex') {
    // Handle MangaDex-specific response format
    if (data.data?.attributes) {
      const attr = data.data.attributes;

      // Status
      result.status = attr.status || null;

      // Demographic
      result.demographic = attr.publicationDemographic || null;

      // Description
      if (attr.description) {
        // Prefer English or first available language
        result.description = attr.description.en || Object.values(attr.description)[0] || null;
      }

      // Tags
      if (attr.tags && Array.isArray(attr.tags)) {
        result.tags = attr.tags
          .filter(tag => tag.attributes?.name?.en)
          .map(tag => tag.attributes.name.en);
      }

      // Process relationships for authors/artists
      if (data.data.relationships && Array.isArray(data.data.relationships)) {
        // Extract authors
        result.authors = data.data.relationships
          .filter(rel => rel.type === 'author' && rel.attributes?.name)
          .map(author => author.attributes.name);

        // Extract artists
        result.artists = data.data.relationships
          .filter(rel => rel.type === 'artist' && rel.attributes?.name)
          .map(artist => artist.attributes.name);
      }
    }
  } else {
    // Generic normalization for other sources
    // Implement based on your extension API response formats
    result.status = data.status || null;
    result.demographic = data.demographic || null;
    result.authors = Array.isArray(data.authors) ? data.authors : [];
    result.artists = Array.isArray(data.artists) ? data.artists : [];
    result.tags = Array.isArray(data.tags) ? data.tags : [];
    result.description = data.description || null;
  }

  return result;
}

/**
 * Normalize chapter data from different sources
 * @param {Object} data - Raw API response
 * @param {Object} extension - Extension object
 * @param {string} mangaId - Manga ID
 * @returns {Array} - Normalized chapter array
 */
function normalizeChapters(data, extension, mangaId) {
  if (!data) return [];

  let chapters = [];

  // MangaDex specific normalization
  if (extension.id === 'mangadex') {
    if (data.data && Array.isArray(data.data)) {
      chapters = data.data.map(item => {
        const attr = item.attributes || {};

        return {
          id: item.id,
          title: attr.title || `Chapter ${attr.chapter || '?'}`,
          volume: attr.volume || null,
          number: attr.chapter || null,
          publishedAt: attr.publishAt ? new Date(attr.publishAt).toLocaleDateString() : null,
          language: attr.translatedLanguage || null,
          mangaId: mangaId,
          pages: attr.pages || 0,
          isLocal: false
        };
      });
    }
  } else {
    // Generic normalization for other sources
    // Implement based on your extension API response formats
    // This is just a placeholder - modify according to your actual data structure
    if (Array.isArray(data)) {
      chapters = data.map(item => ({
        id: item.id || nanoid(),
        title: item.title || `Chapter ${item.number || '?'}`,
        volume: item.volume || null,
        number: item.number || null,
        publishedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : null,
        language: item.language || null,
        mangaId: mangaId,
        pages: item.pages || 0,
        isLocal: false
      }));
    } else if (data.chapters && Array.isArray(data.chapters)) {
      chapters = data.chapters.map(item => ({
        id: item.id || nanoid(),
        title: item.title || `Chapter ${item.number || '?'}`,
        volume: item.volume || null,
        number: item.number || null,
        publishedAt: item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : null,
        language: item.language || null,
        mangaId: mangaId,
        pages: item.pages || 0,
        isLocal: false
      }));
    }
  }

  return chapters;
}

/**
 * Sort chapters based on order
 * @param {Array} chapters - Array of chapter objects
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} - Sorted chapter array
 */
function sortChapters(chapters, order = 'desc') {
  return [...chapters].sort((a, b) => {
    // First sort by volume if available
    const volumeA = a.volume ? parseFloat(a.volume) : 0;
    const volumeB = b.volume ? parseFloat(b.volume) : 0;

    if (volumeA !== volumeB) {
      return order === 'asc' ? volumeA - volumeB : volumeB - volumeA;
    }

    // Then sort by chapter number
    const chapterA = a.number ? parseFloat(a.number) : 0;
    const chapterB = b.number ? parseFloat(b.number) : 0;

    if (chapterA !== chapterB) {
      return order === 'asc' ? chapterA - chapterB : chapterB - chapterA;
    }

    // Finally sort by published date if available
    if (a.publishedAt && b.publishedAt) {
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return order === 'asc' ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });
}