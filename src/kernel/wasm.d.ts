// Type declarations for WASM imports
declare module '*.wasm?url' {
  const url: string;
  export default url;
}

declare module 'replicad-opencascadejs/wasm?url' {
  const url: string;
  export default url;
}
