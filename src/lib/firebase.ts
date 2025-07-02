// Import the functions you need from the Firebase SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
// Import Firebase services you will use
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import type { Analytics } from "firebase/analytics";

// Your web app's NEW Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC4N7z6jCbBohaQTgmC78dXz3GzsiONjHM",
  authDomain: "dr-nihar.firebaseapp.com",
  projectId: "dr-nihar",
  storageBucket: "dr-nihar.appspot.com",
  messagingSenderId: "721559945328",
  appId: "1:721559945328:web:4e747e02632754eced74b5",
  measurementId: "G-0K3W0DKLJX"
};

// Initialize Firebase
let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

// We are defining analytics as undefined for now to prevent startup issues.
// A more robust implementation can be added later if needed.
const analytics: Analytics | undefined = undefined;

export {
  app,
  auth,
  db,
  storage,
  analytics,
  firebaseConfig // Exporting config for easy access
};
