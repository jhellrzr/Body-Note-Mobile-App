import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ThreeErrorBoundary } from './error-boundary';
import { useRef } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { useFrame } from '@react-three/fiber';


interface Props {
  onSave: (painMarkers: any[]) => void;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <OrbitControls />
    </>
  );
}

export default function ModelViewer({ onSave }: Props) {
  return (
    <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
      <ThreeErrorBoundary>
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
          <Scene />
        </Canvas>
      </ThreeErrorBoundary>
    </div>
  );
}