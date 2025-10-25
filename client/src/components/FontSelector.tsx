import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FontSelectorProps {
  font: string;
  onChange: (font: string) => void;
  label?: string;
}

const AVAILABLE_FONTS = [
  { name: 'Inter', value: 'Inter, sans-serif' },
  { name: 'Montserrat', value: 'Montserrat, sans-serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Open Sans', value: 'Open Sans, sans-serif' },
  { name: 'Poppins', value: 'Poppins, sans-serif' },
  { name: 'Playfair Display', value: 'Playfair Display, serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Lora', value: 'Lora, serif' },
  { name: 'Space Grotesk', value: 'Space Grotesk, sans-serif' },
  { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
  { name: 'Fira Code', value: 'Fira Code, monospace' },
  { name: 'IBM Plex Sans', value: 'IBM Plex Sans, sans-serif' },
  { name: 'DM Sans', value: 'DM Sans, sans-serif' },
  { name: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans, sans-serif' },
  { name: 'Outfit', value: 'Outfit, sans-serif' },
];

export function FontSelector({ font, onChange, label = "Font Family" }: FontSelectorProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Select value={font} onValueChange={onChange}>
        <SelectTrigger data-testid="select-font-family">
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_FONTS.map((fontOption) => (
            <SelectItem 
              key={fontOption.value} 
              value={fontOption.value}
              style={{ fontFamily: fontOption.value }}
              data-testid={`select-font-${fontOption.name.toLowerCase().replace(' ', '-')}`}
            >
              {fontOption.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
