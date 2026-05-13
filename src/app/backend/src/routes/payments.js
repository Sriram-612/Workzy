const router = require('express').Router();
const c = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { createPaymentSchema, verifyPaymentSchema, updatePaymentStatusSchema } = require('../validators/schemas');

router.post('/webhook', asyncHandler(c.webhook));

router.post('/create-payment', authenticateToken, validate(createPaymentSchema), asyncHandler(c.createPayment));
router.post('/verify', authenticateToken, validate(verifyPaymentSchema), asyncHandler(c.verify));
router.get('/project/:projectId', authenticateToken, asyncHandler(c.getProjectPayment));
router.get('/user/:userId', authenticateToken, asyncHandler(c.getUserPayments));
router.patch('/status', authenticateToken, validate(updatePaymentStatusSchema), asyncHandler(c.updateStatus));

router.get('/history', authenticateToken, asyncHandler(c.history));
router.get('/stats', authenticateToken, asyncHandler(c.stats));

module.exports = router;
