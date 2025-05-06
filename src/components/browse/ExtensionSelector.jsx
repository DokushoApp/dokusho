import React from 'react';
import { useAtom } from 'jotai';
import { extensionsAtom, selectedExtensionAtom } from '@/store/extensions';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Puzzle } from 'lucide-react';

/**
 * ExtensionSelector component
 * Displays a dropdown to select the manga source/extension
 */
const ExtensionSelector = () => {
  const [extensions = [], setExtensions] = useAtom(extensionsAtom);
  const [selectedExtension, setSelectedExtension] = useAtom(selectedExtensionAtom);

  // Ensure extensions is an array
  const extensionList = Array.isArray(extensions) ? extensions : [];

  // If no extensions available, show a minimal prompt
  if (extensionList.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 border rounded-md">
        <Puzzle className="h-4 w-4"/>
        <span>No extensions</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedExtension || ''}
      onValueChange={(value) => {
        if (value) setSelectedExtension(value);
      }}
    >
      <SelectTrigger className="w-full min-w-[150px]">
        <SelectValue placeholder="Select source">
          {selectedExtension ?
            extensionList.find(ext => ext?.id === selectedExtension)?.name || 'Select source' :
            'Select source'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {extensionList.map((extension) => (
          <SelectItem
            key={extension.id || Math.random().toString(36).substring(2, 9)}
            value={extension.id || ''}
          >
            <div className="flex items-center justify-between w-full">
              <span className="flex-1">{extension.name || 'Unknown'}</span>
              {extension.nsfw && (
                <Badge variant="destructive" className="text-xs ml-2">
                  NSFW
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ExtensionSelector;