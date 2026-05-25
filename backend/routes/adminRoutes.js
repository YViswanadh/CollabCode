const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
const User = require('../models/UserModel');
const Feedback = require('../models/FeedbackModel');
const Document = require('../models/DocumentModel');

const router = express.Router();

// Apply security guard to all admin routes
router.use(verifyToken, isAdmin);

/**
 * GET /api/admin/metrics
 * Returns: Overall dashboard metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalFeedbacks = await Feedback.countDocuments();
    const totalDocuments = await Document.countDocuments();

    // Average feedback score
    const avgFeedback = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$rating' },
        },
      },
    ]);
    const averageRating = avgFeedback.length > 0 ? parseFloat(avgFeedback[0].avgScore.toFixed(2)) : 0;

    // Programming experience levels distribution (exclude administrators)
    const beginnerCount = await User.countDocuments({ role: 'user', experience: 'beginner' });
    const intermediateCount = await User.countDocuments({ role: 'user', experience: 'intermediate' });
    const expertCount = await User.countDocuments({ role: 'user', experience: 'expert' });

    return res.status(200).json({
      success: true,
      metrics: {
        totalUsers,
        totalFeedbacks,
        totalDocuments,
        averageRating,
        experienceBreakdown: {
          beginner: beginnerCount,
          intermediate: intermediateCount,
          expert: expertCount,
        },
      },
    });
  } catch (err) {
    console.error('[Admin API] Metrics aggregation error:', err.message);
    return res.status(500).json({ message: 'Server error during metrics collection.' });
  }
});

/**
 * GET /api/admin/feedbacks
 * Returns: List of all submissions sorted by newest
 */
router.get('/feedbacks', async (req, res) => {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, feedbacks });
  } catch (err) {
    console.error('[Admin API] Get feedbacks error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving feedbacks.' });
  }
});

/**
 * GET /api/admin/users
 * Returns: List of registered users sorted by newest
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error('[Admin API] Get users error:', err.message);
    return res.status(500).json({ message: 'Server error retrieving users.' });
  }
});

/**
 * DELETE /api/admin/feedbacks/:id
 * Deletes a review feedback entry
 */
router.delete('/feedbacks/:id', async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Feedback entry not found.' });
    }
    return res.status(200).json({ success: true, message: 'Feedback entry deleted successfully.' });
  } catch (err) {
    console.error('[Admin API] Delete feedback error:', err.message);
    return res.status(500).json({ message: 'Server error during feedback deletion.' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Deletes a user profile and accounts
 */
router.delete('/users/:id', async (req, res) => {
  try {
    // Avoid deleting oneself
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Operation rejected. You cannot delete your active session.' });
    }

    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'User account not found.' });
    }

    // Clean up corresponding user feedbacks
    await Feedback.deleteMany({ userId: req.params.id });

    return res.status(200).json({ success: true, message: 'User account and review entries cleaned up successfully.' });
  } catch (err) {
    console.error('[Admin API] Delete user error:', err.message);
    return res.status(500).json({ message: 'Server error during user deletion.' });
  }
});

module.exports = router;
