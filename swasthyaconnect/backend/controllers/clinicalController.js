const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');

const getTimeline = async (req, res, next) => {
  try {
    const requestedPatientId = req.query.patientId || req.user._id;

    if (req.user.role === 'patient' && requestedPatientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: cannot view other patients timeline.' });
    }

    const records = await MedicalRecord.find({ patientId: requestedPatientId })
      .populate('doctorId', 'name specialization')
      .populate('appointmentId', 'appointmentDate slotTime status tokenNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({ records });
  } catch (error) {
    next(error);
  }
};

const submitMedicalRecord = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { appointmentId, diagnosis, medicines, instructions } = req.body;

    if (!appointmentId || !diagnosis) {
      return res.status(400).json({ message: 'appointmentId and diagnosis are required.' });
    }

    const parsedMedicines = Array.isArray(medicines)
      ? medicines
      : typeof medicines === 'string' && medicines.trim()
        ? JSON.parse(medicines)
        : [];

    let resultRecord;

    await session.withTransaction(async () => {
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        doctorId: req.user._id,
      }).session(session);

      if (!appointment) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      if (appointment.status === 'Completed') {
        throw new Error('ALREADY_COMPLETED');
      }

      resultRecord = await MedicalRecord.create(
        [
          {
            appointmentId: appointment._id,
            patientId: appointment.patientId,
            doctorId: req.user._id,
            diagnosis,
            medicines: parsedMedicines,
            instructions: instructions || '',
          },
        ],
        { session }
      );

      appointment.status = 'Completed';
      await appointment.save({ session });
    });

    const io = req.app.get('io');
    if (io) {
      io.emit('appointment:completed', {
        appointmentId,
      });
    }

    return res.status(201).json({
      message: 'Medical record submitted successfully.',
      record: resultRecord[0],
    });
  } catch (error) {
    if (error.message === 'APPOINTMENT_NOT_FOUND') {
      return res.status(404).json({ message: 'Appointment not found for this doctor.' });
    }

    if (error.message === 'ALREADY_COMPLETED') {
      return res.status(409).json({ message: 'Appointment already completed.' });
    }

    if (error instanceof SyntaxError) {
      return res.status(400).json({ message: 'medicines must be valid JSON.' });
    }

    next(error);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getTimeline,
  submitMedicalRecord,
};
