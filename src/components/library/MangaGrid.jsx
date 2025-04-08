import React from 'react';
import MangaCard from './MangaCard';

const MangaGrid = ({ items, onMangaSelect }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-6 p-4 justify-center md:justify-start">
      {items.map((manga) => (
        <MangaCard
          key={manga.id}
          manga={manga}
          onClick={onMangaSelect}
        />
      ))}
    </div>
  );
};

export default MangaGrid;