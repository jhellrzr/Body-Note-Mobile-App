import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Shapes } from "lucide-react";
import PainMarkerCanvas from "@/components/pain-marker/canvas";
import ModelViewer from "@/components/model-viewer/model-viewer";
import ColorSelector from "@/components/pain-marker/color-selector";
import IntensitySelector from "@/components/pain-marker/intensity-selector";
import BrushSizeSelector from "@/components/pain-marker/brush-size-selector";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PainEntry } from "@shared/schema";

type Mode = 'upload' | 'model' | 'drawing';

export default function Home() {
  const [mode, setMode] = useState<Mode>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("RED");
  const [intensity, setIntensity] = useState(1);
  const [brushSize, setBrushSize] = useState(6);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (entry: Omit<PainEntry, "id" | "date">) => {
      const res = await apiRequest("POST", "/api/pain-entries", entry);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pain entry saved successfully",
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

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          {mode === 'upload' && (
            <div className="text-center space-y-4">
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
                  Take Photo
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
                  Upload Image
                </Button>
              </div>

              <div>
                <Button
                  className="w-full h-16"
                  variant="outline"
                  onClick={() => setMode('model')}
                >
                  <Shapes className="mr-2 h-6 w-6" />
                  Use 3D Model
                </Button>
              </div>
            </div>
          )}

          {mode === 'drawing' && image && (
            <div className="space-y-4">
              <PainMarkerCanvas
                image={image}
                color={selectedColor}
                intensity={intensity}
                brushSize={brushSize}
                onSave={(markers) =>
                  mutation.mutate({
                    imageUrl: image,
                    painMarkers: markers,
                    notes: "",
                  })
                }
              />
              <ColorSelector value={selectedColor} onChange={setSelectedColor} />
              <IntensitySelector value={intensity} onChange={setIntensity} />
              <BrushSizeSelector value={brushSize} onChange={setBrushSize} />
            </div>
          )}

          {mode === 'model' && (
            <div className="space-y-4">
              <ModelViewer
                onSave={(markers) =>
                  mutation.mutate({
                    imageUrl: "",
                    painMarkers: markers,
                    notes: "",
                  })
                }
                selectedColor={selectedColor}
                intensity={intensity}
              />
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setMode('upload')}>
                  Back
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}