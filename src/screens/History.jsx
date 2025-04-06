import {Snail} from "lucide-react";
import React from "react";

function History() {
  return (
    <div className="flex flex-1">
      <div
        className="flex h-full w-full flex-1 flex-col justify-center m-auto gap-2 bg-white text-gray-100 p-2 md:p-10  dark:bg-neutral-900">
        <div className="flex flex-col items-center">
          <Snail size={250} strokeWidth={0.25} className={"text-black dark:text-white"}/>
          <h1 className={"text-black dark:text-white"}>Start reading to see your reading history here.</h1>
        </div>
      </div>
    </div>
  )
}

export default History;