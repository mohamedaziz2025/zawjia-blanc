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
  free:    { color:'rgba(232,227,213,0.4)',   bg:'rgba(255,255,255,0.04)', border:'rgba(255,255,255,0.1)' },
};

const planLabel = (plan: string) =>
  plan === 'premium' ? '👑 Premium' : plan === 'annual' ? '🏅 Annuel' : '🌙 Essentiel';

export default function AdminSubscriptionsPage() {
  const { data: subs = [], isLoading, refetch, isFetching } = useQuery<Subscription[]>({
    queryKey: ['admin-subscriptions'],
    queryFn: () => adminApi.getSubscriptions().then(r => r.data),
  });

  const SUMMARY = [
    { label:'Total',          value:subs.length,                                             accent:'rgba(232,227,213,0.8)' },
    { label:'Actifs',         value:subs.filter(s=>s.status==='active').length,               accent:'#2D7D52'               },
    { label:'Expirés',        value:subs.filter(s=>s.status==='expired').length,              accent:'rgba(248,113,113,0.8)' },
    { label:'Premium/Annuel', value:subs.filter(s=>['premium','annual'].includes(s.plan)).length, accent:'#C8384E'           },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Abonnements</h1>
          <p className="text-sm mt-1" style={{ color:'rgba(232,227,213,0.4)' }}>
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
               style={{ background:'rgba(17,22,32,0.85)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <p className="font-display font-bold text-2xl" style={{ color:c.accent, letterSpacing:'-0.04em' }}>{c.value}</p>
            <p className="text-xs mt-0.5" style={{ color:'rgba(232,227,213,0.35)' }}>{c.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden"
           style={{ background:'rgba(17,22,32,0.85)', border:'1px solid rgba(255,255,255,0.07)' }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 size={22} className="animate-spin" style={{ color:'#f87171' }}/>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                  {['Utilisateur','Plan','Statut','Stripe ID','Expire le','Créé le'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap"
                        style={{ color:'rgba(232,227,213,0.3)' }}>{h}</th>
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
                      style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.025)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <CreditCard size={13} style={{ color:'rgba(232,227,213,0.2)', flexShrink:0 }}/>
                          <div className="min-w-0">
                            {user ? (
                              <>
                                <p className="text-xs font-medium truncate" style={{ color:'#E8E3D5' }}>{user.firstName}</p>
                                <p className="text-xs truncate" style={{ color:'rgba(232,227,213,0.35)' }}>{user.email}</p>
                              </>
                            ) : (
                              <code className="text-xs" style={{ color:'rgba(232,227,213,0.4)' }}>{s.userId as string}</code>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color:'#E8E3D5' }}>{planLabel(s.plan)}</td>
                      <td className="px-4 py-3.5">
                        <span className="badge text-[10px]" style={{ color:ss.color, background:ss.bg, border:`1px solid ${ss.border}` }}>{s.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        {s.stripeSubscriptionId ? (
                          <code className="text-xs rounded px-2 py-1" style={{ color:'rgba(232,227,213,0.45)', background:'rgba(255,255,255,0.04)' }}>
                            {s.stripeSubscriptionId.slice(0,18)}…
                          </code>
                        ) : <span style={{ color:'rgba(232,227,213,0.2)' }}>—</span>}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color:'rgba(232,227,213,0.35)' }}>
                        {s.currentPeriodEnd ? formatDate(s.currentPeriodEnd) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-xs whitespace-nowrap" style={{ color:'rgba(232,227,213,0.35)' }}>
                        {formatDate(s.createdAt)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {subs.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color:'rgba(232,227,213,0.3)' }}>Aucun abonnement</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
