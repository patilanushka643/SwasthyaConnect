import React from 'react';
import SectionLayout from './SectionLayout';

const EVisit = () => {
  return (
    <SectionLayout title="eVisit" subtitle="Virtual Care Workspace">
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <p className="text-sm text-slate-300">Video consult launch area</p>
          <div className="mt-4 h-64 rounded-xl border border-dashed border-slate-600 bg-slate-900/70 p-4 text-sm text-slate-400">
            eVisit launch tiles and consultation readiness area
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <p className="text-sm text-slate-300">Pre-call checklist and device test controls can live here.</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Camera test</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Microphone test</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Connectivity check</div>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
};

export default EVisit;