'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw, Search } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { Match } from '@/types';

export default function AdminMatchesPage() {
  const [search, setSearch] = useState('');

  const { data: matches = [], isLoading, refetch, isFetching } = useQuery<Match[]>({
    queryKey: ['admin-matches'],
    queryFn: () => adminApi.getMatches().then(r => r.data),
  });

  const filtered = matches.filter(m =>
    !search || m.user1?.toString().includes(search) || m.user2?.toString().includes(search)
  );

  const STATUS: Record<string,{color:string;bg:string}> = {
    matched:  { color:'#2D7D52',               bg:'rgba(45,125,82,0.1)'   },
    pending:  { color:'rgba(245,158,11,0.8)',   bg:'rgba(245,158,11,0.08)' },
    rejected: { color:'rgba(248,113,113,0.8)',  bg:'rgba(239,68,68,0.08)'  },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Gestion des matchs</h1>
          <p className="text-sm mt-1" style={{ color:'rgba(232,227,213,0.4)' }}>{matches.length} matchs en base</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary text-xs px-3 py-2">
          <RefreshCw size={12} className={isFetching ? 'animate-spin':''}/>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
        <input type="text" placeholder="Filtrer par ID utilisateur…" value={search} onChange={e=>setSearch(e.target.value)} className="input-field pl-9"/>
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
                  {['#','User 1','User 2','Statut','Photo','Décisions','Créé le'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap" style={{ color:'rgba(232,227,213,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => (
                  <motion.tr key={m._id} initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.02 }}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.025)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td className="px-4 py-3.5 font-mono text-xs" style={{ color:'rgba(232,227,213,0.3)' }}>#{i+1}</td>
                    <td className="px-4 py-3.5">
                      <code className="text-xs rounded px-2 py-1" style={{ background:'rgba(255,255,255,0.04)', color:'rgba(232,227,213,0.5)' }}>
                        {String(typeof m.user1==='object'?(m.user1 as any)._id??m.user1:m.user1).slice(-8)}
                      </code>
                    </td>
                    <td className="px-4 py-3.5">
                      <code className="text-xs rounded px-2 py-1" style={{ background:'rgba(255,255,255,0.04)', color:'rgba(232,227,213,0.5)' }}>
                        {String(typeof m.user2==='object'?(m.user2 as any)._id??m.user2:m.user2).slice(-8)}
                      </code>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge text-[10px]" style={{ color:(STATUS[m.status]??STATUS.pending).color, background:(STATUS[m.status]??STATUS.pending).bg, border:`1px solid ${(STATUS[m.status]??STATUS.pending).color}30` }}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-sm" style={{ color:m.photoUnlocked?'#2D7D52':'rgba(255,255,255,0.15)' }}>
                      {m.photoUnlocked ? '✓' : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-xs space-y-0.5" style={{ color:'rgba(232,227,213,0.45)' }}>
                      <p>♂ {m.finalAcceptedByMale ? '✓' : '—'}</p>
                      <p>♀ {m.finalAcceptedByFemale ? '✓' : '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs" style={{ color:'rgba(232,227,213,0.35)' }}>
                      {formatDate(m.createdAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color:'rgba(232,227,213,0.3)' }}>Aucun match</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
