/**
 * CareProof Audit Console - Recent Operational Events Component
 * Source of Truth: CareProof Website Roadmap (Phase 6B)
 * 
 * Renders deterministic operational event notifications:
 * - Equipment maintenance schedules (links to /app/equipment)
 * - Caregiver competency renewals (links to /app/caregivers)
 * - Observation interval timing gaps (links to /app/monitor)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Users, Activity, ExternalLink, Calendar } from 'lucide-react';
import { RecentEvent } from '../../types/dashboard';

export interface RecentEventsListProps {
  events: RecentEvent[];
}

export const RecentEventsList: React.FC<RecentEventsListProps> = ({ events }) => {
  const getEventIcon = (type: RecentEvent['type']) => {
    switch (type) {
      case 'equipment_due':
        return <Wrench className="w-3.5 h-3.5 text-[#5B6475]" />;
      case 'competency_expiry':
        return <Users className="w-3.5 h-3.5 text-[#5B6475]" />;
      case 'data_gap':
        return <Activity className="w-3.5 h-3.5 text-[#B7791F]" />;
    }
  };

  const getEventDestination = (type: RecentEvent['type']): string => {
    switch (type) {
      case 'equipment_due':
        return '/app/equipment';
      case 'competency_expiry':
        return '/app/caregivers';
      case 'data_gap':
        return '/app/monitor';
    }
  };

  const getEventDestinationLabel = (type: RecentEvent['type']): string => {
    switch (type) {
      case 'equipment_due':
        return 'Equipment';
      case 'competency_expiry':
        return 'Caregivers';
      case 'data_gap':
        return 'Monitor';
    }
  };

  return (
    <section aria-labelledby="recent-events-heading" className="border border-[#D9D3C5] bg-white rounded-[2px] mb-6">
      <div className="p-4 sm:p-5 border-b border-[#D9D3C5] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left">
        <div>
          <h2 id="recent-events-heading" className="text-base font-display font-bold text-[#14213D] m-0">
            Recent Operational Events
          </h2>
          <p className="text-xs text-[#5B6475] mt-0.5 m-0 leading-relaxed font-body">
            Simulated audit triggers across hardware telemetry, staff licensing, and observation continuity
          </p>
        </div>
        <div className="text-[10px] font-mono px-2 py-0.5 border border-[#D9D3C5] rounded-[2px] bg-[#FAF8F3] text-[#5B6475] shrink-0 self-start sm:self-auto">
          SIMULATED FEED
        </div>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center text-xs text-[#5B6475] font-body">
          No recent operational events recorded.
        </div>
      ) : (
        <div className="divide-y divide-[#D9D3C5]/70">
          {events.map((evt) => {
            const dest = getEventDestination(evt.type);
            const destLabel = getEventDestinationLabel(evt.type);
            const dateStr = evt.timestamp ? evt.timestamp.replace('T', ' ').substring(0, 16) : '—';

            return (
              <div
                key={evt.id}
                className="p-3.5 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8F3]/60 transition-colors text-left"
              >
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className="p-1.5 bg-[#FAF8F3] border border-[#D9D3C5] rounded-[2px] shrink-0 mt-0.5 sm:mt-0">
                    {getEventIcon(evt.type)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-semibold text-xs text-[#14213D] truncate">
                        {evt.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1 py-0.2 border border-[#D9D3C5] rounded-[2px] text-[#5B6475] bg-[#FAF8F3]">
                        Simulated
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#5B6475] font-mono-ledger flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#5B6475]" />
                        <span>{dateStr}</span>
                      </span>
                      {evt.sourceId && (
                        <span>
                          Source: <strong className="text-[#14213D]">{evt.sourceId}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.5 border rounded-[2px] font-semibold ${
                      evt.severity === 'critical'
                        ? 'border-[#B3341A]/40 text-[#B3341A] bg-[#B3341A]/5'
                        : evt.severity === 'warning'
                          ? 'border-[#B7791F]/40 text-[#B7791F] bg-[#B7791F]/5'
                          : 'border-[#0F6B6E]/40 text-[#0F6B6E] bg-[#0F6B6E]/5'
                    }`}
                  >
                    {evt.severity}
                  </span>
                  <Link
                    to={dest}
                    className="inline-flex items-center gap-1 text-xs font-mono text-[#0F6B6E] hover:underline"
                    aria-label={`View details in ${destLabel}`}
                  >
                    <span>{destLabel}</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
