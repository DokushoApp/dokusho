import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAtomValue } from 'jotai';
import { extensionsAtom, selectedExtensionAtom } from '@/store/extensions';
import { showNsfwAtom } from '@/store/settings';
import { nanoid } from 'nanoid';

/**
 * Custom hook for fetching manga from selected extension
 *
 * @param {string} query - Search query
 * @param {string} endpoint - API endpoint to use (search, manga_details, etc.)
 * @param {Object} customParams - Additional parameters to pass to the API
 * @returns {Object} - { data, loading, error, retry, totalItems }
 */
const useFetchManga = (query = '', endpoint = 'search', customParams = {}) => {
  const extensions = useAtomValue(extensionsAtom);
  const selectedExtensionId = useAtomValue(selectedExtensionAtom);
  const showNsfw = useAtomValue(showNsfwAtom);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchCounter, setFetchCounter] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Track previous values to prevent unnecessary re-fetches
  const prevQueryRef = useRef(query);
  const prevExtensionIdRef = useRef(selectedExtensionId);
  const prevShowNsfwRef = useRef(showNsfw);
  const prevParamsRef = useRef(JSON.stringify(customParams));

  // Process API response based on extension and endpoint
  const processResponse = useCallback((responseData, extension, endpointName) => {
    if (!responseData) return { items: [], total: 0 };

    let processedItems = [];
    let total = 0;

    // Extract total count for pagination
    if (responseData.total !== undefined) {
      total = responseData.total;
    } else if (responseData.limit !== undefined && responseData.offset !== undefined) {
      total = Math.max(responseData.offset + (responseData.data?.length || 0), total);
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      processedItems = responseData.data.map(item => {

        // Create ID - use mangaId if it exists, otherwise generate one
        const id = item.id ? item.id : nanoid();

        // Process title
        let title = 'Unknown';
        if (item.attributes?.title) {
          if (typeof item.attributes.title === 'string') {
            title = item.attributes.title;
          } else {
            title = item.attributes.title.en ||
              Object.values(item.attributes.title)[0] ||
              'Unknown';
          }
        } else if (item.title) {
          title = item.title;
        }

        // Process cover image
        let cover = '';

        // Handle MangaDex cover art relationships
        if (item.relationships && Array.isArray(item.relationships)) {
          const coverRel = item.relationships.find(rel => rel.type === 'cover_art');
          if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
            if (extension.api?.cover_art && extension.api.cover_art.url) {
              cover = extension.api.cover_art.url
                .replace('{id}', item.id)
                .replace('{filename}', coverRel.attributes.fileName)
                .replace('{size}', '512');
            }
          }
        }

        // Use direct cover if available
        if (!cover && item.cover) {
          cover = item.cover;
        }

        const description = item.attributes?.description?.en ||
          (item.attributes?.description ? Object.values(item.attributes.description)[0] : '') ||
          item.description || '';


        return {
          id, // Use source ID directly when available
          title,
          path: '',
          category: '',
          source_id: extension.id || 'local',
          lastRead: null,
          cover,
          description: description,
          createdAt: new Date().toISOString(),
          originalData: item
        };
      });
    }

    return { items: processedItems, total };
  }, []);

  // Function to retry the fetch
  const retry = useCallback(() => {
    setFetchCounter(prev => prev + 1);
  }, []);

  // Fetch manga data
  useEffect(() => {
    // Stringify customParams for comparison
    const paramsString = JSON.stringify(customParams);

    // Skip if no extension selected
    const selectedExtension = Array.isArray(extensions)
      ? extensions.find(ext => ext.id === selectedExtensionId)
      : null;

    if (!selectedExtension || !selectedExtension.api || !selectedExtension.api[endpoint]) {
      setData([]);
      setTotalItems(0);
      return;
    }

    // Update refs for the next comparison
    prevQueryRef.current = query;
    prevExtensionIdRef.current = selectedExtensionId;
    prevShowNsfwRef.current = showNsfw;
    prevParamsRef.current = paramsString;

    // Create an abort controller to cancel the request if the component unmounts
    const controller = new AbortController();

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiEndpoint = selectedExtension.api[endpoint];
        const { url, method, headers = {}, params = {} } = apiEndpoint;

        // Prepare request parameters
        const requestParams = { ...params, ...customParams };

        // Replace any placeholders in the params
        for (const key in requestParams) {
          if (typeof requestParams[key] === 'string') {
            requestParams[key] = requestParams[key].replace('{query}', query);
          }
        }

        // Make API request
        const { data: responseData } = await axios({
          method: method || 'GET',
          url,
          headers,
          params: requestParams,
          timeout: 15000,
          signal: controller.signal
        });

        // Process response data
        const { items: processedData, total } = processResponse(responseData, selectedExtension, endpoint);

        // Filter NSFW content if necessary
        const filteredData = !showNsfw
          ? processedData.filter(item => !item.contentRating || item.contentRating !== 'pornographic')
          : processedData;

        // Set total items count for pagination
        setTotalItems(total);
        setData(filteredData);
      } catch (err) {
        // Don't set error if request was aborted
        if (err.name === 'AbortError' || err.name === 'CanceledError') {
          console.log('Request aborted');
          return;
        }

        console.error("Error fetching manga:", err);
        let errorMessage = 'Failed to fetch manga';

        if (err.response) {
          errorMessage = `API Error (${err.response.status}): ${err.response.data?.error || err.response.data?.message || 'Unknown error'}`;
        } else if (err.request) {
          errorMessage = "Network error: No response from server. Check your internet connection.";
        } else {
          errorMessage = `Error: ${err.message}`;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Cleanup function to abort fetch if component unmounts or dependencies change
    return () => {
      controller.abort();
    };
  }, [
    query,
    endpoint,
    selectedExtensionId,
    showNsfw,
    fetchCounter,
    extensions,
    processResponse,
    JSON.stringify(customParams)
  ]);

  return { data, loading, error, retry, totalItems };
};

export default useFetchManga;