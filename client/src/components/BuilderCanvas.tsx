import { PageComponent } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuilderCanvasProps {
  components: PageComponent[];
  selectedComponent: PageComponent | null;
  onSelectComponent: (component: PageComponent) => void;
  onDeleteComponent: (id: string) => void;
}

export function BuilderCanvas({
  components,
  selectedComponent,
  onSelectComponent,
  onDeleteComponent,
}: BuilderCanvasProps) {
  const renderComponent = (component: PageComponent) => {
    const isSelected = selectedComponent?.id === component.id;
    const style = {
      ...component.style,
      cursor: 'pointer',
      position: 'relative' as const,
      outline: isSelected ? '2px solid #3b82f6' : 'none',
      outlineOffset: '2px',
    };

    const commonProps = {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectComponent(component);
      },
      'data-testid': `canvas-component-${component.type}-${component.id}`,
    };

    switch (component.type) {
      case 'header':
        return (
          <div key={component.id} style={style} className="group" {...commonProps}>
            <h1 style={{ fontFamily: component.style.fontFamily, fontSize: component.style.fontSize || '32px', fontWeight: component.style.fontWeight || '700' }}>
              {component.content || 'Header Text'}
            </h1>
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(component.id);
                }}
                data-testid={`button-delete-${component.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case 'text':
        return (
          <div key={component.id} style={style} className="group" {...commonProps}>
            <p style={{ fontFamily: component.style.fontFamily }}>
              {component.content || 'Text content goes here...'}
            </p>
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(component.id);
                }}
                data-testid={`button-delete-${component.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case 'image':
        return (
          <div key={component.id} style={style} className="group" {...commonProps}>
            {component.content ? (
              <img
                src={component.content}
                alt="Component"
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            ) : (
              <div className="bg-muted flex items-center justify-center p-8 rounded">
                <p className="text-muted-foreground text-sm">No image URL set</p>
              </div>
            )}
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(component.id);
                }}
                data-testid={`button-delete-${component.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case 'background':
        const bgStyle = component.style.backgroundImage
          ? { backgroundImage: `url(${component.style.backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : {};
        return (
          <div key={component.id} style={{ ...style, ...bgStyle, minHeight: '200px' }} className="group" {...commonProps}>
            <div className="p-8">
              {component.content || 'Background section - add content or image'}
            </div>
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(component.id);
                }}
                data-testid={`button-delete-${component.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case 'button':
        return (
          <div key={component.id} style={style} className="group inline-block" {...commonProps}>
            <button
              style={{
                fontFamily: component.style.fontFamily,
                padding: component.style.padding || '12px 24px',
                borderRadius: '6px',
                border: '1px solid currentColor',
              }}
              onClick={(e) => e.preventDefault()}
            >
              {component.content || 'Button Text'}
            </button>
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(component.id);
                }}
                data-testid={`button-delete-${component.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      case 'productGrid':
        return (
          <div key={component.id} style={style} className="group" {...commonProps}>
            <div className="bg-muted p-8 rounded text-center">
              <p className="text-sm font-medium mb-2">Product Grid</p>
              <p className="text-xs text-muted-foreground">
                Products from Printify will be displayed here
              </p>
            </div>
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteComponent(component.id);
                }}
                data-testid={`button-delete-${component.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card 
      className="flex-1 p-8 overflow-auto bg-white dark:bg-card" 
      onClick={() => onSelectComponent(null as any)}
      data-testid="builder-canvas"
    >
      <div className="max-w-6xl mx-auto space-y-4 min-h-full">
        {components.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground mb-2">Your canvas is empty</p>
              <p className="text-sm text-muted-foreground">
                Click on components from the toolbox to add them to your page
              </p>
            </div>
          </div>
        ) : (
          components
            .sort((a, b) => a.order - b.order)
            .map(renderComponent)
        )}
      </div>
    </Card>
  );
}
