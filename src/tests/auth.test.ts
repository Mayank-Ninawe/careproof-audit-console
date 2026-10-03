/**
 * CareProof Audit Console - Email & Password Authentication Foundation Tests
 * 
 * Verifies non-UI authentication logic:
 * 1. Role type accepts strictly family, agency, auditor.
 * 2. Auth user mapping preserves UID and user metadata correctly.
 * 3. Auth-state abstraction represents loading state.
 * 4. Auth-state abstraction represents authenticated state.
 * 5. Auth-state abstraction represents unauthenticated state.
 * 6. Firebase auth error normalization handles known error categories.
 * 7. Invalid/unknown auth error falls back safely to unknown_auth_error.
 * 8. Stored session helpers preserve and clear session state cleanly.
 */

import { isValidAuthRole, VALID_AUTH_ROLES } from '../types/auth';
import {
  mapFirebaseUser,
  normalizeAuthError,
  saveStoredSession,
  getStoredSession,
  clearStoredSession,
} from '../services/auth';
import { createAuthStore } from '../store/authStore';
import { User } from 'firebase/auth';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Email & Password Authentication Foundation Tests ===\n');

let passed = 0;
let total = 0;

function test(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`✓ PASS: ${name}`);
    passed++;
  } catch (err: unknown) {
    console.error(`✗ FAIL: ${name}`);
    console.error(err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}

// 1. Role type validation: accepts only family, agency, auditor
test('1. Role type accepts strictly family, agency, auditor', () => {
  assert(VALID_AUTH_ROLES.length === 3, 'Exactly 3 canonical roles defined');
  assert(isValidAuthRole('family') === true, 'Accepts "family"');
  assert(isValidAuthRole('agency') === true, 'Accepts "agency"');
  assert(isValidAuthRole('auditor') === true, 'Accepts "auditor"');

  // Rejects invalid/unsupported roles
  assert(isValidAuthRole('admin') === false, 'Rejects "admin"');
  assert(isValidAuthRole('super_auditor') === false, 'Rejects "super_auditor"');
  assert(isValidAuthRole('patient') === false, 'Rejects "patient"');
  assert(isValidAuthRole('') === false, 'Rejects empty string');
  assert(isValidAuthRole(null) === false, 'Rejects null');
  assert(isValidAuthRole(undefined) === false, 'Rejects undefined');
  assert(isValidAuthRole(42) === false, 'Rejects numeric value');
});

// 2. Auth user mapping preserves UID correctly
test('2. Auth user mapping preserves UID and user fields without credential leakage', () => {
  const mockFirebaseUser = {
    uid: 'firebase-usr-987',
    email: 'auditor.lead@careproof.test',
    displayName: 'Lead Quality Inspector',
    photoURL: 'https://example.com/avatar.png',
    emailVerified: true,
  } as unknown as User;

  const authUser = mapFirebaseUser(mockFirebaseUser);

  assert(authUser.uid === 'firebase-usr-987', `Expected UID "firebase-usr-987", got "${authUser.uid}"`);
  assert(authUser.email === 'auditor.lead@careproof.test', 'Email correctly mapped');
  assert(authUser.displayName === 'Lead Quality Inspector', 'DisplayName correctly mapped');
  assert(authUser.photoURL === 'https://example.com/avatar.png', 'PhotoURL correctly mapped');
  assert(authUser.emailVerified === true, 'EmailVerified correctly mapped');
});

// 3. Auth-state abstraction represents loading state
test('3. Auth-state abstraction represents loading state', () => {
  const store = createAuthStore({ status: 'loading' });
  const state = store.getState();

  assert(state.status === 'loading', `Expected status "loading", got "${state.status}"`);
  assert(state.user === null, 'User must be null during loading');
  assert(state.profile === null, 'Profile must be null during loading');
  assert(state.error === null, 'Error must be null during initial loading');

  // Test transition into loading
  store.setLoading();
  assert(store.getState().status === 'loading', 'Store correctly transitions to loading');
});

// 4. Auth-state abstraction represents authenticated state
test('4. Auth-state abstraction represents authenticated state', () => {
  const store = createAuthStore();

  const mockUser = {
    uid: 'usr-456',
    email: 'agency.director@facility.test',
    displayName: 'Facility Director',
    photoURL: null,
    emailVerified: true,
  };

  const mockProfile = {
    uid: 'usr-456',
    role: 'agency' as const,
    displayName: 'Facility Director',
    organizationName: 'Metro Health Alliance',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  store.setAuthenticated(mockUser, mockProfile);
  const state = store.getState();

  assert(state.status === 'authenticated', `Expected status "authenticated", got "${state.status}"`);
  assert(state.user !== null && state.user.uid === 'usr-456', 'Authenticated user populated');
  assert(state.profile !== null && state.profile.role === 'agency', 'Profile role preserved');
  assert(state.error === null, 'Error cleared on successful authentication');
});

// 5. Auth-state abstraction represents unauthenticated state
test('5. Auth-state abstraction represents unauthenticated state', () => {
  const store = createAuthStore({
    status: 'authenticated',
    user: {
      uid: 'prev-user',
      email: 'test@example.com',
      displayName: null,
      photoURL: null,
      emailVerified: false,
    },
  });

  store.setUnauthenticated();
  const state = store.getState();

  assert(state.status === 'unauthenticated', `Expected status "unauthenticated", got "${state.status}"`);
  assert(state.user === null, 'User must be null when unauthenticated');
  assert(state.profile === null, 'Profile must be null when unauthenticated');
  assert(state.error === null, 'Error is null unless explicitly passed');
});

// 6. Error normalization handles known email/password error categories
test('6. Error normalization handles known email/password error categories', () => {
  // Invalid credentials
  const errCred = normalizeAuthError({ code: 'auth/invalid-credential' });
  assert(errCred.code === 'invalid_credentials', 'Maps invalid-credential');
  assert(errCred.message.includes('Invalid email or password'), 'Clean message');

  const errWrongPass = normalizeAuthError({ code: 'auth/wrong-password' });
  assert(errWrongPass.code === 'invalid_credentials', 'Maps wrong-password');

  // Email in use
  const errEmailUse = normalizeAuthError({ code: 'auth/email-already-in-use' });
  assert(errEmailUse.code === 'email_already_in_use', 'Maps email-already-in-use');

  // Weak password
  const errWeak = normalizeAuthError({ code: 'auth/weak-password' });
  assert(errWeak.code === 'weak_password', 'Maps weak-password');

  // Network error
  const errNet = normalizeAuthError({ code: 'auth/network-request-failed' });
  assert(errNet.code === 'network_error', 'Maps network-request-failed');

  // Too many requests
  const errRate = normalizeAuthError({ code: 'auth/too-many-requests' });
  assert(errRate.code === 'too_many_requests', 'Maps too-many-requests');
});

// 7. Invalid/unknown auth error falls back safely
test('7. Invalid/unknown auth error falls back safely to unknown_auth_error', () => {
  const unknown1 = normalizeAuthError({ code: 'auth/internal-error', message: 'Internal error' });
  assert(unknown1.code === 'unknown_auth_error', `Expected unknown_auth_error, got ${unknown1.code}`);
  assert(unknown1.rawCode === 'auth/internal-error', 'Preserved rawCode');

  const unknown2 = normalizeAuthError(null);
  assert(unknown2.code === 'unknown_auth_error', 'Null falls back safely');
  assert(unknown2.message.length > 0, 'Safe default message provided');

  const unknown3 = normalizeAuthError('random string error');
  assert(unknown3.code === 'unknown_auth_error', 'String error falls back safely');

  const unknown4 = normalizeAuthError(new Error('Network timeout'));
  assert(unknown4.code === 'unknown_auth_error', 'Generic Error object falls back safely');
});

// 8. Stored session helpers preserve and clear session state cleanly
test('8. Stored session helpers preserve and clear session state cleanly', () => {
  // Mock localStorage for Node test environment if undefined
  if (typeof localStorage === 'undefined') {
    const store = new Map<string, string>();
    (global as unknown as { localStorage: Storage }).localStorage = {
      getItem: (k: string) => store.get(k) || null,
      setItem: (k: string, v: string) => store.set(k, v),
      removeItem: (k: string) => store.delete(k),
      clear: () => store.clear(),
      key: (i: number) => Array.from(store.keys())[i] || null,
      length: store.size,
    };
  }

  const sampleUser = {
    uid: 'u-123',
    email: 'auditor@example.com',
    displayName: 'Test Auditor',
    photoURL: null,
    emailVerified: true,
  };

  saveStoredSession(sampleUser);
  const retrieved = getStoredSession();
  assert(retrieved !== null && retrieved.user.uid === 'u-123', 'Session preserved');

  clearStoredSession();
  assert(getStoredSession() === null, 'Session cleared');
});

console.log(`\nResults: ${passed} of ${total} email & password authentication foundation tests passed.`);
if (passed !== total) {
  process.exit(1);
}
