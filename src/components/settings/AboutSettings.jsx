import React from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAtom } from "jotai";
import { resetSettingsAtom } from "@/store/settings";

const AboutSettings = () => {
  const [, resetSettings] = useAtom(resetSettingsAtom);

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-left mb-4">
        Information about the application
      </p>

      <div className="flex items-center">
        <Label className="w-48">Version</Label>
        <div>
          <p className="text-sm">1.0.0 Beta</p>
        </div>
      </div>

      <div className="flex items-center">
        <Label className="w-48">Last Updated</Label>
        <div>
          <p className="text-sm">April 8, 2025</p>
        </div>
      </div>

      <div className="flex items-center">
        <Label className="w-48">GitHub</Label>
        <div>
          <a href="https://github.com/uday-samsani/dokusho"
             className="text-sm text-blue-500 hover:underline">github.com/uday-samsani/dokusho</a>
        </div>
      </div>

      <div className="flex items-center">
        <Label className="w-48">Website</Label>
        <div>
          <a href="https://dokusho.app" className="text-sm text-blue-500 hover:underline">dokusho.app</a>
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => resetSettings()}>
            Reset All Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AboutSettings;