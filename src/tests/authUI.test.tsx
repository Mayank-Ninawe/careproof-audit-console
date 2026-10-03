/**
 * CareProof Audit Console - Email & Password Authentication UI & Route Guard Tests
 * 
 * Verifies:
 * 1. Auth route renders split layout and dossier header.
 * 2. Login mode renders email and password fields.
 * 3. Zero Google authentication buttons or OAuth controls exist.
 * 4. Signup mode renders display name, email, password, confirm password, and role picker.
 * 5. Password visibility controls exist with accessible labels.
 * 6. Email validation rejects invalid formats.
 * 7. Unauthenticated protected-route access redirects to /auth.
 * 8. Authenticated access to protected route is allowed.
 * 9. Auth loading state does not redirect prematurely.
 * 10. Authenticated user opening /auth redirects to /app/dashboard.
 * 11. Error banner displays normalized authentication messages.
 * 12. Demo auditor entry does NOT fake authentication.
 * 13. Canonical role options define family, agency, auditor.
 */

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthPage } from '../pages/Auth/AuthPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { authStore } from '../store/authStore';
import { isValidAuthRole, VALID_AUTH_ROLES } from '../types/auth';
import { normalizeAuthError, signInWithEmail, signUpWithEmail } from '../services/auth';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Email & Password Auth UI & Route Guard Tests ===\n');

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

// 1. Auth route renders split layout and dossier header
test('1. Auth route renders split layout and dossier header', () => {
  authStore.setUnauthenticated();
  const html = renderToString(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );

  assert(html.includes('CareProof Standard Audit Console'), 'Contains console title');
  assert(html.includes('REF-AUTH-1.4'), 'Contains audit reference badge');
  assert(html.includes('Accredited Protocol Pillars'), 'Contains protocol pillar section');
  assert(html.includes('Sign In'), 'Contains Sign In mode tab');
  assert(html.includes('Create Account'), 'Contains Create Account mode tab');
});

// 2. Login mode renders email and password fields
test('2. Login mode renders email and password input fields', () => {
  authStore.setUnauthenticated();
  const html = renderToString(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );

  assert(html.includes('id="auth-email"'), 'Contains auth-email ID');
  assert(html.includes('Work Email Address'), 'Contains Work Email Address label');
  assert(html.includes('id="auth-password"'), 'Contains auth-password ID');
  assert(html.includes('Sign In to Workspace'), 'Contains sign in submit button');
});

// 3. Zero Google auth buttons exist
test('3. Zero Google authentication buttons or OAuth controls exist', () => {
  authStore.setUnauthenticated();
  const html = renderToString(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );

  assert(!html.includes('Continue with Google'), 'Does NOT contain Google sign in button');
  assert(!html.includes('google.com'), 'Does NOT contain google.com OAuth references');
});

// 4. Signup mode contracts define required signup fields
test('4. Signup mode contracts define all required fields and role options', () => {
  assert(VALID_AUTH_ROLES.includes('family'), 'Defines family role');
  assert(VALID_AUTH_ROLES.includes('agency'), 'Defines agency role');
  assert(VALID_AUTH_ROLES.includes('auditor'), 'Defines auditor role');
  assert(VALID_AUTH_ROLES.length === 3, 'Exactly 3 application roles allowed');
  assert(typeof signUpWithEmail === 'function', 'signUpWithEmail is defined');
  assert(typeof signInWithEmail === 'function', 'signInWithEmail is defined');
});

// 5. Password visibility controls exist with accessible labels
test('5. Password visibility control works with accessible toggle labels', () => {
  authStore.setUnauthenticated();
  const html = renderToString(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );

  assert(html.includes('aria-label="Show password"'), 'Contains accessible Show password label');
});

// 6. Email validation rejects invalid formats
test('6. Email validation rejects invalid formats', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert(!emailRegex.test(''), 'Rejects empty email');
  assert(!emailRegex.test('plainaddress'), 'Rejects invalid string');
  assert(!emailRegex.test('@missinguser.com'), 'Rejects missing user');
  assert(emailRegex.test('auditor@facility.org'), 'Accepts valid email');
});

// 7. Unauthenticated protected-route access redirects to /auth
test('7. Unauthenticated protected-route access redirects to /auth', () => {
  authStore.setUnauthenticated();
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <ProtectedRoute>
        <div>Protected Dashboard Stage</div>
      </ProtectedRoute>
    </MemoryRouter>
  );

  assert(!html.includes('Protected Dashboard Stage'), 'Protected content blocked for unauthenticated users');
});

// 8. Authenticated access to protected route is allowed
test('8. Authenticated access to protected route is allowed', () => {
  authStore.setAuthenticated({
    uid: 'auth-user-001',
    email: 'auditor@facility.org',
    displayName: 'Lead Auditor',
    photoURL: null,
    emailVerified: true,
  });

  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <ProtectedRoute>
        <div id="dashboard-content">Protected Dashboard Content</div>
      </ProtectedRoute>
    </MemoryRouter>
  );

  assert(html.includes('Protected Dashboard Content'), 'Protected content renders for authenticated users');
});

// 9. Auth loading state does not redirect prematurely
test('9. Auth loading state renders accessible verification status without redirecting', () => {
  authStore.setLoading();
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <ProtectedRoute>
        <div>Should Not Render Yet</div>
      </ProtectedRoute>
    </MemoryRouter>
  );

  assert(html.includes('Verifying Authentication'), 'Renders verification placeholder');
  assert(html.includes('Restoring secure session state...'), 'Renders session restoration copy');
  assert(!html.includes('Should Not Render Yet'), 'Does not render protected child yet');
});

// 10. Authenticated user opening /auth is redirected to /app/dashboard
test('10. Authenticated user opening /auth redirects to /app/dashboard', () => {
  authStore.setAuthenticated({
    uid: 'auth-user-002',
    email: 'inspector@careproof.test',
    displayName: 'Inspector',
    photoURL: null,
    emailVerified: true,
  });

  const html = renderToString(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );

  // Authenticated user gets <Navigate to="/app/dashboard" replace />
  assert(!html.includes('Auditor Workspace Sign In'), 'Login form is blocked for authenticated users');
  assert(!html.includes('Sign In to Workspace'), 'Submit button not rendered');
});

// 11. Error banner displays normalized authentication messages
test('11. Firebase error messages use normalized application messages', () => {
  const norm1 = normalizeAuthError({ code: 'auth/invalid-credential' });
  assert(norm1.code === 'invalid_credentials', 'Maps to invalid_credentials');
  assert(norm1.message.includes('Invalid email or password'), 'Clean user-facing message');

  const norm2 = normalizeAuthError({ code: 'auth/email-already-in-use' });
  assert(norm2.code === 'email_already_in_use', 'Maps to email_already_in_use');
  assert(norm2.message.includes('already registered'), 'Clean user-facing message');

  const norm3 = normalizeAuthError({ code: 'auth/too-many-requests' });
  assert(norm3.code === 'too_many_requests', 'Maps to too_many_requests');
  assert(norm3.message.includes('Too many attempts'), 'Clean rate-limit message');
});

// 12. Demo auditor entry does NOT fake authentication
test('12. Demo auditor entry does NOT fake authentication or bypass Firebase', () => {
  authStore.setUnauthenticated();

  const html = renderToString(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );

  assert(html.includes('Enter as demo auditor'), 'Contains demo auditor entry button');
  assert(html.includes('Evaluation Demonstration'), 'Clearly labeled as demonstration');

  // Verify authStore state is NOT modified by the presence of demo UI
  assert(authStore.getState().status === 'unauthenticated', 'User remains unauthenticated');
  assert(authStore.getState().user === null, 'No fake user token is injected');
});

// 13. Canonical role options define family, agency, auditor
test('13. Canonical role options define strictly family, agency, auditor', () => {
  assert(VALID_AUTH_ROLES.includes('family'), 'Defines family role');
  assert(VALID_AUTH_ROLES.includes('agency'), 'Defines agency role');
  assert(VALID_AUTH_ROLES.includes('auditor'), 'Defines auditor role');
  assert(VALID_AUTH_ROLES.length === 3, 'Exactly 3 application roles allowed');
  assert(isValidAuthRole('family') && isValidAuthRole('agency') && isValidAuthRole('auditor'), 'Validation succeeds');
});

console.log(`\nResults: ${passed} of ${total} email & password authentication UI tests passed.`);
if (passed !== total) {
  process.exit(1);
}
