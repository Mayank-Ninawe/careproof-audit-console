import { Award, HelpCircle } from 'lucide-react';
import { ConfidenceResult } from '../types/standard';

interface ConfidenceRibbonProps {
  confidence: ConfidenceResult;
  onHelpClick?: () => void;
}

export const ConfidenceRibbon = ({
  confidence,
  onHelpClick,
}: ConfidenceRibbonProps) => {
  const levelStyles = {
    High: {
      badge: 'bg-emerald-50 text-emerald-900 border-emerald-300',
      bar: 'bg-emerald-600',
      label: 'High Confidence Audit',
    },
    Medium: {
      badge: 'bg-amber-50 text-amber-900 border-amber-300',
      bar: 'bg-amber-600',
      label: 'Medium Confidence Audit',
    },
    Low: {
      badge: 'bg-rose-50 text-rose-900 border-rose-300',
      bar: 'bg-rose-600',
      label: 'Low / Provisional Confidence',
    },
  }[confidence.level];

  return (
    <div className="border border-stone-200 bg-white p-3.5 rounded-[2px] mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Badge and Explanation */}
        <div className="flex items-start gap-3">
          <div className="shrink-0 mt-0.5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono-ledger font-semibold uppercase tracking-wider border rounded-[2px] ${levelStyles.badge}`}
            >
              <Award className="w-3.5 h-3.5" />
              {levelStyles.label}
            </span>
          </div>
          <div>
            <p className="text-xs text-stone-700 leading-snug">{confidence.explanation}</p>
            <div className="flex items-center gap-4 mt-1.5 text-[11px] font-mono-ledger text-stone-500">
              <span>
                Coverage:{' '}
                <strong className="text-stone-800 font-semibold">
                  {confidence.coveragePercent.toFixed(1)}%
                </strong>{' '}
                ({confidence.totalAssessedWeight.toFixed(1)} / {confidence.totalPossibleWeight.toFixed(1)} weighted pts)
              </span>
              <span>•</span>
              <span>
                Established [E] Ratio:{' '}
                <strong className="text-stone-800 font-semibold">
                  {(confidence.establishedWeightRatio * 100).toFixed(0)}%
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Coverage meter & breakdown */}
        <div className="shrink-0 flex items-center gap-3">
          <div className="w-32">
            <div className="flex justify-between text-[10px] font-mono-ledger text-stone-500 mb-1">
              <span>Audit Completeness</span>
              <span>{confidence.coveragePercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-1.5 bg-stone-100 border border-stone-200 rounded-[1px] overflow-hidden">
              <div
                className={`h-full ${levelStyles.bar} transition-all duration-300`}
                style={{ width: `${Math.min(100, Math.max(0, confidence.coveragePercent))}%` }}
              />
            </div>
          </div>

          {onHelpClick && (
            <button
              onClick={onHelpClick}
              title="Audit Confidence & Evidence Standard Definition"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 border border-stone-200 rounded-[2px] transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
