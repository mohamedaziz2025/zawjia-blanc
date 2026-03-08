const Subscription = require('../models/Subscription');
const User = require('../models/User');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const PLAN_DURATIONS_MS = {
  monthly: 30 * 24 * 60 * 60 * 1000,
  yearly:  365 * 24 * 60 * 60 * 1000,
};

exports.createCheckout = async (req, res) => {
  const { plan } = req.body; // 'monthly' or 'yearly'
  const priceId = plan === 'yearly' ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
  if (!priceId) return res.status(400).json({ message: 'Price not configured' });

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer_email: req.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { plan, userId: req.user._id.toString() },
    success_url: `${process.env.FRONTEND_URL}/subscription-success`,
    cancel_url: `${process.env.FRONTEND_URL}/subscription-cancel`,
  });
  res.json({ url: session.url });
};

exports.webhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const plan = session.metadata?.plan || 'monthly';
      const userId = session.metadata?.userId;
      const user = userId
        ? await User.findById(userId)
        : await User.findOne({ email: session.customer_email });
      if (user) {
        const durationMs = PLAN_DURATIONS_MS[plan] ?? PLAN_DURATIONS_MS.monthly;
        user.subscriptionStatus = 'active';
        user.matchingUnlocked = true;
        user.subscriptionEndDate = new Date(Date.now() + durationMs);
        await user.save();
        await Subscription.create({
          userId: user._id,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          plan,
          status: 'active',
          startDate: new Date(),
          endDate: user.subscriptionEndDate,
        });
      }
      break;
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const sub = await Subscription.findOne({ stripeSubscriptionId: invoice.subscription });
      if (sub) {
        const durationMs = PLAN_DURATIONS_MS[sub.plan] ?? PLAN_DURATIONS_MS.monthly;
        sub.endDate = new Date(Date.now() + durationMs);
        sub.status = 'active';
        await sub.save();
        await User.findByIdAndUpdate(sub.userId, {
          subscriptionStatus: 'active',
          subscriptionEndDate: sub.endDate,
          matchingUnlocked: true,
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const stripeSub = event.data.object;
      const sub = await Subscription.findOne({ stripeSubscriptionId: stripeSub.id });
      if (sub) {
        sub.status = 'canceled';
        await sub.save();
        await User.findByIdAndUpdate(sub.userId, {
          subscriptionStatus: 'expired',
          matchingUnlocked: false,
        });
      }
      break;
    }
    default:
      // ignore
      break;
  }

  res.json({ received: true });
};

exports.status = async (req, res) => {
  const sub = await Subscription.findOne({ userId: req.user._id, status: 'active' });
  res.json({
    subscriptionStatus: req.user.subscriptionStatus,
    subscriptionEndDate: req.user.subscriptionEndDate,
    plan: sub?.plan || null,
  });
};