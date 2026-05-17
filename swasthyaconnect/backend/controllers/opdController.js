const mongoose = require('mongoose');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

const normalizeDateOnly = (inputDate) => {
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const emitQueueUpdate = async (io, doctorId, appointmentDate) => {
  if (!io) return;

  const queue = await Appointment.find({
    doctorId,
    appointmentDate,
    status: { $in: ['Pending', 'Confirmed'] },
  })
    .populate('patientId', 'name')
    .sort({ tokenNumber: 1 })
    .lean();

  io.emit('queue:update', {
    doctorId,
    appointmentDate,
    queue,
  });
};

const getDoctors = async (req, res, next) => {
  try {
    const { specialization } = req.query;

    const query = { role: 'doctor' };
    if (specialization) {
      query.specialization = new RegExp(`^${specialization}$`, 'i');
    }

    const doctors = await User.find(query)
      .select('name specialization phone email')
      .sort({ specialization: 1, name: 1 });

    return res.status(200).json({ doctors });
  } catch (error) {
    next(error);
  }
};

const bookAppointment = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { doctorId, appointmentDate, slotTime } = req.body;

    if (!doctorId || !appointmentDate || !slotTime) {
      return res.status(400).json({ message: 'doctorId, appointmentDate, and slotTime are required.' });
    }

    const normalizedDate = normalizeDateOnly(appointmentDate);

    if (!normalizedDate) {
      return res.status(400).json({ message: 'Invalid appointmentDate.' });
    }

    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' }).select('_id');
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found.' });
    }

    let createdAppointment = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        await session.withTransaction(async () => {
          const queueCount = await Appointment.countDocuments({
            doctorId,
            appointmentDate: normalizedDate,
          }).session(session);

          const writeResult = await Appointment.findOneAndUpdate(
            {
              doctorId,
              appointmentDate: normalizedDate,
              slotTime,
              status: { $in: ['Pending', 'Confirmed'] },
            },
            {
              $setOnInsert: {
                patientId: req.user._id,
                doctorId,
                appointmentDate: normalizedDate,
                slotTime,
                status: 'Pending',
                tokenNumber: queueCount + 1,
              },
            },
            {
              upsert: true,
              new: true,
              rawResult: true,
              session,
            }
          );

          if (writeResult.lastErrorObject.updatedExisting) {
            throw new Error('SLOT_ALREADY_BOOKED');
          }

          createdAppointment = writeResult.value;
        });

        break;
      } catch (error) {
        if (error.message === 'SLOT_ALREADY_BOOKED') {
          return res.status(409).json({ message: 'Selected slot is already booked.' });
        }

        if (error.code === 11000 && attempt < 3) {
          continue;
        }

        throw error;
      }
    }

    if (!createdAppointment) {
      return res.status(500).json({ message: 'Could not book appointment. Please retry.' });
    }

    const io = req.app.get('io');
    await emitQueueUpdate(io, doctorId, normalizedDate);

    return res.status(201).json({
      message: 'Appointment booked successfully.',
      appointment: createdAppointment,
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

const getPatientAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate('doctorId', 'name specialization')
      .sort({ appointmentDate: -1, tokenNumber: 1 });

    return res.status(200).json({ appointments });
  } catch (error) {
    next(error);
  }
};

const getDoctorQueue = async (req, res, next) => {
  try {
    const date = req.query.date || new Date();
    const normalizedDate = normalizeDateOnly(date);

    if (!normalizedDate) {
      return res.status(400).json({ message: 'Invalid date.' });
    }

    const doctorId = req.user.role === 'doctor' ? req.user._id : req.query.doctorId;
    if (!doctorId) {
      return res.status(400).json({ message: 'doctorId is required.' });
    }

    const queue = await Appointment.find({
      doctorId,
      appointmentDate: normalizedDate,
      status: { $in: ['Pending', 'Confirmed'] },
    })
      .populate('patientId', 'name phone')
      .sort({ tokenNumber: 1 });

    return res.status(200).json({ queue });
  } catch (error) {
    next(error);
  }
};

const getQueueStatus = async (req, res, next) => {
  try {
    const { appointmentId } = req.params;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found.' });
    }

    if (req.user.role === 'patient' && appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: not your appointment.' });
    }

    const rank = await Appointment.countDocuments({
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      status: { $in: ['Pending', 'Confirmed'] },
      tokenNumber: { $lte: appointment.tokenNumber },
    });

    const totalActiveQueue = await Appointment.countDocuments({
      doctorId: appointment.doctorId,
      appointmentDate: appointment.appointmentDate,
      status: { $in: ['Pending', 'Confirmed'] },
    });

    return res.status(200).json({
      appointmentId,
      status: appointment.status,
      tokenNumber: appointment.tokenNumber,
      rank,
      totalActiveQueue,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  bookAppointment,
  getPatientAppointments,
  getDoctorQueue,
  getQueueStatus,
};
