/**
 * CareProof Audit Console - Firestore Error Handler
 * Formats errors to JSON string adhering to FirestoreErrorInfo schema.
 */

import { Auth } from 'firebase/auth';
import { FirestoreErrorInfo, OperationType } from '../types/firebase';

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
  auth?: Auth | null
): never {
  const currentUser = auth?.currentUser;

  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: currentUser?.uid ?? null,
      email: currentUser?.email ?? null,
      emailVerified: currentUser?.emailVerified ?? null,
      isAnonymous: currentUser?.isAnonymous ?? null,
      tenantId: currentUser?.tenantId ?? null,
      providerInfo:
        currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) ?? [],
    },
  };

  const serialized = JSON.stringify(errInfo);
  console.error('Firestore Error:', serialized);
  throw new Error(serialized);
}
