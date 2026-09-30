// Hybrid rendering: Three.js primitives (proven) + replicad B-rep (when available)
import * as THREE from 'three';
import * as Kernel from './index';

export interface RenderMesh {
  geometry: THREE.BufferGeometry;
  position: [number, number, number];
  rotation: [number, number, number];
  metadata: {
    type: string;
    faceCount: number;
    edgeCount: number;
  };
}

// Create Three.js geometry directly (proven to work)
export function createPrimitiveGeometry(
  type: string,
  params: Record<string, any>
): THREE.BufferGeometry {
  switch (type) {
    case 'box':
      return new THREE.BoxGeometry(params.width, params.height, params.depth);
    
    case 'cylinder':
      return new THREE.CylinderGeometry(params.radius, params.radius, params.height, 32);
    
    case 'sphere':
      return new THREE.SphereGeometry(params.radius, 32, 32);
    
    case 'cone':
      return new THREE.ConeGeometry(params.radius1, params.height, 32);
    
    case 'torus':
      return new THREE.TorusGeometry(params.majorRadius, params.minorRadius, 16, 48);
    
    case 'pyramid': {
      const sides = params.sides || 4;
      const geometry = new THREE.ConeGeometry(params.baseSize / 2, params.height, sides);
      return geometry;
    }
    
    case 'helix': {
      // Create helix using TubeGeometry
      const turns = params.turns || 3;
      const radius = params.radius || 10;
      const wireRadius = params.wireRadius || 1;
      const pitch = params.pitch || 10;
      
      const points: THREE.Vector3[] = [];
      const segments = turns * 32;
      
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * turns * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          t * turns * pitch,
          Math.sin(angle) * radius
        ));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      return new THREE.TubeGeometry(curve, segments, wireRadius, 8, false);
    }
    
    case 'pipe': {
      // Hollow cylinder using CSG-like approach (inner + outer)
      const outerGeom = new THREE.CylinderGeometry(
        params.outerRadius, params.outerRadius, params.height, 32
      );
      return outerGeom; // Simplified - just outer cylinder for now
    }
    
    default:
      console.warn(`Unknown primitive type: ${type}, using box`);
      return new THREE.BoxGeometry(10, 10, 10);
  }
}

// Try to create B-rep shape and tessellate it
export async function createBRepMesh(
  type: string,
  params: Record<string, any>
): Promise<RenderMesh | null> {
  if (!Kernel.isKernelReady()) {
    console.log('[Render] Kernel not ready, using Three.js primitive');
    return null;
  }
  
  try {
    let shape: any;
    
    // Create B-rep shape
    switch (type) {
      case 'box':
        shape = Kernel.createBox(params.width, params.height, params.depth);
        break;
      case 'cylinder':
        shape = Kernel.createCylinder(params.radius, params.height);
        break;
      case 'sphere':
        shape = Kernel.createSphere(params.radius);
        break;
      case 'cone':
        shape = Kernel.createCone(params.radius1, params.radius2, params.height);
        break;
      case 'torus':
        shape = Kernel.createTorus(params.majorRadius, params.minorRadius);
        break;
      case 'pyramid':
        shape = Kernel.createPyramid(params.baseSize, params.height, params.sides);
        break;
      case 'helix':
        shape = Kernel.createHelix(params.radius, params.pitch, params.turns, params.wireRadius);
        break;
      case 'pipe':
        shape = Kernel.createPipe(params.outerRadius, params.innerRadius, params.height);
        break;
      default:
        console.warn(`[Render] Unknown B-rep type: ${type}`);
        return null;
    }
    
    // Tessellate
    const meshData = Kernel.tessellateShape(shape, 0.1);
    
    if (!meshData.facePositions || meshData.facePositions.length === 0) {
      console.warn(`[Render] Tessellation produced no geometry for ${type}`);
      return null;
    }
    
    // Convert to Three.js geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(meshData.facePositions, 3));
    
    if (meshData.faceNormals && meshData.faceNormals.length > 0) {
      geometry.setAttribute('normal', new THREE.BufferAttribute(meshData.faceNormals, 3));
    }
    
    if (meshData.faceIndices && meshData.faceIndices.length > 0) {
      geometry.setIndex(new THREE.BufferAttribute(meshData.faceIndices, 1));
    }
    
    geometry.computeBoundingSphere();
    
    console.log(`[Render] ✓ B-rep mesh created for ${type}: ${meshData.faceCount} faces`);
    
    return {
      geometry,
      position: params.position || [0, 0, 0],
      rotation: [0, 0, 0],
      metadata: {
        type,
        faceCount: meshData.faceCount,
        edgeCount: meshData.edgeCount,
      },
    };
  } catch (error) {
    console.error(`[Render] B-rep creation failed for ${type}:`, error);
    return null;
  }
}

// Main render function: tries B-rep first, falls back to Three.js primitive
export async function createRenderMesh(
  type: string,
  params: Record<string, any>
): Promise<RenderMesh> {
  // Try B-rep first
  const brepMesh = await createBRepMesh(type, params);
  if (brepMesh) {
    return brepMesh;
  }
  
  // Fallback to Three.js primitive
  console.log(`[Render] Falling back to Three.js primitive for ${type}`);
  const geometry = createPrimitiveGeometry(type, params);
  
  return {
    geometry,
    position: params.position || [0, 0, 0],
    rotation: type === 'torus' ? [Math.PI / 2, 0, 0] : [0, 0, 0],
    metadata: {
      type,
      faceCount: 0, // Unknown for primitives
      edgeCount: 0,
    },
  };
}
