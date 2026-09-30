// Kernel module - exports all CAD kernel functionality
export { initKernel, isKernelReady, getKernel, onKernelStatus } from './occt';
export {
  // Primitives
  createBox,
  createCylinder,
  createSphere,
  createCone,
  createTorus,
  createPyramid,
  createHelix,
  createPipe,
  // Booleans
  booleanUnite,
  booleanSubtract,
  booleanIntersect,
  // Operations
  filletEdges,
  chamferEdges,
  shellSolid,
  // Sketch
  sketchAndExtrude,
  // Measurement
  measureVolume,
  measureArea,
  // Tessellation
  tessellateShape,
} from './shapes';
export type { MeshResult, SketchCommand } from './shapes';
export { createRenderMesh, createPrimitiveGeometry, createBRepMesh } from './renderer';
export type { RenderMesh } from './renderer';
