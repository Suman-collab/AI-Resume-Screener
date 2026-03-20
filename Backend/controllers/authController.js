const User = require('../models/User');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return 'user';
  }

  const normalized = role.trim().toLowerCase().replace(/[`'"]/g, '');
  return ['user', 'hr'].includes(normalized) ? normalized : 'user';
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const formatAuthResponse = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  token: generateToken(user._id),
});

const createGuestIdentity = () => {
  const guestId = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

  return {
    name: 'Guest User',
    email: `guest+${guestId}@guest.local`,
  };
};

const verifyGoogleCredential = async (credential) => {
  const { data } = await axios.get('https://oauth2.googleapis.com/tokeninfo', {
    params: { id_token: credential },
    timeout: 10000,
  });

  const isEmailVerified =
    data?.email_verified === true ||
    data?.email_verified === 'true' ||
    data?.verified_email === true ||
    data?.verified_email === 'true';

  if (!data?.email || !isEmailVerified) {
    throw new Error('Google account email is not verified');
  }

  if (process.env.GOOGLE_CLIENT_ID && data.aud !== process.env.GOOGLE_CLIENT_ID) {
    throw new Error('Google token audience mismatch');
  }

  return data;
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  const normalizedRole = normalizeRole(role);

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all fields' });
  }

  if (!['user', 'hr'].includes(normalizedRole)) {
    return res.status(400).json({ message: 'Role must be either user or hr' });
  }

  // Check if user exists
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: normalizedRole,
  });

  if (user) {
    res.status(201).json(formatAuthResponse(user));
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    if (user?.googleId) {
      return res.status(401).json({ message: 'Use Google sign-in for this account' });
    }

    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  res.json(formatAuthResponse(user));
};

// @desc    Continue as guest
// @route   POST /api/auth/guest
// @access  Public
const guestAuth = async (_req, res) => {
  const guestIdentity = createGuestIdentity();

  const guestUser = await User.create({
    ...guestIdentity,
    role: 'user',
  });

  return res.status(201).json({
    ...formatAuthResponse(guestUser),
    isGuest: true,
  });
};

// @desc    Authenticate or register with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res) => {
  const { credential, role } = req.body;

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google authentication is not configured on the server' });
  }

  try {
    const googleProfile = await verifyGoogleCredential(credential);
    const normalizedRole = normalizeRole(role);
    let isNewUser = false;

    let user = await User.findOne({ email: googleProfile.email });

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: googleProfile.name || googleProfile.email.split('@')[0],
        email: googleProfile.email,
        role: normalizedRole,
        googleId: googleProfile.sub,
        avatar: googleProfile.picture || null,
      });
    } else {
      user.googleId = user.googleId || googleProfile.sub;
      user.avatar = googleProfile.picture || user.avatar;
      user.name = user.name || googleProfile.name || user.email.split('@')[0];
      await user.save();
    }

    return res.status(isNewUser ? 201 : 200).json(formatAuthResponse(user));
  } catch (error) {
    const providerMessage =
      error.response?.data?.error_description ||
      error.response?.data?.error ||
      error.message ||
      'Google authentication failed';

    console.error('Google auth failed:', error.response?.data || error.message);
    return res.status(401).json({ message: providerMessage });
  }
};

// @desc    Get user data
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = {
  registerUser,
  loginUser,
  guestAuth,
  googleAuth,
  getUserProfile,
};
