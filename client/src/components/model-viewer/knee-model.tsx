import { useRef } from 'react';
import { Mesh } from 'three';
import { useFrame } from '@react-three/fiber';

export default function KneeModel() {
  const meshRef = useRef<Mesh>(null!);

  useFrame((state) => {
    // Add subtle animation
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime()) * 0.1;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Temporary knee representation */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} /> {/* Basic knee joint */}
        <meshStandardMaterial color="#f4d03f" />
      </mesh>
      {/* Upper and lower leg indicators */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 1]} />
        <meshStandardMaterial color="#e67e22" />
      </mesh>
    </group>
  );
}
