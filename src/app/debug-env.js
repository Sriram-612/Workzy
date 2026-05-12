// Debug script to test environment variable loading
console.log('=== Environment Debug ===');

console.log('1. Process Environment:');
if (typeof process !== 'undefined' && process.env) {
  console.log('  - NODE_ENV:', process.env.NODE_ENV);
  console.log('  - Available keys:', Object.keys(process.env).filter(k => k.startsWith('VITE_')));
} else {
  console.log('  - process.env not available');
}

console.log('2. Import Meta Environment:');
try {
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    console.log('  - Available:', true);
    console.log('  - Keys:', Object.keys(import.meta.env));
    console.log('  - VITE_API_URL:', import.meta.env.VITE_API_URL);
  } else {
    console.log('  - import.meta.env not available');
  }
} catch (error) {
  console.log('  - Error accessing import.meta.env:', error.message);
}

console.log('3. Global __ENV__:');
try {
  if (typeof __ENV__ !== 'undefined') {
    console.log('  - Available:', true);
    console.log('  - Content:', __ENV__);
  } else {
    console.log('  - __ENV__ not available');
  }
} catch (error) {
  console.log('  - Error accessing __ENV__:', error.message);
}

console.log('4. Window Environment:');
if (typeof window !== 'undefined') {
  if ((window as any).__ENV__) {
    console.log('  - window.__ENV__ available:', (window as any).__ENV__);
  } else {
    console.log('  - window.__ENV__ not available');
  }
} else {
  console.log('  - window not available (server-side)');
}

console.log('=========================');