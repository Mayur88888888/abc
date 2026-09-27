import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCADStore } from '../store/cadStore';

interface RibbonTab {
  id: string;
  label: string;
  groups: RibbonGroup[];
}

interface RibbonGroup {
  name: string;
  commands: RibbonCommand[];
}

interface RibbonCommand {
  id: string;
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
  submenu?: RibbonCommand[];
}

const ribbonTabs: RibbonTab[] = [
  {
    id: 'home',
    label: 'Home',
    groups: [
      {
        name: 'Primitives',
        commands: [
          { id: 'box', label: 'Block', icon: '◻️', shortcut: 'B', action: () => {} },
          { id: 'cylinder', label: 'Cylinder', icon: '⬡', shortcut: 'C', action: () => {} },
          { id: 'sphere', label: 'Sphere', icon: '⬤', shortcut: 'S', action: () => {} },
          { id: 'cone', label: 'Cone', icon: '△', action: () => {} },
          { id: 'torus', label: 'Torus', icon: '◎', action: () => {} },
        ],
      },
      {
        name: 'Sketch',
        commands: [
          { id: 'sketch', label: 'Sketch', icon: '✏️', shortcut: 'SK', action: () => {} },
          { id: 'line', label: 'Line', icon: '╱', action: () => {} },
          { id: 'arc', label: 'Arc', icon: '⌒', action: () => {} },
          { id: 'circle', label: 'Circle', icon: '○', action: () => {} },
          { id: 'spline', label: 'Spline', icon: '∿', action: () => {} },
          { id: 'rectangle', label: 'Rectangle', icon: '▭', action: () => {} },
        ],
      },
      {
        name: 'Feature',
        commands: [
          { id: 'extrude', label: 'Extrude', icon: '⬆', shortcut: 'E', action: () => {} },
          { id: 'revolve', label: 'Revolve', icon: '🔄', action: () => {} },
          { id: 'sweep', label: 'Sweep', icon: '↗', action: () => {} },
          { id: 'loft', label: 'Loft', icon: '⤴', action: () => {} },
        ],
      },
    ],
  },
  {
    id: 'modeling',
    label: 'Modeling',
    groups: [
      {
        name: 'Boolean',
        commands: [
          { id: 'union', label: 'Unite', icon: '⊕', action: () => {} },
          { id: 'subtract', label: 'Subtract', icon: '⊖', action: () => {} },
          { id: 'intersect', label: 'Intersect', icon: '⊗', action: () => {} },
        ],
      },
      {
        name: 'Detail',
        commands: [
          { id: 'fillet', label: 'Fillet', icon: '⌢', shortcut: 'F', action: () => {} },
          { id: 'chamfer', label: 'Chamfer', icon: '⟋', action: () => {} },
          { id: 'shell', label: 'Shell', icon: '⊡', action: () => {} },
          { id: 'draft', label: 'Draft', icon: '⟁', action: () => {} },
          { id: 'offset', label: 'Offset', icon: '⊞', action: () => {} },
        ],
      },
      {
        name: 'Pattern',
        commands: [
          { id: 'linear_pattern', label: 'Linear', icon: '⋮', action: () => {} },
          { id: 'circular_pattern', label: 'Circular', icon: '⟳', action: () => {} },
          { id: 'mirror', label: 'Mirror', icon: '↔', action: () => {} },
        ],
      },
      {
        name: 'Hole',
        commands: [
          { id: 'hole', label: 'Hole', icon: '⊙', shortcut: 'H', action: () => {} },
          { id: 'thread', label: 'Thread', icon: '🔩', action: () => {} },
        ],
      },
    ],
  },
  {
    id: 'surface',
    label: 'Surface',
    groups: [
      {
        name: 'Create',
        commands: [
          { id: 'extrude_surf', label: 'Extrude', icon: '⬆', action: () => {} },
          { id: 'revolve_surf', label: 'Revolve', icon: '🔄', action: () => {} },
          { id: 'sweep_surf', label: 'Sweep', icon: '↗', action: () => {} },
          { id: 'n_surface', label: 'N-Sided', icon: '⬡', action: () => {} },
          { id: 'fillet_surf', label: 'Fillet', icon: '⌢', action: () => {} },
        ],
      },
      {
        name: 'Edit',
        commands: [
          { id: 'trim_surf', label: 'Trim', icon: '✂', action: () => {} },
          { id: 'extend_surf', label: 'Extend', icon: '↔', action: () => {} },
          { id: 'offset_surf', label: 'Offset', icon: '⊞', action: () => {} },
          { id: 'stitch', label: 'Stitch', icon: '🪡', action: () => {} },
        ],
      },
    ],
  },
  {
    id: 'datum',
    label: 'Datum/WCS',
    groups: [
      {
        name: 'Datum',
        commands: [
          { id: 'datum_plane', label: 'Plane', icon: '▦', action: () => {} },
          { id: 'datum_axis', label: 'Axis', icon: '┃', action: () => {} },
          { id: 'datum_point', label: 'Point', icon: '•', action: () => {} },
          { id: 'datum_csys', label: 'CSYS', icon: '⊹', action: () => {} },
        ],
      },
      {
        name: 'WCS',
        commands: [
          { id: 'wcs_origin', label: 'Origin', icon: '⊕', action: () => {} },
          { id: 'wcs_orient', label: 'Orient', icon: '🧭', action: () => {} },
        ],
      },
    ],
  },
  {
    id: 'view',
    label: 'View',
    groups: [
      {
        name: 'Visualize',
        commands: [
          { id: 'shaded', label: 'Shaded', icon: '🎨', action: () => {} },
          { id: 'wireframe', label: 'Wireframe', icon: '📐', action: () => {} },
          { id: 'shaded_edges', label: 'With Edges', icon: '🔲', action: () => {} },
          { id: 'hidden', label: 'Hidden Line', icon: '⬚', action: () => {} },
          { id: 'raytraced', label: 'Ray Traced', icon: '☀️', action: () => {} },
        ],
      },
      {
        name: 'Layout',
        commands: [
          { id: 'fit', label: 'Fit', icon: '⊡', shortcut: 'F8', action: () => {} },
          { id: 'top', label: 'Top', icon: '⬆', action: () => {} },
          { id: 'front', label: 'Front', icon: '⬛', action: () => {} },
          { id: 'right', label: 'Right', icon: '▶', action: () => {} },
          { id: 'iso', label: 'Isometric', icon: '◇', shortcut: 'F6', action: () => {} },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    groups: [
      {
        name: 'Inspect',
        commands: [
          { id: 'measure_dist', label: 'Distance', icon: '📏', action: () => {} },
          { id: 'measure_angle', label: 'Angle', icon: '📐', action: () => {} },
          { id: 'measure_area', label: 'Area', icon: '⬜', action: () => {} },
          { id: 'measure_vol', label: 'Volume', icon: '📦', action: () => {} },
        ],
      },
      {
        name: 'Expression',
        commands: [
          { id: 'expressions', label: 'Expressions', icon: 'fx', action: () => {} },
          { id: 'parameters', label: 'Parameters', icon: '⚙', action: () => {} },
        ],
      },
    ],
  },
];

export default function Ribbon() {
  const [activeTab, setActiveTab] = useState('home');
  const [hoveredCmd, setHoveredCmd] = useState<string | null>(null);
  const openDialog = useCADStore(s => s.openDialog);
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
  const setViewMode = useCADStore(s => s.setViewMode);
  const startSketch = useCADStore(s => s.startSketch);

  const handleCommand = (cmdId: string) => {
    switch (cmdId) {
      case 'box': openDialog('box'); break;
      case 'cylinder': openDialog('cylinder'); break;
      case 'sphere': openDialog('sphere'); break;
      case 'cone': openDialog('cone'); break;
      case 'torus': openDialog('torus'); break;
      case 'sketch': startSketch('XY'); break;
      case 'extrude': openDialog('extrude'); break;
      case 'revolve': openDialog('revolve'); break;
      case 'fillet': openDialog('fillet'); break;
      case 'chamfer': openDialog('chamfer'); break;
      case 'shell': openDialog('shell'); break;
      case 'hole': openDialog('hole'); break;
      case 'shaded': setViewMode('shaded'); break;
      case 'wireframe': setViewMode('wireframe'); break;
      case 'shaded_edges': setViewMode('shaded_with_edges'); break;
      case 'hidden': setViewMode('hidden_line'); break;
      case 'raytraced': setViewMode('raytraced'); break;
      default: openDialog(cmdId); break;
    }
  };

  const currentTab = ribbonTabs.find(t => t.id === activeTab);

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-white/5 select-none">
      {/* Tab bar */}
      <div className="flex items-center gap-0 px-2">
        {/* App menu button */}
        <button className="px-3 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-500/10 rounded-t transition-colors">
          ☰ MENU
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        {ribbonTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 text-xs font-medium rounded-t transition-all ${
              activeTab === tab.id
                ? 'bg-gray-800/80 text-white border-t border-x border-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Quick access on right */}
        <div className="ml-auto flex items-center gap-1">
          <button className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors" title="Undo (Ctrl+Z)">
            ↩
          </button>
          <button className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors" title="Redo (Ctrl+Y)">
            ↪
          </button>
          <div className="w-px h-4 bg-white/10 mx-1" />
          <button className="p-1.5 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors" title="Save">
            💾
          </button>
        </div>
      </div>

      {/* Ribbon content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="flex items-stretch gap-0 px-2 py-2 min-h-[80px]"
        >
          {currentTab?.groups.map((group, gi) => (
            <div key={group.name} className="flex items-start gap-0">
              <div className="flex flex-col items-center gap-1 px-2">
                <div className="flex gap-1">
                  {group.commands.map((cmd) => (
                    <div key={cmd.id} className="relative">
                      <button
                        onClick={() => handleCommand(cmd.id)}
                        onMouseEnter={() => setHoveredCmd(cmd.id)}
                        onMouseLeave={() => setHoveredCmd(null)}
                        className="flex flex-col items-center justify-center w-14 h-14 rounded-lg hover:bg-white/5 active:bg-white/10 transition-all group"
                        title={`${cmd.label}${cmd.shortcut ? ` (${cmd.shortcut})` : ''}`}
                      >
                        <span className="text-xl mb-0.5">{cmd.icon}</span>
                        <span className="text-[9px] text-gray-400 group-hover:text-white leading-tight text-center">
                          {cmd.label}
                        </span>
                      </button>
                      {/* Tooltip */}
                      {hoveredCmd === cmd.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 border border-white/10 rounded text-xs text-white whitespace-nowrap z-50 pointer-events-none">
                          {cmd.label}
                          {cmd.shortcut && (
                            <span className="ml-2 text-gray-500">({cmd.shortcut})</span>
                          )}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 border-r border-b border-white/10 rotate-45 -mt-1" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {gi < (currentTab?.groups.length || 0) - 1 && (
                <div className="w-px h-16 bg-white/5 self-center mx-1" />
              )}
            </div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
