// Simple test file to verify environment configuration
import { ENV } from './config/env.js';

console.log('=== Environment Test ===');
console.log('API_URL:', ENV.API_URL);
console.log('APP_NAME:', ENV.APP_NAME);
console.log('NODE_ENV:', ENV.NODE_ENV);
console.log('========================');

export default ENV;