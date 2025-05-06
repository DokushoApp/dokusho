import {useEffect, useState} from 'react';
import {useAtomValue} from "jotai";
import {extensionsAtom} from "@/store/extensions.js";
import axios from "axios";
import {readDir} from "@tauri-apps/plugin-fs";
import {convertFileSrc} from "@tauri-apps/api/core";

const useFetchMangaPages = (manga, chapter) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState({});
  const extensions = useAtomValue(extensionsAtom)

  useEffect(() => {
    const fetchMangaPages = async () => {
      setLoading(true);
      try {
        if (manga.source_id === "local") {
          const entries = await readDir(manga.path, {recursive: false});
          // Filter for image files only
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp'];
          const imageFiles = entries
            .filter(entry => {
              const lowerCaseName = entry.name?.toLowerCase() || '';
              return entry.children === undefined &&
                imageExtensions.some(ext => lowerCaseName.endsWith(ext));
            })
            .sort((a, b) => {
              // Try to sort numerically by extracting numbers from filenames
              const aMatch = a.name.match(/\d+/);
              const bMatch = b.name.match(/\d+/);

              if (aMatch && bMatch) {
                return parseInt(aMatch[0]) - parseInt(bMatch[0]);
              }

              // Fallback to alphabetical sort
              return a.name.localeCompare(b.name);
            });

          const result = {};
          result.base_url = manga.path
          result.pages = imageFiles.map(file => file.name);
          setPages(result);
        } else {
          const extension = extensions.filter(ext => ext.id === manga.source_id)[0];
          if (extension) {
            const api = {...extension.api.page_list};
            api.url = api.url.replace("{id}", chapter.id);

            const {data: response} = await axios(api);
            console.log(response);
            const result = {};
            result.base_url = response.baseUrl + "/data/" + response.chapter.hash;
            result.pages = response.chapter.data;
            setPages(result);
          }
        }
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }

    fetchMangaPages();
  }, [manga, chapter, extensions]);

  return {pages, error, loading};
}

export default useFetchMangaPages;