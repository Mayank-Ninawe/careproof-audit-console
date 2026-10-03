/**
 * CareProof Audit Console - Production Standard Explorer Interface
 * Source of Truth: CareProof Website Roadmap (Phase 7B)
 * 
 * CORE CONTRACT:
 * - Consumes canonical standard via the Standard Explorer query/export layer.
 * - Does not duplicate standard.json parsing or filtering logic.
 * - Displays:
 *   1. Page header with audit metadata.
 *   2. Left pillar navigation (canonical 5 pillars + All).
 *   3. Filter toolbar with search, evidence types, critical filter, and export actions.
 *   4. Main indicator ledger table with IBM Plex Mono IDs and status badges.
 *   5. Accessible indicator detail drawer for inspecting full specifications.
 *   6. Real JSON and CSV browser export actions respecting current filters.
 */

import React, { useState, useMemo } from 'react';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusIndicator } from '../../components/ui/StatusIndicator';
import {
  PillarNav,
  StandardToolbar,
  IndicatorTable,
  IndicatorDrawer,
} from '../../components/standard';
import { CANONICAL_STANDARD } from '../../data/standard';
import {
  getStandardExplorerRows,
  filterStandardIndicators,
  getIndicatorById,
  exportStandardAsJson,
  exportStandardAsCsv,
} from '../../services/standardExplorer';
import { EvidenceType } from '../../types/standard';
import { StandardExplorerFilters } from '../../types/standardExplorer';
import { BookOpen, FileCheck } from 'lucide-react';

/**
 * Triggers client-side browser file download from a string payload.
 * Safe in Node / test environments where window/document is mocked or undefined.
 */
function downloadFile(content: string, fileName: string, mimeType: string) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const StandardPage: React.FC = () => {
  const [filters, setFilters] = useState<StandardExplorerFilters>({});
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<string | null>(null);

  // 1. Load canonical indicators using the pure query layer
  const allRows = useMemo(() => {
    return getStandardExplorerRows(CANONICAL_STANDARD);
  }, []);

  // 2. Compute indicator counts grouped by pillar for navigation
  const indicatorCountsByPillar = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const row of allRows) {
      counts[row.pillarId] = (counts[row.pillarId] || 0) + 1;
    }
    return counts;
  }, [allRows]);

  // 3. Filter indicators according to active query parameters
  const filterResult = useMemo(() => {
    return filterStandardIndicators(allRows, filters);
  }, [allRows, filters]);

  // 4. Retrieve detail for currently selected indicator
  const selectedIndicatorDetail = useMemo(() => {
    if (!selectedIndicatorId) return null;
    return getIndicatorById(selectedIndicatorId, CANONICAL_STANDARD);
  }, [selectedIndicatorId]);

  // Filter actions
  const handleSearchChange = (query: string) => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: query || undefined,
    }));
  };

  const handleClearSearch = () => {
    setFilters((prev) => ({
      ...prev,
      searchQuery: undefined,
    }));
  };

  const handleSelectPillar = (pillarId: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      pillarId: pillarId || undefined,
    }));
  };

  const handleEvidenceChange = (evidenceType: EvidenceType | undefined) => {
    setFilters((prev) => ({
      ...prev,
      evidenceType: evidenceType || undefined,
    }));
  };

  const handleCriticalOnlyToggle = () => {
    setFilters((prev) => ({
      ...prev,
      criticalOnly: prev.criticalOnly ? undefined : true,
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({});
  };

  // Export handlers
  const handleExportJson = () => {
    const jsonStr = exportStandardAsJson(filterResult.rows, CANONICAL_STANDARD);
    downloadFile(jsonStr, 'careproof-standard.json', 'application/json');
  };

  const handleExportCsv = () => {
    const csvStr = exportStandardAsCsv(filterResult.rows);
    downloadFile(csvStr, 'careproof-standard.csv', 'text/csv;charset=utf-8;');
  };

  return (
    <div className="text-left font-body">
      {/* Page Header */}
      <PageHeader
        title="Standard Explorer"
        subtitle="Indicators, definitions, thresholds, evidence, and references."
        badge={
          <StatusIndicator status="neutral" label="v1.4.0 Specification" />
        }
        metadata={
          <>
            <span className="flex items-center gap-1">
              <FileCheck className="w-3 h-3 text-[#0F6B6E]" />
              <span>Standard: <strong>v1.4.0</strong></span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Pillars: <strong>{CANONICAL_STANDARD.pillars.length}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Indicators: <strong>{allRows.length}</strong></span>
            <span aria-hidden="true">·</span>
            <span>Governance: <strong>Decision support, not diagnosis</strong></span>
          </>
        }
      />

      {/* Main Structural Layout: Pillar Nav + Content Ledger */}
      <div className="flex flex-col md:flex-row items-start gap-5 mb-8">
        {/* Left Column: Pillar Navigation */}
        <aside className="w-full md:w-60 lg:w-64 shrink-0">
          <PillarNav
            pillars={CANONICAL_STANDARD.pillars}
            indicatorCountsByPillar={indicatorCountsByPillar}
            totalIndicators={allRows.length}
            activePillarId={filters.pillarId}
            onSelectPillar={handleSelectPillar}
          />
        </aside>

        {/* Right Column: Search Toolbar & Indicator Ledger */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Toolbar */}
          <StandardToolbar
            filters={filters}
            totalCount={allRows.length}
            filteredCount={filterResult.filteredCount}
            onSearchChange={handleSearchChange}
            onClearSearch={handleClearSearch}
            onEvidenceChange={handleEvidenceChange}
            onCriticalOnlyToggle={handleCriticalOnlyToggle}
            onClearAllFilters={handleClearAllFilters}
            onExportJson={handleExportJson}
            onExportCsv={handleExportCsv}
          />

          {/* Indicator Table */}
          <IndicatorTable
            rows={filterResult.rows}
            selectedIndicatorId={selectedIndicatorId}
            onSelectIndicator={setSelectedIndicatorId}
            onClearFilters={handleClearAllFilters}
          />
        </main>
      </div>

      {/* Detail Drawer */}
      <IndicatorDrawer
        detail={selectedIndicatorDetail}
        isOpen={selectedIndicatorId !== null}
        onClose={() => setSelectedIndicatorId(null)}
      />

      {/* Regulatory & Safe Harbor Methodology Note */}
      <footer
        aria-label="Clinical standard disclaimer"
        className="p-4 sm:p-5 border border-[#D9D3C5] bg-white rounded-[2px] text-xs font-mono text-[#5B6475] mt-8 text-left"
      >
        <div className="flex items-center gap-2 mb-2 text-[#14213D] font-bold">
          <BookOpen className="w-4 h-4 text-[#0F6B6E] shrink-0" />
          <span className="uppercase tracking-wider text-[11px]">
            CareProof Standard Governance &amp; Safe Harbor
          </span>
        </div>
        <p className="leading-relaxed m-0 font-body text-xs text-[#14213D]">
          Proposed framework, not clinically validated. Decision support, not diagnosis. This Standard Explorer
          displays version-controlled quality audit criteria for continuous residential care environments. Thresholds
          and weights are structured for quality evaluation and do not constitute independent medical diagnoses.
        </p>
      </footer>
    </div>
  );
};
