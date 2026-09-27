import { useRef, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useCADStore } from '../store/cadStore';
import type { Feature, Vec3 } from '../lib/cadEngine';

// Feature renderer - renders each feature as 3D geometry
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

  const getGeometry = () => {
    const p = feature.params;
    switch (feature.type) {
      case 'box':
        return <boxGeometry args={[p.width as number, p.height as number, p.depth as number]} />;
      case 'cylinder':
        return <cylinderGeometry args={[p.radius as number, p.radius as number, p.height as number, 64]} />;
      case 'sphere':
        return <sphereGeometry args={[p.radius as number, 64, 64]} />;
      case 'cone':
        return <cylinderGeometry args={[p.radius2 as number, p.radius1 as number, p.height as number, 64]} />;
      case 'torus':
        return <torusGeometry args={[p.majorRadius as number, p.minorRadius as number, 32, 64]} />;
      case 'extrude':
        return <boxGeometry args={[20, (p.distance as number), 20]} />;
      case 'hole':
        return <cylinderGeometry args={[
          (p.diameter as number) / 2,
          (p.diameter as number) / 2,
          p.depth as number,
          32
        ]} />;
      default:
        return <boxGeometry args={[10, 10, 10]} />;
    }
  };

  const getPosition = (): [number, number, number] => {
    const p = feature.params;
    switch (feature.type) {
      case 'box':
        return [0, (p.height as number) / 2, 0];
      case 'cylinder':
        return [0, (p.height as number) / 2, 0];
      case 'sphere':
        return [0, p.radius as number, 0];
      case 'cone':
        return [0, (p.height as number) / 2, 0];
      case 'torus':
        return [0, p.majorRadius as number, 0];
      case 'hole':
        const pos = p.position as Vec3;
        return pos || [0, 0, 0];
      default:
        return [0, 5, 0];
    }
  };

  const color = isSelected ? '#8b5cf6' : isHovered ? '#06b6d4' : '#64748b';
  const opacity = viewMode === 'wireframe' ? 0 : 1;
  const wireframe = viewMode === 'wireframe';

  return (
    <group>
      <mesh
        ref={meshRef}
        position={getPosition()}
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
          transparent={viewMode === 'wireframe'}
          opacity={opacity}
          wireframe={wireframe}
        />
      </mesh>
      {(viewMode === 'shaded_with_edges') && (
        <mesh position={getPosition()}>
          {getGeometry()}
          <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.3} />
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
      {/* Axis labels */}
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
