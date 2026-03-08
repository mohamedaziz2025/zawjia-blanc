'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Ban, CheckCircle2, Loader2, Filter, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { getErrorMessage, formatDate } from '@/lib/utils';
import type { User } from '@/types';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch]   = useState('');
  const [roleFilter, setRole] = useState<string>('all');

  const { data: users = [], isLoading, refetch, isFetching } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn:  () => adminApi.getUsers().then(r => r.data),
  });

  const banMutation   = useMutation({ mutationFn:(id:string) => adminApi.banUser(id),   onSuccess:()=>{ qc.invalidateQueries({queryKey:['admin-users']}); toast.success('Utilisateur suspendu'); }, onError:(err)=>toast.error(getErrorMessage(err)) });
  const unbanMutation = useMutation({ mutationFn:(id:string) => adminApi.unbanUser(id), onSuccess:()=>{ qc.invalidateQueries({queryKey:['admin-users']}); toast.success('Utilisateur réactivé'); }, onError:(err)=>toast.error(getErrorMessage(err)) });

  const filtered = users.filter(u => {
    const okRole   = roleFilter === 'all' || u.role === roleFilter;
    const q        = search.toLowerCase();
    const okSearch = !search || u.email.toLowerCase().includes(q) || u.firstName?.toLowerCase().includes(q);
    return okRole && okSearch;
  });

  const ROLE_COLORS: Record<string,{color:string;bg:string}> = {
    male:   { color:'rgba(200,56,78,0.8)',    bg:'rgba(200,56,78,0.08)'    },
    female: { color:'rgba(245,158,11,0.8)',   bg:'rgba(245,158,11,0.08)'   },
    admin:  { color:'rgba(248,113,113,0.8)',  bg:'rgba(239,68,68,0.08)'    },
  };
  const SUB_COLORS: Record<string,{color:string;bg:string}> = {
    active:  { color:'#2D7D52',                bg:'rgba(45,125,82,0.1)'    },
    free:    { color:'rgba(232,227,213,0.4)',   bg:'rgba(255,255,255,0.04)' },
    expired: { color:'rgba(248,113,113,0.8)',  bg:'rgba(239,68,68,0.08)'   },
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Gestion des membres</h1>
          <p className="text-sm mt-1" style={{ color:'rgba(232,227,213,0.4)' }}>{users.length} membres inscrits</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary text-xs px-3 py-2">
          <RefreshCw size={12} className={isFetching ? 'animate-spin':''}/>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
          <input type="text" placeholder="Rechercher par email ou prénom…" value={search} onChange={e=>setSearch(e.target.value)} className="input-field pl-9"/>
        </div>
        <div className="relative">
          <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
          <select value={roleFilter} onChange={e=>setRole(e.target.value)} className="input-field pl-9 min-w-[150px]">
            <option value="all">Tous les rôles</option>
            <option value="male">Frères</option>
            <option value="female">Sœurs</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                  {['Membre','Rôle','Statut','Abonnement','Phase IA','Inscrit le','Actions'].map(h => (
                    <th key={h} className="px-4 py-3.5 text-left text-[10px] font-semibold tracking-widest uppercase whitespace-nowrap"
                        style={{ color:'rgba(232,227,213,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u, i) => (
                  <motion.tr key={u._id} initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.02 }}
                    style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', opacity:u.banned ? 0.55:1 }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(255,255,255,0.025)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold"
                             style={{ background:'rgba(200,56,78,0.1)', color:'#C8384E' }}>
                          {u.firstName?.[0] ?? '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate max-w-[140px]" style={{ color:'#E8E3D5' }}>{u.firstName ?? '—'}</p>
                          <p className="text-xs truncate max-w-[140px]" style={{ color:'rgba(232,227,213,0.35)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge text-[10px]" style={{ color:(ROLE_COLORS[u.role]??ROLE_COLORS.male).color, background:(ROLE_COLORS[u.role]??ROLE_COLORS.male).bg, border:`1px solid ${(ROLE_COLORS[u.role]??ROLE_COLORS.male).color}30` }}>
                        {u.role === 'male' ? '👳 Frère' : u.role === 'female' ? '🧕 Sœur' : '🛡 Admin'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge text-[10px]" style={{ color:u.banned?'rgba(248,113,113,0.8)':'#2D7D52', background:u.banned?'rgba(239,68,68,0.08)':'rgba(45,125,82,0.1)', border:`1px solid ${u.banned?'rgba(239,68,68,0.2)':'rgba(45,125,82,0.2)'}` }}>
                        {u.banned ? '⛔ Suspendu' : '✓ Actif'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge text-[10px]" style={{ color:(SUB_COLORS[u.subscriptionStatus ?? 'free']??SUB_COLORS.free).color, background:(SUB_COLORS[u.subscriptionStatus ?? 'free']??SUB_COLORS.free).bg, border:`1px solid ${(SUB_COLORS[u.subscriptionStatus ?? 'free']??SUB_COLORS.free).color}30` }}>
                        {u.subscriptionStatus ?? 'free'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex gap-0.5 mb-1">
                        {Array.from({length:8},(_,j) => (
                          <div key={j} className="w-1.5 h-1.5 rounded-full"
                               style={{ background:u.aiPhaseCompleted?'#C8384E':'rgba(255,255,255,0.1)' }}/>
                        ))}
                      </div>
                      <p className="text-[10px]" style={{ color:'rgba(232,227,213,0.3)' }}>{u.aiPhaseCompleted?'Complète':'En cours'}</p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap text-xs" style={{ color:'rgba(232,227,213,0.35)' }}>
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.role !== 'admin' && (
                        u.banned ? (
                          <button onClick={() => unbanMutation.mutate(u._id)} disabled={unbanMutation.isPending}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color:'#2D7D52' }}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(45,125,82,0.1)'}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                            {unbanMutation.isPending ? <Loader2 size={11} className="animate-spin"/> : <CheckCircle2 size={11}/>}
                            Réactiver
                          </button>
                        ) : (
                          <button onClick={() => banMutation.mutate(u._id)} disabled={banMutation.isPending}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors"
                            style={{ color:'rgba(248,113,113,0.7)' }}
                            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.08)'}
                            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                            {banMutation.isPending ? <Loader2 size={11} className="animate-spin"/> : <Ban size={11}/>}
                            Suspendre
                          </button>
                        )
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-sm" style={{ color:'rgba(232,227,213,0.3)' }}>
                {search ? 'Aucun résultat pour cette recherche' : 'Aucun membre'}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
