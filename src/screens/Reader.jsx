import React from "react";
import { useLocation } from "react-router";
import MangaReaderContainer from "@/components/reader/MangaReaderContainer";

function Reader() {
  const location = useLocation();

  // Extract the manga path from location state if available
  const mangaPath = location.state?.mangaPath;

  return (
    <div className="h-screen w-screen overflow-hidden">
      <MangaReaderContainer initialPath={mangaPath} />
    </div>
  );
}

export default Reader;