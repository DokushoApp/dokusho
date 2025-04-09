import {Squirrel} from "lucide-react";
import React from "react";

function Browse() {
  return (
    <div className="flex flex-1">
      <div
        className="flex h-full w-full flex-1 flex-col justify-center m-auto gap-2 p-2 md:p-10">
        <div className="flex flex-col items-center">
          <Squirrel size={250} strokeWidth={0.25} />
          <h1 >Add extension in settings to see extensions</h1>
        </div>
      </div>
    </div>
  )
}

export default Browse;