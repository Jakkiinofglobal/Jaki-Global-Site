import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette } from "lucide-react";

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
];

const METALLIC_COLORS = [
  { name: 'Gold', value: '#D4AF37' },
  { name: 'Light Gold', value: '#FFD700' },
  { name: 'Rose Gold', value: '#B76E79' },
  { name: 'Bronze', value: '#CD7F32' },
  { name: 'Silver', value: '#C0C0C0' },
  { name: 'Light Silver', value: '#E8E8E8' },
  { name: 'Platinum', value: '#E5E4E2' },
  { name: 'Chrome', value: '#AAA9AD' },
];

export function ColorPicker({ color, onChange, label = "Color" }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(color);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2 hover-elevate active-elevate-2"
            data-testid="button-color-picker"
          >
            <div 
              className="w-5 h-5 rounded border" 
              style={{ backgroundColor: color }}
            />
            <span className="flex-1 text-left truncate">{color}</span>
            <Palette className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" data-testid="popover-color-picker">
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                Standard Colors
              </Label>
              <div className="grid grid-cols-9 gap-2">
                {PRESET_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    className="w-7 h-7 rounded border border-border hover-elevate active-elevate-2"
                    style={{ backgroundColor: presetColor }}
                    onClick={() => onChange(presetColor)}
                    data-testid={`button-color-${presetColor}`}
                  />
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                Metallic Colors
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {METALLIC_COLORS.map((metallic) => (
                  <button
                    key={metallic.value}
                    className="p-2 rounded border border-border hover-elevate active-elevate-2 flex flex-col items-center gap-1"
                    onClick={() => onChange(metallic.value)}
                    data-testid={`button-metallic-${metallic.name.toLowerCase().replace(' ', '-')}`}
                  >
                    <div 
                      className="w-full h-6 rounded border" 
                      style={{ backgroundColor: metallic.value }}
                    />
                    <span className="text-xs text-muted-foreground truncate w-full text-center">
                      {metallic.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-2 block">
                Custom Color
              </Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                  data-testid="input-custom-color"
                />
                <Button 
                  size="sm"
                  onClick={() => onChange(customColor)}
                  data-testid="button-apply-custom-color"
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
