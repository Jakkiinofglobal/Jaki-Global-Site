import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BuilderToolbox } from "@/components/BuilderToolbox";
import { BuilderCanvas } from "@/components/BuilderCanvas";
import { PropertiesPanel } from "@/components/PropertiesPanel";
import { Button } from "@/components/ui/button";
import { PageComponent, ComponentType, PageConfig } from "@shared/schema";
import { Save, Eye, Download, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Builder() {
  const [components, setComponents] = useState<PageComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<PageComponent | null>(null);
  const [pageId, setPageId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load existing page configuration
  const { data: pages } = useQuery<PageConfig[]>({
    queryKey: ['/api/pages'],
  });

  // Load the first page on mount or create a new one
  useEffect(() => {
    if (pages && pages.length > 0) {
      const firstPage = pages[0];
      setPageId(firstPage.id);
      setComponents(firstPage.components as PageComponent[]);
    }
  }, [pages]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const configData = {
        name: 'my-page',
        components: components,
      };

      if (pageId) {
        // Update existing page
        return apiRequest('PUT', `/api/pages/${pageId}`, configData);
      } else {
        // Create new page
        return apiRequest('POST', '/api/pages', configData);
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
        {/* Left Sidebar - Toolbox */}
        <aside className="w-72 border-r bg-card p-6 overflow-y-auto">
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
    </div>
  );
}
