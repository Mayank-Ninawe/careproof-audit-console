/**
 * CareProof Audit Console - Firebase Authentication Service Layer
 * Source of Truth: CareProof Website Roadmap (Phase 5A)
 * 
 * CORE PRINCIPLES:
 * 1. Reuses shared Firebase Auth instance initialized in src/services/firebase.ts.
 * 2. Independent of React components, hooks, routing, and UI state.
 * 3. Normalizes Firebase error codes into clean application-level domain errors.
 * 4. Never stores passwords or sensitive tokens manually in localStorage or Firestore.
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User,
} from 'firebase/auth';
import { auth } from './firebase';
import { AuthErrorCode, AuthUser, NormalizedAuthError } from '../types/auth';

/**
 * Transforms a Firebase User object into the minimal application AuthUser domain model.
 */
export function mapFirebaseUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

/**
 * Normalizes Firebase Authentication error codes into structured application error categories.
 * Preserves the underlying rawCode for diagnostics while providing safe user-facing copy.
 */
export function normalizeAuthError(error: unknown): NormalizedAuthError {
  const err = error as { code?: string; message?: string } | null;
  const rawCode = err?.code || '';

  let code: AuthErrorCode = 'unknown_auth_error';
  let message = 'An unexpected authentication error occurred. Please try again.';

  switch (rawCode) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-email':
      code = 'invalid_credentials';
      message = 'Invalid email or password. Please verify your credentials.';
      break;
    case 'auth/email-already-in-use':
      code = 'email_already_in_use';
      message = 'This email address is already registered. Please sign in instead.';
      break;
    case 'auth/weak-password':
      code = 'weak_password';
      message = 'The password is too weak. Please choose a stronger password.';
      break;
    case 'auth/network-request-failed':
      code = 'network_error';
      message = 'A network error occurred. Please check your connection and retry.';
      break;
    case 'auth/too-many-requests':
      code = 'too_many_requests';
      message = 'Too many unsuccessful attempts. Access is temporarily suspended. Please try again later.';
      break;
    default:
      if (err?.message) {
        message = err.message;
      }
      break;
  }

  return {
    code,
    message,
    rawCode: rawCode || undefined,
    originalError: error,
  };
}

/**
 * Creates a new Firebase user with email and password.
 * Optionally updates the user's displayName upon account creation.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<AuthUser> {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && cred.user) {
      await updateProfile(cred.user, { displayName });
    }
    return mapFirebaseUser(cred.user);
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

/**
 * Authenticates an existing user using email and password.
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<AuthUser> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return mapFirebaseUser(cred.user);
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

/**
 * Signs out the currently authenticated user.
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throw normalizeAuthError(error);
  }
}

/**
 * Subscribes to Firebase auth-state changes.
 * Returns an unsubscribe callback for clean resource cleanup.
 */
export function observeAuthState(
  callback: (user: AuthUser | null) => void
): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null);
  });
}

/**
 * Synchronously retrieves the currently cached Firebase user mapped to AuthUser.
 */
export function getCurrentAuthUser(): AuthUser | null {
  return auth.currentUser ? mapFirebaseUser(auth.currentUser) : null;
}
