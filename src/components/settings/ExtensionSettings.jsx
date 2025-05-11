import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { nanoid } from 'nanoid';
import { Plus, ExternalLink, Trash2, RefreshCw, Link2, FileText, Download } from "lucide-react";

const showNsfwAtom = focusAtom(settingsAtom, optic => optic.prop("show_nsfw"));

const ExtensionSettings = () => {
  const [isAddExtensionOpen, setIsAddExtensionOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const [extensionUrl, setExtensionUrl] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [extensions, setExtensions] = useState([]);

  const [showNSFW, setShowNSFW] = useAtom(showNsfwAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  useEffect(() => {
    loadExtensions();
  }, []);

  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  const loadExtensions = async () => {
    try {
      setLoading(true);
      const result = await invoke("get_all_extensions");
      setExtensions(result.extensions || []);
    } catch (err) {
      console.error("Failed to load extensions:", err);
      setError("Failed to load extensions: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    try {
      setError(null);
      setLoading(true);

      const selected = await open({
        multiple: false,
        filters: [{
          name: 'JSON',
          extensions: ['json']
        }],
        title: 'Select Extension File'
      });

      if (selected) {
        const filePath = selected.toString();

        try {
          const extension = await invoke("validate_extension_file", { path: filePath });

          extension.source_type = 'file';
          extension.source_path = filePath;
          extension.added_at = new Date().toISOString();

          await invoke("add_extension", { extension });

          await loadExtensions();

          setIsAddExtensionOpen(false);
          setExtensionUrl("");
        } catch (validationErr) {
          setError(`Invalid extension file: ${validationErr}`);
        }
      }
    } catch (err) {
      console.error("Failed to add extension file:", err);
      setError(`Failed to add extension file: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlAdd = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!extensionUrl) {
        setError("Please enter an extension URL");
        setLoading(false);
        return;
      }

      if (!extensionUrl.startsWith('http://') && !extensionUrl.startsWith('https://')) {
        setError("URL must start with http:// or https://");
        setLoading(false);
        return;
      }
      try {
        const extension = await invoke("validate_extension_url", { url: extensionUrl });

        extension.source_type = 'url';
        extension.source_path = extensionUrl;
        extension.added_at = new Date().toISOString();

        await invoke("add_extension", { extension });

        await loadExtensions();

        setIsAddExtensionOpen(false);
        setExtensionUrl("");
      } catch (validationErr) {
        setError(`Invalid extension URL: ${validationErr}`);
      }
    } catch (err) {
      console.error("Failed to add extension URL:", err);
      setError(`Failed to add extension URL: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExtension = async (extensionId) => {
    try {
      setLoading(true);
      await invoke("remove_extension", { extensionId });
      await loadExtensions();
    } catch (err) {
      console.error("Failed to delete extension:", err);
      setError(`Failed to delete extension: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-left mb-4">
        Add and manage extensions for your manga reader
      </p>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Extensions</Label>
          <Dialog open={isAddExtensionOpen} onOpenChange={setIsAddExtensionOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Extension</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Extension</DialogTitle>
                <DialogDescription>
                  Add an extension by file or URL to access more manga sources.
                </DialogDescription>
              </DialogHeader>

              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="file" className="flex items-center gap-1">
                    <FileText className="h-4 w-4" />
                    <span>Local File</span>
                  </TabsTrigger>
                  <TabsTrigger value="url" className="flex items-center gap-1">
                    <Link2 className="h-4 w-4" />
                    <span>URL</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="space-y-4 mt-4">
                  <Button
                    onClick={handleFileUpload}
                    className="w-full"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Select Extension File
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="url" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="extensionUrl">Extension URL</Label>
                    <Input
                      id="extensionUrl"
                      placeholder="https://example.com/extension.json"
                      value={extensionUrl}
                      onChange={(e) => setExtensionUrl(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleUrlAdd}
                    className="w-full"
                    disabled={loading || !extensionUrl}
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Link2 className="h-4 w-4 mr-2" />
                        Add Extension URL
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsAddExtensionOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3 mt-2">
          {loading && (
            <div className="flex justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!loading && extensions.length > 0 ? (
            extensions.map(extension => (
              <Card key={extension.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">
                        {extension.name}
                        {extension.nsfw && (
                          <span className="text-xs bg-destructive text-destructive-foreground rounded-full px-2 py-0.5 ml-2">
                            NSFW
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        v{extension.version} by {extension.author}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {extension.source_type === 'url' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(extension.source_path, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteExtension(extension.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-0">
                  <p className="text-sm text-muted-foreground mb-2">
                    {extension.description}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {extension.source_type === 'file' ? (
                        <FileText className="h-3 w-3" />
                      ) : (
                        <Link2 className="h-3 w-3" />
                      )}
                      <span>Type: {extension.source_type === 'file' ? 'Local File' : 'URL'}</span>
                    </div>
                    <div className="mt-1">
                      Added: {new Date(extension.added_at).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : !loading && (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <Download className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No extensions added yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add extensions to access more manga sources.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center pt-4 border-t">
        <Label htmlFor="showNSFW" className="w-48">Show NSFW Content</Label>
        <div>
          <Switch
            id="showNSFW"
            checked={showNSFW}
            onCheckedChange={(value) => handleValueChange(setShowNSFW, value)}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Note: NSFW content will only be displayed if this option is enabled. Extensions can be used to add new manga sources to your reader.
      </p>
    </div>
  );
};

export default ExtensionSettings;