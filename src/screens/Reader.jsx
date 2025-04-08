import React, { useEffect, useRef } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ReaderComponent from "../components/library/Reader";

function Reader() {
  const location = useLocation();
  const readerRef = useRef(null);

  // Extract the manga path from location state if available
  const mangaPath = location.state?.mangaPath;

  // If we have a manga path from navigation, load it automatically
  useEffect(() => {
    if (mangaPath && readerRef.current?.loadMangaFromPath) {
      readerRef.current.loadMangaFromPath(mangaPath);
    }
  }, [mangaPath]);

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Minimal top bar */}
      <div className="h-10 bg-white dark:bg-neutral-900 border-b flex items-center px-2">
        <Link to="/">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Library
          </Button>
        </Link>
      </div>

      {/* Main reader component taking the rest of the screen */}
      <div className="flex-1">
        <ReaderComponent ref={readerRef} initialPath={mangaPath} />
      </div>
    </div>
  );
}

export default Reader;