import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCADStore } from '../store/cadStore';

interface Command {
  id: string;
  label: string;
  category: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

const commands: Command[] = [
  // Primitives
  { id: 'box', label: 'Create Block', category: 'Primitives', icon: '◻️', shortcut: 'B', action: () => {} },
  { id: 'cylinder', label: 'Create Cylinder', category: 'Primitives', icon: '⬡', shortcut: 'C', action: () => {} },
  { id: 'sphere', label: 'Create Sphere', category: 'Primitives', icon: '⬤', shortcut: 'S', action: () => {} },
  { id: 'cone', label: 'Create Cone', category: 'Primitives', icon: '△', action: () => {} },
  { id: 'torus', label: 'Create Torus', category: 'Primitives', icon: '◎', action: () => {} },
  // Features
  { id: 'extrude', label: 'Extrude', category: 'Features', icon: '⬆', shortcut: 'E', action: () => {} },
  { id: 'revolve', label: 'Revolve', category: 'Features', icon: '🔄', action: () => {} },
  { id: 'sweep', label: 'Sweep', category: 'Features', icon: '↗', action: () => {} },
  { id: 'loft', label: 'Loft', category: 'Features', icon: '⤴', action: () => {} },
  // Detail
  { id: 'fillet', label: 'Edge Fillet', category: 'Detail', icon: '⌢', shortcut: 'F', action: () => {} },
  { id: 'chamfer', label: 'Chamfer', category: 'Detail', icon: '⟋', action: () => {} },
  { id: 'shell', label: 'Shell', category: 'Detail', icon: '⊡', action: () => {} },
  { id: 'hole', label: 'Hole', category: 'Detail', icon: '⊙', shortcut: 'H', action: () => {} },
  // Patterns
  { id: 'linear_pattern', label: 'Linear Pattern', category: 'Pattern', icon: '⋮', action: () => {} },
  { id: 'circular_pattern', label: 'Circular Pattern', category: 'Pattern', icon: '⟳', action: () => {} },
  // View
  { id: 'view_fit', label: 'Fit View', category: 'View', icon: '⊡', shortcut: 'F8', action: () => {} },
  { id: 'view_iso', label: 'Isometric View', category: 'View', icon: '◇', shortcut: 'F6', action: () => {} },
  { id: 'view_top', label: 'Top View', category: 'View', icon: '⬆', action: () => {} },
  { id: 'view_front', label: 'Front View', category: 'View', icon: '⬛', action: () => {} },
  // Tools
  { id: 'measure', label: 'Measure Distance', category: 'Tools', icon: '📏', action: () => {} },
  { id: 'expressions', label: 'Expressions Editor', category: 'Tools', icon: 'fx', action: () => {} },
  // Edit
  { id: 'undo', label: 'Undo', category: 'Edit', icon: '↩', shortcut: 'Ctrl+Z', action: () => {} },
  { id: 'redo', label: 'Redo', category: 'Edit', icon: '↪', shortcut: 'Ctrl+Y', action: () => {} },
  { id: 'delete', label: 'Delete', category: 'Edit', icon: '🗑', shortcut: 'Del', action: () => {} },
];

export default function CommandPalette() {
  const isOpen = useCADStore(s => s.commandPaletteOpen);
  const togglePalette = useCADStore(s => s.toggleCommandPalette);
  const openDialog = useCADStore(s => s.openDialog);
  const undo = useCADStore(s => s.undo);
  const redo = useCADStore(s => s.redo);
  const deleteFeature = useCADStore(s => s.deleteFeature);
  const selectedFeatures = useCADStore(s => s.selectedFeatures);

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'p') {
        e.preventDefault();
        togglePalette();
      }
      if (e.key === 'Escape' && isOpen) {
        togglePalette();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, togglePalette]);

  const executeCommand = (cmd: Command) => {
    switch (cmd.id) {
      case 'undo': undo(); break;
      case 'redo': redo(); break;
      case 'delete':
        selectedFeatures.forEach(id => deleteFeature(id));
        break;
      default:
        openDialog(cmd.id);
        break;
    }
    togglePalette();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
      onClick={togglePalette}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-lg bg-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
          <span className="text-gray-500">⌘</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command... (e.g., 'block', 'extrude', 'fillet')"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-600"
          />
          <kbd className="px-1.5 py-0.5 text-[10px] text-gray-500 bg-white/5 rounded border border-white/10">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filteredCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-500">
              No commands found for "{query}"
            </div>
          ) : (
            filteredCommands.map((cmd, i) => (
              <button
                key={cmd.id}
                onClick={() => executeCommand(cmd)}
                onMouseEnter={() => setSelectedIndex(i)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                  i === selectedIndex ? 'bg-purple-500/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <span className="text-lg w-6 text-center">{cmd.icon}</span>
                <span className="flex-1 text-sm">{cmd.label}</span>
                <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
                  {cmd.category}
                </span>
                {cmd.shortcut && (
                  <kbd className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-white/5 text-[10px] text-gray-600">
          <span>↑↓ Navigate</span>
          <span>↵ Execute</span>
          <span>ESC Close</span>
          <span className="ml-auto">{filteredCommands.length} commands</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
