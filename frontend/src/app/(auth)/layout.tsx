'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, Shield, Zap, Heart } from 'lucide-react';

const FEATURES = [
  { icon: Zap,     text: 'Analyse IA sur 8 phases approfondies' },
  { icon: Heart,   text: 'Matching basé sur la compatibilité réelle' },
  { icon: Shield,  text: 'Système Wali intégré et sécurisé' },
  { icon: Sparkles,text: 'Confidentialité et pudeur garanties' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ─────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-14 relative overflow-hidden"
           style={{ background: 'linear-gradient(160deg, #fdf4f5 0%, #fff5f5 50%, #fdf9f9 100%)' }}>

        {/* Aurora orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute w-[600px] h-[600px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(200,56,78,0.08) 0%, transparent 70%)',
              top: '-15%', left: '-20%',
            }}
            animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0.6, 0.8] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute w-[400px] h-[400px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(200,56,78,0.07) 0%, transparent 70%)',
              bottom: '-10%', right: '-10%',
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
          <motion.div
            className="absolute w-[300px] h-[300px] rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(45,125,82,0.07) 0%, transparent 70%)',
              top: '40%', right: '10%',
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          />
        </div>

        {/* Geometric rotating rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute border rounded-full"
              style={{
                width:  180 + i * 110,
                height: 180 + i * 110,
                borderColor: `rgba(200,56,78,${0.06 - i * 0.01})`,
              }}
              animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
              transition={{ duration: 30 + i * 12, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>

        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-30 pointer-events-none" />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}
          className="relative z-10"
        >
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                 style={{ background: 'rgba(200,56,78,0.15)', border: '1px solid rgba(200,56,78,0.35)', boxShadow: '0 0 20px rgba(200,56,78,0.2)' }}>
              <Sparkles size={18} className="text-gold-400"/>
            </div>
            <span className="font-display font-bold text-gray-900 text-xl tracking-tight">Zawjia</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16,1,0.3,1] }}
          className="relative z-10 space-y-10"
        >
          <div className="space-y-5">
            <p className="font-arabic text-2xl leading-loose" style={{ color: 'rgba(200,56,78,0.9)' }}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h2 className="font-display font-bold text-gray-900 leading-tight"
                style={{ fontSize: 'clamp(1.6rem,3vw,2.2rem)', letterSpacing: '-0.03em' }}>
              Votre chemin vers<br/>un mariage béni
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: '#6b7280' }}>
              Zawjia allie valeurs islamiques et intelligence artificielle pour vous accompagner dans une démarche sérieuse et pudique.
            </p>
          </div>

          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.08, ease: [0.16,1,0.3,1] }}
                className="flex items-center gap-3.5 text-sm"
                style={{ color: '#374151' }}
              >
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                     style={{ background: 'rgba(200,56,78,0.12)', border: '1px solid rgba(200,56,78,0.25)' }}>
                  <Icon size={13} style={{ color: '#C8384E' }}/>
                </div>
                {text}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="relative z-10 text-xs"
          style={{ color: '#9ca3af' }}
        >
          © 2026 Zawjia — Plateforme de mariage islamique
        </motion.p>
      </div>

      {/* ── Right form panel ───────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto"
           style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(200,56,78,0.04) 0%, transparent 60%), #f8f7f4' }}>
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
          >
            <Link href="/" className="flex lg:hidden items-center gap-2.5 mb-10 justify-center group">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                   style={{ background: 'rgba(200,56,78,0.12)', border: '1px solid rgba(200,56,78,0.3)', boxShadow: '0 0 16px rgba(200,56,78,0.18)' }}>
                <Sparkles size={16} className="text-gold-400"/>
              </div>
              <span className="font-display font-bold text-gray-900 text-lg tracking-tight">Zawjia</span>
            </Link>
          </motion.div>
          {children}
        </div>
      </div>
    </div>
  );
}

