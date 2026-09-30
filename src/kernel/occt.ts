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
      
      // Import the OCCT loader
      const opencascadeModule = await import('replicad-opencascadejs');
      const initOC = opencascadeModule.default;
      console.log('[OCCT] Module imported successfully');

      reportStatus('Compiling WebAssembly...');
      console.log('[OCCT] Step 2: Initializing WASM...');

      // Initialize OCCT - let it auto-locate the WASM file
      const OC = await initOC();

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
