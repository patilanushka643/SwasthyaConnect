import React from 'react';
import SectionLayout from './SectionLayout';

const MyAppointments = () => {
  return (
    <SectionLayout title="My Appointments" subtitle="Appointment Timeline">
      <div className="space-y-4 text-slate-200">
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-300">Upcoming appointment summary cards</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Patient visit placeholder</div>
            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">Queue and status placeholder</div>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-700 bg-slate-950/70 p-4">
          <p className="text-sm text-slate-300">Historical appointment records and status tracking can appear here.</p>
        </div>
      </div>
    </SectionLayout>
  );
};

export default MyAppointments;