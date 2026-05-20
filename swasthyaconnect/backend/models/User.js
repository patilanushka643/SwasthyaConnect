const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['patient', 'doctor', 'admin'],
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    specialization: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
      maxlength: 20,
    },
    mobileNumber: {
      type: String,
      trim: true,
      default: undefined,
      index: true,
    },
    authMethod: {
      type: String,
      enum: ['email', 'otp'],
      default: 'email',
    },
    profileStatus: {
      type: String,
      enum: ['active', 'pending'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ role: 1, mobileNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model('User', userSchema);
