/**
 * CareProof Audit Console - Indicator Mapping Section Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Links incident to canonical indicators from CANONICAL_STANDARD.
 * - Rejects non-canonical indicator IDs.
 * - Auditor-entered rationale; zero automated clinical causation claims.
 */

import React, { useState } from 'react';
import { Target, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import {
  IncidentIndicatorMapping,
  IncidentRecord,
} from '../../types/incident';
import { CANONICAL_STANDARD } from '../../data/standard';

export interface IncidentIndicatorMappingSectionProps {
  record: IncidentRecord;
  onUpdateRecord: (updated: IncidentRecord) => void;
  className?: string;
}

export const IncidentIndicatorMappingSection: React.FC<IncidentIndicatorMappingSectionProps> = ({
  record,
  onUpdateRecord,
  className = '',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedIndId, setSelectedIndId] = useState('');
  const [rationale, setRationale] = useState('');
  const [evidenceRef, setEvidenceRef] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const canonicalIndicators = CANONICAL_STANDARD.indicators;

  // Build lookup map for fast indicator details
  const indMap = new Map(canonicalIndicators.map((i) => [i.id, i]));

  const handleOpenAdd = () => {
    // Select first indicator not already linked
    const firstUnlinked = canonicalIndicators.find(
      (ind) => !record.linkedIndicators.some((li) => li.indicatorId === ind.id)
    );
    setSelectedIndId(firstUnlinked ? firstUnlinked.id : canonicalIndicators[0].id);
    setRationale('');
    setEvidenceRef('');
    setErrorMsg(null);
    setShowAddForm(true);
  };

  const handleAddMapping = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIndId) {
      setErrorMsg('Please select a canonical indicator.');
      return;
    }

    if (record.linkedIndicators.some((li) => li.indicatorId === selectedIndId)) {
      setErrorMsg(`Indicator "${selectedIndId}" is already mapped to this incident.`);
      return;
    }

    const mapping: IncidentIndicatorMapping = {
      indicatorId: selectedIndId,
      reason: rationale.trim() || undefined,
      evidenceReference: evidenceRef.trim() || undefined,
      isSimulated: true,
    };

    onUpdateRecord({
      ...record,
      linkedIndicators: [...record.linkedIndicators, mapping],
      updatedAt: new Date().toISOString(),
    });

    setShowAddForm(false);
    setErrorMsg(null);
  };

  const handleRemoveMapping = (indId: string) => {
    onUpdateRecord({
      ...record,
      linkedIndicators: record.linkedIndicators.filter((li) => li.indicatorId !== indId),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Panel
      title="Stage 3: Canonical Indicator Linkage Ledger"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5B6475]">
            {record.linkedIndicators.length} Indicators Linked
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenAdd}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Map Indicator</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        {/* Mapping Integrity Disclaimer */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex items-start gap-2.5 text-xs text-[#5B6475]">
          <LinkIcon className="w-4 h-4 text-[#0F6B6E] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed font-body">
            <strong>Audit Association Disclaimer:</strong> Indicator links document auditor assessment relationships
            against canonical CareProof standards (v1.4.0). Linkage does not claim automated clinical causation or legal fault.
          </p>
        </div>

        {/* Add Mapping Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddMapping}
            className="p-3.5 bg-[#FAF8F3] border border-[#0F6B6E]/40 rounded-[2px] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D9D3C5]">
              <span className="text-xs font-mono font-semibold uppercase text-[#0F6B6E]">
                Link Canonical Indicator
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-mono text-[#5B6475] hover:text-[#14213D] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {errorMsg && (
              <p
                role="alert"
                className="text-xs font-mono text-[#B3341A] bg-[#FAF0ED] p-2 border border-[#B3341A]/30 rounded-[2px] m-0"
              >
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-12">
                <label htmlFor="select-canonical-indicator" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Canonical Indicator (CareProof Standard v1.4.0) *
                </label>
                <select
                  id="select-canonical-indicator"
                  value={selectedIndId}
                  onChange={(e) => setSelectedIndId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px] font-mono text-xs"
                >
                  {canonicalIndicators.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      [{ind.id}] {ind.name} (Pillar: {ind.pillarId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-8">
                <label htmlFor="mapping-rationale" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Auditor Rationale / Connection
                </label>
                <input
                  id="mapping-rationale"
                  type="text"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="e.g. Telemetry Latency threshold breach directly triggered anomaly review"
                  className="w-full px-2.5 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px]"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="mapping-evidence" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Evidence Reference / Log ID
                </label>
                <input
                  id="mapping-evidence"
                  type="text"
                  value={evidenceRef}
                  onChange={(e) => setEvidenceRef(e.target.value)}
                  placeholder="e.g. LOG-TEL-20260115"
                  className="w-full px-2.5 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D3C5]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Attach Indicator Link
              </Button>
            </div>
          </form>
        )}

        {/* Linked Indicators Table */}
        {record.linkedIndicators.length > 0 ? (
          <div className="overflow-x-auto border border-[#D9D3C5] rounded-[2px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] font-mono uppercase text-[#5B6475] text-[11px]">
                  <th scope="col" className="p-2.5 font-semibold">Indicator</th>
                  <th scope="col" className="p-2.5 font-semibold">Standard Metric Name</th>
                  <th scope="col" className="p-2.5 font-semibold">Pillar</th>
                  <th scope="col" className="p-2.5 font-semibold">Auditor Rationale</th>
                  <th scope="col" className="p-2.5 font-semibold">Evidence Ref</th>
                  <th scope="col" className="p-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D3C5] font-body bg-white">
                {record.linkedIndicators.map((li) => {
                  const meta = indMap.get(li.indicatorId);
                  return (
                    <tr key={li.indicatorId} className="hover:bg-[#FAF8F3]/50">
                      <td className="p-2.5 font-mono font-bold text-[#14213D] whitespace-nowrap">
                        {li.indicatorId}
                      </td>
                      <td className="p-2.5 font-semibold text-[#14213D]">
                        {meta?.name || 'Standard Indicator'}
                      </td>
                      <td className="p-2.5 font-mono text-[#5B6475] whitespace-nowrap">
                        {meta?.pillarId || 'PMI'}
                      </td>
                      <td className="p-2.5 text-[#5B6475] max-w-xs">
                        {li.reason || <span className="text-[#9CA3AF]">None specified</span>}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-[#5B6475] whitespace-nowrap">
                        {li.evidenceReference || <span className="text-[#9CA3AF]">N/A</span>}
                      </td>
                      <td className="p-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleRemoveMapping(li.indicatorId)}
                          title={`Unlink indicator ${li.indicatorId}`}
                          aria-label={`Unlink indicator ${li.indicatorId}`}
                          className="text-[#9CA3AF] hover:text-[#B3341A] p-1 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            role="status"
            aria-label="No Indicators Mapped"
            className="p-6 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
          >
            <Target className="w-6 h-6 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
            <h4 className="text-xs font-bold text-[#14213D] uppercase font-mono m-0">
              No Standard Indicators Linked
            </h4>
            <p className="text-xs text-[#5B6475] mt-1 m-0 font-body">
              Link one or more canonical CareProof indicators (e.g. PMI-01) impacted by this incident.
            </p>
            <div className="mt-3">
              <Button type="button" variant="secondary" size="sm" onClick={handleOpenAdd}>
                Map First Indicator
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
