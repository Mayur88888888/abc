# Troubleshooting Guide - OCCT Kernel Issues

## Problem: Features Created But Not Visible

### Symptoms
- Features appear in the left panel (feature tree)
- No 3D geometry visible in viewport
- Red wireframe boxes with "No geometry" labels appear

### Root Cause
The OpenCASCADE kernel is failing to initialize or create shapes properly.

---

## Diagnostic Steps

### 1. Check Browser Console (F12)

Open the browser console and look for these messages:

**✅ Good - Kernel Working:**
```
[OCCT] Starting kernel initialization...
[OCCT] Step 1: Importing replicad-opencascadejs...
[OCCT] Module imported successfully
[OCCT] Step 2: Initializing WASM...
[OCCT] Step 3: Injecting into replicad...
[OCCT] Step 4: Kernel ready!
[OCCT] OpenCASCADE kernel ready ✓
```

**❌ Bad - Kernel Failed:**
```
[OCCT] ❌ Initialization failed: [error message]
```

### 2. Check Debug Overlay

Look at the top-left corner of the viewport:
- **Green dot + "Kernel: Ready"** = Kernel is working
- **Red dot + "Kernel: Loading..."** = Kernel failed or still loading
- **Features: 0** = No features created
- **Features: N** = N features in the list

### 3. Check Shape Creation Logs

When you create a box, you should see:
```
[Store] addBox called: 50x30x40
[Store] Creating box shape...
[Store] Box shape created: [object]
[Store] Tessellating box...
[Store] ✓ Tessellation complete: 6 faces, 12 edges
[Store] ✓ Feature created: feat_1234567890_abc123
[Store] ✓ Box added successfully
[Viewport] Rendering feature: Block 50×30×40
```

If you see errors instead, the kernel is failing.

---

## Common Issues & Solutions

### Issue 1: WASM Loading Fails

**Error:**
```
Failed to load resource: the server responded with a status of 404
replicad_single.wasm
```

**Solution:**
The WASM file path is wrong. Check `vite.config.js`:
```javascript
export default defineConfig({
  // ... other config
  optimizeDeps: {
    exclude: ['replicad-opencascadejs']
  }
});
```

### Issue 2: Kernel Times Out

**Symptom:**
- "Kernel: Loading..." stays red
- No error messages
- Features don't render

**Solution:**
The WASM compilation is taking too long (>10 seconds). This can happen on:
- Slow CPUs
- Old browsers
- Mobile devices

**Workaround:**
Refresh the page. The browser caches the compiled WASM, so subsequent loads are faster.

### Issue 3: Shape Creation Fails

**Error:**
```
[Store] ❌ Error creating box: Error: OCCT kernel not initialized
```

**Solution:**
The kernel didn't initialize. Check the console for initialization errors.

### Issue 4: Tessellation Fails

**Error:**
```
[Store] ❌ Failed to tessellate box: [error]
```

**Solution:**
The shape was created but can't be converted to a mesh. This is usually a bug in the shape creation code.

---

## Fallback Mode

If the kernel fails, the app should show a clear error message. Currently, it shows red wireframe boxes with "No geometry" labels.

### Expected Behavior

1. **Kernel Loading** (2-5 seconds):
   - Loading screen shows "Initializing OpenCASCADE kernel..."
   - Debug overlay shows red dot + "Kernel: Loading..."

2. **Kernel Ready**:
   - Debug overlay shows green dot + "Kernel: Ready"
   - Demo features appear (box, cylinder, sphere, etc.)
   - Features are visible in viewport

3. **Kernel Failed**:
   - Debug overlay shows red dot + "Kernel: Loading..."
   - Status bar shows error message
   - Features appear in list but not in viewport
   - Red wireframe boxes with "No geometry" labels

---

## Quick Fix: Force Kernel Reload

If the kernel is stuck, try:

1. **Hard Refresh**: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. **Clear Cache**: DevTools → Application → Clear Storage → Clear site data
3. **Restart Browser**: Close and reopen the browser

---

## Check WASM File

The WASM file should be at:
```
dist/assets/replicad_single-[hash].wasm
```

Size: ~23MB (7MB gzipped)

If it's missing or 0 bytes, the build failed.

---

## Browser Compatibility

**Supported:**
- Chrome 90+
- Firefox 88+
- Safari 15+
- Edge 90+

**Not Supported:**
- Internet Explorer
- Old mobile browsers
- Browsers without WebAssembly support

---

## Performance

**Expected Load Times:**
- WASM download: 2-5 seconds (7MB gzipped)
- WASM compilation: 2-5 seconds
- Total: 4-10 seconds

**Optimization Tips:**
1. Use a CDN for the WASM file
2. Enable gzip/brotli compression
3. Preload the WASM file
4. Use a service worker to cache the WASM

---

## Next Steps

If you're still having issues:

1. **Open DevTools Console** (F12)
2. **Copy all console messages** related to `[OCCT]`, `[Store]`, `[Viewport]`
3. **Share the logs** so we can diagnose the exact issue

The most common issue is the WASM file not loading properly. Check the Network tab to see if `replicad_single.wasm` is loading successfully.
