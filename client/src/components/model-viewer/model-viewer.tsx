import { useEffect, useRef } from 'react';

interface Props {
  onSave: (painMarkers: any[]) => void;
}

export default function ModelViewer({ onSave }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Try to get WebGL context
    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    // Set clear color to blue
    gl.clearColor(0.0, 0.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }, []);

  return (
    <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}