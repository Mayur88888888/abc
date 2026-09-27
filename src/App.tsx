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

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault();
        toggleCommandPalette();
      }
      // Quick shortcuts
      if (e.key === 'b' && !e.ctrlKey && !e.metaKey) openDialog('box');
      if (e.key === 'c' && !e.ctrlKey && !e.metaKey) openDialog('cylinder');
      if (e.key === 's' && !e.ctrlKey && !e.metaKey) openDialog('sphere');
      if (e.key === 'e' && !e.ctrlKey && !e.metaKey) openDialog('extrude');
      if (e.key === 'f' && !e.ctrlKey && !e.metaKey) openDialog('fillet');
      if (e.key === 'h' && !e.ctrlKey && !e.metaKey) openDialog('hole');
      if (e.key === 'F8') { e.preventDefault(); /* fit view */ }
      if (e.key === 'F6') { e.preventDefault(); /* iso view */ }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, toggleCommandPalette, openDialog]);

  // Add some demo features on first load
  useEffect(() => {
    const state = useCADStore.getState();
    if (state.model.features.length === 0) {
      addBox(60, 40, 50);
      addCylinder(15, 60);
      addSphere(20);
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
