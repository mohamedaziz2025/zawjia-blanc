const express = require('express');
const router = express.Router();
const { chat, getMyProfile, getAiQuestionnaire } = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');
const { checkAiLimit } = require('../middlewares/aiLimitMiddleware');
const validate = require('../middlewares/validate');
const { aiChatSchema } = require('../utils/validators');

router.post('/chat', protect, checkAiLimit, validate(aiChatSchema), chat);
router.get('/profile', protect, getMyProfile);
router.get('/questionnaire', protect, getAiQuestionnaire);

module.exports = router;