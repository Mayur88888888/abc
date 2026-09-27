import { useRef } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useCADStore } from '../store/cadStore';
import type { Feature, Vec3 } from '../lib/cadEngine';

// Feature renderer - renders each feature as 3D geometry with proper positioning
function FeatureMesh({ feature, isSelected, isHovered, onSelect, onHover }: {
  feature: Feature;
  isSelected: boolean;
  isHovered: boolean;
  onSelect: () => void;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const viewMode = useCADStore(s => s.viewMode);

  if (!feature.visible || feature.suppressed) return null;

  const p = feature.params;
  const pos = (p.position as Vec3) || [0, 0, 0];

  const getGeometry = () => {
    switch (feature.type) {
      case 'box':
        return <boxGeometry args={[p.width, p.height, p.depth]} />;
      case 'cylinder':
        return <cylinderGeometry args={[p.radius, p.radius, p.height, 64]} />;
      case 'sphere':
        return <sphereGeometry args={[p.radius, 64, 64]} />;
      case 'cone':
        return <cylinderGeometry args={[p.radius2, p.radius1, p.height, 64]} />;
      case 'torus':
        return <torusGeometry args={[p.majorRadius, p.minorRadius, 32, 64]} />;
      case 'pyramid': {
        const sides = p.sides || 4;
        return <cylinderGeometry args={[0, p.baseSize / 2, p.height, sides]} />;
      }
      case 'helix': {
        // Approximate helix with a torus knot
        const q = Math.round(p.turns || 3);
        return <torusKnotGeometry args={[p.radius, p.wireRadius || 2, 128, 16, 2, q]} />;
      }
      case 'pipe': {
        // Pipe = cylinder with hole (approximated as thick cylinder)
        return <cylinderGeometry args={[p.outerRadius, p.outerRadius, p.height, 64]} />;
      }
      case 'extrude':
        // Extrude creates a prismatic shape
        return <boxGeometry args={[20, p.distance, 20]} />;
      case 'revolve':
        // Revolve creates a lathe-like shape
        return <cylinderGeometry args={[10, 15, 20, 64]} />;
      case 'hole':
        return <cylinderGeometry args={[p.diameter / 2, p.diameter / 2, p.depth, 32]} />;
      case 'fillet':
      case 'chamfer':
      case 'shell':
        // These modify existing geometry - show as a subtle indicator
        return <boxGeometry args={[5, 5, 5]} />;
      case 'pattern_linear':
      case 'pattern_circular':
        return <boxGeometry args={[8, 8, 8]} />;
      case 'mirror':
        return <boxGeometry args={[10, 10, 10]} />;
      case 'datum_plane':
        return <planeGeometry args={[50, 50]} />;
      default:
        return <boxGeometry args={[10, 10, 10]} />;
    }
  };

  const getPosition = (): [number, number, number] => {
    switch (feature.type) {
      case 'box':
        return [pos[0], pos[1] + (p.height as number) / 2, pos[2]];
      case 'cylinder':
        return [pos[0], pos[1] + (p.height as number) / 2, pos[2]];
      case 'sphere':
        return [pos[0], pos[1] + (p.radius as number), pos[2]];
      case 'cone':
        return [pos[0], pos[1] + (p.height as number) / 2, pos[2]];
      case 'torus':
        return [pos[0], pos[1] + (p.majorRadius as number), pos[2]];
      case 'pyramid':
        return [pos[0], pos[1] + (p.height as number) / 2, pos[2]];
      case 'helix':
        return [pos[0], pos[1] + (p.radius as number), pos[2]];
      case 'pipe':
        return [pos[0], pos[1] + (p.height as number) / 2, pos[2]];
      case 'hole': {
        const hpos = (p.position as Vec3) || [0, 0, 0];
        return [hpos[0], hpos[1] - (p.depth as number) / 2, hpos[2]];
      }
      case 'datum_plane':
        return [0, p.offset || 0, 0];
      default:
        return [pos[0], pos[1] + 5, pos[2]];
    }
  };

  const getRotation = (): [number, number, number] => {
    if (feature.type === 'torus') return [Math.PI / 2, 0, 0];
    if (feature.type === 'datum_plane') return [-Math.PI / 2, 0, 0];
    return [0, 0, 0];
  };

  const color = isSelected ? '#8b5cf6' : isHovered ? '#06b6d4' : '#64748b';
  const isWireframe = viewMode === 'wireframe';
  const showEdges = viewMode === 'shaded_with_edges';

  return (
    <group>
      <mesh
        ref={meshRef}
        position={getPosition()}
        rotation={getRotation()}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect(); }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); onHover(true); }}
        onPointerOut={() => onHover(false)}
        castShadow
        receiveShadow
      >
        {getGeometry()}
        <meshStandardMaterial
          color={color}
          metalness={0.3}
          roughness={0.6}
          transparent={isWireframe || feature.type === 'datum_plane'}
          opacity={isWireframe ? 0 : feature.type === 'datum_plane' ? 0.2 : 1}
          wireframe={isWireframe}
          side={feature.type === 'datum_plane' ? THREE.DoubleSide : THREE.FrontSide}
        />
      </mesh>
      {showEdges && feature.type !== 'datum_plane' && (
        <mesh position={getPosition()} rotation={getRotation()}>
          {getGeometry()}
          <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.15} />
        </mesh>
      )}
      {/* Inner hole for pipe */}
      {feature.type === 'pipe' && (
        <mesh position={getPosition()} rotation={getRotation()}>
          <cylinderGeometry args={[p.innerRadius, p.innerRadius, p.height + 0.1, 64]} />
          <meshStandardMaterial color="#0f172a" metalness={0.5} roughness={0.3} />
        </mesh>
      )}
    </group>
  );
}

// Axes helper
function AxesHelper() {
  const showAxes = useCADStore(s => s.showAxes);
  if (!showAxes) return null;

  return (
    <group>
      <Line points={[[0, 0, 0], [100, 0, 0]]} color="#ef4444" lineWidth={2} />
      <Line points={[[0, 0, 0], [0, 100, 0]]} color="#22c55e" lineWidth={2} />
      <Line points={[[0, 0, 0], [0, 0, 100]]} color="#3b82f6" lineWidth={2} />
      <Html position={[105, 0, 0]} center>
        <span className="text-red-400 text-xs font-bold select-none">X</span>
      </Html>
      <Html position={[0, 105, 0]} center>
        <span className="text-green-400 text-xs font-bold select-none">Y</span>
      </Html>
      <Html position={[0, 0, 105]} center>
        <span className="text-blue-400 text-xs font-bold select-none">Z</span>
      </Html>
    </group>
  );
}

// Cursor tracker
function CursorTracker() {
  const { camera, raycaster, pointer } = useThree();
  const setCursorPosition = useCADStore(s => s.setCursorPosition);
  const plane = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0));

  useFrame(() => {
    raycaster.setFromCamera(pointer, camera);
    const intersect = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane.current, intersect);
    if (intersect) {
      setCursorPosition([
        Math.round(intersect.x * 10) / 10,
        Math.round(intersect.y * 10) / 10,
        Math.round(intersect.z * 10) / 10,
      ]);
    }
  });

  return null;
}

// Scene content
function SceneContent() {
  const features = useCADStore(s => s.model.features);
  const selectedFeatures = useCADStore(s => s.selectedFeatures);
  const hoveredFeature = useCADStore(s => s.hoveredFeature);
  const showGrid = useCADStore(s => s.showGrid);
  const gridSize = useCADStore(s => s.gridSize);
  const selectFeature = useCADStore(s => s.selectFeature);
  const clearSelection = useCADStore(s => s.clearSelection);
  const setHoveredFeature = useCADStore(s => s.setHoveredFeature);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[50, 100, 50]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-50, 50, -50]} intensity={0.3} />
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.25]} />

      {/* Grid */}
      {showGrid && (
        <Grid
          args={[200, 200]}
          cellSize={gridSize}
          cellThickness={0.5}
          cellColor="#1e293b"
          sectionSize={gridSize * 5}
          sectionThickness={1}
          sectionColor="#334155"
          fadeDistance={200}
          fadeStrength={1}
          position={[0, -0.01, 0]}
          infiniteGrid
        />
      )}

      {/* Axes */}
      <AxesHelper />

      {/* Features */}
      {features.map((feature) => (
        <FeatureMesh
          key={feature.id}
          feature={feature}
          isSelected={selectedFeatures.includes(feature.id)}
          isHovered={hoveredFeature === feature.id}
          onSelect={() => selectFeature(feature.id)}
          onHover={(h) => setHoveredFeature(h ? feature.id : null)}
        />
      ))}

      {/* Ground plane for shadows */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <shadowMaterial opacity={0.15} />
      </mesh>

      {/* Controls */}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={500}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />

      {/* Gizmo */}
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>

      {/* Cursor tracking */}
      <CursorTracker />
    </>
  );
}

export default function CADViewport() {
  const clearSelection = useCADStore(s => s.clearSelection);

  return (
    <div className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
      <Canvas
        shadows
        camera={{ position: [60, 40, 60], fov: 50, near: 0.1, far: 2000 }}
        onPointerMissed={() => clearSelection()}
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#0f172a' }}
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 200, 500]} />
        <SceneContent />
      </Canvas>
    </div>
  );
}
