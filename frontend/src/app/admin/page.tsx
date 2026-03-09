'use client';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';
import { Users, Heart, Crown, Brain, TrendingUp, Loader2, RefreshCw } from 'lucide-react';
import { adminApi } from '@/lib/api';
import type { AdminStats } from '@/types';

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden:{ opacity:0,y:18 }, show:{ opacity:1,y:0,transition:{ duration:0.5,ease:[0.16,1,0.3,1] } } };

function AdminStatCard({ icon: Icon, label, value, accent, trend }: {
  icon:React.ElementType; label:string; value:number|string; accent:string; trend?:string;
}) {
  return (
    <motion.div variants={fadeUp}
      className="rounded-2xl p-5"
      style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background:`${accent}15`, border:`1px solid ${accent}25` }}>
          <Icon size={17} style={{ color:accent }}/>
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color:'#2D7D52' }}>
            <TrendingUp size={9}/>{trend}
          </span>
        )}
      </div>
      <p className="font-display font-bold" style={{ color:'#111827', fontSize:'1.6rem', letterSpacing:'-0.04em' }}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>{label}</p>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading, refetch, isFetching } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn:  () => adminApi.getStats().then(r => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={24} className="animate-spin" style={{ color:'#f87171' }}/>
    </div>
  );

  const chartData = [
    { name:'Actifs',   value:stats?.activeSubscriptions ?? 0, fill:'#C8384E' },
    { name:'Matchs',   value:stats?.totalMatches ?? 0,        fill:'#2D7D52' },
    { name:'Membres',  value:stats?.totalUsers ?? 0,          fill:'rgba(0,0,0,0.12)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="text-sm mt-1" style={{ color:'#9ca3af' }}>Vue d&apos;ensemble de la plateforme Zawjia</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary text-xs px-4 py-2.5">
          <RefreshCw size={12} className={isFetching ? 'animate-spin':''}/> Actualiser
        </button>
      </div>

      {/* Stat cards */}
      <motion.div initial="hidden" animate="show" variants={stagger} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminStatCard icon={Users}  label="Total membres"       value={stats?.totalUsers ?? 0}          accent="#C8384E" trend="+12%"/>
        <AdminStatCard icon={Crown}  label="Abonnements actifs"  value={stats?.activeSubscriptions ?? 0} accent="#f59e0b"/>
        <AdminStatCard icon={Heart}  label="Matchs totaux"        value={stats?.totalMatches ?? 0}       accent="#2D7D52"/>
        <AdminStatCard icon={Brain}  label="Logs IA"              value={stats?.totalAiLogs ?? 0}        accent="#6b7280"/>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Breakdown */}
        <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.2,duration:0.5,ease:[0.16,1,0.3,1] }}
          className="lg:col-span-2 rounded-2xl p-6"
          style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="section-title mb-5">Répartition des membres</h2>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label:'Frères', value:stats?.totalMales ?? 0, accent:'#C8384E' },
              { label:'Sœurs',  value:stats?.totalFemales ?? 0, accent:'#f59e0b' },
              { label:'Profils IA complets', value:stats?.aiCompletedUsers ?? 0, accent:'#2D7D52' },
              { label:'Walis enregistrés', value:stats?.totalWalis ?? 0, accent:'#6b7280' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-xl p-4"
                   style={{ background:`${accent}08`, border:`1px solid ${accent}20` }}>
                <p className="font-display font-bold text-xl" style={{ color:accent, letterSpacing:'-0.04em' }}>{value.toLocaleString()}</p>
                <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>{label}</p>
              </div>
            ))}
          </div>
          {/* Progress bars */}
          <div className="space-y-3">
            {[
              { label:'Frères',   value:stats?.totalMales ?? 0,          total:stats?.totalUsers ?? 1, color:'#C8384E' },
              { label:'Sœurs',    value:stats?.totalFemales ?? 0,        total:stats?.totalUsers ?? 1, color:'#f59e0b' },
              { label:'Abonnés',  value:stats?.activeSubscriptions ?? 0, total:stats?.totalUsers ?? 1, color:'#2D7D52' },
            ].map(({ label, value, total, color }) => (
              <div key={label}>
                <div className="flex justify-between text-[11px] mb-1" style={{ color:'#9ca3af' }}>
                  <span>{label}</span>
                  <span>{Math.round((value/total)*100)}%</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background:'rgba(0,0,0,0.06)' }}>
                  <motion.div className="h-full rounded-full"
                    style={{ background:color }}
                    initial={{ width:0 }}
                    animate={{ width:`${(value/total)*100}%` }}
                    transition={{ duration:1, delay:0.4 }}/>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ delay:0.3,duration:0.5,ease:[0.16,1,0.3,1] }}
          className="rounded-2xl p-6 flex flex-col items-center"
          style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
          <h2 className="section-title mb-4 self-start">Aperçu global</h2>
          <ResponsiveContainer width="100%" height={180}>
            <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={chartData}>
              <RadialBar dataKey="value" cornerRadius={4}/>
              <Tooltip contentStyle={{ background:'#f5f3ee', border:'1px solid rgba(0,0,0,0.09)', borderRadius:8, fontSize:12, color:'#111827' }}
                formatter={(v:number,n:string) => [v.toLocaleString(), n]}/>
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="space-y-2 w-full mt-1">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs" style={{ color:'#6b7280' }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background:d.fill }}/>
                <span>{d.name}</span>
                <span className="ml-auto font-bold" style={{ color:'#111827' }}>{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
