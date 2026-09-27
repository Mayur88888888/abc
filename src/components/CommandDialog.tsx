import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCADStore } from '../store/cadStore';

interface DialogConfig {
  title: string;
  icon: string;
  fields: FieldConfig[];
  onSubmit: (params: Record<string, number>) => void;
}

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

const dialogConfigs: Record<string, DialogConfig> = {
  box: {
    title: 'Block (Pad)',
    icon: '◻️',
    fields: [
      { name: 'width', label: 'Length (X)', type: 'number', default: 50, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height (Y)', type: 'number', default: 30, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'depth', label: 'Width (Z)', type: 'number', default: 40, min: 0.1, step: 0.1, unit: 'mm' },
    ],
    onSubmit: (p) => {},
  },
  cylinder: {
    title: 'Cylinder',
    icon: '⬡',
    fields: [
      { name: 'radius', label: 'Radius', type: 'number', default: 20, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height', type: 'number', default: 50, min: 0.1, step: 0.1, unit: 'mm' },
    ],
    onSubmit: (p) => {},
  },
  sphere: {
    title: 'Sphere',
    icon: '⬤',
    fields: [
      { name: 'radius', label: 'Radius', type: 'number', default: 25, min: 0.1, step: 0.1, unit: 'mm' },
    ],
    onSubmit: (p) => {},
  },
  cone: {
    title: 'Cone',
    icon: '△',
    fields: [
      { name: 'radius1', label: 'Base Radius', type: 'number', default: 25, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'radius2', label: 'Top Radius', type: 'number', default: 10, min: 0, step: 0.1, unit: 'mm' },
      { name: 'height', label: 'Height', type: 'number', default: 50, min: 0.1, step: 0.1, unit: 'mm' },
    ],
    onSubmit: (p) => {},
  },
  torus: {
    title: 'Torus',
    icon: '◎',
    fields: [
      { name: 'majorRadius', label: 'Major Radius', type: 'number', default: 30, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'minorRadius', label: 'Minor Radius', type: 'number', default: 10, min: 0.1, step: 0.1, unit: 'mm' },
    ],
    onSubmit: (p) => {},
  },
  extrude: {
    title: 'Extrude',
    icon: '⬆',
    fields: [
      { name: 'distance', label: 'Distance', type: 'number', default: 30, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'taper', label: 'Taper Angle', type: 'number', default: 0, min: -45, max: 45, step: 0.5, unit: '°' },
    ],
    onSubmit: (p) => {},
  },
  revolve: {
    title: 'Revolve',
    icon: '🔄',
    fields: [
      { name: 'angle', label: 'Angle', type: 'number', default: 360, min: 0.1, max: 360, step: 1, unit: '°' },
    ],
    onSubmit: (p) => {},
  },
  fillet: {
    title: 'Edge Fillet',
    icon: '⌢',
    fields: [
      { name: 'radius', label: 'Radius', type: 'number', default: 3, min: 0.01, step: 0.1, unit: 'mm' },
    ],
    onSubmit: (p) => {},
  },
  chamfer: {
    title: 'Chamfer',
    icon: '⟋',
    fields: [
      { name: 'distance', label: 'Distance', type: 'number', default: 2, min: 0.01, step: 0.1, unit: 'mm' },
      { name: 'angle', label: 'Angle', type: 'number', default: 45, min: 1, max: 89, step: 1, unit: '°' },
    ],
    onSubmit: (p) => {},
  },
  shell: {
    title: 'Shell',
    icon: '⊡',
    fields: [
      { name: 'thickness', label: 'Wall Thickness', type: 'number', default: 2, min: 0.1, step: 0.1, unit: 'mm' },
    ],
    onSubmit: (p) => {},
  },
  hole: {
    title: 'Hole',
    icon: '⊙',
    fields: [
      { name: 'diameter', label: 'Diameter', type: 'number', default: 10, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'depth', label: 'Depth', type: 'number', default: 20, min: 0.1, step: 0.1, unit: 'mm' },
      { name: 'type', label: 'Hole Type', type: 'select', default: 'simple', options: [
        { value: 'simple', label: 'Simple' },
        { value: 'countersunk', label: 'Countersunk' },
        { value: 'counterbore', label: 'Counterbore' },
      ]},
    ],
    onSubmit: (p) => {},
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
  const addExtrude = useCADStore(s => s.addExtrude);
  const addRevolve = useCADStore(s => s.addRevolve);
  const addFillet = useCADStore(s => s.addFillet);
  const addChamfer = useCADStore(s => s.addChamfer);
  const addShell = useCADStore(s => s.addShell);
  const addHole = useCADStore(s => s.addHole);

  const config = dialogOpen ? dialogConfigs[dialogOpen] : null;
  const [values, setValues] = useState<Record<string, number | string>>({});

  if (!config) return null;

  // Initialize values
  const getValues = () => {
    const v: Record<string, number | string> = {};
    config.fields.forEach(f => {
      v[f.name] = values[f.name] !== undefined ? values[f.name] : f.default;
    });
    return v;
  };

  const handleSubmit = () => {
    const v = getValues();
    switch (dialogOpen) {
      case 'box':
        addBox(v.width as number, v.height as number, v.depth as number);
        break;
      case 'cylinder':
        addCylinder(v.radius as number, v.height as number);
        break;
      case 'sphere':
        addSphere(v.radius as number);
        break;
      case 'cone':
        addCone(v.radius1 as number, v.radius2 as number, v.height as number);
        break;
      case 'torus':
        addTorus(v.majorRadius as number, v.minorRadius as number);
        break;
      case 'extrude':
        addExtrude('sketch_1', v.distance as number, [0, 1, 0], v.taper as number);
        break;
      case 'revolve':
        addRevolve('sketch_1', [0, 1, 0], v.angle as number);
        break;
      case 'fillet':
        addFillet(['edge_1'], v.radius as number);
        break;
      case 'chamfer':
        addChamfer(['edge_1'], v.distance as number, v.angle as number);
        break;
      case 'shell':
        addShell(v.thickness as number, ['face_top']);
        break;
      case 'hole':
        addHole([0, 0, 0], v.diameter as number, v.depth as number, v.type as string);
        break;
    }
    setValues({});
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
                      value={values[field.name] !== undefined ? values[field.name] : field.default}
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
                    value={values[field.name] !== undefined ? values[field.name] : field.default}
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
