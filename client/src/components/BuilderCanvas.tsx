import React from "react";
import { PageComponent } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BuilderCanvasProps {
  components: PageComponent[];
  selectedComponent: PageComponent | null;
  onSelectComponent: (component: PageComponent | null) => void; // allow null to clear selection
  onDeleteComponent: (id: string) => void;
}

function DeleteChip({
  id,
  onDelete,
}: {
  id: string;
  onDelete: (id: string) => void;
}) {
  return (
    <Button
      size="icon"
      variant="destructive"
      className="absolute -top-2 -right-2 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
      onClick={(e) => {
        e.stopPropagation();
        onDelete(id);
      }}
      data-testid={`button-delete-${id}`}
      aria-label="Delete component"
      title="Delete"
    >
      <Trash2 className="w-3 h-3" />
    </Button>
  );
}

/** ensure we build proper CSS background-image */
function buildBgStyle(urlStr?: string): React.CSSProperties {
  if (!urlStr) return {};
  // If user pasted url("...") already, strip wrappers
  const match = urlStr.match(/url\((.*)\)/i);
  const raw = match ? match[1].replace(/^['"]|['"]$/g, "") : urlStr;
  return {
    backgroundImage: `url(${raw})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}

export function BuilderCanvas({
  components,
  selectedComponent,
  onSelectComponent,
  onDeleteComponent,
}: BuilderCanvasProps) {
  // sort once, stable
  const sorted = [...components].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Treat the FIRST background component as the CANVAS backdrop
  const bgComponent = sorted.find((c) => c.type === "background") || null;
  const contentComponents = bgComponent
    ? sorted.filter((c) => c.id !== bgComponent.id)
    : sorted;

  const isBgSelected = selectedComponent?.id === bgComponent?.id;

  const canvasBg: React.CSSProperties = bgComponent
    ? {
        // base color from style
        backgroundColor: bgComponent.style?.backgroundColor || "transparent",
        // background image
        ...buildBgStyle(bgComponent.style?.backgroundImage),
        // spacing from style (optional)
        padding: (bgComponent.style?.padding as any) || "0",
        minHeight: "100%",
      }
    : { minHeight: "100%" };

  const renderComponent = (component: PageComponent) => {
    const isSelected = selectedComponent?.id === component.id;

    const style: React.CSSProperties = {
      ...(component.style ?? {}),
      cursor: "pointer",
      position: "relative",
      outline: isSelected ? "2px solid #3b82f6" : "none",
      outlineOffset: "2px",
    };

    const commonProps = {
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        onSelectComponent(component);
      },
      "data-testid": `canvas-component-${component.type}-${component.id}`,
      className: "group",
    };

    switch (component.type) {
      case "header":
        return (
          <div key={component.id} style={style} {...commonProps}>
            <h1
              style={{
                fontFamily: component.style.fontFamily,
                fontSize: (component.style.fontSize as any) || "32px",
                fontWeight: (component.style.fontWeight as any) || "700",
              }}
            >
              {component.content || "Header Text"}
            </h1>
            {isSelected && (
              <DeleteChip id={component.id} onDelete={onDeleteComponent} />
            )}
          </div>
        );

      case "text":
        return (
          <div key={component.id} style={style} {...commonProps}>
            <p style={{ fontFamily: component.style.fontFamily }}>
              {component.content || "Text content goes here..."}
            </p>
            {isSelected && (
              <DeleteChip id={component.id} onDelete={onDeleteComponent} />
            )}
          </div>
        );

      case "image":
        return (
          <div key={component.id} style={style} {...commonProps}>
            {component.content ? (
              <img
                src={component.content}
                alt="Component"
                style={{ maxWidth: "100%", height: "auto", display: "block" }}
                draggable={false}
              />
            ) : (
              <div className="bg-muted flex items-center justify-center p-8 rounded">
                <p className="text-muted-foreground text-sm">No image URL set</p>
              </div>
            )}
            {isSelected && (
              <DeleteChip id={component.id} onDelete={onDeleteComponent} />
            )}
          </div>
        );

      // NOTE: Secondary "background" components render as normal sections.
      // The *first* background becomes the canvas backdrop (see above).
      case "background": {
        const bgStyleInline: React.CSSProperties = component.style
          ?.backgroundImage
          ? {
              ...style,
              ...buildBgStyle(component.style.backgroundImage),
              minHeight: (component.style?.height as any) || "200px",
            }
          : { ...style, minHeight: (component.style?.height as any) || "200px" };

        return (
          <div key={component.id} style={bgStyleInline} {...commonProps}>
            <div className="p-8">
              {component.content || "Background section - add content or image"}
            </div>
            {isSelected && (
              <DeleteChip id={component.id} onDelete={onDeleteComponent} />
            )}
          </div>
        );
      }

      case "button":
        return (
          <div
            key={component.id}
            style={style}
            {...commonProps}
            className="group inline-block"
          >
            <button
              style={{
                fontFamily: component.style.fontFamily,
                padding:
                  (component.style.padding as any) || ("12px 24px" as any),
                borderRadius: "6px",
                border: "1px solid currentColor",
              }}
              onClick={(e) => e.preventDefault()}
            >
              {component.content || "Button Text"}
            </button>
            {isSelected && (
              <DeleteChip id={component.id} onDelete={onDeleteComponent} />
            )}
          </div>
        );

      case "productGrid":
        return (
          <div key={component.id} style={style} {...commonProps}>
            <div className="bg-muted p-8 rounded text-center">
              <p className="text-sm font-medium mb-2">Product Grid</p>
              <p className="text-xs text-muted-foreground">
                Products from Printify will be displayed here
              </p>
            </div>
            {isSelected && (
              <DeleteChip id={component.id} onDelete={onDeleteComponent} />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className="flex-1 p-0 overflow-auto bg-white dark:bg-card"
      onClick={() => onSelectComponent(null)}
      data-testid="builder-canvas"
    >
      {/* Canvas wrapper gets the page-wide background */}
      <div className="min-h-full w-full">
        <div
          className="max-w-6xl mx-auto space-y-4 min-h-screen p-8"
          style={canvasBg}
        >
          {/* If we *have* a background component, expose a tiny selector for it */}
          {bgComponent && (
            <div className="relative">
              <button
                className={`absolute right-0 -top-6 text-xs px-2 py-1 rounded border ${
                  isBgSelected ? "bg-primary text-primary-foreground" : "bg-card"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectComponent(bgComponent);
                }}
                data-testid={`button-select-background-${bgComponent.id}`}
                title="Select page background"
              >
                Canvas Background
              </button>
            </div>
          )}

          {/* Render all non-background (or secondary background) components */}
          {contentComponents.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Your canvas is empty</p>
                <p className="text-sm text-muted-foreground">
                  Click on components from the toolbox to add them to your page
                </p>
              </div>
            </div>
          ) : (
            contentComponents.map(renderComponent)
          )}

          {/* If there is NO background component, still allow clearing selection by clicking whitespace */}
          {!bgComponent && (
            <div
              className="w-full h-4"
              onClick={(e) => {
                e.stopPropagation();
                onSelectComponent(null);
              }}
            />
          )}
        </div>
      </div>
    </Card>
  );
}
