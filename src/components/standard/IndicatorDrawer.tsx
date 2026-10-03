/**
 * CareProof Audit Console - Standard Explorer Indicator Detail Drawer
 * Source of Truth: CareProof Website Roadmap (Phase 7B)
 * 
 * Accessible side drawer presenting complete clinical indicator specifications.
 * Strictly adheres to research integrity: absent fields (formula, rationale, references)
 * display explicit "Not provided in the current standard" rather than fabricated text.
 */

import React, { useEffect, useRef } from 'react';
import { X, ShieldAlert, BookOpen, AlertCircle, Scale, Database, FileText } from 'lucide-react';
import { EvidenceTag } from '../ui/EvidenceTag';
import { StandardIndicatorDetail } from '../../types/standardExplorer';

export interface IndicatorDrawerProps {
  detail: StandardIndicatorDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

export const IndicatorDrawer: React.FC<IndicatorDrawerProps> = ({
  detail,
  isOpen,
  onClose,
}) => {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus management: focus close button when drawer opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  if (!isOpen || !detail) {
    return null;
  }

  const { indicator, pillar, bands, refs, evidence, critical, formula, rationale } = detail;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-indicator-title"
      className="fixed inset-0 z-50 flex justify-end"
    >
      {/* Dimmed Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity cursor-pointer"
      />

      {/* Drawer Surface */}
      <div
        className="relative z-10 w-full max-w-xl bg-white border-l border-[#D9D3C5] shadow-xl flex flex-col h-full overflow-hidden text-left font-body animate-in slide-in-from-right duration-150"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#D9D3C5] bg-[#FAF8F3] shrink-0">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-sm px-2 py-0.5 bg-white border border-[#D9D3C5] text-[#14213D] rounded-[2px]">
                {indicator.id}
              </span>
              <span className="font-mono text-xs text-[#5B6475] px-1.5 py-0.5 bg-white border border-[#D9D3C5] rounded-[2px]">
                {pillar.id} · {pillar.name}
              </span>
              {critical && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono uppercase bg-[#FAF0ED] text-[#B3341A] border border-[#B3341A]/30 rounded-[2px] font-bold">
                  <ShieldAlert className="w-3 h-3" />
                  <span>Critical Life-Safety</span>
                </span>
              )}
            </div>

            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label="Close indicator detail drawer"
              className="p-1.5 rounded-[2px] border border-[#D9D3C5] bg-white text-[#5B6475] hover:text-[#14213D] hover:bg-[#FAF8F3] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <h2
            id="drawer-indicator-title"
            className="text-lg sm:text-xl font-display font-bold text-[#14213D] leading-tight m-0"
          >
            {indicator.name}
          </h2>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Definition Section */}
          <section aria-labelledby="section-definition">
            <h3 id="section-definition" className="text-[11px] font-mono uppercase text-[#5B6475] font-semibold mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#0F6B6E]" />
              <span>Clinical Definition</span>
            </h3>
            <p className="text-xs text-[#14213D] leading-relaxed m-0 bg-[#FAF8F3]/60 p-3 border border-[#D9D3C5]/70 rounded-[2px]">
              {indicator.definition}
            </p>
          </section>

          {/* Data Source Section */}
          <section aria-labelledby="section-data-source">
            <h3 id="section-data-source" className="text-[11px] font-mono uppercase text-[#5B6475] font-semibold mb-1.5 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-[#0F6B6E]" />
              <span>Data Source &amp; Telemetry Origin</span>
            </h3>
            <div className="text-xs text-[#14213D] bg-white p-3 border border-[#D9D3C5]/70 rounded-[2px] leading-relaxed">
              {indicator.dataSource}
            </div>
          </section>

          {/* Threshold Bands */}
          <section aria-labelledby="section-threshold-bands">
            <h3 id="section-threshold-bands" className="text-[11px] font-mono uppercase text-[#5B6475] font-semibold mb-2 flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-[#0F6B6E]" />
              <span>Threshold Bands Evaluation</span>
            </h3>
            {bands.length > 0 ? (
              <div className="border border-[#D9D3C5] rounded-[2px] overflow-hidden divide-y divide-[#D9D3C5]/70">
                {bands.map((b) => (
                  <div key={b.level} className="p-2.5 flex items-start gap-3 bg-white hover:bg-[#FAF8F3]/50">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded-[2px] shrink-0 border ${
                        b.level === 'Meets'
                          ? 'border-[#2F6B3F]/40 text-[#2F6B3F] bg-[#2F6B3F]/5'
                          : b.level === 'Partial'
                            ? 'border-[#B7791F]/40 text-[#B7791F] bg-[#B7791F]/5'
                            : 'border-[#B3341A]/40 text-[#B3341A] bg-[#B3341A]/5'
                      }`}
                    >
                      {b.level}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#14213D] font-mono">
                        {b.threshold !== undefined ? `Threshold: ${b.threshold}` : 'Criteria Band'}
                      </div>
                      {b.description && (
                        <p className="text-[11px] text-[#5B6475] m-0 mt-0.5 leading-snug">
                          {b.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-[#5B6475] italic m-0 p-3 bg-[#FAF8F3] border border-[#D9D3C5]/70 rounded-[2px]">
                Not specified in standard.
              </p>
            )}
          </section>

          {/* Governance & Scoring Parameters */}
          <section aria-labelledby="section-parameters">
            <h3 id="section-parameters" className="text-[11px] font-mono uppercase text-[#5B6475] font-semibold mb-2">
              Audit Governance Parameters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 bg-[#FAF8F3]/60 border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] font-mono uppercase text-[#5B6475] block">Pillar Weight</span>
                <span className="text-sm font-mono font-bold text-[#14213D] tabular-nums mt-0.5 block">
                  {indicator.weight.toFixed(1)}
                </span>
              </div>
              <div className="p-2.5 bg-[#FAF8F3]/60 border border-[#D9D3C5] rounded-[2px]">
                <span className="text-[10px] font-mono uppercase text-[#5B6475] block">Evidence Type</span>
                <div className="mt-1">
                  <EvidenceTag classification={evidence} showLabel />
                </div>
              </div>
              <div className="p-2.5 bg-[#FAF8F3]/60 border border-[#D9D3C5] rounded-[2px] col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono uppercase text-[#5B6475] block">Criticality</span>
                <span className={`text-xs font-mono font-bold mt-1 block ${critical ? 'text-[#B3341A]' : 'text-[#14213D]'}`}>
                  {critical ? 'Safety Gate Barrier' : 'Standard Metric'}
                </span>
              </div>
            </div>
          </section>

          {/* Formula & Evaluation Algorithm (Honest Absent State) */}
          <section aria-labelledby="section-formula">
            <h3 id="section-formula" className="text-[11px] font-mono uppercase text-[#5B6475] font-semibold mb-1.5">
              Evaluation Formula
            </h3>
            <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5]/70 rounded-[2px] text-xs text-[#5B6475]">
              {formula || (
                <span className="italic">
                  Not provided in the current standard.
                </span>
              )}
            </div>
          </section>

          {/* Audit Guidance & Rationale */}
          <section aria-labelledby="section-rationale">
            <h3 id="section-rationale" className="text-[11px] font-mono uppercase text-[#5B6475] font-semibold mb-1.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-[#0F6B6E]" />
              <span>Standard Guidance &amp; Clinical Rationale</span>
            </h3>
            <div className="p-3 bg-white border border-[#D9D3C5]/70 rounded-[2px] text-xs text-[#14213D] leading-relaxed">
              {rationale || (
                <span className="text-[#5B6475] italic">
                  Not provided in the current standard.
                </span>
              )}
            </div>
          </section>

          {/* References */}
          <section aria-labelledby="section-references">
            <h3 id="section-references" className="text-[11px] font-mono uppercase text-[#5B6475] font-semibold mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0F6B6E]" />
              <span>Clinical &amp; Regulatory References</span>
            </h3>
            {refs.length > 0 ? (
              <ul className="space-y-2 list-none p-0 m-0">
                {refs.map((ref) => (
                  <li
                    key={ref.id}
                    className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] text-xs"
                  >
                    <div className="font-semibold text-[#14213D]">
                      {ref.title}
                    </div>
                    {ref.citation && (
                      <div className="text-[11px] text-[#5B6475] font-mono mt-1">
                        {ref.citation}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-[#5B6475] italic m-0 p-3 bg-[#FAF8F3] border border-[#D9D3C5]/70 rounded-[2px]">
                No references recorded in canonical standard.
              </p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:px-5 border-t border-[#D9D3C5] bg-[#FAF8F3] flex items-center justify-between gap-3 shrink-0 text-xs">
          <span className="text-[11px] font-mono text-[#5B6475]">
            CareProof Standard v1.4.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white hover:bg-[#FAF8F3] text-[#14213D] rounded-[2px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-[#0F6B6E]"
          >
            Close Detail
          </button>
        </div>
      </div>
    </div>
  );
};
