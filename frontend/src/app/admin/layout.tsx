'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, Heart, Crown, Sparkles, Brain, LogOut, Shield, Menu, X } from 'lucide-react';

const NAV = [
  { href:'/admin',               label:'Dashboard',   icon:LayoutDashboard },
  { href:'/admin/users',         label:'Membres',     icon:Users },
  { href:'/admin/matches',       label:'Matchs',      icon:Heart },
  { href:'/admin/subscriptions', label:'Abonnements', icon:Crown },
  { href:'/admin/walis',         label:'Walis',       icon:Sparkles },
  { href:'/admin/ai-logs',       label:'Logs IA',     icon:Brain },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, logout } = useAuthStore();

  return (
    <aside className="w-56 flex flex-col h-full"
           style={{ background:'rgba(255,255,255,0.97)', borderRight:'1px solid rgba(0,0,0,0.07)', backdropFilter:'blur(24px)' }}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3" style={{ borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
             style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)' }}>
          <Shield size={14} style={{ color:'#f87171' }}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold" style={{ color:'#111827' }}>Administration</p>
          <p className="text-[10px]" style={{ color:'#9ca3af' }}>Zawjia · Panneau admin</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-black/[0.05] transition-colors md:hidden"
                  style={{ color:'#6b7280' }}>
            <X size={16}/>
          </button>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                color:      active ? '#dc2626' : '#6b7280',
                background: active ? 'rgba(220,38,38,0.06)' : 'transparent',
                border:     active ? '1px solid rgba(220,38,38,0.18)' : '1px solid transparent',
              }}>
              <Icon size={15}/>
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3" style={{ borderTop:'1px solid rgba(0,0,0,0.07)' }}>
        <p className="px-3 py-1.5 text-[10px] truncate mb-2" style={{ color:'#9ca3af' }}>{user?.email}</p>
        <Link href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors mb-0.5"
          style={{ color:'#6b7280' }}>
          <LayoutDashboard size={14}/> Espace membre
        </Link>
        <button onClick={() => { logout(); router.push('/admin/login'); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors text-left"
          style={{ color:'#6b7280' }}
          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#dc2626';(e.currentTarget as HTMLElement).style.background='rgba(220,38,38,0.06)'}}
          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='#6b7280';(e.currentTarget as HTMLElement).style.background='transparent'}}>
          <LogOut size={14}/> Déconnexion
        </button>
      </div>
    </aside>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { isAdmin } = useAuthStore();
  const [hydrated, setHydrated]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (hydrated && !isAdmin()) router.replace('/admin/login'); }, [hydrated, isAdmin, router]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (pathname === '/admin/login') return <>{children}</>;
  if (!hydrated || !isAdmin()) return null;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background:'#f8f7f4' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <SidebarContent/>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              transition={{ duration:0.2 }}
              className="fixed inset-0 z-40 backdrop-blur-sm md:hidden"
              style={{ background:'rgba(0,0,0,0.35)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x:-280 }} animate={{ x:0 }} exit={{ x:-280 }}
              transition={{ type:'spring', damping:28, stiffness:320 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden">
              <SidebarContent onClose={() => setMobileOpen(false)}/>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="px-4 md:px-6 py-3.5 flex items-center gap-3"
                style={{ borderBottom:'1px solid rgba(0,0,0,0.05)', background:'rgba(255,255,255,0.88)', backdropFilter:'blur(16px)' }}>
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg transition-colors"
                  style={{ color:'#6b7280' }}>
            <Menu size={20}/>
          </button>
          <div className="w-5 h-5 rounded flex items-center justify-center hidden md:flex"
               style={{ background:'rgba(220,38,38,0.08)' }}>
            <Shield size={11} style={{ color:'#dc2626' }}/>
          </div>
          <span className="text-xs font-medium" style={{ color:'#9ca3af' }}>Administration Zawjia</span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div key={pathname} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }}
            transition={{ duration:0.35,ease:[0.16,1,0.3,1] }}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
