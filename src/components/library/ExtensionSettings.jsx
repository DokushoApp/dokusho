import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";

// Settings Jotai Atoms for Extension tab
const showNsfwAtom = focusAtom(settingsAtom, optic => optic.prop("show_nsfw"));

const ExtensionSettings = () => {
  // Get individual atoms for settings
  const [showNSFW, setShowNSFW] = useAtom(showNsfwAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  // Auto-save handler for form elements
  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-left mb-4">
        Configure extension sources and filters
      </p>

      {/* Extension Repository */}
      <div className="flex items-center">
        <Label className="w-48">Extension Repository</Label>
        <div>
          <Button variant="outline" size="sm">
            Manage
          </Button>
        </div>
      </div>

      {/* Show NSFW */}
      <div className="flex items-center">
        <Label htmlFor="showNSFW" className="w-48">Show NSFW</Label>
        <div>
          <Switch
            id="showNSFW"
            checked={showNSFW}
            onCheckedChange={(value) => handleValueChange(setShowNSFW, value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ExtensionSettings;