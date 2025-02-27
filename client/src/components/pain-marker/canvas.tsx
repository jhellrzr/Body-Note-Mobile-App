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
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      // Set canvas size to match image aspect ratio
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;
      setImageSize({ width, height });

      // Draw image
      ctx.drawImage(img, 0, 0, width, height);

      // Draw existing markers
      markers.forEach(marker => {
        drawPainMarker(ctx, marker);
      });
    };
  }, [image, markers]);

  const drawPainMarker = (ctx: CanvasRenderingContext2D, marker: PainMarker) => {
    ctx.beginPath();
    ctx.arc(marker.x, marker.y, 10 + marker.intensity * 2, 0, Math.PI * 2);

    // Calculate color opacity based on intensity (20% to 100%)
    const baseColor = marker.type.toLowerCase();
    const alpha = 0.2 + (marker.intensity * 0.16); // Maps 1-5 to 0.36-1.0
    ctx.fillStyle = `${baseColor}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
    ctx.fill();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = imageSize.width / rect.width;
    const scaleY = imageSize.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const newMarker: PainMarker = {
      type: color as keyof typeof painTypes,
      intensity,
      x,
      y
    };

    setMarkers(prev => [...prev, newMarker]);
  };

  const handleClear = () => {
    setMarkers([]);
    // Redraw the canvas with just the image
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
  };

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full cursor-crosshair border rounded-lg"
        style={{ aspectRatio: imageSize.width / imageSize.height }}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={() => onSave(markers)}>Save</Button>
      </div>
    </div>
  );
}