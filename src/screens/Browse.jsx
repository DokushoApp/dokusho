import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { selectedExtensionAtom, loadExtensionsAtom } from '@/store/extensions';
import { Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

import ExtensionSelector from '@/components/browse/ExtensionSelector';
import ExtensionEmptyState from '@/components/browse/ExtensionEmptyState';
import MangaCard from '@/components/base/MangaCard';

import useFetchManga from '@/hooks/useFetchManga';

/**
 * Browse page component
 * Allows searching and browsing manga from various sources
 */
function Browse() {

  const [extensions = [], loadExtensions] = useAtom(loadExtensionsAtom);
  const [selectedExtension, setSelectedExtension] = useAtom(selectedExtensionAtom);

  const [searchQuery, setSearchQuery] = useState('');

  const extensionList = Array.isArray(extensions) ? extensions : [];

  const debouncedSearch = useDebounce(searchQuery, 500);

  const customParams = React.useMemo(() => ({}), []);
  const { data: manga, loading, error, retry } = useFetchManga(
    debouncedSearch,
    'search',
    customParams
  );

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
  }, []);

  useEffect(() => {
    if (!selectedExtension && extensionList.length > 0) {
      setSelectedExtension(extensionList[0].id);
    }
  }, [extensionList.length, selectedExtension, setSelectedExtension]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  if (extensionList.length === 0) {
    return <ExtensionEmptyState />;
  }

  return (
    <div className="flex flex-1 flex-col h-full">
      <div className="flex flex-col gap-4 py-4">
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

      <div className="flex-1 overflow-auto no-scrollbar py-2">
        {renderContent()}
      </div>
    </div>
  );

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

    return (
      <div className="flex flex-wrap gap-3">
        {manga.map(item => (
          <MangaCard
            key={item.id}
            manga={item}
            isLibrary={false}
          />
        ))}
      </div>
    );
  }
}

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