import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
import ThemeSelector from "@/components/library/ThemeSelector.jsx";

// Settings Jotai Atoms for General tab
const defaultCategoryTabAtom = focusAtom(settingsAtom, optic => optic.prop("default_category_tab"));
const mangaCardSizeAtom = focusAtom(settingsAtom, optic => optic.prop("manga_card_size"));
const categoriesAtom = focusAtom(settingsAtom, optic => optic.prop("categories"));

const GeneralSettings = () => {
  // Get individual atoms for settings
  const [defaultCategoryTab, setDefaultCategoryTab] = useAtom(defaultCategoryTabAtom);
  const [mangaCardSize, setMangaCardSize] = useAtom(mangaCardSizeAtom);
  const [categories] = useAtom(categoriesAtom); // Read-only for now
  const [, saveSettings] = useAtom(saveSettingsAtom);

  // Auto-save handler for form elements
  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-left mb-4">
        Configure the appearance and behavior of the app
      </p>

      {/* Theme - Using the dedicated component */}
      <ThemeSelector />

      {/* Default Category Tab */}
      <div className="flex items-center">
        <Label htmlFor="defaultCategoryTab" className="w-48">Default Category Tab</Label>
        <div className="w-64">
          <Select
            value={defaultCategoryTab}
            onValueChange={(value) => handleValueChange(setDefaultCategoryTab, value)}
          >
            <SelectTrigger id="defaultCategoryTab">
              <SelectValue placeholder="Select default category tab" />
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

      {/* Manga Card Size */}
      <div className="flex items-center">
        <Label htmlFor="cardSize" className="w-48">Manga Card Size</Label>
        <div className="flex items-center gap-4">
          <Select
            value={mangaCardSize}
            onValueChange={(value) => handleValueChange(setMangaCardSize, value)}
            className="w-64"
          >
            <SelectTrigger id="cardSize">
              <SelectValue placeholder="Select card size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;