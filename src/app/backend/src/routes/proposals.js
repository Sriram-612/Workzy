const router = require('express').Router();
const controller = require('../controllers/proposalController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { proposalSchema, proposalStatusSchema, hireResponseSchema } = require('../validators/schemas');

router.post('/', authenticateToken, requireRole(['FREELANCER']), validate(proposalSchema), asyncHandler(controller.createProposal));
router.get('/job/:jobId', authenticateToken, asyncHandler(controller.getJobProposals));
router.get('/user/sent', authenticateToken, requireRole(['FREELANCER']), asyncHandler(controller.getUserProposals));
router.post('/:id/hire-offer', authenticateToken, requireRole(['CLIENT']), asyncHandler(controller.sendHireOffer));
router.post('/:id/hire-response', authenticateToken, requireRole(['FREELANCER']), validate(hireResponseSchema), asyncHandler(controller.respondHireOffer));
router.patch('/:id/status', authenticateToken, validate(proposalStatusSchema), asyncHandler(controller.updateStatus));
router.post('/:id/accept', authenticateToken, requireRole(['CLIENT']), asyncHandler(controller.accept));
router.post('/:id/reject', authenticateToken, requireRole(['CLIENT']), asyncHandler(controller.reject));

module.exports = router;
