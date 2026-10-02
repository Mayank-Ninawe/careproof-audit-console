/**
 * CareProof Audit Console - User Profile Domain Types
 * Minimal profile model for future Firestore persistence.
 * 
 * Strict boundary:
 * - Stores minimal application context (role, organization).
 * - No medical, patient, or credential data.
 * - Client-side roles represent UI intent only and do not bypass backend security rules.
 */

import { AuthRole } from './auth';

export interface UserProfile {
  uid: string;
  role: AuthRole;
  displayName?: string | null;
  organizationName?: string | null;
  createdAt: string; // ISO 8601 deterministic timestamp
  updatedAt: string; // ISO 8601 deterministic timestamp
}
