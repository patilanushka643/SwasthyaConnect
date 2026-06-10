const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['scheduled', 'active', 'completed'],
      default: 'scheduled',
      index: true,
    },
    roomToken: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

consultationSchema.index({ patientId: 1, staffId: 1, scheduledAt: 1 });

module.exports = mongoose.model('Consultation', consultationSchema);