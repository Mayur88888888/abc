// CAD Engine - Core parametric modeling operations
// This architecture mirrors real CAD kernels like OpenCASCADE/Parasolid

export type Vec3 = [number, number, number];

export interface SketchEntity {
  id: string;
  type: 'line' | 'arc' | 'circle' | 'spline';
  points: Vec3[];
  constraints: Constraint[];
  plane: 'XY' | 'XZ' | 'YZ';
}

export interface Constraint {
  type: 'coincident' | 'perpendicular' | 'parallel' | 'tangent' | 'dimension';
  entities: string[];
  value?: number;
}

export interface Feature {
  id: string;
  type: FeatureType;
  name: string;
  params: Record<string, number | Vec3 | string | string[] | number[]>;
  sketch?: SketchEntity[];
  visible: boolean;
  suppressed: boolean;
  children: string[];
  timestamp: number;
}

export type FeatureType =
  | 'sketch'
  | 'extrude'
  | 'revolve'
  | 'fillet'
  | 'chamfer'
  | 'shell'
  | 'hole'
  | 'pattern_linear'
  | 'pattern_circular'
  | 'boolean_union'
  | 'boolean_subtract'
  | 'boolean_intersect'
  | 'offset'
  | 'draft'
  | 'sweep'
  | 'loft'
  | 'datum_plane'
  | 'cylinder'
  | 'sphere'
  | 'cone'
  | 'torus'
  | 'box';

export interface CADModel {
  name: string;
  units: 'mm' | 'inch' | 'm';
  features: Feature[];
  activeSketch: string | null;
  selectedEntities: string[];
  workPlane: 'XY' | 'XZ' | 'YZ';
}

// Command Pattern - the backbone of CAD software
export interface CADCommand {
  id: string;
  name: string;
  category: string;
  icon: string;
  shortcut?: string;
  description: string;
  execute: (context: CommandContext) => void;
  validate?: (context: CommandContext) => boolean;
  requiresSelection?: boolean;
  parameters?: CommandParameter[];
}

export interface CommandParameter {
  name: string;
  type: 'number' | 'string' | 'vec3' | 'selection' | 'enum';
  label: string;
  default?: any;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
}

export interface CommandContext {
  model: CADModel;
  selection: string[];
  viewport: { camera: Vec3; target: Vec3 };
}

// Generate unique IDs
let idCounter = 0;
export function generateId(): string {
  return `feat_${Date.now()}_${idCounter++}`;
}

// Feature creation helpers
export function createBoxFeature(params: { width: number; height: number; depth: number }): Feature {
  return {
    id: generateId(),
    type: 'box',
    name: `Block_${params.width}x${params.height}x${params.depth}`,
    params: { width: params.width, height: params.height, depth: params.depth },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createCylinderFeature(params: { radius: number; height: number }): Feature {
  return {
    id: generateId(),
    type: 'cylinder',
    name: `Cylinder_R${params.radius}_H${params.height}`,
    params: { radius: params.radius, height: params.height },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createSphereFeature(params: { radius: number }): Feature {
  return {
    id: generateId(),
    type: 'sphere',
    name: `Sphere_R${params.radius}`,
    params: { radius: params.radius },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createConeFeature(params: { radius1: number; radius2: number; height: number }): Feature {
  return {
    id: generateId(),
    type: 'cone',
    name: `Cone_R${params.radius1}_R${params.radius2}_H${params.height}`,
    params: { radius1: params.radius1, radius2: params.radius2, height: params.height },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createTorusFeature(params: { majorRadius: number; minorRadius: number }): Feature {
  return {
    id: generateId(),
    type: 'torus',
    name: `Torus_R${params.majorRadius}_r${params.minorRadius}`,
    params: { majorRadius: params.majorRadius, minorRadius: params.minorRadius },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createExtrudeFeature(params: { profile: string; distance: number; direction: Vec3; taper: number }): Feature {
  return {
    id: generateId(),
    type: 'extrude',
    name: `Extrude_${params.distance}mm`,
    params: { profile: params.profile, distance: params.distance, direction: params.direction, taper: params.taper },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createRevolveFeature(params: { profile: string; axis: Vec3; angle: number }): Feature {
  return {
    id: generateId(),
    type: 'revolve',
    name: `Revolve_${params.angle}°`,
    params: { profile: params.profile, axis: params.axis, angle: params.angle },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createFilletFeature(params: { edges: string[]; radius: number }): Feature {
  return {
    id: generateId(),
    type: 'fillet',
    name: `Fillet_R${params.radius}`,
    params: { edges: params.edges, radius: params.radius },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createChamferFeature(params: { edges: string[]; distance: number; angle: number }): Feature {
  return {
    id: generateId(),
    type: 'chamfer',
    name: `Chamfer_${params.distance}x${params.angle}°`,
    params: { edges: params.edges, distance: params.distance, angle: params.angle },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createShellFeature(params: { thickness: number; openFaces: string[] }): Feature {
  return {
    id: generateId(),
    type: 'shell',
    name: `Shell_t${params.thickness}`,
    params: { thickness: params.thickness, openFaces: params.openFaces },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createLinearPatternFeature(params: { feature: string; direction: Vec3; count: number; spacing: number }): Feature {
  return {
    id: generateId(),
    type: 'pattern_linear',
    name: `LinearPattern_x${params.count}`,
    params: { feature: params.feature, direction: params.direction, count: params.count, spacing: params.spacing },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createCircularPatternFeature(params: { feature: string; axis: Vec3; count: number; angle: number }): Feature {
  return {
    id: generateId(),
    type: 'pattern_circular',
    name: `CircularPattern_x${params.count}`,
    params: { feature: params.feature, axis: params.axis, count: params.count, angle: params.angle },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createHoleFeature(params: { position: Vec3; diameter: number; depth: number; type: string }): Feature {
  return {
    id: generateId(),
    type: 'hole',
    name: `Hole_D${params.diameter}_D${params.depth}`,
    params: { position: params.position, diameter: params.diameter, depth: params.depth, type: params.type },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createDatumPlaneFeature(params: { offset: number; reference: string }): Feature {
  return {
    id: generateId(),
    type: 'datum_plane',
    name: `DatumPlane_${params.offset}mm`,
    params: { offset: params.offset, reference: params.reference },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createSweepFeature(params: { profile: string; path: string }): Feature {
  return {
    id: generateId(),
    type: 'sweep',
    name: `Sweep`,
    params: { profile: params.profile, path: params.path },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createLoftFeature(params: { profiles: string[] }): Feature {
  return {
    id: generateId(),
    type: 'loft',
    name: `Loft`,
    params: { profiles: params.profiles },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

// Command Registry - extensible command system
export class CommandRegistry {
  private commands: Map<string, CADCommand> = new Map();

  register(command: CADCommand) {
    this.commands.set(command.id, command);
  }

  get(id: string): CADCommand | undefined {
    return this.commands.get(id);
  }

  getAll(): CADCommand[] {
    return Array.from(this.commands.values());
  }

  getByCategory(category: string): CADCommand[] {
    return this.getAll().filter(cmd => cmd.category === category);
  }

  execute(id: string, context: CommandContext): boolean {
    const cmd = this.get(id);
    if (!cmd) return false;
    if (cmd.validate && !cmd.validate(context)) return false;
    cmd.execute(context);
    return true;
  }

  findByShortcut(key: string): CADCommand | undefined {
    return this.getAll().find(cmd => cmd.shortcut === key);
  }
}

export const commandRegistry = new CommandRegistry();
