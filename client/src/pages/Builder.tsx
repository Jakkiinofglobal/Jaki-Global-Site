import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BuilderToolbox } from "@/components/BuilderToolbox";
import { BuilderCanvas } from "@/components/BuilderCanvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageComponent, ComponentType, PageConfig } from "@shared/schema";
import { Save, Eye, Download, ShoppingBag, Plus, Trash2, Edit2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Builder() {
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const [currentPageTitle, setCurrentPageTitle] = useState<string>('Untitled');
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingPageName, setEditingPageName] = useState("");
  const [showNewPageDialog, setShowNewPageDialog] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const { toast} = useToast();

  // Load existing page configuration
  const { data: pages } = useQuery<PageConfig[]>({
    queryKey: ['/api/pages'],
  });

  // Load the first page on mount or create a new one
  useEffect(() => {
    if (pages && pages.length > 0 && !pageId) {
      const firstPage = pages[0];
      setPageId(firstPage.id);
      setCurrentPageTitle(firstPage.name);
      setComponents(firstPage.components as PageComponent[]);
    }
  }, [pages, pageId]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (): Promise<PageConfig> => {
      const configData = {
        name: currentPageTitle,
        components: components,
      };

      if (pageId) {
        // Update existing page
        const res = await apiRequest('PUT', `/api/pages/${pageId}`, configData);
        return res.json();
      } else {
        // Create new page
        const res = await apiRequest('POST', '/api/pages', configData);
        return res.json();
      }
    },
    onSuccess: (data: PageConfig) => {
      setPageId(data.id);
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Saved!",
        description: "Your page configuration has been saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save page configuration",
        variant: "destructive",
      });
    },
  });

  // Create new page mutation
  const createPageMutation = useMutation({
    mutationFn: async (name: string): Promise<PageConfig> => {
      const res = await apiRequest('POST', '/api/pages', {
        name,
        components: [],
      });
      return res.json();
    },
    onSuccess: (data: PageConfig) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      setPageId(data.id);
      // Title already optimistically updated, just confirm it
      setCurrentPageTitle(data.name);
      setComponents([]);
      setShowNewPageDialog(false);
      setNewPageName("");
      toast({
        title: "Page created!",
        description: `${data.name} has been created`,
      });
    },
    onError: () => {
      // Revert to previous title on error
      const currentPage = pages?.find(p => p.id === pageId);
      if (currentPage) {
        setCurrentPageTitle(currentPage.name);
      }
      toast({
        title: "Error",
        description: "Failed to create page",
        variant: "destructive",
      });
    },
  });

  // Rename page mutation
  const renamePageMutation = useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      // Use current components if renaming the active page
      const componentsToSave = id === pageId ? components : (pages?.find(p => p.id === id)?.components || []);
      
      const res = await apiRequest('PUT', `/api/pages/${id}`, {
        name,
        components: componentsToSave,
      });
      return res.json();
    },
    onSuccess: (data, { id, name }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      
      // Title already optimistically updated, just confirm it
      setEditingPageId(null);
      setEditingPageName("");
      toast({
        title: "Page renamed!",
      });
    },
    onError: (error, { id }) => {
      // Revert optimistic update on error
      if (id === pageId) {
        const originalPage = pages?.find(p => p.id === id);
        if (originalPage) {
          setCurrentPageTitle(originalPage.name);
        }
      }
      toast({
        title: "Error",
        description: "Failed to rename page",
        variant: "destructive",
      });
    },
  });

  // Delete page mutation
  const deletePageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest('DELETE', `/api/pages/${id}`, undefined);
      return res.json();
    },
    onSuccess: async (_, deletedId) => {
      // Invalidate and wait for fresh data
      await queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      
      // If we deleted the current page, switch to another one using fresh data
      if (pageId === deletedId) {
        // Wait a tick for the query to settle
        await new Promise(resolve => setTimeout(resolve, 0));
        
        // Get fresh pages data
        const freshPages = queryClient.getQueryData<PageConfig[]>(['/api/pages']);
        const remainingPage = freshPages?.[0];
        
        if (remainingPage) {
          setPageId(remainingPage.id);
          setCurrentPageTitle(remainingPage.name);
          setComponents(remainingPage.components as PageComponent[]);
          setSelectedComponent(null);
        } else {
          // No pages left (shouldn't happen due to UI disable)
          setPageId(null);
          setCurrentPageTitle('Untitled');
          setComponents([]);
          setSelectedComponent(null);
        }
      }
      
      toast({
        title: "Page deleted!",
      });
    },
  });

  const addComponent = (type: ComponentType) => {
    const newComponent: PageComponent = {
      id: `${type}-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      style: getDefaultStyle(type),
      position: { x: 0, y: 0 },
      order: components.length,
    };

    setComponents([...components, newComponent]);
    setSelectedComponent(newComponent);
    
    toast({
      title: "Component added",
      description: `${type} component has been added to your page`,
    });
  };

  const getDefaultContent = (type: ComponentType): string => {
    switch (type) {
      case 'header':
        return 'Jaki Global';
      case 'text':
        return 'Your text here...';
      case 'image':
        return '';
      case 'background':
        return '';
      case 'button':
        return 'Click Here';
      case 'productGrid':
        return '';
      default:
        return '';
    }
  };

  const getDefaultStyle = (type: ComponentType): PageComponent['style'] => {
    switch (type) {
      case 'header':
        return {
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '48px',
          fontWeight: '700',
          color: '#000000',
          backgroundColor: 'transparent',
          padding: '32px 0',
          textAlign: 'center',
        };
      case 'text':
        return {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: '400',
          color: '#000000',
          backgroundColor: 'transparent',
          padding: '16px',
        };
      case 'image':
        return {
          width: '100%',
          padding: '16px',
        };
      case 'background':
        return {
          backgroundColor: '#f5f5f5',
          padding: '64px 32px',
          width: '100%',
        };
      case 'button':
        return {
          fontFamily: 'Inter, sans-serif',
          fontSize: '16px',
          fontWeight: '600',
          color: '#ffffff',
          backgroundColor: '#3b82f6',
          padding: '12px 32px',
          margin: '16px 0',
        };
      case 'productGrid':
        return {
          padding: '32px 0',
          width: '100%',
        };
      default:
        return {};
    }
  };

  const updateComponent = (updates: Partial<PageComponent>) => {
    if (!selectedComponent) return;

    const updatedComponents = components.map(comp =>
      comp.id === selectedComponent.id
        ? { ...comp, ...updates }
        : comp
    );

    setComponents(updatedComponents);
    setSelectedComponent({ ...selectedComponent, ...updates });
  };

  const deleteComponent = (id: string) => {
    setComponents(components.filter(comp => comp.id !== id));
    if (selectedComponent?.id === id) {
      setSelectedComponent(null);
    }
    toast({
      title: "Component deleted",
      description: "Component has been removed from your page",
    });
  };

  const saveConfiguration = () => {
    saveMutation.mutate();
  };

  const switchPage = async (id: string) => {
    // Save current page first (even if empty - deletions need to persist)
    if (pageId) {
      try {
        await saveMutation.mutateAsync();
      } catch (error) {
        console.error("Failed to save before switching:", error);
        toast({
          title: "Error",
          description: "Failed to save current page",
          variant: "destructive",
        });
        return; // Don't switch if save fails
      }
    }
    
    // Switch to new page
    const page = pages?.find(p => p.id === id);
    if (page) {
      setPageId(page.id);
      setCurrentPageTitle(page.name);
      setComponents(page.components as PageComponent[]);
      setSelectedComponent(null);
    }
  };

  const startEditingPage = (id: string, name: string) => {
    setEditingPageId(id);
    setEditingPageName(name);
  };

  const savePageName = () => {
    if (editingPageId && editingPageName.trim()) {
      const newName = editingPageName.trim();
      
      // Optimistically update local title if renaming current page
      if (editingPageId === pageId) {
        setCurrentPageTitle(newName);
      }
      
      renamePageMutation.mutate({
        id: editingPageId,
        name: newName,
      });
    }
  };

  const cancelEditingPage = () => {
    setEditingPageId(null);
    setEditingPageName("");
  };

  const createNewPage = async () => {
    if (newPageName.trim()) {
      const pageName = newPageName.trim();
      
      // Optimistically update title (will be set correctly in onSuccess too)
      setCurrentPageTitle(pageName);
      
      createPageMutation.mutate(pageName);
    }
  };

  const exportPage = () => {
    // Generate HTML export
    const html = generateHTML();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jaki-global-site.html';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Your page has been downloaded as HTML",
    });
  };

  const generateHTML = () => {
    const componentsHTML = components
      .sort((a, b) => a.order - b.order)
      .map(comp => {
        const styleStr = Object.entries(comp.style)
          .map(([key, value]) => {
            const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
            return `${cssKey}: ${value}`;
          })
          .join('; ');

        switch (comp.type) {
          case 'header':
            return `<h1 style="${styleStr}">${comp.content}</h1>`;
          case 'text':
            return `<p style="${styleStr}">${comp.content}</p>`;
          case 'image':
            return comp.content ? `<img src="${comp.content}" style="${styleStr}" alt="Image" />` : '';
          case 'background':
            const bgStyle = comp.style.backgroundImage 
              ? `${styleStr}; background-image: url(${comp.style.backgroundImage}); background-size: cover;`
              : styleStr;
            return `<div style="${bgStyle}">${comp.content}</div>`;
          case 'button':
            return `<button style="${styleStr}">${comp.content}</button>`;
          case 'productGrid':
            return `<div style="${styleStr}"><p>Product grid will be populated from Printify</p></div>`;
          default:
            return '';
        }
      })
      .join('\n');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Jaki Global</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
    }
  </style>
</head>
<body>
  ${componentsHTML}
  
  <footer style="background-color:#0d0d0d; color:#ffffff; text-align:center; padding:20px; font-family:Arial, sans-serif;">
    <p style="margin:6px 0; font-size:16px;">
      <strong>Contact:</strong> 
      <a href="mailto:jakiinfo.global@gmail.com" style="color:#00aced; text-decoration:none;">
        jakiinfo.global@gmail.com
      </a>
    </p>
    <p style="margin:6px 0; font-size:16px;">
      <strong>Please donate:</strong> 
      <span style="font-weight:bold; color:#ff4d4d;">$26KG1</span>
    </p>
    <p style="margin:6px 0; font-size:13px; opacity:0.7;">
      © 2025 Jaki Global. All rights reserved.
    </p>
  </footer>
</body>
</html>`;
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-brand font-bold" data-testid="text-app-title">Jaki Global</h1>
          <span className="text-sm text-muted-foreground">Website Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/shop">
            <Button variant="outline" className="gap-2" data-testid="button-view-shop">
              <ShoppingBag className="w-4 h-4" />
              View Shop
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={saveConfiguration} 
            className="gap-2" 
            data-testid="button-save"
            disabled={saveMutation.isPending}
          >
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" className="gap-2" data-testid="button-preview">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button onClick={exportPage} className="gap-2" data-testid="button-export">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Pages & Toolbox */}
        <aside className="w-72 border-r bg-card p-6 overflow-y-auto">
          {/* Pages Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Pages</h2>
              <Button
                size="sm"
                variant="outline"
                className="gap-1"
                onClick={() => setShowNewPageDialog(true)}
                data-testid="button-new-page"
              >
                <Plus className="w-3 h-3" />
                New
              </Button>
            </div>
            
            <div className="space-y-2">
              {pages?.map((page) => (
                <div
                  key={page.id}
                  className={`p-2 rounded-md border ${
                    page.id === pageId ? 'bg-accent border-primary' : 'border-border hover-elevate'
                  }`}
                >
                  {editingPageId === page.id ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={editingPageName}
                        onChange={(e) => setEditingPageName(e.target.value)}
                        className="h-7 text-sm"
                        data-testid="input-page-name"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') savePageName();
                          if (e.key === 'Escape') cancelEditingPage();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={savePageName}
                        data-testid="button-save-page-name"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={cancelEditingPage}
                        data-testid="button-cancel-page-name"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <button
                        className="flex-1 text-left text-sm truncate"
                        onClick={() => switchPage(page.id)}
                        data-testid={`button-page-${page.id}`}
                      >
                        {page.name}
                      </button>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => startEditingPage(page.id, page.name)}
                          data-testid={`button-edit-page-${page.id}`}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive"
                          onClick={() => {
                            if (confirm(`Delete "${page.name}"?`)) {
                              deletePageMutation.mutate(page.id);
                            }
                          }}
                          data-testid={`button-delete-page-${page.id}`}
                          disabled={pages.length === 1}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <BuilderToolbox onAddComponent={addComponent} />
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 p-6 overflow-hidden">
          <BuilderCanvas
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onDeleteComponent={deleteComponent}
          />
        </main>

        {/* Right Sidebar - Properties */}
        <aside className="w-80 border-l bg-card p-6 overflow-hidden">
          <PropertiesPanel
            component={selectedComponent}
            onUpdate={updateComponent}
          />
        </aside>
      </div>

      {/* New Page Dialog */}
      <Dialog open={showNewPageDialog} onOpenChange={setShowNewPageDialog}>
        <DialogContent data-testid="dialog-new-page">
          <DialogHeader>
            <DialogTitle>Create New Page</DialogTitle>
            <DialogDescription>
              Enter a name for your new page. It will appear in the navigation menu.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={newPageName}
            onChange={(e) => setNewPageName(e.target.value)}
            placeholder="Page name (e.g., About, Contact, Services)"
            data-testid="input-new-page-name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') createNewPage();
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNewPageDialog(false)}
              data-testid="button-cancel-new-page"
            >
              Cancel
            </Button>
            <Button
              onClick={createNewPage}
              disabled={!newPageName.trim() || createPageMutation.isPending}
              data-testid="button-create-page"
            >
              {createPageMutation.isPending ? 'Creating...' : 'Create Page'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
