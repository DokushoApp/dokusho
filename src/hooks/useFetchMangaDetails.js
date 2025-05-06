import {useEffect, useState} from 'react';
import {useAtomValue} from "jotai";
import {extensionsAtom, selectedExtensionAtom} from '@/store/extensions';
import axios from "axios";

const useFetchMangaDetails = (manga) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({});

  const extensions = useAtomValue(extensionsAtom);

  useEffect(() => {
    const fetchMangaDetails = async () => {
      setLoading(true);
      try {
        const extension = extensions.filter(ext => ext.id === manga.source_id)[0]
        if (extension) {
          const api = extension.api.manga_details;
          const url = api.url.replace('{id}', manga.id);

          // Make request
          const {data: response} = await axios({
            method: api.method || 'GET',
            url: url,
            params: api.params || {},
            headers: api.headers || {},
            timeout: 15000
          });
          if (response.result === "ok") {
            const result = {}
            result.id = response.data.id;
            result.title = response.data.attributes.title.en;
            result.description = response.data.attributes.description.en;
            result.status = response.data.attributes.status;
            result.published_on = response.data.attributes.year;
            result.tags = response.data.attributes.tags.filter(tag => tag.attributes.group === "theme" || tag.attributes.group === "genre").map(tag => tag.attributes.name.en);
            result.authors = response.data.relationships.filter(relation => relation.type === "author").map(relation => relation.attributes.name);
            result.artists = response.data.relationships.filter(relation => relation.type === "artist").map(relation => relation.attributes.name);
            result.source = extension.id;
            setData(result);
          }
        }
      } catch (error) {
        setError(error);
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    fetchMangaDetails()
  }, [extensions, manga])

  return {data, loading, error}
}
export default useFetchMangaDetails;