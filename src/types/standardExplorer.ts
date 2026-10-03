/**
 * CareProof Audit Console - Standard Explorer Domain Types
 * Source of Truth: CareProof Website Roadmap & Canonical Standard Model (Phase 7A)
 * 
 * Strict architectural boundaries:
 * - Pure data, query, and export representation.
 * - Decoupled from React, Firebase, DOM, and browser storage APIs.
 * - Single source of truth: src/data/standard.json via CANONICAL_STANDARD.
 * - Zero fabricated medical rationales or invented citations.
 */

import { EvidenceType, Indicator, Pillar, Reference, ThresholdBand } from './standard';

/**
 * Filter parameters for querying canonical standard indicators.
 */
export interface StandardExplorerFilters {
  searchQuery?: string;
  pillarId?: string;
  evidenceType?: EvidenceType | string;
  criticalOnly?: boolean;
}

/**
 * Flat, tabular projection of an indicator tailored for the Standard Explorer table.
 */
export interface StandardExplorerRow {
  id: string;
  pillarId: string;
  pillarName: string;
  name: string;
  definition: string;
  dataSource: string;
  bands: ThresholdBand[];
  weight: number;
  evidence: EvidenceType;
  refs: Reference[];
  critical: boolean;
}

/**
 * Result structure returned by query and filtering operations.
 */
export interface StandardExplorerResult {
  rows: StandardExplorerRow[];
  totalCount: number;
  filteredCount: number;
  activeFilters: StandardExplorerFilters;
}

/**
 * Comprehensive indicator detail model for the future detail drawer (Phase 7B).
 * Strictly preserves absence of rationale/formula when not in source data.
 */
export interface StandardIndicatorDetail {
  indicator: Indicator;
  pillar: Pillar;
  bands: ThresholdBand[];
  refs: Reference[];
  evidence: EvidenceType;
  critical: boolean;
  formula: string | null;
  rationale: string | null;
}
