const router = require('express').Router();
const controller = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { profileSchema, lookupEmailQuerySchema } = require('../validators/schemas');

router.get('/search/freelancers', asyncHandler(controller.searchFreelancers));
router.get('/lookup', authenticateToken, validate(lookupEmailQuerySchema), asyncHandler(controller.lookupByEmail));
router.put('/profile', authenticateToken, validate(profileSchema), asyncHandler(controller.updateProfile));
router.post('/avatar', authenticateToken, upload.single('avatar'), asyncHandler(controller.uploadAvatar));
router.get('/:id', asyncHandler(controller.getProfile));

module.exports = router;
