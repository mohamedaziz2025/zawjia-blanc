'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef } from 'react';
import {
  Sparkles, Heart, Shield, Brain, Star, ChevronRight,
  Users, Lock, MessageCircle, Crown, Zap, Check,
} from 'lucide-react';

// ── Animation Variants ─────────────────────────────────────────────────────
const fadeUp   = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16,1,0.3,1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -40 }, show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.16,1,0.3,1] } } };
const stagger  = { show: { transition: { staggerChildren: 0.12 } } };

// ── Geometric Ornament ──────────────────────────────────────────────────────
function GeometricOrn({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} fill="none">
      <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" stroke="rgba(200,56,78,0.18)" strokeWidth="1"/>
      <polygon points="100,30 170,65 170,135 100,170 30,135 30,65" stroke="rgba(200,56,78,0.12)" strokeWidth="1"/>
      <polygon points="100,50 150,75 150,125 100,150 50,125 50,75" stroke="rgba(200,56,78,0.08)" strokeWidth="1"/>
      <circle cx="100" cy="100" r="4" fill="rgba(200,56,78,0.4)"/>
      {[0,60,120,180,240,300].map((a,i) => (
        <circle key={i} cx={100+50*Math.cos(a*Math.PI/180)} cy={100+50*Math.sin(a*Math.PI/180)} r="2" fill="rgba(200,56,78,0.25)"/>
      ))}
    </svg>
  );
}

// ── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, gradient }: {
  icon: React.ElementType; title: string; desc: string; gradient: string;
}) {
  return (
    <motion.div variants={fadeUp}
      className="glass-card p-6 group hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${gradient}`}>
        <Icon size={22} className="text-white"/>
      </div>
      <h3 className="text-gray-800 font-semibold mb-2 text-base">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ── Step ────────────────────────────────────────────────────────────────────
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-4 items-start">
      <div className="flex-shrink-0 w-10 h-10 rounded-full border border-gold-400/40 flex items-center justify-center text-gold-400 font-bold text-sm">
        {n}
      </div>
      <div>
        <h4 className="text-gray-800 font-semibold mb-1">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Pricing Card ────────────────────────────────────────────────────────────
function PricingCard({ name, price, period, features, highlight }: {
  name: string; price: string; period: string; features: string[]; highlight?: boolean;
}) {
  return (
    <motion.div variants={fadeUp}
      className={`relative rounded-2xl p-8 flex flex-col gap-6 ${
        highlight
          ? 'gradient-border shadow-glow-gold'
          : 'glass-card'
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gold-400 text-navy-900 text-xs font-bold px-4 py-1 rounded-full">
          POPULAIRE
        </div>
      )}
      <div>
        <p className="text-gray-500 text-sm mb-1">{name}</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-display font-bold text-gradient-gold">{price}</span>
          <span className="text-gray-400 text-sm">/{period}</span>
        </div>
      </div>
      <ul className="space-y-3 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
            <Check size={14} className="text-emerald-400 flex-shrink-0"/>
            {f}
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={highlight ? 'btn-primary' : 'btn-secondary'}
      >
        Commencer maintenant <ChevronRight size={16}/>
      </Link>
    </motion.div>
  );
}

// ── Floating Particles ──────────────────────────────────────────────────────
function FloatingParticles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 3,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 6,
    opacity: 0.1 + Math.random() * 0.25,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-gold-400"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: p.opacity }}
          animate={{ y: [0, -30, 0], opacity: [p.opacity, p.opacity * 2, p.opacity] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY  = useTransform(scrollYProgress, [0,1], ['0%', '30%']);
  const heroOp = useTransform(scrollYProgress, [0,0.7], [1, 0]);

  const features = [
    { icon: Brain,          title: 'IA Conversationnelle',   desc: 'Nisfi IA vous accompagne à travers 8 phases d\'analyse approfondie pour cerner votre personnalité et vos valeurs.',       gradient: 'bg-gradient-to-br from-navy-600 to-navy-700 shadow-glow-navy' },
    { icon: Heart,          title: 'Matching Valué',         desc: 'Un algorithme sophistiqué calcule la compatibilité profonde entre deux âmes, au-delà des apparences superficielles.',       gradient: 'bg-gradient-to-br from-gold-500/80 to-gold-600 shadow-glow-gold' },
    { icon: Shield,         title: 'Charte Éthique',         desc: 'Chaque membre accepte une charte islamique stricte garantissant une démarche sérieuse et respectueuse.',                   gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-glow-emerald' },
    { icon: Lock,           title: 'Photo Protégée',         desc: 'Votre photo reste cachée jusqu\'à un match réciproque validé. La pudeur est une valeur que nous préservons.',             gradient: 'bg-gradient-to-br from-navy-600 to-navy-700' },
    { icon: Users,          title: 'Système Wali',           desc: 'Le Wali (tuteur) est intégré au processus. Ses coordonnées sont transmises après un match mutuel validé.',                gradient: 'bg-gradient-to-br from-gold-500/80 to-gold-600' },
    { icon: MessageCircle,  title: 'Profil Anonymisé',       desc: 'Les propositions sont anonymes : aucun prénom ni photo avant le match. Seulement des valeurs et de la compatibilité.',    gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600' },
  ];

  const steps = [
    { title: 'Créez votre compte',        desc: 'Inscrivez-vous, renseignez vos informations de base et acceptez la charte éthique islamique.' },
    { title: 'Dialogue avec Nisfi IA',    desc: 'Engagez une conversation guidée sur 8 phases : religion, valeurs, famille, vision du mariage et plus encore.' },
    { title: 'Recevez des propositions',  desc: 'L\'algorithme vous propose jusqu\'à 3 profils compatibles, anonymisés. Vous choisissez librement.' },
    { title: 'Match & Wali',              desc: 'En cas de match réciproque, les familles sont contactées via le Wali pour la suite de la démarche.' },
  ];

  const plans = [
    {
      name: 'Essentiel',
      price: '9,99€',
      period: 'mois',
      features: ['Analyse IA complète (8 phases)', '3 propositions de profil/mois', 'Matching valué', 'Charte éthique'],
    },
    {
      name: 'Premium',
      price: '19,99€',
      period: 'mois',
      features: ['Tout l\'Essentiel', 'Propositions illimitées', 'Révélation photo accélérée', 'Priorité dans l\'algorithme', 'Wali intégré', 'Support dédié'],
      highlight: true,
    },
    {
      name: 'Annuel',
      price: '149€',
      period: 'an',
      features: ['Tout le Premium', '38% d\'économie', 'Accès anticipé aux nouvelles fonctionnalités', 'Badge vérifié'],
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
        className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-4
                   bg-white/80 backdrop-blur-xl border-b border-black/[0.07]"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
              <Sparkles size={16} className="text-gold-400"/>
            </div>
            <span className="font-display font-bold text-gray-900 text-lg tracking-tight">Zawjia</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-500">
            <a href="#features"   className="hover:text-gold-400 transition-colors">Fonctionnalités</a>
            <a href="#how"        className="hover:text-gold-400 transition-colors">Comment ça marche</a>
            <a href="#pricing"    className="hover:text-gold-400 transition-colors">Tarifs</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"    className="btn-secondary text-xs px-4 py-2">Connexion</Link>
            <Link href="/register" className="btn-primary  text-xs px-4 py-2">S&apos;inscrire</Link>
          </div>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-24 pb-16 px-4">
        <FloatingParticles/>

        {/* Background ornaments */}
        <GeometricOrn className="absolute left-[-5%] top-1/4 w-64 opacity-30 animate-spin-slow"/>
        <GeometricOrn className="absolute right-[-5%] bottom-1/4 w-48 opacity-20 animate-spin-slow" style={{ animationDirection: 'reverse' } as React.CSSProperties}/>

        <motion.div style={{ y: heroY, opacity: heroOp }} className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full
                       bg-gold-400/10 border border-gold-400/25 text-gold-400 text-sm font-medium"
          >
            <Sparkles size={14}/> Mariage islamique guidé par l&apos;intelligence artificielle
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16,1,0.3,1] }}
            className="text-5xl sm:text-6xl md:text-7xl font-display font-bold leading-tight mb-6"
          >
            <span className="text-gray-900">Trouvez votre</span>
            <br />
            <span className="text-gradient-hero">moitié selon</span>
            <br />
            <span className="text-gradient-gold">vos valeurs</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-gray-600 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            Zawjia est la première plateforme de mariage islamique qui analyse vos valeurs, 
            votre rapport à la religion et votre vision du foyer grâce à une IA conversationnelle 
            éthique et confidentielle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/register" className="btn-primary px-8 py-4 text-base">
              Commencer gratuitement <ChevronRight size={18}/>
            </Link>
            <Link href="/login" className="btn-secondary px-8 py-4 text-base">
              J&apos;ai déjà un compte
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="mt-16 grid grid-cols-3 divide-x divide-black/10 max-w-md mx-auto"
          >
            {[
              { label: 'Membres', value: '12k+' },
              { label: 'Matchs', value: '3 200+' },
              { label: 'Mariages', value: '480+' },
            ].map(({ label, value }) => (
              <div key={label} className="px-6 text-center">
                <p className="text-2xl font-display font-bold text-gradient-gold">{value}</p>
                <p className="text-xs text-gray-400 mt-1">{label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-gray-400 text-xs">Découvrir</span>
          <motion.div animate={{ y: [0,8,0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 rounded-full border border-gray-300 flex items-start justify-center pt-1.5">
          >
            <div className="w-1 h-2 bg-gold-400 rounded-full"/>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Quote islamique ──────────────────────────────────────────────────── */}
      <motion.section
        initial="hidden" whileInView="show" viewport={{ once: true }}
        variants={fadeUp}
        className="py-12 px-4"
      >
        <div className="max-w-3xl mx-auto text-center glass-card py-10 px-8">
          <p className="font-arabic text-2xl text-gold-400 mb-3 leading-loose">
            وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا
          </p>
          <p className="text-gray-500 text-sm italic">
            « Et parmi Ses signes, Il a créé pour vous des époux tirés de vous-mêmes, pour que vous trouviez en eux la quiétude. »
            <span className="text-gray-400 ml-1 not-italic">— Coran 30:21</span>
          </p>
        </div>
      </motion.section>

      {/* ── Features ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-4">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-medium">
              <Star size={12}/> FONCTIONNALITÉS
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Une plateforme pensée pour <span className="text-gradient-gold">vous</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Chaque fonctionnalité a été conçue pour respecter les valeurs islamiques tout en offrant une expérience moderne et fluide.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => <FeatureCard key={f.title} {...f}/>)}
          </motion.div>
        </motion.div>
      </section>

      {/* ── AI Section (visual) ──────────────────────────────────────────────── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-rose-50/50 to-emerald-50/30"/>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center"
        >
          <motion.div variants={fadeLeft}>
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-medium">
              <Brain size={12}/> NISFI IA
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-5">
              L&apos;intelligence artificielle au service de votre <span className="text-gradient-gold">projet de vie</span>
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              Nisfi IA n&apos;est pas un simple questionnaire. C&apos;est une conversation profonde qui explore vos valeurs, votre rapport à l&apos;Islam, votre vision du mariage et de la famille à travers <strong className="text-gray-800">8 phases progressives</strong>.
            </p>
            <ul className="space-y-3">
              {['Analyse de votre pratique religieuse', 'Exploration de vos valeurs et éthique', 'Vision du rôle conjugal et familial', 'Profil psychologique et de communication', 'Synthèse et score de compatibilité global'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0">
                    <Check size={10} className="text-emerald-400"/>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Chat preview mockup */}
          <motion.div variants={fadeUp} className="glass-card p-6 relative">
            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-black/[0.07]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                <Brain size={18} className="text-white"/>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Nisfi IA</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                  <p className="text-xs text-gray-400">En ligne</p>
                </div>
              </div>
              <div className="ml-auto badge bg-gold-400/10 border border-gold-400/20 text-gold-400">
                Phase 2/8
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tl-sm p-3.5 text-sm text-gray-700 leading-relaxed">
                  Assalamu alaikum ! Je suis Nisfi, votre guide vers un mariage béni. Parlez-moi de votre pratique religieuse au quotidien...
                </div>
              </div>
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-gold-400/15 border border-gold-400/20 rounded-2xl rounded-tr-sm p-3.5 text-sm text-gray-800 leading-relaxed">
                  J&apos;essaie de prier mes 5 prières chaque jour. Le vendredi est particulièrement important pour moi...
                </div>
              </div>
              <div className="flex justify-start">
                <div className="max-w-[80%] bg-gray-100 rounded-2xl rounded-tl-sm p-3.5 text-sm text-gray-700 leading-relaxed">
                  MashaAllah, c&apos;est une belle démarche. Quelle importance accordez-vous à la connaissance islamique dans votre parcours ?
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-gray-50 rounded-xl border border-black/[0.07]">
                <input
                  type="text"
                  placeholder="Répondez à Nisfi..."
                  className="flex-1 bg-transparent text-sm outline-none text-gray-500 placeholder:text-gray-400"
                  readOnly
                />
                <button className="w-7 h-7 rounded-lg bg-gold-400 flex items-center justify-center flex-shrink-0">
                  <ChevronRight size={14} className="text-white"/>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────────── */}
      <section id="how" className="py-20 px-4">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-xs font-medium">
              <Zap size={12}/> PROCESSUS
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Comment ça <span className="text-gradient-gold">fonctionne</span>
            </h2>
          </motion.div>

          <motion.div variants={stagger} className="space-y-8 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-px before:bg-gradient-to-b before:from-gold-400/40 before:via-border before:to-transparent">
            {steps.map((s, i) => <Step key={s.title} n={i+1} {...s}/>)}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-20 px-4 relative">
        <div className="absolute inset-0 pattern-overlay opacity-50"/>
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true, margin: '-100px' }}
          variants={stagger}
          className="max-w-5xl mx-auto relative z-10"
        >
          <motion.div variants={fadeUp} className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-gold-400/10 border border-gold-400/20 text-gold-400 text-xs font-medium">
              <Crown size={12}/> ABONNEMENTS
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900 mb-4">
              Investissez dans votre <span className="text-gradient-gold">avenir commun</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Commencez l&apos;analyse IA gratuitement. Débloquez le matching pour rencontrer votre moitié.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => <PricingCard key={p.name} {...p}/>)}
          </motion.div>
        </motion.div>
      </section>

      {/* ── CTA Footer ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-4">
        <motion.div
          initial="hidden" whileInView="show" viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-2xl mx-auto text-center glass-card py-16 px-8 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gold-400/5 to-emerald-500/5 pointer-events-none"/>
          <GeometricOrn className="absolute right-8 top-8 w-32 opacity-20"/>
          <div className="relative z-10">
            <div className="w-14 h-14 mx-auto mb-6 rounded-2xl bg-gold-400/15 border border-gold-400/30 flex items-center justify-center">
              <Heart size={24} className="text-gold-400"/>
            </div>
            <h2 className="text-3xl font-display font-bold text-gray-900 mb-4">
              Que Allah facilite votre union
            </h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Rejoignez des milliers de musulmans qui ont fait confiance à Zawjia pour trouver leur moitié dans le respect des valeurs islamiques.
            </p>
            <Link href="/register" className="btn-primary px-10 py-4 text-base">
              Commencer mon parcours <ChevronRight size={18}/>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-black/[0.07] py-10 px-4 bg-white/60">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-400/10 border border-gold-400/30 flex items-center justify-center">
              <Sparkles size={13} className="text-gold-400"/>
            </div>
            <span className="font-display font-bold text-gray-900">Zawjia</span>
          </div>
          <p className="text-gray-400 text-xs text-center">
            © 2026 Zawjia — Plateforme de mariage islamique · Tous droits réservés
          </p>
          <div className="flex gap-5 text-xs text-gray-400">
            <a href="#" className="hover:text-gold-400 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-gold-400 transition-colors">CGU</a>
            <a href="#" className="hover:text-gold-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
