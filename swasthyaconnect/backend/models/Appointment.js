const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
      index: true,
    },
    slotTime: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

appointmentSchema.index(
  { doctorId: 1, appointmentDate: 1, slotTime: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['Pending', 'Confirmed'] },
    },
  }
);

appointmentSchema.index({ doctorId: 1, appointmentDate: 1, tokenNumber: 1 }, { unique: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
