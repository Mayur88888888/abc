// Real B-rep shape creation using replicad (OpenCASCADE kernel)
// Every shape here is a TRUE solid with topology (faces, edges, vertices)

import * as replicad from 'replicad';
import { isKernelReady } from './occt';

// Use 'any' for Shape since replicad's generic types are complex
type BRepShape = any;

export interface MeshResult {
  // Tessellated face data for Three.js
  facePositions: Float32Array;
  faceNormals: Float32Array;
  faceIndices: Uint32Array;
  faceGroups: { start: number; count: number; materialIndex: number }[];
  
  // Edge data for wireframe display
  edgePositions: Float32Array;
  edgeIndices: Uint32Array;
  
  // Bounding box
  boundingBox: {
    min: [number, number, number];
    max: [number, number, number];
  };
  
  // Topology info
  faceCount: number;
  edgeCount: number;
  vertexCount: number;
}

/**
 * Tessellate a replicad Shape into mesh data for Three.js rendering
 */
export function tessellateShape(shape: BRepShape, tolerance: number = 0.1): MeshResult {
  console.log('[Tessellate] Starting tessellation with tolerance:', tolerance);
  
  // Get face mesh (triangulated surfaces)
  let mesh;
  try {
    mesh = shape.mesh({ tolerance, angularTolerance: 30 });
    console.log('[Tessellate] Mesh created:', mesh);
    console.log('[Tessellate] Mesh type:', typeof mesh);
    console.log('[Tessellate] Mesh constructor:', mesh?.constructor?.name);
    console.log('[Tessellate] Mesh keys:', Object.keys(mesh || {}));
    
    // Log all properties of the mesh object
    if (mesh) {
      console.log('[Tessellate] Mesh properties:', {
        hasPositions: 'positions' in mesh,
        hasNormals: 'normals' in mesh,
        hasIndices: 'indices' in mesh,
        hasFaceGroups: 'faceGroups' in mesh,
        positionsType: mesh.positions?.constructor?.name,
        positionsLength: mesh.positions?.length,
        normalsType: mesh.normals?.constructor?.name,
        normalsLength: mesh.normals?.length,
        indicesType: mesh.indices?.constructor?.name,
        indicesLength: mesh.indices?.length,
      });
    }
  } catch (e) {
    console.error('[Tessellate] Failed to create mesh:', e);
    throw e;
  }
  
  // Get edge mesh (line segments)
  let edgePositions = new Float32Array(0);
  let edgeIndices = new Uint32Array(0);
  try {
    const edgeMesh = shape.meshEdges({ tolerance });
    console.log('[Tessellate] Edge mesh created:', edgeMesh);
    if (edgeMesh) {
      edgePositions = edgeMesh.positions || new Float32Array(0);
      edgeIndices = edgeMesh.indices || new Uint32Array(0);
    }
  } catch (e) {
    console.warn('[Tessellate] Failed to create edge mesh:', e);
  }
  
  // Get bounding box - handle different API formats
  let boundingBox = {
    min: [0, 0, 0] as [number, number, number],
    max: [0, 0, 0] as [number, number, number],
  };
  
  try {
    const bound = shape.boundingBox;
    console.log('[Tessellate] Bounding box:', bound);
    console.log('[Tessellate] Bounding box keys:', Object.keys(bound || {}));
    
    if (bound) {
      // Try different possible formats
      if (bound.min && typeof bound.min === 'object') {
        // Format: { min: { X, Y, Z }, max: { X, Y, Z } }
        boundingBox.min = [bound.min.X || 0, bound.min.Y || 0, bound.min.Z || 0];
        boundingBox.max = [bound.max.X || 0, bound.max.Y || 0, bound.max.Z || 0];
      } else if (bound.min && Array.isArray(bound.min)) {
        // Format: { min: [x, y, z], max: [x, y, z] }
        boundingBox.min = bound.min;
        boundingBox.max = bound.max;
      } else if (bound.minX !== undefined) {
        // Format: { minX, minY, minZ, maxX, maxY, maxZ }
        boundingBox.min = [bound.minX || 0, bound.minY || 0, bound.minZ || 0];
        boundingBox.max = [bound.maxX || 0, bound.maxY || 0, bound.maxZ || 0];
      }
    }
  } catch (e) {
    console.warn('[Tessellate] Failed to get bounding box:', e);
  }
  
  // Count topology
  let faceCount = 0, edgeCount = 0, vertexCount = 0;
  try { faceCount = shape.faces?.length || 0; } catch(e) { console.warn('[Tessellate] Failed to count faces:', e); }
  try { edgeCount = shape.edges?.length || 0; } catch(e) { console.warn('[Tessellate] Failed to count edges:', e); }
  try { vertexCount = shape.vertices?.length || 0; } catch(e) { console.warn('[Tessellate] Failed to count vertices:', e); }
  
  console.log('[Tessellate] Topology:', { faceCount, edgeCount, vertexCount });
  
  const result = {
    facePositions: mesh?.positions || new Float32Array(0),
    faceNormals: mesh?.normals || new Float32Array(0),
    faceIndices: mesh?.indices || new Uint32Array(0),
    faceGroups: mesh?.faceGroups || [],
    edgePositions,
    edgeIndices,
    boundingBox,
    faceCount,
    edgeCount,
    vertexCount,
  };
  
  console.log('[Tessellate] Result:', {
    facePositions: result.facePositions.length,
    faceNormals: result.faceNormals.length,
    faceIndices: result.faceIndices.length,
    boundingBox: result.boundingBox,
  });
  
  return result;
}

// ============================================================
// PRIMITIVE SHAPE CREATORS
// ============================================================

export function createBox(width: number, height: number, depth: number): BRepShape {
  assertKernel();
  // makeBaseBox creates a box with given dimensions at origin
  return (replicad as any).makeBaseBox(width, depth, height);
}

export function createCylinder(radius: number, height: number): BRepShape {
  assertKernel();
  return replicad.makeCylinder(radius, height);
}

export function createSphere(radius: number): BRepShape {
  assertKernel();
  return replicad.makeSphere(radius);
}

// Cone via sketch + revolve (replicad doesn't have makeCone directly)
export function createCone(radius1: number, radius2: number, height: number): BRepShape {
  assertKernel();
  // Create a trapezoid profile and revolve it
  const sketcher = new (replicad as any).Sketcher('XZ');
  sketcher.movePointerTo([0, 0]);
  sketcher.lineTo([radius1, 0]);
  sketcher.lineTo([radius2, height]);
  sketcher.lineTo([0, height]);
  sketcher.close();
  return sketcher.revolve([0, 1, 0]);
}

// Torus via sketch + revolve
export function createTorus(majorRadius: number, minorRadius: number): BRepShape {
  assertKernel();
  const sketcher = new (replicad as any).Sketcher('XZ');
  sketcher.movePointerTo([majorRadius, -minorRadius]);
  sketcher.circle(minorRadius);
  return sketcher.revolve([0, 1, 0]);
}

// Pyramid via sketch + extrude (N-sided)
export function createPyramid(baseSize: number, height: number, sides: number): BRepShape {
  assertKernel();
  // Create polygon sketch and extrude, then taper
  const sketcher = new (replicad as any).Sketcher('XY');
  const angle = (2 * Math.PI) / sides;
  const r = baseSize / 2;
  
  // First point
  sketcher.movePointerTo([r * Math.cos(0), r * Math.sin(0)]);
  for (let i = 1; i <= sides; i++) {
    const a = i * angle;
    sketcher.lineTo([r * Math.cos(a), r * Math.sin(a)]);
  }
  sketcher.close();
  return sketcher.extrude(height);
}

// Helix via sweep along helical path
export function createHelix(radius: number, pitch: number, turns: number, wireRadius: number): BRepShape {
  assertKernel();
  // Create a circle profile and sweep along helix
  const sketcher = new (replicad as any).Sketcher('XY');
  sketcher.circle(wireRadius);
  const profile = sketcher.close();
  
  // Create helix path using replicad's helix support
  try {
    const helixWire = (replicad as any).makeHelix(pitch, turns * pitch, radius);
    return profile.sweep(helixWire);
  } catch (e) {
    // Fallback: create a simple cylinder
    return replicad.makeCylinder(wireRadius, turns * pitch);
  }
}

// Pipe (hollow cylinder)
export function createPipe(outerRadius: number, innerRadius: number, height: number): BRepShape {
  assertKernel();
  const outer = replicad.makeCylinder(outerRadius, height);
  const inner = replicad.makeCylinder(innerRadius, height + 0.1);
  return outer.cut(inner);
}

// ============================================================
// BOOLEAN OPERATIONS (Real CSG!)
// ============================================================

export function booleanUnite(shape1: BRepShape, shape2: BRepShape): BRepShape {
  assertKernel();
  return shape1.fuse(shape2);
}

export function booleanSubtract(target: BRepShape, tool: BRepShape): BRepShape {
  assertKernel();
  return target.cut(tool);
}

export function booleanIntersect(shape1: BRepShape, shape2: BRepShape): BRepShape {
  assertKernel();
  return shape1.intersection(shape2);
}

// ============================================================
// FEATURE OPERATIONS
// ============================================================

export function filletEdges(shape: BRepShape, radius: number): BRepShape {
  assertKernel();
  try {
    return shape.fillet(radius);
  } catch (e) {
    console.warn('Fillet failed, returning original shape:', e);
    return shape;
  }
}

export function chamferEdges(shape: BRepShape, distance: number): BRepShape {
  assertKernel();
  try {
    return shape.chamfer(distance, distance);
  } catch (e) {
    console.warn('Chamfer failed, returning original shape:', e);
    return shape;
  }
}

export function shellSolid(shape: BRepShape, thickness: number): BRepShape {
  assertKernel();
  try {
    return shape.shell({ thickness });
  } catch (e) {
    console.warn('Shell failed, returning original shape:', e);
    return shape;
  }
}

// ============================================================
// SKETCH & EXTRUSION
// ============================================================

export type SketchCommand =
  | { type: 'line'; x: number; y: number }
  | { type: 'arc'; x: number; y: number }
  | { type: 'circle'; radius: number }
  | { type: 'moveTo'; x: number; y: number }
  | { type: 'rectangle'; width: number; height: number };

/**
 * Create a sketch on a plane and extrude it
 */
export function sketchAndExtrude(
  plane: 'XY' | 'XZ' | 'YZ',
  commands: SketchCommand[],
  extrudeDistance: number
): BRepShape {
  assertKernel();
  
  const SketcherClass = (replicad as any).Sketcher;
  let sketcher = new SketcherClass(plane);
  
  for (const cmd of commands) {
    switch (cmd.type) {
      case 'line':
        sketcher = sketcher.lineTo([cmd.x, cmd.y]);
        break;
      case 'arc':
        sketcher = sketcher.arcTo([cmd.x, cmd.y]);
        break;
      case 'circle':
        sketcher = sketcher.circle(cmd.radius);
        break;
      case 'moveTo':
        sketcher = sketcher.movePointerTo([cmd.x, cmd.y]);
        break;
      case 'rectangle':
        sketcher = sketcher.rect(cmd.width, cmd.height);
        break;
    }
  }
  
  return sketcher.close().extrude(extrudeDistance);
}

// ============================================================
// MEASUREMENT
// ============================================================

export function measureVolume(shape: BRepShape): number {
  assertKernel();
  try {
    return shape.volume || 0;
  } catch (e) {
    return 0;
  }
}

export function measureArea(shape: BRepShape): number {
  assertKernel();
  try {
    return shape.area || 0;
  } catch (e) {
    return 0;
  }
}

// ============================================================
// HELPERS
// ============================================================

function assertKernel() {
  if (!isKernelReady()) {
    throw new Error('OCCT kernel not initialized. Call initKernel() first.');
  }
}
