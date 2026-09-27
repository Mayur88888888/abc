import { create } from 'zustand';
import {
  Feature,
  CADModel,
  Vec3,
  createBoxFeature,
  createCylinderFeature,
  createSphereFeature,
  createConeFeature,
  createTorusFeature,
  createPyramidFeature,
  createHelixFeature,
  createExtrudeFeature,
  createRevolveFeature,
  createFilletFeature,
  createChamferFeature,
  createShellFeature,
  createHoleFeature,
  createLinearPatternFeature,
  createCircularPatternFeature,
  createDatumPlaneFeature,
  createSweepFeature,
  createPipeFeature,
  createLoftFeature,
  createMirrorFeature,
} from '../lib/cadEngine';

type ViewMode = 'shaded' | 'wireframe' | 'shaded_with_edges' | 'hidden_line' | 'raytraced';
type SelectionMode = 'face' | 'edge' | 'vertex' | 'body';
type ToolMode = 'select' | 'sketch' | 'measure' | 'section';

interface CADState {
  // Model
  model: CADModel;
  
  // Viewport
  viewMode: ViewMode;
  showGrid: boolean;
  showAxes: boolean;
  showOrigin: boolean;
  snapToGrid: boolean;
  gridSize: number;
  
  // Selection
  selectedFeatures: string[];
  hoveredFeature: string | null;
  selectionMode: SelectionMode;
  
  // Tools
  activeTool: ToolMode;
  sketchActive: boolean;
  sketchPlane: 'XY' | 'XZ' | 'YZ';
  
  // UI State
  activeTab: string;
  commandPaletteOpen: boolean;
  dialogOpen: string | null;
  dialogParams: Record<string, any>;
  
  // History
  undoStack: CADModel[];
  redoStack: CADModel[];
  
  // Status
  cursorPosition: Vec3;
  statusMessage: string;
  
  // Internal
  _saveState: () => void;
  
  // Actions - Model (all support position offset for proper placement)
  addBox: (w: number, h: number, d: number, pos?: Vec3) => void;
  addCylinder: (r: number, h: number, pos?: Vec3) => void;
  addSphere: (r: number, pos?: Vec3) => void;
  addCone: (r1: number, r2: number, h: number, pos?: Vec3) => void;
  addTorus: (R: number, r: number, pos?: Vec3) => void;
  addPyramid: (base: number, h: number, sides: number, pos?: Vec3) => void;
  addHelix: (r: number, pitch: number, turns: number, wireR: number, pos?: Vec3) => void;
  addExtrude: (distance: number, direction: Vec3, taper: number, pos?: Vec3) => void;
  addRevolve: (axis: Vec3, angle: number, pos?: Vec3) => void;
  addFillet: (radius: number, pos?: Vec3) => void;
  addChamfer: (distance: number, angle: number, pos?: Vec3) => void;
  addShell: (thickness: number, pos?: Vec3) => void;
  addHole: (position: Vec3, diameter: number, depth: number, type: string) => void;
  addLinearPattern: (direction: Vec3, count: number, spacing: number, pos?: Vec3) => void;
  addCircularPattern: (axis: Vec3, count: number, angle: number, pos?: Vec3) => void;
  addDatumPlane: (offset: number, reference: string) => void;
  addSweep: (pos?: Vec3) => void;
  addPipe: (outerR: number, innerR: number, h: number, pos?: Vec3) => void;
  addLoft: (pos?: Vec3) => void;
  addMirror: (plane: string, pos?: Vec3) => void;
  
  // Actions - Feature management
  deleteFeature: (id: string) => void;
  toggleFeatureVisibility: (id: string) => void;
  suppressFeature: (id: string) => void;
  renameFeature: (id: string, name: string) => void;
  reorderFeatures: (fromIndex: number, toIndex: number) => void;
  editFeatureParams: (id: string, params: Record<string, any>) => void;
  
  // Actions - Viewport
  setViewMode: (mode: ViewMode) => void;
  toggleGrid: () => void;
  toggleAxes: () => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  
  // Actions - Selection
  selectFeature: (id: string, multi?: boolean) => void;
  clearSelection: () => void;
  setHoveredFeature: (id: string | null) => void;
  setSelectionMode: (mode: SelectionMode) => void;
  
  // Actions - Tools
  setActiveTool: (tool: ToolMode) => void;
  startSketch: (plane: 'XY' | 'XZ' | 'YZ') => void;
  endSketch: () => void;
  
  // Actions - UI
  setActiveTab: (tab: string) => void;
  toggleCommandPalette: () => void;
  openDialog: (dialog: string, params?: Record<string, any>) => void;
  closeDialog: () => void;
  
  // Actions - History
  undo: () => void;
  redo: () => void;
  
  // Actions - Status
  setCursorPosition: (pos: Vec3) => void;
  setStatusMessage: (msg: string) => void;
}

const initialModel: CADModel = {
  name: 'Untitled_Part',
  units: 'mm',
  features: [],
  activeSketch: null,
  selectedEntities: [],
  workPlane: 'XY',
};

export const useCADStore = create<CADState>((set, get) => ({
  // Initial state
  model: initialModel,
  viewMode: 'shaded_with_edges',
  showGrid: true,
  showAxes: true,
  showOrigin: true,
  snapToGrid: false,
  gridSize: 10,
  selectedFeatures: [],
  hoveredFeature: null,
  selectionMode: 'body',
  activeTool: 'select',
  sketchActive: false,
  sketchPlane: 'XY',
  activeTab: 'model',
  commandPaletteOpen: false,
  dialogOpen: null,
  dialogParams: {},
  undoStack: [],
  redoStack: [],
  cursorPosition: [0, 0, 0],
  statusMessage: 'Ready',

  // Save state for undo
  _saveState: () => {
    const state = get();
    set({
      undoStack: [...state.undoStack.slice(-50), JSON.parse(JSON.stringify(state.model))],
      redoStack: [],
    });
  },

  // Model operations - ALL with position support
  addBox: (w, h, d, pos) => {
    get()._saveState();
    const feature = createBoxFeature({ width: w, height: h, depth: d, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created Block ${w}×${h}×${d} mm`,
    }));
  },

  addCylinder: (r, h, pos) => {
    get()._saveState();
    const feature = createCylinderFeature({ radius: r, height: h, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created Cylinder R${r} × H${h} mm`,
    }));
  },

  addSphere: (r, pos) => {
    get()._saveState();
    const feature = createSphereFeature({ radius: r, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created Sphere R${r} mm`,
    }));
  },

  addCone: (r1, r2, h, pos) => {
    get()._saveState();
    const feature = createConeFeature({ radius1: r1, radius2: r2, height: h, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created Cone R${r1}/R${r2} × H${h} mm`,
    }));
  },

  addTorus: (R, r, pos) => {
    get()._saveState();
    const feature = createTorusFeature({ majorRadius: R, minorRadius: r, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created Torus R${R} × r${r} mm`,
    }));
  },

  addPyramid: (base, h, sides, pos) => {
    get()._saveState();
    const feature = createPyramidFeature({ baseSize: base, height: h, sides, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created ${sides}-sided Pyramid H${h} mm`,
    }));
  },

  addHelix: (r, pitch, turns, wireR, pos) => {
    get()._saveState();
    const feature = createHelixFeature({ radius: r, pitch, turns, wireRadius: wireR, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created Helix R${r}, ${turns} turns`,
    }));
  },

  addExtrude: (distance, direction, taper, pos) => {
    get()._saveState();
    const feature = createExtrudeFeature({ distance, direction, taper, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Extruded ${distance} mm`,
    }));
  },

  addRevolve: (axis, angle, pos) => {
    get()._saveState();
    const feature = createRevolveFeature({ axis, angle, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Revolved ${angle}°`,
    }));
  },

  addFillet: (radius, pos) => {
    get()._saveState();
    const feature = createFilletFeature({ radius, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Applied Fillet R${radius} mm`,
    }));
  },

  addChamfer: (distance, angle, pos) => {
    get()._saveState();
    const feature = createChamferFeature({ distance, angle, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Applied Chamfer ${distance}mm × ${angle}°`,
    }));
  },

  addShell: (thickness, pos) => {
    get()._saveState();
    const feature = createShellFeature({ thickness, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Shell thickness: ${thickness} mm`,
    }));
  },

  addHole: (position, diameter, depth, type) => {
    get()._saveState();
    const feature = createHoleFeature({ position, diameter, depth, type });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created ${type} hole D${diameter} × D${depth} mm`,
    }));
  },

  addLinearPattern: (direction, count, spacing, pos) => {
    get()._saveState();
    const f = createLinearPatternFeature({ direction, count, spacing, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, f] },
      statusMessage: `Linear pattern: ${count} instances, ${spacing}mm spacing`,
    }));
  },

  addCircularPattern: (axis, count, angle, pos) => {
    get()._saveState();
    const f = createCircularPatternFeature({ axis, count, angle, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, f] },
      statusMessage: `Circular pattern: ${count} instances, ${angle}°`,
    }));
  },

  addDatumPlane: (offset, reference) => {
    get()._saveState();
    const feature = createDatumPlaneFeature({ offset, reference });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created datum plane at ${offset} mm`,
    }));
  },

  addSweep: (pos) => {
    get()._saveState();
    const feature = createSweepFeature({ position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created sweep feature`,
    }));
  },

  addPipe: (outerR, innerR, h, pos) => {
    get()._saveState();
    const feature = createPipeFeature({ outerRadius: outerR, innerRadius: innerR, height: h, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created Pipe OR${outerR} IR${innerR} H${h} mm`,
    }));
  },

  addLoft: (pos) => {
    get()._saveState();
    const feature = createLoftFeature({ position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created loft feature`,
    }));
  },

  addMirror: (plane, pos) => {
    get()._saveState();
    const feature = createMirrorFeature({ plane, position: pos });
    set(state => ({
      model: { ...state.model, features: [...state.model.features, feature] },
      statusMessage: `Created mirror on ${plane} plane`,
    }));
  },

  // Feature management
  deleteFeature: (id) => {
    get()._saveState();
    set(state => ({
      model: { ...state.model, features: state.model.features.filter(f => f.id !== id) },
      selectedFeatures: state.selectedFeatures.filter(f => f !== id),
      statusMessage: 'Feature deleted',
    }));
  },

  toggleFeatureVisibility: (id) => {
    set(state => ({
      model: {
        ...state.model,
        features: state.model.features.map(f =>
          f.id === id ? { ...f, visible: !f.visible } : f
        ),
      },
    }));
  },

  suppressFeature: (id) => {
    get()._saveState();
    set(state => ({
      model: {
        ...state.model,
        features: state.model.features.map(f =>
          f.id === id ? { ...f, suppressed: !f.suppressed } : f
        ),
      },
      statusMessage: 'Feature suppressed',
    }));
  },

  renameFeature: (id, name) => {
    set(state => ({
      model: {
        ...state.model,
        features: state.model.features.map(f =>
          f.id === id ? { ...f, name } : f
        ),
      },
    }));
  },

  reorderFeatures: (fromIndex, toIndex) => {
    get()._saveState();
    set(state => {
      const features = [...state.model.features];
      const [moved] = features.splice(fromIndex, 1);
      features.splice(toIndex, 0, moved);
      return { model: { ...state.model, features } };
    });
  },

  editFeatureParams: (id, params) => {
    get()._saveState();
    set(state => ({
      model: {
        ...state.model,
        features: state.model.features.map(f =>
          f.id === id ? { ...f, params: { ...f.params, ...params } } : f
        ),
      },
      statusMessage: 'Feature parameters updated',
    }));
  },

  // Viewport
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleGrid: () => set(state => ({ showGrid: !state.showGrid })),
  toggleAxes: () => set(state => ({ showAxes: !state.showAxes })),
  setSnapToGrid: (snap) => set({ snapToGrid: snap }),
  setGridSize: (size) => set({ gridSize: size }),

  // Selection
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
  setSelectionMode: (mode) => set({ selectionMode: mode }),

  // Tools
  setActiveTool: (tool) => set({ activeTool: tool }),
  startSketch: (plane) => set({ sketchActive: true, sketchPlane: plane, activeTool: 'sketch' }),
  endSketch: () => set({ sketchActive: false, activeTool: 'select' }),

  // UI
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleCommandPalette: () => set(state => ({ commandPaletteOpen: !state.commandPaletteOpen })),
  openDialog: (dialog, params = {}) => set({ dialogOpen: dialog, dialogParams: params }),
  closeDialog: () => set({ dialogOpen: null, dialogParams: {} }),

  // History
  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    set({
      model: prev,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, JSON.parse(JSON.stringify(state.model))],
      statusMessage: 'Undo',
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      model: next,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, JSON.parse(JSON.stringify(state.model))],
      statusMessage: 'Redo',
    });
  },

  // Status
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
  setStatusMessage: (msg) => set({ statusMessage: msg }),
}));
