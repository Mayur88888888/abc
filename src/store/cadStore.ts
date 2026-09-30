// CAD Store - Hybrid rendering (Three.js primitives + replicad B-rep)
import { create } from 'zustand';
import * as Kernel from '../kernel';
import { createRenderMesh } from '../kernel/renderer';
import type { RenderMesh } from '../kernel';

type Vec3 = [number, number, number];

interface Feature {
  id: string;
  type: string;
  name: string;
  params: Record<string, any>;
  visible: boolean;
  suppressed: boolean;
  timestamp: number;
  renderMesh: RenderMesh | null;
}

type ViewMode = 'shaded' | 'wireframe' | 'shaded_with_edges' | 'hidden_line';
type SelectionMode = 'body' | 'face' | 'edge' | 'vertex';

interface CADState {
  features: Feature[];
  viewMode: ViewMode;
  showGrid: boolean;
  showAxes: boolean;
  gridSize: number;
  selectedFeatures: string[];
  hoveredFeature: string | null;
  selectionMode: SelectionMode;
  dialogOpen: string | null;
  commandPaletteOpen: boolean;
  undoStack: Feature[][];
  redoStack: Feature[][];
  cursorPosition: Vec3;
  statusMessage: string;
  kernelReady: boolean;
  
  _saveState: () => void;
  initKernel: () => Promise<void>;
  
  // Feature creation
  addBox: (w: number, h: number, d: number, pos?: Vec3) => Promise<void>;
  addCylinder: (r: number, h: number, pos?: Vec3) => Promise<void>;
  addSphere: (r: number, pos?: Vec3) => Promise<void>;
  addCone: (r1: number, r2: number, h: number, pos?: Vec3) => Promise<void>;
  addTorus: (R: number, r: number, pos?: Vec3) => Promise<void>;
  addPyramid: (base: number, h: number, sides: number, pos?: Vec3) => Promise<void>;
  addHelix: (r: number, pitch: number, turns: number, wireR: number, pos?: Vec3) => Promise<void>;
  addPipe: (outerR: number, innerR: number, h: number, pos?: Vec3) => Promise<void>;
  
  // Boolean operations
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

// Helper: Create feature with hybrid rendering
async function createFeatureAsync(
  type: string,
  name: string,
  params: Record<string, any>,
  position?: Vec3
): Promise<Feature> {
  console.log(`[Store] Creating feature: ${type} "${name}"`);
  
  const renderMesh = await createRenderMesh(type, {
    ...params,
    position: position || [0, 0, 0],
  });
  
  console.log(`[Store] ✓ Render mesh created for ${type}`);
  
  return {
    id: `feat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    type,
    name,
    params: { ...params, position: position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    timestamp: Date.now(),
    renderMesh,
  };
}

export const useCADStore = create<CADState>((set, get) => ({
  features: [],
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

  _saveState: () => {
    const state = get();
    set({
      undoStack: [...state.undoStack.slice(-30), state.features],
      redoStack: [],
    });
  },

  initKernel: async () => {
    try {
      set({ statusMessage: 'Loading OpenCASCADE kernel...' });
      await Kernel.initKernel();
      set({ kernelReady: true, statusMessage: 'Kernel ready ✓' });
      
      // Create demo features
      const state = get();
      if (state.features.length === 0) {
        await state.addBox(40, 30, 35, [0, 0, 0]);
        await state.addCylinder(12, 50, [-60, 0, 0]);
        await state.addSphere(18, [60, 0, 0]);
        await state.addCone(18, 6, 40, [0, 0, -60]);
        await state.addTorus(22, 7, [0, 0, 60]);
        await state.addPyramid(25, 35, 4, [-60, 0, -60]);
        await state.addPipe(15, 10, 45, [60, 0, 60]);
      }
    } catch (error) {
      set({ statusMessage: `Kernel failed: ${error}` });
      console.error('Kernel init failed:', error);
    }
  },

  // ============ FEATURE CREATION ============

  addBox: async (w, h, d, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('box', `Block ${w}×${h}×${d}`, { width: w, height: h, depth: d }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Block ${w}×${h}×${d} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating box: ${e}` });
    }
  },

  addCylinder: async (r, h, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('cylinder', `Cylinder R${r} H${h}`, { radius: r, height: h }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Cylinder R${r} × H${h} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating cylinder: ${e}` });
    }
  },

  addSphere: async (r, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('sphere', `Sphere R${r}`, { radius: r }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Sphere R${r} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating sphere: ${e}` });
    }
  },

  addCone: async (r1, r2, h, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('cone', `Cone R${r1}/R${r2} H${h}`, { radius1: r1, radius2: r2, height: h }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Cone R${r1}/R${r2} × H${h} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating cone: ${e}` });
    }
  },

  addTorus: async (R, r, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('torus', `Torus R${R} r${r}`, { majorRadius: R, minorRadius: r }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Torus R${R} × r${r} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating torus: ${e}` });
    }
  },

  addPyramid: async (base, h, sides, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('pyramid', `Pyramid ${sides}-side H${h}`, { baseSize: base, height: h, sides }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created ${sides}-sided Pyramid H${h} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating pyramid: ${e}` });
    }
  },

  addHelix: async (r, pitch, turns, wireR, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('helix', `Helix R${r} ${turns}T`, { radius: r, pitch, turns, wireRadius: wireR }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Helix R${r}, ${turns} turns`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating helix: ${e}` });
    }
  },

  addPipe: async (outerR, innerR, h, pos) => {
    try {
      get()._saveState();
      const feature = await createFeatureAsync('pipe', `Pipe OR${outerR} IR${innerR}`, { outerRadius: outerR, innerRadius: innerR, height: h }, pos);
      set(state => ({
        features: [...state.features, feature],
        statusMessage: `Created Pipe OR${outerR} IR${innerR} H${h} mm`,
      }));
    } catch (e) {
      set({ statusMessage: `Error creating pipe: ${e}` });
    }
  },

  // ============ BOOLEAN OPERATIONS ============

  booleanUnite: (id1, id2) => {
    set({ statusMessage: 'Boolean unite not yet implemented' });
  },

  booleanSubtract: (targetId, toolId) => {
    set({ statusMessage: 'Boolean subtract not yet implemented' });
  },

  // ============ FEATURE OPERATIONS ============

  addFillet: (radius) => {
    set({ statusMessage: 'Fillet not yet implemented' });
  },

  addChamfer: (distance) => {
    set({ statusMessage: 'Chamfer not yet implemented' });
  },

  addShell: (thickness) => {
    set({ statusMessage: 'Shell not yet implemented' });
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
