import React, { useState } from "react";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { arrayMove } from "@dnd-kit/sortable";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GripVertical, Trash2, Pencil, X } from "lucide-react";
const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));

const SortableItem = ({ category, onDelete, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(category.name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: category.id });

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const handleSave = () => {
    if (editedName.trim()) {
      onEdit(category.id, editedName.trim());
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditedName(category.name);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-1 my-1 bg-background border rounded-md group"
    >
      <div className="flex items-center flex-1">
        <button
          className="p-1 mr-2 cursor-grab text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={12} />
        </button>

        {isEditing ? (
          <Input
            value={editedName}
            onChange={(e) => setEditedName(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1"
          />
        ) : (
          <span className="flex-1" onDoubleClick={() => setIsEditing(true)}>
            {category.name}
          </span>
        )}
      </div>

      <div className="flex items-center">
        {isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setIsEditing(false);
              setEditedName(category.name);
            }}
          >
            <X size={16} />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="opacity-0 group-hover:opacity-100"
          >
            <Pencil size={16} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(category.id)}
          className="text-destructive opacity-0 group-hover:opacity-100"
          disabled={category.id === "all"} // Prevent deleting the "All" category
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
};

const CategoryManager = ({ open, onClose }) => {
  const [categories, setCategories] = useAtom(categoriesAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);
  const [newCategoryName, setNewCategoryName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      const newCategories = arrayMove(categories, oldIndex, newIndex);
      setCategories(newCategories);
      setTimeout(() => saveSettings(), 0);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const id = newCategoryName.trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const uniqueId = categories.some(cat => cat.id === id)
        ? `${id}-${Date.now().toString(36)}`
        : id;

      const newCategory = {
        id: uniqueId,
        name: newCategoryName.trim()
      };

      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setTimeout(() => saveSettings(), 0);
    }
  };

  const handleDeleteCategory = (id) => {
    if (id === "all") return;

    setCategories(categories.filter(cat => cat.id !== id));
    setTimeout(() => saveSettings(), 0);
  };

  const handleEditCategory = (id, newName) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, name: newName } : cat
    ));
    setTimeout(() => saveSettings(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddCategory();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Add, edit, delete, or reorder your manga categories.
            Double-click a category name to edit it, or drag to reorder.
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <div className="flex items-center space-x-2 mb-4">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
              Add
            </Button>
          </div>

          <Label className="mb-2 block">Categories</Label>
          <div className="h-[300px] overflow-x-auto no-scrollbar pr-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={categories.map(cat => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((category) => (
                  <SortableItem
                    key={category.id}
                    category={category}
                    onDelete={handleDeleteCategory}
                    onEdit={handleEditCategory}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryManager;