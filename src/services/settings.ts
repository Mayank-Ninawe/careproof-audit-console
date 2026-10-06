/**
 * CareProof Audit Console - Settings Service & Export Foundation
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * CORE CONTRACT:
 * 1. Pure & safe localStorage adapters for UI density, units, and local organization.
 * 2. Deterministic JSON audit exporter without credentials or tokens.
 * 3. Safe client-side demo data purge mechanism.
 * 4. Zero Firebase dependencies or backend assumptions.
 */

import { CANONICAL_STANDARD } from '../data/standard';
import { getDefaultDashboardViewModel } from './dashboard';
import { AuthRole, AuthUser } from '../types/auth';
import { UserProfile } from '../types/userProfile';
import {
  AuditExportPayload,
  DemoDataPurgeResult,
  SettingsPreferences,
} from '../types/settings';

export const SETTINGS_STORAGE_KEY = 'careproof_settings_preferences';
export const DEMO_DATA_KEYS: readonly string[] = [
  'careproof_settings_preferences',
  'careproof_demo_incident_drafts',
  'careproof_demo_observations',
] as const;

export const DEFAULT_SETTINGS: SettingsPreferences = {
  density: 'comfortable',
  units: 'metric',
  organizationName: '',
};

/**
 * Retrieves stored user settings preferences from localStorage safely.
 */
export function getSettingsPreferences(): SettingsPreferences {
  if (typeof localStorage === 'undefined') {
    return { ...DEFAULT_SETTINGS };
  }

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<SettingsPreferences>;
    return {
      density: parsed.density === 'compact' ? 'compact' : 'comfortable',
      units: parsed.units === 'imperial' ? 'imperial' : 'metric',
      organizationName: typeof parsed.organizationName === 'string' ? parsed.organizationName : '',
    };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/**
 * Saves user settings preferences to localStorage safely.
 */
export function saveSettingsPreferences(prefs: SettingsPreferences): boolean {
  if (typeof localStorage === 'undefined') {
    return false;
  }

  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

/**
 * Purges demo session data, local drafts, and settings overrides from localStorage.
 * Does NOT touch authenticated user account, Firebase credentials, or canonical standard.
 */
export function purgeDemoData(): DemoDataPurgeResult {
  const purged: string[] = [];

  if (typeof localStorage !== 'undefined') {
    for (const key of DEMO_DATA_KEYS) {
      try {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
          purged.push(key);
        }
      } catch {
        // Safe skip on storage exception
      }
    }
  }

  return {
    purgedKeys: purged,
    timestamp: new Date().toISOString(),
    success: true,
    message: 'Local demonstration preferences and cached session data have been cleared.',
  };
}

/**
 * Constructs a sanitized, structured JSON export package of current audit and standard state.
 * Strictly guarantees zero passwords, auth tokens, session tokens, or private credentials.
 */
export function generateAuditExportPayload(
  user: AuthUser | null,
  profile: UserProfile | null,
  preferences: SettingsPreferences,
  referenceDate: string = new Date().toISOString()
): AuditExportPayload {
  const dashboardVm = getDefaultDashboardViewModel(42);

  return {
    exportMetadata: {
      application: 'CareProof Audit Console',
      version: CANONICAL_STANDARD.version,
      exportedAt: referenceDate,
      datasetType: 'SIMULATED',
      isSimulated: true,
      exportType: 'full_audit_configuration',
    },
    standard: {
      version: CANONICAL_STANDARD.version,
      name: CANONICAL_STANDARD.name,
      effectiveDate: CANONICAL_STANDARD.effectiveDate,
      pillarCount: CANONICAL_STANDARD.pillars.length,
      indicatorCount: CANONICAL_STANDARD.indicators.length,
      pillars: CANONICAL_STANDARD.pillars.map((p) => ({
        id: p.id,
        name: p.name,
        weight: p.weight,
      })),
    },
    auditSummary: {
      overallScore: dashboardVm.summary.overallScore,
      finalTier: dashboardVm.summary.finalTier,
      coverage: dashboardVm.summary.coverage,
      safetyGateTriggered: dashboardVm.summary.safetyGateTriggered,
      safetyGateIndicators: dashboardVm.summary.safetyGateIndicators,
    },
    userContext: {
      role: (profile?.role || 'auditor') as AuthRole,
      organization: preferences.organizationName || profile?.organizationName || 'Not specified',
      displayName: profile?.displayName || user?.displayName || 'Not provided',
      isSimulatedUser: !user,
    },
    preferences: {
      density: preferences.density,
      units: preferences.units,
    },
    disclaimer:
      'Proposed framework, not clinically validated. Decision support, not diagnosis. Demonstration audit export only; not a legal medical record.',
  };
}

/**
 * Triggers a browser file download of a JSON object.
 * Safe in Node/testing environments.
 */
export function downloadJsonFile(payload: unknown, filename: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  const jsonString = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
