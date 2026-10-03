/**
 * CareProof Audit Console - Standard Explorer Query & Export Module
 * Source of Truth: CareProof Website Roadmap & Canonical Standard (Phase 7A)
 * 
 * ARCHITECTURAL CONTRACT:
 * 1. Pure & Side-Effect Free: No React, no Firebase, no DOM, no localStorage.
 * 2. Deterministic: Same input always produces identical output.
 * 3. Canonical Integrity: Strictly consumes src/data/standard.json via CANONICAL_STANDARD.
 * 4. Zero Fabrication: No invented indicators, clinical rationales, or citations. Missing data remains empty/null.
 * 5. Clean Isolation: Exports contain standard data only (no credentials, auth tokens, or simulation telemetry).
 */

import { Standard, Pillar, Indicator, EvidenceType, ThresholdBand, Reference } from '../types/standard';
import {
  StandardExplorerFilters,
  StandardExplorerResult,
  StandardExplorerRow,
  StandardIndicatorDetail,
} from '../types/standardExplorer';
import { CANONICAL_STANDARD } from '../data/standard';

const VALID_EVIDENCE_TYPES: readonly EvidenceType[] = ['E', 'I', 'P'];

/**
 * Transforms canonical standard indicators into flat, tabular StandardExplorerRows.
 * Preserves deterministic ordering matching canonical pillar order and indicator source order.
 */
export function getStandardExplorerRows(standard: Standard = CANONICAL_STANDARD): StandardExplorerRow[] {
  const pillarMap = new Map<string, Pillar>();
  for (const pillar of standard.pillars) {
    pillarMap.set(pillar.id, pillar);
  }

  // Group by pillar ordering to guarantee deterministic canonical sequence
  const rows: StandardExplorerRow[] = standard.indicators.map((ind) => {
    const pillar = pillarMap.get(ind.pillarId);
    return {
      id: ind.id,
      pillarId: ind.pillarId,
      pillarName: pillar ? pillar.name : ind.pillarId,
      name: ind.name,
      definition: ind.definition,
      dataSource: ind.dataSource,
      bands: ind.bands || [],
      weight: ind.weight,
      evidence: ind.evidence,
      refs: ind.refs || [],
      critical: ind.critical,
    };
  });

  // Sort deterministically: pillar ordering first, then indicator ID
  return rows.sort((a, b) => {
    const pillarA = pillarMap.get(a.pillarId);
    const pillarB = pillarMap.get(b.pillarId);
    const orderA = pillarA ? pillarA.ordering : 999;
    const orderB = pillarB ? pillarB.ordering : 999;

    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.id.localeCompare(b.id);
  });
}

/**
 * Searches rows across canonical text fields (case-insensitive).
 * Empty or whitespace-only search returns rows unmodified.
 */
export function searchStandardIndicators(
  rows: readonly StandardExplorerRow[],
  query?: string
): StandardExplorerRow[] {
  if (!query || query.trim() === '') {
    return [...rows];
  }

  const q = query.trim().toLowerCase();

  return rows.filter((row) => {
    return (
      row.id.toLowerCase().includes(q) ||
      row.name.toLowerCase().includes(q) ||
      row.definition.toLowerCase().includes(q) ||
      row.dataSource.toLowerCase().includes(q) ||
      row.pillarId.toLowerCase().includes(q) ||
      row.pillarName.toLowerCase().includes(q)
    );
  });
}

/**
 * Filters rows using strict intersection (AND) of all active filter criteria.
 * Unknown pillar ID returns an empty result set (never falls back).
 */
export function filterStandardIndicators(
  rows: readonly StandardExplorerRow[],
  filters?: StandardExplorerFilters
): StandardExplorerResult {
  const normalizedFilters: StandardExplorerFilters = {
    searchQuery: filters?.searchQuery?.trim() || undefined,
    pillarId: filters?.pillarId?.trim() || undefined,
    evidenceType: filters?.evidenceType?.trim() || undefined,
    criticalOnly: filters?.criticalOnly === true ? true : undefined,
  };

  let filtered = [...rows];

  // 1. Text search across canonical fields
  if (normalizedFilters.searchQuery) {
    filtered = searchStandardIndicators(filtered, normalizedFilters.searchQuery);
  }

  // 2. Pillar ID filter
  if (normalizedFilters.pillarId) {
    const pid = normalizedFilters.pillarId;
    filtered = filtered.filter((r) => r.pillarId === pid);
  }

  // 3. Evidence classification filter ('E' | 'I' | 'P')
  if (normalizedFilters.evidenceType) {
    const ev = normalizedFilters.evidenceType;
    if (!VALID_EVIDENCE_TYPES.includes(ev as EvidenceType)) {
      // Invalid evidence classification produces 0 matches
      filtered = [];
    } else {
      filtered = filtered.filter((r) => r.evidence === ev);
    }
  }

  // 4. Critical indicators only filter
  if (normalizedFilters.criticalOnly) {
    filtered = filtered.filter((r) => r.critical === true);
  }

  return {
    rows: filtered,
    totalCount: rows.length,
    filteredCount: filtered.length,
    activeFilters: normalizedFilters,
  };
}

/**
 * Exact indicator detail lookup by indicator ID.
 * Returns null for unknown indicator ID.
 */
export function getIndicatorById(
  indicatorId: string,
  standard: Standard = CANONICAL_STANDARD
): StandardIndicatorDetail | null {
  if (!indicatorId || typeof indicatorId !== 'string') {
    return null;
  }

  const indicator = standard.indicators.find((ind) => ind.id === indicatorId);
  if (!indicator) {
    return null;
  }

  const pillar = standard.pillars.find((p) => p.id === indicator.pillarId);
  if (!pillar) {
    return null;
  }

  return {
    indicator,
    pillar,
    bands: indicator.bands || [],
    refs: indicator.refs || [],
    evidence: indicator.evidence,
    critical: indicator.critical,
    formula: null, // Preserved absence: no formula field in canonical standard
    rationale: indicator.guidance ?? null, // Guidance from canonical standard, preserved as-is
  };
}

/**
 * Pillar lookup returning canonical pillar metadata and its ordered indicators.
 * Returns null for unknown pillar ID.
 */
export function getIndicatorsByPillar(
  pillarId: string,
  standard: Standard = CANONICAL_STANDARD
): { pillar: Pillar; indicators: Indicator[] } | null {
  if (!pillarId || typeof pillarId !== 'string') {
    return null;
  }

  const pillar = standard.pillars.find((p) => p.id === pillarId);
  if (!pillar) {
    return null;
  }

  const indicators = standard.indicators.filter((ind) => ind.pillarId === pillarId);

  return {
    pillar,
    indicators,
  };
}

/**
 * Filter convenience: returns indicators matching an evidence classification ('E' | 'I' | 'P').
 */
export function getIndicatorsByEvidence(
  evidenceType: EvidenceType,
  standard: Standard = CANONICAL_STANDARD
): StandardExplorerRow[] {
  const rows = getStandardExplorerRows(standard);
  return rows.filter((r) => r.evidence === evidenceType);
}

/**
 * Filter convenience: returns critical life-safety indicators.
 */
export function getCriticalIndicators(
  standard: Standard = CANONICAL_STANDARD
): StandardExplorerRow[] {
  const rows = getStandardExplorerRows(standard);
  return rows.filter((r) => r.critical === true);
}

/**
 * Escapes a single CSV value following RFC 4180 standards.
 * Wraps values with commas, double quotes, or newlines in quotes and escapes internal quotes.
 */
export function escapeCsvField(val: unknown): string {
  if (val === null || val === undefined) {
    return '';
  }
  const str = String(val);
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Exports Standard Explorer data as formatted, human-readable JSON string.
 * Strictly isolates standard specification from auth tokens, credentials, and telemetry.
 */
export function exportStandardAsJson(
  data: readonly StandardExplorerRow[] | StandardExplorerResult,
  standard: Standard = CANONICAL_STANDARD
): string {
  const rows: readonly StandardExplorerRow[] = 'rows' in data ? data.rows : data;

  const exportPayload = {
    standardName: standard.name,
    standardVersion: standard.version,
    effectiveDate: standard.effectiveDate,
    disclaimer: 'Proposed framework, not clinically validated. Decision support, not diagnosis.',
    totalIndicators: rows.length,
    indicators: rows.map((r: StandardExplorerRow) => ({
      id: r.id,
      pillarId: r.pillarId,
      pillarName: r.pillarName,
      name: r.name,
      definition: r.definition,
      dataSource: r.dataSource,
      weight: r.weight,
      critical: r.critical,
      evidence: r.evidence,
      bands: r.bands.map((b: ThresholdBand) => ({
        level: b.level,
        threshold: b.threshold,
        description: b.description,
      })),
      references: r.refs.map((ref: Reference) => ({
        id: ref.id,
        title: ref.title,
        citation: ref.citation,
      })),
    })),
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Exports Standard Explorer rows as RFC 4180-compliant CSV string.
 * Properly escapes commas, quotes, and newlines.
 */
export function exportStandardAsCsv(rows: readonly StandardExplorerRow[]): string {
  const headers = [
    'ID',
    'Pillar ID',
    'Pillar',
    'Name',
    'Definition',
    'Data Source',
    'Weight',
    'Critical',
    'Evidence',
    'Threshold Bands',
    'References',
  ];

  const lines: string[] = [headers.map(escapeCsvField).join(',')];

  for (const row of rows) {
    const bandsSerialized = row.bands
      .map((b) => `${b.level}: ${b.description || (b.threshold !== undefined ? `>=${b.threshold}` : '')}`)
      .join('; ');

    const refsSerialized = row.refs
      .map((r) => (r.citation ? `${r.title} (${r.citation})` : r.title))
      .join('; ');

    const fields = [
      row.id,
      row.pillarId,
      row.pillarName,
      row.name,
      row.definition,
      row.dataSource,
      row.weight,
      row.critical ? 'TRUE' : 'FALSE',
      row.evidence,
      bandsSerialized,
      refsSerialized,
    ];

    lines.push(fields.map(escapeCsvField).join(','));
  }

  return lines.join('\r\n');
}

export const createStandardJsonExport = exportStandardAsJson;
export const createStandardCsvExport = exportStandardAsCsv;
