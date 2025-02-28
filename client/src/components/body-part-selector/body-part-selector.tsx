import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

const BODY_PARTS = {
  hand: {
    name: "Hand/Wrist",
    sides: ["Left", "Right"],
    views: ["Palm", "Back"],
    available: true
  },
  ankle: {
    name: "Ankle",
    sides: ["Left", "Right"],
    views: ["Front", "Back"],
    available: false
  },
  knee: {
    name: "Knee",
    sides: ["Left", "Right"],
    views: ["Front", "Back"],
    available: false
  },
  back: {
    name: "Back",
    sides: null,
    views: ["Full", "Upper", "Middle", "Lower"],
    available: false
  }
};

type BodyPart = keyof typeof BODY_PARTS;

interface Props {
  onSelect: (part: BodyPart, side: string | null, view: string) => void;
  onBack: () => void;
}

export default function BodyPartSelector({ onSelect, onBack }: Props) {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);
  const [selectedSide, setSelectedSide] = useState<string | null>(null);

  if (selectedPart && BODY_PARTS[selectedPart].sides && !selectedSide) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Select {BODY_PARTS[selectedPart].name} Side</h3>
        <div className="grid grid-cols-2 gap-4">
          {BODY_PARTS[selectedPart].sides!.map((side) => (
            <Button
              key={side}
              variant="outline"
              className="h-24 text-lg"
              onClick={() => setSelectedSide(side)}
            >
              {side}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setSelectedPart(null)}>
          Back to Body Parts
        </Button>
      </div>
    );
  }

  if (selectedPart) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">
          Select {selectedSide ? `${selectedSide} ` : ''}{BODY_PARTS[selectedPart].name} View
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {BODY_PARTS[selectedPart].views.map((view) => (
            <Button
              key={view}
              variant="outline"
              className="h-24 text-lg"
              onClick={() => onSelect(selectedPart, selectedSide, view)}
            >
              {view}
            </Button>
          ))}
        </div>
        <Button 
          variant="outline" 
          onClick={() => selectedSide ? setSelectedSide(null) : setSelectedPart(null)}
        >
          Back to {selectedSide ? 'Side Selection' : 'Body Parts'}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Select Body Part</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(BODY_PARTS).map(([part, data]) => (
          <Button
            key={part}
            variant="outline"
            className="h-24 text-lg relative"
            onClick={() => data.available ? setSelectedPart(part as BodyPart) : null}
            disabled={!data.available}
          >
            {data.name}
            {!data.available && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <Lock className="w-6 h-6 mb-2" />
                <span className="text-sm">Coming Soon</span>
              </div>
            )}
          </Button>
        ))}
      </div>
      <Button variant="outline" onClick={onBack}>
        Back to Options
      </Button>
    </div>
  );
}