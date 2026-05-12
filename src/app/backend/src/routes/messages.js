const router = require('express').Router();
const c = require('../controllers/messageController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { upload } = require('../middleware/upload');
const { asyncHandler } = require('../utils/asyncHandler');
const { messageSchema } = require('../validators/schemas');

router.post('/', authenticateToken, validate(messageSchema), asyncHandler(c.sendMessage));
router.get('/conversations', authenticateToken, asyncHandler(c.conversations));
router.get('/conversations/:conversationId', authenticateToken, asyncHandler(c.conversationMessages));
router.get('/unread/count', authenticateToken, asyncHandler(c.unreadCount));
router.post('/upload', authenticateToken, upload.single('attachment'), (req, res) => {
  res.json({
    message: 'File uploaded successfully',
    url: `/uploads/${req.file.filename}`,
    filename: req.file.originalname,
    size: req.file.size
  });
});

module.exports = router;
