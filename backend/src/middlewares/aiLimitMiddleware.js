
exports.checkAiLimit = (req, res, next) => {
  if (!req.user.hasAcceptedCharter) {
    return res.status(403).json({ message: 'Vous devez accepter la charte islamique Nisfi avant d\'utiliser l\'IA.' });
  }
  next();
};