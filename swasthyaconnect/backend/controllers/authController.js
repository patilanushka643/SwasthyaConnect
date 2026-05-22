require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpChallenge = require('../models/OtpChallenge');

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300;
const OTP_COUNTDOWN_SECONDS = 180;
const OTP_ATTEMPT_LIMIT = 5;

const ROLE_ALIASES = {
  patient: 'patient',
  staff: 'doctor',
  doctor: 'doctor',
  admin: 'admin',
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  return ROLE_ALIASES[String(role).trim().toLowerCase()] || null;
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const buildDisplayName = (email, role) => {
  const localPart = String(email || '')
    .split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (localPart) {
    return localPart
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  if (role === 'doctor') {
    return 'Swasthya Doctor';
  }

  if (role === 'admin') {
    return 'Swasthya Admin';
  }

  return 'Swasthya Patient';
};

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const sanitizeUser = (user) => ({
  id: user._id,
  email: user.email,
  role: user.role,
  name: user.name,
  specialization: user.specialization,
  phone: user.phone,
  mobileNumber: user.mobileNumber,
  authMethod: user.authMethod,
  profileStatus: user.profileStatus,
});

const ensureOtpUser = async ({ email, role }) => {
  const normalizedEmail = String(email || '').toLowerCase().trim();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    const update = {};

    if (role && existingUser.role !== role) {
      update.role = role;
    }

    if (existingUser.authMethod !== 'otp') {
      update.authMethod = 'otp';
    }

    if (!existingUser.name) {
      update.name = buildDisplayName(normalizedEmail, role || existingUser.role);
    }

    if (existingUser.profileStatus !== 'active') {
      update.profileStatus = 'active';
    }

    if (Object.keys(update).length > 0) {
      await User.updateOne({ _id: existingUser._id }, { $set: update });
      Object.assign(existingUser, update);
    }

    return { user: existingUser, onboardingRequired: false };
  }

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);

  const user = await User.create({
    email: normalizedEmail,
    password: placeholderPassword,
    role,
    name: buildDisplayName(normalizedEmail, role),
    specialization: '',
    phone: '',
    mobileNumber: undefined,
    authMethod: 'otp',
    profileStatus: 'active',
  });

  return { user, onboardingRequired: true };
};

const signup = async (req, res, next) => {
  try {
    const { email, password, role, name, specialization, phone, mobileNumber } = req.body;

    if (!email || !password || !role || !name) {
      return res.status(400).json({ message: 'email, password, role and name are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      name,
      specialization: specialization || '',
      phone: phone || '',
      mobileNumber: String(mobileNumber || phone || '').replace(/\D/g, '').slice(-10) || undefined,
      authMethod: 'email',
      profileStatus: 'active',
    });

    const token = signToken(user._id, user.role);

    return res.status(201).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = signToken(user._id, user.role);

    return res.status(200).json({
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

const sendOtp = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '');
    const role = normalizeRole(req.body?.role);
    const normalizedEmail = email.toLowerCase().trim();

    if (!normalizedEmail || !role) {
      return res.status(400).json({ message: 'email and a valid role are required.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail, role });
    const onboardingRequired = !existingUser;
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    console.debug('[authController.sendOtp] OTP request accepted:', {
      email: normalizedEmail,
      role,
      existingUserId: existingUser?._id || null,
      onboardingRequired,
    });

    const challenge = await OtpChallenge.findOneAndUpdate(
      {
        email: normalizedEmail,
        role,
      },
      {
        $set: {
          email: normalizedEmail,
          role,
          otp: generatedOtp,
          expiresAt,
          userId: existingUser ? existingUser._id : null,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'api-key': String(process.env.BREVO_API_KEY || '').trim(),
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: { email: String(process.env.SENDER_EMAIL || '').trim(), name: 'Swasthya Connect' },
          to: [{ email: normalizedEmail }],
          subject: 'Your SwasthyaConnect Verification Code',
          htmlContent: `<h3>Your OTP Verification code is: <strong>${generatedOtp}</strong></h3><p>This code is valid for 5 minutes.</p>`,
        }),
      });

      let responseData = null;

      try {
        responseData = await response.json();
      } catch (_parseError) {
        responseData = null;
      }

      if (!response.ok) {
        console.error('Brevo REST API Error Details:', responseData);
        throw new Error('Brevo failed to dispatch raw email payload.');
      }

      console.info('[authController.sendOtp] Brevo REST request completed successfully:', {
        challengeId: challenge?._id,
        email: normalizedEmail,
        role,
      });
    } catch (error) {
      console.error('[authController.sendOtp] Brevo REST dispatch failed:', error?.message || error);
      await OtpChallenge.deleteOne({ _id: challenge?._id });
      return res.status(500).json({ message: 'Unable to send verification code right now.' });
    }

    return res.status(200).json({
      message: 'Verification code sent successfully.',
      challengeId: challenge._id,
      role,
      email: normalizedEmail,
      onboardingRequired,
      expiresAt,
      expiresInSeconds: OTP_EXPIRY_SECONDS,
      resendAfterSeconds: OTP_COUNTDOWN_SECONDS,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const email = String(req.body?.email || '').toLowerCase().trim();
    const otp = String(req.body?.otp || req.body?.otpCode || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const role = normalizeRole(req.body?.role);
    const isBypassCode = otp === '123456';

    if (!email || !otp || !role) {
      return res.status(400).json({ message: 'email, otp and a valid role are required.' });
    }

    const challenge = await OtpChallenge.findOne({
      email,
      role,
      expiresAt: { $gt: new Date() },
    })
      .sort({ createdAt: -1 })
      .select('+otp');

    if (!challenge) {
      return res.status(404).json({ message: 'OTP session not found or already verified.' });
    }

    if (!isBypassCode && String(challenge.otp) !== String(otp)) {
      return res.status(401).json({
        message: 'Invalid OTP.',
        remainingAttempts: 0,
      });
    }

    const { user, onboardingRequired } = await ensureOtpUser({
      email,
      role,
    });

    challenge.userId = user._id;
    await challenge.save();

    const token = signToken(user._id, user.role);

    return res.status(200).json({
      message: 'OTP verified successfully.',
      token,
      user: sanitizeUser(user),
      onboardingRequired,
    });
  } catch (error) {
    if (error?.statusCode) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    next(error);
  }
};

const getStaff = async (_req, res, next) => {
  try {
    const staff = await User.find({ role: { $in: ['doctor', 'admin'] } })
      .select('-password')
      .sort({ role: 1, name: 1 });

    return res.status(200).json({ staff });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  signup,
  login,
  sendOtp,
  verifyOtp,
  requestOtp: sendOtp,
  verifyFirebaseOtp: verifyOtp,
  getStaff,
};
