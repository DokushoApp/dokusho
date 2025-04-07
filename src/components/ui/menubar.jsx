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

const MenuBar = ({
                   menuItems = [],
                   onItemSelect,
                   initialItem = null,
                   allowAddItem = false,
                   addItemTitle = "Add New Item",
                   addItemPlaceholder = "Enter new item name",
                   itemIdFormatter = (name) => name.toLowerCase().replace(/\s+/g, '-')
                 }) => {
  const [items, setItems] = useState(menuItems);
  const [selectedItem, setSelectedItem] = useState(initialItem || (items.length > 0 ? items[0].id : null));
  const [newItemName, setNewItemName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Refs for each menu item
  const itemRefs = useRef({});
  // Ref for the animated indicator
  const indicatorRef = useRef(null);

  // Update indicator position when selected item changes
  useEffect(() => {
    updateIndicatorPosition();
  }, [selectedItem]);

  // Update indicator position after initial render and when items change
  useEffect(() => {
    updateIndicatorPosition();
  }, [items]);

  // Update selected item if initial item changes
  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem);
    }
  }, [initialItem]);

  // Function to update the indicator position
  const updateIndicatorPosition = () => {
    const selectedRef = itemRefs.current[selectedItem];
    const indicator = indicatorRef.current;

    if (selectedRef && indicator) {
      const { offsetLeft, offsetWidth } = selectedRef;

      indicator.style.width = `${offsetWidth}px`;
      indicator.style.left = `${offsetLeft}px`;
    }
  };

  // Handle item selection
  const handleItemSelect = (itemId) => {
    setSelectedItem(itemId);
    // Pass the selected item to the parent component
    if (onItemSelect) {
      onItemSelect(itemId);
    }
  };

  // Add new item
  const handleAddItem = () => {
    if (newItemName.trim() === "") return;

    const itemId = itemIdFormatter(newItemName);

    const newItems = [
      ...items,
      { id: itemId, name: newItemName.trim() }
    ];

    setItems(newItems);
    setNewItemName("");
    setDialogOpen(false);

    // Optionally select the new item
    // handleItemSelect(itemId);
  };

  return (
    <div className="w-full mb-6 relative">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex items-center pt-4 pb-1 gap-6 relative">
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-0.5 bg-primary transition-all duration-300 ease-in-out"
            style={{ height: '2px' }}
          />

          {items.map((item) => (
            <span
              key={item.id}
              ref={el => itemRefs.current[item.id] = el}
              className={`cursor-pointer text-sm hover:text-primary transition-colors relative pb-1 ${
                selectedItem === item.id
                  ? "font-semibold text-primary"
                  : "text-muted-foreground"
              }`}
              onClick={() => handleItemSelect(item.id)}
            >
              {item.name}
            </span>
          ))}

          {allowAddItem && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <button className="text-gray-300 hover:text-gray-400 transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{addItemTitle}</DialogTitle>
                </DialogHeader>
                <div className="p-4">
                  <Input
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={addItemPlaceholder}
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
                    onClick={handleAddItem}
                    disabled={newItemName.trim() === ""}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};

export default MenuBar;