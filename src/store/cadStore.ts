// CAD Store with real B-rep kernel integration
// Features now store actual OpenCASCADE shapes, not just parameters

import { create } from 'zustand';
import * as Kernel from '../kernel';
import type { MeshResult } from '../kernel';

type Vec3 = [number, number, number];

// Feature now stores BOTH params AND the real B-rep shape + tessellation
interface Feature {
  id: string;
  type: string;
  name: string;
  params: Record<string, any>;
  visible: boolean;
  suppressed: boolean;
  timestamp: number;
  
  // NEW: Real B-rep shape (opaque handle from OCCT)
  brepShape: any;
  
  // NEW: Tessellated mesh for Three.js rendering
  meshData: MeshResult | null;
}

type ViewMode = 'shaded' | 'wireframe' | 'shaded_with_edges' | 'hidden_line';
type SelectionMode = 'body' | 'face' | 'edge' | 'vertex';

interface CADState {
  // Model
  features: Feature[];
  modelName: string;
  units: 'mm' | 'inch';
  
  // Viewport
  viewMode: ViewMode;
  showGrid: boolean;
  showAxes: boolean;
  gridSize: number;
  
  // Selection
  selectedFeatures: string[];
  hoveredFeature: string | null;
  selectionMode: SelectionMode;
  
  // UI
  dialogOpen: string | null;
  commandPaletteOpen: boolean;
  
  // History
  undoStack: Feature[][];
  redoStack: Feature[][];
  
  // Status
  cursorPosition: Vec3;
  statusMessage: string;
  kernelReady: boolean;
  
  // Internal
  _saveState: () => void;
  
  // Kernel
  initKernel: () => Promise<void>;
  
  // Feature creation - NOW USES REAL B-REP
  addBox: (w: number, h: number, d: number, pos?: Vec3) => void;
  addCylinder: (r: number, h: number, pos?: Vec3) => void;
  addSphere: (r: number, pos?: Vec3) => void;
  addCone: (r1: number, r2: number, h: number, pos?: Vec3) => void;
  addTorus: (R: number, r: number, pos?: Vec3) => void;
  addPyramid: (base: number, h: number, sides: number, pos?: Vec3) => void;
  addHelix: (r: number, pitch: number, turns: number, wireR: number, pos?: Vec3) => void;
  addPipe: (outerR: number, innerR: number, h: number, pos?: Vec3) => void;
  
  // Boolean operations - NOW WORK WITH REAL SHAPES
  booleanUnite: (id1: string, id2: string) => void;
  booleanSubtract: (targetId: string, toolId: string) => void;
  
  // Feature operations
  addFillet: (radius: number) => void;
  addChamfer: (distance: number) => void;
  addShell: (thickness: number) => void;
  
  // Feature management
  deleteFeature: (id: string) => void;
  toggleFeatureVisibility: (id: string) => void;
  selectFeature: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setHoveredFeature: (id: string | null) => void;
  
  // Viewport
  setViewMode: (mode: ViewMode) => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  
  // UI
  openDialog: (dialog: string) => void;
  closeDialog: () => void;
  toggleCommandPalette: () => void;
  setSelectionMode: (mode: SelectionMode) => void;
  
  // History
  undo: () => void;
  redo: () => void;
  
  // Status
  setCursorPosition: (pos: Vec3) => void;
  setStatusMessage: (msg: string) => void;
}

// Helper: Create a feature with real B-rep shape
function createFeature(
  type: string,
  name: string,
  params: Record<string, any>,
  brepShape: any,
  position?: Vec3
): Feature {
  console.log(`[Store] Creating feature: ${type} "${name}"`);
  
  // Tessellate the B-rep shape for rendering
  let meshData: MeshResult | null = null;
  try {
    console.log(`[Store] Tessellating ${type}...`);
    meshData = Kernel.tessellateShape(brepShape, 0.1);
    console.log(`[Store] ✓ Tessellation complete: ${meshData.faceCount} faces, ${meshData.edgeCount} edges`);
  } catch (e) {
    console.error(`[Store] ❌ Failed to tessellate ${type}:`, e);
  }
  
  const feature: Feature = {
    id: `feat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    name,
    params: { ...params, position: position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    timestamp: Date.now(),
    brepShape,
    meshData,
  };
  
  console.log(`[Store] ✓ Feature created: ${feature.id}`);
  return feature;
}

let idCounter = 0;

export const useCADStore = create<CADState>((set, get) => ({
  // Initial state
  features: [],
  modelName: 'Untitled_Part',
  units: 'mm',
  viewMode: 'shaded_with_edges',
  showGrid: true,
  showAxes: true,
  gridSize: 10,
  selectedFeatures: [],
  hoveredFeature: null,
  selectionMode: 'body',
  dialogOpen: null,
  commandPaletteOpen: false,
  undoStack: [],
  redoStack: [],
  cursorPosition: [0, 0, 0],
  statusMessage: 'Initializing...',
  kernelReady: false,

  // Save state for undo
  _saveState: () => {
    const state = get();
    // Store only serializable data (not B-rep shapes) for undo
    const serializableFeatures = state.features.map(f => ({
      ...f,
      brepShape: null, // Can't serialize B-rep, will need to rebuild
      meshData: null,
    }));
    set({
      undoStack: [...state.undoStack.slice(-30), state.features],
      redoStack: [],
    });
  },

  // Initialize the OCCT kernel
  initKernel: async () => {
    try {
      set({ statusMessage: 'Loading OpenCASCADE kernel...' });
      await Kernel.initKernel();
      set({ kernelReady: true, statusMessage: 'Kernel ready ✓' });
      
      // Create demo features now that kernel is ready
      const state = get();
      if (state.features.length === 0) {
        state.addBox(40, 30, 35, [0, 0, 0]);
        state.addCylinder(12, 50, [-60, 0, 0]);
        state.addSphere(18, [60, 0, 0]);
        state.addCone(18, 6, 40, [0, 0, -60]);
        state.addTorus(22, 7, [0, 0, 60]);
        state.addPyramid(25, 35, 4, [-60, 0, -60]);
        state.addPipe(15, 10, 45, [60, 0, 60]);
      }
    } catch (error) {
      set({ statusMessage: `Kernel failed: ${error}` });
      console.error('Kernel init failed:', error);
    }
  },

  // ============ FEATURE CREATION (Real B-rep) ============

  addBox: (w, h, d, pos) => {
    console.log(`[Store] addBox called: ${w}x${h}x${d}`);
    try {
      get()._saveState();
      console.log(`[Store] Creating box shape...`);
      const shape = Kernel.createBox(w, h, d);
      console.log(`[Store] Box shape created:`, shape);
      const feature = createFeature('box', `Block ${w}×${h}×${d}`, { width: w, height: h, depth: d }, shape, pos);
      console.log(`[Store] Adding feature to state...`);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Block ${w}×${h}×${d} mm (${feature.meshData?.faceCount || 0} faces)`,
      }));
      console.log(`[Store] ✓ Box added successfully`);
    } catch (e) {
      console.error(`[Store] ❌ Error creating box:`, e);
      set({ statusMessage: `❌ Error creating box: ${e}` });
    }
  },

  addCylinder: (r, h, pos) => {
    try {
      get()._saveState();
      const shape = Kernel.createCylinder(r, h);
      const feature = createFeature('cylinder', `Cylinder R${r} H${h}`, { radius: r, height: h }, shape, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Cylinder R${r} × H${h} mm (${feature.meshData?.faceCount || 0} faces)`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating cylinder: ${e}` });
    }
  },

  addSphere: (r, pos) => {
    try {
      get()._saveState();
      const shape = Kernel.createSphere(r);
      const feature = createFeature('sphere', `Sphere R${r}`, { radius: r }, shape, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Sphere R${r} mm (${feature.meshData?.faceCount || 0} faces)`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating sphere: ${e}` });
    }
  },

  addCone: (r1, r2, h, pos) => {
    try {
      get()._saveState();
      const shape = Kernel.createCone(r1, r2, h);
      const feature = createFeature('cone', `Cone R${r1}/R${r2} H${h}`, { radius1: r1, radius2: r2, height: h }, shape, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Cone R${r1}/R${r2} × H${h} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating cone: ${e}` });
    }
  },

  addTorus: (R, r, pos) => {
    try {
      get()._saveState();
      const shape = Kernel.createTorus(R, r);
      const feature = createFeature('torus', `Torus R${R} r${r}`, { majorRadius: R, minorRadius: r }, shape, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Torus R${R} × r${r} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating torus: ${e}` });
    }
  },

  addPyramid: (base, h, sides, pos) => {
    try {
      get()._saveState();
      const shape = Kernel.createPyramid(base, h, sides);
      const feature = createFeature('pyramid', `Pyramid ${sides}-side H${h}`, { baseSize: base, height: h, sides }, shape, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created ${sides}-sided Pyramid H${h} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating pyramid: ${e}` });
    }
  },

  addHelix: (r, pitch, turns, wireR, pos) => {
    try {
      get()._saveState();
      const shape = Kernel.createHelix(r, pitch, turns, wireR);
      const feature = createFeature('helix', `Helix R${r} ${turns}T`, { radius: r, pitch, turns, wireRadius: wireR }, shape, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Helix R${r}, ${turns} turns`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating helix: ${e}` });
    }
  },

  addPipe: (outerR, innerR, h, pos) => {
    try {
      get()._saveState();
      const shape = Kernel.createPipe(outerR, innerR, h);
      const feature = createFeature('pipe', `Pipe OR${outerR} IR${innerR}`, { outerRadius: outerR, innerRadius: innerR, height: h }, shape, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Pipe OR${outerR} IR${innerR} H${h} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating pipe: ${e}` });
    }
  },

  // ============ BOOLEAN OPERATIONS (Real CSG!) ============

  booleanUnite: (id1, id2) => {
    try {
      get()._saveState();
      const f1 = get().features.find(f => f.id === id1);
      const f2 = get().features.find(f => f.id === id2);
      if (!f1 || !f2) return;
      
      const result = Kernel.booleanUnite(f1.brepShape, f2.brepShape);
      const feature = createFeature('boolean_union', `Union`, { target: id1, tool: id2 }, result);
      
      set(state => ({
        features: [...state.features.filter(f => f.id !== id1 && f.id !== id2), feature],
        statusMessage: `Boolean Unite complete`,
      }));
    } catch (e) {
      set({ statusMessage: `Boolean unite failed: ${e}` });
    }
  },

  booleanSubtract: (targetId, toolId) => {
    try {
      get()._saveState();
      const target = get().features.find(f => f.id === targetId);
      const tool = get().features.find(f => f.id === toolId);
      if (!target || !tool) return;
      
      const result = Kernel.booleanSubtract(target.brepShape, tool.brepShape);
      const feature = createFeature('boolean_subtract', `Subtract`, { target: targetId, tool: toolId }, result);
      
      set(state => ({
        features: [...state.features.filter(f => f.id !== targetId && f.id !== toolId), feature],
        statusMessage: `Boolean Subtract complete`,
      }));
    } catch (e) {
      set({ statusMessage: `Boolean subtract failed: ${e}` });
    }
  },

  // ============ FEATURE OPERATIONS ============

  addFillet: (radius) => {
    try {
      const selected = get().selectedFeatures;
      if (selected.length === 0) {
        set({ statusMessage: 'Select a feature first to fillet' });
        return;
      }
      get()._saveState();
      const target = get().features.find(f => f.id === selected[0]);
      if (!target) return;
      
      const result = Kernel.filletEdges(target.brepShape, radius);
      const feature = createFeature('fillet', `Fillet R${radius}`, { radius }, result);
      
      set(state => ({
        features: [...state.features.filter(f => f.id !== selected[0]), feature],
        statusMessage: `Applied Fillet R${radius} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Fillet failed: ${e}` });
    }
  },

  addChamfer: (distance) => {
    try {
      const selected = get().selectedFeatures;
      if (selected.length === 0) {
        set({ statusMessage: 'Select a feature first to chamfer' });
        return;
      }
      get()._saveState();
      const target = get().features.find(f => f.id === selected[0]);
      if (!target) return;
      
      const result = Kernel.chamferEdges(target.brepShape, distance);
      const feature = createFeature('chamfer', `Chamfer ${distance}mm`, { distance }, result);
      
      set(state => ({
        features: [...state.features.filter(f => f.id !== selected[0]), feature],
        statusMessage: `Applied Chamfer ${distance} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Chamfer failed: ${e}` });
    }
  },

  addShell: (thickness) => {
    try {
      const selected = get().selectedFeatures;
      if (selected.length === 0) {
        set({ statusMessage: 'Select a feature first to shell' });
        return;
      }
      get()._saveState();
      const target = get().features.find(f => f.id === selected[0]);
      if (!target) return;
      
      const result = Kernel.shellSolid(target.brepShape, thickness);
      const feature = createFeature('shell', `Shell t${thickness}`, { thickness }, result);
      
      set(state => ({
        features: [...state.features.filter(f => f.id !== selected[0]), feature],
        statusMessage: `Applied Shell thickness ${thickness} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Shell failed: ${e}` });
    }
  },

  // ============ FEATURE MANAGEMENT ============

  deleteFeature: (id) => {
    get()._saveState();
    set(state => ({
      features: state.features.filter(f => f.id !== id),
      selectedFeatures: state.selectedFeatures.filter(f => f !== id),
      statusMessage: 'Feature deleted',
    }));
  },

  toggleFeatureVisibility: (id) => {
    set(state => ({
      features: state.features.map(f =>
        f.id === id ? { ...f, visible: !f.visible } : f
      ),
    }));
  },

  selectFeature: (id, multi = false) => {
    set(state => ({
      selectedFeatures: multi
        ? state.selectedFeatures.includes(id)
          ? state.selectedFeatures.filter(f => f !== id)
          : [...state.selectedFeatures, id]
        : [id],
    }));
  },

  clearSelection: () => set({ selectedFeatures: [] }),
  setHoveredFeature: (id) => set({ hoveredFeature: id }),

  // ============ VIEWPORT ============

  setViewMode: (mode) => set({ viewMode: mode }),
  toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
  toggleAxes: () => set(state => ({ showAxes: !state.showAxes })),

  // ============ UI ============

  openDialog: (dialog) => set({ dialogOpen: dialog }),
  closeDialog: () => set({ dialogOpen: null }),
  toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  setSelectionMode: (mode) => set({ selectionMode: mode }),

  // ============ HISTORY ============

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    set({
      features: prev,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, state.features],
      statusMessage: 'Undo',
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      features: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, state.features],
      statusMessage: 'Redo',
    });
  },

  // ============ STATUS ============

  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setStatusMessage: (msg) => set({ statusMessage: msg }),
}));
