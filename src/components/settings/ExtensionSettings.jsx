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
import { useAtom } from "jotai";
import { focusAtom } from "jotai-optics";
import { settingsAtom, saveSettingsAtom } from "@/store/settings";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Plus, ExternalLink, Trash2, RefreshCw, Link2, FileText, Download } from "lucide-react";

// Settings Jotai Atoms for Extension tab
const showNsfwAtom = focusAtom(settingsAtom, optic => optic.prop("show_nsfw"));
const extensionReposAtom = focusAtom(settingsAtom, optic => optic.prop("extension_repos"));

const ExtensionSettings = () => {
  // State for manage repository dialog
  const [isManageRepoOpen, setIsManageRepoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoName, setRepoName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get individual atoms for settings
  const [showNSFW, setShowNSFW] = useAtom(showNsfwAtom);
  const [extensionRepos, setExtensionRepos] = useAtom(extensionReposAtom);
  const [, saveSettings] = useAtom(saveSettingsAtom);

  // Initialize extension_repos if it doesn't exist
  useEffect(() => {
    if (!extensionRepos) {
      setExtensionRepos([]);
      setTimeout(() => saveSettings(), 0);
    }
  }, [extensionRepos, setExtensionRepos, saveSettings]);

  // Auto-save handler for form elements
  const handleValueChange = (setter, value) => {
    setter(value);
    setTimeout(() => saveSettings(), 0);
  };

  // Handle file upload for extension repository
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
        const fileName = filePath.split('/').pop().split('\\').pop();

        // Validate the repository file
        try {
          // Use invoke to check if the file contains valid extension data
          // This assumes you've implemented a validateExtensionRepo function on the Rust side
          await invoke("validate_extension_repo", { path: filePath });

          // Add to repositories list
          const newRepo = {
            id: Date.now().toString(),
            name: repoName || fileName.replace('.json', ''),
            type: 'file',
            url: filePath,
            addedAt: new Date().toISOString()
          };

          setExtensionRepos([...extensionRepos, newRepo]);
          setTimeout(() => saveSettings(), 0);

          // Close dialog and reset form
          setIsManageRepoOpen(false);
          setRepoName("");
          setRepoUrl("");
        } catch (validationErr) {
          setError(`Invalid extension repository file: ${validationErr}`);
        }
      }
    } catch (err) {
      console.error("Failed to add repository file:", err);
      setError(`Failed to add repository file: ${err}`);
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

      // Validate repository URL
      try {
        // Use invoke to check if the URL contains valid extension data
        // This assumes you've implemented a validateExtensionRepoUrl function on the Rust side
        await invoke("validate_extension_repo_url", { url: repoUrl });

        // Add to repositories list
        const newRepo = {
          id: Date.now().toString(),
          name: repoName || new URL(repoUrl).hostname,
          type: 'url',
          url: repoUrl,
          addedAt: new Date().toISOString()
        };

        setExtensionRepos([...extensionRepos, newRepo]);
        setTimeout(() => saveSettings(), 0);

        // Close dialog and reset form
        setIsManageRepoOpen(false);
        setRepoName("");
        setRepoUrl("");
      } catch (validationErr) {
        setError(`Invalid extension repository URL: ${validationErr}`);
      }
    } catch (err) {
      console.error("Failed to add repository URL:", err);
      setError(`Failed to add repository URL: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle repository deletion
  const handleDeleteRepo = (repoId) => {
    const updatedRepos = extensionRepos.filter(repo => repo.id !== repoId);
    setExtensionRepos(updatedRepos);
    setTimeout(() => saveSettings(), 0);
  };

  // Handle repository refresh
  const handleRefreshRepo = async (repo) => {
    try {
      setLoading(true);

      // This assumes you've implemented a refreshExtensionRepo function on the Rust side
      await invoke("refresh_extension_repo", {
        id: repo.id,
        url: repo.url,
        type: repo.type
      });

      // Show success message or update UI as needed
      setLoading(false);
    } catch (err) {
      console.error("Failed to refresh repository:", err);
      setError(`Failed to refresh repository: ${err}`);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-left mb-4">
        Configure extension sources and filters
      </p>

      {/* Extension Repositories */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Extension Repositories</Label>
          <Dialog open={isManageRepoOpen} onOpenChange={setIsManageRepoOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                <span>Add Repository</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Extension Repository</DialogTitle>
                <DialogDescription>
                  Add a repository by file or URL to access more extensions.
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
                      placeholder="My Extensions Repository"
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
                      placeholder="My Extensions Repository"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repoUrl">Repository URL</Label>
                    <Input
                      id="repoUrl"
                      placeholder="https://example.com/extensions.json"
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
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setIsManageRepoOpen(false)}>
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Repository List */}
        <div className="space-y-3 mt-2">
          {extensionRepos && extensionRepos.length > 0 ? (
            extensionRepos.map(repo => (
              <Card key={repo.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{repo.name}</CardTitle>
                      <CardDescription className="text-xs truncate max-w-[300px]">
                        {repo.url}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1">
                      {repo.type === 'url' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(repo.url, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRefreshRepo(repo)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRepo(repo.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="py-0">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      {repo.type === 'file' ? (
                        <FileText className="h-3 w-3" />
                      ) : (
                        <Link2 className="h-3 w-3" />
                      )}
                      <span>Type: {repo.type === 'file' ? 'Local File' : 'URL'}</span>
                    </div>
                    <div className="text-xs mt-1">
                      Added: {new Date(repo.addedAt).toLocaleString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-6 border border-dashed rounded-lg">
              <Download className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">No repositories added yet.</p>
              <p className="text-sm text-muted-foreground mt-1">
                Add a repository to access more extensions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Show NSFW */}
      <div className="flex items-center pt-4 border-t">
        <Label htmlFor="showNSFW" className="w-48">Show NSFW</Label>
        <div>
          <Switch
            id="showNSFW"
            checked={showNSFW}
            onCheckedChange={(value) => handleValueChange(setShowNSFW, value)}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground mt-6">
        Note: NSFW content will only be displayed if this option is enabled. You must restart the application after changing extension repositories.
      </p>
    </div>
  );
};

export default ExtensionSettings;