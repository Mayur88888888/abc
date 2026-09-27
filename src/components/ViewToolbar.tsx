import { useCADStore } from '../store/cadStore';
import { motion } from 'framer-motion';

export default function ViewToolbar() {
  const viewMode = useCADStore(s => s.viewMode);
  const setViewMode = useCADStore(s => s.setViewMode);
  const showGrid = useCADStore(s => s.showGrid);
  const toggleGrid = useCADStore(s => s.toggleGrid);
  const showAxes = useCADStore(s => s.showAxes);
  const toggleAxes = useCADStore(s => s.toggleAxes);
  const toggleCommandPalette = useCADStore(s => s.toggleCommandPalette);

  const viewModes = [
    { id: 'shaded', label: 'Shaded', icon: '🎨' },
    { id: 'wireframe', label: 'Wireframe', icon: '📐' },
    { id: 'shaded_with_edges', label: 'With Edges', icon: '🔲' },
    { id: 'hidden_line', label: 'Hidden Line', icon: '⬚' },
  ] as const;

  return (
    <div className="absolute top-3 right-3 flex flex-col gap-2 z-20">
      {/* View mode buttons */}
      <div className="flex flex-col gap-1 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/5 p-1">
        {viewModes.map((mode) => (
          <motion.button
            key={mode.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode(mode.id)}
            className={`w-9 h-9 rounded-md flex items-center justify-center text-sm transition-all ${
              viewMode === mode.id
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
            title={mode.label}
          >
            {mode.icon}
          </motion.button>
        ))}
      </div>

      {/* Display toggles */}
      <div className="flex flex-col gap-1 bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/5 p-1">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleGrid}
          className={`w-9 h-9 rounded-md flex items-center justify-center text-sm transition-all ${
            showGrid ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Grid"
        >
          #
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleAxes}
          className={`w-9 h-9 rounded-md flex items-center justify-center text-sm transition-all ${
            showAxes ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-gray-500 hover:text-white hover:bg-white/5'
          }`}
          title="Toggle Axes"
        >
          +
        </motion.button>
      </div>

      {/* Command palette button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleCommandPalette}
        className="w-9 h-9 rounded-lg bg-gray-900/80 backdrop-blur-sm border border-white/5 flex items-center justify-center text-sm text-gray-500 hover:text-white hover:bg-white/5 transition-all"
        title="Command Palette (Ctrl+Shift+P)"
      >
        ⌘
      </motion.button>
    </div>
  );
}
