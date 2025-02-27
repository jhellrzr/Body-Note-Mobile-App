import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";

interface PainMarker {
  type: keyof typeof painTypes;
  intensity: number;
  x: number;
  y: number;
}

interface Props {
  image: string;
  color: string;
  intensity: number;
  onSave: (markers: PainMarker[]) => void;
}

export default function PainMarkerCanvas({ image, color, intensity, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markers, setMarkers] = useState<PainMarker[]>([]);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      markers.forEach(marker => {
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 5 + marker.intensity * 2, 0, Math.PI * 2);
        ctx.fillStyle = marker.type.toLowerCase();
        ctx.fill();
      });
    };
  }, [image, markers]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMarkers([...markers, {
      type: color as keyof typeof painTypes,
      intensity,
      x,
      y
    }]);
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full cursor-crosshair border rounded-lg"
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setMarkers([])}>
          Clear
        </Button>
        <Button onClick={() => onSave(markers)}>Save</Button>
      </div>
    </div>
  );
}
