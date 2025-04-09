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
import {Plus, Settings} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";

// Sortable menu item component
const SortableMenuItem = ({item, isActive, onClick, activeItemRef}) => {
  const itemRef = useRef(null);
  const textRef = useRef(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({id: item.id});

  useEffect(() => {
    // If this item is active, update the reference for the indicator animation
    if (isActive && textRef.current && activeItemRef.current) {
      const rect = textRef.current.getBoundingClientRect();
      activeItemRef.current.style.width = `${rect.width}px`;
      activeItemRef.current.style.transform = `translateX(${rect.left - activeItemRef.current.parentElement.getBoundingClientRect().left}px)`;
    }
  }, [isActive, activeItemRef, transform]);

  const style = {
    transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={(node) => {
        // Set both the sortable ref and our local ref
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
        <span ref={textRef}>{item.name}</span>
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
  const activeIndicatorRef = useRef(null);

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
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddItem();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between py-2">
        <ScrollArea className="max-w-full" orientation="horizontal">
          <div className="flex items-center gap-5">
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
                  <SortableMenuItem
                    key={item.id}
                    item={item}
                    isActive={item.id === activeItem}
                    onClick={handleItemClick}
                    activeItemRef={activeIndicatorRef}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Active indicator that slides under tabs */}
            <div
              ref={activeIndicatorRef}
              className="absolute bottom-0 h-0.5 bg-primary rounded-t"
              style={{
                width: '0px',
                left: '0px',
                transition: 'transform 300ms, width 300ms'
              }}
            />

            {allowAddItem && (
              <div
                className="px-2 py-1.5 cursor-pointer text-muted-foreground hover:text-primary duration-300 flex items-center gap-1"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Plus size={16} className="duration-300 hover:scale-110"/>
                <span>New</span>
              </div>
            )}
          </div>
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