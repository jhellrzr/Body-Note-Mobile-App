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
          className={`h-20 ${color.toLowerCase()}`}
          onClick={() => onChange(color)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
