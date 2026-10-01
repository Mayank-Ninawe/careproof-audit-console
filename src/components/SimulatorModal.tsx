import React, { useState } from 'react';
import { Cpu, RefreshCw, X } from 'lucide-react';
import { generateSimulatedAuditRecord } from '../scoring/scoringEngine';
import { FacilityAuditRecord } from '../types/standard';

interface SimulatorModalProps {
  onClose: () => void;
  onGenerate: (record: FacilityAuditRecord) => void;
}

export const SimulatorModal: React.FC<SimulatorModalProps> = ({ onClose, onGenerate }) => {
  const [seed, setSeed] = useState<number>(42819);
  const [facilityName, setFacilityName] = useState<string>('Pinecrest Regional Healthcare Center');
  const [department, setDepartment] = useState<string>('Adult Intensive Care & Intermediate Stepdown');
  const [scenarioBias, setScenarioBias] = useState<'exemplary' | 'critical_breach' | 'low_coverage' | 'mixed'>('mixed');

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = generateSimulatedAuditRecord(seed, facilityName.trim(), department.trim(), scenarioBias);
    onGenerate(newRecord);
    onClose();
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 90000) + 10000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-[1px]">
      <div className="bg-white border border-stone-300 w-full max-w-lg rounded-[2px] shadow-sm flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-teal-800" />
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Deterministic Seeded Audit Generator (PRNG)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 border border-transparent hover:border-stone-200 rounded-[2px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleGenerate} className="p-5 space-y-4 text-xs font-mono-ledger">
          <div className="p-3 bg-amber-50/80 border border-amber-300 rounded-[2px] text-amber-950 font-sans text-xs">
            <span className="font-mono-ledger font-bold text-[11px] uppercase tracking-wider block mb-1">
              Simulation Transparency Policy
            </span>
            All records created by this generator are <strong>SIMULATED</strong> using a pure seeded PRNG algorithm (Mulberry32). The same seed and input parameters will always produce the exact same deterministic dataset.
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
              PRNG Integer Seed
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                required
                value={seed}
                onChange={(e) => setSeed(parseInt(e.target.value, 10) || 0)}
                className="w-full border border-stone-300 px-3 py-1.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-[2px] text-sm"
              />
              <button
                type="button"
                onClick={randomizeSeed}
                className="px-2.5 py-1.5 border border-stone-300 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-[2px] flex items-center gap-1 cursor-pointer shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Randomize
              </button>
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Same seed guarantee: seed {seed} will always produce identical indicator metrics.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
              Simulated Facility Name
            </label>
            <input
              type="text"
              required
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="w-full border border-stone-300 px-3 py-1.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-[2px] text-xs font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
              Clinical Department / Audited Unit
            </label>
            <input
              type="text"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border border-stone-300 px-3 py-1.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-[2px] text-xs font-sans"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">
              Audit Scenario Profile Bias
            </label>
            <select
              value={scenarioBias}
              onChange={(e) => setScenarioBias(e.target.value as any)}
              className="w-full border border-stone-300 px-3 py-1.5 bg-stone-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-teal-700 rounded-[2px] text-xs"
            >
              <option value="mixed">Mixed Operational Facility (Standard variance)</option>
              <option value="exemplary">Exemplary Standing (Clean Tier 1, High compliance)</option>
              <option value="critical_breach">Critical Safety Gate Violation (Fails CSP-01 Dual Signoff, Capped at Tier 3)</option>
              <option value="low_coverage">Incomplete Audit (Omitted indicators, Low confidence ribbon)</option>
            </select>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-200">
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
              <Cpu className="w-3.5 h-3.5" />
              Generate Deterministic Dataset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
