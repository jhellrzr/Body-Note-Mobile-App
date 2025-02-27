import { Canvas } from '@react-three/fiber';
import { ThreeErrorBoundary } from './error-boundary';
import { Suspense } from 'react';

interface Props {
  onSave: (painMarkers: any[]) => void;
}

function Scene() {
  return (
    <>
      <mesh>
        <boxGeometry />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}

export default function ModelViewer({ onSave }: Props) {
  return (
    <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
      <ThreeErrorBoundary>
        <Suspense fallback={<div>Loading...</div>}>
          <Canvas
            gl={{
              antialias: true,
              powerPreference: "default",
              failIfMajorPerformanceCaveat: false
            }}
          >
            <Scene />
          </Canvas>
        </Suspense>
      </ThreeErrorBoundary>
    </div>
  );
}