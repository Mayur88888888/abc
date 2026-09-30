// Type declarations for WASM and asset imports in Vite

declare module '*.wasm?url' {
  const url: string;
  export default url;
}

declare module 'replicad-opencascadejs/wasm?url' {
  const url: string;
  export default url;
}

declare module 'replicad-opencascadejs/wasm' {
  const url: string;
  export default url;
}
