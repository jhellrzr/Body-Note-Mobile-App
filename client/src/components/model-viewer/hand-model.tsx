import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

export default function HandModel() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    // Add subtle animation
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Temporary hand representation */}
      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1.5, 0.2]} /> {/* Basic hand shape */}
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Wrist */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.5]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
    </group>
  );
}
