const Wali = require('../models/Wali');
const Match = require('../models/Match');
const User = require('../models/User');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Ajouter un wali (sœur uniquement, après match final) ───────────────────────
exports.addWali = async (req, res) => {
  const { fullName, phone, email, matchId } = req.body;
  if (req.user.role !== 'female') {
    return res.status(400).json({ message: 'Seules les sœurs peuvent désigner un wali.' });
  }

  // Vérifier que le match est bien en statut 'matched' avec photo débloquée
  if (matchId) {
    const match = await Match.findById(matchId);
    if (!match || !match.photoUnlocked) {
      return res.status(400).json({ message: 'Le match doit être accepté avant de désigner un wali.' });
    }
  }

  const wali = await Wali.create({
    femaleUserId: req.user._id,
    matchId: matchId || null,
    fullName,
    phone,
    email,
  });

  // Envoyer l'email de vérification au wali
  const verifyUrl = `${process.env.FRONTEND_URL}/wali/verify/${wali._id}`;
  transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: '[Nisfi] Vérification de votre rôle de tuteur (wali)',
    text: `Assalamou alaykoum ${fullName},\n\nUne sœur sur la plateforme Nisfi a indiqué votre nom comme tuteur (wali) dans le cadre d'un projet matrimonial sérieux.\n\nPour confirmer votre rôle et autoriser la transmission de vos coordonnées, veuillez cliquer sur le lien suivant :\n${verifyUrl}\n\nBarakAllahou fikoum.\nL'équipe Nisfi`,
  }).catch((err) => console.error('Email wali error', err));

  res.status(201).json({ message: 'Wali ajouté. Un email de vérification lui a été envoyé.', waliId: wali._id });
};

// ── Vérifier le wali (via lien email) et transmettre le contact au frère ───────
exports.verifyWali = async (req, res) => {
  const { id } = req.params;
  const wali = await Wali.findById(id);
  if (!wali) return res.status(404).json({ message: 'Wali introuvable.' });

  wali.verified = true;
  await wali.save();

  // Transmettre les coordonnées du wali au frère si on a un matchId
  if (wali.matchId) {
    const match = await Match.findById(wali.matchId).populate('user1').populate('user2');
    if (match) {
      // user1 = male (par convention définie dans matchingController)
      const brother = await User.findById(match.user1._id || match.user1);
      if (brother) {
        transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: brother.email,
          subject: '[Nisfi] Coordonnées du tuteur (wali) — Contact autorisé',
          text: `Assalamou alaykoum,\n\nLe wali de votre sœur a confirmé son rôle. Voici ses coordonnées pour prendre contact dans un cadre islamique approprié :\n\nNom : ${wali.fullName}\nTéléphone : ${wali.phone}\nEmail : ${wali.email}\n\nNisfi a accompli son rôle. La suite appartient à Allah et à vos familles.\nBarakAllahou fikoum.\nL'équipe Nisfi`,
        }).catch((err) => console.error('Email frère wali error', err));

        // Marquer comme transmis
        wali.transferredToMale = true;
        await wali.save();
      }
    }
  }

  res.json({ message: 'Wali vérifié. Les coordonnées ont été transmises au frère.' });
};

// ── Récupérer le contact du wali (frère, après match accepté des deux côtés) ───
exports.getWaliContact = async (req, res) => {
  const { matchId } = req.params;
  const me = req.user;

  if (me.role !== 'male') {
    return res.status(403).json({ message: 'Réservé aux frères.' });
  }

  const match = await Match.findById(matchId);
  if (!match) return res.status(404).json({ message: 'Match introuvable.' });
  if (!match.user1.equals(me._id)) {
    return res.status(403).json({ message: 'Vous n\'êtes pas associé à ce match.' });
  }
  if (!match.photoUnlocked) {
    return res.status(403).json({ message: 'Match non encore accepté des deux côtés.' });
  }

  const wali = await Wali.findOne({ matchId, verified: true });
  if (!wali) {
    return res.status(404).json({ message: 'Le wali n\'a pas encore été désigné ou vérifié.' });
  }

  res.json({
    fullName: wali.fullName,
    phone: wali.phone,
    email: wali.email,
  });
};
