const router = require('express').Router();
const c = require('../controllers/projectController');
const payments = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

router.get('/user', authenticateToken, asyncHandler(c.getUserProjects));
router.get('/stats/overview', authenticateToken, asyncHandler(c.stats));
router.get('/:id', authenticateToken, asyncHandler(c.getProject));
router.patch('/:id/status', authenticateToken, asyncHandler(c.updateStatus));
router.post('/:id/sign-agreement', authenticateToken, asyncHandler(c.signAgreement));
router.post('/:id/release-escrow', authenticateToken, asyncHandler(payments.releaseEscrow));
router.post('/:id/delivery', authenticateToken, asyncHandler(c.submitDelivery));

module.exports = router;
