/**
 * CareProof Audit Console - Firebase Infrastructure Service
 * Phase 1: Infrastructure initialization and connectivity verification.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with designated database ID (CRITICAL)
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export { app };
export const isFirebaseConfigured = true;

/**
 * Infrastructure diagnostic probe for Firestore connectivity.
 */
export async function testFirestoreConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    await getDocFromServer(doc(db, 'system', 'health'));
    return { connected: true, message: `Connected to Firestore (db: ${firebaseConfig.firestoreDatabaseId})` };
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      return { connected: false, message: 'Client is offline. Check Firebase configuration.' };
    }
    // Document probe response acknowledged (security rules or document absence)
    return {
      connected: true,
      message: `Firestore online & reachable [DB: ${firebaseConfig.firestoreDatabaseId}] (Probe response: ${error instanceof Error ? error.message : 'acknowledged'})`,
    };
  }
}
