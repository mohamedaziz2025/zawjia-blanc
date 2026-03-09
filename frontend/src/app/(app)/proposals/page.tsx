'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Heart, X, MapPin, Star, Loader2, RefreshCw, Lock,
  ChevronRight, CheckCircle2,
} from 'lucide-react';
import { matchingApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage, getCompatibilityColor, getCompatibilityLabel, maritalStatusLabel, religiousPracticeLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Proposal } from '@/types';
import Link from 'next/link';

function ProposalCard({ proposal, onChoice, isLoading }: {
  proposal: Proposal;
  onChoice: (userId: string, choice: boolean) => void;
  isLoading: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const scoreColor = proposal.compatibilityScore >= 80 ? '#2D7D52' : proposal.compatibilityScore >= 60 ? '#C8384E' : '#ef4444';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.22 } }}
      transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}
      className="flex flex-col gap-3"
    >
      {/* Card with flip */}
      <div style={{ perspective: 1000, height: 420 }} onClick={() => setFlipped(!flipped)}>
        <div style={{
          position: 'relative', width: '100%', height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.65s cubic-bezier(0.16,1,0.3,1)',
          transform: flipped ? 'rotateY(180deg)' : '',
        }}>
          {/* Front */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer"
               style={{ backfaceVisibility: 'hidden', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>

            {/* Top accent */}
            <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}, transparent)` }}/>

            <div className="p-6">
              {/* Score + header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <span className="text-[10px] font-semibold tracking-widest uppercase"
                        style={{ color: '#9ca3af' }}>
                    Compatibilité
                  </span>
                  <div className="flex items-baseline gap-1.5 mt-0.5">
                    <span className="font-display font-bold"
                          style={{ fontSize: '2.2rem', letterSpacing: '-0.04em', color: scoreColor }}>
                      {proposal.compatibilityScore}%
                    </span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: `${scoreColor}cc` }}>
                    {getCompatibilityLabel(proposal.compatibilityScore)}
                  </span>
                </div>

                {/* Circular progress ring */}
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth="2.5"/>
                    <motion.circle
                      cx="18" cy="18" r="14"
                      fill="none"
                      stroke={scoreColor}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray={`${(14 * 2 * Math.PI * proposal.compatibilityScore) / 100} 999`}
                      initial={{ strokeDasharray: '0 999' }}
                      animate={{ strokeDasharray: `${(14 * 2 * Math.PI * proposal.compatibilityScore) / 100} 999` }}
                      transition={{ duration: 1.3, delay: 0.3 }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Star size={12} style={{ color: scoreColor }}/>
                  </div>
                </div>
              </div>

              <div className="h-px w-full mb-4" style={{ background: 'rgba(0,0,0,0.07)' }}/>

              {/* Info */}
              <div className="space-y-2.5 mb-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                  <MapPin size={12} style={{ color: '#9ca3af', flexShrink: 0 }}/>
                  {proposal.city}{proposal.country && `, ${proposal.country}`}
                </div>
                {proposal.age && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                    <span style={{ color: '#9ca3af', fontSize: '11px', width: 12 }}>👤</span>
                    {proposal.age} ans · {maritalStatusLabel(proposal.maritalStatus ?? '')}
                  </div>
                )}
                {proposal.religiousPractice && (
                  <div className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                    <span style={{ color: '#9ca3af', fontSize: '11px', width: 12 }}>🕌</span>
                    {religiousPracticeLabel(proposal.religiousPractice)}
                  </div>
                )}
              </div>

              {/* Values */}
              {(proposal.mainValues?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(proposal.mainValues ?? []).slice(0,4).map((v) => (
                    <span key={v} className="badge text-[10px]"
                          style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.09)', color: '#6b7280' }}>
                      {v}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-[10px] text-center" style={{ color: '#d1d5db' }}>
                Appuyer pour voir la vision du mariage
              </p>
            </div>
          </div>

          {/* Back */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden cursor-pointer flex flex-col p-6"
               style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.09)' }}>
            <div className="h-1 w-full mb-4" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}80, transparent)` }}/>
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-2.5"
               style={{ color: '#9ca3af' }}>Vision du mariage</p>
            {proposal.marriageVision ? (
              <p className="text-sm leading-relaxed italic flex-1 overflow-y-auto"
                 style={{ color: '#374151' }}>
                &ldquo;{proposal.marriageVision}&rdquo;
              </p>
            ) : (
              <p className="text-sm italic flex-1" style={{ color: '#9ca3af' }}>
                Non renseigné lors de la phase IA
              </p>
            )}
            {proposal.physicalDescription && (
              <div className="mt-4 pt-4 space-y-1.5 text-xs" style={{ borderTop: '1px solid rgba(0,0,0,0.07)', color: '#6b7280' }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-2"
                   style={{ color: '#9ca3af' }}>Description physique</p>
                {proposal.physicalDescription.height && <p>Taille : {proposal.physicalDescription.height} cm</p>}
                {proposal.physicalDescription.bodyType && <p>Morphologie : {proposal.physicalDescription.bodyType}</p>}
              </div>
            )}
            <p className="text-[10px] text-center mt-4" style={{ color: '#d1d5db' }}>
              Appuyer pour revenir
            </p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2.5">
        <button onClick={() => onChoice(proposal.userId, false)} disabled={isLoading}
          className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
          style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: 'rgba(248,113,113,0.8)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background='rgba(248,113,113,0.14)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(248,113,113,0.4)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background='rgba(248,113,113,0.07)'; (e.currentTarget as HTMLElement).style.borderColor='rgba(248,113,113,0.2)'; }}>
          <X size={16}/> Passer
        </button>
        <button onClick={() => onChoice(proposal.userId, true)} disabled={isLoading}
          className="btn-primary flex-1 py-3">
          {isLoading ? <Loader2 size={15} className="animate-spin"/> : <><Heart size={15}/> Intéressé(e)</>}
        </button>
      </div>
    </motion.div>
  );
}

export default function ProposalsPage() {
  const { user }   = useAuthStore();
  const qc         = useQueryClient();
  const [chosen, setChosen] = useState<Set<string>>(new Set());

  const { data: proposals = [], isLoading, error, refetch } = useQuery<Proposal[]>({
    queryKey: ['proposals'],
    queryFn:  () => matchingApi.getProposals().then(r => r.data),
    enabled:  Boolean(user?.aiPhaseCompleted && user?.subscriptionStatus === 'active'),
    retry: false,
  });

  const chooseMutation = useMutation({
    mutationFn: ({ userId, choice }: { userId: string; choice: boolean }) => matchingApi.choose(userId, choice),
    onSuccess: (_, vars) => {
      setChosen((prev) => new Set([...prev, vars.userId]));
      qc.invalidateQueries({ queryKey: ['my-matches'] });
      if (vars.choice) toast.success('Intérêt envoyé !');
      else             toast('Profil passé.', { icon: '👋' });
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  // Gate: IA not complete
  if (!user?.aiPhaseCompleted) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
             style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.09)' }}>
          <Lock size={26} style={{ color: '#9ca3af' }}/>
        </div>
        <h2 className="font-display font-bold text-gray-900" style={{ fontSize: '1.3rem', letterSpacing: '-0.025em' }}>
          Analyse IA requise
        </h2>
        <p className="text-sm max-w-sm" style={{ color: '#6b7280' }}>
          Terminez les 8 phases avec Nisfi IA pour débloquer les propositions.
        </p>
        <Link href="/ai-chat" className="btn-primary mt-2">
          Continuer l&apos;analyse <ChevronRight size={15}/>
        </Link>
      </div>
    );
  }

  if (user?.subscriptionStatus !== 'active') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
             style={{ background: 'rgba(200,56,78,0.1)', border: '1px solid rgba(200,56,78,0.2)' }}>
          <Star size={26} style={{ color: '#C8384E' }}/>
        </div>
        <h2 className="font-display font-bold text-gray-900" style={{ fontSize: '1.3rem', letterSpacing: '-0.025em' }}>
          Abonnement requis
        </h2>
        <p className="text-sm max-w-sm" style={{ color: '#6b7280' }}>
          Souscrivez un abonnement pour accéder aux propositions de profils compatibles.
        </p>
        <Link href="/subscription" className="btn-primary mt-2">
          Voir les offres <ChevronRight size={15}/>
        </Link>
      </div>
    );
  }

  const visibleProposals = proposals.filter((p) => !chosen.has(p.userId));

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Propositions du jour</h1>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>
            Profils soigneusement sélectionnés selon votre compatibilité
          </p>
        </div>
        <button onClick={() => { setChosen(new Set()); refetch(); }} className="btn-secondary text-xs px-4 py-2.5">
          <RefreshCw size={13}/> Actualiser
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <Loader2 size={26} className="animate-spin" style={{ color: '#C8384E' }}/>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Calcul des compatibilités…</p>
        </div>
      )}

      {error && (
        <div className="glass-card p-6 text-center">
          <p className="text-sm" style={{ color: 'rgba(248,113,113,0.8)' }}>{getErrorMessage(error)}</p>
          <button onClick={() => refetch()} className="btn-secondary mt-3 text-xs">Réessayer</button>
        </div>
      )}

      {!isLoading && !error && (
        <>
          {visibleProposals.length === 0 ? (
            <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
              <CheckCircle2 size={40} style={{ color: 'rgba(200,56,78,0.5)' }}/>
              <h3 className="font-display font-semibold text-gray-900" style={{ fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                {proposals.length === 0 ? 'Aucune proposition pour le moment' : 'Vous avez traité toutes les propositions !'}
              </h3>
              <p className="text-sm max-w-xs" style={{ color: '#9ca3af' }}>
                {proposals.length === 0
                  ? 'Revenez demain, de nouveaux profils sont ajoutés régulièrement.'
                  : 'Revenez demain pour de nouvelles propositions.'}
              </p>
              <Link href="/matches" className="btn-secondary text-xs px-5">Voir mes matchs</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              <AnimatePresence>
                {visibleProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.userId}
                    proposal={proposal}
                    onChoice={(userId, choice) => chooseMutation.mutate({ userId, choice })}
                    isLoading={chooseMutation.isPending}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {visibleProposals.length > 0 && (
            <p className="text-center text-[11px]" style={{ color: '#d1d5db' }}>
              {visibleProposals.length} profil{visibleProposals.length > 1 ? 's' : ''} · Cliquer sur une carte pour les détails
            </p>
          )}
        </>
      )}
    </div>
  );
}

