/**
 * CareProof Audit Console - Auth State Store Foundation
 * Source of Truth: CareProof Website Roadmap (Phase 5A)
 * 
 * Lightweight, zero-dependency reactive auth store:
 * - Distinguishes loading, authenticated, and unauthenticated states.
 * - Stores current AuthUser and application UserProfile.
 * - Reactive via useSyncExternalStore for clean React component integration.
 * - Fully testable in headless / Node environments without React.
 */

import { useSyncExternalStore } from 'react';
import { AuthStatus, AuthUser, NormalizedAuthError } from '../types/auth';
import { UserProfile } from '../types/userProfile';
import { observeAuthState, getStoredSession } from '../services/auth';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  profile: UserProfile | null;
  error: NormalizedAuthError | null;
}

/**
 * Creates an independent, testable auth store instance.
 */
export function createAuthStore(initialState?: Partial<AuthState>) {
  let state: AuthState = {
    status: 'loading',
    user: null,
    profile: null,
    error: null,
    ...initialState,
  };

  const listeners = new Set<() => void>();

  function getState(): AuthState {
    return state;
  }

  function setState(partial: Partial<AuthState>): void {
    state = { ...state, ...partial };
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  function setAuthenticated(user: AuthUser, profile: UserProfile | null = null): void {
    setState({
      status: 'authenticated',
      user,
      profile,
      error: null,
    });
  }

  function setUnauthenticated(error: NormalizedAuthError | null = null): void {
    setState({
      status: 'unauthenticated',
      user: null,
      profile: null,
      error,
    });
  }

  function setLoading(): void {
    setState({
      status: 'loading',
      error: null,
    });
  }

  function setProfile(profile: UserProfile | null): void {
    setState({ profile });
  }

  function setError(error: NormalizedAuthError | null): void {
    setState({ error });
  }

  return {
    getState,
    setState,
    subscribe,
    setAuthenticated,
    setUnauthenticated,
    setLoading,
    setProfile,
    setError,
  };
}

// Singleton application auth store
export const authStore = createAuthStore();

let unsubscribeAuthObserver: (() => void) | null = null;

/**
 * Initializes synchronization between Firebase auth state and the application auth store.
 * Safe to call in browser entrypoint.
 */
export function initializeAuthObserver(): () => void {
  if (unsubscribeAuthObserver) {
    return unsubscribeAuthObserver;
  }

  const stored = getStoredSession();
  if (stored) {
    authStore.setAuthenticated(stored.user, stored.profile || null);
  }

  unsubscribeAuthObserver = observeAuthState((authUser) => {
    if (authUser) {
      const currentStored = getStoredSession();
      authStore.setAuthenticated(authUser, currentStored?.profile || null);
    } else {
      authStore.setUnauthenticated(null);
    }
  });

  return unsubscribeAuthObserver;
}

/**
 * React hook for consuming reactive auth state in UI components.
 */
export function useAuth(): AuthState {
  return useSyncExternalStore(authStore.subscribe, authStore.getState, authStore.getState);
}
