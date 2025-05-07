
import { initializeApp, getApps, getApp, type FirebaseOptions } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (!firebaseApiKey) {
  console.error("Firebase API Key is missing. Please check your .env.local file or environment variables for NEXT_PUBLIC_FIREBASE_API_KEY.");
  // throw new Error("Firebase API Key is missing. Cannot initialize Firebase.");
}

const firebaseConfig: FirebaseOptions = {
  apiKey: firebaseApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error("Firebase initialization error:", error.message);
    // Potentially re-throw or handle more gracefully depending on application needs
    // For now, we'll let the app continue, but auth will likely fail.
    // throw error; // Uncomment to make it a hard stop
    // Create a dummy app object if initialization fails, so getAuth doesn't immediately break
    // This is a temporary measure to prevent further cascading errors if Firebase is non-critical for some parts
    app = {
        name: 'dummy-app-initialization-failed',
        options: {},
        automaticDataCollectionEnabled: false,
        delete: () => Promise.resolve(),
      };
  }
} else {
  app = getApp();
}


let auth;
try {
  auth = getAuth(app);
} catch (error: any) {
  console.error("Firebase getAuth() error:", error.message);
  // If app initialization failed, 'app' might be the dummy object.
  // Provide a fallback for auth to prevent crashes in components that import it.
  // This auth object won't work, but prevents `auth is undefined` errors.
  auth = {
    // Mock essential properties and methods used by the app
    currentUser: null,
    onAuthStateChanged: () => () => {}, // Returns an unsubscribe function
    signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase Auth not initialized.")),
    createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase Auth not initialized.")),
    signOut: () => Promise.reject(new Error("Firebase Auth not initialized.")),
    // Add other methods/properties if your app uses them directly from `auth`
  } as any; // Cast to any to bypass strict type checking for this mock
}


// const db = getFirestore(app);
// const storage = getStorage(app);

export { app, auth /*, db, storage */ };

