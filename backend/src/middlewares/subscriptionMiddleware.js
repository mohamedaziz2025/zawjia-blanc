exports.ensureActiveSubscription = (req, res, next) => {
  if (req.user && req.user.subscriptionStatus === 'active') {
    return next();
  }
  return res.status(402).json({ message: 'Subscription required' });
};