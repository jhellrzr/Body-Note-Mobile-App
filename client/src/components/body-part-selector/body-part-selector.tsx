import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { bodyPartModels, type BodyPartModelKey } from "./models";
import { useToast } from "@/hooks/use-toast";

type BodyPartConfig = {
  name: string;
  sides: string[] | null;
  views: string[];
  available: boolean;
  singleView?: boolean;
};

const BODY_PARTS: Record<string, BodyPartConfig> = {
  hand: {
    name: "Hand/Wrist",
    sides: ["Left", "Right"],
    views: ["Palm", "Back"],
    available: false // Temporarily disabled until model is available
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
  const { toast } = useToast();
  const [selectedPart, setSelectedPart] = useState<BodyPart | null>(initialPart as BodyPart | null);
  const [selectedSide, setSelectedSide] = useState<string | null>(initialSide || null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (initialPart) setSelectedPart(initialPart as BodyPart);
    if (initialSide) setSelectedSide(initialSide);
  }, [initialPart, initialSide]);

  useEffect(() => {
    if (selectedPart && (selectedPart in bodyPartModels)) {
      try {
        const modelPath = bodyPartModels[selectedPart as BodyPartModelKey]?.default;

        // Add debugging
        console.log("Selected part:", selectedPart);
        console.log("Available models:", bodyPartModels);
        console.log("Model path:", modelPath);
        console.log("Loading image from path:", modelPath);

        // Check if model path is null or undefined
        if (!modelPath) {
          setIsImageLoaded(false);
          toast({
            title: "error",
            description: `Model not found for ${BODY_PARTS[selectedPart].name}`,
            variant: "destructive"
          });
          return;
        }

        const img = new Image();
        img.onload = () => {
          console.log("Image loaded successfully:", modelPath);
          setIsImageLoaded(true);
          if (BODY_PARTS[selectedPart].singleView) {
            onSelect(selectedPart, null, BODY_PARTS[selectedPart].views[0]);
          }
        };

        img.onerror = (e) => {
          console.log("Failed to load image:", e);
          console.log("Image path that failed:", modelPath);
          setIsImageLoaded(false);
          toast({
            title: "error",
            description: `Failed to load ${BODY_PARTS[selectedPart].name} image`,
            variant: "destructive"
          });
        };

        img.src = modelPath;
      } catch (error) {
        console.error('Error loading model:', error);
        setIsImageLoaded(false);
        toast({
          title: "error",
          description: `Error loading ${BODY_PARTS[selectedPart].name} model`,
          variant: "destructive"
        });
      }
    }
  }, [selectedPart, onSelect, toast]);

  if (selectedPart && BODY_PARTS[selectedPart].sides && !selectedSide) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">
          {t('bodyParts.selectSide', { part: BODY_PARTS[selectedPart].name })}
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
            part: BODY_PARTS[selectedPart].name
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
            {data.name}
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