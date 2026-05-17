const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    triageLevel: {
      type: String,
      enum: ['Red', 'Yellow', 'Green'],
      required: true,
      index: true,
    },
    assignedBed: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Waiting', 'Admitted', 'Discharged'],
      default: 'Waiting',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model('Emergency', emergencySchema);
