'use client';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Crown, Check, Loader2, CheckCircle2, ChevronRight, Star, Zap, Sparkles } from 'lucide-react';
import { subscriptionApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

const PLANS = [
  {
    id: 'essential',
    name: 'Essentiel',
    price: '9,99€',
    period: 'mois',
    priceId: 'price_essential',
    features: [
      'Analyse IA complète (8 phases)',
      '3 propositions de profil / mois',
      'Matching basé sur la compatibilité',
      'Charte éthique islamique',
    ],
    icon: Star,
    accent: '#4e73ba',
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '19,99€',
    period: 'mois',
    priceId: 'price_premium',
    features: [
      'Tout l\'Essentiel',
      'Propositions illimitées',
      'Révélation photo accélérée',
      'Priorité dans l\'algorithme',
      'Intégration Wali renforcée',
      'Support dédié prioritaire',
    ],
    icon: Crown,
    accent: '#C8384E',
    highlight: true,
  },
  {
    id: 'yearly',
    name: 'Premium Annuel',
    price: '149€',
    period: 'an',
    priceId: 'price_yearly',
    features: [
      'Tout le Premium mensuel',
      '38% d\'économie vs mensuel',
      'Badge membre vérifié',
      'Accès anticipé aux nouvelles fonctionnalités',
    ],
    icon: Zap,
    accent: '#2D7D52',
    highlight: false,
  },
];

const stagger = { show: { transition: { staggerChildren: 0.12 } } };
const fadeUp  = { hidden: { opacity:0, y:24 }, show: { opacity:1, y:0, transition: { duration:0.55, ease:[0.16,1,0.3,1] } } };

function PlanCard({ plan, currentStatus, onSubscribe, loading }: {
  plan: typeof PLANS[0];
  currentStatus: string;
  onSubscribe: (planId: string) => void;
  loading: boolean;
}) {
  const Icon     = plan.icon;
  const isActive = currentStatus === 'active';

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -5, transition: { duration: 0.25 } }}
      className="relative flex flex-col p-7 rounded-2xl overflow-hidden cursor-default"
      style={plan.highlight ? {
        background: 'rgba(255,255,255,0.92)',
        border: `1px solid ${plan.accent}35`,
        boxShadow: `0 0 60px ${plan.accent}15, 0 4px 40px rgba(0,0,0,0.5), inset 0 1px 0 ${plan.accent}15`,
      } : {
        background: 'rgba(255,255,255,0.92)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 4px 40px rgba(0,0,0,0.3)',
      }}
    >
      {/* Top gradient */}
      {plan.highlight && (
        <div className="absolute inset-0 pointer-events-none"
             style={{ background: `radial-gradient(ellipse at 50% 0%, ${plan.accent}18 0%, transparent 60%)` }}/>
      )}

      {/* Popular badge */}
      {plan.highlight && (
        <div className="absolute -top-px left-6 right-6 h-px"
             style={{ background: `linear-gradient(90deg, transparent, ${plan.accent}, transparent)` }}/>
      )}
      {plan.highlight && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
             style={{ background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}cc)`, color: 'white', boxShadow: `0 4px 16px ${plan.accent}50` }}>
          ✦ PLUS POPULAIRE
        </div>
      )}

      {/* Icon + name */}
      <div className="relative mb-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
             style={{ background: `${plan.accent}15`, border: `1px solid ${plan.accent}30` }}>
          <Icon size={19} style={{ color: plan.accent }}/>
        </div>
        <p className="text-[11px] font-semibold tracking-widest uppercase mb-1.5"
           style={{ color: `${plan.accent}cc` }}>
          {plan.name}
        </p>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display font-bold text-gray-900"
                style={{ fontSize: '2.4rem', letterSpacing: '-0.04em' }}>
            {plan.price}
          </span>
          <span className="text-sm" style={{ color: '#9ca3af' }}>/{plan.period}</span>
        </div>
      </div>

      {/* Features */}
      <ul className="space-y-2.5 flex-1 mb-6">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: '#374151', letterSpacing: '-0.01em' }}>
            <Check size={13} className="flex-shrink-0 mt-0.5" style={{ color: plan.accent }}/>
            {f}
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSubscribe(plan.priceId)}
        disabled={loading || isActive}
        className={cn('relative w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-300',
          'disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2')}
        style={plan.highlight ? {
          background: `linear-gradient(135deg, ${plan.accent}, ${plan.accent}cc)`,
          color: 'white',
          boxShadow: `0 4px 20px ${plan.accent}45`,
        } : {
          background: `${plan.accent}12`,
          border: `1px solid ${plan.accent}30`,
          color: plan.accent === '#2D7D52' ? '#3cbe88' : `${plan.accent}`,
        }}
      >
        {loading ? (
          <Loader2 size={15} className="animate-spin"/>
        ) : isActive ? (
          <><CheckCircle2 size={15}/> Plan actif</>
        ) : (
          <>Choisir ce plan <ChevronRight size={15}/></>
        )}
      </button>
    </motion.div>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuthStore();

  const { data: status, isLoading } = useQuery({
    queryKey: ['sub-status'],
    queryFn:  () => subscriptionApi.getStatus().then(r => r.data),
  });

  const checkoutMutation = useMutation({
    mutationFn: (plan: string) => subscriptionApi.createCheckout(plan),
    onSuccess: (res) => {
      if (res.data?.url) window.location.href = res.data.url;
      else toast.success('Abonnement activé !');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="text-center">
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(200,56,78,0.1)', border: '1px solid rgba(200,56,78,0.2)', color: '#C8384E' }}>
          <Crown size={12}/> Abonnements Zawjia
        </motion.div>
        <motion.h1 variants={fadeUp} className="font-display font-bold text-gray-900 mb-3"
                   style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '-0.035em' }}>
          Investissez dans votre avenir
        </motion.h1>
        <motion.p variants={fadeUp} className="max-w-md mx-auto text-sm leading-relaxed"
                  style={{ color: '#6b7280' }}>
          Les fonctionnalités de base sont gratuites. L&apos;abonnement débloque le matching et les propositions de profils compatibles.
        </motion.p>
      </motion.div>

      {/* Active sub status */}
      {!isLoading && status?.status === 'active' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="glass-card p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'rgba(45,125,82,0.15)', border: '1px solid rgba(45,125,82,0.3)' }}>
              <CheckCircle2 size={18} className="text-emerald-400"/>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Abonnement actif ✓</p>
              {status.endDate && (
                <p className="text-xs" style={{ color: '#9ca3af' }}>Expire le {formatDate(status.endDate)}</p>
              )}
            </div>
            <span className="ml-auto badge text-xs" style={{ background: 'rgba(45,125,82,0.12)', border: '1px solid rgba(45,125,82,0.25)', color: '#3cbe88' }}>
              Premium
            </span>
          </div>
        </motion.div>
      )}

      {/* Plans */}
      <motion.div
        initial="hidden" animate="show" variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch"
        style={{ paddingTop: '1.5rem' }}
      >
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentStatus={user?.subscriptionStatus ?? 'free'}
            onSubscribe={(p) => checkoutMutation.mutate(p)}
            loading={checkoutMutation.isPending}
          />
        ))}
      </motion.div>

      {/* Note */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
        className="max-w-lg mx-auto text-center p-5 rounded-2xl text-xs leading-relaxed"
        style={{ background: 'rgba(0,0,0,0.035)', border: '1px solid rgba(0,0,0,0.07)', color: '#9ca3af' }}
      >
        <Sparkles size={12} className="inline mr-1.5 opacity-60"/>
        Paiement sécurisé — Annulation possible à tout moment — Données protégées conformément au RGPD
      </motion.div>
    </div>
  );
}


