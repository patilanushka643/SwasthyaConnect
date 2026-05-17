const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
});

const signup = async (req, res, next) => {
  try {
    const { email, password, role, name, specialization, phone } = req.body;

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
  getStaff,
};
