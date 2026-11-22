const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, updateAvatar } = require('../controllers/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');

router.get('/me', verifyToken, getProfile);
router.put('/me', verifyToken, updateProfile);
router.post('/me/avatar', verifyToken, upload.single('avatar'), updateAvatar);

module.exports = router;