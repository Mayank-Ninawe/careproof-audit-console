import { useState } from 'react';
import { Check, HelpCircle, Shield, X } from 'lucide-react';
import { EvaluatedIndicatorScore, IndicatorAssessment } from '../types/standard';
import { CANONICAL_STANDARD } from '../scoring/scoringEngine';
import { EvidenceBadge } from './EvidenceBadge';

interface IndicatorEditorModalProps {
  indicator: EvaluatedIndicatorScore;
  onClose: () => void;
  onSave: (assessment: IndicatorAssessment) => void;
}

export const IndicatorEditorModal = ({
  indicator,
  onClose,
  onSave,
}: IndicatorEditorModalProps) => {
  const canonical = CANONICAL_STANDARD.indicators.find(i => i.id === indicator.indicatorId) || CANONICAL_STANDARD.indicators[0];
  const isLowerBetter = !!indicator.isLowerBetter;

  const [status, setStatus] = useState<'assessed' | 'not_assessed'>(indicator.status === 'not_assessed' ? 'not_assessed' : 'assessed');
  const [valueInput, setValueInput] = useState<string>(
    indicator.measuredValue !== null ? String(indicator.measuredValue) : ''
  );
  const [notes, setNotes] = useState<string>(indicator.notes || '');
  const [auditorName, setAuditorName] = useState<string>('J. Vance, Lead Clinical Quality Auditor');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedVal = status === 'assessed' ? (valueInput.trim() === '' ? null : Number(valueInput)) : null;

    onSave({
      indicatorId: indicator.indicatorId,
      status,
      measuredValue: parsedVal,
      notes: notes.trim(),
      lastAuditedAt: new Date().toISOString(),
      auditorName: auditorName.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[1px]">
      <div className="bg-white border border-stone-300 w-full max-w-2xl rounded-[2px] shadow-sm flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-start justify-between gap-3 bg-stone-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono-ledger font-bold text-xs bg-stone-200 px-1.5 py-0.5 border border-stone-300 rounded-[2px]">
                {indicator.code}
              </span>
              <EvidenceBadge classification={indicator.evidenceClassification} showLabel />
              {indicator.isCritical && (
                <span className="inline-flex items-center gap-1 font-mono-ledger text-[10px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 border border-rose-300 rounded-[2px]">
                  <Shield className="w-3 h-3" />
                  LIFE-SAFETY CRITICAL
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-stone-900 leading-snug">
              {indicator.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 border border-transparent hover:border-stone-200 rounded-[2px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs font-mono-ledger flex-1">
          {/* Audit Verification Criteria Box */}
          <div className="p-3 bg-stone-50 border border-stone-200 rounded-[2px]">
            <div className="flex items-center gap-1.5 font-bold text-stone-800 mb-1">
              <HelpCircle className="w-3.5 h-3.5 text-teal-800" />
              <span>Standard Audit Specification & Guidance</span>
            </div>
            <p className="text-stone-700 leading-relaxed font-sans text-xs">
              {canonical.description}
            </p>
            <div className="mt-2 text-[11px] text-stone-600 bg-white p-2 border border-stone-200 rounded-[2px]">
              <strong className="text-stone-800">Verification Guidance:</strong> {canonical.guidance}
            </div>
            <div className="mt-2 text-[11px] text-stone-500">
              <strong className="text-stone-700">Verified Data Source:</strong> {canonical.dataSource}
            </div>
          </div>

          {/* Thresholds Reference */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2 border border-emerald-300 bg-emerald-50 rounded-[2px] text-center">
              <div className="text-[10px] uppercase text-emerald-800 font-bold">Pass Band (100)</div>
              <div className="text-sm font-bold text-emerald-950 mt-0.5">
                {isLowerBetter ? `< ${canonical.thresholds.pass}` : `> ${canonical.thresholds.pass}`} {canonical.unit}
              </div>
            </div>
            <div className="p-2 border border-amber-300 bg-amber-50 rounded-[2px] text-center">
              <div className="text-[10px] uppercase text-amber-800 font-bold">Marginal Warning</div>
              <div className="text-sm font-bold text-amber-950 mt-0.5">
                {canonical.thresholds.warning} {canonical.unit}
              </div>
            </div>
            <div className="p-2 border border-rose-300 bg-rose-50 rounded-[2px] text-center">
              <div className="text-[10px] uppercase text-rose-800 font-bold">Fail Band (0)</div>
              <div className="text-sm font-bold text-rose-950 mt-0.5">
                {isLowerBetter ? `> ${canonical.thresholds.fail}` : `< ${canonical.thresholds.fail}`} {canonical.unit}
              </div>
            </div>
          </div>

          {/* Assessment Inputs */}
          <div className="border border-stone-200 p-4 rounded-[2px] bg-white space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-800">Assessment Status</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStatus('assessed')}
                  className={`px-3 py-1 border text-xs rounded-[2px] cursor-pointer ${
                    status === 'assessed'
                      ? 'bg-teal-800 text-white border-teal-900 font-semibold'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  Assessed
                </button>
                <button
                  type="button"
                  onClick={() => setStatus('not_assessed')}
                  className={`px-3 py-1 border text-xs rounded-[2px] cursor-pointer ${
                    status === 'not_assessed'
                      ? 'bg-stone-800 text-white border-stone-900 font-semibold'
                      : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  Omit / Not Assessed
                </button>
              </div>
            </div>

            {status === 'assessed' && (
              <div>
                <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                  Measured Value ({canonical.unit})
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="any"
                    required
                    value={valueInput}
                    onChange={(e) => setValueInput(e.target.value)}
                    placeholder={`e.g. ${canonical.thresholds.pass}`}
                    className="w-full border border-stone-300 px-3 py-1.5 text-sm font-mono-ledger bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-[2px]"
                  />
                  <span className="text-stone-500 font-bold px-2 text-sm">{canonical.unit}</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Value will be evaluated deterministically against the canonical standard.
                </p>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Auditor Audit Trail Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document electronic evidence reference, batch verification ID, or rationale..."
                className="w-full border border-stone-300 p-2 text-xs font-sans bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-[2px]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
                Auditor Attestation Credential
              </label>
              <input
                type="text"
                value={auditorName}
                onChange={(e) => setAuditorName(e.target.value)}
                className="w-full border border-stone-300 px-2 py-1 text-xs font-mono-ledger bg-stone-50 rounded-[2px]"
              />
            </div>
          </div>

          {/* Footer Controls */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-stone-300 text-stone-700 hover:bg-stone-100 rounded-[2px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-[2px] flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              Commit Assessment & Recalculate
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
