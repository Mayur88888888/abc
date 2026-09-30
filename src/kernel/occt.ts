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
  if (isReady && ocInstance) {
    console.log('[OCCT] Already initialized');
    return ocInstance;
  }
  if (initPromise) {
    console.log('[OCCT] Initialization in progress...');
    return initPromise;
  }

  reportStatus('Loading OpenCASCADE kernel...');
  console.log('[OCCT] Starting kernel initialization...');

  initPromise = (async () => {
    try {
      console.log('[OCCT] Step 1: Importing replicad-opencascadejs...');
      
      // Import the OCCT loader and WASM file URL
      const [opencascadeModule, wasmUrl] = await Promise.all([
        import('replicad-opencascadejs'),
        import('replicad-opencascadejs/wasm?url')
      ]);
      
      const initOC = opencascadeModule.default;
      const wasmPath = wasmUrl.default;
      
      console.log('[OCCT] Module imported successfully');
      console.log('[OCCT] WASM path:', wasmPath);

      reportStatus('Compiling WebAssembly...');
      console.log('[OCCT] Step 2: Initializing WASM...');

      // Initialize OCCT with explicit WASM path
      const OC = await initOC({
        locateFile: (file: string) => {
          if (file.endsWith('.wasm')) {
            console.log('[OCCT] locateFile called for:', file, '-> returning:', wasmPath);
            return wasmPath;
          }
          return file;
        }
      });

      console.log('[OCCT] Step 3: Injecting into replicad...');
      // Inject into replicad
      setOC(OC);
      ocInstance = OC;
      isReady = true;

      console.log('[OCCT] Step 4: Kernel ready!');
      reportStatus('OpenCASCADE kernel ready ✓');
      return OC;
    } catch (error) {
      console.error('[OCCT] ❌ Initialization failed:', error);
      reportStatus(`❌ Kernel init failed: ${error}`);
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
