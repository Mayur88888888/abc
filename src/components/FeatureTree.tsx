import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCADStore } from '../store/cadStore';

const featureIcons: Record<string, string> = {
  box: '◻️',
  cylinder: '⬡',
  sphere: '⬤',
  cone: '△',
  torus: '◎',
  pyramid: '🔺',
  helix: '🌀',
  pipe: '🔧',
  extrude: '⬆',
  revolve: '🔄',
  fillet: '⌢',
  chamfer: '⟋',
  shell: '⊡',
  hole: '⊙',
  pattern_linear: '⋮',
  pattern_circular: '⟳',
  datum_plane: '▦',
  sweep: '↗',
  loft: '⤴',
  mirror: '↔',
  sketch: '✏️',
};

export default function FeatureTree() {
  const features = useCADStore(s => s.model.features);
  const selectedFeatures = useCADStore(s => s.selectedFeatures);
  const selectFeature = useCADStore(s => s.selectFeature);
  const deleteFeature = useCADStore(s => s.deleteFeature);
  const toggleFeatureVisibility = useCADStore(s => s.toggleFeatureVisibility);
  const suppressFeature = useCADStore(s => s.suppressFeature);
  const renameFeature = useCADStore(s => s.renameFeature);
  const openDialog = useCADStore(s => s.openDialog);
  const [expanded, setExpanded] = useState(true);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // FIX: Clamp context menu position to viewport bounds
  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Estimate menu dimensions (will be refined after render)
    const menuWidth = 180;
    const menuHeight = 220;
    const padding = 8;
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Clamp to viewport
    if (x + menuWidth > window.innerWidth - padding) {
      x = window.innerWidth - menuWidth - padding;
    }
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }
    if (x < padding) x = padding;
    if (y < padding) y = padding;
    
    setContextMenu({ id, x, y });
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!contextMenu) return;
    
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    const handleScroll = () => setContextMenu(null);
    
    // Delay to avoid immediate close from the right-click itself
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      window.addEventListener('scroll', handleScroll, true);
    }, 10);
    
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [contextMenu]);

  const startRename = (id: string, currentName: string) => {
    setRenaming(id);
    setRenameValue(currentName);
    setContextMenu(null);
  };

  const finishRename = () => {
    if (renaming && renameValue.trim()) {
      renameFeature(renaming, renameValue.trim());
    }
    setRenaming(null);
  };

  return (
    <div className="h-full flex flex-col bg-gray-900/50 backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider"
        >
          <motion.span animate={{ rotate: expanded ? 90 : 0 }}>▶</motion.span>
          Part Navigator
        </button>
        <div className="flex items-center gap-1">
          <button className="p-1 text-gray-500 hover:text-white text-xs rounded hover:bg-white/5" title="Filter">
            🔍
          </button>
          <button className="p-1 text-gray-500 hover:text-white text-xs rounded hover:bg-white/5" title="Settings">
            ⚙
          </button>
        </div>
      </div>

      {/* Feature list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 overflow-y-auto"
          >
            {/* Origin */}
            <div className="px-2 py-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-500 hover:bg-white/5 cursor-pointer">
                <span>⊹</span>
                <span>Origin (WCS)</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-500 hover:bg-white/5 cursor-pointer ml-4">
                <span>▦</span>
                <span>XY Plane</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-500 hover:bg-white/5 cursor-pointer ml-4">
                <span>▦</span>
                <span>XZ Plane</span>
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-500 hover:bg-white/5 cursor-pointer ml-4">
                <span>▦</span>
                <span>YZ Plane</span>
              </div>
            </div>

            {/* Features */}
            <div className="px-2 py-1 border-t border-white/5">
              <div className="text-[10px] text-gray-600 uppercase tracking-wider px-2 py-1">
                Features ({features.length})
              </div>
              {features.length === 0 && (
                <div className="px-2 py-4 text-xs text-gray-600 text-center">
                  No features yet.<br />
                  Create a primitive to start.
                </div>
              )}
              {features.map((feature, index) => (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group transition-all ${
                    selectedFeatures.includes(feature.id)
                      ? 'bg-purple-500/20 text-white border border-purple-500/30'
                      : feature.suppressed
                      ? 'text-gray-600 opacity-50'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                  onClick={(e) => selectFeature(feature.id, e.ctrlKey || e.metaKey)}
                  onContextMenu={(e) => handleContextMenu(e, feature.id)}
                >
                  <span className="text-sm flex-shrink-0">
                    {featureIcons[feature.type] || '◻️'}
                  </span>
                  {renaming === feature.id ? (
                    <input
                      type="text"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={finishRename}
                      onKeyDown={(e) => e.key === 'Enter' && finishRename()}
                      className="flex-1 bg-gray-800 border border-purple-500/50 rounded px-1 py-0.5 text-xs text-white outline-none"
                      autoFocus
                    />
                  ) : (
                    <span className="text-xs flex-1 truncate">{feature.name}</span>
                  )}
                  {/* Visibility toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFeatureVisibility(feature.id); }}
                    className={`opacity-0 group-hover:opacity-100 text-xs transition-opacity ${
                      feature.visible ? 'text-gray-400' : 'text-gray-600'
                    }`}
                    title={feature.visible ? 'Hide' : 'Show'}
                  >
                    {feature.visible ? '👁' : '👁‍🗨'}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu - FIXED: clamped to viewport */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className="fixed z-[100] bg-gray-800 border border-white/10 rounded-lg shadow-2xl py-1 min-w-[180px]"
            style={{ 
              left: contextMenu.x, 
              top: contextMenu.y,
              maxHeight: 'calc(100vh - 20px)',
              overflowY: 'auto',
            }}
          >
            <div className="px-3 py-1.5 text-[10px] text-gray-500 uppercase tracking-wider border-b border-white/5 mb-1">
              {features.find(f => f.id === contextMenu.id)?.name || 'Feature'}
            </div>
            <button
              onClick={() => {
                const f = features.find(f => f.id === contextMenu.id);
                if (f) startRename(f.id, f.name);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-purple-500/10 hover:text-white flex items-center gap-2"
            >
              <span className="w-4">✏️</span> Rename
              <span className="ml-auto text-[10px] text-gray-600">F2</span>
            </button>
            <button
              onClick={() => { suppressFeature(contextMenu.id); setContextMenu(null); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-purple-500/10 hover:text-white flex items-center gap-2"
            >
              <span className="w-4">⏸</span> Suppress/Unsuppress
            </button>
            <button
              onClick={() => { toggleFeatureVisibility(contextMenu.id); setContextMenu(null); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-purple-500/10 hover:text-white flex items-center gap-2"
            >
              <span className="w-4">👁</span> Toggle Visibility
              <span className="ml-auto text-[10px] text-gray-600">Space</span>
            </button>
            <button
              onClick={() => { openDialog('edit'); setContextMenu(null); }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-purple-500/10 hover:text-white flex items-center gap-2"
            >
              <span className="w-4">⚙️</span> Edit Parameters
              <span className="ml-auto text-[10px] text-gray-600">Enter</span>
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
              onClick={() => { 
                const f = features.find(f => f.id === contextMenu.id);
                if (f) {
                  selectFeature(f.id);
                  openDialog(f.type);
                }
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-purple-500/10 hover:text-white flex items-center gap-2"
            >
              <span className="w-4">📋</span> Duplicate
              <span className="ml-auto text-[10px] text-gray-600">Ctrl+D</span>
            </button>
            <button
              onClick={() => {
                const f = features.find(f => f.id === contextMenu.id);
                if (f) selectFeature(f.id);
                setContextMenu(null);
              }}
              className="w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-purple-500/10 hover:text-white flex items-center gap-2"
            >
              <span className="w-4">🎯</span> Isolate
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
              onClick={() => { deleteFeature(contextMenu.id); setContextMenu(null); }}
              className="w-full text-left px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
            >
              <span className="w-4">🗑</span> Delete
              <span className="ml-auto text-[10px] text-red-400/60">Del</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
