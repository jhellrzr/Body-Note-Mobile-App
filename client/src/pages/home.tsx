import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Shapes, Lock, Image, HomeIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import PainMarkerCanvas from "@/components/pain-marker/canvas";
import ModelViewer from "@/components/model-viewer/model-viewer";
import ColorSelector from "@/components/pain-marker/color-selector";
import IntensitySelector from "@/components/pain-marker/intensity-selector";
import BrushSizeSelector from "@/components/pain-marker/brush-size-selector";
import BodyPartSelector from "@/components/body-part-selector/body-part-selector";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PainEntry, PainMarker } from "@shared/schema";

type Mode = 'upload' | 'model' | 'drawing' | '2d-model';

export default function HomePage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("RED");
  const [intensity, setIntensity] = useState(1);
  const [brushSize, setBrushSize] = useState(6);
  const [isModelImage, setIsModelImage] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [selectedSide, setSelectedSide] = useState<string | null>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (entry: Omit<PainEntry, "id" | "date">) => {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setIsModelImage(false);
        setMode('drawing');
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

  const handle2DModelSelect = (part: string, side: string | null, view: string) => {
    const sidePrefix = side ? `${side.toLowerCase()}-` : '';
    const imagePath = `/assets/body-parts/${part}/${sidePrefix}${view.toLowerCase()}.jpg`;
    setImage(imagePath);
    setIsModelImage(true);
    setSelectedPart(part);
    setSelectedSide(side);
    setMode('drawing');
  };

  const handleDrawingBack = () => {
    if (isModelImage) {
      setImage(null);
      setMode('2d-model');
      // Keep selectedPart and selectedSide state for returning to the correct view selection
    } else {
      setImage(null);
      setIsModelImage(false);
      setSelectedPart(null);
      setSelectedSide(null);
      setMode('upload');
    }
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
                  onChange={handleFileSelect}
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
                  onChange={handleFileSelect}
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

              <div>
                <Button
                  className="w-full h-16"
                  variant="outline"
                  onClick={() => setMode('2d-model')}
                >
                  <Image className="mr-2 h-6 w-6" />
                  {t('upload.use2DModel')}
                </Button>
              </div>

              <div>
                <Button
                  className="w-full h-16"
                  variant="outline"
                  disabled
                >
                  <Lock className="mr-2 h-6 w-6" />
                  <Shapes className="mr-2 h-6 w-6" />
                  {t('upload.use3DModel')}
                </Button>
              </div>
            </div>
          )}

          {mode === '2d-model' && (
            <BodyPartSelector
              onSelect={handle2DModelSelect}
              onBack={() => setMode('upload')}
              selectedPart={selectedPart}
              selectedSide={selectedSide}
            />
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
                  {!isModelImage && (
                    <>
                      <input
                        type="file"
                        accept="image/*"
                        id="upload-different"
                        onChange={handleFileSelect}
                        className="absolute w-0 h-0 opacity-0"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('upload-different')?.click()}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {t('upload.reupload')}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImage(null);
                      setIsModelImage(false);
                      setSelectedPart(null);
                      setSelectedSide(null);
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

              <PainMarkerCanvas
                image={image}
                color={selectedColor}
                intensity={intensity}
                brushSize={brushSize}
              />
              <ColorSelector value={selectedColor} onChange={setSelectedColor} />
              <IntensitySelector value={intensity} onChange={setIntensity} />
              <BrushSizeSelector value={brushSize} onChange={setBrushSize} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}