/**
 * CareProof Audit Console - Export Settings Section
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * Generates and triggers structured JSON download of current audit configuration,
 * canonical standard metadata, and sanitized user profile preferences.
 */

import React, { useState } from 'react';
import { Download, FileJson, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { AuthUser } from '../../types/auth';
import { UserProfile } from '../../types/userProfile';
import { SettingsPreferences } from '../../types/settings';
import {
  downloadJsonFile,
  generateAuditExportPayload,
} from '../../services/settings';

export interface ExportSectionProps {
  user: AuthUser | null;
  profile: UserProfile | null;
  preferences: SettingsPreferences;
  className?: string;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  user,
  profile,
  preferences,
  className = '',
}) => {
  const [exportedStatus, setExportedStatus] = useState<string | null>(null);

  const handleExport = () => {
    const payload = generateAuditExportPayload(user, profile, preferences);
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `careproof-audit-export-${dateStr}.json`;

    downloadJsonFile(payload, filename);

    setExportedStatus(`Export generated: ${filename}`);
    setTimeout(() => {
      setExportedStatus(null);
    }, 4000);
  };

  return (
    <Panel
      title="Audit Ledger Data Export"
      headerActions={
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#0F6B6E]">
          <FileJson className="w-3.5 h-3.5" aria-hidden="true" />
          <span>JSON Schema Package</span>
        </div>
      }
      className={className}
    >
      <div className="space-y-4 text-left text-xs font-body">
        <p className="text-xs text-[#5B6475] leading-relaxed m-0">
          Export a structured JSON snapshot containing the canonical CareProof Standard v1.4.0 definitions, current simulated audit summary results, and sanitized auditor context.
        </p>

        {/* Feedback message */}
        {exportedStatus && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 bg-[#0F6B6E]/10 border border-[#0F6B6E]/30 rounded-[2px] flex items-center gap-2 text-xs font-mono text-[#0F6B6E]"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{exportedStatus}</span>
          </div>
        )}

        {/* Manifest details */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase text-[#14213D] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0F6B6E]" aria-hidden="true" />
            <span>Export Package Manifest</span>
          </div>
          <ul className="list-disc list-inside space-y-1 font-mono text-[11px] text-[#5B6475]">
            <li>Canonical standard version (v1.4.0), pillars, weights, and indicators</li>
            <li>Current simulated composite audit standing, tier, and coverage</li>
            <li>Sanitized user profile context (display name, role, organization)</li>
            <li>Interface preferences (table density, unit system)</li>
            <li>Zero passwords, auth tokens, session cookies, or private credentials</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between border-t border-[#D9D3C5]/60">
          <span className="text-[11px] text-[#5B6475] font-mono">
            Format: application/json
          </span>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleExport}
            className="font-mono text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export JSON</span>
          </Button>
        </div>
      </div>
    </Panel>
  );
};
