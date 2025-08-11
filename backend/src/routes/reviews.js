const express = require('express');
const router = express.Router();

// Placeholder for review routes
// TODO: Implement review creation and management

/**
 * @route   POST /api/reviews
 * @desc    Create a review
 * @access  Private
 */
router.post('/', (req, res) => {
    res.json({
        success: true,
        message: 'Review routes - Coming soon'
    });
});

module.exports = router;