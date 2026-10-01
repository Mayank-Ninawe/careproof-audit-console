import { BookOpen, Shield, X } from 'lucide-react';
import { CANONICAL_STANDARD } from '../scoring/scoringEngine';
import { EvidenceBadge } from './EvidenceBadge';

interface EvidenceStandardDrawerProps {
  onClose: () => void;
}

export const EvidenceStandardDrawer = ({ onClose }: EvidenceStandardDrawerProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[1px]">
      <div className="bg-white border border-stone-300 w-full max-w-3xl rounded-[2px] shadow-sm flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              CareProof Standard — Evidence Classification & Safety Gate Charter
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 border border-transparent hover:border-stone-200 rounded-[2px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-6 text-xs text-stone-700 font-sans leading-relaxed">
          {/* Mandatory Disclaimers Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-[2px] text-amber-950 font-mono-ledger">
            <div className="font-bold text-xs uppercase tracking-wider text-amber-900 mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-800" />
              Governance & Clinical Communication Notice
            </div>
            <p className="text-xs">
              <strong>{CANONICAL_STANDARD.disclaimer.frameworkStatus}</strong>
            </p>
            <p className="text-xs mt-0.5">
              <strong>{CANONICAL_STANDARD.disclaimer.clinicalScope}</strong>
            </p>
            <p className="text-[11px] text-amber-900 mt-1">
              {CANONICAL_STANDARD.disclaimer.evidencePolicy}
            </p>
          </div>

          {/* Evidence Classification Definitions */}
          <div>
            <h4 className="font-mono-ledger text-xs font-bold uppercase tracking-wider text-stone-900 mb-3 border-b border-stone-200 pb-1">
              Evidence Classification System (E / I / P)
            </h4>
            <div className="space-y-3">
              <div className="p-3 border border-stone-300 bg-stone-50 rounded-[2px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <EvidenceBadge classification="E" showLabel />
                  <span className="font-bold text-stone-900">Established Protocol Standards</span>
                </div>
                <p className="text-xs text-stone-700">
                  Established [E] indicators represent codified, widely validated clinical care standards derived from standard clinical practices, life-safety requirements, and recognized healthcare operations protocols (e.g. crash cart verification, dual-clinician medication checks, direct care hours).
                </p>
              </div>

              <div className="p-3 border border-amber-300 bg-amber-50/50 rounded-[2px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <EvidenceBadge classification="I" showLabel />
                  <span className="font-bold text-stone-900">Interpretation Standards</span>
                </div>
                <p className="text-xs text-stone-700">
                  Interpretation [I] indicators evaluate empirical observational metrics, structured clinical handoff windows, incident review cycles, and documentation timestamps where consensus exists but local workflow variations may influence operational interpretation.
                </p>
              </div>

              <div className="p-3 border border-teal-300 bg-teal-50/50 rounded-[2px]">
                <div className="flex items-center gap-2 mb-1.5">
                  <EvidenceBadge classification="P" showLabel />
                  <span className="font-bold text-stone-900">Proposed Algorithmic Framework</span>
                </div>
                <p className="text-xs text-stone-700">
                  Proposed [P] indicators are heuristic computational metrics introduced for algorithmic tracking, sensor continuity, and documentation semantic consistency. They are <strong>not clinically validated</strong> and serve purely as non-diagnostic decision-support signals.
                </p>
              </div>
            </div>
          </div>

          {/* Safety Gate Behavior Explanation */}
          <div>
            <h4 className="font-mono-ledger text-xs font-bold uppercase tracking-wider text-stone-900 mb-2 border-b border-stone-200 pb-1">
              Safety Gate Tier Restriction Mechanism
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed mb-2">
              The CareProof framework enforces a strict non-compensatory <strong>Safety Gate</strong>. In healthcare delivery, high performance in administrative documentation cannot compensate for life-safety failures (such as unattended emergency equipment or dual-signoff omission).
            </p>
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-[2px] font-mono-ledger text-[11px] space-y-1 text-stone-800">
              <div>• 7 indicators in the canonical standard are designated with <strong className="text-rose-800">isCritical: true</strong>.</div>
              <div>• If any single critical indicator is evaluated in the <strong>FAIL band</strong> (score &lt; 50%), the Safety Gate trips.</div>
              <div>• Tripping the Safety Gate immediately <strong>caps the maximum achievable tier at Tier 3</strong> (Provisional / Safety Restricted), regardless of numerical composite score.</div>
              <div>• The Safety Gate remains active until verified remediation and re-audit occur.</div>
            </div>
          </div>

          {/* Tier Hierarchy */}
          <div>
            <h4 className="font-mono-ledger text-xs font-bold uppercase tracking-wider text-stone-900 mb-2 border-b border-stone-200 pb-1">
              Audit Standing Tier Hierarchy
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 font-mono-ledger text-xs">
              {CANONICAL_STANDARD.tierDefinitions.map((tier) => (
                <div key={tier.tier} className="p-2.5 border border-stone-200 rounded-[2px] bg-stone-50">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`px-2 py-0.5 border rounded-[2px] font-bold text-[11px] ${tier.badgeClass}`}>
                      {tier.tier}
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">
                      Min {tier.minCompositeScore}% score • {tier.minCoveragePercent}% cov
                    </span>
                  </div>
                  <div className="font-bold text-stone-900 mt-1 font-sans text-xs">{tier.name}</div>
                  <p className="text-[11px] text-stone-600 font-sans mt-0.5 leading-snug">
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 flex justify-end bg-stone-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-mono-ledger text-xs rounded-[2px] cursor-pointer"
          >
            Close Charter
          </button>
        </div>
      </div>
    </div>
  );
};
