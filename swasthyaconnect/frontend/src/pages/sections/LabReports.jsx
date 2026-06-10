import React from 'react';
import SectionLayout from './SectionLayout';

const LabReports = () => {
  return (
    <SectionLayout title="Lab Reports" subtitle="Clinical Document Library">
      <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <p className="text-sm text-slate-300">PDF and image report links</p>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">CBC report placeholder link</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">X-ray report placeholder link</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Pathology upload placeholder link</div>
          </div>
        </div>
        <aside className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4 text-slate-200">
          <p className="text-sm text-slate-300">Review area</p>
          <div className="mt-4 rounded-xl border border-dashed border-slate-600 bg-slate-900/70 p-4 text-sm text-slate-400">
            Drag, preview, and organize report files here.
          </div>
        </aside>
      </div>
    </SectionLayout>
  );
};

export default LabReports;