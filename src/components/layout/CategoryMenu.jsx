import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Plus, Check, X } from "lucide-react";

const CategoryMenu = ({ onCategorySelect, initialCategory = "reading" }) => {
  const defaultCategories = [
    { id: "plan-to-read", name: "Plan to Read" },
    { id: "reading", name: "Reading" },
    { id: "on-hold", name: "On Hold" },
    { id: "completed", name: "Completed" },
    { id: "dropped", name: "Dropped" }
  ];

  const [categories, setCategories] = useState(defaultCategories);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Refs for each category item
  const categoryRefs = useRef({});
  // Ref for the animated indicator
  const indicatorRef = useRef(null);

  // Update indicator position when selected category changes
  useEffect(() => {
    updateIndicatorPosition();
  }, [selectedCategory]);

  // Update indicator position after initial render and when categories change
  useEffect(() => {
    updateIndicatorPosition();
  }, [categories]);

  // Function to update the indicator position
  const updateIndicatorPosition = () => {
    const selectedRef = categoryRefs.current[selectedCategory];
    const indicator = indicatorRef.current;

    if (selectedRef && indicator) {
      const { offsetLeft, offsetWidth } = selectedRef;

      indicator.style.width = `${offsetWidth}px`;
      indicator.style.left = `${offsetLeft}px`;
    }
  };

  // Handle category selection
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    // Pass the selected category to the parent component
    if (onCategorySelect) {
      onCategorySelect(categoryId);
    }
  };

  // Add new category
  const handleAddCategory = () => {
    if (newCategoryName.trim() === "") return;

    const categoryId = newCategoryName.toLowerCase().replace(/\s+/g, '-');

    setCategories([
      ...categories,
      { id: categoryId, name: newCategoryName.trim() }
    ]);

    setNewCategoryName("");
    setDialogOpen(false);
  };

  return (
    <div className="w-full mb-6 relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center px-2 pt-4 pb-1 gap-6 relative">
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{ height: '2px' }}
          />

          {categories.map((category) => (
            <span
              key={category.id}
              ref={el => categoryRefs.current[category.id] = el}
              className={`cursor-pointer text-sm hover:text-primary transition-colors relative pb-1 ${
                selectedCategory === category.id
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleCategorySelect(category.id)}
            >
              {category.name}
            </span>
          ))}

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="text-gray-300 hover:text-gray-400 transition-colors">
                <Plus className="h-4 w-4" />
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="p-4">
                <Input
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  className="mr-2"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleAddCategory}
                  disabled={newCategoryName.trim() === ""}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default CategoryMenu;