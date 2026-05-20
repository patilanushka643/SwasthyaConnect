const mongoose = require('mongoose');

const otpChallengeSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

otpChallengeSchema.index({ email: 1, role: 1, createdAt: -1 });

module.exports = mongoose.model('OtpChallenge', otpChallengeSchema);