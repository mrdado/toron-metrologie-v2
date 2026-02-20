import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// TODO: Replace with your actual Firebase project configuration
// You can find this in your Firebase Console > Project Settings > General > Your Apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Diagnostic log for Production debugging (Safe)
if (import.meta.env.PROD) {
  console.log("Firebase Init - API Key present:", !!firebaseConfig.apiKey);
  console.log("Firebase Init - Project ID:", firebaseConfig.projectId);
  if (firebaseConfig.apiKey && firebaseConfig.apiKey.includes('"')) {
    console.error("CRITICAL: API Key contains literal quotes!");
  }
}


const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
