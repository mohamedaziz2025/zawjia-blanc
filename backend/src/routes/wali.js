const express = require('express');
const router = express.Router();
const { addWali, verifyWali, getWaliContact } = require('../controllers/waliController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { waliSchema } = require('../utils/validators');

router.post('/add', protect, validate(waliSchema), addWali);
router.patch('/verify/:id', verifyWali); // appel via lien email
router.get('/contact/:matchId', protect, getWaliContact); // frère récupère le contact du wali

module.exports = router;