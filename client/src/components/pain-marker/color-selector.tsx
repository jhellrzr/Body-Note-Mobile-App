import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";
import { AlertCircle, Zap, Flame, Activity, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

// Map icons to pain types
const painTypeIcons = {
  RED: AlertCircle, // Sharp/Stabbing
  BLUE: Activity,   // Dull/Aching
  YELLOW: Flame,    // Burning
  GREEN: Star,      // Stiffness
  PURPLE: Zap      // Numbness/Tingling
};

export default function ColorSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pain Type</label>
      <div className="flex flex-wrap gap-2">
        {Object.entries(painTypes).map(([color, label]) => {
          const Icon = painTypeIcons[color as keyof typeof painTypeIcons];
          const isSelected = value === color;

          return (
            <Button
              key={color}
              variant={isSelected ? "default" : "outline"}
              size="sm"
              className={cn(
                "relative group transition-all duration-200",
                isSelected ? "pr-4" : "aspect-square p-2"
              )}
              onClick={() => onChange(color)}
              style={{
                backgroundColor: isSelected ? color.toLowerCase() : 'transparent',
                borderColor: color.toLowerCase(),
                color: isSelected && color === 'YELLOW' ? 'black' : (isSelected ? 'white' : 'inherit')
              }}
            >
              <Icon className="h-4 w-4" />
              {isSelected && (
                <span className="ml-2 font-medium">
                  {label}
                </span>
              )}
              {!isSelected && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/75 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none">
                  {label}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}