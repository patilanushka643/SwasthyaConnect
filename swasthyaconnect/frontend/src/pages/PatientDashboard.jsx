import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const PatientDashboard = () => {
  const { api } = useAuth();
  const { socket } = useSocket();

  const [specialization, setSpecialization] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [slotTime, setSlotTime] = useState('09:00 AM');
  const [appointments, setAppointments] = useState([]);
  const [timeline, setTimeline] = useState([]);
  const [queueStatusMap, setQueueStatusMap] = useState({});
  const [message, setMessage] = useState('');

  const slotOptions = useMemo(
    () => ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM'],
    []
  );

  const fetchDoctors = async () => {
    const { data } = await api.get('/opd/doctors', {
      params: specialization ? { specialization } : {},
    });
    setDoctors(data.doctors || []);
  };

  const fetchAppointments = async () => {
    const { data } = await api.get('/opd/my-appointments');
    setAppointments(data.appointments || []);
  };

  const fetchTimeline = async () => {
    const { data } = await api.get('/clinical/timeline');
    setTimeline(data.records || []);
  };

  const refreshQueueStatuses = async (currentAppointments) => {
    const entries = await Promise.all(
      (currentAppointments || []).map(async (appointment) => {
        try {
          const { data } = await api.get(`/opd/queue/${appointment._id}`);
          return [appointment._id, data];
        } catch (_error) {
          return [appointment._id, null];
        }
      })
    );

    setQueueStatusMap(Object.fromEntries(entries));
  };

  const bootstrap = async () => {
    await Promise.all([fetchDoctors(), fetchAppointments(), fetchTimeline()]);
  };

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (appointments.length > 0) {
      refreshQueueStatuses(appointments);
    }
  }, [appointments]);

  useEffect(() => {
    if (!socket) return;

    const onQueueUpdate = () => {
      fetchAppointments();
    };

    socket.on('queue:update', onQueueUpdate);
    socket.on('appointment:completed', onQueueUpdate);

    return () => {
      socket.off('queue:update', onQueueUpdate);
      socket.off('appointment:completed', onQueueUpdate);
    };
  }, [socket]);

  const handleSearch = async () => {
    await fetchDoctors();
  };

  const handleBook = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const { data } = await api.post('/opd/book', {
        doctorId: selectedDoctor,
        appointmentDate,
        slotTime,
      });

      setMessage(`Booked successfully. Your token: ${data.appointment.tokenNumber}`);
      await fetchAppointments();
    } catch (error) {
      setMessage(error?.response?.data?.message || 'Failed to book appointment.');
    }
  };

  return (
    <section className="space-y-6">
      <header className="rounded-2xl border border-cyan-100 bg-white/90 p-6 shadow-sm">
        <h2 className="text-3xl font-black text-slate-900">Patient Dashboard</h2>
        <p className="mt-2 text-sm text-slate-600">Book OPD slots, track real-time queue rank, and review your complete medical timeline.</p>
      </header>

      <div id="booking" className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Find Doctors by Specialization</h3>
          <div className="mt-4 flex gap-3">
            <input
              value={specialization}
              onChange={(event) => setSpecialization(event.target.value)}
              placeholder="e.g. Cardiology"
              className="input-field"
            />
            <button onClick={handleSearch} className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500">
              Search
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {doctors.map((doctor) => (
              <li key={doctor._id} className="rounded-xl border border-slate-200 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-900">Dr. {doctor.name}</p>
                <p className="text-slate-600">{doctor.specialization || 'General Medicine'}</p>
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleBook} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Book Appointment</h3>
          <div className="mt-4 space-y-3">
            <select className="input-field" value={selectedDoctor} onChange={(event) => setSelectedDoctor(event.target.value)} required>
              <option value="">Select Doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} - {doctor.specialization || 'General'}
                </option>
              ))}
            </select>
            <input type="date" className="input-field" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} required />
            <select className="input-field" value={slotTime} onChange={(event) => setSlotTime(event.target.value)}>
              {slotOptions.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <button type="submit" className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-700">
              Confirm Booking
            </button>
            {message && <p className="rounded-xl bg-cyan-50 px-3 py-2 text-sm text-cyan-700">{message}</p>}
          </div>
        </form>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Live Queue Ranking</h3>
          <ul className="mt-4 space-y-3">
            {appointments.map((appointment) => {
              const queue = queueStatusMap[appointment._id];

              return (
                <li key={appointment._id} className="rounded-xl border border-slate-200 px-4 py-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {new Date(appointment.appointmentDate).toLocaleDateString()} • {appointment.slotTime}
                  </p>
                  <p className="text-xs text-slate-600">Dr. {appointment.doctorId?.name}</p>
                  <p className="mt-1 text-sm text-cyan-700">
                    Token #{appointment.tokenNumber} • Rank {queue?.rank || '-'} / {queue?.totalActiveQueue || '-'}
                  </p>
                  <p className="text-xs text-slate-500">Status: {appointment.status}</p>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-900">Medical Timeline</h3>
          <ul className="mt-4 space-y-4">
            {timeline.map((record) => (
              <li key={record._id} className="rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {new Date(record.createdAt).toLocaleString()} • Dr. {record.doctorId?.name}
                </p>
                <p className="mt-1 text-sm text-slate-700">Diagnosis: {record.diagnosis}</p>
                {record.medicines?.length > 0 && (
                  <div className="mt-2 text-xs text-slate-600">
                    {record.medicines.map((med, index) => (
                      <p key={`${record._id}-${index}`}>
                        {med.name} - {med.dosage} ({med.frequency})
                      </p>
                    ))}
                  </div>
                )}
                {record.fileUrl && (
                  <a href={record.fileUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-semibold text-cyan-700 underline">
                    View Lab File
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default PatientDashboard;
