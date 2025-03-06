import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

const BODY_PARTS = {
  hand: {
    name: "Hand/Wrist",
    sides: ["Left", "Right"],
    views: ["Palm", "Back"],
    available: true
  },
  achilles: {
    name: "Achilles Tendon",
    sides: null,
    views: ["Default"],
    available: true,
    singleView: true
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
  selectedPart?: string | null;
  selectedSide?: string | null;
}

export default function BodyPartSelector({ onSelect, onBack, selectedPart: initialPart, selectedSide: initialSide }: Props) {
  const { t } = useTranslation();
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(initialPart as BodyPart | null);
  const [selectedSide, setSelectedSide] = useState<string | null>(initialSide);

  useEffect(() => {
    if (initialPart) setSelectedPart(initialPart as BodyPart);
    if (initialSide) setSelectedSide(initialSide);
  }, [initialPart, initialSide]);

  // If the selected part has a single view, directly select it
  useEffect(() => {
    if (selectedPart && BODY_PARTS[selectedPart].singleView) {
      onSelect(selectedPart, null, BODY_PARTS[selectedPart].views[0]);
    }
  }, [selectedPart]);

  if (selectedPart && BODY_PARTS[selectedPart].sides && !selectedSide) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">
          {t('bodyParts.selectSide', { part: t(`bodyParts.parts.${selectedPart}`) })}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {BODY_PARTS[selectedPart].sides!.map((side) => (
            <Button
              key={side}
              variant="outline"
              className="h-24 text-lg"
              onClick={() => setSelectedSide(side)}
            >
              {t(`bodyParts.sides.${side.toLowerCase()}`)}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setSelectedPart(null)}>
          {t('common.backToParts')}
        </Button>
      </div>
    );
  }

  if (selectedPart && !BODY_PARTS[selectedPart].singleView) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">
          {t('bodyParts.selectView', {
            side: selectedSide ? t(`bodyParts.sides.${selectedSide.toLowerCase()}`) : '',
            part: t(`bodyParts.parts.${selectedPart}`)
          })}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {BODY_PARTS[selectedPart].views.map((view) => (
            <Button
              key={view}
              variant="outline"
              className="h-24 text-lg"
              onClick={() => onSelect(selectedPart, selectedSide, view)}
            >
              {t(`bodyParts.views.${view.toLowerCase()}`)}
            </Button>
          ))}
        </div>
        <Button variant="outline" onClick={() => setSelectedSide(null)}>
          {t('common.backToSides')}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">{t('bodyParts.selectPart')}</h3>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(BODY_PARTS).map(([part, data]) => (
          <Button
            key={part}
            variant="outline"
            className="h-24 text-lg relative"
            onClick={() => data.available ? setSelectedPart(part as BodyPart) : null}
            disabled={!data.available}
          >
            {t(`bodyParts.parts.${part}`)}
            {!data.available && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
                <Lock className="w-6 h-6 mb-2" />
                <span className="text-sm">{t('common.comingSoon')}</span>
              </div>
            )}
          </Button>
        ))}
      </div>
      <Button variant="outline" onClick={onBack}>
        {t('common.backToOptions')}
      </Button>
    </div>
  );
}