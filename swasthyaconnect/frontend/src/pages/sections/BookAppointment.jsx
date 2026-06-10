import React from 'react';
import SectionLayout from './SectionLayout';

const BookAppointment = () => {
  return (
    <SectionLayout title="Book an Appointment" subtitle="Scheduling Workspace">
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Calendar</p>
              <div className="mt-3 h-64 rounded-xl border border-dashed border-slate-600 bg-slate-900/70 p-4 text-sm text-slate-400">
                Appointment calendar placeholder
              </div>
            </div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Preferred Doctor</p>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2">Doctor list slot</div>
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2">Specialty filters</div>
                <div className="rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2">Time availability</div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-400">
            Booking notes, slot selection, and consultation preparation content can live here.
          </div>
        </div>

        <aside className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Quick Actions</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4">Review upcoming slots</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4">Upload referral details</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-4">Confirm patient details</div>
          </div>
        </aside>
      </div>
    </SectionLayout>
  );
};

export default BookAppointment;