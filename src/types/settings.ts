/**
 * CareProof Audit Console - Settings & Profile Domain Types
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * Strict boundary:
 * - Local presentation preferences and export schemas only.
 * - Zero secrets, tokens, or credential fields.
 */

import { AuthRole } from './auth';

export type UiDensity = 'comfortable' | 'compact';
export type UnitSystem = 'metric' | 'imperial';

export interface SettingsPreferences {
  density: UiDensity;
  units: UnitSystem;
  organizationName: string;
}

export interface AuditExportPayload {
  exportMetadata: {
    application: string;
    version: string;
    exportedAt: string;
    datasetType: 'SIMULATED';
    isSimulated: true;
    exportType: string;
  };
  standard: {
    version: string;
    name: string;
    effectiveDate: string;
    pillarCount: number;
    indicatorCount: number;
    pillars: readonly {
      id: string;
      name: string;
      weight: number;
    }[];
  };
  auditSummary: {
    overallScore: number | null;
    finalTier: string | null;
    coverage: number | null;
    safetyGateTriggered: boolean;
    safetyGateIndicators: readonly string[];
  };
  userContext: {
    role: AuthRole;
    organization: string;
    displayName: string;
    isSimulatedUser: boolean;
  };
  preferences: {
    density: UiDensity;
    units: UnitSystem;
  };
  disclaimer: string;
}

export interface DemoDataPurgeResult {
  purgedKeys: readonly string[];
  timestamp: string;
  success: boolean;
  message: string;
}
