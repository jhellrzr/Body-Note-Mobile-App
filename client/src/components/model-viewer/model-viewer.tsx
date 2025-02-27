import { Canvas } from '@react-three/fiber';
import { OrbitControls, DirectionalLight } from '@react-three/drei';
import { useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import CubeTest from './cube-test';

interface Props {
  onSave: (painMarkers: any[]) => void;
}

function Loader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function ModelViewer({ onSave }: Props) {
  const [activeModel, setActiveModel] = useState<'hand' | 'knee'>('hand');

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 mb-4">
        <Button 
          variant={activeModel === 'hand' ? 'default' : 'outline'}
          onClick={() => setActiveModel('hand')}
        >
          Hand & Wrist
        </Button>
        <Button 
          variant={activeModel === 'knee' ? 'default' : 'outline'}
          onClick={() => setActiveModel('knee')}
        >
          Knee
        </Button>
      </div>

      <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
        <Canvas
          camera={{ position: [3, 3, 3], fov: 75 }}
          onCreated={({ gl }) => {
            gl.setClearColor('#f5f5f5');
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[2, 2, 2]} />
          <CubeTest />
          <OrbitControls />
        </Canvas>
      </div>
    </div>
  );
}