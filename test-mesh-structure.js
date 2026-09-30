// Test script to inspect replicad mesh structure
import { initKernel } from './kernel/occt.ts';
import * as shapes from './kernel/shapes.ts';

async function testMeshStructure() {
  console.log('=== Testing Replicad Mesh Structure ===\n');
  
  try {
    // Initialize kernel
    console.log('1. Initializing kernel...');
    await initKernel();
    console.log('✓ Kernel ready\n');
    
    // Create a simple box
    console.log('2. Creating box (10x20x30)...');
    const box = shapes.createBox(10, 20, 30);
    console.log('✓ Box created\n');
    
    // Inspect the shape object
    console.log('3. Inspecting shape object...');
    console.log('Shape type:', typeof box);
    console.log('Shape keys:', Object.keys(box));
    console.log('Shape constructor:', box.constructor?.name);
    console.log('');
    
    // Try to get mesh
    console.log('4. Creating mesh...');
    try {
      const mesh = box.mesh({ tolerance: 0.1, angularTolerance: 30 });
      console.log('✓ Mesh created');
      console.log('Mesh type:', typeof mesh);
      console.log('Mesh keys:', Object.keys(mesh));
      console.log('');
      
      // Inspect mesh properties
      console.log('5. Inspecting mesh properties...');
      for (const key of Object.keys(mesh)) {
        const value = mesh[key];
        console.log(`  ${key}:`, typeof value);
        if (value && typeof value === 'object') {
          if (Array.isArray(value)) {
            console.log(`    - Array length: ${value.length}`);
            if (value.length > 0) {
              console.log(`    - First element:`, value[0]);
            }
          } else {
            console.log(`    - Object keys:`, Object.keys(value));
          }
        }
      }
      console.log('');
      
      // Try to get bounding box
      console.log('6. Getting bounding box...');
      try {
        const bbox = box.boundingBox;
        console.log('✓ Bounding box retrieved');
        console.log('Bounding box type:', typeof bbox);
        console.log('Bounding box keys:', Object.keys(bbox));
        console.log('Bounding box:', JSON.stringify(bbox, null, 2));
      } catch (e) {
        console.error('✗ Failed to get bounding box:', e);
      }
      console.log('');
      
      // Try to get faces/edges/vertices
      console.log('7. Getting topology...');
      try {
        const faces = box.faces;
        console.log('Faces:', faces?.length || 'undefined');
      } catch (e) {
        console.error('Failed to get faces:', e);
      }
      
      try {
        const edges = box.edges;
        console.log('Edges:', edges?.length || 'undefined');
      } catch (e) {
        console.error('Failed to get edges:', e);
      }
      
      try {
        const vertices = box.vertices;
        console.log('Vertices:', vertices?.length || 'undefined');
      } catch (e) {
        console.error('Failed to get vertices:', e);
      }
      
    } catch (e) {
      console.error('✗ Failed to create mesh:', e);
    }
    
  } catch (e) {
    console.error('Test failed:', e);
  }
}

// Run the test
testMeshStructure().then(() => {
  console.log('\n=== Test Complete ===');
}).catch(e => {
  console.error('Test error:', e);
});
