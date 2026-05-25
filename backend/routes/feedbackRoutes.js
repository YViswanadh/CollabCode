const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const Feedback = require('../models/FeedbackModel');

const router = express.Router();

/**
 * POST /api/feedback
 * Secure: Requires valid JWT token
 * Body: { rating, comments }
 * Returns: { success: true, feedback }
 */
router.post('/', verifyToken, async (req, res) => {
  try {
    const { rating, comments } = req.body;
    const { userId, displayName, email } = req.user;

    // Validate request inputs
    if (rating === undefined || !comments) {
      return res.status(400).json({ message: 'Rating and comments are both required fields.' });
    }

    const ratingVal = Number(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ message: 'Rating must be a valid number between 1 and 5 stars.' });
    }

    if (comments.trim().length === 0) {
      return res.status(400).json({ message: 'Comments cannot be empty.' });
    }

    // Create review entry
    const newFeedback = await Feedback.create({
      userId,
      displayName,
      email,
      rating: ratingVal,
      comments: comments.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully. Thank you for your review!',
      feedback: newFeedback,
    });
  } catch (err) {
    console.error('[Feedback] Submission error:', err.message);
    return res.status(500).json({ message: 'Server error during feedback submission.' });
  }
});

module.exports = router;
