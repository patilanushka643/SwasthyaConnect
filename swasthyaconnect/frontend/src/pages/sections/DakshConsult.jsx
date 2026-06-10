import React from 'react';
import SectionLayout from './SectionLayout';

const DakshConsult = () => {
  return (
    <SectionLayout title="Daksh Consult" subtitle="Smart Assistance Workspace">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <p className="text-sm text-slate-300">AI guidance panel placeholder</p>
          <div className="mt-4 rounded-xl border border-dashed border-slate-600 bg-slate-900/70 p-4 text-sm text-slate-400">
            Consult suggestion cards
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <p className="text-sm text-slate-300">Symptom intake, routing suggestions, and specialty recommendations can be rendered here.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Symptom intake</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Recommendation output</div>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
};

export default DakshConsult;