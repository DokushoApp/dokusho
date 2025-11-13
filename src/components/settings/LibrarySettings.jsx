import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
import CategoryManager from "@/components/settings/CategoryManager";

const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));
const selectedCategoryAtom = focusAtom(settingsAtom, optic => optic.prop("selected_category_tab"));
const defaultCategoryAtom = focusAtom(settingsAtom, optic => optic.prop("default_category"));

const LibrarySettings = () => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const [categories] = useAtom(categoriesAtom);
  const [defaultCategory, setDefaultCategory] = useAtom(defaultCategoryAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-left mb-4">
        Configure how your manga library is organized
      </p>

      <div className="flex items-center">
        <Label className="w-48">Edit Categories</Label>
        <div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => setIsManagerOpen(true)}
          >
            Manage
          </Button>
        </div>
      </div>

      <div className="flex items-center">
        <Label htmlFor="defaultCategory" className="w-48">Default Category</Label>
        <div className="w-64">
          <Select
            value={defaultCategory}
            onValueChange={(value) => handleValueChange(setDefaultCategory, value)}
          >
            <SelectTrigger id="defaultCategory">
              <SelectValue placeholder="Select default category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CategoryManager
        open={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
      />
    </div>
  );
};

export default LibrarySettings;