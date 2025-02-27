import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Button } from '@/components/ui/button';
import { Hand, MoveHorizontal } from 'lucide-react';

interface Props {
  onSave: (painMarkers: any[]) => void;
}

interface PainMarker {
  position: THREE.Vector3;
  color: string;
  intensity: number;
}

export default function ModelViewer({ onSave }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const [mode, setMode] = useState<'view' | 'mark'>('view');
  const [modelType, setModelType] = useState<'hand' | 'knee'>('hand');
  const [painMarkers, setPainMarkers] = useState<PainMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Initialize camera based on container size
    const container = containerRef.current;
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Initialize renderer with proper size
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Create hand model
    function createHandModel() {
      const group = new THREE.Group();

      // Palm
      const palm = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1.5, 0.2),
        new THREE.MeshPhongMaterial({ 
          color: 0xe0e0e0,
          transparent: true,
          opacity: 0.8
        })
      );
      palm.userData.isSelectable = true;
      group.add(palm);

      // Fingers
      for (let i = 0; i < 5; i++) {
        const finger = new THREE.Mesh(
          new THREE.BoxGeometry(0.2, 0.7, 0.2),
          new THREE.MeshPhongMaterial({ 
            color: 0xe0e0e0,
            transparent: true,
            opacity: 0.8
          })
        );
        finger.position.y = 1;
        finger.position.x = (i - 2) * 0.22;
        finger.userData.isSelectable = true;
        group.add(finger);
      }

      return group;
    }

    // Create knee model
    function createKneeModel() {
      const group = new THREE.Group();

      // Main joint
      const joint = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 32, 32),
        new THREE.MeshPhongMaterial({ 
          color: 0xe0e0e0,
          transparent: true,
          opacity: 0.8
        })
      );
      joint.userData.isSelectable = true;
      group.add(joint);

      // Upper leg
      const upperLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 2),
        new THREE.MeshPhongMaterial({ 
          color: 0xe0e0e0,
          transparent: true,
          opacity: 0.8
        })
      );
      upperLeg.position.y = 1.5;
      upperLeg.userData.isSelectable = true;
      group.add(upperLeg);

      // Lower leg
      const lowerLeg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.4, 0.4, 2),
        new THREE.MeshPhongMaterial({ 
          color: 0xe0e0e0,
          transparent: true,
          opacity: 0.8
        })
      );
      lowerLeg.position.y = -1.5;
      lowerLeg.userData.isSelectable = true;
      group.add(lowerLeg);

      return group;
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);

    // Initial model
    let currentModel = modelType === 'hand' ? createHandModel() : createKneeModel();
    scene.add(currentModel);

    // Create pain marker
    function createPainMarker(position: THREE.Vector3) {
      const markerGeometry = new THREE.SphereGeometry(0.05);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(position);
      scene.add(marker);
      return marker;
    }

    // Handle model type changes
    function updateModel() {
      scene.remove(currentModel);
      currentModel = modelType === 'hand' ? createHandModel() : createKneeModel();
      scene.add(currentModel);
    }

    // Handle window resize
    function handleResize() {
      if (!container || !camera || !renderer) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // Handle mouse click for marking pain points
    function handleClick(event: MouseEvent) {
      if (mode !== 'mark') return;

      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      for (const intersect of intersects) {
        if (intersect.object.userData.isSelectable) {
          const marker = createPainMarker(intersect.point);
          setPainMarkers(prev => [...prev, { 
            position: intersect.point.clone(),
            color: '#ff0000',
            intensity: 1
          }]);
          break;
        }
      }
    }

    container.addEventListener('click', handleClick);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      if (controlsRef.current && mode === 'view') {
        controlsRef.current.update();
      }
      renderer.render(scene, camera);
    }
    animate();

    // Update model when type changes
    updateModel();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('click', handleClick);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelType, mode]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant={modelType === 'hand' ? 'default' : 'outline'}
            onClick={() => setModelType('hand')}
          >
            Hand
          </Button>
          <Button
            variant={modelType === 'knee' ? 'default' : 'outline'}
            onClick={() => setModelType('knee')}
          >
            Knee
          </Button>
        </div>
        <Button
          variant={mode === 'mark' ? 'default' : 'outline'}
          onClick={() => setMode(mode === 'view' ? 'mark' : 'view')}
        >
          {mode === 'view' ? (
            <>
              <MoveHorizontal className="mr-2 h-4 w-4" />
              Move Model
            </>
          ) : (
            <>
              <Hand className="mr-2 h-4 w-4" />
              Mark Pain
            </>
          )}
        </Button>
      </div>

      <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}