'use client';
import { initializeApp, getApps, FirebaseApp, getApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

let firebaseApp: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

function initializeFirebase() {
  if (!getApps().length) {
    if (firebaseConfig.apiKey && firebaseConfig.projectId) {
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      console.warn("Firebase config is not set. Using a dummy config to avoid crashing. Please set your Firebase config in .env");
      // Initialize with a dummy config if the real one is not set
      firebaseApp = initializeApp({
        apiKey: "dummy-key",
        authDomain: "dummy.firebaseapp.com",
        projectId: "dummy-project-id"
      });
    }
  } else {
    firebaseApp = getApp();
  }
  auth = getAuth(firebaseApp);
  firestore = getFirestore(firebaseApp);
  return { firebaseApp, auth, firestore };
}

export { initializeFirebase };
export * from './provider';
export * from './client-provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
