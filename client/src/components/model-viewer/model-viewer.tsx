import { Canvas } from '@react-three/fiber';
import { ThreeErrorBoundary } from './error-boundary';

interface Props {
  onSave: (painMarkers: any[]) => void;
}

function Scene() {
  return (
    <>
      <ambientLight />
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
        <Canvas>
          <Scene />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}