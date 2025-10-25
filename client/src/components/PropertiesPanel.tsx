import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ColorPicker } from "./ColorPicker";
import { FontSelector } from "./FontSelector";
import { PageComponent } from "@shared/schema";
import { ObjectUploader } from "./ObjectUploader";
import { Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import type { UploadResult } from "@uppy/core";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PropertiesPanelProps {
  component: PageComponent | null;
  onUpdate: (updates: Partial<PageComponent>) => void;
}

export function PropertiesPanel({ component, onUpdate }: PropertiesPanelProps) {
  if (!component) {
    return (
      <Card className="p-6 h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground text-center">
          Select a component to edit its properties
        </p>
      </Card>
    );
  }

  const updateStyle = (styleUpdates: Partial<PageComponent['style']>) => {
    onUpdate({
      style: {
        ...component.style,
        ...styleUpdates,
      },
    });
  };

  return (
    <Card className="p-4 h-full overflow-y-auto" data-testid="properties-panel">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="content" data-testid="tab-content">Content</TabsTrigger>
          <TabsTrigger value="style" data-testid="tab-style">Style</TabsTrigger>
          <TabsTrigger value="layout" data-testid="tab-layout">Layout</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Component Type</Label>
            <p className="text-sm text-muted-foreground capitalize mt-1">{component.type}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium">Content</Label>
            {component.type === 'text' || component.type === 'header' ? (
              <Textarea
                id="content"
                value={component.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                rows={4}
                data-testid="input-content"
              />
            ) : (
              <div className="space-y-2">
                <Input
                  id="content"
                  value={component.content}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder={component.type === 'image' ? 'Image URL' : 'Content'}
                  data-testid="input-content"
                />
                {component.type === 'image' && (
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={10485760}
                    onGetUploadParameters={async () => {
                      const res = await apiRequest('POST', '/api/objects/upload', undefined);
                      const data = await res.json();
                      return {
                        method: 'PUT' as const,
                        url: data.uploadURL,
                      };
                    }}
                    onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                      if (result.successful && result.successful.length > 0) {
                        const uploadedURL = result.successful[0].uploadURL;
                        const res = await apiRequest('PUT', '/api/images', { imageURL: uploadedURL });
                        const data = await res.json();
                        onUpdate({ content: data.objectPath });
                      }
                    }}
                    buttonClassName="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload from Computer
                  </ObjectUploader>
                )}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="style" className="space-y-4">
          {(component.type === 'text' || component.type === 'header' || component.type === 'button') && (
            <>
              <FontSelector
                font={component.style.fontFamily || 'Inter, sans-serif'}
                onChange={(font) => updateStyle({ fontFamily: font })}
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Font Size</Label>
                <Select
                  value={component.style.fontSize || '16px'}
                  onValueChange={(value) => updateStyle({ fontSize: value })}
                >
                  <SelectTrigger data-testid="select-font-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12px">12px - Small</SelectItem>
                    <SelectItem value="14px">14px - Normal</SelectItem>
                    <SelectItem value="16px">16px - Medium</SelectItem>
                    <SelectItem value="20px">20px - Large</SelectItem>
                    <SelectItem value="24px">24px - X-Large</SelectItem>
                    <SelectItem value="32px">32px - 2X-Large</SelectItem>
                    <SelectItem value="40px">40px - 3X-Large</SelectItem>
                    <SelectItem value="48px">48px - 4X-Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Font Weight</Label>
                <Select
                  value={component.style.fontWeight || '400'}
                  onValueChange={(value) => updateStyle({ fontWeight: value })}
                >
                  <SelectTrigger data-testid="select-font-weight">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="300">Light</SelectItem>
                    <SelectItem value="400">Normal</SelectItem>
                    <SelectItem value="500">Medium</SelectItem>
                    <SelectItem value="600">Semi-Bold</SelectItem>
                    <SelectItem value="700">Bold</SelectItem>
                    <SelectItem value="800">Extra-Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <ColorPicker
                label="Text Color"
                color={component.style.color || '#000000'}
                onChange={(color) => updateStyle({ color })}
              />
            </>
          )}

          <ColorPicker
            label="Background Color"
            color={component.style.backgroundColor || 'transparent'}
            onChange={(color) => updateStyle({ backgroundColor: color })}
          />

          {component.type === 'background' && (
            <div className="space-y-2">
              <Label htmlFor="bg-image" className="text-sm font-medium">Background Image URL</Label>
              <Input
                id="bg-image"
                value={component.style.backgroundImage || ''}
                onChange={(e) => updateStyle({ backgroundImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
                data-testid="input-background-image"
              />
              <ObjectUploader
                maxNumberOfFiles={1}
                maxFileSize={10485760}
                onGetUploadParameters={async () => {
                  const res = await apiRequest('POST', '/api/objects/upload', undefined);
                  const data = await res.json();
                  return {
                    method: 'PUT' as const,
                    url: data.uploadURL,
                  };
                }}
                onComplete={async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
                  if (result.successful && result.successful.length > 0) {
                    const uploadedURL = result.successful[0].uploadURL;
                    const res = await apiRequest('PUT', '/api/images', { imageURL: uploadedURL });
                    const data = await res.json();
                    updateStyle({ backgroundImage: `url(${data.objectPath})` });
                  }
                }}
                buttonClassName="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Background Image
              </ObjectUploader>
            </div>
          )}
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-medium">Width</Label>
              <Input
                id="width"
                value={component.style.width || 'auto'}
                onChange={(e) => updateStyle({ width: e.target.value })}
                placeholder="100% or 300px"
                data-testid="input-width"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height" className="text-sm font-medium">Height</Label>
              <Input
                id="height"
                value={component.style.height || 'auto'}
                onChange={(e) => updateStyle({ height: e.target.value })}
                placeholder="auto or 200px"
                data-testid="input-height"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Text Align</Label>
            <Select
              value={component.style.textAlign || 'left'}
              onValueChange={(value: 'left' | 'center' | 'right') => updateStyle({ textAlign: value })}
            >
              <SelectTrigger data-testid="select-text-align">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="padding" className="text-sm font-medium">Padding</Label>
            <Input
              id="padding"
              value={component.style.padding || '0'}
              onChange={(e) => updateStyle({ padding: e.target.value })}
              placeholder="16px or 1rem"
              data-testid="input-padding"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="margin" className="text-sm font-medium">Margin</Label>
            <Input
              id="margin"
              value={component.style.margin || '0'}
              onChange={(e) => updateStyle({ margin: e.target.value })}
              placeholder="16px or 1rem"
              data-testid="input-margin"
            />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
