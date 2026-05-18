const crypto = require('crypto');

const ROLE_ALIASES = {
  patient: 'patient',
  staff: 'doctor',
  doctor: 'doctor',
};

const OTP_LENGTH = 6;
const OTP_RESEND_WINDOW_SECONDS = 180;
const OTP_EXPIRY_SECONDS = 600;

const normalizeRole = (role) => {
  if (!role) {
    return null;
  }

  return ROLE_ALIASES[String(role).trim().toLowerCase()] || null;
};

const normalizeMobileNumber = (mobileNumber) => {
  const digits = String(mobileNumber || '').replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return digits.length > 10 ? digits.slice(-10) : digits;
};

const generateOtpCode = (length = OTP_LENGTH) => {
  const max = 10 ** length;
  return String(crypto.randomInt(0, max)).padStart(length, '0');
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const buildPlaceholderCredentials = ({ mobileNumber, role }) => {
  const safeDigits = normalizeMobileNumber(mobileNumber) || crypto.randomBytes(4).toString('hex');
  const roleTag = role === 'doctor' ? 'staff' : 'patient';

  return {
    email: `otp-${roleTag}-${safeDigits}@swasthyaconnect.local`,
    name: role === 'doctor' ? 'Swasthya Staff Member' : 'Swasthya Patient',
  };
};

const sendOtpNotification = async ({ mobileNumber, role, otp, onboardingRequired }) => {
  const deliveryMode = process.env.OTP_DELIVERY_MODE || 'console';

  if (deliveryMode === 'console' || process.env.NODE_ENV !== 'production') {
    console.log(
      `[OTP:${deliveryMode}] ${role} -> ${mobileNumber} | code=${otp} | onboarding=${onboardingRequired ? 'yes' : 'no'}`
    );
  }

  return {
    deliveryMode,
    delivered: true,
  };
};

module.exports = {
  OTP_EXPIRY_SECONDS,
  OTP_RESEND_WINDOW_SECONDS,
  buildPlaceholderCredentials,
  generateOtpCode,
  hashOtp,
  normalizeMobileNumber,
  normalizeRole,
  sendOtpNotification,
};