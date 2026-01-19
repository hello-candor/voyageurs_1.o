
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { initializeFirestore } from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";

// FIXED: Access Vite environment variables correctly
const getEnvVar = (key: string, defaultValue: string) => {
  // 1. Try Vite standard (import.meta.env)
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    // ignore
  }
  
  // 2. Fallback to process.env (for local/testing/compat)
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return defaultValue;
};

// Configuration for 'v6yage4rs' project with provided API Key
const firebaseConfig = {
  // Update your .env file to use VITE_ prefix (e.g. VITE_FIREBASE_API_KEY)
  apiKey: getEnvVar('VITE_FIREBASE_API_KEY', "AIzaSyAC5sjtZnu9ccHXLVeoiawnjq0w_dwNeq8"),
  authDomain: "v6yage4rs.firebaseapp.com",
  projectId: "v6yage4rs",
  storageBucket: "v6yage4rs.firebasestorage.app",
  messagingSenderId: "435975494588", 
  appId: "1:435975494588:web:2e12eb825a53477ebbe9b9",
  measurementId: "G-QZ1YK6TT3C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth and sign in anonymously to handle "allow read/write if request.auth != null" rules
export const auth = getAuth(app);

// Attempt sign-in, but handle failures gracefully for offline/demo mode
signInAnonymously(auth).catch((error) => {
    // Only log if it's a critical configuration error preventing usage
    if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
        console.warn("⚠️ Firebase Auth not enabled in Console. App will run in Offline/Local Mode.");
        console.info("To enable Cloud Sync: Go to Firebase Console > Authentication > Sign-in method > Enable Anonymous.");
    } else {
        console.warn("Firebase Auth Warning:", error.message);
    }
});

// Initialize Services
export const storage = getStorage(app);

/**
 * Initialize Firestore with specific settings to mitigate connectivity issues.
 * experimentalForceLongPolling: true is used to bypass potential WebSocket blocks
 */
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

console.log(`%c 🔥 Firebase Configured: ${firebaseConfig.projectId}`, 'color: #D67252; font-weight: bold;');
