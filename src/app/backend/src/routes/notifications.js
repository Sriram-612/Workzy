const router = require('express').Router();
const c = require('../controllers/notificationController');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../utils/asyncHandler');

router.get('/', authenticateToken, asyncHandler(c.list));
router.get('/unread/count', authenticateToken, asyncHandler(c.unreadCount));
router.patch('/read-all', authenticateToken, asyncHandler(c.markAllRead));
router.patch('/:id/read', authenticateToken, asyncHandler(c.markRead));
router.delete('/:id', authenticateToken, asyncHandler(c.remove));

module.exports = router;
