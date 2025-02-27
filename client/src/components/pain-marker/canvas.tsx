import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { painTypes } from "@shared/schema";

interface PainMarker {
  type: keyof typeof painTypes;
  intensity: number;
  points: { x: number; y: number }[];
  brushSize: number;
}

interface Props {
  image: string;
  color: string;
  intensity: number;
  onSave: (markers: PainMarker[]) => void;
}

const colorMap = {
  RED: '#ff0000',
  BLUE: '#0000ff',
  YELLOW: '#ffff00',
  GREEN: '#00ff00',
  PURPLE: '#800080'
};

export default function PainMarkerCanvas({ image, color, intensity, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markers, setMarkers] = useState<PainMarker[]>([]);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [brushSize, setBrushSize] = useState(6); // Default brush size

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
    if (marker.points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(marker.points[0].x, marker.points[0].y);

    // Calculate color opacity based on intensity (20% to 100%)
    const baseColor = colorMap[marker.type as keyof typeof colorMap];
    const alpha = 0.2 + (marker.intensity * 0.16); // Maps 1-5 to 0.36-1.0

    // Set line properties
    ctx.strokeStyle = baseColor;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = marker.brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Draw smooth line through points
    for (let i = 1; i < marker.points.length; i++) {
      const p1 = marker.points[i - 1];
      const p2 = marker.points[i];
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // Reset global alpha for next drawing
    ctx.globalAlpha = 1;
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const point = getCanvasPoint(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentPath([point]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentPath(prev => [...prev, point]);

    // Draw the current stroke
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const marker: PainMarker = {
      type: color as keyof typeof painTypes,
      intensity,
      points: [...currentPath, point],
      brushSize
    };

    // Clear and redraw everything
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = image;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all completed markers
    markers.forEach(m => drawPainMarker(ctx, m));

    // Draw current marker
    drawPainMarker(ctx, marker);
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentPath.length < 2) return;

    setMarkers(prev => [...prev, {
      type: color as keyof typeof painTypes,
      intensity,
      points: currentPath,
      brushSize
    }]);

    setIsDrawing(false);
    setCurrentPath([]);
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
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