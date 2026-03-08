'use client';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Loader2, RefreshCw, ShieldCheck, Clock } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { getErrorMessage, formatDate } from '@/lib/utils';
import type { Wali } from '@/types';

export default function AdminWalisPage() {
  const qc = useQueryClient();

  const { data: walis = [], isLoading, refetch, isFetching } = useQuery<Wali[]>({
    queryKey: ['admin-walis'],
    queryFn: () => adminApi.getWalis().then(r => r.data),
  });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => adminApi.verifyWali(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-walis'] }); toast.success('Wali vérifié'); },
    onError:   (err) => toast.error(getErrorMessage(err)),
  });

  const pending  = walis.filter(w => !w.isVerified);
  const verified = walis.filter(w => w.isVerified);

  const relationshipLabel = (rel: string) => ({
    father: 'Père',  brother: 'Frère', uncle: 'Oncle',
    grandfather: 'Grand-père', other: 'Autre',
  }[rel] ?? rel);

  const LABEL_STYLE = { color:'rgba(232,227,213,0.3)', fontSize:'11px', marginBottom:'2px', display:'block' };
  const VAL_STYLE   = { color:'#E8E3D5', fontSize:'13px' };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Vérification des Walis</h1>
          <p className="text-sm mt-1" style={{ color:'rgba(232,227,213,0.4)' }}>
            <span style={{ color:'#C8384E', fontWeight:600 }}>{pending.length}</span> en attente · {verified.length} vérifiés
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary text-xs px-4 py-2.5">
          <RefreshCw size={13} className={isFetching ? 'animate-spin':''}/>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={22} className="animate-spin" style={{ color:'#f87171' }}/>
        </div>
      ) : (
        <>
          {pending.length > 0 && (
            <div className="space-y-3">
              <h2 className="section-title flex items-center gap-2">
                <Clock size={14} style={{ color:'#C8384E' }}/> En attente de vérification
              </h2>
              {pending.map((w, i) => (
                <motion.div key={w._id}
                  initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.05 }}
                  className="rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  style={{ background:'rgba(17,22,32,0.85)', border:'1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {([
                      { l:'Nom', v:w.name },
                      { l:'Lien', v:relationshipLabel(w.relationship) },
                      { l:'Téléphone', v:w.phone??'—' },
                      { l:'Email', v:w.email??'—' },
                    ] as {l:string,v:string}[]).map(({ l, v }) => (
                        <div key={l}>
                          <span style={LABEL_STYLE}>{l}</span>
                          <p style={VAL_STYLE} className="text-sm truncate">{v}</p>
                        </div>
                    ))}
                  </div>
                  <button onClick={() => verifyMutation.mutate(w._id)} disabled={verifyMutation.isPending}
                    className="btn-primary text-xs px-5 py-2.5 shrink-0">
                    {verifyMutation.isPending ? <Loader2 size={13} className="animate-spin"/> : <ShieldCheck size={13}/>}
                    Vérifier
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {verified.length > 0 && (
            <div className="space-y-3">
              <h2 className="section-title flex items-center gap-2">
                <ShieldCheck size={14} style={{ color:'#2D7D52' }}/> Walis vérifiés
              </h2>
              <div className="rounded-2xl overflow-hidden"
                   style={{ background:'rgba(17,22,32,0.85)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                      {['Nom','Lien','Contact','Statut','Ajouté le'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold tracking-widest uppercase"
                            style={{ color:'rgba(232,227,213,0.3)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {verified.map((w, i) => (
                      <motion.tr key={w._id}
                        initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:i*0.03 }}
                        style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                        onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.025)'}
                        onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                        <td className="px-4 py-3 font-medium" style={{ color:'#E8E3D5' }}>{w.name}</td>
                        <td className="px-4 py-3" style={{ color:'rgba(232,227,213,0.5)' }}>{relationshipLabel(w.relationship)}</td>
                        <td className="px-4 py-3 text-xs" style={{ color:'rgba(232,227,213,0.45)' }}>{w.phone ?? w.email ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className="badge text-[10px]" style={{ color:'#2D7D52', background:'rgba(45,125,82,0.1)', border:'1px solid rgba(45,125,82,0.25)' }}>✓ Vérifié</span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color:'rgba(232,227,213,0.35)' }}>{formatDate(w.createdAt)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {walis.length === 0 && (
            <div className="rounded-2xl p-12 text-center text-sm"
                 style={{ background:'rgba(17,22,32,0.85)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(232,227,213,0.3)' }}>
              Aucun wali enregistré
            </div>
          )}
        </>
      )}
    </div>
  );
}
