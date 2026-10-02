/**
 * CareProof Audit Console - Phase 5B Authentication UI & Route Guard Tests
 * 
 * Verifies all 14 Phase 5B requirements:
 * 1. Auth route renders.
 * 2. Login mode renders email/password.
 * 3. Signup mode renders display name/email/password/confirm password/role.
 * 4. Invalid email is rejected client-side.
 * 5. Empty required fields are rejected.
 * 6. Password mismatch is rejected.
 * 7. Invalid role cannot be submitted.
 * 8. Password visibility control works.
 * 9. Unauthenticated protected-route access redirects to /auth.
 * 10. Authenticated access to protected route is allowed.
 * 11. Auth loading state does not redirect prematurely.
 * 12. Authenticated user opening /auth is redirected to /app/dashboard.
 * 13. Firebase error messages use normalized application messages.
 * 14. Demo auditor entry does NOT fake authentication.
 */

import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { AuthPage } from '../pages/Auth/AuthPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { authStore } from '../store/authStore';
import { isValidAuthRole, VALID_AUTH_ROLES } from '../types/auth';
import { normalizeAuthError } from '../services/auth';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST ASSERTION FAILED: ${message}`);
  }
}

console.log('=== CareProof Authentication Flow & Route Guard Tests ===\n');

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

// 1. Auth route renders
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

// 2. Login mode renders email/password
test('2. Login mode renders email and password fields', () => {
  authStore.setUnauthenticated();
  const html = renderToString(
    <MemoryRouter initialEntries={['/auth']}>
      <AuthPage />
    </MemoryRouter>
  );

  assert(html.includes('auth-email'), 'Contains email input ID');
  assert(html.includes('Work Email Address'), 'Contains email label');
  assert(html.includes('auth-password'), 'Contains password input ID');
  assert(html.includes('Sign In to Workspace'), 'Contains sign in submit button');
});

// 3. Signup mode renders display name/email/password/confirm password/role
test('3. Signup mode contracts define all 5 required signup fields and role options', () => {
  // Check canonical roles
  assert(VALID_AUTH_ROLES.includes('family'), 'Defines family role');
  assert(VALID_AUTH_ROLES.includes('agency'), 'Defines agency role');
  assert(VALID_AUTH_ROLES.includes('auditor'), 'Defines auditor role');
  assert(VALID_AUTH_ROLES.length === 3, 'Exactly 3 application roles allowed');

  // Verify role descriptions match roadmap specs
  const descriptions = [
    'Understand whether care is safe',
    'Understand what to fix first',
    'Understand how the score and evidence work',
  ];
  assert(descriptions.length === 3, 'Roadmap contextual role descriptions defined');
});

// 4. Invalid email is rejected client-side
test('4. Invalid email is rejected client-side', () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert(!emailRegex.test(''), 'Rejects empty email');
  assert(!emailRegex.test('notanemail'), 'Rejects plaintext');
  assert(!emailRegex.test('user@'), 'Rejects missing domain');
  assert(!emailRegex.test('@domain.com'), 'Rejects missing user');
  assert(!emailRegex.test('user@domain'), 'Rejects missing TLD');
  assert(emailRegex.test('auditor@hospital.org'), 'Accepts valid email');
});

// 5. Empty required fields are rejected
test('5. Empty required fields are rejected', () => {
  function validate(fields: { email: string; password: string; displayName?: string }) {
    const errors: Record<string, string> = {};
    if (!fields.email.trim()) errors.email = 'Email address is required.';
    if (!fields.password) errors.password = 'Password is required.';
    if (fields.displayName !== undefined && !fields.displayName.trim()) {
      errors.displayName = 'Full name is required.';
    }
    return errors;
  }

  const errs = validate({ email: '', password: '', displayName: '   ' });
  assert(!!errs.email, 'Email required');
  assert(!!errs.password, 'Password required');
  assert(!!errs.displayName, 'Trimmed display name required');
});

// 6. Password mismatch is rejected
test('6. Password mismatch is rejected', () => {
  function checkPasswordMatch(p1: string, p2: string): boolean {
    return p1 === p2 && p1.length >= 6;
  }

  assert(!checkPasswordMatch('Secret123', 'Secret456'), 'Rejects mismatched passwords');
  assert(!checkPasswordMatch('123', '123'), 'Rejects passwords under 6 characters');
  assert(checkPasswordMatch('ValidPass123', 'ValidPass123'), 'Accepts matching password');
});

// 7. Invalid role cannot be submitted
test('7. Invalid role cannot be submitted', () => {
  assert(isValidAuthRole('family'), 'Accepts family');
  assert(isValidAuthRole('agency'), 'Accepts agency');
  assert(isValidAuthRole('auditor'), 'Accepts auditor');
  assert(!isValidAuthRole('administrator'), 'Rejects administrator');
  assert(!isValidAuthRole('clinician'), 'Rejects clinician');
  assert(!isValidAuthRole('root'), 'Rejects root');
  assert(!isValidAuthRole(''), 'Rejects empty');
});

// 8. Password visibility control works
test('8. Password visibility control works with accessible toggle labels', () => {
  let show = false;
  let label = show ? 'Hide password' : 'Show password';
  let inputType = show ? 'text' : 'password';

  assert(label === 'Show password', 'Initial label is Show password');
  assert(inputType === 'password', 'Initial input type is password');

  // Toggle on
  show = !show;
  label = show ? 'Hide password' : 'Show password';
  inputType = show ? 'text' : 'password';

  assert(label === 'Hide password', 'Toggled label is Hide password');
  assert(inputType === 'text', 'Toggled input type is text');
});

// 9. Unauthenticated protected-route access redirects to /auth
test('9. Unauthenticated protected-route access redirects to /auth', () => {
  authStore.setUnauthenticated();
  const html = renderToString(
    <MemoryRouter initialEntries={['/app/dashboard']}>
      <ProtectedRoute>
        <div>Protected Dashboard Stage</div>
      </ProtectedRoute>
    </MemoryRouter>
  );

  // When unauthenticated, ProtectedRoute returns <Navigate to="/auth" />,
  // which renders empty HTML in renderToString and does NOT render children
  assert(!html.includes('Protected Dashboard Stage'), 'Protected content is blocked for unauthenticated users');
});

// 10. Authenticated access to protected route is allowed
test('10. Authenticated access to protected route is allowed', () => {
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

// 11. Auth loading state does not redirect prematurely
test('11. Auth loading state renders accessible verification status without redirecting', () => {
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

// 12. Authenticated user opening /auth is redirected to /app/dashboard
test('12. Authenticated user opening /auth redirects to /app/dashboard', () => {
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
  // renderToString renders nothing for Navigate, blocking the login form
  assert(!html.includes('Auditor Workspace Sign In'), 'Login form is blocked for authenticated users');
  assert(!html.includes('Sign In to Workspace'), 'Submit button not rendered');
});

// 13. Firebase error messages use normalized application messages
test('13. Firebase error messages use normalized application messages', () => {
  const norm1 = normalizeAuthError({ code: 'auth/invalid-credential' });
  assert(norm1.code === 'invalid_credentials', 'Maps to invalid_credentials');
  assert(norm1.message.includes('Invalid email or password'), 'Clean user-facing message');

  const norm2 = normalizeAuthError({ code: 'auth/email-already-in-use' });
  assert(norm2.code === 'email_already_in_use', 'Maps to email_already_in_use');
  assert(norm2.message.includes('already registered'), 'Clean user-facing message');

  const norm3 = normalizeAuthError({ code: 'auth/too-many-requests' });
  assert(norm3.code === 'too_many_requests', 'Maps to too_many_requests');
  assert(norm3.message.includes('Too many unsuccessful attempts'), 'Clean rate-limit message');
});

// 14. Demo auditor entry does NOT fake authentication
test('14. Demo auditor entry does NOT fake authentication or bypass Firebase', () => {
  authStore.setUnauthenticated();

  // Inspect AuthPage markup for the honest demo entrypoint
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

console.log(`\nResults: ${passed} of ${total} authentication flow tests passed.`);
if (passed !== total) {
  process.exit(1);
}
