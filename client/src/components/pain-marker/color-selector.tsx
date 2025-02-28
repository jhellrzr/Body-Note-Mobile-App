import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {Object.entries(painTypes).map(([color, label]) => (
        <Button
          key={color}
          variant={value === color ? "default" : "outline"}
          className={`h-20 relative overflow-hidden group`}
          onClick={() => onChange(color)}
          style={{
            backgroundColor: value === color ? color.toLowerCase() : 'transparent',
            borderColor: color.toLowerCase(),
            color: value === color ? 'white' : 'inherit'
          }}
        >
          <div className="relative z-10 font-medium">
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
  );
}