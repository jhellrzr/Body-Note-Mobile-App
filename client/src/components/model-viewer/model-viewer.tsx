import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import { Button } from '@/components/ui/button';
import { useFrame } from '@react-three/fiber';


interface Props {
  onSave: (painMarkers: any[]) => void;
}

export default function ModelViewer({ onSave }: Props) {
  return (
    <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <mesh>
          <boxGeometry />
          <meshStandardMaterial color="orange" />
        </mesh>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}