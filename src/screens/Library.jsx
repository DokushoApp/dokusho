import {Origami} from "lucide-react";
import React from "react";

function Library() {
  return (
    <div className="flex flex-1">
      <div
        className="flex h-full w-full flex-1 flex-col justify-center m-auto gap-2 bg-white text-gray-100 p-2 md:p-10  dark:bg-neutral-900">
        <div className="flex flex-col items-center">
          <Origami size={250} strokeWidth={0.25} className={"text-black dark:text-white"}/>
          <h1 className={"text-black dark:text-white"}>Your library is empty.</h1>
        </div>
      </div>
    </div>
  )
}

export default Library;