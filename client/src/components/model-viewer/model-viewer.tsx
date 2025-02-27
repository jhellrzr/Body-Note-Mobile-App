import { Canvas } from '@react-three/fiber';
import { ThreeErrorBoundary } from './error-boundary';

interface Props {
  onSave: (painMarkers: any[]) => void;
}

export default function ModelViewer({ onSave }: Props) {
  return (
    <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
      <ThreeErrorBoundary>
        <Canvas
          gl={{
            antialias: true,
            powerPreference: "default",
            preserveDrawingBuffer: true
          }}
        >
          <mesh>
            <boxGeometry />
            <meshBasicMaterial color="orange" />
          </mesh>
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}