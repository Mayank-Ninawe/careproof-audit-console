/**
 * CareProof Audit Console - Corrective Actions Section Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Ledger of corrective process/audit actions.
 * - Workflow states: planned, in_progress, completed, cancelled.
 * - Enforces audit workflow actions only; zero medical or clinical treatment advice.
 */

import React, { useState } from 'react';
import { CheckSquare, Plus, Trash2, ShieldCheck } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import {
  CorrectiveAction,
  CorrectiveActionStatus,
  IncidentRecord,
  VALID_ACTION_STATUSES,
} from '../../types/incident';

export interface IncidentCorrectiveActionsSectionProps {
  record: IncidentRecord;
  onUpdateRecord: (updated: IncidentRecord) => void;
  className?: string;
}

export const IncidentCorrectiveActionsSection: React.FC<IncidentCorrectiveActionsSectionProps> = ({
  record,
  onUpdateRecord,
  className = '',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [actionId, setActionId] = useState('');
  const [desc, setDesc] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<CorrectiveActionStatus>('planned');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const actions = record.correctiveActions;

  const handleOpenAdd = () => {
    const nextIdx = actions.length + 1;
    setActionId(`ACT-${String(nextIdx).padStart(3, '0')}`);
    setDesc('');
    setAssignee('');
    setDueDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
    setStatus('planned');
    setVerificationNotes('');
    setErrorMsg(null);
    setShowAddForm(true);
  };

  const handleAddAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionId.trim()) {
      setErrorMsg('Action ID is required.');
      return;
    }
    if (actions.some((a) => a.id === actionId.trim())) {
      setErrorMsg(`Action ID "${actionId.trim()}" already exists.`);
      return;
    }
    if (!desc.trim()) {
      setErrorMsg('Action description is required.');
      return;
    }

    const newAction: CorrectiveAction = {
      id: actionId.trim(),
      description: desc.trim(),
      assigneeId: assignee.trim() || undefined,
      dueDate: dueDate.trim() ? new Date(dueDate.trim()).toISOString() : undefined,
      status,
      verificationNotes: verificationNotes.trim() || undefined,
      isSimulated: true,
    };

    onUpdateRecord({
      ...record,
      correctiveActions: [...actions, newAction],
      updatedAt: new Date().toISOString(),
    });

    setShowAddForm(false);
    setErrorMsg(null);
  };

  const handleStatusChange = (actId: string, newStatus: CorrectiveActionStatus) => {
    onUpdateRecord({
      ...record,
      correctiveActions: actions.map((a) => {
        if (a.id === actId) {
          return {
            ...a,
            status: newStatus,
            completedDate: newStatus === 'completed' ? new Date().toISOString() : a.completedDate,
          };
        }
        return a;
      }),
      updatedAt: new Date().toISOString(),
    });
  };

  const handleDeleteAction = (actId: string) => {
    onUpdateRecord({
      ...record,
      correctiveActions: actions.filter((a) => a.id !== actId),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Panel
      title="Stage 5: Corrective Actions &amp; Remediation Ledger"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5B6475]">
            {actions.length} Actions Assigned
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenAdd}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Create Action</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        {/* Operational Boundary Disclosure */}
        <div className="p-3 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] flex items-start gap-2.5 text-xs text-[#5B6475]">
          <ShieldCheck className="w-4 h-4 text-[#0F6B6E] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="m-0 leading-relaxed font-body">
            <strong>Operational Scope Notice:</strong> Corrective actions specify organizational, procedural, or technical
            process remediations to restore standard compliance. They are administrative audit tasks, not clinical medical orders.
          </p>
        </div>

        {/* Add Action Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddAction}
            className="p-3.5 bg-[#FAF8F3] border border-[#0F6B6E]/40 rounded-[2px] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D9D3C5]">
              <span className="text-xs font-mono font-semibold uppercase text-[#0F6B6E]">
                Add Corrective Action Item
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-mono text-[#5B6475] hover:text-[#14213D] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {errorMsg && (
              <p
                role="alert"
                className="text-xs font-mono text-[#B3341A] bg-[#FAF0ED] p-2 border border-[#B3341A]/30 rounded-[2px] m-0"
              >
                {errorMsg}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-3">
                <label htmlFor="action-item-id" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Action ID *
                </label>
                <input
                  id="action-item-id"
                  type="text"
                  value={actionId}
                  onChange={(e) => setActionId(e.target.value)}
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="action-assignee" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Owner / Assignee Role
                </label>
                <input
                  id="action-assignee"
                  type="text"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  placeholder="e.g. Biomed Supervisor"
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px]"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="action-due-date" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Target Due Date
                </label>
                <input
                  id="action-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="action-status" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Status
                </label>
                <select
                  id="action-status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CorrectiveActionStatus)}
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px] font-mono text-xs uppercase"
                >
                  {VALID_ACTION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-12">
                <label htmlFor="action-desc" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Remediation Action Description *
                </label>
                <input
                  id="action-desc"
                  type="text"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="e.g. Recalibrate telemetry buffer thresholds and update annual inspection cadence"
                  className="w-full px-2 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px]"
                />
              </div>

              <div className="sm:col-span-12">
                <label htmlFor="action-verification" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Verification &amp; Evidence Notes
                </label>
                <input
                  id="action-verification"
                  type="text"
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  placeholder="Verification method or simulated test run notes"
                  className="w-full px-2 py-1.5 border border-[#D9D3C5] bg-white rounded-[2px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D3C5]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Action Item
              </Button>
            </div>
          </form>
        )}

        {/* Actions Table */}
        {actions.length > 0 ? (
          <div className="overflow-x-auto border border-[#D9D3C5] rounded-[2px]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F3] border-b border-[#D9D3C5] font-mono uppercase text-[#5B6475] text-[11px]">
                  <th scope="col" className="p-2.5 font-semibold">Action ID</th>
                  <th scope="col" className="p-2.5 font-semibold">Remediation Description</th>
                  <th scope="col" className="p-2.5 font-semibold">Assignee</th>
                  <th scope="col" className="p-2.5 font-semibold">Due Date</th>
                  <th scope="col" className="p-2.5 font-semibold">Status</th>
                  <th scope="col" className="p-2.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D3C5] font-body bg-white">
                {actions.map((act) => (
                  <tr key={act.id} className="hover:bg-[#FAF8F3]/50">
                    <td className="p-2.5 font-mono font-bold text-[#14213D] whitespace-nowrap">
                      {act.id}
                    </td>
                    <td className="p-2.5 max-w-sm">
                      <div className="font-semibold text-[#14213D]">{act.description}</div>
                      {act.verificationNotes && (
                        <div className="text-[11px] text-[#5B6475] mt-0.5">
                          Verification: {act.verificationNotes}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-[#5B6475] whitespace-nowrap">
                      {act.assigneeId || 'Unassigned'}
                    </td>
                    <td className="p-2.5 font-mono text-[#5B6475] whitespace-nowrap text-[11px]">
                      {act.dueDate ? new Date(act.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-2.5 whitespace-nowrap">
                      <select
                        value={act.status}
                        onChange={(e) => handleStatusChange(act.id, e.target.value as CorrectiveActionStatus)}
                        aria-label={`Status for ${act.id}`}
                        className="text-[11px] font-mono px-2 py-0.5 border border-[#D9D3C5] bg-white rounded-[2px]"
                      >
                        {VALID_ACTION_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st.toUpperCase().replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-2.5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleDeleteAction(act.id)}
                        title={`Remove action ${act.id}`}
                        aria-label={`Remove action ${act.id}`}
                        className="text-[#9CA3AF] hover:text-[#B3341A] p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div
            role="status"
            aria-label="No Actions Defined"
            className="p-6 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
          >
            <CheckSquare className="w-6 h-6 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
            <h4 className="text-xs font-bold text-[#14213D] uppercase font-mono m-0">
              No Corrective Actions Defined
            </h4>
            <p className="text-xs text-[#5B6475] mt-1 m-0 font-body">
              Assign remediation actions to address root cause findings and prevent recurrence.
            </p>
            <div className="mt-3">
              <Button type="button" variant="secondary" size="sm" onClick={handleOpenAdd}>
                Add First Action
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
