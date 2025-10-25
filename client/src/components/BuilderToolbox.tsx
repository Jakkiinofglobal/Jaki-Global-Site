import { Card } from "@/components/ui/card";
import { Type, Image, Heading, Palette, MousePointer2, ShoppingBag } from "lucide-react";
import { ComponentType } from "@shared/schema";

interface ToolboxItem {
  type: ComponentType;
  icon: React.ReactNode;
  label: string;
  description: string;
}

const TOOLBOX_ITEMS: ToolboxItem[] = [
  {
    type: 'header',
    icon: <Heading className="w-6 h-6" />,
    label: 'Header',
    description: 'Add a header section',
  },
  {
    type: 'text',
    icon: <Type className="w-6 h-6" />,
    label: 'Text Box',
    description: 'Add editable text',
  },
  {
    type: 'image',
    icon: <Image className="w-6 h-6" />,
    label: 'Image',
    description: 'Add an image',
  },
  {
    type: 'background',
    icon: <Palette className="w-6 h-6" />,
    label: 'Background',
    description: 'Add a background section',
  },
  {
    type: 'button',
    icon: <MousePointer2 className="w-6 h-6" />,
    label: 'Button',
    description: 'Add a clickable button',
  },
  {
    type: 'productGrid',
    icon: <ShoppingBag className="w-6 h-6" />,
    label: 'Product Grid',
    description: 'Display Printify products',
  },
];

interface BuilderToolboxProps {
  onAddComponent: (type: ComponentType) => void;
}

export function BuilderToolbox({ onAddComponent }: BuilderToolboxProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-3">Components</h3>
        <div className="space-y-2">
          {TOOLBOX_ITEMS.map((item) => (
            <Card
              key={item.type}
              className="p-3 cursor-pointer hover-elevate active-elevate-2 transition-all"
              onClick={() => onAddComponent(item.type)}
              data-testid={`toolbox-${item.type}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-primary mt-0.5">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-0.5">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
