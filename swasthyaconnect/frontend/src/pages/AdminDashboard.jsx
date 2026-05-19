import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

const triageColors = {
  Red: 'bg-rose-100 text-rose-700',
  Yellow: 'bg-amber-100 text-amber-700',
  Green: 'bg-emerald-100 text-emerald-700',
};

const AdminDashboard = () => {
  const { api } = useAuth();
  const [overview, setOverview] = useState({ lowInventory: [], emergencyStats: [] });
  const [staff, setStaff] = useState([]);

  const totalLowStock = overview.lowInventory.length;

  const emergencyMap = useMemo(() => {
    const map = { Red: 0, Yellow: 0, Green: 0 };
    overview.emergencyStats.forEach((entry) => {
      map[entry._id] = entry.count;
    });
    return map;
  }, [overview]);

  const fetchData = async () => {
    const [overviewRes, staffRes] = await Promise.all([api.get('/logistics/admin/overview'), api.get('/auth/staff')]);
    setOverview(overviewRes.data);
    setStaff(staffRes.data.staff || []);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <section id="ops" className="space-y-6">
      <header className="rounded-2xl border border-amber-100 bg-white/90 p-6 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900">Admin Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Operational intelligence for pharmacy inventory, emergency load, and staff governance.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Low Inventory Alerts</p>
          <p className="mt-2 text-4xl font-black text-slate-900">{totalLowStock}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Emergency Red Cases</p>
          <p className="mt-2 text-4xl font-black text-rose-700">{emergencyMap.Red}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Total Staff</p>
          <p className="mt-2 text-4xl font-black text-slate-900">{staff.length}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Pharmacy Inventory Risk Panel</h3>
          <ul className="mt-4 space-y-3">
            {overview.lowInventory.map((item) => (
              <li key={item._id} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{item.medicineName}</p>
                <p className="text-xs text-slate-600">
                  Stock: {item.stockQuantity} | Alert Threshold: {item.thresholdAlertCount}
                </p>
              </li>
            ))}
            {overview.lowInventory.length === 0 && <p className="text-sm text-emerald-700">All medicines are above threshold levels.</p>}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Emergency Bed Pressure</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {Object.keys(emergencyMap).map((level) => (
              <div key={level} className={`rounded-xl px-4 py-5 text-center ${triageColors[level]}`}>
                <p className="text-xs font-bold uppercase tracking-[0.15em]">{level}</p>
                <p className="mt-2 text-3xl font-black">{emergencyMap[level]}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-900">Staff Configuration Grid</h3>
        <div className="mt-4 overflow-auto rounded-xl border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Specialization</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((member) => (
                <tr key={member._id} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{member.name}</td>
                  <td className="px-4 py-3 text-slate-700">{member.role}</td>
                  <td className="px-4 py-3 text-slate-700">{member.specialization || '-'}</td>
                  <td className="px-4 py-3 text-slate-700">{member.email}</td>
                  <td className="px-4 py-3 text-slate-700">{member.phone || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default AdminDashboard;
