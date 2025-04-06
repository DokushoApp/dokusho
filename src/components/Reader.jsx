import {Origami} from "lucide-react";
import React from "react";

function Reader() {
  return (
    <div className="flex flex-1">
      <div
        className="flex h-full w-full flex-1 flex-col justify-center m-auto gap-2 border border-neutral-200 bg-white text-gray-100 p-2 md:p-10 dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col items-center">
          <Origami size={250} strokeWidth={0.25}/>
          <h1>Your library is empty.</h1>
        </div>
      </div>
    </div>
  )
}

export default Reader;