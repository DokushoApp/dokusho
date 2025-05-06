// src/hooks/useMangaSearch.js
import { useState, useCallback } from 'react';
import { useAtomValue } from 'jotai';
import axios from 'axios';
import { nanoid } from 'nanoid';
import { extensionsAtom } from '@/store/extensions';

/**
 * Custom hook for searching manga from extensions
 * @param {string} extensionId - ID of the currently selected extension
 * @param {boolean} showNsfw - Whether to include NSFW content
 * @returns {Object} - Search state and functions
 */
export const useMangaSearch = (extensionId, showNsfw = false) => {
  const [manga, setManga] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSearchParams, setLastSearchParams] = useState(null);

  const extensions = useAtomValue(extensionsAtom);

  /**
   * Search for manga based on provided parameters
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query text
   * @param {string} params.type - Type of search (popular, latest, trending, search)
   */
  const searchManga = useCallback(async (params) => {
    if (!extensionId) return;

    setIsLoading(true);
    setError(null);
    setLastSearchParams(params);

    try {
      // Find the selected extension
      const extension = extensions.find(ext => ext.id === extensionId);
      if (!extension) {
        throw new Error("Selected extension not found");
      }

      // Safely access API endpoints
      if (!extension.api || !extension.api.search) {
        throw new Error("Extension API configuration is invalid");
      }

      // Determine API endpoint based on extension
      const endpoint = extension.api.search;

      // Create parameters object starting from endpoint defaults
      const apiParams = { ...(endpoint.params || {}) };

      // Handle different search types
      const { query, type } = params;

      if (type === 'search' && query) {
        // For search, add the query parameter using the extension's search field name
        apiParams[extension.searchField || 'title'] = query;
      } else if (type === 'latest') {
        // For latest manga
        apiParams.order = extension.orderFields?.latest || { updatedAt: 'desc' };
      } else if (type === 'trending') {
        // For trending manga
        apiParams.order = extension.orderFields?.trending || { popularity: 'desc' };
      } else if (type === 'popular') {
        // For popular manga
        apiParams.order = extension.orderFields?.popular || { followedCount: 'desc' };
      }

      // Make API request
      const { data } = await axios({
        method: endpoint.method || 'GET',
        url: endpoint.url,
        headers: endpoint.headers || {},
        params: apiParams,
        timeout: 15000
      });

      // Process the response generically
      const processedManga = processResponse(data, extension);

      // Filter NSFW content if necessary and if content rating info is available
      const filteredManga = !showNsfw
        ? processedManga.filter(item => !item.contentRating || item.contentRating !== 'pornographic')
        : processedManga;

      setManga(filteredManga);
    } catch (err) {
      console.error("Error fetching manga:", err);

      // Format error message based on error type
      if (err.response) {
        const errorMessage = err.response.data?.error || err.response.data?.message || 'Unknown error';
        setError(`API Error (${err.response.status}): ${errorMessage}`);
      } else if (err.request) {
        setError("Network error: No response from server. Check your internet connection.");
      } else {
        setError(`Error: ${err.message}`);
      }

      setManga([]);
    } finally {
      setIsLoading(false);
    }
  }, [extensionId, extensions, showNsfw]);

  /**
   * Retry the last search
   */
  const retry = useCallback(() => {
    if (lastSearchParams) {
      searchManga(lastSearchParams);
    }
  }, [lastSearchParams, searchManga]);

  return {
    manga,
    isLoading,
    error,
    searchManga,
    retry
  };
};

/**
 * Generic processing of API responses from any extension
 * @param {Object} data - Response data from the API
 * @param {Object} extension - Extension configuration
 * @returns {Array} - Normalized manga array
 */
function processResponse(data, extension) {
  if (!data) {
    return [];
  }

  // Determine the correct data array based on extension's response structure
  let items = [];

  // Handler for various common response formats
  if (extension.responseFormat?.path) {
    // Access data using the path provided by the extension
    const pathSegments = extension.responseFormat.path.split('.');
    let current = data;

    // Navigate through the path segments
    for (const segment of pathSegments) {
      if (current && current[segment]) {
        current = current[segment];
      } else {
        current = null;
        break;
      }
    }

    items = Array.isArray(current) ? current : [];
  } else if (Array.isArray(data)) {
    // Direct array format
    items = data;
  } else if (data.results && Array.isArray(data.results)) {
    // Results property format
    items = data.results;
  } else if (data.data && Array.isArray(data.data)) {
    // Data property format (common in many APIs)
    items = data.data;
  } else {
    // Try to find any array in the response
    for (const key in data) {
      if (Array.isArray(data[key]) && data[key].length > 0) {
        items = data[key];
        break;
      }
    }
  }

  // Process each item using the extension's field mappings or fallback to defaults
  return items.map(item => {
    const mapping = extension.fieldMapping || {};

    // Extract title using the extension's mapping or common fallbacks
    const titleField = mapping.title || 'title';
    let title = getNestedValue(item, titleField) || 'Unknown';

    // Handle localized titles (common in many APIs)
    if (typeof title === 'object') {
      // Check for the extension's preferred language or fallback to 'en' or first available
      const prefLang = extension.preferredLanguage || 'en';
      title = title[prefLang] || Object.values(title)[0] || 'Unknown';
    }

    // Extract ID
    const idField = mapping.id || 'id';
    const id = getNestedValue(item, idField) || nanoid();

    // Extract cover image information
    const coverField = mapping.cover || 'cover';
    const coverUrlField = mapping.coverUrl || 'coverUrl';
    const cover = getNestedValue(item, coverField) || '';
    const coverUrl = getNestedValue(item, coverUrlField) || '';

    // Extract content rating if available
    const contentRatingField = mapping.contentRating || 'contentRating';
    const contentRating = getNestedValue(item, contentRatingField) || 'safe';

    // Build relationships if the extension supports them
    let relationships = [];
    if (mapping.relationships && item[mapping.relationships]) {
      relationships = item[mapping.relationships];
    }

    // Cover file name (useful for some APIs that separate cover file names)
    let coverFileName = '';
    if (mapping.coverFileName) {
      coverFileName = getNestedValue(item, mapping.coverFileName) || '';
    } else if (relationships && Array.isArray(relationships)) {
      // Try to extract from relationships if available
      const coverRel = relationships.find(rel =>
        rel.type === 'cover_art' || rel.type === 'cover' || rel.role === 'cover'
      );

      if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
        coverFileName = coverRel.attributes.fileName;
      }
    }

    // If extension provides a cover URL builder function, use it
    let finalCoverUrl = coverUrl || cover;
    if (extension.buildCoverUrl && (id || coverFileName)) {
      try {
        finalCoverUrl = extension.buildCoverUrl(id, coverFileName);
      } catch (e) {
        console.error('Error building cover URL:', e);
      }
    }

    return {
      id,
      title,
      cover,
      coverUrl: finalCoverUrl,
      coverFileName,
      contentRating,
      source: extension.id,
      sourceName: extension.name || extension.id,
      relationships,
      originalData: item // Keep the original data for reference
    };
  });
}

/**
 * Helper function to get a value from a nested object path
 * @param {Object} obj - The object to extract from
 * @param {string} path - The path to the value (e.g. 'attributes.title')
 * @returns {*} - The extracted value or undefined
 */
function getNestedValue(obj, path) {
  if (!obj || !path) return undefined;

  // Handle direct property access
  if (typeof path === 'string' && !path.includes('.')) {
    return obj[path];
  }

  // Handle nested path
  const parts = typeof path === 'string' ? path.split('.') : path;
  let current = obj;

  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }

  return current;
}