import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const BODY_PARTS = {
  hand: {
    name: "Hand",
    views: ["Front", "Back", "Side", "Palm"]
  },
  wrist: {
    name: "Wrist",
    views: ["Front", "Back", "Side-In", "Side-Out"]
  },
  ankle: {
    name: "Ankle",
    views: ["Front", "Back", "Side-In", "Side-Out"]
  },
  knee: {
    name: "Knee",
    views: ["Front", "Back", "Side-In", "Side-Out"]
  },
  back: {
    name: "Back",
    views: ["Full", "Upper", "Middle", "Lower"]
  }
};

type BodyPart = keyof typeof BODY_PARTS;

interface Props {
  onSelect: (part: BodyPart, view: string) => void;
  onBack: () => void;
}

export default function BodyPartSelector({ onSelect, onBack }: Props) {
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(null);

  if (selectedPart) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Select {BODY_PARTS[selectedPart].name} View</h3>
        <div className="grid grid-cols-2 gap-4">
          {BODY_PARTS[selectedPart].views.map((view) => (
            <Button
              key={view}
              variant="outline"
              className="h-24 text-lg"
              onClick={() => onSelect(selectedPart, view)}
            >
              {view}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setSelectedPart(null)}>
          Back to Body Parts
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
            className="h-24 text-lg"
            onClick={() => setSelectedPart(part as BodyPart)}
          >
            {data.name}
          </Button>
        ))}
      </div>
      <Button variant="outline" onClick={onBack}>
        Back
      </Button>
    </div>
  );
}
