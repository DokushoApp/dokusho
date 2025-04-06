import {Squirrel} from "lucide-react";
import React from "react";

function Browse() {
  return (
    <div className="flex flex-1">
      <div
        className="flex h-full w-full flex-1 flex-col justify-center m-auto gap-2 bg-white text-gray-100 p-2 md:p-10  dark:bg-neutral-900">
        <div className="flex flex-col items-center">
          <Squirrel size={250} strokeWidth={0.25} className={"text-black dark:text-white"}/>
          <h1 className={"text-black dark:text-white"}>Add extension in settings to see extensions</h1>
        </div>
      </div>
    </div>
  )
}

export default Browse;