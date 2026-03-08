const Match = require('../models/Match');

exports.checkPhotoUnlocked = async (req, res, next) => {
  const { matchId } = req.body;
  if (!matchId) return res.status(400).json({ message: 'matchId required' });
  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: 'Match not found' });
  if (!match.photoUnlocked) return res.status(403).json({ message: 'Photo not unlocked yet' });
  next();
};