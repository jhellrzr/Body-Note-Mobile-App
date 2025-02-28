import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";
import { useTranslation } from "react-i18next";

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorSelector({ value, onChange }: Props) {
  const { t } = useTranslation();

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
            // Make text black for yellow when selected, white for others
            color: value === color && color === 'YELLOW' ? 'black' : value === color ? 'white' : 'inherit'
          }}
        >
          <div className="relative z-10 font-medium py-2">
            {t(`pain.types.${label.toLowerCase()}`)}
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