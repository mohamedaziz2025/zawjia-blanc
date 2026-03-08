require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');

// ── Seed admin par défaut ────────────────────────────────────────────────────
async function seedAdmin() {
  try {
    const User = require('./src/models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@Zawjia.com';
    const existing   = await User.findOne({ role: 'admin' });
    if (existing) {
      console.log(`✅  Compte admin existant → ${existing.email}`);
      return;
    }
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    await User.create({
      role:               'admin',
      email:              adminEmail,
      password:           adminPassword,
      firstName:          'Admin',
      hasAcceptedCharter: true,
      isVerified:         true,
      profileCompleted:   true,
    });
    console.log(`✅  Compte admin créé → ${adminEmail} / ${adminPassword}`);
  } catch (err) {
    console.error('Erreur seed admin:', err.message);
  }
}
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3001')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, server-to-server)
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(Object.assign(new Error(`CORS: origin '${origin}' not allowed`), { status: 403 }));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Sécurité ────────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate-limit global (100 req / 15 min par IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(globalLimiter);

// Rate-limit strict pour l'auth (20 req / 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many auth attempts, please try again later.' },
});

// ── Parsers ─────────────────────────────────────────────────────────────────────
// rawBody nécessaire pour la vérification du webhook Stripe
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true }));

// ── Fichiers statiques (uploads) ────────────────────────────────────────────────
// Les fichiers ne sont accessibles que par les routes sécurisées ;
// ce dossier statique ne sert que pour les assets publics éventuels.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Base de données ─────────────────────────────────────────────────────────────
const connectDB = require('./src/config/db');mongoose.connection.once('open', seedAdmin);connectDB();

// ── Routes ──────────────────────────────────────────────────────────────────────
app.use('/auth', authLimiter, require('./src/routes/auth'));
app.use('/ai', require('./src/routes/ai'));
app.use('/subscription', require('./src/routes/subscription'));
app.use('/matching', require('./src/routes/matching'));
app.use('/wali', require('./src/routes/wali'));
app.use('/admin', require('./src/routes/admin'));
app.use('/user', require('./src/routes/user'));

// ── Gestionnaire d'erreurs global ───────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅  Server running on port ${PORT}`);
});