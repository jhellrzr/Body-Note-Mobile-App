import { Slider } from "@/components/ui/slider";

interface Props {
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

const colorMap = {
  RED: '#ff0000',
  BLUE: '#0000ff',
  YELLOW: '#ffff00',
  GREEN: '#00ff00',
  PURPLE: '#800080'
};

export default function IntensitySelector({ value, onChange, color = 'RED' }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Pain Intensity</label>
      <div 
        className="relative" 
        style={{
          '--slider-color': colorMap[color as keyof typeof colorMap] || '#000000'
        } as React.CSSProperties}
      >
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={1}
          max={5}
          step={1}
          className="[&_[role=slider]]:bg-[var(--slider-color)] [&_[role=slider]]:border-[var(--slider-color)] [&_[role=range]]:bg-[var(--slider-color)]"
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Mild</span>
        <span>Severe</span>
      </div>
    </div>
  );
}