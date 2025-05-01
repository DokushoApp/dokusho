import React, { useState, useEffect } from "react";
import { open } from '@tauri-apps/plugin-dialog';
import { invoke } from "@tauri-apps/api/core";
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
import { extensionsAtom, refreshExtensionsAtom } from "@/store/extensions";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
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
import {
  FileText,
  Link2,
  Plus,
  RefreshCw,
  Trash2,
  AlertCircle,
  Globe,
  ExternalLink,
  Package
} from "lucide-react";

// NSFW setting atom
const showNsfwAtom = focusAtom(settingsAtom, optic => optic.prop("show_nsfw"));

const ExtensionSettings = () => {
  // State
  const [showNSFW, setShowNSFW] = useAtom(showNsfwAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);
  const [extensionsData, setExtensionsData] = useAtom(extensionsAtom);
  const [, refreshExtensions] = useAtom(refreshExtensionsAtom);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAddRepoDialogOpen, setIsAddRepoDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");

  // Load extensions on mount
  useEffect(() => {
    const loadExtensions = async () => {
      setLoading(true);
      try {
        await refreshExtensions();
      } catch (err) {
        setError(`Failed to load extensions: ${err.toString()}`);
      } finally {
        setLoading(false);
      }
    };

    loadExtensions();
  }, [refreshExtensions]);

  // Auto-save handler for form elements
  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  // Handle file repository addition
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
        title: 'Select Extension Repository File'
      });

      if (selected) {
        const filePath = selected.toString();

        // First validate the repository
        await invoke("validate_extension_repo", { path: filePath });

        // Then create the repository
        await invoke("create_extensions_from_repo", {
          path: filePath,
          name: repoName || null
        });

        // Refresh extensions list
        await refreshExtensions();

        // Close dialog and reset form
        setIsAddRepoDialogOpen(false);
        setRepoName("");
        setRepoUrl("");
      }
    } catch (err) {
      setError(`Error adding repository file: ${err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle URL repository addition
  const handleUrlAdd = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!repoUrl) {
        setError("Please enter a repository URL");
        setLoading(false);
        return;
      }

      // Validate the URL
      if (!repoUrl.startsWith('http://') && !repoUrl.startsWith('https://')) {
        setError("URL must start with http:// or https://");
        setLoading(false);
        return;
      }

      // First validate the repository URL
      await invoke("validate_extension_repo_url", { url: repoUrl });

      // Then create the repository
      await invoke("create_extensions_from_url", {
        url: repoUrl,
        name: repoName || null
      });

      // Refresh extensions list
      await refreshExtensions();

      // Close dialog and reset form
      setIsAddRepoDialogOpen(false);
      setRepoName("");
      setRepoUrl("");
    } catch (err) {
      setError(`Error adding repository URL: ${err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle repository deletion
  const handleDeleteRepo = async (repoId) => {
    try {
      setLoading(true);
      await invoke("delete_extension_repo", { id: repoId });
      await refreshExtensions();
    } catch (err) {
      setError(`Error deleting repository: ${err.toString()}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get language display name
  const getLanguageName = (code) => {
    const languages = {
      'en': 'English',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'multi': 'Multiple Languages'
    };
    return languages[code] || code;
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-left mb-4">
        Configure sources and content filtering for manga extensions
      </p>

      {/* NSFW Toggle */}
      <div className="flex items-center justify-between py-3 border-b">
        <div>
          <Label htmlFor="showNSFW" className="text-base font-medium">Show NSFW Content</Label>
          <p className="text-sm text-muted-foreground mt-1">
            When enabled, adult content from extensions will be displayed
          </p>
        </div>
        <Switch
          id="showNSFW"
          checked={showNSFW}
          onCheckedChange={(value) => handleValueChange(setShowNSFW, value)}
        />
      </div>

      {/* Repository and Extension Management */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Extension Sources</h3>
          <div className="flex gap-2">
            <Dialog open={isAddRepoDialogOpen} onOpenChange={setIsAddRepoDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Plus size={16} />
                  <span>Add Repository</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Extension Repository</DialogTitle>
                  <DialogDescription>
                    Add a repository to access more manga sources
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
                    <div className="space-y-2">
                      <Label htmlFor="repoName">Repository Name (Optional)</Label>
                      <Input
                        id="repoName"
                        placeholder="My Manga Repository"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                      />
                    </div>

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
                          Select Repository File
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="url" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="repoName">Repository Name (Optional)</Label>
                      <Input
                        id="repoName"
                        placeholder="My Manga Repository"
                        value={repoName}
                        onChange={(e) => setRepoName(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repoUrl">Repository URL</Label>
                      <Input
                        id="repoUrl"
                        placeholder="https://example.com/manga-extensions.json"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={handleUrlAdd}
                      className="w-full"
                      disabled={loading || !repoUrl}
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Link2 className="h-4 w-4 mr-2" />
                          Add Repository URL
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsAddRepoDialogOpen(false)}>
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={() => refreshExtensions()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Repositories Section */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Repositories</h4>
          <div className="space-y-2">
            {extensionsData.repositories && extensionsData.repositories.length > 0 ? (
              extensionsData.repositories.map(repo => (
                <div
                  key={repo.id}
                  className="flex items-center justify-between p-3 bg-accent/10 rounded-md hover:bg-accent/20 transition-colors"
                >
                  <div className="flex-1 mr-4">
                    <div className="font-medium">{repo.name}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-xs">{repo.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {repo.type === 'url' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(repo.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteRepo(repo.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed rounded-md">
                <p className="text-muted-foreground">No repositories added</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add a repository to access manga extensions
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator className="my-6" />

        {/* Extensions Section */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-3">
            Installed Extensions ({extensionsData.extensions?.length || 0})
          </h4>

          {extensionsData.extensions && extensionsData.extensions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {extensionsData.extensions.map(ext => (
                <Card key={ext.id} className="overflow-hidden border bg-card hover:bg-accent/5 transition-colors">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle className="text-base">{ext.name}</CardTitle>
                        <CardDescription className="text-xs">
                          v{ext.version} {ext.nsfw && <span className="text-red-500 ml-1">(NSFW)</span>}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 text-xs">
                    {ext.description && <p className="text-muted-foreground mb-2">{ext.description}</p>}

                    {ext.language && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        <span>{getLanguageName(ext.language)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed rounded-md">
              <Package className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No extensions installed</p>
              <p className="text-xs text-muted-foreground mt-1">
                Add a repository to get manga extensions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtensionSettings;