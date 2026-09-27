import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCADStore } from '../store/cadStore';

interface FieldConfig {
  name: string;
  label: string;
  type: 'number' | 'select';
  default: number | string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: { value: string; label: string }[];
}

interface DialogConfig {
  title: string;
  icon: string;
  fields: FieldConfig[];
}

const dialogConfigs: Record<string, DialogConfig> = {
  box: {
    title: 'Block (Pad)',
    icon: '◻️',
    fields: [
      { name: 'width', label: 'Length (X)', type: 'number', default: 50, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height (Y)', type: 'number', default: 30, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'depth', label: 'Width (Z)', type: 'number', default: 40, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  cylinder: {
    title: 'Cylinder',
    icon: '⬡',
    fields: [
      { name: 'radius', label: 'Radius', type: 'number', default: 20, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height', type: 'number', default: 50, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  sphere: {
    title: 'Sphere',
    icon: '⬤',
    fields: [
      { name: 'radius', label: 'Radius', type: 'number', default: 25, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  cone: {
    title: 'Cone',
    icon: '△',
    fields: [
      { name: 'radius1', label: 'Base Radius', type: 'number', default: 25, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'radius2', label: 'Top Radius', type: 'number', default: 10, min: 0, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height', type: 'number', default: 50, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  torus: {
    title: 'Torus',
    icon: '◎',
    fields: [
      { name: 'majorRadius', label: 'Major Radius', type: 'number', default: 30, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'minorRadius', label: 'Minor Radius', type: 'number', default: 10, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  pyramid: {
    title: 'Pyramid',
    icon: '🔺',
    fields: [
      { name: 'baseSize', label: 'Base Size', type: 'number', default: 30, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height', type: 'number', default: 40, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'sides', label: 'Number of Sides', type: 'number', default: 4, min: 3, max: 12, step: 1 },
    ],
  },
  helix: {
    title: 'Helix',
    icon: '🌀',
    fields: [
      { name: 'radius', label: 'Radius', type: 'number', default: 20, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'pitch', label: 'Pitch', type: 'number', default: 10, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'turns', label: 'Number of Turns', type: 'number', default: 5, min: 0.1, step: 0.5 },
      { name: 'wireRadius', label: 'Wire Radius', type: 'number', default: 2, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  extrude: {
    title: 'Extrude',
    icon: '⬆',
    fields: [
      { name: 'distance', label: 'Distance', type: 'number', default: 30, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'taper', label: 'Taper Angle', type: 'number', default: 0, min: -45, max: 45, step: 0.5, unit: '°' },
    ],
  },
  revolve: {
    title: 'Revolve',
    icon: '🔄',
    fields: [
      { name: 'angle', label: 'Angle', type: 'number', default: 360, min: 0.1, max: 360, step: 1, unit: '°' },
    ],
  },
  fillet: {
    title: 'Edge Fillet',
    icon: '⌢',
    fields: [
      { name: 'radius', label: 'Radius', type: 'number', default: 3, min: 0.01, step: 0.1, unit: 'mm' },
    ],
  },
  chamfer: {
    title: 'Chamfer',
    icon: '⟋',
    fields: [
      { name: 'distance', label: 'Distance', type: 'number', default: 2, min: 0.01, step: 0.1, unit: 'mm' },
      { name: 'angle', label: 'Angle', type: 'number', default: 45, min: 1, max: 89, step: 1, unit: '°' },
    ],
  },
  shell: {
    title: 'Shell',
    icon: '⊡',
    fields: [
      { name: 'thickness', label: 'Wall Thickness', type: 'number', default: 2, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  hole: {
    title: 'Hole',
    icon: '⊙',
    fields: [
      { name: 'diameter', label: 'Diameter', type: 'number', default: 10, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'depth', label: 'Depth', type: 'number', default: 20, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'holeType', label: 'Hole Type', type: 'select', default: 'simple', options: [
        { value: 'simple', label: 'Simple' },
        { value: 'countersunk', label: 'Countersunk' },
        { value: 'counterbore', label: 'Counterbore' },
      ]},
    ],
  },
  pipe: {
    title: 'Pipe',
    icon: '🔧',
    fields: [
      { name: 'outerRadius', label: 'Outer Radius', type: 'number', default: 15, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'innerRadius', label: 'Inner Radius', type: 'number', default: 10, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height', type: 'number', default: 60, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  mirror: {
    title: 'Mirror',
    icon: '↔',
    fields: [
      { name: 'plane', label: 'Mirror Plane', type: 'select', default: 'XY', options: [
        { value: 'XY', label: 'XY Plane' },
        { value: 'XZ', label: 'XZ Plane' },
        { value: 'YZ', label: 'YZ Plane' },
      ]},
    ],
  },
  linear_pattern: {
    title: 'Linear Pattern',
    icon: '⋮',
    fields: [
      { name: 'count', label: 'Count', type: 'number', default: 5, min: 2, max: 100, step: 1 },
      { name: 'spacing', label: 'Spacing', type: 'number', default: 20, min: 0.1, step: 0.1, unit: 'mm' },
    ],
  },
  circular_pattern: {
    title: 'Circular Pattern',
    icon: '⟳',
    fields: [
      { name: 'count', label: 'Count', type: 'number', default: 6, min: 2, max: 100, step: 1 },
      { name: 'angle', label: 'Total Angle', type: 'number', default: 360, min: 1, max: 360, step: 1, unit: '°' },
    ],
  },
};

export default function CommandDialog() {
  const dialogOpen = useCADStore(s => s.dialogOpen);
  const closeDialog = useCADStore(s => s.closeDialog);
  const addBox = useCADStore(s => s.addBox);
  const addCylinder = useCADStore(s => s.addCylinder);
  const addSphere = useCADStore(s => s.addSphere);
  const addCone = useCADStore(s => s.addCone);
  const addTorus = useCADStore(s => s.addTorus);
  const addPyramid = useCADStore(s => s.addPyramid);
  const addHelix = useCADStore(s => s.addHelix);
  const addExtrude = useCADStore(s => s.addExtrude);
  const addRevolve = useCADStore(s => s.addRevolve);
  const addFillet = useCADStore(s => s.addFillet);
  const addChamfer = useCADStore(s => s.addChamfer);
  const addShell = useCADStore(s => s.addShell);
  const addHole = useCADStore(s => s.addHole);
  const addPipe = useCADStore(s => s.addPipe);
  const addMirror = useCADStore(s => s.addMirror);
  const addLinearPattern = useCADStore(s => s.addLinearPattern);
  const addCircularPattern = useCADStore(s => s.addCircularPattern);

  const config = dialogOpen ? dialogConfigs[dialogOpen] : null;
  const [values, setValues] = useState<Record<string, number | string>>({});

  // Reset values when dialog changes
  useEffect(() => {
    if (config) {
      const initial: Record<string, number | string> = {};
      config.fields.forEach(f => {
        initial[f.name] = f.default;
      });
      setValues(initial);
    }
  }, [dialogOpen]);

  if (!config) return null;

  const getValue = (name: string): number | string => {
    return values[name] !== undefined ? values[name] : config.fields.find(f => f.name === name)?.default ?? 0;
  };

  const getNum = (name: string): number => {
    const v = getValue(name);
    return typeof v === 'number' ? v : parseFloat(v as string) || 0;
  };

  const handleSubmit = () => {
    // Generate random position offset to avoid overlapping
    const offsetX = (Math.random() - 0.5) * 100;
    const offsetY = 0;
    const offsetZ = (Math.random() - 0.5) * 100;
    const position: [number, number, number] = [offsetX, offsetY, offsetZ];

    switch (dialogOpen) {
      case 'box':
        addBox(getNum('width'), getNum('height'), getNum('depth'), position);
        break;
      case 'cylinder':
        addCylinder(getNum('radius'), getNum('height'), position);
        break;
      case 'sphere':
        addSphere(getNum('radius'), position);
        break;
      case 'cone':
        addCone(getNum('radius1'), getNum('radius2'), getNum('height'), position);
        break;
      case 'torus':
        addTorus(getNum('majorRadius'), getNum('minorRadius'), position);
        break;
      case 'pyramid':
        addPyramid(getNum('baseSize'), getNum('height'), getNum('sides'), position);
        break;
      case 'helix':
        addHelix(getNum('radius'), getNum('pitch'), getNum('turns'), getNum('wireRadius'), position);
        break;
      case 'extrude':
        addExtrude(getNum('distance'), [0, 1, 0], getNum('taper'), position);
        break;
      case 'revolve':
        addRevolve([0, 1, 0], getNum('angle'), position);
        break;
      case 'fillet':
        addFillet(getNum('radius'), position);
        break;
      case 'chamfer':
        addChamfer(getNum('distance'), getNum('angle'), position);
        break;
      case 'shell':
        addShell(getNum('thickness'), position);
        break;
      case 'hole':
        addHole(position, getNum('diameter'), getNum('depth'), getValue('holeType') as string);
        break;
      case 'pipe':
        addPipe(getNum('outerRadius'), getNum('innerRadius'), getNum('height'), position);
        break;
      case 'mirror':
        addMirror(getValue('plane') as string, position);
        break;
      case 'linear_pattern':
        addLinearPattern([1, 0, 0], getNum('count'), getNum('spacing'), position);
        break;
      case 'circular_pattern':
        addCircularPattern([0, 1, 0], getNum('count'), getNum('angle'), position);
        break;
    }
    closeDialog();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={closeDialog}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-cyan-500/10">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h3 className="text-white font-semibold">{config.title}</h3>
              <p className="text-xs text-gray-500">Enter parameters below</p>
            </div>
            <button
              onClick={closeDialog}
              className="ml-auto text-gray-500 hover:text-white p-1 rounded hover:bg-white/5"
            >
              ✕
            </button>
          </div>

          {/* Fields */}
          <div className="px-6 py-4 space-y-4">
            {config.fields.map((field) => (
              <div key={field.name}>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">
                  {field.label}
                  {field.unit && <span className="text-gray-600 ml-1">({field.unit})</span>}
                </label>
                {field.type === 'number' ? (
                  <div className="relative">
                    <input
                      type="number"
                      value={getValue(field.name)}
                      onChange={(e) => setValues({ ...values, [field.name]: parseFloat(e.target.value) || 0 })}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.05] transition-all"
                    />
                    {field.unit && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600">
                        {field.unit}
                      </span>
                    )}
                  </div>
                ) : (
                  <select
                    value={getValue(field.name)}
                    onChange={(e) => setValues({ ...values, [field.name]: e.target.value })}
                    className="w-full px-3 py-2 bg-white/[0.03] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-purple-500/50 appearance-none"
                  >
                    {field.options?.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-gray-900">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/5 bg-white/[0.02]">
            <button
              onClick={closeDialog}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-cyan-600 rounded-lg shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 transition-shadow"
            >
              Create ✓
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
