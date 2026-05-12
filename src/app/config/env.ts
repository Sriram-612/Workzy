// Simple environment configuration that works with all build systems
const getEnvVar = (key: string, fallback: string): string => {
  // Try Vite environment variables first
  try {
    if (import.meta?.env?.[key]) {
      return import.meta.env[key];
    }
  } catch {}
  
  // Fallback to default value
  return fallback;
};

// Environment configuration for browser
export const ENV = {
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:3001/api'),
  NODE_ENV: getEnvVar('VITE_NODE_ENV', 'development'),
  APP_NAME: getEnvVar('VITE_APP_NAME', 'Workzy'),
  VERSION: '1.0.0',
  STRIPE_PUBLISHABLE_KEY: getEnvVar('VITE_STRIPE_PUBLISHABLE_KEY', ''),
  SOCKET_URL: getEnvVar('VITE_SOCKET_URL', 'http://localhost:3001')
};

// Function to get environment-specific configuration
export const getConfig = () => {
  return ENV;
};