'use client';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw, CreditCard } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';

interface Subscription {
  _id: string;
  userId: string | { _id: string; email: string; firstName: string };
  status: string;
  plan: string;
  stripeSubscriptionId?: string;
  currentPeriodEnd?: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string,{color:string;bg:string;border:string}> = {
  active:  { color:'#2D7D52',                bg:'rgba(45,125,82,0.1)',   border:'rgba(45,125,82,0.25)'   },
  expired: { color:'rgba(248,113,113,0.85)', bg:'rgba(239,68,68,0.1)',   border:'rgba(239,68,68,0.25)'   },
  free:    { color:'#9ca3af',   bg:'rgba(0,0,0,0.05)', border:'rgba(0,0,0,0.08)' },
};

const planLabel = (plan: string) =>
  plan === 'premium' ? '👑 Premium' : plan === 'annual' ? '🏅 Annuel' : '🌙 Essentiel';

export default function AdminSubscriptionsPage() {
  const { data: subs = [], isLoading, refetch, isFetching } = useQuery<Subscription[]>({
    queryKey: ['admin-subscriptions'],
    queryFn: () => adminApi.getSubscriptions().then(r => r.data),
  });

  const SUMMARY = [
    { label:'Total',          value:subs.length,                                             accent:'#1f2937' },
    { label:'Actifs',         value:subs.filter(s=>s.status==='active').length,               accent:'#2D7D52'               },
    { label:'Expirés',        value:subs.filter(s=>s.status==='expired').length,              accent:'rgba(248,113,113,0.8)' },
    { label:'Premium/Annuel', value:subs.filter(s=>['premium','annual'].includes(s.plan)).length, accent:'#C8384E'           },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Abonnements</h1>
          <p className="text-sm mt-1" style={{ color:'#9ca3af' }}>
            {subs.filter(s=>s.status==='active').length} actifs sur {subs.length}
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary text-xs px-4 py-2.5">
          <RefreshCw size={13} className={isFetching ? 'animate-spin':''}/>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SUMMARY.map(c => (
          <div key={c.label} className="rounded-2xl p-4 text-center"
               style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
            <p className="font-display font-bold text-2xl" style={{ color:c.accent, letterSpacing:'-0.04em' }}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden"
           style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={22} className="animate-spin" style={{ color:'#f87171' }}/>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
                  {['Utilisateur','Plan','Statut','Stripe ID','Expire le','Créé le'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap"
                        style={{ color:'#9ca3af' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s, i) => {
                  const user   = typeof s.userId === 'object' ? s.userId : null;
                  const ss     = STATUS_STYLE[s.status] ?? STATUS_STYLE.free;
                  return (
                    <motion.tr key={s._id}
                      initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.03 }}
                      style={{ borderBottom:'1px solid rgba(0,0,0,0.05)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,0.035)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <CreditCard size={13} style={{ color:'#d1d5db', flexShrink:0 }}/>
                          <div className="min-w-0">
                            {user ? (
                              <>
                                <p className="text-xs font-medium truncate" style={{ color:'#111827' }}>{user.firstName}</p>
                                <p className="text-xs truncate" style={{ color:'#9ca3af' }}>{user.email}</p>
                              </>
                            ) : (
                              <code className="text-xs" style={{ color:'#9ca3af' }}>{s.userId as string}</code>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color:'#111827' }}>{planLabel(s.plan)}</td>
                      <td className="px-4 py-3.5">
                        <span className="badge text-[10px]" style={{ color:ss.color, background:ss.bg, border:`1px solid ${ss.border}` }}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.stripeSubscriptionId ? (
                          <code className="text-xs rounded px-2 py-1" style={{ color:'#6b7280', background:'rgba(0,0,0,0.05)' }}>
                            {s.stripeSubscriptionId.slice(0,18)}…
                          </code>
                        ) : <span style={{ color:'#d1d5db' }}>—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color:'#9ca3af' }}>
                        {s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color:'#9ca3af' }}>
                        {formatDate(s.createdAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {subs.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color:'#9ca3af' }}>Aucun abonnement</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
