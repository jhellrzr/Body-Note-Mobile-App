import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, HomeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import PainMarkerCanvas from "@/components/pain-marker/canvas";
import ColorSelector from "@/components/pain-marker/color-selector";
import IntensitySelector from "@/components/pain-marker/intensity-selector";
import BrushSizeSelector from "@/components/pain-marker/brush-size-selector";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAnalytics } from "@/hooks/use-analytics";
import type { PainEntry } from "@shared/schema";
import type { PainMarker } from "@/components/pain-marker/canvas";

type Mode = 'upload' | 'drawing';

export default function PublicPainTracker() {
  // Keeping the existing functionality from home.tsx
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("RED");
  const [intensity, setIntensity] = useState(1);
  const [brushSize, setBrushSize] = useState(6);
  const { toast } = useToast();
  const { trackEvent } = useAnalytics();

  const mutation = useMutation({
    mutationFn: async (entry: Omit<PainEntry, "id" | "date">) => {
      trackEvent("image_saved");
      const res = await apiRequest("POST", "/api/pain-entries", entry);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: t('success'),
        description: t('pain.saveSuccess'),
      });
      setImage(null);
      setMode('upload');
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, source: 'camera' | 'upload') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size should be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        setImage(result);
        setMode('drawing');
        trackEvent("started_funnel", { method: source });
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      toast({
        title: "Error",
        description: "Failed to read image file",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrawingBack = () => {
    setImage(null);
    setMode('upload');
  };

  const handleSave = (imageUrl: string, painMarkers: PainMarker[]) => {
    mutation.mutate({
      imageUrl,
      painMarkers,
      notes: '', // We could add a notes field later if needed
      injuryId: null // Public pain entries won't be associated with an injury
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          {mode === 'upload' && (
            <div className="text-center space-y-4">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">{t('pain.types.title')}</h2>
                <p className="text-muted-foreground mb-4">
                  {t('pain.trackDescription')}
                </p>
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  id="camera-input"
                  onChange={(e) => handleFileSelect(e, 'camera')}
                  className="absolute w-0 h-0 opacity-0"
                />
                <Button
                  className="w-full h-16"
                  variant="outline"
                  onClick={() => document.getElementById('camera-input')?.click()}
                >
                  <Camera className="mr-2 h-6 w-6" />
                  {t('upload.takePhoto')}
                </Button>
              </div>

              <div>
                <input
                  type="file"
                  accept="image/*"
                  id="file-input"
                  onChange={(e) => handleFileSelect(e, 'upload')}
                  className="absolute w-0 h-0 opacity-0"
                />
                <Button
                  className="w-full h-16"
                  variant="outline"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <Upload className="mr-2 h-6 w-6" />
                  {t('upload.uploadImage')}
                </Button>
              </div>
            </div>
          )}

          {mode === 'drawing' && image && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <Button
                  variant="outline"
                  onClick={handleDrawingBack}
                >
                  {t('common.back')}
                </Button>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    accept="image/*"
                    id="upload-different"
                    onChange={(e) => handleFileSelect(e, 'upload')}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('upload-different')?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {t('upload.reupload')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImage(null);
                      setMode('upload');
                    }}
                  >
                    <HomeIcon />
                  </Button>
                </div>
              </div>

              <div className="bg-muted/50 p-4 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  {t('pain.instructions')}
                </p>
              </div>

              <div className="lg:grid lg:grid-cols-2 lg:gap-6">
                <div>
                  <PainMarkerCanvas
                    image={image}
                    color={selectedColor}
                    intensity={intensity}
                    brushSize={brushSize}
                    onSave={handleSave}
                  />
                </div>
                <div className="mt-4 lg:mt-0 space-y-4">
                  <ColorSelector value={selectedColor} onChange={setSelectedColor} />
                  <IntensitySelector value={intensity} onChange={setIntensity} />
                  <BrushSizeSelector value={brushSize} onChange={setBrushSize} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
