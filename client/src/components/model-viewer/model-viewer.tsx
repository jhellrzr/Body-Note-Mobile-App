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
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    </>
  );
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function ModelViewer({ onSave }: Props) {
  return (
    <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
      <ThreeErrorBoundary>
        <Suspense fallback={<Loader />}>
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