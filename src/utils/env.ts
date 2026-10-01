/**
 * CareProof Audit Console - Environment Utilities
 */

export function isProduction(): boolean {
  return import.meta.env.PROD;
}

export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

export function getAppEnvironment(): string {
  return import.meta.env.MODE || 'development';
}
