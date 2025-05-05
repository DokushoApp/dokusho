import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAtom } from 'jotai';
import { extensionsAtom, selectedExtensionAtom, loadExtensionsAtom } from '@/store/extensions';
import { showNsfwAtom } from '@/store/settings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Filter,
  Bookmark,
  Clock,
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import ExtensionSelector from '@/components/browse/ExtensionSelector';
import ExtensionEmptyState from '@/components/browse/ExtensionEmptyState';
import MangaCard from '@/components/browse/MangaCard';
import { useDebounce } from '@/hooks/useDebounce';

function Browse() {
  const navigate = useNavigate();

  // Get atoms with safe defaults
  const [extensions = [], setExtensions] = useAtom(extensionsAtom);
  const [selectedExtension, setSelectedExtension] = useAtom(selectedExtensionAtom);
  const [showNsfw = false] = useAtom(showNsfwAtom);
  const [, loadExtensions] = useAtom(loadExtensionsAtom);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('popular');
  const [isLoading, setIsLoading] = useState(false);
  const [manga, setManga] = useState([]);
  const [error, setError] = useState(null);

  // Ensure extensions is treated as an array
  const extensionList = Array.isArray(extensions) ? extensions : [];

  // Debounce search input to avoid excessive API calls
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Load extensions if not already loaded
  useEffect(() => {
    const loadExtensionsData = async () => {
      try {
        if (extensionList.length === 0 && typeof loadExtensions === 'function') {
          await loadExtensions();
        }
      } catch (err) {
        console.error("Error loading extensions:", err);
      }
    };

    loadExtensionsData();
  }, [extensionList.length, loadExtensions]);

  // Select first extension as default if available
  useEffect(() => {
    if (!selectedExtension && extensionList.length > 0) {
      setSelectedExtension(extensionList[0].id);
    }
  }, [extensionList, selectedExtension, setSelectedExtension]);

  // Fetch manga data when search term, tab, or selected extension changes
  useEffect(() => {
    if (!selectedExtension) return;

    const fetchManga = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Find the selected extension
        const extension = extensionList.find(ext => ext.id === selectedExtension);
        if (!extension) {
          setManga([]);
          setIsLoading(false);
          return;
        }

        // Skip empty searches to avoid unnecessary API calls
        if (currentTab === 'search' && !debouncedSearch) {
          setManga([]);
          setIsLoading(false);
          return;
        }

        // Safely access API endpoints
        if (!extension.api || !extension.api.search) {
          setError("Extension API configuration is invalid");
          setIsLoading(false);
          return;
        }

        // Determine API endpoint and parameters based on current tab
        const endpoint = extension.api.search;

        // Create parameters object starting from endpoint defaults
        const params = {...(endpoint.params || {})};

        // Set content rating filter based on settings
        if (extension.id === 'mangadex') {
          // MangaDex specific content rating filter
          params.contentRating = showNsfw
            ? ['safe', 'suggestive', 'erotica', 'pornographic']
            : ['safe', 'suggestive', 'erotica'];

          // Add includes for cover art to avoid additional requests
          params.includes = ['cover_art'];
        }

        // Handle different tabs
        if (currentTab === 'search' && debouncedSearch) {
          // For search, add the query parameter
          if (extension.id === 'mangadex') {
            params.title = debouncedSearch;
          } else {
            params.title = debouncedSearch;
          }
        } else if (currentTab === 'latest') {
          // For latest, add orderBy with updatedAt:desc
          if (extension.id === 'mangadex') {
            params.order = { updatedAt: 'desc' };
          } else {
            params.order = { updatedAt: 'desc' };
          }
        } else if (currentTab === 'trending') {
          // For trending, order by popularity
          if (extension.id === 'mangadex') {
            params.order = { followedCount: 'desc' };
          } else {
            params.order = { popularity: 'desc' };
          }
        } else if (currentTab === 'popular') {
          // For popular, default ordering
          if (extension.id === 'mangadex') {
            params.order = { followedCount: 'desc' };
          } else {
            params.order = { popularity: 'desc' };
          }
        }

        console.log(`Fetching from ${endpoint.url} with params:`, params);

        // Make API request with error handling
        const { data } = await axios({
          method: endpoint.method || 'GET',
          url: endpoint.url,
          headers: endpoint.headers || {},
          params,
          timeout: 15000
        });

        // Process response based on extension
        let processedManga;
        if (extension.id === 'mangadex') {
          processedManga = processMangaDexResponse(data);
        } else {
          processedManga = processGenericResponse(data, endpoint.response_type || 'json', extension.id);
        }

        // Filter NSFW content if necessary
        const filteredManga = !showNsfw
          ? processedManga.filter(item => !item.contentRating || item.contentRating !== 'pornographic')
          : processedManga;

        setManga(filteredManga);
      } catch (err) {
        console.error("Error fetching manga:", err);

        // More detailed error information
        if (err.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log("Response error:", err.response.status, err.response.data);

          // Check for specific API error messages
          const errorMessage = err.response.data?.error || err.response.data?.message || 'Unknown error';
          setError(`API Error (${err.response.status}): ${errorMessage}`);
        } else if (err.request) {
          // The request was made but no response was received
          setError("Network error: No response from server. Check your internet connection.");
        } else {
          // Something happened in setting up the request that triggered an Error
          setError(`Error: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchManga();
  }, [selectedExtension, currentTab, debouncedSearch, extensionList, showNsfw]);

  // Process MangaDex API response specifically
  const processMangaDexResponse = (data) => {
    if (!data || !data.data || !Array.isArray(data.data)) {
      return [];
    }

    return data.data.map(item => {
      // Extract title
      let title = 'Unknown';
      if (item.attributes?.title) {
        // Get English title, or first available title
        title = item.attributes.title.en || Object.values(item.attributes.title)[0] || 'Unknown';
      }

      // Extract cover art information
      let coverFileName = '';
      if (item.relationships && Array.isArray(item.relationships)) {
        const coverRel = item.relationships.find(rel => rel.type === 'cover_art');
        if (coverRel && coverRel.attributes && coverRel.attributes.fileName) {
          coverFileName = coverRel.attributes.fileName;
        }
      }

      // Extract content rating
      const contentRating = item.attributes?.contentRating || 'safe';

      return {
        id: item.id,
        mangaId: item.id, // Store manga ID for cover URL construction
        title,
        coverFileName,
        contentRating,
        source: 'mangadex',
        relationships: item.relationships,
        // Store original data for detail view
        originalData: item
      };
    });
  };

  // Process generic API response format
  const processGenericResponse = (data, responseType, sourceId) => {
    if (!data || responseType !== 'json') {
      return [];
    }

    // Handle array format
    if (Array.isArray(data)) {
      return data.map(item => ({
        id: item.id || Math.random().toString(),
        title: item.title || 'Unknown',
        cover: item.cover || '',
        coverUrl: item.coverUrl || item.cover_url || '',
        source: sourceId,
        contentRating: item.contentRating || 'safe',
        originalData: item
      }));
    }

    // Handle results format
    if (data.results && Array.isArray(data.results)) {
      return data.results.map(item => ({
        id: item.id || Math.random().toString(),
        title: item.title || 'Unknown',
        cover: item.cover || '',
        coverUrl: item.coverUrl || item.cover_url || '',
        source: sourceId,
        contentRating: item.contentRating || 'safe',
        originalData: item
      }));
    }

    return [];
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value && currentTab !== 'search') {
      setCurrentTab('search');
    }
  };

  const handleRetry = () => {
    setError(null);
    // The useEffect will automatically trigger a re-fetch
  };

  const handleMangaSelect = (manga) => {
    // Navigate to Manga detail screen instead of directly to reader
    navigate('/manga', { state: { manga } });
  };

  // If no extensions are installed, show empty state
  if (extensionList.length === 0) {
    return <ExtensionEmptyState />;
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Search and filters section */}
      <div className="flex flex-row gap-4 p-4 border-b">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search manga..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 w-full"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          title="Filter"
        >
          <Filter className="h-4 w-4" />
        </Button>
        <div>
          <ExtensionSelector />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto no-scrollbar p-4">
        {renderContent()}
      </div>
    </div>
  );

  // Helper function to render the appropriate content
  function renderContent() {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center p-4">
          <AlertCircle className="h-10 w-10 text-destructive mb-4" />
          <p className="text-destructive font-medium mb-2">Error</p>
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={handleRetry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (manga.length === 0) {
      // Show different message for search vs. browsing
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <p className="text-muted-foreground">
            {currentTab === 'search' && debouncedSearch
              ? `No results found for "${debouncedSearch}"`
              : currentTab === 'search'
                ? 'Enter a search term to find manga'
                : 'No manga found'}
          </p>
        </div>
      );
    }

    // Render manga grid
    return (
      <div className="flex flex-wrap justify-around gap-2">
        {manga.map((item) => (
          <MangaCard
            key={item.id}
            manga={item}
            onClick={() => handleMangaSelect(item)}
          />
        ))}
      </div>
    );
  }
}

export default Browse;