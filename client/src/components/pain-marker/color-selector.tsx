import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pain Type</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Object.entries(painTypes).map(([color, label]) => (
          <Button
            key={color}
            variant={value === color ? "default" : "outline"}
            className={`h-auto py-3 relative overflow-hidden group`}
            onClick={() => onChange(color)}
            style={{
              backgroundColor: value === color ? color.toLowerCase() : 'transparent',
              borderColor: color.toLowerCase(),
              // Use black text for yellow when selected, white for others
              color: value === color && color === 'YELLOW' ? 'black' : (value === color ? 'white' : 'inherit')
            }}
          >
            <div className="relative z-10 font-medium text-sm leading-tight">
              {label}
            </div>
            {value !== color && (
              <div 
                className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ backgroundColor: color.toLowerCase() }}
              />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}