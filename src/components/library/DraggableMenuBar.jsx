import React, {useState, useRef, useEffect} from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import {restrictToHorizontalAxis} from "@dnd-kit/modifiers";
import {arrayMove} from "@dnd-kit/sortable";
import {Plus} from "lucide-react";
import {ScrollArea, ScrollBar} from "@/components/ui/scroll-area";

// Sortable menu item component
const SortableMenuItem = ({item, isActive, onClick, onActive}) => {
  const itemRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: item.id});

  // Notify parent component when this item becomes active
  useEffect(() => {
    if (isActive && itemRef.current) {
      onActive(itemRef.current);
    }
  }, [isActive, transform, onActive]);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        itemRef.current = node;
      }}
      style={style}
      className={`relative flex flex-col items-center px-0.5 ${isDragging ? "opacity-85 scale-105" : "opacity-100 scale-100"} duration-300`}
      {...attributes}
      {...listeners}
    >
      <div
        className={`py-2 cursor-pointer hover:text-primary ${isActive ? "font-bold text-foreground" : "font-normal text-muted-foreground"} ${isDragging ? "bg-accent/5" : ""} duration-300`}
        onClick={(e) => {
          // Only trigger click if not dragging
          if (!isDragging) {
            onClick(item.id);
          }
        }}
      >
        <span>{item.name}</span>
      </div>
    </div>
  );
};

const DraggableMenuBar = ({
                            menuItems,
                            initialItem,
                            onItemSelect,
                            onItemsReordered,
                            allowAddItem = false,
                            addItemTitle = "Add Item",
                            addItemPlaceholder = "Enter item name",
                          }) => {
  const [activeItem, setActiveItem] = useState(initialItem);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const scrollContainerRef = useRef(null);
  const indicatorRef = useRef(null);
  const containerRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduce activation distance for quicker dragging
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update indicator position based on the active element
  const updateIndicatorPosition = (activeElement) => {
    if (!activeElement || !indicatorRef.current || !containerRef.current) return;

    const rect = activeElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Position the indicator underneath the active item
    const width = rect.width;
    const left = rect.left - containerRect.left;

    indicatorRef.current.style.width = `${width}px`;
    indicatorRef.current.style.transform = `translateX(${left}px)`;
  };

  // Handle active item changes
  const handleActiveItem = (element) => {
    if (element) {
      updateIndicatorPosition(element);
    }
  };

  // Set up scroll event listener
  useEffect(() => {
    const scrollElement = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');

    if (scrollElement) {
      const handleScroll = () => {
        // Find active item element and update indicator
        const activeElements = containerRef.current?.querySelectorAll('[data-active="true"]');
        if (activeElements && activeElements.length > 0) {
          updateIndicatorPosition(activeElements[0]);
        }
      };

      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Update indicator position after DOM updates
  useEffect(() => {
    const activeElements = containerRef.current?.querySelectorAll('[data-active="true"]');
    if (activeElements && activeElements.length > 0) {
      updateIndicatorPosition(activeElements[0]);
    }
  }, [activeItem, menuItems]);

  const handleDragStart = () => {
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
  };

  const handleDragEnd = (event) => {
    setIsDragging(false);
    document.body.style.cursor = '';

    const {active, over} = event;

    if (active.id !== over.id) {
      const oldIndex = menuItems.findIndex((item) => item.id === active.id);
      const newIndex = menuItems.findIndex((item) => item.id === over.id);

      const newItems = arrayMove(menuItems, oldIndex, newIndex);
      if (onItemsReordered) {
        onItemsReordered(newItems);
      }
    }

    // Update indicator position after reordering
    setTimeout(() => {
      const activeElements = containerRef.current?.querySelectorAll('[data-active="true"]');
      if (activeElements && activeElements.length > 0) {
        updateIndicatorPosition(activeElements[0]);
      }
    }, 100);
  };

  const handleItemClick = (itemId) => {
    if (!isDragging) {
      setActiveItem(itemId);
      onItemSelect(itemId);
    }
  };

  const handleAddItem = () => {
    if (newItemName.trim()) {
      // Create a slug-like ID from the name
      const id = newItemName.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Make sure ID doesn't already exist
      const uniqueId = menuItems.some(item => item.id === id)
        ? `${id}-${Date.now().toString(36)}`
        : id;

      const newItem = {
        id: uniqueId,
        name: newItemName.trim()
      };

      // Add new item and close dialog
      if (onItemsReordered) {
        onItemsReordered([...menuItems, newItem]);
      }

      setNewItemName("");
      setIsAddDialogOpen(false);

      // Select the new item
      setActiveItem(uniqueId);
      onItemSelect(uniqueId);

      // Scroll to the end to show the new item
      setTimeout(() => {
        const scrollViewport = scrollContainerRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollViewport) {
          scrollViewport.scrollLeft = scrollViewport.scrollWidth;
        }

        // Update indicator after scrolling
        setTimeout(() => {
          const activeElements = containerRef.current?.querySelectorAll('[data-active="true"]');
          if (activeElements && activeElements.length > 0) {
            updateIndicatorPosition(activeElements[0]);
          }
        }, 150);
      }, 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between py-2 relative">
        <ScrollArea className="w-full" orientation="horizontal" ref={scrollContainerRef}>
          <div className="flex items-center gap-5 min-w-max relative" ref={containerRef}>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToHorizontalAxis]}
            >
              <SortableContext
                items={menuItems.map(item => item.id)}
                strategy={horizontalListSortingStrategy}
              >
                {menuItems.map((item) => (
                  <div key={item.id} data-active={item.id === activeItem}>
                    <SortableMenuItem
                      item={item}
                      isActive={item.id === activeItem}
                      onClick={handleItemClick}
                      onActive={handleActiveItem}
                    />
                  </div>
                ))}
              </SortableContext>
            </DndContext>

            {allowAddItem && (
              <div
                className="px-2 py-1.5 cursor-pointer text-muted-foreground hover:text-primary duration-300 flex items-center gap-1"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus size={16} className="duration-300 hover:scale-110"/>
                <span>New</span>
              </div>
            )}

            {/* Active indicator that slides under tabs */}
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-0.5 bg-primary rounded-t"
              style={{
                width: '0px',
                left: '0px',
                transition: 'transform 300ms, width 300ms'
              }}
            />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{addItemTitle}</DialogTitle>
            <DialogDescription>
              Create a new category for organizing your manga.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              placeholder={addItemPlaceholder}
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!newItemName.trim()}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DraggableMenuBar;