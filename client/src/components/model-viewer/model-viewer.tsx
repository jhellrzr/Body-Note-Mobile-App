import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import HandModel from './hand-model';
import KneeModel from './knee-model';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  onSave: (painMarkers: any[]) => void;
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
      
      <div className="w-full aspect-square border rounded-lg overflow-hidden">
        <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          
          {activeModel === 'hand' ? <HandModel /> : <KneeModel />}
          
          <OrbitControls 
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
        </Canvas>
      </div>
    </div>
  );
}
