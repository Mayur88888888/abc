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
  implemented?: boolean; // Mark if command is actually implemented
}

// Commands that have dialog configs and actually work
const DIALOG_COMMANDS = new Set([
  'box', 'cylinder', 'sphere', 'cone', 'torus', 'pyramid', 'helix',
  'extrude', 'revolve', 'fillet', 'chamfer', 'shell', 'hole', 'pipe',
  'mirror', 'linear_pattern', 'circular_pattern',
]);

const ribbonTabs: RibbonTab[] = [
  {
    id: 'home',
    label: 'Home',
    groups: [
      {
        name: 'Primitives',
        commands: [
          { id: 'box', label: 'Block', icon: '◻️', shortcut: 'B', implemented: true },
          { id: 'cylinder', label: 'Cylinder', icon: '⬡', shortcut: 'C', implemented: true },
          { id: 'sphere', label: 'Sphere', icon: '⬤', implemented: true },
          { id: 'cone', label: 'Cone', icon: '△', implemented: true },
          { id: 'torus', label: 'Torus', icon: '◎', implemented: true },
          { id: 'pyramid', label: 'Pyramid', icon: '🔺', implemented: true },
        ],
      },
      {
        name: 'Sketch',
        commands: [
          { id: 'sketch', label: 'Sketch', icon: '✏️', implemented: true },
          { id: 'line', label: 'Line', icon: '╱', implemented: false },
          { id: 'arc', label: 'Arc', icon: '⌒', implemented: false },
          { id: 'circle', label: 'Circle', icon: '○', implemented: false },
          { id: 'rectangle', label: 'Rectangle', icon: '▭', implemented: false },
        ],
      },
      {
        name: 'Features',
        commands: [
          { id: 'extrude', label: 'Extrude', icon: '⬆', shortcut: 'E', implemented: true },
          { id: 'revolve', label: 'Revolve', icon: '🔄', implemented: true },
          { id: 'sweep', label: 'Sweep', icon: '↗', implemented: false },
          { id: 'loft', label: 'Loft', icon: '⤴', implemented: false },
          { id: 'pipe', label: 'Pipe', icon: '🔧', shortcut: 'P', implemented: true },
          { id: 'helix', label: 'Helix', icon: '🌀', implemented: true },
        ],
      },
    ],
  },
  {
    id: 'modeling',
    label: 'Modeling',
    groups: [
      {
        name: 'Detail',
        commands: [
          { id: 'fillet', label: 'Fillet', icon: '⌢', shortcut: 'F', implemented: true },
          { id: 'chamfer', label: 'Chamfer', icon: '⟋', implemented: true },
          { id: 'shell', label: 'Shell', icon: '⊡', implemented: true },
          { id: 'hole', label: 'Hole', icon: '⊙', shortcut: 'H', implemented: true },
        ],
      },
      {
        name: 'Pattern',
        commands: [
          { id: 'linear_pattern', label: 'Linear', icon: '⋮', implemented: true },
          { id: 'circular_pattern', label: 'Circular', icon: '⟳', implemented: true },
          { id: 'mirror', label: 'Mirror', icon: '↔', implemented: true },
        ],
      },
      {
        name: 'Boolean',
        commands: [
          { id: 'union', label: 'Unite', icon: '⊕', implemented: false },
          { id: 'subtract', label: 'Subtract', icon: '⊖', implemented: false },
          { id: 'intersect', label: 'Intersect', icon: '⊗', implemented: false },
        ],
      },
    ],
  },
  {
    id: 'view',
    label: 'View',
    groups: [
      {
        name: 'Display',
        commands: [
          { id: 'shaded', label: 'Shaded', icon: '🎨', implemented: true },
          { id: 'wireframe', label: 'Wireframe', icon: '📐', implemented: true },
          { id: 'shaded_edges', label: 'With Edges', icon: '🔲', implemented: true },
          { id: 'hidden', label: 'Hidden Line', icon: '⬚', implemented: true },
        ],
      },
      {
        name: 'Camera',
        commands: [
          { id: 'fit', label: 'Fit', icon: '⊡', implemented: false },
          { id: 'top', label: 'Top', icon: '⬆', implemented: false },
          { id: 'front', label: 'Front', icon: '⬛', implemented: false },
          { id: 'iso', label: 'Isometric', icon: '◇', implemented: false },
        ],
      },
    ],
  },
  {
    id: 'tools',
    label: 'Tools',
    groups: [
      {
        name: 'Measure',
        commands: [
          { id: 'measure_dist', label: 'Distance', icon: '📏', implemented: false },
          { id: 'measure_angle', label: 'Angle', icon: '📐', implemented: false },
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
  const undo = useCADStore(s => s.undo);
  const redo = useCADStore(s => s.redo);
  const setStatusMessage = useCADStore(s => s.setStatusMessage);

  const handleCommand = (cmdId: string, implemented: boolean) => {
    // If not implemented, show status message
    if (!implemented) {
      setStatusMessage(`"${cmdId}" is not implemented yet`);
      return;
    }

    // Dialog commands - only these have configs
    if (DIALOG_COMMANDS.has(cmdId)) {
      openDialog(cmdId);
      return;
    }

    // View mode commands
    const viewModeMap: Record<string, any> = {
      'shaded': 'shaded',
      'wireframe': 'wireframe',
      'shaded_edges': 'shaded_with_edges',
      'hidden': 'hidden_line',
    };
    if (viewModeMap[cmdId]) {
      setViewMode(viewModeMap[cmdId]);
      return;
    }

    // Sketch command
    if (cmdId === 'sketch') {
      setStatusMessage('Sketch mode - coming soon');
      return;
    }

    // Unknown command
    setStatusMessage(`Command "${cmdId}" not recognized`);
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
                        onClick={() => handleCommand(cmd.id, cmd.implemented !== false)}
                        onMouseEnter={() => setHoveredCmd(cmd.id)}
                        onMouseLeave={() => setHoveredCmd(null)}
                        disabled={cmd.implemented === false}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-md transition-all group ${
                          cmd.implemented === false
                            ? 'opacity-30 cursor-not-allowed'
                            : 'hover:bg-white/5 active:bg-white/10'
                        }`}
                        title={`${cmd.label}${cmd.shortcut ? ` (${cmd.shortcut})` : ''}${cmd.implemented === false ? ' - Not Implemented' : ''}`}
                      >
                        <span className="text-base mb-0">{cmd.icon}</span>
                        <span className={`text-[8px] leading-tight text-center ${
                          cmd.implemented === false ? 'text-gray-600' : 'text-gray-400 group-hover:text-white'
                        }`}>
                          {cmd.label}
                        </span>
                      </button>
                      {hoveredCmd === cmd.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 border border-white/10 rounded text-xs text-white whitespace-nowrap z-50 pointer-events-none">
                          {cmd.label}
                          {cmd.shortcut && (
                            <span className="ml-2 text-gray-500">({cmd.shortcut})</span>
                          )}
                          {cmd.implemented === false && (
                            <span className="ml-2 text-yellow-500 text-[10px]">(Not Implemented)</span>
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
