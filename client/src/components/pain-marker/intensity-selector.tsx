import { Slider } from "@/components/ui/slider";

interface Props {
  value: number;
  onChange: (value: number) => void;
}

export default function IntensitySelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pain Intensity</label>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={5}
        step={1}
      />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Mild</span>
        <span>Severe</span>
      </div>
    </div>
  );
}
