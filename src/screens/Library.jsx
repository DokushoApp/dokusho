import {Origami} from "lucide-react";
import React, {useState} from "react";
import MenuBar from "@/components/ui/menubar.jsx";

function Library() {
  const [selectedCategory, setSelectedCategory] = useState('reading');

  const categories = [
    {id: "plan-to-read", name: "Plan to Read"},
    {id: "reading", name: "Reading"},
    {id: "on-hold", name: "On Hold"},
    {id: "completed", name: "Completed"},
    {id: "dropped", name: "Dropped"}
  ];

  return (
    <div className="flex flex-1 flex-col px-4">
      <MenuBar
        menuItems={categories}
        initialItem={selectedCategory}
        onItemSelect={setSelectedCategory}
        allowAddItem={true}
        addItemTitle="Add New Category"
        addItemPlaceholder="Enter category name"
      />
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