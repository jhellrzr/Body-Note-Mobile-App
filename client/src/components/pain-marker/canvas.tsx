import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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
  const [currentMarker, setCurrentMarker] = useState<PainMarker | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const maxWidth = 800;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      drawImage();
    };
  }, [image]);

  const drawImage = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const img = new Image();
    img.src = image;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    markers.forEach(marker => {
      if (marker.points.length < 2) return;
      drawLine(ctx, marker.points, marker.type, marker.intensity, marker.brushSize);
    });

    if (currentMarker?.points.length && currentMarker.points.length > 1) {
      drawLine(ctx, currentMarker.points, currentMarker.type, currentMarker.intensity, currentMarker.brushSize);
    }
  };

  const drawLine = (
    ctx: CanvasRenderingContext2D,
    points: { x: number; y: number }[],
    color: string,
    intensity: number,
    size: number
  ) => {
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

  const getPointerPosition = (e: React.TouchEvent | React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let x, y;
    if ('touches' in e) {
      x = (e.touches[0].clientX - rect.left) * scaleX;
      y = (e.touches[0].clientY - rect.top) * scaleY;
    } else {
      x = (e.clientX - rect.left) * scaleX;
      y = (e.clientY - rect.top) * scaleY;
    }

    return { x, y };
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    const point = getPointerPosition(e);
    if (!point) return;

    setIsDrawing(true);
    setCurrentMarker({
      type: color as keyof typeof painTypes,
      intensity,
      points: [point],
      brushSize
    });
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentMarker) return;

    const point = getPointerPosition(e);
    if (!point) return;

    setCurrentMarker(prev => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, point]
      };
    });
    drawImage();
  };

  const stopDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    if (!isDrawing || !currentMarker) return;

    if (currentMarker.points.length > 1) {
      setMarkers(prev => [...prev, currentMarker]);
    }

    setIsDrawing(false);
    setCurrentMarker(null);
  };

  const handleClear = () => {
    setMarkers([]);
    drawImage();
  };

  const handleSaveToDevice = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const imageData = canvas.toDataURL('image/png');

    // Create fullscreen overlay with proper mobile styling
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow: hidden;
      z-index: 9999;
      touch-action: none;
      -webkit-overflow-scrolling: touch;
    `;

    const header = document.createElement('div');
    header.style.cssText = `
      width: 100%;
      padding: 1rem;
      background: #f3f4f6;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
    `;

    const closeButton = document.createElement('button');
    closeButton.innerText = '← Back';
    closeButton.style.cssText = `
      padding: 8px 16px;
      background: none;
      border: none;
      font-family: system-ui;
      font-size: 16px;
      color: #2563eb;
      cursor: pointer;
    `;
    closeButton.onclick = () => {
      document.body.removeChild(overlay);
      document.body.style.overflow = '';
    };

    const instructions = document.createElement('p');
    instructions.innerText = 'Press and hold image to save';
    instructions.style.cssText = `
      margin: 0;
      font-family: system-ui;
      font-size: 16px;
    `;

    header.appendChild(closeButton);
    header.appendChild(instructions);

    const imageContainer = document.createElement('div');
    imageContainer.style.cssText = `
      flex: 1;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
      background: #f8f9fa;
    `;

    const img = document.createElement('img');
    img.src = imageData;
    img.alt = 'Pain tracking image';
    img.style.cssText = `
      max-width: 100%;
      max-height: calc(100vh - 120px);
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;

    img.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const link = document.createElement('a');
      link.href = imageData;
      link.download = `pain-marker-${timestamp}.png`;
      link.click();
    });

    imageContainer.appendChild(img);
    overlay.appendChild(header);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);

    // Prevent body scrolling while overlay is open
    document.body.style.overflow = 'hidden';
  };

  useEffect(() => {
    drawImage();
  }, [markers, color, intensity, brushSize]);

  return (
    <div className="space-y-4">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onTouchCancel={stopDrawing}
        className="w-full cursor-crosshair border rounded-lg touch-none"
        style={{ aspectRatio: canvasRef.current ? canvasRef.current.width / canvasRef.current.height : 1 }}
      />
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClear}>
          Clear
        </Button>
        <Button onClick={handleSaveToDevice}>
          <Download className="mr-2 h-4 w-4" />
          Save to Device
        </Button>
      </div>
    </div>
  );
}