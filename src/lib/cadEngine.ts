// CAD Engine - Core parametric modeling operations
// Architecture inspired by Chili3D + OpenCASCADE

export type Vec3 = [number, number, number];

export interface SketchEntity {
  id: string;
  type: 'line' | 'arc' | 'circle' | 'spline' | 'ellipse' | 'bezier';
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
  params: Record<string, any>;
  visible: boolean;
  suppressed: boolean;
  children: string[];
  timestamp: number;
  color?: string;
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
  | 'pipe'
  | 'loft'
  | 'helix'
  | 'datum_plane'
  | 'cylinder'
  | 'sphere'
  | 'cone'
  | 'torus'
  | 'box'
  | 'pyramid'
  | 'ellipse_solid'
  | 'polygon_solid'
  | 'mirror'
  | 'move'
  | 'rotate'
  | 'array_linear'
  | 'array_circular'
  | 'thick_solid'
  | 'split'
  | 'section';

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

// Feature creation helpers - ALL support position offset
export function createBoxFeature(params: { width: number; height: number; depth: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'box',
    name: `Block_${params.width}x${params.height}x${params.depth}`,
    params: { width: params.width, height: params.height, depth: params.depth, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createCylinderFeature(params: { radius: number; height: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'cylinder',
    name: `Cylinder_R${params.radius}_H${params.height}`,
    params: { radius: params.radius, height: params.height, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createSphereFeature(params: { radius: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'sphere',
    name: `Sphere_R${params.radius}`,
    params: { radius: params.radius, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createConeFeature(params: { radius1: number; radius2: number; height: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'cone',
    name: `Cone_R${params.radius1}_R${params.radius2}_H${params.height}`,
    params: { radius1: params.radius1, radius2: params.radius2, height: params.height, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createTorusFeature(params: { majorRadius: number; minorRadius: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'torus',
    name: `Torus_R${params.majorRadius}_r${params.minorRadius}`,
    params: { majorRadius: params.majorRadius, minorRadius: params.minorRadius, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createPyramidFeature(params: { baseSize: number; height: number; sides: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'pyramid',
    name: `Pyramid_${params.sides}sides_H${params.height}`,
    params: { baseSize: params.baseSize, height: params.height, sides: params.sides, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createHelixFeature(params: { radius: number; pitch: number; turns: number; wireRadius?: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'helix',
    name: `Helix_R${params.radius}_P${params.pitch}_T${params.turns}`,
    params: { radius: params.radius, pitch: params.pitch, turns: params.turns, wireRadius: params.wireRadius || 1, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createExtrudeFeature(params: { distance: number; direction: Vec3; taper: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'extrude',
    name: `Extrude_${params.distance}mm`,
    params: { distance: params.distance, direction: params.direction, taper: params.taper, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createRevolveFeature(params: { axis: Vec3; angle: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'revolve',
    name: `Revolve_${params.angle}°`,
    params: { axis: params.axis, angle: params.angle, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createFilletFeature(params: { radius: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'fillet',
    name: `Fillet_R${params.radius}`,
    params: { radius: params.radius, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createChamferFeature(params: { distance: number; angle: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'chamfer',
    name: `Chamfer_${params.distance}x${params.angle}°`,
    params: { distance: params.distance, angle: params.angle, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createShellFeature(params: { thickness: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'shell',
    name: `Shell_t${params.thickness}`,
    params: { thickness: params.thickness, position: params.position || [0, 0, 0] },
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

export function createLinearPatternFeature(params: { direction: Vec3; count: number; spacing: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'pattern_linear',
    name: `LinearPattern_x${params.count}`,
    params: { direction: params.direction, count: params.count, spacing: params.spacing, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createCircularPatternFeature(params: { axis: Vec3; count: number; angle: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'pattern_circular',
    name: `CircularPattern_x${params.count}`,
    params: { axis: params.axis, count: params.count, angle: params.angle, position: params.position || [0, 0, 0] },
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

export function createSweepFeature(params: { position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'sweep',
    name: `Sweep`,
    params: { position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createPipeFeature(params: { outerRadius: number; innerRadius: number; height: number; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'pipe',
    name: `Pipe_OR${params.outerRadius}_IR${params.innerRadius}_H${params.height}`,
    params: { outerRadius: params.outerRadius, innerRadius: params.innerRadius, height: params.height, position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createLoftFeature(params: { position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'loft',
    name: `Loft`,
    params: { position: params.position || [0, 0, 0] },
    visible: true,
    suppressed: false,
    children: [],
    timestamp: Date.now(),
  };
}

export function createMirrorFeature(params: { plane: string; position?: Vec3 }): Feature {
  return {
    id: generateId(),
    type: 'mirror',
    name: `Mirror_${params.plane}`,
    params: { plane: params.plane, position: params.position || [0, 0, 0] },
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
