'use client';
import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Sparkles, Heart, Shield, Brain, ChevronRight,
  Check,
  MapPin, Menu, X,
} from 'lucide-react';

// ── Background Ornament ─────────────────────────────────────────────────────
function GeometricOrn({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" className={className} style={style} fill="none">
      <polygon points="100,10 190,55 190,145 100,190 10,145 10,55" stroke="rgba(220,38,38,0.1)" strokeWidth="1"/>
      <circle cx="100" cy="100" r="4" fill="rgba(220,38,38,0.2)"/>
      {[0,60,120,180,240,300].map((a,i) => (
        <circle key={i} cx={100+50*Math.cos(a*Math.PI/180)} cy={100+50*Math.sin(a*Math.PI/180)} r="2" fill="rgba(220,38,38,0.15)"/>
      ))}
    </svg>
  );
}

// ── Profile Card Component ──────────────────────────────────────────────────
function ProfileCard({ name, age, location, image, isMatch = false, delay = 0 }: {
  name: string; age: number; location: string; image: string; isMatch?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: isMatch ? 5 : -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: isMatch ? 2 : -2 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      className={`relative w-64 h-[380px] md:w-72 md:h-[420px] rounded-[2.5rem] overflow-hidden shadow-2xl transition-transform hover:scale-105 cursor-pointer ${isMatch ? 'z-20 border-4 border-white' : 'z-10 opacity-90'}`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2">
        <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1">
          <Check size={10} className="text-green-400 fill-current" />
          <span className="text-[10px] text-white font-bold uppercase">Vérifié</span>
        </div>
      </div>
      <div className="absolute bottom-6 left-6 right-6 z-20 text-white text-left">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-xl md:text-2xl font-black">{name}, {age}</h3>
          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
            <Check size={12} className="text-white" strokeWidth={4} />
          </div>
        </div>
        <div className="flex items-center gap-1 text-white/80 text-xs">
          <MapPin size={12} /><span>{location}</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Match Overlay ───────────────────────────────────────────────────────────
function MatchOverlay() {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      className="absolute -right-8 md:-right-12 top-10 z-30 bg-[#FF4D6D] text-white p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl max-w-[240px] md:max-w-[280px] border-4 border-white"
    >
      <div className="flex justify-center mb-4">
        <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
          <Heart className="fill-white" size={32} />
        </div>
      </div>
      <h4 className="text-lg md:text-xl font-black text-center mb-2 leading-tight">Belle compatibilité</h4>
      <p className="text-white/80 text-center text-[10px] md:text-xs mb-6 font-medium">Un profil aligné avec vos valeurs essentielles vient d&apos;être trouvé.</p>
      <button className="w-full bg-white text-[#FF4D6D] py-3 rounded-2xl font-black text-sm shadow-lg hover:bg-gray-50 transition-colors">
        Voir le profil
      </button>
    </motion.div>
  );
}

// ── Feature Card ────────────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc, gradient }: {
  icon: React.ElementType; title: string; desc: string; gradient: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="bg-white/70 backdrop-blur-md border border-red-50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all cursor-default text-left"
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${gradient}`}>
        <Icon size={26} className="text-white"/>
      </div>
      <h3 className="text-gray-900 font-black mb-3 text-lg italic tracking-tight">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </motion.div>
  );
}

// ── Step Component ──────────────────────────────────────────────────────────
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex gap-6 items-start group text-left"
    >
      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 font-black text-lg group-hover:bg-rose-600 group-hover:text-white transition-colors duration-500">
        {n}
      </div>
      <div>
        <h4 className="text-gray-900 font-black mb-2 text-xl italic tracking-tight">{title}</h4>
        <p className="text-gray-500 text-sm leading-relaxed max-w-xl">{desc}</p>
      </div>
    </motion.div>
  );
}

// ── Pricing Card ────────────────────────────────────────────────────────────
function PricingCard({ name, price, period, features, highlight }: {
  name: string; price: string; period: string; features: string[]; highlight?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-[2.5rem] p-10 flex flex-col gap-8 transition-all duration-500 ${
        highlight
          ? 'bg-gradient-to-b from-rose-600 to-rose-800 text-white shadow-2xl shadow-rose-900/20'
          : 'bg-white border border-rose-50 shadow-sm'
      }`}
    >
      {highlight && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-rose-600 text-[10px] font-black tracking-widest uppercase px-6 py-2 rounded-full shadow-md">
          RECOMMANDÉ
        </div>
      )}
      <div className="text-left">
        <p className={`${highlight ? 'text-rose-100' : 'text-gray-400'} text-xs font-bold tracking-widest uppercase mb-2`}>{name}</p>
        <div className="flex items-baseline gap-1">
          <span className={`text-5xl font-black ${highlight ? 'text-white' : 'text-gray-900'}`}>{price}</span>
          <span className={`${highlight ? 'text-rose-200' : 'text-gray-400'} text-sm`}>/{period}</span>
        </div>
      </div>
      <ul className="space-y-4 flex-1 text-left">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-3 text-sm font-medium">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${highlight ? 'bg-white/20' : 'bg-rose-50'}`}>
              <Check size={12} className={highlight ? 'text-white' : 'text-rose-600'}/>
            </div>
            <span className={highlight ? 'text-rose-50' : 'text-gray-600'}>{f}</span>
          </li>
        ))}
      </ul>
      <Link
        href="/register"
        className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
          highlight
            ? 'bg-white text-rose-600 hover:bg-rose-50'
            : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-600/20'
        }`}
      >
        Choisir ce plan <ChevronRight size={18}/>
      </Link>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = ['Concept', 'Sécurité', 'Tarifs'];

  const featuresList = [
    { icon: Brain,         title: 'Nisfi IA Intelligente', desc: 'Une conversation approfondie pour cerner votre personnalité et vos attentes spirituelles.',       gradient: 'bg-rose-600' },
    { icon: Heart,         title: 'Matching de Valeurs',   desc: 'Notre algorithme privilégie la compatibilité profonde au-delà des simples apparences.',           gradient: 'bg-rose-500' },
    { icon: Shield,        title: 'Pudeur & Sécurité',     desc: 'Vos photos sont floutées par défaut. Vous gardez le contrôle total sur votre image.',            gradient: 'bg-rose-700' },
  ];

  const plansList = [
    { name: 'Essentiel',  price: '0€',  period: 'gratuit', features: ['Profilage IA (Partiel)', 'Profil anonyme', 'Charte éthique signée'] },
    { name: 'Premium',    price: '19€', period: 'mois',    features: ['IA complète Nisfi', 'Matchs illimités', 'Lien Wali automatique', 'Priorité algorithmique'], highlight: true },
    { name: 'Saisonnier', price: '45€', period: '3 mois',  features: ['Tout le Premium', 'Économie de 20%', 'Badge Vérifié Gold', 'Conseils personnalisés'] },
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-rose-100 selection:text-rose-900 overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 inset-x-0 z-50 px-4 md:px-6 py-4 md:py-6 flex justify-center"
      >
        <div className="w-full max-w-6xl bg-white/80 backdrop-blur-2xl border border-white/40 px-5 md:px-8 py-3 md:py-4 rounded-full shadow-lg shadow-black/[0.03]">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Heart size={24} className="text-rose-600 fill-rose-600" />
              <span className="font-black text-xl md:text-2xl tracking-tighter text-gray-900 italic">zawjia</span>
            </div>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-gray-500">
              {navLinks.map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-rose-600 transition-colors">{item}</a>
              ))}
            </div>

            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/login" className="text-[10px] md:text-xs font-black tracking-widest uppercase px-5 py-3 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all">
                Connexion
              </Link>
              <Link href="/register" className="bg-rose-600 text-white text-[10px] md:text-xs font-black tracking-widest uppercase px-6 py-3 rounded-full shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all active:scale-95">
                S&apos;inscrire
              </Link>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="sm:hidden p-2 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile dropdown menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="sm:hidden overflow-hidden"
              >
                <div className="pt-4 pb-2 flex flex-col gap-3">
                  {navLinks.map(item => (
                    <a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-xs font-black uppercase tracking-widest text-gray-500 hover:text-rose-600 transition-colors px-2 py-1"
                    >
                      {item}
                    </a>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center text-[10px] font-black tracking-widest uppercase px-4 py-3 rounded-full border border-rose-200 text-rose-600 hover:bg-rose-50 transition-all">
                      Connexion
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 text-center bg-rose-600 text-white text-[10px] font-black tracking-widest uppercase px-4 py-3 rounded-full shadow-lg shadow-rose-600/20 hover:bg-rose-700 transition-all">
                      S&apos;inscrire
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* ── Hero Section ────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative pt-32 md:pt-48 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <GeometricOrn className="absolute -left-20 top-20 w-96 opacity-20 animate-spin-slow" />
        <GeometricOrn className="absolute -right-20 bottom-0 w-80 opacity-20 animate-spin-slow" style={{ animationDirection: 'reverse' } as React.CSSProperties} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-rose-50/50 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <motion.div style={{ y: heroY }} className="lg:w-1/2 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black tracking-widest uppercase"
            >
              <Sparkles size={12} /> Mariage Noble & Intelligence Artificielle
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-gray-900 leading-[0.95] mb-8 tracking-tighter"
            >
              Rencontrez votre <br />
              <span className="text-rose-600 italic">destin</span>.
            </motion.h1>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-10 text-center lg:text-left"
            >
              <p className="text-2xl md:text-4xl font-serif text-gray-800 leading-relaxed italic mb-4" dir="rtl">
                &ldquo;وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا&rdquo;
              </p>
              <p className="text-gray-500 text-lg md:text-xl font-medium max-w-xl">
                La plateforme qui réinvente la rencontre noble. Un algorithme fondé sur la Sunnah et vos valeurs profondes.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
            >
              <Link href="/register" className="w-full sm:w-auto bg-rose-600 text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-rose-600/30 hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                Commencer <ChevronRight size={22} />
              </Link>
              <Link href="/login" className="p-4 bg-gray-100 text-gray-900 rounded-2xl hover:scale-105 transition-transform font-black text-xs uppercase tracking-widest px-6">
                Connexion
              </Link>
            </motion.div>
          </motion.div>

          {/* Cards Visual */}
          <div className="lg:w-1/2 relative flex justify-center items-center h-[500px] md:h-[600px]">
            <div className="relative">
              <ProfileCard
                name="Adnan" age={26} location="Paris"
                image="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=600&fit=crop"
                delay={0.6}
              />
              <div className="absolute top-10 left-12 md:left-24">
                <ProfileCard
                  name="Salma" age={24} location="Lyon"
                  image="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=600&fit=crop"
                  isMatch delay={0.8}
                />
                <MatchOverlay />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quranic Wisdom ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-rose-50/50 backdrop-blur-sm border border-rose-100 p-12 rounded-[3.5rem] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Heart size={200} className="text-rose-900" />
            </div>
            <p className="text-3xl md:text-4xl text-rose-900 font-serif mb-8 italic leading-relaxed">
              &laquo;&nbsp;Et parmi Ses signes, Il a créé pour vous des épouses issues de vous-mêmes pour que vous trouviez auprès d&apos;elles le repos.&nbsp;&raquo;
            </p>
            <div className="h-px w-24 bg-rose-200 mx-auto mb-6" />
            <p className="text-rose-900/60 font-black tracking-widest uppercase text-[10px]">Sourate Ar-Rum — Verset 21</p>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid ───────────────────────────────────────────────────── */}
      <section id="concept" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 italic tracking-tighter">Conçu pour l&apos;excellence</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">Chaque détail de Zawjia allie technologie de pointe et respect absolu de nos traditions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresList.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── Process Section ─────────────────────────────────────────────────── */}
      <section id="sécurité" className="py-32 bg-gray-50/50 relative">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-12">
            <div className="text-left">
              <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 italic tracking-tighter">
                Votre <span className="text-rose-600">chemin</span> guidé
              </h2>
              <p className="text-gray-500 text-lg font-medium">Un processus fluide, sécurisé et guidé par Nisfi IA étape par étape.</p>
            </div>
            <div className="space-y-10">
              <Step n={1} title="Profilage par Nisfi IA"  desc="Une conversation intelligente pour comprendre vos attentes spirituelles et familiales réelles." />
              <Step n={2} title="Matching Intelligent"     desc="Notre algorithme filtre les profils ayant une compatibilité d'âme supérieure à 85%." />
              <Step n={3} title="Échange Respectueux"      desc="Discutez dans un cadre sécurisé. La photo n'est révélée qu'après un accord mutuel." />
              <Step n={4} title="Lien avec le Wali"        desc="Nous facilitons la mise en relation officielle avec la famille pour concrétiser l'union." />
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: 2 }}
            whileInView={{ opacity: 1, rotate: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute inset-0 bg-rose-600 rounded-[3rem] rotate-3 scale-95 opacity-5" />
            <div className="relative bg-white border border-rose-100 p-8 rounded-[3.5rem] shadow-2xl">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center">
                  <Brain className="text-white" />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-gray-900 italic">Nisfi IA</h4>
                  <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">• En ligne</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-rose-50 p-5 rounded-3xl rounded-tl-none max-w-[85%] text-sm text-rose-900 font-medium leading-relaxed text-left">
                  Assalam alaykoum ! Je suis Nisfi. Pour comprendre votre profil, dites-moi quelle place occupe la prière dans votre futur foyer ?
                </div>
                <div className="bg-gray-50 p-5 rounded-3xl rounded-tr-none ml-auto max-w-[85%] text-sm text-gray-600 leading-relaxed italic border border-gray-100 text-right">
                  C&apos;est mon pilier central. Je cherche quelqu&apos;un pour qui la spiritualité est un moteur quotidien...
                </div>
                <div className="pt-4 flex gap-2">
                  <div className="flex-1 bg-gray-50 rounded-2xl px-4 py-4 text-[10px] text-gray-400 border border-gray-100 text-left font-bold uppercase tracking-widest">Écrivez ici...</div>
                  <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <ChevronRight size={24} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────────── */}
      <section id="tarifs" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 italic tracking-tighter">Investissez pour la vie</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">L&apos;analyse IA est gratuite pour tous. Choisissez un plan pour débloquer les rencontres illimitées.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plansList.map((p, i) => <PricingCard key={i} {...p} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-32 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto bg-gray-900 rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(225,29,72,0.15),transparent)]" />
          <div className="relative z-10">
            <Heart className="mx-auto text-rose-600 mb-8" size={64} fill="currentColor" />
            <h2 className="text-4xl md:text-7xl font-black text-white mb-8 tracking-tighter italic">
              Prêt à compléter <br />votre foi ?
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium">
              Rejoignez une communauté de musulmans sérieux et trouvez l&apos;âme qui marchera à vos côtés vers l&apos;excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/register" className="bg-rose-600 text-white px-12 py-6 rounded-3xl font-black text-xl hover:bg-rose-700 transition-all shadow-xl shadow-rose-600/30 active:scale-95">
                S&apos;inscrire gratuitement
              </Link>
              <Link href="/login" className="bg-white/10 text-white border border-white/20 px-12 py-6 rounded-3xl font-black text-xl hover:bg-white/20 transition-all">
                Connexion
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="py-24 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/20">
                <Heart size={20} className="text-white fill-current" />
              </div>
              <span className="font-black text-2xl text-gray-900 tracking-tighter italic">zawjia</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs text-center md:text-left font-medium">
              La première plateforme de mariage islamique guidée par l&apos;intelligence artificielle.
            </p>
          </div>
          <div className="flex gap-12 text-[10px] font-black tracking-widest uppercase text-gray-400">
            <a href="#" className="hover:text-rose-600 transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-rose-600 transition-colors">CGU</a>
            <a href="#" className="hover:text-rose-600 transition-colors">Charte</a>
          </div>
          <div className="text-[10px] font-black tracking-widest text-gray-300 uppercase">
            © 2026 ZAWJIA — BÂTI POUR L&apos;ÉTERNITÉ
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,800&display=swap');
        body { scroll-behavior: smooth; }
        .animate-spin-slow { animation: spin 40s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
