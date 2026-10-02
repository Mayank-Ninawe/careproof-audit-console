/**
 * CareProof Audit Console - Dashboard Data Integration Adapter
 * Source of Truth: CareProof Website Roadmap (Phase 6A)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. SIMULATED DATA -> ASSESSMENT INPUTS -> SCORING ENGINE -> DASHBOARD VIEW MODEL -> Dashboard UI.
 * 2. Pure & Side-Effect Free: Decoupled from React, Firebase, DOM, and browser storage APIs.
 * 3. Zero Independent Calculations: Reuses already-computed AuditScoringResult from the scoring engine.
 * 4. Deterministic Ordering: Tie-breakers for Fix-First and Recent Events are strictly deterministic.
 * 5. Simulation Transparency: Always tags output as `datasetType: 'SIMULATED'`.
 * 6. Governance Disclosure: "Proposed framework, not clinically validated. Decision support, not diagnosis."
 */

import { Standard, Pillar } from '../types/standard';
import { AuditScoringResult, ScoringConfig } from '../types/scoring';
import { SimulatedDataset, SimulationConfig } from '../types/simulation';
import {
  DashboardPillar,
  DashboardSummary,
  DashboardViewModel,
  FixFirstItem,
  RecentEvent,
} from '../types/dashboard';
import { computeAuditScore, roundToDecimals } from '../engine/scoring';
import { generateSimulatedDataset } from '../engine/simulate';
import { CANONICAL_STANDARD } from '../data/standard';

export interface DashboardAdapterInput {
  standard?: Standard;
  dataset: SimulatedDataset;
  scoringResult?: AuditScoringResult;
  config?: ScoringConfig;
  maxRecentEvents?: number;
}

const DASHBOARD_DISCLAIMER =
  'Proposed framework, not clinically validated. Decision support, not diagnosis.';

/**
 * Projects the scoring engine's AuditScoringResult into the DashboardSummary view model.
 * Does not re-evaluate or recalculate any scores.
 */
export function deriveDashboardSummary(scoringResult: AuditScoringResult): DashboardSummary {
  return {
    overallScore: scoringResult.overallScore,
    calculatedTier: scoringResult.calculatedTier,
    finalTier: scoringResult.finalTier,
    coverage: scoringResult.coverage,
    safetyGateTriggered: scoringResult.safetyGateTriggered,
    safetyGateIndicators: [...scoringResult.safetyGateIndicators],
    coverageGatePassed: scoringResult.coverageGatePassed,
    statusReason: scoringResult.coverageReason,
    isSimulated: true,
  };
}

/**
 * Derives the roadmap's "Fix first" prioritized action list.
 * 
 * Open Issue Definition:
 * - Only indicators scoring 'Partial' or 'Fails' are considered open issues.
 * - 'Meets' indicates full compliance (gap = 0, excluded).
 * - 'not_assessed' reflects missing observations, not confirmed failures.
 * 
 * Prioritization Formula:
 * - gap = 100 - indicatorScore
 * - priorityValue = indicatorWeight × gap
 * 
 * Deterministic Sorting:
 * 1. priorityValue descending
 * 2. critical indicators first
 * 3. higher gap descending
 * 4. stable indicatorId ascending
 */
export function deriveFixFirstList(scoringResult: AuditScoringResult): FixFirstItem[] {
  const issues: FixFirstItem[] = [];

  for (const indicatorId of Object.keys(scoringResult.indicatorResults)) {
    const res = scoringResult.indicatorResults[indicatorId];
    if (!res || res.status !== 'assessed' || !res.band) {
      continue;
    }

    // Only 'Partial' and 'Fails' constitute actionable open issues
    if (res.band !== 'Partial' && res.band !== 'Fails') {
      continue;
    }

    const score = res.score ?? 0;
    const gap = 100 - score;
    const priorityValue = roundToDecimals(res.weight * gap, 2);

    let reason: string;
    if (res.critical && res.band === 'Fails') {
      reason = 'Critical life-safety indicator non-compliant (Trips Safety Gate)';
    } else if (res.critical) {
      reason = 'Critical life-safety indicator partially met';
    } else if (res.band === 'Fails') {
      reason = 'Standard indicator non-compliant (0% evaluated)';
    } else {
      reason = 'Standard indicator partially met (50% evaluated)';
    }

    issues.push({
      indicatorId: res.indicatorId,
      pillarId: res.pillarId,
      indicatorName: res.name,
      score,
      gap,
      weight: res.weight,
      priorityValue,
      status: res.status,
      band: res.band,
      critical: res.critical,
      reason,
    });
  }

  // Deterministic sorting with 4-level tie-breaker
  issues.sort((a, b) => {
    // 1. Priority value descending
    if (b.priorityValue !== a.priorityValue) {
      return b.priorityValue - a.priorityValue;
    }
    // 2. Critical indicators first
    if (a.critical !== b.critical) {
      return a.critical ? -1 : 1;
    }
    // 3. Higher gap descending
    if (b.gap !== a.gap) {
      return b.gap - a.gap;
    }
    // 4. Stable indicator ID ascending
    return a.indicatorId.localeCompare(b.indicatorId);
  });

  return issues;
}

/**
 * Projects pillar scoring results into DashboardPillar view models.
 * Preserves explicit null for unassessed pillars (never converts null to 0).
 */
export function deriveDashboardPillars(
  pillars: readonly Pillar[],
  scoringResult: AuditScoringResult,
  fixFirstList: FixFirstItem[]
): DashboardPillar[] {
  // Sort pillars by canonical ordering
  const sortedPillars = [...pillars].sort((a, b) => a.ordering - b.ordering);

  return sortedPillars.map((p) => {
    const pResult = scoringResult.pillarResults[p.id];
    const pillarIssues = fixFirstList.filter((item) => item.pillarId === p.id).length;

    return {
      pillarId: p.id,
      name: p.name,
      score: pResult ? pResult.score : null,
      weight: p.weight,
      status: pResult ? pResult.status : 'not_assessed',
      assessedIndicatorCount: pResult ? pResult.assessedIndicatorCount : 0,
      totalIndicatorCount: pResult ? pResult.totalIndicatorCount : 0,
      openIssueCount: pillarIssues,
    };
  });
}

/**
 * Derives recent operational audit events from synthetic datasets.
 * Includes equipment maintenance, caregiver competency expiries, and observation timing gaps.
 * Sorts deterministically by timestamp descending, tie-breaking by ID.
 */
export function deriveRecentEvents(
  dataset: SimulatedDataset,
  maxEvents = 10
): RecentEvent[] {
  const events: RecentEvent[] = [];

  // 1. Equipment maintenance events
  for (const dev of dataset.devices) {
    if (dev.lifecycleStage === 'maintenance_due' || dev.status === 'alerting' || dev.status === 'offline') {
      events.push({
        id: `evt-dev-${dev.id}`,
        type: 'equipment_due',
        title: `Simulated Maintenance Due: ${dev.deviceType} (${dev.id})`,
        timestamp: dev.nextMaintenance,
        severity: dev.lifecycleStage === 'maintenance_due' ? 'warning' : 'info',
        sourceId: dev.id,
        isSimulated: true,
      });
    }
  }

  // 2. Caregiver competency status events
  for (const cg of dataset.caregivers) {
    if (cg.assessmentStatus === 'expired' || cg.assessmentStatus === 'pending_renewal') {
      events.push({
        id: `evt-cg-${cg.id}`,
        type: 'competency_expiry',
        title: `Simulated Competency Status: ${cg.roleId} (${cg.id})`,
        timestamp: cg.licenseExpires,
        severity: cg.assessmentStatus === 'expired' ? 'warning' : 'info',
        sourceId: cg.id,
        isSimulated: true,
      });
    }
  }

  // 3. Telemetry timing gap events
  for (const obs of dataset.observations) {
    if (obs.hasTimingGap) {
      events.push({
        id: `evt-obs-gap-${obs.id}`,
        type: 'data_gap',
        title: `Simulated Telemetry Interval Irregularity (${obs.patientId})`,
        timestamp: obs.timestamp,
        severity: 'warning',
        sourceId: obs.id,
        isSimulated: true,
      });
    }
  }

  // Deterministic sorting: timestamp descending, tie-break by ID ascending
  events.sort((a, b) => {
    const timeComparison = b.timestamp.localeCompare(a.timestamp);
    if (timeComparison !== 0) {
      return timeComparison;
    }
    return a.id.localeCompare(b.id);
  });

  return events.slice(0, maxEvents);
}

/**
 * Master dashboard data adapter.
 * Produces a complete, decoupled DashboardViewModel from domain entities.
 */
export function createDashboardViewModel(input: DashboardAdapterInput): DashboardViewModel {
  const standard = input.standard ?? CANONICAL_STANDARD;
  const dataset = input.dataset;

  // Reuse provided scoring result or invoke pure scoring engine
  const scoringResult =
    input.scoringResult ??
    computeAuditScore(
      standard.indicators,
      standard.pillars,
      dataset.simulatedAuditAssessments,
      input.config
    );

  const summary = deriveDashboardSummary(scoringResult);
  const fixFirstList = deriveFixFirstList(scoringResult);
  const pillars = deriveDashboardPillars(standard.pillars, scoringResult, fixFirstList);
  const recentEvents = deriveRecentEvents(dataset, input.maxRecentEvents);

  return {
    datasetType: 'SIMULATED',
    generatedAt: dataset.generatedAt,
    seed: dataset.seed,
    summary,
    pillars,
    fixFirstList,
    recentEvents,
    openIssueCount: fixFirstList.length,
    disclaimer: DASHBOARD_DISCLAIMER,
  };
}

/**
 * Convenience factory to produce a default deterministic Dashboard view model.
 * Ideal for UI rendering in Phase 6B.
 */
export function getDefaultDashboardViewModel(
  seed = 42,
  config?: SimulationConfig
): DashboardViewModel {
  const dataset = generateSimulatedDataset(seed, config);
  return createDashboardViewModel({ dataset });
}
