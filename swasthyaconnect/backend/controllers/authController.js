const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OtpChallenge = require('../models/OtpChallenge');
const {
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_WINDOW_SECONDS,
  buildPlaceholderCredentials,
  generateOtpCode,
  hashOtp,
  normalizeMobileNumber,
  normalizeRole,
  sendOtpNotification,
} = require('../utils/otpService');

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

const findUserByMobileAndRole = async ({ mobileNumber, role }) => {
  return User.findOne({
    role,
    $or: [{ mobileNumber }, { phone: mobileNumber }],
  });
};

const ensureOtpUser = async ({ mobileNumber, role, onboardingRequired }) => {
  const existingUser = await findUserByMobileAndRole({ mobileNumber, role });

  if (existingUser) {
    const update = {};

    if (!existingUser.mobileNumber) {
      update.mobileNumber = mobileNumber;
    }

    if (!existingUser.phone) {
      update.phone = mobileNumber;
    }

    if (Object.keys(update).length > 0) {
      await User.updateOne({ _id: existingUser._id }, { $set: update });
      Object.assign(existingUser, update);
    }

    return { user: existingUser, onboardingRequired: false };
  }

  const placeholder = buildPlaceholderCredentials({ mobileNumber, role });
  const hashedPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);

  const user = await User.create({
    email: placeholder.email,
    password: hashedPassword,
    role,
    name: placeholder.name,
    phone: mobileNumber,
    mobileNumber,
    authMethod: 'otp',
    profileStatus: onboardingRequired ? 'pending' : 'active',
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
      mobileNumber: normalizeMobileNumber(mobileNumber || phone || ''),
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

const requestOtp = async (req, res, next) => {
  try {
    const rawMobileNumber = req.body.mobileNumber;
    const role = normalizeRole(req.body.role);
    const mobileNumber = normalizeMobileNumber(rawMobileNumber);

    if (!mobileNumber || !role) {
      return res.status(400).json({ message: 'mobileNumber and a valid role are required.' });
    }

    const existingUser = await findUserByMobileAndRole({ mobileNumber, role });
    const onboardingRequired = !existingUser;
    const now = new Date();

    const currentChallenge = await OtpChallenge.findOne({
      mobileNumber,
      role,
      verifiedAt: null,
      expiresAt: { $gt: now },
    });

    if (currentChallenge && currentChallenge.resendAvailableAt > now) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((currentChallenge.resendAvailableAt.getTime() - now.getTime()) / 1000)
      );

      return res.status(429).json({
        message: 'Please wait before requesting a new OTP.',
        retryAfterSeconds,
        challengeId: currentChallenge._id,
        onboardingRequired,
      });
    }

    const otp = generateOtpCode();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);
    const resendAvailableAt = new Date(now.getTime() + OTP_RESEND_WINDOW_SECONDS * 1000);

    const challenge = await OtpChallenge.findOneAndUpdate(
      { mobileNumber, role, verifiedAt: null },
      {
        $set: {
          mobileNumber,
          role,
          otpHash: hashOtp(otp),
          expiresAt,
          resendAvailableAt,
          attempts: 0,
          verifiedAt: null,
          onboardingRequired,
          userId: existingUser ? existingUser._id : null,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    await sendOtpNotification({
      mobileNumber,
      role,
      otp,
      onboardingRequired,
    });

    return res.status(200).json({
      message: 'OTP generated successfully.',
      challengeId: challenge._id,
      role,
      mobileNumber,
      onboardingRequired,
      expiresAt: challenge.expiresAt,
      resendAvailableAt: challenge.resendAvailableAt,
      resendAfterSeconds: OTP_RESEND_WINDOW_SECONDS,
      debugOtp: process.env.NODE_ENV === 'production' ? undefined : otp,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { challengeId, otp, mobileNumber: rawMobileNumber, role: rawRole } = req.body;
    const role = normalizeRole(rawRole);
    const mobileNumber = normalizeMobileNumber(rawMobileNumber);

    if (!challengeId || !otp || !mobileNumber || !role) {
      return res.status(400).json({ message: 'challengeId, otp, mobileNumber and role are required.' });
    }

    const challenge = await OtpChallenge.findOne({
      _id: challengeId,
      mobileNumber,
      role,
      verifiedAt: null,
    }).select('+otpHash');

    if (!challenge) {
      return res.status(404).json({ message: 'OTP session not found or already verified.' });
    }

    const now = new Date();

    if (challenge.expiresAt <= now) {
      return res.status(410).json({ message: 'OTP expired. Please request a new code.' });
    }

    if (challenge.attempts >= 5) {
      return res.status(429).json({ message: 'Too many invalid OTP attempts. Request a new code.' });
    }

    if (challenge.otpHash !== hashOtp(otp)) {
      challenge.attempts += 1;
      await challenge.save();

      return res.status(401).json({
        message: 'Invalid OTP.',
        remainingAttempts: Math.max(0, 5 - challenge.attempts),
      });
    }

    const { user, onboardingRequired } = await ensureOtpUser({
      mobileNumber,
      role,
      onboardingRequired: challenge.onboardingRequired,
    });

    challenge.verifiedAt = now;
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
  requestOtp,
  verifyOtp,
  getStaff,
};
