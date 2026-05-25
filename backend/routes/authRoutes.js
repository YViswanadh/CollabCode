const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const router = express.Router();

/**
 * Helper: sign a JWT for the given user document.
 */
const signToken = (user) => {
  return jwt.sign(
    {
      userId: user._id.toString(),
      displayName: user.displayName,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * POST /api/auth/register
 * Body: { displayName, email, password, bio, experience, role }
 * Returns: { token, user: { _id, displayName, email, bio, experience, role } }
 */
router.post('/register', async (req, res) => {
  try {
    const { displayName, email, password, bio, experience, role } = req.body;

    // Basic field validation
    if (!displayName || !email || !password) {
      return res.status(400).json({ message: 'displayName, email and password are all required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Duplicate email check
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Create user — pre-save hook hashes the password automatically
    const user = await User.create({
      displayName,
      email,
      password,
      bio: bio || '',
      experience: experience || 'beginner',
      role: role || 'user',
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        experience: user.experience,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Auth] Register error:', err.message);
    return res.status(500).json({ message: 'Server error during registration.' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Returns: { token, user: { _id, displayName, email } }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Fetch user with password included (it is excluded by default)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = signToken(user);

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        experience: user.experience,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Auth] Login error:', err.message);
    return res.status(500).json({ message: 'Server error during login.' });
  }
});

const { verifyToken } = require('../middleware/authMiddleware');

/**
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 * Returns: { user: { _id, displayName, email, bio, experience, role } }
 * Used to verify session validity against MongoDB.
 */
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Session invalid: User no longer exists.' });
    }
    return res.status(200).json({
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email,
        bio: user.bio,
        experience: user.experience,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('[Auth] verifySession error:', err.message);
    return res.status(500).json({ message: 'Server error verifying active session.' });
  }
});

module.exports = router;
