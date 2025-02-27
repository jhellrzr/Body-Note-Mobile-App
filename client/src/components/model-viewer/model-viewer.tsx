import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Hand } from 'lucide-react';

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
  const modelRef = useRef<THREE.Group | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState<THREE.Line | null>(null);
  const [currentPoints, setCurrentPoints] = useState<THREE.Vector3[]>([]);
  const [mode, setMode] = useState<'view' | 'mark'>('view');
  const [modelType, setModelType] = useState<'hand' | 'knee'>('hand');
  const [painMarkers, setPainMarkers] = useState<PainMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Initialize camera based on container size
    const container = containerRef.current;
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 10;
    controlsRef.current = controls;

    // Load models based on type
    function loadModel() {
      if (modelRef.current) {
        scene.remove(modelRef.current);
      }

      if (modelType === 'hand') {
        console.log('Loading hand model...');
        const loader = new GLTFLoader();
        loader.load(
          '/attached_assets/uploads_files_5594354_Jewelry+Hand+Holder.glb',
          (gltf) => {
            console.log('Hand model loaded successfully');
            const model = gltf.scene;
            model.scale.set(0.5, 0.5, 0.5); // Reduced scale
            model.position.set(0, 0, 0);
            model.rotation.x = -Math.PI / 2; // Rotate to face up
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.userData.isSelectable = true;
                child.castShadow = true;
                child.receiveShadow = true;
                if (child.material) {
                  child.material.transparent = true;
                  child.material.opacity = 0.9;
                }
              }
            });
            scene.add(model);
            modelRef.current = model;
          },
          (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100) + '%');
          },
          (error) => {
            console.error('Error loading GLB:', error);
            createKneeModel(); // Fallback to basic knee model if GLB fails
          }
        );
      } else {
        createKneeModel();
      }
    }

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

      scene.add(group);
      modelRef.current = group;
    }

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

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

    // Handle mouse events for pain marking
    function handleMouseDown(event: MouseEvent) {
      if (mode !== 'mark') return;
      setIsDrawing(true);
      const intersectionPoint = getIntersectionPoint(event);
      if (intersectionPoint) {
        setCurrentPoints([intersectionPoint]);
        // Create line
        const geometry = new THREE.BufferGeometry().setFromPoints([intersectionPoint, intersectionPoint]);
        const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
        const line = new THREE.Line(geometry, material);
        scene.add(line);
        setCurrentLine(line);
      }
    }

    function handleMouseMove(event: MouseEvent) {
      if (!isDrawing || mode !== 'mark') return;
      const intersectionPoint = getIntersectionPoint(event);
      if (intersectionPoint && currentLine) {
        const points = [...currentPoints, intersectionPoint];
        setCurrentPoints(points);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        currentLine.geometry.dispose();
        currentLine.geometry = geometry;
      }
    }

    function handleMouseUp() {
      if (!isDrawing || mode !== 'mark') return;
      setIsDrawing(false);
      if (currentPoints.length > 1) {
        setPainMarkers(prev => [...prev, {
          position: currentPoints[0],
          color: '#ff0000',
          intensity: 1
        }]);
      }
      setCurrentPoints([]);
      setCurrentLine(null);
    }

    function getIntersectionPoint(event: MouseEvent): THREE.Vector3 | null {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);
      const intersects = raycasterRef.current.intersectObjects(scene.children, true);

      for (const intersect of intersects) {
        if (intersect.object.userData.isSelectable) {
          return intersect.point;
        }
      }
      return null;
    }

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      if (controlsRef.current) {
        controlsRef.current.enabled = mode === 'view';
        if (mode === 'view') {
          controlsRef.current.update();
        }
      }
      renderer.render(scene, camera);
    }
    animate();

    // Load initial model
    loadModel();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelType, mode, isDrawing, currentPoints, currentLine]);

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
        <div className="flex items-center space-x-2">
          <Switch
            id="draw-mode"
            checked={mode === 'mark'}
            onCheckedChange={(checked) => setMode(checked ? 'mark' : 'view')}
          />
          <Label htmlFor="draw-mode" className="flex items-center space-x-2">
            <Hand className="h-4 w-4" />
            <span>Mark Pain</span>
          </Label>
        </div>
      </div>

      <div className="relative w-full aspect-square border rounded-lg overflow-hidden bg-gray-100">
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </div>
  );
}