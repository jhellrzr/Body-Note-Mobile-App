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
  brushSize: number;
  onSave: (markers: PainMarker[]) => void;
}

const colorMap = {
  RED: '#ff0000',
  BLUE: '#0000ff',
  YELLOW: '#ffff00',
  GREEN: '#00ff00',
  PURPLE: '#800080'
};

export default function PainMarkerCanvas({ image, color, intensity, brushSize, onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [markers, setMarkers] = useState<PainMarker[]>([]);
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<{ x: number; y: number }[]>([]);

  // Function to redraw everything on the canvas
  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base image
    const img = new Image();
    img.src = image;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all completed markers
    markers.forEach(marker => {
      if (marker.points.length < 2) return;

      ctx.beginPath();
      ctx.moveTo(marker.points[0].x, marker.points[0].y);

      const alpha = 0.3 + (marker.intensity / 5) * 0.7;
      ctx.strokeStyle = colorMap[marker.type as keyof typeof colorMap];
      ctx.globalAlpha = alpha;
      ctx.lineWidth = marker.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      marker.points.forEach((point, i) => {
        if (i > 0) ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    });

    // Draw current stroke if exists
    if (currentPoints.length > 1) {
      ctx.beginPath();
      ctx.moveTo(currentPoints[0].x, currentPoints[0].y);

      ctx.strokeStyle = colorMap[color as keyof typeof colorMap];
      ctx.globalAlpha = 0.3 + (intensity / 5) * 0.7;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      currentPoints.forEach((point, i) => {
        if (i > 0) ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
  };

  // Setup canvas and load image
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;
      setImageSize({ width, height });
      redrawCanvas();
    };
  }, [image]);

  // Redraw whenever markers or current points change
  useEffect(() => {
    redrawCanvas();
  }, [markers, currentPoints, color, intensity, brushSize]);

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
    setCurrentPoints([point]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getCanvasPoint(e);
    if (!point) return;

    setCurrentPoints(prev => [...prev, point]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentPoints.length < 2) return;

    setMarkers(prev => [...prev, {
      type: color as keyof typeof painTypes,
      intensity,
      points: currentPoints,
      brushSize
    }]);

    setIsDrawing(false);
    setCurrentPoints([]);
  };

  const handleClear = () => {
    setMarkers([]);
    setCurrentPoints([]);
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