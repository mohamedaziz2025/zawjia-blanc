const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  banUser,
  unbanUser,
  getMatches,
  getSubscriptions,
  getWalis,
  verifyWali,
  getAiLogs,
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/adminModerationMiddleware');

router.use(protect, isAdmin);

// dashboard
router.get('/stats', getStats);

// users
router.get('/users', getUsers);
router.patch('/ban/:id', banUser);
router.patch('/unban/:id', unbanUser);

// matches
router.get('/matches', getMatches);

// subscriptions
router.get('/subscriptions', getSubscriptions);

// walis
router.get('/walis', getWalis);
router.patch('/walis/verify/:id', verifyWali);

// AI logs
router.get('/ai-logs', getAiLogs);

module.exports = router;