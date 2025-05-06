import {useAtomValue} from "jotai";
import {useState, useEffect} from 'react'
import axios from 'axios'
import {extensionsAtom} from "@/store/extensions";

const useFetchMangaChapters = (manga, offset = 0, sortOrder = 'desc') => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const extensions = useAtomValue(extensionsAtom)
  useEffect(() => {
    setChapters([]);
    const fetchMangaChapters = async () => {
      setLoading(true);
      try {
        const extension = extensions.filter(ext => ext.id === manga.source_id)[0];

        if (extension) {
          const api = extension.api.chapter_list;
          const payload = {...api}
          payload.url = payload.url.replace("{id}", manga.id)
          payload.params.offset = offset;
          payload.params['order[chapter]'] = sortOrder;
          payload.params['order[volume]'] = sortOrder;
          const {data: response} = await axios({...payload})
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
            })
            setChapters(resultChapters);
          }
        }
      } catch (err) {
        console.log(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMangaChapters();
  }, [manga, extensions, sortOrder])

  return {chapters, loading, error}
}

export default useFetchMangaChapters;