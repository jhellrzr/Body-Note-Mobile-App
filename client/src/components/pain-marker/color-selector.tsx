import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorSelector({ value, onChange }: Props) {
  const painTypeLabels = {
    RED: "sharp",
    BLUE: "dull",
    YELLOW: "burning",
    GREEN: "tingling",
    PURPLE: "throbbing"
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(painTypeLabels).map(([color, label]) => {
        const isSelected = value === color;

        return (
          <Button
            key={color}
            variant="outline"
            className="h-10 px-4"
            onClick={() => onChange(color)}
            style={{
              backgroundColor: isSelected ? color.toLowerCase() : 'transparent',
              borderColor: color.toLowerCase(),
              color: isSelected && color === 'YELLOW' ? 'black' : (isSelected ? 'white' : color.toLowerCase())
            }}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}