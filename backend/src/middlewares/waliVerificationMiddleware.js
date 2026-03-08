exports.waliVerified = (req, res, next) => {
  // placeholder logic: assume wali info in request
  if (req.user && req.user.role === 'female') {
    // check if wali verified; maybe attach wali object earlier
    if (req.wali && req.wali.verified) {
      return next();
    }
    return res.status(403).json({ message: 'Wali not verified' });
  }
  next();
};