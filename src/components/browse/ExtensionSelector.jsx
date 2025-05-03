import React from 'react';
import {useAtom} from 'jotai';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {extensionsAtom, selectedExtensionAtom} from '@/store/extensions';
import {Badge} from '@/components/ui/badge';
import {Puzzle} from 'lucide-react';

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
        <span>No extensions installed</span>
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
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a source">
          {selectedExtension ?
            extensionList.find(ext => ext?.id === selectedExtension)?.name || 'Select a source' :
            'Select a source'
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {extensionList.map((extension) => (
          <SelectItem
            key={extension.id || Math.random().toString()}
            value={extension.id || ''}
          >
            <div className="flex items-center justify-between w-full">
              <span>{extension.name || 'Unknown Extension'}</span>
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