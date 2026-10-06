/**
 * CareProof Audit Console - Incident Timeline Section Component (Phase 11B)
 * Source of Truth: CareProof Website Roadmap (Phase 11B)
 * 
 * CORE CONTRACT:
 * - Deterministic chronological sorting of timeline events.
 * - Restrained vertical report timeline styling (hairline rules, monospace stamps).
 * - Local in-memory draft event addition and deletion.
 * - Enforces valid timestamps and non-duplicate event IDs.
 */

import React, { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { Panel } from '../ui/Panel';
import { Button } from '../ui/Button';
import {
  IncidentRecord,
  IncidentTimelineEvent,
  TimelineEventType,
} from '../../types/incident';
import { sortTimelineEvents } from '../../services/incident';

export interface IncidentTimelineSectionProps {
  record: IncidentRecord;
  onUpdateRecord: (updated: IncidentRecord) => void;
  className?: string;
}

export const IncidentTimelineSection: React.FC<IncidentTimelineSectionProps> = ({
  record,
  onUpdateRecord,
  className = '',
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEventId, setNewEventId] = useState('');
  const [newTimestamp, setNewTimestamp] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<TimelineEventType>('observation');
  const [newAuthor, setNewAuthor] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const sortedEvents = sortTimelineEvents(record.timeline);

  const handleOpenAdd = () => {
    const nextIdx = record.timeline.length + 1;
    setNewEventId(`EVT-${String(nextIdx).padStart(3, '0')}`);
    setNewTimestamp(new Date().toISOString());
    setNewTitle('');
    setNewType('observation');
    setNewAuthor(record.intake.reporterId || 'AUD-001');
    setNewNotes('');
    setFormError(null);
    setShowAddForm(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventId.trim()) {
      setFormError('Event ID is required.');
      return;
    }
    if (record.timeline.some((evt) => evt.id === newEventId.trim())) {
      setFormError(`Event ID "${newEventId.trim()}" already exists in this timeline.`);
      return;
    }
    if (!newTimestamp || isNaN(Date.parse(newTimestamp))) {
      setFormError('Valid ISO 8601 timestamp is required.');
      return;
    }
    if (!newTitle.trim()) {
      setFormError('Event title is required.');
      return;
    }

    const createdEvent: IncidentTimelineEvent = {
      id: newEventId.trim(),
      timestamp: newTimestamp.trim(),
      title: newTitle.trim(),
      type: newType,
      authorId: newAuthor.trim() || undefined,
      notes: newNotes.trim() || undefined,
      isSimulated: true,
    };

    onUpdateRecord({
      ...record,
      timeline: [...record.timeline, createdEvent],
      updatedAt: new Date().toISOString(),
    });

    setShowAddForm(false);
    setFormError(null);
  };

  const handleDeleteEvent = (eventId: string) => {
    onUpdateRecord({
      ...record,
      timeline: record.timeline.filter((evt) => evt.id !== eventId),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <Panel
      title="Stage 2: Chronological Timeline Ledger"
      className={className}
      headerActions={
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[#5B6475]">
            {sortedEvents.length} Events Logged
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleOpenAdd}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Add Event</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-left font-body">
        {/* Add Event Inline Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddEvent}
            className="p-3.5 bg-[#FAF8F3] border border-[#0F6B6E]/40 rounded-[2px] space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#D9D3C5]">
              <span className="text-xs font-mono font-semibold uppercase text-[#0F6B6E]">
                Log New Timeline Event
              </span>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-xs font-mono text-[#5B6475] hover:text-[#14213D] cursor-pointer"
              >
                Cancel
              </button>
            </div>

            {formError && (
              <p
                role="alert"
                className="text-xs font-mono text-[#B3341A] bg-[#FAF0ED] p-2 border border-[#B3341A]/30 rounded-[2px] m-0"
              >
                {formError}
              </p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
              <div className="sm:col-span-3">
                <label htmlFor="timeline-event-id" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Event ID *
                </label>
                <input
                  id="timeline-event-id"
                  type="text"
                  value={newEventId}
                  onChange={(e) => setNewEventId(e.target.value)}
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
                />
              </div>

              <div className="sm:col-span-5">
                <label htmlFor="timeline-timestamp" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Timestamp (ISO 8601) *
                </label>
                <input
                  id="timeline-timestamp"
                  type="text"
                  value={newTimestamp}
                  onChange={(e) => setNewTimestamp(e.target.value)}
                  placeholder="2026-01-15T08:30:00.000Z"
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="timeline-type" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Event Category
                </label>
                <select
                  id="timeline-type"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as TimelineEventType)}
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px] font-mono uppercase text-xs"
                >
                  <option value="observation">Observation</option>
                  <option value="alert">Alert</option>
                  <option value="action">Action</option>
                  <option value="review">Review</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="sm:col-span-8">
                <label htmlFor="timeline-title" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Event Title *
                </label>
                <input
                  id="timeline-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Telemetry alert acknowledged by primary nurse"
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px]"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="timeline-author" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Author / System ID
                </label>
                <input
                  id="timeline-author"
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="AUD-001 or SYS-AUDIT"
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px] font-mono"
                />
              </div>

              <div className="sm:col-span-12">
                <label htmlFor="timeline-notes" className="block font-mono font-semibold text-[#5B6475] mb-1">
                  Observational Notes
                </label>
                <input
                  id="timeline-notes"
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional context or findings"
                  className="w-full px-2 py-1 border border-[#D9D3C5] bg-white rounded-[2px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#D9D3C5]">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Commit Event to Draft
              </Button>
            </div>
          </form>
        )}

        {/* Timeline Events Ledger */}
        {sortedEvents.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-[#D9D3C5]">
            {sortedEvents.map((evt) => (
              <div key={evt.id} className="relative group text-left">
                {/* Marker Dot */}
                <div
                  className="absolute -left-6 sm:-left-8 top-1 w-3 h-3 rounded-full bg-white border-2 border-[#0F6B6E]"
                  aria-hidden="true"
                />

                <div className="p-3 bg-white border border-[#D9D3C5] rounded-[2px] hover:border-[#0F6B6E]/60 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 pb-1 border-b border-[#D9D3C5]/60 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-[#14213D]">
                        {evt.id}
                      </span>
                      <span className="text-xs font-bold text-[#14213D] font-body">
                        {evt.title}
                      </span>
                      {evt.type && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FAF8F3] border border-[#D9D3C5] text-[#5B6475] uppercase rounded-[2px]">
                          {evt.type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span className="text-[11px] font-mono text-[#5B6475]">
                        {new Date(evt.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                          hour12: false,
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteEvent(evt.id)}
                        title="Remove event from draft"
                        aria-label={`Remove event ${evt.id}`}
                        className="text-[#9CA3AF] hover:text-[#B3341A] p-0.5 rounded cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-[#5B6475] gap-2">
                    <p className="m-0 font-body text-xs text-[#14213D]">
                      {evt.notes || 'No notes recorded for this timestamp marker.'}
                    </p>
                    {evt.authorId && (
                      <span className="text-[11px] font-mono shrink-0">
                        Source: <strong>{evt.authorId}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            role="status"
            aria-label="No Timeline Events"
            className="p-6 text-center bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px]"
          >
            <Clock className="w-6 h-6 text-[#5B6475] mx-auto mb-2" aria-hidden="true" />
            <h4 className="text-xs font-bold text-[#14213D] uppercase font-mono m-0">
              No Timeline Events Recorded
            </h4>
            <p className="text-xs text-[#5B6475] mt-1 m-0 font-body">
              Log observation milestones, alarms, and actions to reconstruct chronological progression.
            </p>
            <div className="mt-3">
              <Button type="button" variant="secondary" size="sm" onClick={handleOpenAdd}>
                Add First Event
              </Button>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
