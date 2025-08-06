import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Development mode flag - set to false for production with Base44 authentication
const DEV_MODE = true; // Temporarily set to true to break redirect loop

// Base44 Configuration for go-travelpro.com
const BASE44_CONFIG = {
  appId: "688c5e1054a09b31feccff37", // Correct app ID from login URL
  domain: "go-travelpro.com",
  redirectUrl: "https://go-travelpro.com/callback",
  allowedOrigins: [
    "https://go-travelpro.com",
    "https://www.go-travelpro.com",
    "http://localhost:5173", // For local development
    "http://localhost:5174"  // For local development
  ]
};

// Development mode to break redirect loop
console.log('🚀 TravelPro DEV_MODE Status:', DEV_MODE);
console.log('🚀 TravelPro Environment:', process.env.NODE_ENV);
console.log('🚀 TravelPro Domain:', BASE44_CONFIG.domain);
console.log('🚀 TravelPro is running in DEVELOPMENT MODE - No authentication required');

// Create a client with authentication required
export const base44 = createClient({
  appId: BASE44_CONFIG.appId,
  requiresAuth: false, // Temporarily disable for development mode
  redirectUrl: BASE44_CONFIG.redirectUrl,
  allowedOrigins: BASE44_CONFIG.allowedOrigins
});

// Export dev mode flag for use in other files
export { DEV_MODE, BASE44_CONFIG };
