const express = require('express');
const router = express.Router();
const { getProposals, choose, finalDecision, uploadPhoto, getMyMatches } = require('../controllers/matchingController');
const { protect } = require('../middlewares/authMiddleware');
const { ensureActiveSubscription } = require('../middlewares/subscriptionMiddleware');
const { checkPhotoUnlocked } = require('../middlewares/photoMiddleware');
const upload = require('../utils/storage');

router.get('/proposals', protect, ensureActiveSubscription, getProposals);
router.post('/choose', protect, ensureActiveSubscription, choose);
router.post('/final-decision', protect, ensureActiveSubscription, finalDecision);
router.post('/photo', protect, ensureActiveSubscription, checkPhotoUnlocked, upload.single('photo'), uploadPhoto);
router.get('/my-matches', protect, getMyMatches); // accessible sans abonnement

module.exports = router;