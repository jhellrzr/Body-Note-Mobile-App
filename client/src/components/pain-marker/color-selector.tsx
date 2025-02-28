import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorSelector({ value, onChange }: Props) {
  return (
    <div className="flex flex-col space-y-2">
      {Object.entries(painTypes).map(([color, label]) => (
        <Button
          key={color}
          variant={value === color ? "default" : "outline"}
          className="relative overflow-hidden group"
          onClick={() => onChange(color)}
          style={{
            backgroundColor: value === color ? color.toLowerCase() : 'transparent',
            borderColor: color.toLowerCase(),
            color: value === color ? 'white' : 'inherit'
          }}
        >
          <div className="relative z-10 font-medium py-2">
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