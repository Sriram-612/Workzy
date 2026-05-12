const router = require('express').Router();
const c = require('../controllers/reviewController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { reviewSchema } = require('../validators/schemas');

router.post('/', authenticateToken, validate(reviewSchema), asyncHandler(c.createReview));
router.get('/given', authenticateToken, asyncHandler(c.givenReviews));
router.get('/user/:userId', asyncHandler(c.userReviews));
router.get('/project/:projectId', authenticateToken, asyncHandler(c.projectReviews));
router.get('/stats/:userId', asyncHandler(c.reviewStats));

module.exports = router;
