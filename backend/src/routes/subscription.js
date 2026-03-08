const express = require('express');
const router = express.Router();
const { createCheckout, webhook, status } = require('../controllers/subscriptionController');
const { protect } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validate');
const { subscriptionSchema } = require('../utils/validators');

router.post('/create-checkout', protect, validate(subscriptionSchema), createCheckout);
router.post('/webhook', webhook);
router.get('/status', protect, status);

module.exports = router;