import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { painTypes } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

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
}

const colorMap = {
  RED: '#ff0000',
  BLUE: '#0000ff',
  YELLOW: '#ffff00',
  GREEN: '#00ff00',
  PURPLE: '#800080'
};

export default function PainMarkerCanvas({ image, color, intensity, brushSize }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [markers, setMarkers] = useState<PainMarker[]>([]);
  const [currentMarker, setCurrentMarker] = useState<PainMarker | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>(color); // Added state for color selector
  const [selectedIntensity, setIntensity] = useState<number>(intensity); // Added state for intensity selector
  const [selectedBrushSize, setBrushSize] = useState<number>(brushSize); // Added state for brush size selector
  const { toast } = useToast();

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
      type: selectedColor as keyof typeof painTypes, // Use selectedColor
      intensity: selectedIntensity, // Use selectedIntensity
      points: [point],
      brushSize: selectedBrushSize // Use selectedBrushSize
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

  const createFinalImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Create a new canvas with extra height for the legend
    const finalCanvas = document.createElement('canvas');
    const legendHeight = 140; // Increased height for better spacing
    finalCanvas.width = canvas.width;
    finalCanvas.height = canvas.height + legendHeight;

    const ctx = finalCanvas.getContext('2d');
    if (!ctx) return null;

    // Draw the original canvas content
    ctx.drawImage(canvas, 0, 0);

    // Draw legend background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, canvas.height, canvas.width, legendHeight);

    // Draw legend title
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('Pain Types', canvas.width / 2, canvas.height + 30);

    // Calculate layout
    const entries = Object.entries(painTypes);
    const padding = 20;
    const availableWidth = canvas.width - (padding * 2);
    const itemSpacing = availableWidth / entries.length;

    // Draw color squares and labels
    entries.forEach(([color, label], index) => {
      const x = padding + (itemSpacing * index);
      const y = canvas.height + 60;

      // Draw color square
      ctx.fillStyle = colorMap[color as keyof typeof colorMap];
      ctx.fillRect(x, y, 15, 15);

      // Draw label
      ctx.fillStyle = '#000000';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(label, x + 20, y + 12);
    });

    // Add timestamp
    const date = new Date().toLocaleDateString();
    ctx.font = '12px system-ui';
    ctx.textAlign = 'right';
    ctx.fillText(date, canvas.width - padding, canvas.height + legendHeight - 15);

    return finalCanvas;
  };

  const handleSaveToDevice = async () => {
    const finalCanvas = await createFinalImage();
    if (!finalCanvas) return;

    const blob = await new Promise<Blob>((resolve) => {
      finalCanvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/png');
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `pain-tracking-${timestamp}.png`;

    // Try to use the Share API first (better for mobile)
    if (navigator.share && navigator.canShare({ files: [new File([blob], filename)] })) {
      try {
        await navigator.share({
          files: [new File([blob], filename)],
          title: 'Pain Tracking Image',
        });
        toast({
          title: "Success",
          description: "Image shared successfully",
        });
        return;
      } catch (err) {
        console.log('Share failed, falling back to download');
      }
    }

    // Fallback to download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Image saved successfully",
    });
  };

  useEffect(() => {
    drawImage();
  }, [markers, selectedColor, selectedIntensity, selectedBrushSize]); // Use selected states


  // Placeholder components - replace with your actual components
  const ColorSelector = ({value, onChange}: {value:string, onChange:(value:string)=>void}) => (
    <div>
      {/* Your color selector implementation here */}
      <p>Color: {value}</p> {/*Example*/}
    </div>
  );

  const IntensitySelector = ({value, onChange}: {value:number, onChange:(value:number)=>void}) => (
    <div>
      {/* Your intensity selector implementation here */}
      <p>Intensity: {value}</p> {/*Example*/}
    </div>
  );

  const BrushSizeSelector = ({value, onChange}: {value:number, onChange:(value:number)=>void}) => (
    <div>
      {/* Your brush size selector implementation here */}
      <p>Brush Size: {value}</p> {/*Example*/}
    </div>
  );


  return (
    <div className="space-y-6">
      <div className="relative">
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
          className="w-full cursor-crosshair border rounded-lg touch-none bg-white"
          style={{ aspectRatio: canvasRef.current ? canvasRef.current.width / canvasRef.current.height : 1 }}
        />
      </div>

      <div className="space-y-6 bg-gray-50 p-4 rounded-lg">
        <ColorSelector value={selectedColor} onChange={setSelectedColor} />

        <div className="space-y-6 pt-2">
          <IntensitySelector value={selectedIntensity} onChange={setIntensity} />
          <BrushSizeSelector value={selectedBrushSize} onChange={setBrushSize} />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={handleClear} className="px-6">
          Clear
        </Button>
        <Button onClick={handleSaveToDevice} className="px-6">
          <Download className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}