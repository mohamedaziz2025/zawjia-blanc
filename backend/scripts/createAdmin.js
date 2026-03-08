/**
 * Script de création / réinitialisation du compte admin.
 * Usage : node scripts/createAdmin.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@Zawjia.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123456';

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connecté');

  // Supprime tout compte admin existant
  const deleted = await User.deleteMany({ role: 'admin' });
  if (deleted.deletedCount > 0) {
    console.log(`🗑️  ${deleted.deletedCount} ancien(s) compte(s) admin supprimé(s)`);
  }

  // Crée le compte admin frais (le hook pre-save hache le mot de passe)
  const admin = await User.create({
    role:               'admin',
    email:              ADMIN_EMAIL,
    password:           ADMIN_PASSWORD,
    firstName:          'Admin',
    hasAcceptedCharter: true,
    isVerified:         true,
    profileCompleted:   true,
  });

  console.log('✅ Compte admin créé avec succès');
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Password : ${ADMIN_PASSWORD}`);
  console.log(`   ID       : ${admin._id}`);

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
