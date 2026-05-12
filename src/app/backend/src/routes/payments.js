const router = require('express').Router();
const c = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { paymentIntentSchema } = require('../validators/schemas');

router.post('/create-intent', authenticateToken, validate(paymentIntentSchema), asyncHandler(c.createPaymentIntent));
router.post('/confirm', authenticateToken, asyncHandler(c.confirmPayment));
router.post('/projects/:id/release', authenticateToken, asyncHandler(c.releaseEscrow));
router.get('/history', authenticateToken, asyncHandler(c.history));
router.get('/stats', authenticateToken, asyncHandler(c.stats));

module.exports = router;
