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
  const [isDrawing, setIsDrawing] = useState(false);
  const [markers, setMarkers] = useState<PainMarker[]>([]);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Initialize canvas with image
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      const width = img.width * scale;
      const height = img.height * scale;

      canvas.width = width;
      canvas.height = height;
      drawAll();
    };
  }, [image]);

  // Draw everything on canvas
  const drawAll = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw base image
    const img = new Image();
    img.src = image;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Draw all completed markers
    markers.forEach(marker => {
      drawPath(ctx, marker.points, marker.type, marker.intensity, marker.brushSize);
    });

    // Draw current path if exists
    if (currentPath.length > 0) {
      drawPath(ctx, currentPath, color, intensity, brushSize);
    }
  };

  const drawPath = (
    ctx: CanvasRenderingContext2D, 
    points: { x: number; y: number }[], 
    color: string, 
    intensity: number, 
    size: number
  ) => {
    if (points.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    ctx.strokeStyle = colorMap[color as keyof typeof colorMap];
    ctx.globalAlpha = 0.3 + (intensity / 5) * 0.7;
    ctx.lineWidth = size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
    const point = getMousePos(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentPath([point]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const point = getMousePos(e);
    if (!point) return;

    setCurrentPath(prev => [...prev, point]);
    drawAll();
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
    setCurrentPath([]);
    drawAll();
  };

  // Redraw when dependencies change
  useEffect(() => {
    drawAll();
  }, [markers, color, intensity, brushSize]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full cursor-crosshair border rounded-lg"
        style={{ aspectRatio: canvasRef.current?.width && canvasRef.current?.height ? 
          canvasRef.current.width / canvasRef.current.height : 1 }}
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