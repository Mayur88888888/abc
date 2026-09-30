// CAD Viewport - Renders real B-rep shapes tessellated from OpenCASCADE
import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, GizmoHelper, GizmoViewport, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useCADStore } from '../store/cadStore';
import type { MeshResult } from '../kernel';

// Render a tessellated B-rep shape
function BRepMesh({ feature, isSelected, isHovered }: {
  feature: any;
  isSelected: boolean;
  isHovered: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const edgesRef = useRef<THREE.LineSegments>(null);
  const viewMode = useCADStore(s => s.viewMode);
  const selectFeature = useCADStore(s => s.selectFeature);
  const setHoveredFeature = useCADStore(s => s.setHoveredFeature);
  const selectionMode = useCADStore(s => s.selectionMode);
  const setStatusMessage = useCADStore(s => s.setStatusMessage);

  const meshData = feature.meshData as MeshResult | null;
  
  // Create Three.js geometry from tessellated mesh data
  const geometry = useMemo(() => {
    if (!meshData || !meshData.facePositions || meshData.facePositions.length === 0) {
      return null;
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(meshData.facePositions, 3));
    geom.setAttribute('normal', new THREE.BufferAttribute(meshData.faceNormals, 3));
    if (meshData.faceIndices && meshData.faceIndices.length > 0) {
      geom.setIndex(new THREE.BufferAttribute(meshData.faceIndices, 1));
    }
    geom.computeBoundingSphere();
    return geom;
  }, [meshData]);

  // Create edge geometry
  const edgeGeometry = useMemo(() => {
    if (!meshData || !meshData.edgePositions || meshData.edgePositions.length === 0) {
      return null;
    }
    
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(meshData.edgePositions, 3));
    if (meshData.edgeIndices && meshData.edgeIndices.length > 0) {
      geom.setIndex(new THREE.BufferAttribute(meshData.edgeIndices, 1));
    }
    return geom;
  }, [meshData]);

  if (!feature.visible || feature.suppressed || !geometry) return null;

  const pos = feature.params.position || [0, 0, 0];
  
  // Color based on state
  const color = isSelected ? '#8b5cf6' : isHovered ? '#06b6d4' : '#94a3b8';
  const isWireframe = viewMode === 'wireframe';
  const showEdges = viewMode === 'shaded_with_edges' || selectionMode === 'edge';

  return (
    <group position={[pos[0], pos[2], -pos[1]]}>
      {/* Main mesh */}
      <mesh
        ref={meshRef}
        geometry={geometry}
        onClick={(e) => {
          e.stopPropagation();
          selectFeature(feature.id);
          if (meshData) {
            setStatusMessage(`Selected ${feature.name} (${meshData.faceCount} faces, ${meshData.edgeCount} edges)`);
          }
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
          transparent={isWireframe}
          opacity={isWireframe ? 0.5 : 1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Edge overlay */}
      {showEdges && edgeGeometry && (
        <lineSegments ref={edgesRef} geometry={edgeGeometry}>
          <lineBasicMaterial color="#1e293b" transparent opacity={0.4} />
        </lineSegments>
      )}

      {/* Selection outline */}
      {isSelected && edgeGeometry && (
        <lineSegments geometry={edgeGeometry}>
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

// Cursor tracker - throttled
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
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[50, 100, 50]} intensity={1} castShadow />
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
          position={[0, -0.01, 0]}
          infiniteGrid
        />
      )}

      <AxesHelper />

      {/* Render all B-rep features */}
      {features.map((feature) => (
        <BRepMesh
          key={feature.id}
          feature={feature}
          isSelected={selectedFeatures.includes(feature.id)}
          isHovered={hoveredFeature === feature.id}
        />
      ))}

      {/* Ground for shadows */}
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
    </div>
  );
}
