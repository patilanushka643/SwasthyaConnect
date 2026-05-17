import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const emptyMedicine = { name: '', dosage: '', frequency: '' };

const DoctorDashboard = () => {
  const { api } = useAuth();
  const { socket } = useSocket();

  const [queue, setQueue] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [instructions, setInstructions] = useState('');
  const [medicines, setMedicines] = useState([{ ...emptyMedicine }]);
  const [labFile, setLabFile] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().slice(0, 10));

  const fetchQueue = async () => {
    const { data } = await api.get('/opd/doctor-queue', { params: { date: currentDate } });
    setQueue(data.queue || []);

    if (data.queue?.length && !selectedAppointmentId) {
      setSelectedAppointmentId(data.queue[0]._id);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [currentDate]);

  useEffect(() => {
    if (!socket) return;

    const refresh = () => fetchQueue();
    socket.on('queue:update', refresh);
    socket.on('appointment:completed', refresh);

    return () => {
      socket.off('queue:update', refresh);
      socket.off('appointment:completed', refresh);
    };
  }, [socket, currentDate]);

  const updateMedicine = (index, key, value) => {
    setMedicines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [key]: value };
      return next;
    });
  };

  const addMedicine = () => setMedicines((prev) => [...prev, { ...emptyMedicine }]);

  const removeMedicine = (index) => {
    setMedicines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatusMessage('');

    try {
      const cleanMeds = medicines.filter((medicine) => medicine.name && medicine.dosage && medicine.frequency);

      const { data } = await api.post('/clinical/record', {
        appointmentId: selectedAppointmentId,
        diagnosis,
        medicines: cleanMeds,
        instructions,
      });

      if (labFile) {
        const formData = new FormData();
        formData.append('file', labFile);

        await api.post(`/logistics/records/${data.record._id}/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setStatusMessage('Consultation completed and medical record generated.');
      setDiagnosis('');
      setInstructions('');
      setMedicines([{ ...emptyMedicine }]);
      setLabFile(null);
      await fetchQueue();
    } catch (error) {
      setStatusMessage(error?.response?.data?.message || 'Failed to submit clinical data.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-emerald-100 bg-white/90 p-6 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900">Doctor Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Live waitlist management and clinical documentation workspace.</p>
      </header>

      <div id="queue" className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">Patient Queue</h3>
            <input type="date" value={currentDate} onChange={(event) => setCurrentDate(event.target.value)} className="input-field max-w-44" />
          </div>

          <ul className="space-y-3">
            {queue.map((item) => (
              <li
                key={item._id}
                onClick={() => setSelectedAppointmentId(item._id)}
                className={`cursor-pointer rounded-xl border px-4 py-3 ${
                  selectedAppointmentId === item._id ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">Token #{item.tokenNumber} - {item.patientId?.name}</p>
                <p className="text-xs text-slate-600">Slot: {item.slotTime} • Status: {item.status}</p>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Prescription & Diagnosis Matrix</h3>
          <div className="mt-4 space-y-3">
            <textarea
              className="input-field min-h-24"
              value={diagnosis}
              onChange={(event) => setDiagnosis(event.target.value)}
              placeholder="Diagnosis details"
              required
            />

            {medicines.map((medicine, index) => (
              <div key={`medicine-${index}`} className="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-4">
                <input
                  className="input-field"
                  placeholder="Medicine Name"
                  value={medicine.name}
                  onChange={(event) => updateMedicine(index, 'name', event.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Dosage"
                  value={medicine.dosage}
                  onChange={(event) => updateMedicine(index, 'dosage', event.target.value)}
                />
                <input
                  className="input-field"
                  placeholder="Frequency"
                  value={medicine.frequency}
                  onChange={(event) => updateMedicine(index, 'frequency', event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => removeMedicine(index)}
                  className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Remove
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addMedicine}
              className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              Add Medicine
            </button>

            <textarea
              className="input-field min-h-20"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
              placeholder="Instructions for patient"
            />

            <label className="block text-sm font-semibold text-slate-700">Attach Lab File / X-Ray (PDF/Image)</label>
            <input type="file" accept=".pdf,image/*" onChange={(event) => setLabFile(event.target.files?.[0] || null)} className="input-field" />

            <button
              type="submit"
              disabled={!selectedAppointmentId}
              className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Complete Consultation
            </button>
            {statusMessage && <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{statusMessage}</p>}
          </div>
        </form>
      </div>
    </section>
  );
};

export default DoctorDashboard;
