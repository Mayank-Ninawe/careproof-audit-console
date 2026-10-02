/**
 * CareProof Audit Console - Dashboard Domain & View Model Types
 * Source of Truth: CareProof Website Roadmap (Phase 6A)
 * 
 * Strict architectural boundaries:
 * - Pure data projection layer.
 * - Decoupled from React, Firebase, and UI components.
 * - Explicitly tagged as SIMULATED dataset.
 * - Proposed quality governance framework; decision support, not diagnosis.
 */

import { AssessmentStatus } from './standard';
import { DiscreteBand, TierName } from './scoring';

/**
 * Top-level audit scoring summary for dashboard display.
 * Derived directly from the deterministic scoring engine.
 */
export interface DashboardSummary {
  overallScore: number | null;
  calculatedTier: TierName | null;
  finalTier: TierName | null;
  coverage: number;
  safetyGateTriggered: boolean;
  safetyGateIndicators: string[];
  coverageGatePassed: boolean;
  statusReason?: string;
  isSimulated: true;
}

/**
 * Pillar-level aggregation model for dashboard rendering.
 */
export interface DashboardPillar {
  pillarId: string;
  name: string;
  score: number | null; // Explicitly null if not assessed (never converted to 0)
  weight: number;
  status: AssessmentStatus;
  assessedIndicatorCount: number;
  totalIndicatorCount: number;
  openIssueCount: number;
}

/**
 * Prioritized action item based on the roadmap's "weight × gap" algorithm.
 */
export interface FixFirstItem {
  indicatorId: string;
  pillarId: string;
  indicatorName: string;
  score: number;
  gap: number;           // 100 - score
  weight: number;
  priorityValue: number; // weight × gap
  status: AssessmentStatus;
  band: DiscreteBand;
  critical: boolean;
  reason: string;
}

export type RecentEventType = 'equipment_due' | 'competency_expiry' | 'data_gap';
export type RecentEventSeverity = 'info' | 'warning' | 'critical';

/**
 * Audit event item for equipment, caregiver competency, or telemetry data gaps.
 */
export interface RecentEvent {
  id: string;
  type: RecentEventType;
  title: string;
  timestamp: string; // ISO 8601 deterministic timestamp
  severity: RecentEventSeverity;
  sourceId?: string;
  isSimulated: true;
}

/**
 * Complete, self-contained dashboard view model.
 */
export interface DashboardViewModel {
  datasetType: 'SIMULATED';
  generatedAt: string;
  seed: number;
  summary: DashboardSummary;
  pillars: DashboardPillar[];
  fixFirstList: FixFirstItem[];
  recentEvents: RecentEvent[];
  openIssueCount: number;
  disclaimer: string;
}
