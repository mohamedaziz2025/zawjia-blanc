'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { userApi, aiApi, matchingApi, subscriptionApi } from '@/lib/api';
import {
  Brain, Heart, Crown, ChevronRight, CheckCircle2,
  Circle, ArrowRight, Sparkles, User, Users, Zap,
} from 'lucide-react';
import { cn, phaseLabel } from '@/lib/utils';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity:0, y:22 }, show: { opacity:1, y:0, transition: { duration:0.55, ease:[0.16,1,0.3,1] } } };

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; accent: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="glass-card p-5 cursor-default group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
             style={{ background: accent + '18', border: `1px solid ${accent}30` }}>
          <Icon size={18} style={{ color: accent }}/>
        </div>
        <span className="text-[10px] font-semibold tracking-widest uppercase"
              style={{ color: 'rgba(232,227,213,0.28)' }}>
          {label}
        </span>
      </div>
      <p className="font-display font-bold text-[#E8E3D5]"
         style={{ fontSize: '1.7rem', letterSpacing: '-0.03em', lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p className="text-[11px] mt-1.5" style={{ color: 'rgba(232,227,213,0.38)' }}>{sub}</p>}
    </motion.div>
  );
}

// ── Step Progress ────────────────────────────────────────────────────────────
function StepProgress({ done, label, link, num }: { done: boolean; label: string; link: string; num: number }) {
  return (
    <Link href={done ? '#' : link}
          className={cn('flex items-center gap-3.5 p-3 rounded-xl transition-all duration-200 group',
            done ? 'opacity-50 cursor-default pointer-events-none' : 'hover:bg-white/[0.04]')}>
      <div className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold transition-all duration-300',
        done ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-400' : 'border text-navy-500 group-hover:border-gold-400/40 group-hover:text-gold-400',
      )} style={!done ? { borderColor: 'rgba(255,255,255,0.1)' } : {}}>
        {done ? <CheckCircle2 size={13} className="text-emerald-400"/> : num}
      </div>
      <span className={cn('text-sm flex-1', done ? 'text-navy-500 line-through' : 'text-navy-200 group-hover:text-[#E8E3D5]')}
            style={{ letterSpacing: '-0.01em' }}>
        {label}
      </span>
      {!done && <ArrowRight size={13} className="text-navy-700 group-hover:text-gold-400 transition-colors flex-shrink-0"/>}
    </Link>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user)!;

  const { data: aiProfile }   = useQuery({ queryKey: ['ai-profile'],  queryFn: () => aiApi.getProfile().then(r => r.data) });
  const { data: matches }     = useQuery({ queryKey: ['my-matches'],   queryFn: () => matchingApi.getMyMatches().then(r => r.data) });
  const { data: subStatus }   = useQuery({ queryKey: ['sub-status'],   queryFn: () => subscriptionApi.getStatus().then(r => r.data) });

  const phase      = aiProfile?.currentPhase ?? 1;
  const matchCount = Array.isArray(matches) ? matches.filter((m: { status: string }) => m.status === 'matched').length : 0;
  const isPremium  = subStatus?.status === 'active' || user.subscriptionStatus === 'active';
  const greeting   = user.firstName ? `${user.firstName}` : 'vous';

  const steps = [
    { done: !!user.profileCompleted,   link: '/profile',      label: 'Compléter mon profil de base' },
    { done: !!user.aiPhaseCompleted,   link: '/ai-chat',      label: 'Terminer l\'analyse IA (8 phases)' },
    { done: isPremium,                 link: '/subscription', label: 'Souscrire un abonnement' },
    { done: matchCount > 0,            link: '/proposals',    label: 'Recevoir ma première proposition' },
  ];
  const completedSteps = steps.filter(s => s.done).length;

  return (
    <div className="space-y-7">
      {/* ── Hero greeting ─────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-1">
        <motion.p variants={fadeUp} className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: 'rgba(200,56,78,0.8)' }}>
          Assalamu alaikum
        </motion.p>
        <motion.h1 variants={fadeUp} className="font-display font-bold text-[#E8E3D5]"
                   style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
          Bienvenue, {greeting} 🌙
        </motion.h1>
        <motion.p variants={fadeUp} className="text-sm" style={{ color: 'rgba(232,227,213,0.45)' }}>
          Voici un aperçu de votre avancement sur Zawjia.
        </motion.p>
      </motion.div>

      {/* ── Stats grid ────────────────────────────────────────────────────── */}
      <motion.div initial="hidden" animate="show" variants={stagger}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={User}   label="Profil"      value={user.profileCompleted ? '✓ Complet' : 'Incomplet'} accent="#C8384E"/>
        <StatCard icon={Brain}  label="Phase IA"    value={`${user.aiPhaseCompleted ? 8 : phase}/8`}          accent="#2D7D52"/>
        <StatCard icon={Heart}  label="Matchs"      value={matchCount}                                         accent="#C8384E"    sub={matchCount > 0 ? 'matchs confirmés' : 'Aucun match encore'}/>
        <StatCard icon={Crown}  label="Abonnement"  value={isPremium ? 'Premium' : 'Gratuit'}
                  accent={isPremium ? '#2D7D52' : '#4e73ba'}
                  sub={subStatus?.endDate ? `Expire le ${new Date(subStatus.endDate).toLocaleDateString('fr-FR')}` : undefined}/>
      </motion.div>

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Journey steps */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.18 }}
          className="lg:col-span-2 glass-card p-6"
        >
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="section-title mb-0.5">Votre parcours</h2>
              <p className="text-xs" style={{ color: 'rgba(232,227,213,0.35)' }}>Complétez chaque étape</p>
            </div>
            <span className="badge text-xs font-bold"
                  style={{ background: 'rgba(200,56,78,0.1)', border: '1px solid rgba(200,56,78,0.2)', color: '#C8384E' }}>
              {completedSteps}/{steps.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #a8243c, #C8384E, #f07a8a)' }}
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps / steps.length) * 100}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16,1,0.3,1] }}
              />
            </div>
          </div>

          <div className="space-y-0.5">
            {steps.map(({ done, label, link }, i) => (
              <StepProgress key={i} done={done} label={label} link={link} num={i + 1}/>
            ))}
          </div>

          {/* IA phase segments */}
          <div className="mt-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold" style={{ color: 'rgba(232,227,213,0.6)', letterSpacing: '-0.01em' }}>
                Nisfi IA — Progression
              </p>
              <p className="text-xs font-bold" style={{ color: '#C8384E' }}>
                {user.aiPhaseCompleted ? '8/8 ✓' : `Phase ${phase}/8`}
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: 8 }, (_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 h-1.5 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.06, ease: [0.16,1,0.3,1] }}
                  style={{
                    background: i < (user.aiPhaseCompleted ? 8 : phase - 1)
                      ? 'linear-gradient(90deg, #a8243c, #C8384E)'
                      : i === phase - 1 && !user.aiPhaseCompleted
                      ? 'rgba(200,56,78,0.35)'
                      : 'rgba(255,255,255,0.07)',
                    originX: 0,
                  }}
                />
              ))}
            </div>
            <p className="text-[11px] mt-2" style={{ color: 'rgba(232,227,213,0.33)' }}>
              {user.aiPhaseCompleted ? '✓ Analyse complète — Matching débloqué' : `Prochaine étape : ${phaseLabel(phase)}`}
            </p>
            {!user.aiPhaseCompleted && (
              <Link href="/ai-chat" className="btn-primary mt-3 w-full text-xs py-2.5">
                Continuer avec Nisfi IA <ChevronRight size={13}/>
              </Link>
            )}
          </div>
        </motion.div>

        {/* Right column */}
        <motion.div
          initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5, delay:0.28 }}
          className="space-y-4"
        >
          {/* CTA card */}
          <div className="glass-card p-5 relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse at 0% 100%, rgba(200,56,78,0.12) 0%, transparent 60%)',
            }}/>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                   style={{ background: 'rgba(200,56,78,0.12)', border: '1px solid rgba(200,56,78,0.25)', boxShadow: '0 0 20px rgba(200,56,78,0.15)' }}>
                {isPremium ? <Heart size={17} style={{ color: '#C8384E' }}/> : <Sparkles size={17} style={{ color: '#C8384E' }}/>}
              </div>
              {!isPremium ? (
                <>
                  <h3 className="font-display font-semibold text-[#E8E3D5] mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Passez au Premium
                  </h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(232,227,213,0.45)' }}>
                    Matching illimité, révélation photo accélérée, priorité dans l&apos;algorithme.
                  </p>
                  <Link href="/subscription" className="btn-primary w-full text-xs py-2.5">
                    Voir les offres <Zap size={13}/>
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="font-display font-semibold text-[#E8E3D5] mb-2" style={{ letterSpacing: '-0.02em' }}>
                    Découvrir des profils
                  </h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(232,227,213,0.45)' }}>
                    Des profils compatibles vous attendent. Consultez les propositions.
                  </p>
                  <Link href="/proposals" className="btn-primary w-full text-xs py-2.5">
                    Voir les propositions <Heart size={13}/>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* AI traits */}
          {aiProfile?.personalityTraits?.length > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold mb-3.5 flex items-center gap-2"
                  style={{ color: 'rgba(232,227,213,0.7)', letterSpacing: '0.02em' }}>
                <Brain size={13} className="text-emerald-400"/> Mon profil IA
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {aiProfile.personalityTraits.slice(0,5).map((trait: string) => (
                  <span key={trait} className="badge text-[10px]"
                        style={{ background: 'rgba(45,125,82,0.1)', border: '1px solid rgba(45,125,82,0.2)', color: '#3cbe88' }}>
                    {trait}
                  </span>
                ))}
              </div>
              {aiProfile.marriageVision && (
                <p className="text-[11px] mt-3 leading-relaxed italic line-clamp-3"
                   style={{ color: 'rgba(232,227,213,0.4)' }}>
                  &ldquo;{aiProfile.marriageVision}&rdquo;
                </p>
              )}
              <Link href="/ai-chat" className="mt-3 flex items-center gap-1 text-xs font-medium transition-colors"
                    style={{ color: 'rgba(200,56,78,0.7)' }}
                    onMouseEnter={e => (e.currentTarget.style.color='#C8384E')}
                    onMouseLeave={e => (e.currentTarget.style.color='rgba(200,56,78,0.7)')}>
                Voir mon profil complet <ChevronRight size={11}/>
              </Link>
            </div>
          )}

          {/* Matches preview */}
          {matchCount > 0 && (
            <div className="glass-card p-5">
              <h3 className="text-xs font-semibold mb-3 flex items-center gap-2"
                  style={{ color: 'rgba(232,227,213,0.7)' }}>
                <Users size={13} className="text-gold-400"/> Mes matchs
              </h3>
              <p className="font-display font-bold text-gradient-gold"
                 style={{ fontSize: '2rem', letterSpacing: '-0.03em' }}>
                {matchCount}
              </p>
              <p className="text-xs mt-1 mb-3" style={{ color: 'rgba(232,227,213,0.4)' }}>
                match{matchCount > 1 ? 's' : ''} confirmé{matchCount > 1 ? 's' : ''}
              </p>
              <Link href="/matches" className="btn-secondary w-full text-xs py-2">
                Voir mes matchs <ArrowRight size={13}/>
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}


