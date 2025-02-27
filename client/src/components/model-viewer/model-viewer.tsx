import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface Props {
  onSave: (painMarkers: any[]) => void;
}

export default function ModelViewer({ onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(400, 400);
    renderer.setClearColor(0xf0f0f0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add cube
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Animation
    function animate() {
      requestAnimationFrame(animate);
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      renderer.render(scene, camera);
    }
    animate();

    // Cleanup
    return () => {
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}