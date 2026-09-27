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
}

const ribbonTabs: RibbonTab[] = [
  {
    id: 'home',
    label: 'Home',
    groups: [
      {
        name: 'Primitives',
        commands: [
          { id: 'box', label: 'Block', icon: '◻️', shortcut: 'B' },
          { id: 'cylinder', label: 'Cylinder', icon: '⬡', shortcut: 'C' },
          { id: 'sphere', label: 'Sphere', icon: '⬤' },
          { id: 'cone', label: 'Cone', icon: '△' },
          { id: 'torus', label: 'Torus', icon: '◎' },
          { id: 'pyramid', label: 'Pyramid', icon: '🔺' },
        ],
      },
      {
        name: 'Sketch',
        commands: [
          { id: 'sketch', label: 'Sketch', icon: '✏️' },
          { id: 'line', label: 'Line', icon: '╱' },
          { id: 'arc', label: 'Arc', icon: '⌒' },
          { id: 'circle', label: 'Circle', icon: '○' },
          { id: 'spline', label: 'Spline', icon: '∿' },
          { id: 'rectangle', label: 'Rectangle', icon: '▭' },
          { id: 'ellipse', label: 'Ellipse', icon: '⬯' },
          { id: 'polygon', label: 'Polygon', icon: '⬠' },
        ],
      },
      {
        name: 'Feature',
        commands: [
          { id: 'extrude', label: 'Extrude', icon: '⬆', shortcut: 'E' },
          { id: 'revolve', label: 'Revolve', icon: '🔄' },
          { id: 'sweep', label: 'Sweep', icon: '↗' },
          { id: 'loft', label: 'Loft', icon: '⤴' },
          { id: 'pipe', label: 'Pipe', icon: '🔧' },
          { id: 'helix', label: 'Helix', icon: '🌀' },
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
          { id: 'union', label: 'Unite', icon: '⊕' },
          { id: 'subtract', label: 'Subtract', icon: '⊖' },
          { id: 'intersect', label: 'Intersect', icon: '⊗' },
        ],
      },
      {
        name: 'Detail',
        commands: [
          { id: 'fillet', label: 'Fillet', icon: '⌢', shortcut: 'F' },
          { id: 'chamfer', label: 'Chamfer', icon: '⟋' },
          { id: 'shell', label: 'Shell', icon: '⊡' },
          { id: 'draft', label: 'Draft', icon: '⟁' },
          { id: 'offset', label: 'Offset', icon: '⊞' },
        ],
      },
      {
        name: 'Pattern',
        commands: [
          { id: 'linear_pattern', label: 'Linear', icon: '⋮' },
          { id: 'circular_pattern', label: 'Circular', icon: '⟳' },
          { id: 'mirror', label: 'Mirror', icon: '↔' },
        ],
      },
      {
        name: 'Hole',
        commands: [
          { id: 'hole', label: 'Hole', icon: '⊙', shortcut: 'H' },
          { id: 'thread', label: 'Thread', icon: '🔩' },
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
          { id: 'extrude_surf', label: 'Extrude', icon: '⬆' },
          { id: 'revolve_surf', label: 'Revolve', icon: '🔄' },
          { id: 'sweep_surf', label: 'Sweep', icon: '↗' },
          { id: 'n_surface', label: 'N-Sided', icon: '⬡' },
          { id: 'fillet_surf', label: 'Fillet', icon: '⌢' },
        ],
      },
      {
        name: 'Edit',
        commands: [
          { id: 'trim_surf', label: 'Trim', icon: '✂' },
          { id: 'extend_surf', label: 'Extend', icon: '↔' },
          { id: 'offset_surf', label: 'Offset', icon: '⊞' },
          { id: 'sew', label: 'Sew', icon: '🪡' },
          { id: 'split', label: 'Split', icon: '⫿' },
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
          { id: 'datum_plane', label: 'Plane', icon: '▦' },
          { id: 'datum_axis', label: 'Axis', icon: '┃' },
          { id: 'datum_point', label: 'Point', icon: '•' },
          { id: 'datum_csys', label: 'CSYS', icon: '⊹' },
        ],
      },
      {
        name: 'WCS',
        commands: [
          { id: 'wcs_origin', label: 'Origin', icon: '⊕' },
          { id: 'wcs_orient', label: 'Orient', icon: '🧭' },
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
          { id: 'shaded', label: 'Shaded', icon: '🎨' },
          { id: 'wireframe', label: 'Wireframe', icon: '📐' },
          { id: 'shaded_edges', label: 'With Edges', icon: '🔲' },
          { id: 'hidden', label: 'Hidden Line', icon: '⬚' },
          { id: 'raytraced', label: 'Ray Traced', icon: '☀️' },
        ],
      },
      {
        name: 'Layout',
        commands: [
          { id: 'fit', label: 'Fit', icon: '⊡', shortcut: 'F8' },
          { id: 'top', label: 'Top', icon: '⬆' },
          { id: 'front', label: 'Front', icon: '⬛' },
          { id: 'right', label: 'Right', icon: '▶' },
          { id: 'iso', label: 'Isometric', icon: '◇', shortcut: 'F6' },
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
          { id: 'measure_dist', label: 'Distance', icon: '📏' },
          { id: 'measure_angle', label: 'Angle', icon: '📐' },
          { id: 'measure_area', label: 'Area', icon: '⬜' },
          { id: 'measure_vol', label: 'Volume', icon: '📦' },
        ],
      },
      {
        name: 'Expression',
        commands: [
          { id: 'expressions', label: 'Expressions', icon: 'fx' },
          { id: 'parameters', label: 'Parameters', icon: '⚙' },
        ],
      },
      {
        name: 'Modify',
        commands: [
          { id: 'move', label: 'Move', icon: '✥' },
          { id: 'rotate_mod', label: 'Rotate', icon: '🔃' },
          { id: 'simplify', label: 'Simplify', icon: '◽' },
          { id: 'repair', label: 'Repair', icon: '🔧' },
        ],
      },
    ],
  },
];

export default function Ribbon() {
  const [activeTab, setActiveTab] = useState('home');
  const [hoveredCmd, setHoveredCmd] = useState<string | null>(null);
  const openDialog = useCADStore(s => s.openDialog);
  const setViewMode = useCADStore(s => s.setViewMode);
  const startSketch = useCADStore(s => s.startSketch);
  const undo = useCADStore(s => s.undo);
  const redo = useCADStore(s => s.redo);

  const handleCommand = (cmdId: string) => {
    // Commands that open dialogs (ONLY these have dialog configs)
    const dialogCommands = [
      'box', 'cylinder', 'sphere', 'cone', 'torus', 'pyramid', 'helix',
      'extrude', 'revolve', 'fillet', 'chamfer', 'shell', 'hole', 'pipe',
      'mirror', 'linear_pattern', 'circular_pattern',
    ];
    
    if (dialogCommands.includes(cmdId)) {
      openDialog(cmdId);
      return;
    }
    
    // View mode commands
    const viewModeMap: Record<string, any> = {
      'shaded': 'shaded',
      'wireframe': 'wireframe',
      'shaded_edges': 'shaded_with_edges',
      'hidden': 'hidden_line',
      'raytraced': 'raytraced',
    };
    if (viewModeMap[cmdId]) {
      setViewMode(viewModeMap[cmdId]);
      return;
    }
    
    // Sketch command
    if (cmdId === 'sketch') {
      startSketch('XY');
      return;
    }
    
    // Camera/view commands (for now, show feedback)
    const cameraCommands = ['fit', 'top', 'front', 'right', 'iso'];
    if (cameraCommands.includes(cmdId)) {
      // TODO: Implement camera presets
      console.log(`Camera command: ${cmdId}`);
      return;
    }
    
    // Boolean operations (require selection)
    const booleanCommands = ['union', 'subtract', 'intersect'];
    if (booleanCommands.includes(cmdId)) {
      // TODO: Implement boolean operations
      console.log(`Boolean operation: ${cmdId}`);
      return;
    }
    
    // Detail operations
    const detailCommands = ['draft', 'offset', 'thread'];
    if (detailCommands.includes(cmdId)) {
      // TODO: Implement detail operations
      console.log(`Detail operation: ${cmdId}`);
      return;
    }
    
    // Measurement tools
    const measureCommands = ['measure_dist', 'measure_angle', 'measure_area', 'measure_vol'];
    if (measureCommands.includes(cmdId)) {
      // TODO: Implement measurement tools
      console.log(`Measurement: ${cmdId}`);
      return;
    }
    
    // Expression/parameter tools
    const toolCommands = ['expressions', 'parameters'];
    if (toolCommands.includes(cmdId)) {
      // TODO: Implement expression editor
      console.log(`Tool: ${cmdId}`);
      return;
    }
    
    // Modify operations
    const modifyCommands = ['move', 'rotate_mod', 'simplify', 'repair'];
    if (modifyCommands.includes(cmdId)) {
      // TODO: Implement modify operations
      console.log(`Modify: ${cmdId}`);
      return;
    }
    
    // Sketch tools (2D drawing)
    const sketchTools = ['line', 'arc', 'circle', 'spline', 'rectangle', 'ellipse', 'polygon'];
    if (sketchTools.includes(cmdId)) {
      // TODO: Implement sketch tools
      console.log(`Sketch tool: ${cmdId}`);
      return;
    }
    
    // Datum/WCS
    const datumCommands = ['datum_plane', 'datum_axis', 'datum_point', 'datum_csys', 'wcs_origin', 'wcs_orient'];
    if (datumCommands.includes(cmdId)) {
      // TODO: Implement datum creation
      console.log(`Datum: ${cmdId}`);
      return;
    }
    
    // Surface operations
    const surfaceCommands = ['extrude_surf', 'revolve_surf', 'sweep_surf', 'n_surface', 'fillet_surf', 'trim_surf', 'extend_surf', 'offset_surf', 'sew', 'split'];
    if (surfaceCommands.includes(cmdId)) {
      // TODO: Implement surface operations
      console.log(`Surface: ${cmdId}`);
      return;
    }
    
    // Unknown command - log for debugging
    console.warn(`Unknown command: ${cmdId}`);
  };

  const currentTab = ribbonTabs.find(t => t.id === activeTab);

  return (
    <div className="bg-gray-900/95 backdrop-blur-sm border-b border-white/5 select-none">
      {/* Tab bar - COMPACT */}
      <div className="flex items-center gap-0 px-2 h-8">
        <button className="px-2 py-1 text-[10px] font-bold text-purple-400 hover:bg-purple-500/10 rounded transition-colors">
          ☰
        </button>
        <div className="w-px h-3 bg-white/10 mx-1" />
        {ribbonTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-[11px] font-medium rounded-t transition-all ${
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
          <button onClick={undo} className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors text-xs" title="Undo (Ctrl+Z)">
            ↩
          </button>
          <button onClick={redo} className="p-1 text-gray-500 hover:text-white hover:bg-white/5 rounded transition-colors text-xs" title="Redo (Ctrl+Y)">
            ↪
          </button>
        </div>
      </div>

      {/* Ribbon content - COMPACT */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }}
          className="flex items-stretch gap-0 px-2 py-1 min-h-[60px]"
        >
          {currentTab?.groups.map((group, gi) => (
            <div key={group.name} className="flex items-start gap-0">
              <div className="flex flex-col items-center gap-0.5 px-1">
                <div className="flex gap-0.5">
                  {group.commands.map((cmd) => (
                    <div key={cmd.id} className="relative">
                      <button
                        onClick={() => handleCommand(cmd.id)}
                        onMouseEnter={() => setHoveredCmd(cmd.id)}
                        onMouseLeave={() => setHoveredCmd(null)}
                        className="flex flex-col items-center justify-center w-12 h-12 rounded-md hover:bg-white/5 active:bg-white/10 transition-all group"
                        title={`${cmd.label}${cmd.shortcut ? ` (${cmd.shortcut})` : ''}`}
                      >
                        <span className="text-base mb-0">{cmd.icon}</span>
                        <span className="text-[8px] text-gray-400 group-hover:text-white leading-tight text-center">
                          {cmd.label}
                        </span>
                      </button>
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
