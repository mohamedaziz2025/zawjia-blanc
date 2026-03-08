const express = require('express');
const router = express.Router();
const { register, login, acceptCharter, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../utils/validators');

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/accept-charter', protect, acceptCharter);
router.delete('/delete-account', protect, deleteAccount);

module.exports = router;