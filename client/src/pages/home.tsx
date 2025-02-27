import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";
import PainMarkerCanvas from "@/components/pain-marker/canvas";
import ColorSelector from "@/components/pain-marker/color-selector";
import IntensitySelector from "@/components/pain-marker/intensity-selector";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { PainEntry } from "@shared/schema";

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("RED");
  const [intensity, setIntensity] = useState(1);
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
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent className="p-6">
          {!image ? (
            <div className="text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="camera-input"
                onChange={handleFileSelect}
              />
              <label htmlFor="camera-input">
                <Button className="w-full h-32" variant="outline">
                  <Camera className="mr-2 h-6 w-6" />
                  Take or Upload Photo
                </Button>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <PainMarkerCanvas
                image={image}
                color={selectedColor}
                intensity={intensity}
                onSave={(markers) => 
                  mutation.mutate({
                    imageUrl: image,
                    painMarkers: markers,
                    notes: ""
                  })
                }
              />
              <ColorSelector value={selectedColor} onChange={setSelectedColor} />
              <IntensitySelector value={intensity} onChange={setIntensity} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
