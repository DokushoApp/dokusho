import {useAtomValue} from "jotai";
import {useState, useEffect, useRef} from 'react'
import axios from 'axios'
import {extensionsAtom} from "@/store/extensions";
import {nanoid} from "nanoid";

const useFetchMangaChapters = (manga, offset = 0, sortOrder = 'desc', append = false) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const extensions = useAtomValue(extensionsAtom)
  const prevMangaRef = useRef(null);
  const prevSortOrderRef = useRef(null);

  useEffect(() => {
    // Safety check - don't fetch if manga is not available
    if (!manga || !manga.source_id) {
      return;
    }

    // Reset chapters if manga or sortOrder changed (not just offset)
    const mangaChanged = prevMangaRef.current?.id !== manga?.id || prevMangaRef.current?.source_id !== manga?.source_id;
    const sortOrderChanged = prevSortOrderRef.current !== sortOrder;
    
    if (mangaChanged || sortOrderChanged) {
      setChapters([]);
      setHasMore(true);
      prevMangaRef.current = manga;
      prevSortOrderRef.current = sortOrder;
    }

    const fetchMangaChapters = async () => {
      setLoading(true);
      try {
        if (manga.source_id === "local") {
          const result = {}
          result.id = nanoid();
          result.number = 1;
          result.title = "";
          result.volume = "Local";
          setChapters([result]);
          setHasMore(false);
        } else {
          const extension = extensions.filter(ext => ext.id === manga.source_id)[0];

          if (extension && extension.api && extension.api.chapter_list) {
            const api = extension.api.chapter_list;
            
            // Safely get params, defaulting to empty object
            const defaultParams = api.params || {};
            
            // Create a copy to avoid mutating the original extension config
            const params = {...defaultParams};
            params.offset = offset;
            params['order[chapter]'] = sortOrder;
            params['order[volume]'] = sortOrder;
            
            // Set limit if not already set (MangaDex default is 100)
            if (!params.limit) {
              params.limit = 100;
            }
            
            // Build the request config
            const url = api.url.replace("{id}", manga.id);
            const method = api.method || 'GET';
            const headers = api.headers || {};
            
            const {data: response} = await axios({
              method,
              url,
              headers,
              params
            });
            
            if (response.result === "ok") {
              const resultChapters = response.data.map((chapter) => {
                const result = {}
                result.id = chapter.id;
                result.number = chapter.attributes.chapter;
                result.pages = chapter.attributes.pages;
                result.published_at = chapter.attributes.published_at;
                result.title = chapter.attributes.title;
                result.volume = chapter.attributes.volume;
                return result;
              });
              
              // Append or replace chapters based on append flag
              if (append && offset > 0) {
                setChapters(prev => [...prev, ...resultChapters]);
              } else {
                setChapters(resultChapters);
              }
              
              // Check if there are more chapters to load
              // MangaDex returns total in response.total, or we check if we got fewer than limit
              const limit = params.limit || 100;
              const hasMoreChapters = resultChapters.length === limit && 
                (response.total === undefined || (offset + resultChapters.length) < response.total);
              setHasMore(hasMoreChapters);
            } else {
              setError(new Error('Invalid response from API'));
              setHasMore(false);
            }
          } else {
            setError(new Error('Extension not found'));
            setHasMore(false);
          }
        }
      } catch (err) {
        console.log(err);
        setError(err);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }

    fetchMangaChapters();
  }, [manga, extensions, sortOrder, offset, append])

  return {chapters, loading, error, hasMore}
}

export default useFetchMangaChapters;