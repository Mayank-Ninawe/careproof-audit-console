/**
 * CareProof Audit Console - Authentication Service & State Foundation Tests
 * Source of Truth: CareProof Website Roadmap (Phase 5A)
 * 
 * Verifies non-UI authentication logic:
 * 1. Role type accepts only family, agency, auditor.
 * 2. Auth user mapping preserves UID and user metadata correctly.
 * 3. Auth-state abstraction represents loading state.
 * 4. Auth-state abstraction represents authenticated state.
 * 5. Auth-state abstraction represents unauthenticated state.
 * 6. Firebase auth error normalization handles known error categories.
 * 7. Invalid/unknown auth error falls back safely to unknown_auth_error.
 */

import { isValidAuthRole, VALID_AUTH_ROLES } from '../types/auth';
import { mapFirebaseUser, normalizeAuthError } from '../services/auth';
import { createAuthStore } from '../store/authStore';
import { User } from 'firebase/auth';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Authentication Foundation Tests ===\n');

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
    uid: 'firebase-user-xyz-987',
    email: 'auditor.lead@careproof.test',
    displayName: 'Lead Quality Inspector',
    photoURL: 'https://example.com/avatar.png',
    emailVerified: true,
  } as unknown as User;

  const authUser = mapFirebaseUser(mockFirebaseUser);

  assert(authUser.uid === 'firebase-user-xyz-987', `Expected UID "firebase-user-xyz-987", got "${authUser.uid}"`);
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

// 6. Firebase auth error normalization handles known error categories
test('6. Firebase auth error normalization handles known error categories', () => {
  // Invalid credentials
  const errCred1 = normalizeAuthError({ code: 'auth/invalid-credential' });
  assert(errCred1.code === 'invalid_credentials', `Expected invalid_credentials, got ${errCred1.code}`);
  assert(errCred1.rawCode === 'auth/invalid-credential', 'Preserves rawCode');

  const errCred2 = normalizeAuthError({ code: 'auth/wrong-password' });
  assert(errCred2.code === 'invalid_credentials', 'Maps wrong-password to invalid_credentials');

  const errCred3 = normalizeAuthError({ code: 'auth/user-not-found' });
  assert(errCred3.code === 'invalid_credentials', 'Maps user-not-found to invalid_credentials');

  // Email already in use
  const errEmail = normalizeAuthError({ code: 'auth/email-already-in-use' });
  assert(errEmail.code === 'email_already_in_use', `Expected email_already_in_use, got ${errEmail.code}`);

  // Weak password
  const errPass = normalizeAuthError({ code: 'auth/weak-password' });
  assert(errPass.code === 'weak_password', `Expected weak_password, got ${errPass.code}`);

  // Network error
  const errNet = normalizeAuthError({ code: 'auth/network-request-failed' });
  assert(errNet.code === 'network_error', `Expected network_error, got ${errNet.code}`);

  // Too many requests
  const errRate = normalizeAuthError({ code: 'auth/too-many-requests' });
  assert(errRate.code === 'too_many_requests', `Expected too_many_requests, got ${errRate.code}`);
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

console.log(`\nResults: ${passed} of ${total} authentication foundation tests passed.`);
if (passed !== total) {
  process.exit(1);
}
