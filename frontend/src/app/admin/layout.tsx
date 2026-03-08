'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, Heart, Crown, Sparkles, Brain, LogOut, Shield } from 'lucide-react';

const NAV = [
  { href:'/admin',               label:'Dashboard',   icon:LayoutDashboard },
  { href:'/admin/users',         label:'Membres',     icon:Users },
  { href:'/admin/matches',       label:'Matchs',      icon:Heart },
  { href:'/admin/subscriptions', label:'Abonnements', icon:Crown },
  { href:'/admin/walis',         label:'Walis',       icon:Sparkles },
  { href:'/admin/ai-logs',       label:'Logs IA',     icon:Brain },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (hydrated && !isAdmin()) router.replace('/admin/login'); }, [hydrated, isAdmin, router]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (!hydrated || !isAdmin()) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#070b10' }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col flex-shrink-0"
             style={{ background:'rgba(9,13,20,0.97)', borderRight:'1px solid rgba(255,255,255,0.07)', backdropFilter:'blur(24px)' }}>
        {/* Logo */}
        <div className="p-4 flex items-center gap-3" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
               style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)' }}>
            <Shield size={14} style={{ color:'#f87171' }}/>
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color:'#E8E3D5' }}>Administration</p>
            <p className="text-[10px]" style={{ color:'rgba(232,227,213,0.3)' }}>Zawjia · Panneau admin</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  color:      active ? '#f87171' : 'rgba(232,227,213,0.5)',
                  background: active ? 'rgba(239,68,68,0.08)' : 'transparent',
                  border:     active ? '1px solid rgba(239,68,68,0.18)' : '1px solid transparent',
                }}>
                <Icon size={15}/>
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }}>
          <p className="px-3 py-1.5 text-[10px] truncate mb-2" style={{ color:'rgba(232,227,213,0.3)' }}>{user?.email}</p>
          <Link href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5"
            style={{ color:'rgba(232,227,213,0.4)' }}>
            <LayoutDashboard size={14}/> Espace membre
          </Link>
          <button onClick={() => { logout(); router.push('/admin/login'); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
            style={{ color:'rgba(232,227,213,0.4)' }}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#f87171';(e.currentTarget as HTMLElement).style.background='rgba(239,68,68,0.07)'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(232,227,213,0.4)';(e.currentTarget as HTMLElement).style.background='transparent'}}>
            <LogOut size={14}/> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="px-6 py-3.5 flex items-center gap-3"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(9,13,20,0.8)', backdropFilter:'blur(16px)' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center"
               style={{ background:'rgba(239,68,68,0.12)' }}>
            <Shield size={11} style={{ color:'#f87171' }}/>
          </div>
          <span className="text-xs font-medium" style={{ color:'rgba(232,227,213,0.45)' }}>Administration Zawjia</span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div key={pathname} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
            transition={{ duration:0.35,ease:[0.16,1,0.3,1] }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
