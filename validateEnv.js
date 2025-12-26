// WebSite/src/utils/validateEnv.js
// Validates environment variables on app startup

const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_API_BASE_URL'
];

export const validateEnvironment = () => {
  const missing = [];
  const warnings = [];

  // check required vars
  requiredEnvVars.forEach(varName => {
    const value = import.meta.env[varName];
    if (!value || value.includes('your_') || value.includes('_here')) {
      missing.push(varName);
    }
  });

  // check optional but recommended
  if (!import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
    warnings.push('VITE_FIREBASE_MEASUREMENT_ID (Analytics will be disabled)');
  }

  if (missing.length > 0) {
    console.error('❌ Missing or invalid environment variables:');
    missing.forEach(v => console.error(`  - ${v}`));
    console.error('\nPlease update your .env file with actual values.');
    
    if (import.meta.env.DEV) {
      throw new Error('Invalid environment configuration. Check console for details.');
    }
  }

  if (warnings.length > 0 && import.meta.env.DEV) {
    console.warn('⚠️  Optional environment variables not set:');
    warnings.forEach(w => console.warn(`  - ${w}`));
  }

  // log success in dev
  if (import.meta.env.DEV && missing.length === 0) {
    console.log('✅ Environment variables validated successfully');
  }
};

export const getApiUrl = () => {
  const url = import.meta.env.VITE_API_BASE_URL;
  // remove trailing slash if present
  return url.endsWith('/') ? url.slice(0, -1) : url;
};

export const isProduction = () => {
  return import.meta.env.PROD;
};

export const isDevelopment = () => {
  return import.meta.env.DEV;
};