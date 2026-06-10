import React from 'react';
import SectionLayout from './SectionLayout';

const EVisitHistory = () => {
  return (
    <SectionLayout title="eVisit History" subtitle="Past Virtual Sessions">
      <div className="space-y-4 text-slate-200">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-300">Session history cards</p>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Completed call record placeholder</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Follow-up session placeholder</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-sm text-slate-400">
          Archived consultation notes, timestamps, and patient outcomes can be rendered here.
        </div>
      </div>
    </SectionLayout>
  );
};

export default EVisitHistory;