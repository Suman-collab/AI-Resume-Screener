const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isGuestUser = (user) =>
  Boolean(user?.isGuest) || String(user?.email || '').toLowerCase().endsWith('@guest.local');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const registeredUsersOnly = (req, res, next) => {
  if (req.user && !isGuestUser(req.user)) {
    return next();
  }

  return res.status(403).json({
    message: 'Guest access is limited to ATS score analysis. Please create an account to use this feature.',
  });
};

const hrOnly = (req, res, next) => {
  if (req.user && req.user.role === 'hr') {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as HR' });
  }
};

module.exports = { protect, registeredUsersOnly, hrOnly };
