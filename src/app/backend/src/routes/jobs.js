const router = require('express').Router();
const controller = require('../controllers/jobController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { jobSchema } = require('../validators/schemas');

router.get('/user/posted', authenticateToken, requireRole(['CLIENT']), asyncHandler(controller.userPostedJobs));
router.post('/', authenticateToken, requireRole(['CLIENT']), validate(jobSchema), asyncHandler(controller.createJob));
router.get('/', asyncHandler(controller.listJobs));
router.get('/:id', asyncHandler(controller.getJob));
router.put('/:id', authenticateToken, requireRole(['CLIENT']), asyncHandler(controller.updateJob));
router.delete('/:id', authenticateToken, requireRole(['CLIENT']), asyncHandler(controller.deleteJob));

module.exports = router;
