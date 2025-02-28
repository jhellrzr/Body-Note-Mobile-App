
import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Hand, Loader } from 'lucide-react';

interface Props {
  onSave: (painMarkers: PainMarker[]) => void;
  selectedColor: string;
  intensity: number;
}

interface PainMarker {
  position: { x: number; y: number; z: number };
  color: string;
  intensity: number;
}

export default function ModelViewer({ onSave, selectedColor, intensity }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2());
  const modelRef = useRef<THREE.Group | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<'view' | 'mark'>('view');
  const [modelType, setModelType] = useState<'hand' | 'knee'>('hand');
  const [painMarkers, setPainMarkers] = useState<PainMarker[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Initialize camera
    const container = containerRef.current;
    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    camera.position.set(0, 2, 5);
    cameraRef.current = camera;

    // Initialize renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Initialize controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;

    // Setup lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(2, 4, 3);
    scene.add(directionalLight);

    // Load appropriate model
    loadModel(modelType);

    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && cameraRef.current && sceneRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    }
    animate();

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

    // Handle mouse/touch events
    container.addEventListener('pointerdown', handlePointerDown);
    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('pointerup', handlePointerUp);

    return () => {
      if (rendererRef.current && rendererRef.current.domElement && container) {
        container.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('pointerdown', handlePointerDown);
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('pointerup', handlePointerUp);
    };
  }, [modelType]);

  // Function to load 3D model
  function loadModel(type: 'hand' | 'knee') {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    // Remove existing model
    if (modelRef.current) {
      scene.remove(modelRef.current);
      modelRef.current = null;
    }

    // Create group for model
    const group = new THREE.Group();
    
    if (type === 'hand') {
      setIsLoading(true);
      console.log("Loading hand model...");
      
      // Create loader with progress tracking
      const loader = new GLTFLoader();
      loader.load(
        '/models/hand.glb', // Path to your model
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(2, 2, 2);
          model.position.set(0, 0, 0);
          model.rotation.set(0, 0, 0);
          
          // Make model selectable for pain marking
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.userData.isSelectable = true;
              
              // Update material for better visualization
              if (child.material) {
                child.material = new THREE.MeshPhongMaterial({
                  color: 0xe0e0e0,
                  transparent: true,
                  opacity: 0.9,
                });
              }
            }
          });
          
          group.add(model);
          scene.add(group);
          modelRef.current = group;
          setIsLoading(false);
          setLoadingProgress(100);
        },
        (xhr) => {
          setLoadingProgress((xhr.loaded / xhr.total) * 100);
          console.log("Loading progress:", ((xhr.loaded / xhr.total) * 100) + "%");
        },
        (error) => {
          console.error('Error loading hand model:', error);
          setIsLoading(false);
          // Fallback to primitive shape if model fails to load
          createFallbackHandModel(group, scene);
        }
      );
    } else if (type === 'knee') {
      setIsLoading(true);
      
      // Create loader
      const loader = new GLTFLoader();
      loader.load(
        '/models/knee.glb', // Path to your model
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(2, 2, 2);
          model.position.set(0, 0, 0);
          
          // Make model selectable for pain marking
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.userData.isSelectable = true;
              
              if (child.material) {
                child.material = new THREE.MeshPhongMaterial({
                  color: 0xe0e0e0,
                  transparent: true,
                  opacity: 0.9,
                });
              }
            }
          });
          
          group.add(model);
          scene.add(group);
          modelRef.current = group;
          setIsLoading(false);
          setLoadingProgress(100);
        },
        (xhr) => {
          setLoadingProgress((xhr.loaded / xhr.total) * 100);
        },
        (error) => {
          console.error('Error loading knee model:', error);
          setIsLoading(false);
          // Fallback to primitive shape if model fails to load
          createFallbackKneeModel(group, scene);
        }
      );
    }
  }

  // Fallback models in case GLB loading fails
  function createFallbackHandModel(group: THREE.Group, scene: THREE.Scene) {
    // Create a simple hand representation using primitive shapes
    // Palm
    const palm = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.6, 0.2),
      new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
        transparent: true,
        opacity: 0.9
      })
    );
    palm.userData.isSelectable = true;
    group.add(palm);
    
    // Fingers
    for (let i = 0; i < 5; i++) {
      const finger = new THREE.Mesh(
        new THREE.CylinderGeometry(0.1, 0.1, 0.8),
        new THREE.MeshPhongMaterial({
          color: 0xe0e0e0,
          transparent: true,
          opacity: 0.9
        })
      );
      finger.position.x = -0.5 + (i * 0.25);
      finger.position.y = 0.7;
      finger.rotation.x = Math.PI / 2;
      finger.userData.isSelectable = true;
      group.add(finger);
    }
    
    scene.add(group);
    modelRef.current = group;
  }
  
  function createFallbackKneeModel(group: THREE.Group, scene: THREE.Scene) {
    // Upper leg
    const upperLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5, 0.5, 2),
      new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
        transparent: true,
        opacity: 0.9
      })
    );
    upperLeg.position.y = 1.5;
    upperLeg.userData.isSelectable = true;
    group.add(upperLeg);
    
    // Knee joint
    const knee = new THREE.Mesh(
      new THREE.SphereGeometry(0.6),
      new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
        transparent: true,
        opacity: 0.9
      })
    );
    knee.userData.isSelectable = true;
    group.add(knee);
    
    // Lower leg
    const lowerLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.4, 2),
      new THREE.MeshPhongMaterial({
        color: 0xe0e0e0,
        transparent: true,
        opacity: 0.9
      })
    );
    lowerLeg.position.y = -1.5;
    lowerLeg.userData.isSelectable = true;
    group.add(lowerLeg);

    scene.add(group);
    modelRef.current = group;
  }

  // Convert normalized device coordinates to screen coordinates
  function getPointerPosition(event: MouseEvent | TouchEvent) {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    
    const rect = container.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    mouseRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  // Check for intersection with the model
  function getIntersectionPoint(event: MouseEvent | TouchEvent) {
    if (!sceneRef.current || !cameraRef.current || !modelRef.current) return null;
    
    getPointerPosition(event);
    
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObject(modelRef.current, true);
    
    // Filter for meshes that are marked as selectable
    const selectableIntersects = intersects.filter(
      (intersect) => intersect.object.userData.isSelectable
    );
    
    if (selectableIntersects.length > 0) {
      return selectableIntersects[0].point;
    }
    
    return null;
  }

  // Event handlers for pain marking
  function handlePointerDown(event: MouseEvent | TouchEvent) {
    if (mode !== 'mark') return;
    
    const point = getIntersectionPoint(event);
    if (point) {
      setIsDrawing(true);
      
      // Add a new pain marker at the intersection point
      const newMarker: PainMarker = {
        position: { x: point.x, y: point.y, z: point.z },
        color: selectedColor,
        intensity: intensity
      };
      
      addPainMarker(newMarker);
      setPainMarkers([...painMarkers, newMarker]);
    }
  }
  
  function handlePointerMove(event: MouseEvent | TouchEvent) {
    if (mode !== 'mark' || !isDrawing) return;
    
    const point = getIntersectionPoint(event);
    if (point) {
      // Add a new pain marker as the user drags
      const newMarker: PainMarker = {
        position: { x: point.x, y: point.y, z: point.z },
        color: selectedColor,
        intensity: intensity
      };
      
      addPainMarker(newMarker);
      setPainMarkers([...painMarkers, newMarker]);
    }
  }
  
  function handlePointerUp() {
    setIsDrawing(false);
  }

  // Add visual representation of pain marker
  function addPainMarker(marker: PainMarker) {
    if (!sceneRef.current) return;
    
    // Convert color string to actual color
    const colorMap: Record<string, number> = {
      RED: 0xff0000,
      BLUE: 0x0000ff,
      GREEN: 0x00ff00,
      YELLOW: 0xffff00,
      PURPLE: 0x800080
    };
    
    const color = colorMap[marker.color] || 0xff0000;
    
    // Size based on intensity (1-5)
    const size = 0.05 + (marker.intensity * 0.03);
    
    // Create a sphere to represent the pain point
    const sphere = new THREE.Mesh(
      new THREE.SphereGeometry(size),
      new THREE.MeshBasicMaterial({ color })
    );
    
    sphere.position.set(
      marker.position.x,
      marker.position.y,
      marker.position.z
    );
    
    // Add marker to scene
    sceneRef.current.add(sphere);
  }

  function handleSave() {
    onSave(painMarkers);
    // Clear markers after saving
    setPainMarkers([]);
    
    // Remove visual markers from scene
    if (sceneRef.current) {
      sceneRef.current.children.forEach(child => {
        if (child instanceof THREE.Mesh && 
            child.geometry instanceof THREE.SphereGeometry) {
          sceneRef.current?.remove(child);
        }
      });
    }
  }

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
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 bg-opacity-80 z-10">
            <Loader className="h-8 w-8 animate-spin mb-2" />
            <div className="text-sm">Loading model... {Math.round(loadingProgress)}%</div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full touch-none" />
      </div>
      
      {mode === 'mark' && painMarkers.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={handleSave}>
            Save Pain Points
          </Button>
        </div>
      )}
    </div>
  );
}
