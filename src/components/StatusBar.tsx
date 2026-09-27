import { useCADStore } from '../store/cadStore';

export default function StatusBar() {
  const cursorPosition = useCADStore(s => s.cursorPosition);
  const statusMessage = useCADStore(s => s.statusMessage);
  const model = useCADStore(s => s.model);
  const viewMode = useCADStore(s => s.viewMode);
  const selectedFeatures = useCADStore(s => s.selectedFeatures);
  const snapToGrid = useCADStore(s => s.snapToGrid);
  const gridSize = useCADStore(s => s.gridSize);
  const setSnapToGrid = useCADStore(s => s.setSnapToGrid);
  const selectionMode = useCADStore(s => s.selectionMode);
  const setSelectionMode = useCADStore(s => s.setSelectionMode);

  const selectionModeLabels = {
    body: 'Body',
    face: 'Face',
    edge: 'Edge',
    vertex: 'Vertex',
  };

  return (
    <div className="h-7 bg-gray-900/95 backdrop-blur-sm border-t border-white/5 flex items-center px-3 gap-4 text-[10px] select-none">
      {/* Status message */}
      <div className="flex items-center gap-2 text-gray-400">
        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
        <span className="max-w-xs truncate">{statusMessage}</span>
      </div>

      <div className="w-px h-3 bg-white/10" />

      {/* Cursor position */}
      <div className="flex items-center gap-3 font-mono text-gray-500">
        <span>
          X: <span className="text-red-400">{cursorPosition[0].toFixed(1)}</span>
        </span>
        <span>
          Y: <span className="text-green-400">{cursorPosition[1].toFixed(1)}</span>
        </span>
        <span>
          Z: <span className="text-blue-400">{cursorPosition[2].toFixed(1)}</span>
        </span>
      </div>

      <div className="w-px h-3 bg-white/10" />

      {/* Selection info */}
      <div className="text-gray-500">
        {selectedFeatures.length > 0
          ? `${selectedFeatures.length} feature${selectedFeatures.length > 1 ? 's' : ''} selected`
          : 'No selection'}
      </div>

      <div className="flex-1" />

      {/* Selection mode toggle - NEW */}
      <div className="flex items-center gap-1">
        <span className="text-gray-600 mr-1">Mode:</span>
        {(['body', 'face', 'edge', 'vertex'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setSelectionMode(mode)}
            className={`px-1.5 py-0.5 rounded text-[10px] transition-colors ${
              selectionMode === mode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-gray-500 hover:text-white hover:bg-white/5'
            }`}
          >
            {selectionModeLabels[mode]}
          </button>
        ))}
      </div>

      <div className="w-px h-3 bg-white/10" />

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Snap toggle */}
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] transition-colors ${
            snapToGrid ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-gray-500 hover:text-white'
          }`}
        >
          ⊞ Snap {gridSize}mm
        </button>

        {/* Units */}
        <span className="text-gray-500">{model.units.toUpperCase()}</span>

        {/* View mode */}
        <span className="text-gray-500 capitalize">{viewMode.replace(/_/g, ' ')}</span>

        {/* Feature count */}
        <span className="text-gray-500">{model.features.length} features</span>

        {/* Model name */}
        <span className="text-gray-600">{model.name}</span>
      </div>
    </div>
  );
}
