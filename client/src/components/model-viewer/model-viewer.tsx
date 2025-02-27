import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
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

      <div className="relative w-full aspect-square border rounded-lg overflow-hidden">
        <Suspense fallback={<Loader />}>
          <Canvas
            camera={{ position: [5, 5, 5], fov: 45 }}
            style={{ background: '#f5f5f5' }}
            onError={(error) => {
              console.error('Three.js Error:', error);
            }}
          >
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            {/* Temporarily render CubeTest instead of HandModel/KneeModel */}
            <CubeTest />

            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={10}
            />
          </Canvas>
        </Suspense>
      </div>
    </div>
  );
}