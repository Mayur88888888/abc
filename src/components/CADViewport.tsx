// CAD Viewport - Renders features using hybrid approach (Three.js primitives + B-rep)
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useCADStore } from '../store/cadStore';

// Render a feature using its renderMesh
function FeatureMesh({ feature, isSelected, isHovered }: {
  feature: any;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const viewMode = useCADStore(s => s.viewMode);
  const selectFeature = useCADStore(s => s.selectFeature);
  const setHoveredFeature = useCADStore(s => s.setHoveredFeature);
  const setStatusMessage = useCADStore(s => s.setStatusMessage);

  const renderMesh = feature.renderMesh;
  
  useEffect(() => {
    console.log(`[Viewport] Rendering feature: ${feature.name}`, {
      hasRenderMesh: !!renderMesh,
      hasGeometry: !!renderMesh?.geometry,
      position: renderMesh?.position,
      type: renderMesh?.metadata?.type,
    });
  }, [feature, renderMesh]);

  if (!feature.visible || feature.suppressed || !renderMesh || !renderMesh.geometry) {
    console.warn(`[Viewport] No geometry for feature: ${feature.name}`);
    const pos = feature.params.position || [0, 0, 0];
    return (
      <group position={[pos[0], pos[2], -pos[1]]}>
        <mesh>
          <boxGeometry args={[10, 10, 10]} />
          <meshStandardMaterial color="#ff0000" wireframe transparent opacity={0.5} />
        </mesh>
        <Html center>
          <div className="text-red-500 text-xs bg-black/80 px-2 py-1 rounded">
            No geometry
          </div>
        </Html>
      </group>
    );
  }

  const pos = renderMesh.position || [0, 0, 0];
  const rot = renderMesh.rotation || [0, 0, 0];
  
  // Color based on state
  const color = isSelected ? '#8b5cf6' : isHovered ? '#06b6d4' : '#94a3b8';
  const isWireframe = viewMode === 'wireframe';

  return (
    <group position={[pos[0], pos[2], -pos[1]]} rotation={rot}>
      <mesh
        ref={meshRef}
        geometry={renderMesh.geometry}
        onClick={(e) => {
          e.stopPropagation();
          selectFeature(feature.id);
          setStatusMessage(`Selected ${feature.name}`);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHoveredFeature(feature.id);
        }}
        onPointerOut={() => setHoveredFeature(null)}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color={color}
          metalness={0.2}
          roughness={0.7}
          wireframe={isWireframe}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge overlay for shaded_with_edges mode */}
      {viewMode === 'shaded_with_edges' && (
        <lineSegments>
          <edgesGeometry args={[renderMesh.geometry]} />
          <lineBasicMaterial color="#1e293b" transparent opacity={0.3} />
        </lineSegments>
      )}

      {/* Selection outline */}
      {isSelected && (
        <lineSegments>
          <edgesGeometry args={[renderMesh.geometry]} />
          <lineBasicMaterial color="#8b5cf6" linewidth={2} />
        </lineSegments>
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
  const lastUpdate = useRef(0);
  const lastPosition = useRef<[number, number, number]>([0, 0, 0]);

  useFrame(() => {
    const now = Date.now();
    if (now - lastUpdate.current < 100) return;
    lastUpdate.current = now;

    raycaster.setFromCamera(pointer, camera);
    const intersect = new THREE.Vector3();
    const result = raycaster.ray.intersectPlane(plane.current, intersect);
    
    if (result) {
      const newPos: [number, number, number] = [
        Math.round(intersect.x * 10) / 10,
        Math.round(intersect.z * 10) / 10,
        Math.round(-intersect.y * 10) / 10,
      ];
      
      if (newPos[0] !== lastPosition.current[0] || 
          newPos[1] !== lastPosition.current[1] || 
          newPos[2] !== lastPosition.current[2]) {
        lastPosition.current = newPos;
        setCursorPosition(newPos);
      }
    }
  });

  return null;
}

// Scene content
function SceneContent() {
  const features = useCADStore(s => s.features);
  const selectedFeatures = useCADStore(s => s.selectedFeatures);
  const hoveredFeature = useCADStore(s => s.hoveredFeature);
  const showGrid = useCADStore(s => s.showGrid);
  const gridSize = useCADStore(s => s.gridSize);
  const clearSelection = useCADStore(s => s.clearSelection);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1} castShadow />
      <directionalLight position={[-50, 50, -50]} intensity={0.3} />
      <hemisphereLight args={['#b1e1ff', '#b97a20', 0.25]} />

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
          position={[0, -0.01, 0]}
          infiniteGrid
        />
      )}

      <AxesHelper />

      {features.map((feature) => (
        <FeatureMesh
          key={feature.id}
          feature={feature}
          isSelected={selectedFeatures.includes(feature.id)}
          isHovered={hoveredFeature === feature.id}
        />
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <planeGeometry args={[500, 500]} />
        <shadowMaterial opacity={0.15} />
      </mesh>

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport axisColors={['#ef4444', '#22c55e', '#3b82f6']} labelColor="white" />
      </GizmoHelper>

      <CursorTracker />
    </>
  );
}

export default function CADViewport() {
  const clearSelection = useCADStore(s => s.clearSelection);
  const features = useCADStore(s => s.features);
  const kernelReady = useCADStore(s => s.kernelReady);
  const statusMessage = useCADStore(s => s.statusMessage);

  return (
    <div className="w-full h-full relative" onContextMenu={(e) => e.preventDefault()}>
      <Canvas
        shadows
        camera={{ position: [80, 60, 80], fov: 50, near: 0.1, far: 2000 }}
        onPointerMissed={() => clearSelection()}
        gl={{ antialias: true }}
        style={{ background: '#0f172a' }}
      >
        <color attach="background" args={['#0f172a']} />
        <fog attach="fog" args={['#0f172a', 200, 500]} />
        <SceneContent />
      </Canvas>
      
      {/* Debug overlay */}
      <div className="absolute top-3 left-3 z-20">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg border border-white/10 px-3 py-2 text-xs font-mono">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${kernelReady ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <span className="text-gray-300">
              Kernel: {kernelReady ? 'Ready ✓' : 'Loading...'}
            </span>
          </div>
          <div className="text-gray-500">
            Features: {features.length}
          </div>
          <div className="text-gray-500 text-[10px] mt-1 max-w-[200px] truncate">
            {statusMessage}
          </div>
        </div>
      </div>
    </div>
  );
}
