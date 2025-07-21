import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// Import Firebase services you will use
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

let db: Firestore;

function getDbInstance(): Firestore {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

// Re-export db as a getter to ensure it's client-side if needed, but getDbInstance is safer.
export { db, getDbInstance };


let storageInstance: FirebaseStorage | null = null;
let analyticsInstance: Analytics | null = null;

export const getStorageInstance = (): FirebaseStorage => {
    if (typeof window === 'undefined') {
        throw new Error("Firebase Storage can only be used on the client-side.");
    }
    if (!storageInstance) {
        storageInstance = getStorage(app);
    }
    return storageInstance;
};

export const getAnalyticsInstance = async (): Promise<Analytics | null> => {
    if (typeof window !== 'undefined') {
        if (!analyticsInstance && firebaseConfig.measurementId) {
            const supported = await isSupported();
            if (supported) {
                analyticsInstance = getAnalytics(app);
            }
        }
        return analyticsInstance;
    }
    return null;
};

export { app, auth, firebaseConfig };
