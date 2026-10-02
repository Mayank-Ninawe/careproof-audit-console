/**
 * CareProof Audit Console - Authentication Domain Types
 * Single Source of Truth for Auth State, Roles, and Normalized Errors
 */

/**
 * Roadmap canonical user roles.
 * Client-side roles represent UI context only and do NOT serve as authorization security boundaries.
 */
export type AuthRole = 'family' | 'agency' | 'auditor';

export const VALID_AUTH_ROLES: readonly AuthRole[] = ['family', 'agency', 'auditor'] as const;

/**
 * Type guard for validating application roles.
 */
export function isValidAuthRole(role: unknown): role is AuthRole {
  return typeof role === 'string' && VALID_AUTH_ROLES.includes(role as AuthRole);
}

/**
 * Clean application domain representation of an authenticated Firebase user.
 * Exposes only necessary fields without extraneous PII or credentials.
 */
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

/**
 * Application-level authentication status.
 */
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Normalized application authentication error categories.
 */
export type AuthErrorCode =
  | 'invalid_credentials'
  | 'email_already_in_use'
  | 'weak_password'
  | 'network_error'
  | 'too_many_requests'
  | 'unknown_auth_error';

/**
 * Structured application-level authentication error.
 */
export interface NormalizedAuthError {
  code: AuthErrorCode;
  message: string;
  rawCode?: string;
  originalError?: unknown;
}
