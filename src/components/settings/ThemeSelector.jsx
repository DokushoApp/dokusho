import React from "react";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Create a focused atom for theme
const themeAtom = focusAtom(settingsAtom, optic => optic.prop("theme"));

const ThemeSelector = ({ className }) => {
  const [theme, setTheme] = useAtom(themeAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);

    // Apply theme immediately without waiting for effects
    const root = window.document.documentElement;

    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    // Apply theme based on setting
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(newTheme);
    }

    // Save the settings
    setTimeout(() => saveSettings(), 0);
  };

  return (
    <div className="flex items-center">
      <Label htmlFor="theme" className="w-48">Theme</Label>
      <div className="w-64">
        <Select
          value={theme}
          onValueChange={handleThemeChange}
        >
          <SelectTrigger id="theme" className={className}>
            <SelectValue placeholder="Select theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ThemeSelector;