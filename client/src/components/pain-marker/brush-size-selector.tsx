import { Slider } from "@/components/ui/slider";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function BrushSizeSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Brush Size</label>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={2}
        max={20}
        step={1}
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Small</span>
        <span>Large</span>
      </div>
    </div>
  );
}
