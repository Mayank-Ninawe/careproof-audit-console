/**
 * CareProof Audit Console - Profile Settings Section
 * Source of Truth: CareProof Website Roadmap (Phase 13)
 * 
 * Manages user display name, canonical role, and organization name.
 * Stored locally with honest non-deceptive status.
 */

import React, { useState } from 'react';
import { User, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { AuthRole, VALID_AUTH_ROLES } from '../../types/auth';
import { UserProfile } from '../../types/userProfile';
import { AuthUser } from '../../types/auth';

export interface ProfileSectionProps {
  user: AuthUser | null;
  profile: UserProfile | null;
  initialOrganization?: string;
  onSaveProfile: (data: {
    displayName: string;
    role: AuthRole;
    organizationName: string;
  }) => void;
  className?: string;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({
  user,
  profile,
  initialOrganization = '',
  onSaveProfile,
  className = '',
}) => {
  const currentDisplayName = profile?.displayName || user?.displayName || '';
  const currentRole: AuthRole = profile?.role || 'auditor';

  const [displayName, setDisplayName] = useState(currentDisplayName);
  const [role, setRole] = useState<AuthRole>(currentRole);
  const [organizationName, setOrganizationName] = useState(
    profile?.organizationName || initialOrganization || ''
  );
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const roleOptions = VALID_AUTH_ROLES.map((r) => ({
    value: r,
    label:
      r === 'family'
        ? 'Family (Care Observer)'
        : r === 'agency'
          ? 'Agency (Care Provider)'
          : 'Auditor (Clinical Quality Assessor)',
  }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      displayName: displayName.trim(),
      role,
      organizationName: organizationName.trim(),
    });
    setSaveSuccessMessage('Profile preferences saved locally');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 4000);
  };

  return (
    <Panel
      title="User Profile & Organization"
      headerActions={
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#0F6B6E]">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Local Profile Context</span>
        </div>
      }
      className={className}
    >
      <form onSubmit={handleSave} className="space-y-4">
        {/* Status Feedback Notice */}
        {saveSuccessMessage && (
          <div
            role="status"
            aria-live="polite"
            className="p-3 bg-[#0F6B6E]/10 border border-[#0F6B6E]/30 rounded-[2px] flex items-center gap-2 text-xs font-mono text-[#0F6B6E]"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Display Name */}
          <div>
            <Input
              id="settings-profile-name"
              label="Full Name / Auditor Handle"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Dr. Eleanor Vance or Auditor #104"
              helperText={
                !currentDisplayName
                  ? 'Currently: Not provided'
                  : `Active display name: ${currentDisplayName}`
              }
            />
          </div>

          {/* Canonical Role */}
          <div>
            <Select
              id="settings-profile-role"
              label="Audit Evaluation Role"
              value={role}
              onChange={(e) => setRole(e.target.value as AuthRole)}
              options={roleOptions}
            />
            <span className="text-[11px] text-[#5B6475] block mt-1">
              Determines UI viewpoint and audit focus.
            </span>
          </div>
        </div>

        {/* Organisation */}
        <div>
          <Input
            id="settings-profile-org"
            label="Home Care Agency / Oversight Organisation"
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            placeholder="e.g. Metropolitan Home Health Oversight Network"
            helperText="Stored locally in browser session storage. No remote Firebase synchronization is performed for demonstration profiles."
          />
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#D9D3C5]/60">
          <div className="text-[11px] font-mono text-[#5B6475] flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#5B6475]" aria-hidden="true" />
            <span>Account: <strong>{user?.email || 'Guest / Demo Auditor'}</strong></span>
          </div>

          <Button type="submit" variant="primary" size="sm" className="font-mono text-xs">
            Save Profile
          </Button>
        </div>
      </form>
    </Panel>
  );
};
