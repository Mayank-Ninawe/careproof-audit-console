/**
 * CareProof Audit Console - Pilot Study Seed & Reproducibility Control
 * Source of Truth: CareProof Website Roadmap (Phase 10B)
 * 
 * REPRODUCIBILITY CONTRACT:
 * - Same seed + same configuration produces identical simulation output.
 * - Distinguishes simulation reproducibility from clinical/research reproducibility.
 * - Pure client-side recalculation; zero Firebase/persistent side effects.
 */

import React, { useState } from 'react';
import { RefreshCw, Hash, RotateCcw, HelpCircle } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';

export interface PilotSeedControlProps {
  currentSeed: number;
  onSeedChange: (newSeed: number) => void;
  isLoading?: boolean;
  className?: string;
}

export const PilotSeedControl: React.FC<PilotSeedControlProps> = ({
  currentSeed,
  onSeedChange,
  isLoading = false,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState<string>(String(currentSeed));
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputValue.trim(), 10);
    if (isNaN(parsed) || !Number.isFinite(parsed)) {
      setInputError('Seed must be a valid integer.');
      return;
    }
    if (parsed < 0 || parsed > 2147483647) {
      setInputError('Seed must be between 0 and 2,147,483,647.');
      return;
    }
    setInputError(null);
    onSeedChange(parsed);
  };

  const handleReset = () => {
    setInputValue('42');
    setInputError(null);
    onSeedChange(42);
  };

  return (
    <Panel
      title="Deterministic Seed &amp; Simulation Reproducibility"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5B6475]">
            Active Seed: <strong className="text-[#14213D]">{currentSeed}</strong>
          </span>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase text-[#14213D]">
              <Hash className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
              <span>Simulation Seed State</span>
            </div>
            <p className="text-xs text-[#5B6475] mt-1 m-0 leading-relaxed max-w-xl">
              <strong>Same seed + same configuration produces the same simulated result.</strong>{' '}
              Mulberry32 PRNG ensures bit-for-bit repeatability across executions in this sandbox.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
            <div className="flex items-center">
              <label htmlFor="pilot-seed-input" className="sr-only">
                Simulation Seed Integer
              </label>
              <input
                id="pilot-seed-input"
                type="number"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputError) setInputError(null);
                }}
                disabled={isLoading}
                placeholder="Enter seed"
                aria-label="Simulation seed number"
                className="w-28 px-2.5 py-1.5 text-xs font-mono border border-[#D9D3C5] bg-white text-[#14213D] rounded-[2px] focus:outline-none focus:ring-1 focus:ring-[#0F6B6E] focus:border-[#0F6B6E]"
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              size="sm"
              disabled={isLoading}
              className="gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
                aria-hidden="true"
              />
              <span>Regenerate</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isLoading || currentSeed === 42}
              title="Reset to default seed 42"
              className="gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </form>
        </div>

        {inputError && (
          <p
            role="alert"
            className="text-xs font-mono text-[#B3341A] bg-[#FAF0ED] p-2 border border-[#B3341A]/30 rounded-[2px] m-0"
          >
            {inputError}
          </p>
        )}

        {/* Reproducibility Boundary Disclosure */}
        <div className="flex items-start gap-2 text-xs text-[#5B6475] bg-white p-2.5 border border-[#D9D3C5] rounded-[2px]">
          <HelpCircle className="w-4 h-4 text-[#0F6B6E] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed font-body">
            <strong>Simulation Reproducibility vs. Research Reproducibility:</strong> Identical seeds guarantee that
            computational formulas and PRNG sequence are reproducible. This demonstrates algorithmic determinism within
            the synthetic environment, not clinical validation or prospective trial repeatability.
          </p>
        </div>
      </div>
    </Panel>
  );
};
