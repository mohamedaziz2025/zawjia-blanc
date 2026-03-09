'use client';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Heart, Users, Clock, CheckCircle2, XCircle, Image as ImageIcon,
  Phone, Loader2,
} from 'lucide-react';
import { matchingApi, waliApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage, formatDate } from '@/lib/utils';
import type { Match } from '@/types';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity:0, y:18 }, show: { opacity:1, y:0, transition: { duration:0.5, ease:[0.16,1,0.3,1] } } };

const STATUS_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  matched:  { label: 'Match réciproque', color: '#2D7D52', bg: 'rgba(45,125,82,0.1)',   border: 'rgba(45,125,82,0.25)' },
  pending:  { label: 'En attente',       color: '#C8384E', bg: 'rgba(200,56,78,0.07)',  border: 'rgba(200,56,78,0.2)'  },
  rejected: { label: 'Non retenu',       color: '#9ca3af', bg: 'rgba(0,0,0,0.05)', border: 'rgba(0,0,0,0.09)' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className="badge text-[10px] font-semibold tracking-wide"
          style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
      {s.label}
    </span>
  );
}

function MatchCard({ match }: { match: Match }) {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const isMale  = user?.role === 'male';
  const matchId = match._id;
  const scolor  = (STATUS_MAP[match.status] ?? STATUS_MAP.pending).color;

  const finalDecisionMutation = useMutation({
    mutationFn: (accept: boolean) => matchingApi.finalDecision(matchId, accept),
    onSuccess: (_, accept) => {
      qc.invalidateQueries({ queryKey: ['my-matches'] });
      toast.success(accept ? 'Décision finale envoyée !' : 'Match refusé');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const { data: waliContact, refetch: fetchWali, isFetching } = useQuery({
    queryKey: ['wali-contact', matchId],
    queryFn:  () => waliApi.getContact(matchId).then(r => r.data),
    enabled:  false,
  });

  return (
    <motion.div variants={fadeUp}
      style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 24px rgba(0,0,0,0.3)' }}
      className="rounded-2xl p-5 flex flex-col gap-4">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
               style={{ background: `${scolor}11`, border: `1px solid ${scolor}33` }}>
            <Users size={17} style={{ color: scolor }}/>
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: '#111827' }}>Profil anonyme</p>
            <p className="text-[11px]" style={{ color: '#9ca3af' }}>{formatDate(match.createdAt)}</p>
          </div>
        </div>
        <StatusBadge status={match.status}/>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-2.5 text-[11px]" style={{ color: '#6b7280' }}>
        {[
          { icon: <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: match.user1Choice ? '#2D7D52':'rgba(0,0,0,0.12)' }}/>, label: `Frère : ${match.user1Choice ? 'Intéressé' : 'En attente'}` },
          { icon: <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: match.user2Choice ? '#2D7D52':'rgba(0,0,0,0.12)' }}/>, label: `Sœur : ${match.user2Choice ? 'Intéressée' : 'En attente'}` },
          { icon: <ImageIcon size={10}/>, label: `Photo : ${match.photoUnlocked ? 'Débloquée' : 'Masquée'}` },
          { icon: <Heart size={10}/>, label: `Finale : ${(isMale ? match.finalAcceptedByMale : match.finalAcceptedByFemale) ? 'Acceptée' : 'En attente'}` },
        ].map(({ icon, label }, i) => (
          <div key={i} className="flex items-center gap-1.5">{icon}{label}</div>
        ))}
      </div>

      {/* Actions */}
      {match.status === 'matched' && (
        <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
          {!(isMale ? match.finalAcceptedByMale : match.finalAcceptedByFemale) && (
            <div className="flex gap-2">
              <button onClick={() => finalDecisionMutation.mutate(false)} disabled={finalDecisionMutation.isPending}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: 'rgba(248,113,113,0.07)', border: '1px solid rgba(248,113,113,0.2)', color: 'rgba(248,113,113,0.8)' }}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(248,113,113,0.14)'}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='rgba(248,113,113,0.07)'}>
                <XCircle size={12}/> Refuser
              </button>
              <button onClick={() => finalDecisionMutation.mutate(true)} disabled={finalDecisionMutation.isPending}
                className="btn-primary flex-1 py-2.5 text-xs">
                {finalDecisionMutation.isPending ? <Loader2 size={12} className="animate-spin"/> : <><CheckCircle2 size={12}/> Accepter</>}
              </button>
            </div>
          )}

          {isMale && match.finalAcceptedByMale && match.finalAcceptedByFemale && (
            <button onClick={() => fetchWali()} disabled={isFetching}
              className="btn-secondary w-full text-xs py-2.5">
              {isFetching ? <Loader2 size={12} className="animate-spin"/> : <Phone size={12}/>}
              Contacter le Wali
            </button>
          )}

          {waliContact && (
            <div className="p-3.5 rounded-xl text-xs space-y-1.5"
                 style={{ background: 'rgba(45,125,82,0.07)', border: '1px solid rgba(45,125,82,0.2)' }}>
              <p className="font-semibold" style={{ color: '#2D7D52' }}>Contact Wali</p>
              <p style={{ color: '#374151' }}>{waliContact.name} — {waliContact.relationship}</p>
              <p style={{ color: '#6b7280' }}>{waliContact.phone}</p>
              <p style={{ color: '#9ca3af' }}>{waliContact.email}</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function MatchesPage() {
  const { data: matches = [], isLoading } = useQuery<Match[]>({
    queryKey: ['my-matches'],
    queryFn:  () => matchingApi.getMyMatches().then(r => r.data),
  });

  const groups = {
    matched:  matches.filter(m => m.status === 'matched'),
    pending:  matches.filter(m => m.status === 'pending'),
    rejected: matches.filter(m => m.status === 'rejected'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Mes matchs</h1>
        <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Gérez vos connexions et prises de contact</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Réciproques', count: groups.matched.length,  accent: '#2D7D52' },
          { label: 'En attente',  count: groups.pending.length,   accent: '#C8384E' },
          { label: 'Non retenus', count: groups.rejected.length,  accent: '#9ca3af' },
        ].map(({ label, count, accent }) => (
          <div key={label} className="rounded-2xl p-4 text-center"
               style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.07)' }}>
            <p className="font-display font-bold text-2xl" style={{ color: accent, letterSpacing: '-0.04em' }}>{count}</p>
            <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>{label}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center h-48 items-center gap-3 flex-col">
          <Loader2 size={24} className="animate-spin" style={{ color: '#C8384E' }}/>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Chargement…</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-4 text-center">
          <Heart size={36} style={{ color: 'rgba(200,56,78,0.35)' }}/>
          <h3 className="font-display font-semibold" style={{ color: '#111827', fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
            Aucun match pour l&apos;instant
          </h3>
          <p className="text-sm max-w-xs" style={{ color: '#9ca3af' }}>
            Consultez les propositions pour démarrer votre démarche.
          </p>
        </div>
      ) : (
        <div className="space-y-7">
          {groups.matched.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <CheckCircle2 size={14} style={{ color: '#2D7D52' }}/> Matchs réciproques
              </h2>
              <motion.div initial="hidden" animate="show" variants={stagger}
                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.matched.map(m => <MatchCard key={m._id} match={m}/>)}
              </motion.div>
            </section>
          )}
          {groups.pending.length > 0 && (
            <section>
              <h2 className="section-title flex items-center gap-2 mb-4">
                <Clock size={14} style={{ color: '#C8384E' }}/> En attente
              </h2>
              <motion.div initial="hidden" animate="show" variants={stagger}
                className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.pending.map(m => <MatchCard key={m._id} match={m}/>)}
              </motion.div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
