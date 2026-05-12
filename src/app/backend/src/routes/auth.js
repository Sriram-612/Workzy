const router = require('express').Router();
const controller = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { asyncHandler } = require('../utils/asyncHandler');
const { registerSchema, loginSchema } = require('../validators/schemas');

router.post('/register', validate(registerSchema), asyncHandler(controller.register));
router.post('/login', validate(loginSchema), asyncHandler(controller.login));
router.get('/me', authenticateToken, asyncHandler(controller.me));
router.post('/logout', authenticateToken, asyncHandler(controller.logout));

module.exports = router;
