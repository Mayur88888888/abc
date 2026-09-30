// OCCT Kernel Integration via replicad
// This is the foundation that enables real B-rep CAD operations

import { setOC } from 'replicad';

// The OCCT instance type
type OCInstance = any;

let ocInstance: OCInstance | null = null;
let initPromise: Promise<OCInstance> | null = null;
let isReady = false;

// Status callbacks for UI feedback
type StatusCallback = (status: string) => void;
let statusCallback: StatusCallback | null = null;

export function onKernelStatus(cb: StatusCallback) {
  statusCallback = cb;
}

function reportStatus(msg: string) {
  console.log(`[OCCT] ${msg}`);
  statusCallback?.(msg);
}

/**
 * Initialize the OpenCASCADE kernel via replicad.
 * This loads the WASM module and injects it into replicad.
 * Must be called once before any CAD operations.
 */
export async function initKernel(): Promise<OCInstance> {
  if (isReady && ocInstance) return ocInstance;
  if (initPromise) return initPromise;

  reportStatus('Loading OpenCASCADE kernel...');

  initPromise = (async () => {
    try {
      // Import the OCCT loader and WASM URL
      const [{ default: initOC }, wasmUrl] = await Promise.all([
        import('replicad-opencascadejs'),
        import('replicad-opencascadejs/wasm?url').then(m => m.default),
      ]);

      reportStatus('Compiling WebAssembly...');

      // Initialize OCCT with WASM module URL
      const OC = await initOC({
        locateFile: () => wasmUrl,
      });

      // Inject into replicad
      setOC(OC);
      ocInstance = OC;
      isReady = true;

      reportStatus('OpenCASCADE kernel ready ✓');
      return OC;
    } catch (error) {
      reportStatus(`Kernel init failed: ${error}`);
      initPromise = null;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Check if kernel is initialized
 */
export function isKernelReady(): boolean {
  return isReady;
}

/**
 * Get the OCCT instance (throws if not ready)
 */
export function getKernel(): OCInstance {
  if (!ocInstance) {
    throw new Error('OCCT kernel not initialized. Call initKernel() first.');
  }
  return ocInstance;
}
