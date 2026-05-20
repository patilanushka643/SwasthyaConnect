require('dotenv').config();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Brevo = require('@getbrevo/brevo');
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

const generateOtpCode = (length = OTP_LENGTH) => {
  const max = 10 ** length;
  return String(crypto.randomInt(0, max)).padStart(length, '0');
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

const getBrevoConfig = () => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || process.env.BREVO_SENDER_EMAIL || process.env.BREVO_FROM_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || 'SwasthyaConnect Care';

  if (!apiKey) {
    throw new Error('BREVO_API_KEY is not configured.');
  }

  if (!senderEmail) {
    throw new Error('SENDER_EMAIL is not configured.');
  }

  return {
    apiKey,
    senderEmail,
    senderName,
  };
};

const buildOtpEmailHtml = ({ email, otp, role }) => {
  const roleLabel = role === 'doctor' ? 'Doctor' : role === 'admin' ? 'Admin' : 'Patient';

  return `
    <div style="margin:0;background:#f6fbf8;padding:32px 0;font-family:Arial,Helvetica,sans-serif;color:#11322f;">
      <div style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #d6e9df;border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(17,50,47,0.08);">
        <div style="background:linear-gradient(135deg,#1f7a5e,#0f4f55);padding:28px 32px;color:#ffffff;">
          <div style="font-size:12px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.9;">SwasthyaConnect</div>
          <h1 style="margin:10px 0 0;font-size:28px;line-height:1.2;">Your secure verification code</h1>
        </div>
        <div style="padding:32px;">
          <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">Hello ${email},</p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.7;">Use the one-time verification code below to sign in as <strong>${roleLabel}</strong>.</p>
          <div style="margin:28px 0;padding:22px;border-radius:16px;background:#f0faf6;border:1px solid #bfe6d8;text-align:center;">
            <div style="font-size:13px;letter-spacing:0.14em;text-transform:uppercase;color:#2f6f5c;margin-bottom:8px;">Verification Code</div>
            <div style="font-size:42px;line-height:1;font-weight:700;letter-spacing:0.24em;color:#0f4f55;">${otp}</div>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.7;color:#4c6660;">This code expires in ${Math.ceil(OTP_EXPIRY_SECONDS / 60)} minutes. If you did not request this login, you can safely ignore this email.</p>
        </div>
      </div>
    </div>
  `;
};

const buildOtpEmailText = ({ email, otp, role }) => {
  const roleLabel = role === 'doctor' ? 'Doctor' : role === 'admin' ? 'Admin' : 'Patient';

  return [
    'SwasthyaConnect verification code',
    '',
    `Hello ${email},`,
    `Use this code to sign in as ${roleLabel}: ${otp}`,
    `This code expires in ${Math.ceil(OTP_EXPIRY_SECONDS / 60)} minutes.`,
    'If you did not request this email, you can ignore it.',
  ].join('\n');
};

const sendBrevoOtpEmail = async ({ email, otp, role }) => {
  const { apiKey, senderEmail, senderName } = getBrevoConfig();
  const apiClient = Brevo.ApiClient.instance;
  apiClient.authentications['api-key'].apiKey = apiKey;

  const transactionalEmailsApi = new Brevo.TransactionalEmailsApi();
  const sendSmtpEmail = new Brevo.SendSmtpEmail();

  sendSmtpEmail.sender = {
    name: senderName,
    email: senderEmail,
  };
  sendSmtpEmail.to = [{ email }];
  sendSmtpEmail.subject = 'Your SwasthyaConnect verification code';
  sendSmtpEmail.htmlContent = buildOtpEmailHtml({ email, otp, role });
  sendSmtpEmail.textContent = buildOtpEmailText({ email, otp, role });

  await transactionalEmailsApi.sendTransacEmail(sendSmtpEmail);
};

const findUserByEmailAndRole = async ({ email, role }) => {
  return User.findOne({ email, role });
};

const ensureOtpUser = async ({ email, role }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser && existingUser.role !== role) {
    const error = new Error('This email is already registered with a different role.');
    error.statusCode = 409;
    throw error;
  }

  if (existingUser) {
    const update = {};

    if (existingUser.authMethod !== 'otp') {
      update.authMethod = 'otp';
    }

    if (!existingUser.name) {
      update.name = buildDisplayName(email, role);
    }

    if (Object.keys(update).length > 0) {
      await User.updateOne({ _id: existingUser._id }, { $set: update });
      Object.assign(existingUser, update);
    }

    return { user: existingUser, onboardingRequired: false };
  }

  const placeholderPassword = await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 12);

  const user = await User.create({
    email,
    password: placeholderPassword,
    role,
    name: buildDisplayName(email, role),
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
    const email = normalizeEmail(req.body?.email);
    const role = normalizeRole(req.body?.role);

    if (!email || !role) {
      return res.status(400).json({ message: 'email and a valid role are required.' });
    }

    const existingUserByRole = await findUserByEmailAndRole({ email, role });
    const userWithSameEmail = await User.findOne({ email });

    if (!existingUserByRole && userWithSameEmail && userWithSameEmail.role !== role) {
      return res.status(409).json({ message: 'This email is already registered with a different role.' });
    }

    const now = new Date();
    const otp = generateOtpCode();
    const expiresAt = new Date(now.getTime() + OTP_EXPIRY_SECONDS * 1000);

    const challenge = await OtpChallenge.create({
      email,
      role,
      otp,
      expiresAt,
      userId: existingUserByRole ? existingUserByRole._id : null,
    });

    try {
      await sendBrevoOtpEmail({ email, otp, role });
    } catch (error) {
      await OtpChallenge.deleteMany({ _id: challenge._id });
      throw error;
    }

    return res.status(200).json({
      message: 'Verification code sent successfully.',
      challengeId: challenge._id,
      role,
      email,
      onboardingRequired: !existingUserByRole,
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
    const email = normalizeEmail(req.body?.email);
    const otp = String(req.body?.otp || req.body?.otpCode || '').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const role = normalizeRole(req.body?.role);

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

    if (String(challenge.otp) !== String(otp)) {
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
