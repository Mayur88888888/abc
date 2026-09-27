import { useEffect } from 'react';
import Ribbon from './components/Ribbon';
import CADViewport from './components/CADViewport';
import FeatureTree from './components/FeatureTree';
import StatusBar from './components/StatusBar';
import CommandDialog from './components/CommandDialog';
import CommandPalette from './components/CommandPalette';
import ViewToolbar from './components/ViewToolbar';
import { useCADStore } from './store/cadStore';

export default function App() {
  const undo = useCADStore(s => s.undo);
  const redo = useCADStore(s => s.redo);
  const toggleCommandPalette = useCADStore(s => s.toggleCommandPalette);
  const openDialog = useCADStore(s => s.openDialog);
  const addBox = useCADStore(s => s.addBox);
  const addCylinder = useCADStore(s => s.addCylinder);
  const addSphere = useCADStore(s => s.addSphere);
  const addCone = useCADStore(s => s.addCone);
  const addTorus = useCADStore(s => s.addTorus);
  const addPyramid = useCADStore(s => s.addPyramid);
  const addHelix = useCADStore(s => s.addHelix);
  const addPipe = useCADStore(s => s.addPipe);
  const setSelectionMode = useCADStore(s => s.setSelectionMode);

  // Keyboard shortcuts - FIXED: avoid browser conflicts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      // Ctrl shortcuts (don't conflict with browser)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }
      
      // Single-key shortcuts (only when no modifier keys)
      if (!e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        switch (e.key.toLowerCase()) {
          case 'b': openDialog('box'); break;
          case 'c': openDialog('cylinder'); break;
          // 's' removed - conflicts with browser save
          case 'e': openDialog('extrude'); break;
          case 'f': openDialog('fillet'); break;
          case 'h': openDialog('hole'); break;
          case 'p': openDialog('pipe'); break;
          // Selection mode shortcuts
          case '1': setSelectionMode('body'); break;
          case '2': setSelectionMode('face'); break;
          case '3': setSelectionMode('edge'); break;
          case '4': setSelectionMode('vertex'); break;
        }
      }
      
      // F-key shortcuts
      if (e.key === 'F8') { e.preventDefault(); /* fit view */ }
      if (e.key === 'F6') { e.preventDefault(); /* iso view */ }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, toggleCommandPalette, openDialog]);

  // Add demo features with PROPER OFFSETS (fixed overlap bug)
  useEffect(() => {
    const state = useCADStore.getState();
    if (state.model.features.length === 0) {
      // Space features out so they don't overlap
      addBox(60, 40, 50, [0, 0, 0]);
      addCylinder(15, 60, [-50, 0, 0]);
      addSphere(20, [50, 0, 0]);
      addCone(20, 8, 45, [0, 0, -50]);
      addTorus(25, 8, [0, 0, 50]);
      addPyramid(30, 40, 4, [-50, 0, -50]);
      addHelix(15, 8, 4, 2, [50, 0, -50]);
      addPipe(18, 12, 50, [50, 0, 50]);
    }
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-950 text-white overflow-hidden select-none">
      {/* Top - Ribbon Toolbar */}
      <Ribbon />

      {/* Middle - Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Feature Tree */}
        <div className="w-64 border-r border-white/5 flex-shrink-0 overflow-hidden">
          <FeatureTree />
        </div>

        {/* Center - 3D Viewport */}
        <div className="flex-1 relative">
          <CADViewport />
          <ViewToolbar />
          
          {/* Viewport overlay info */}
          <div className="absolute top-3 left-3 z-20">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg border border-white/5 px-3 py-2">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Viewport</div>
              <div className="text-xs text-gray-300 font-mono">Perspective</div>
              <div className="text-[10px] text-gray-600 mt-1">MMGS Units</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom - Status Bar */}
      <StatusBar />

      {/* Overlays */}
      <CommandDialog />
      <CommandPalette />
    </div>
  );
}
