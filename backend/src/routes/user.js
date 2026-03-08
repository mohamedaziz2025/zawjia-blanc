const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, uploadProfilePhoto } = require('../controllers/userController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { updateProfileSchema } = require('../utils/validators');
const upload = require('../utils/storage');

router.get('/me', protect, getProfile);
router.patch('/me', protect, validate(updateProfileSchema), updateProfile);

router.post('/me/photo', protect, upload.single('photo'), uploadProfilePhoto);

module.exports = router;