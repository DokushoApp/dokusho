import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useAtom, useAtomValue } from 'jotai';
import { extensionsAtom, selectedExtensionAtom, loadExtensionsAtom } from '@/store/extensions';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

// Custom Components
import ExtensionSelector from '@/components/browse/ExtensionSelector';
import ExtensionEmptyState from '@/components/browse/ExtensionEmptyState';
import MangaCard from '@/components/browse/MangaCard';

// Custom Hooks
import useFetchManga from '@/hooks/useFetchManga';

/**
 * Browse page component
 * Allows searching and browsing manga from various sources
 */
function Browse() {
  const navigate = useNavigate();

  // Global state
  const [extensions = [], loadExtensions] = useAtom(loadExtensionsAtom);
  const [selectedExtension, setSelectedExtension] = useAtom(selectedExtensionAtom);

  // Local state
  const [searchQuery, setSearchQuery] = useState('');

  // Ensure extensions is treated as an array
  const extensionList = Array.isArray(extensions) ? extensions : [];

  const debouncedSearch = useDebounce(searchQuery, 500);

  // Use custom hook to fetch manga data with stable customParams object
  const customParams = React.useMemo(() => ({}), []);
  const { data: manga, loading, error, retry } = useFetchManga(
    debouncedSearch,
    'search',
    customParams
  );

  // Load extensions on first render if needed
  useEffect(() => {
    const initialLoad = async () => {
      try {
        if (extensionList.length === 0 && typeof loadExtensions === 'function') {
          await loadExtensions();
        }
      } catch (err) {
        console.error("Error loading extensions:", err);
      }
    };

    initialLoad();
  }, []);  // Empty dependency array to run only once

  // Select first extension as default if available
  useEffect(() => {
    if (!selectedExtension && extensionList.length > 0) {
      setSelectedExtension(extensionList[0].id);
    }
  }, [extensionList.length, selectedExtension, setSelectedExtension]);

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle manga selection
  const handleMangaSelect = useCallback((manga) => {
    navigate('/manga', { state: { manga } });
  }, [navigate]);

  // If no extensions are installed, show empty state
  if (extensionList.length === 0) {
    return <ExtensionEmptyState />;
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      {/* Search and filters section */}
      <div className="flex flex-col gap-4 p-4 border-b">
        <div className="flex flex-row gap-4">
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
            onClick={retry}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      );
    }

    if (loading) {
      return <LoadingGrid />;
    }

    if (manga.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <p className="text-muted-foreground">
            {debouncedSearch
              ? `No results found for "${debouncedSearch}"`
              : 'Search for manga or select a source to browse'}
          </p>
        </div>
      );
    }

    // Render manga grid
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {manga.map(item => (
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

// Skeleton loader for the manga grid
function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="flex flex-col">
          <Skeleton className="w-full aspect-[2/3] rounded-lg mb-2" />
          <Skeleton className="w-3/4 h-4 mb-1" />
          <Skeleton className="w-1/2 h-3" />
        </div>
      ))}
    </div>
  );
}

export default Browse;