import {
  BookOpen,
  Cpu,
  Download,
  FileSpreadsheet,
  GitCompare,
  Printer,
  Shield,
} from 'lucide-react';
import { FacilityAuditRecord } from '../types/standard';
import { PRESET_AUDITS } from '../data/defaultAuditRecords';
import { CANONICAL_STANDARD } from '../scoring/scoringEngine';

interface HeaderProps {
  currentRecord: FacilityAuditRecord;
  currentScore?: unknown;
  onSelectRecord: (record: FacilityAuditRecord) => void;
  onOpenSimulator: () => void;
  onOpenEvidenceCharter: () => void;
  showComparison: boolean;
  onToggleComparison: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
  onPrintLedger: () => void;
}

export const Header = ({
  currentRecord,
  onSelectRecord,
  onOpenSimulator,
  onOpenEvidenceCharter,
  showComparison,
  onToggleComparison,
  onExportCsv,
  onExportJson,
  onPrintLedger,
}: HeaderProps) => {
  return (
    <header className="border-b border-stone-200 bg-white">
      {/* Top Clinical & Regulatory Disclaimer Banner */}
      <div className="bg-stone-100/80 border-b border-stone-200 px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-ledger text-stone-600">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-stone-600 shrink-0" />
          <span className="font-semibold text-stone-800">
            CareProof Standard v{CANONICAL_STANDARD.standardVersion}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-amber-900 font-semibold bg-amber-50 px-1.5 py-0.2 border border-amber-200 rounded-[2px]">
            {CANONICAL_STANDARD.disclaimer.frameworkStatus}
          </span>
          <span className="text-stone-300">•</span>
          <span className="text-stone-700">
            {CANONICAL_STANDARD.disclaimer.clinicalScope}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-stone-500">
            Audit Ledger Active: <strong className="text-stone-800">{currentRecord.facilityId}</strong>
          </span>
          <button
            onClick={onOpenEvidenceCharter}
            className="text-teal-800 hover:text-teal-950 font-semibold underline flex items-center gap-1 cursor-pointer"
          >
            <BookOpen className="w-3 h-3" />
            Charter & Evidence Rules
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Branding & Ledger Identifier */}
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-stone-900 text-stone-100 flex items-center justify-center font-serif-score font-bold text-lg rounded-[2px] border border-stone-700">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-stone-900 tracking-tight">
                  CareProof Audit Console
                </span>
                <span className="font-mono-ledger text-[10px] uppercase font-bold text-teal-900 bg-teal-50 px-1.5 py-0.5 border border-teal-300 rounded-[2px]">
                  LEDGER MODE
                </span>
              </div>
              <p className="text-xs text-stone-500 font-sans">
                Clinical care delivery verification, evidence scoring engine & life-safety gate ledger
              </p>
            </div>
          </div>
        </div>

        {/* Right: Scenario Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono-ledger">
          {/* Preset Selector */}
          <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 px-2 py-1 rounded-[2px]">
            <span className="text-stone-500 text-[11px]">Audit Preset:</span>
            <select
              value={currentRecord.id}
              onChange={(e) => {
                const target = PRESET_AUDITS.find(p => p.id === e.target.value);
                if (target) onSelectRecord(target);
              }}
              className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer max-w-[210px] truncate"
            >
              {PRESET_AUDITS.map((audit) => (
                <option key={audit.id} value={audit.id}>
                  {audit.facilityName} ({audit.scoreResult?.assignedTier})
                </option>
              ))}
            </select>
          </div>

          {/* Seeded PRNG Simulator Modal Trigger */}
          <button
            onClick={onOpenSimulator}
            title="Generate a new deterministic audit dataset using seeded PRNG"
            className="px-2.5 py-1.5 border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-[2px] flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-teal-800" />
            <span>PRNG Seed</span>
          </button>

          {/* Compare Delta Toggle */}
          <button
            onClick={onToggleComparison}
            className={`px-2.5 py-1.5 border rounded-[2px] font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              showComparison
                ? 'bg-teal-800 text-white border-teal-900'
                : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-800'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Delta Diff</span>
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="flex items-center border border-stone-300 rounded-[2px] overflow-hidden bg-stone-50">
            <button
              onClick={onExportCsv}
              title="Export complete indicator ledger as CSV"
              className="px-2 py-1.5 hover:bg-stone-200 text-stone-700 border-r border-stone-300 flex items-center gap-1 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-800" />
              <span>CSV</span>
            </button>
            <button
              onClick={onExportJson}
              title="Export complete audit ledger record as JSON"
              className="px-2 py-1.5 hover:bg-stone-200 text-stone-700 border-r border-stone-300 flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-teal-800" />
              <span>JSON</span>
            </button>
            <button
              onClick={onPrintLedger}
              title="Print formal clinical audit sheet"
              className="px-2 py-1.5 hover:bg-stone-200 text-stone-700 flex items-center gap-1 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-stone-700" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
