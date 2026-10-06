/**
 * CareProof Audit Console - Privacy & Demo Data Section
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * Manages privacy transparency, honest consent log status,
 * and safe client-side demo data purge with explicit confirmation.
 */

import React, { useState } from 'react';
import { ShieldAlert, Trash2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { purgeDemoData } from '../../services/settings';

export interface PrivacySectionProps {
  onDemoDataDeleted?: () => void;
  className?: string;
}

export const PrivacySection: React.FC<PrivacySectionProps> = ({
  onDemoDataDeleted,
  className = '',
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [deletionMessage, setDeletionMessage] = useState<string | null>(null);

  const handleConfirmDelete = () => {
    const result = purgeDemoData();
    setShowConfirm(false);
    setDeletionMessage(result.message);
    if (onDemoDataDeleted) {
      onDemoDataDeleted();
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <Panel
      title="Privacy, Consent & Demo Data"
      headerActions={
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#B7791F]">
          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Data Governance</span>
        </div>
      }
      className={className}
    >
      <div className="space-y-5 text-left text-xs font-body">
        {/* Consent Log Sub-section */}
        <div className="space-y-2 border-b border-[#D9D3C5]/60 pb-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
              Audit Consent Log
            </h4>
            <span className="text-[10px] font-mono text-[#5B6475] px-1.5 py-0.5 border border-[#D9D3C5] bg-[#FAF8F3] rounded-[2px]">
              0 Configured Events
            </span>
          </div>

          <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] space-y-1">
            <p className="font-mono text-[11px] text-[#5B6475] m-0">
              No consent events are configured in this demonstration build.
            </p>
            <p className="text-[11px] text-[#5B6475] m-0 leading-relaxed">
              CareProof operates on synthetic in silico demonstration cohorts without analytics trackers, external advertising cookies, or third-party behavioral profiling.
            </p>
          </div>
        </div>

        {/* Delete Demo Data Sub-section */}
        <div className="space-y-3">
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#14213D] m-0">
              Local Demonstration Data Management
            </h4>
            <p className="text-xs text-[#5B6475] mt-1 m-0 leading-relaxed">
              Clear locally cached preferences, draft session overrides, and in-memory test overrides stored in this browser.
            </p>
          </div>

          {/* Success Message Banner */}
          {deletionMessage && (
            <div
              role="status"
              aria-live="polite"
              className="p-3 bg-[#0F6B6E]/10 border border-[#0F6B6E]/30 rounded-[2px] flex items-start gap-2 text-xs font-mono text-[#0F6B6E]"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <span>{deletionMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeletionMessage(null)}
                className="text-[#0F6B6E] hover:text-[#14213D] p-0.5 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Destructive Confirmation Box */}
          {showConfirm ? (
            <div
              role="alertdialog"
              aria-labelledby="confirm-delete-title"
              aria-describedby="confirm-delete-desc"
              className="p-4 bg-[#FAF0ED] border border-[#B3341A]/40 rounded-[2px] space-y-3 text-left"
            >
              <div className="flex items-center gap-2 text-[#B3341A]">
                <AlertTriangle className="w-4 h-4 shrink-0" aria-hidden="true" />
                <h5 id="confirm-delete-title" className="text-xs font-mono font-bold uppercase m-0">
                  Confirm Demo Data Deletion
                </h5>
              </div>

              <p id="confirm-delete-desc" className="text-xs text-[#14213D] leading-relaxed m-0">
                This action will remove locally cached preferences, draft session overrides, and demonstration settings stored in your browser. It will <strong>NOT</strong> delete your user account, Firebase credentials, or canonical standard configuration.
              </p>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleConfirmDelete}
                  className="font-mono text-xs gap-1.5 text-white bg-[#B3341A] hover:bg-[#8f2814] border-[#B3341A]"
                >
                  <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Confirm Deletion</span>
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelDelete}
                  className="font-mono text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setShowConfirm(true)}
                className="font-mono text-xs gap-1.5 text-[#B3341A] border-[#B3341A]/50 hover:bg-[#FAF0ED]"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Delete demo data</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};
