'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard, User, Brain, Heart, Sparkles, Crown,
  Users, LogOut, Menu, X, ChevronRight, Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  gate?: (user: ReturnType<typeof useAuthStore.getState>['user']) => boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/ai-chat',      label: 'Zawj IA',       icon: Brain },
  { href: '/dashboard',    label: 'Accueil',       icon: LayoutDashboard },
  { href: '/profile',      label: 'Mon profil',    icon: User },
  { href: '/proposals',    label: 'Propositions',  icon: Heart,     gate: (u) => Boolean(u?.aiPhaseCompleted) },
  { href: '/matches',      label: 'Mes matchs',    icon: Users },
  { href: '/subscription', label: 'Abonnement',    icon: Crown },
  { href: '/wali',         label: 'Wali',          icon: Sparkles,  gate: (u) => u?.role === 'female' },
];

function SidebarNavItem({ item, collapsed, onClose }: { item: NavItem; collapsed: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const isActive = pathname === item.href;
  const locked   = item.gate && !item.gate(user);

  return (
    <Link
      href={locked ? '#' : item.href}
      onClick={locked ? undefined : onClose}
      title={collapsed ? item.label : undefined}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group select-none',
        isActive  ? 'text-gray-900' : locked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-500 hover:text-gray-900',
        !isActive && !locked && 'hover:bg-black/[0.04]',
      )}
    >
      {/* Active bg */}
      {isActive && (
        <motion.div
          layoutId="active-nav-bg"
          className="absolute inset-0 rounded-xl"
          style={{ background: 'linear-gradient(135deg, rgba(200,56,78,0.15) 0%, rgba(200,56,78,0.05) 100%)', border: '1px solid rgba(200,56,78,0.25)' }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
        />
      )}

      <item.icon
        size={17}
        className={cn(
          'relative flex-shrink-0 transition-colors duration-200',
          isActive ? 'text-gold-400' : locked ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-700',
        )}
      />

      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.25, ease: [0.16,1,0.3,1] }}
            className="relative whitespace-nowrap overflow-hidden flex-1"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {locked && !collapsed && (
        <span className="relative ml-auto text-[9px] font-medium px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(0,0,0,0.05)', color: '#9ca3af', border: '1px solid rgba(0,0,0,0.08)' }}>
          Verrouillé
        </span>
      )}

      {isActive && !collapsed && (
        <span className="relative w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#C8384E', boxShadow: '0 0 6px rgba(200,56,78,0.8)' }}/>
      )}
    </Link>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => { if (hydrated && !isAuthenticated()) router.replace('/login'); }, [hydrated, isAuthenticated, router]);
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  if (!hydrated || !isAuthenticated() || !user) return null;

  const handleLogout = () => { logout(); router.push('/login'); };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className={cn(
        'flex flex-col h-full transition-all duration-300',
        mobile ? 'w-72' : collapsed ? 'w-[70px]' : 'w-[230px]',
      )}
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(0,0,0,0.07)',
      }}
    >
      {/* Logo */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 flex-shrink-0',
        collapsed && !mobile && 'justify-center px-0',
      )}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-105"
               style={{ background: 'linear-gradient(135deg, rgba(200,56,78,0.25) 0%, rgba(200,56,78,0.1) 100%)', border: '1px solid rgba(200,56,78,0.38)', boxShadow: '0 0 16px rgba(200,56,78,0.2)' }}>
            <Sparkles size={15} style={{ color: '#C8384E' }}/>
          </div>
          <AnimatePresence>
            {(!collapsed || mobile) && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="font-display font-bold text-gray-900 text-base tracking-tight"
                style={{ letterSpacing: '-0.02em' }}
              >
                Zawjia
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="ml-auto p-1 rounded-lg transition-all duration-200 hover:bg-black/[0.05]"
            style={{ color: '#9ca3af', flexShrink: 0 }}
          >
            <ChevronRight size={14} className={cn('transition-transform duration-300', !collapsed && 'rotate-180')}/>
          </button>
        )}
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto p-1.5 rounded-lg hover:bg-black/[0.05] transition-colors"
                  style={{ color: '#6b7280' }}>
            <X size={16}/>
          </button>
        )}
      </div>

      {/* User card */}
      <div className={cn('px-3 pb-4 flex-shrink-0', collapsed && !mobile && 'flex justify-center')}>
        {collapsed && !mobile ? (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, rgba(200,56,78,0.25), rgba(200,56,78,0.08))', border: '1px solid rgba(200,56,78,0.3)' }}>
            <span className="text-xs font-bold" style={{ color: '#C8384E' }}>{user.firstName?.[0] ?? '?'}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl"
               style={{ background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                 style={{ background: 'linear-gradient(135deg, rgba(200,56,78,0.22), rgba(200,56,78,0.07))', border: '1px solid rgba(200,56,78,0.28)' }}>
              <span className="text-sm font-bold" style={{ color: '#C8384E' }}>{user.firstName?.[0] ?? '?'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 truncate" style={{ letterSpacing: '-0.01em' }}>
                {user.firstName ?? 'Utilisateur'}
              </p>
              <p className="text-[10px] truncate" style={{ color: '#9ca3af' }}>{user.email}</p>
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="mx-3 mb-3 h-px" style={{ background: 'rgba(0,0,0,0.07)' }}/>

      {/* Nav */}
      <nav className="flex-1 px-2.5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            collapsed={collapsed && !mobile}
            onClose={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* AI Progress */}
      <AnimatePresence>
        {(!collapsed || mobile) && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mx-3 mb-3 p-3 rounded-xl"
            style={{ background: 'rgba(200,56,78,0.06)', border: '1px solid rgba(200,56,78,0.14)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold" style={{ color: '#9ca3af', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Analyse IA
              </p>
              <p className="text-[10px] font-bold" style={{ color: '#C8384E' }}>
                {user.aiPhaseCompleted ? '8/8' : '?/8'}
              </p>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #a8243c, #C8384E)' }}
                initial={{ width: 0 }}
                animate={{ width: user.aiPhaseCompleted ? '100%' : '12.5%' }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16,1,0.3,1] }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ background: 'rgba(0,0,0,0.07)' }}/>

      {/* Logout */}
      <div className={cn('p-2.5 flex-shrink-0', collapsed && !mobile && 'flex justify-center')}>
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl w-full transition-all duration-200',
            collapsed && !mobile && 'w-auto justify-center',
          )}
          style={{ color: '#9ca3af' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.cssText += 'color:#dc2626;background:rgba(220,38,38,0.06)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.cssText = (e.currentTarget as HTMLElement).style.cssText.replace(/color:[^;]+;|background:[^;]+;/g,''); (e.currentTarget as HTMLElement).style.color='#9ca3af'; (e.currentTarget as HTMLElement).style.background='transparent'; }}
          title={collapsed ? 'Déconnexion' : undefined}
        >
          <LogOut size={15}/>
          {(!collapsed || mobile) && <span className="font-medium" style={{ letterSpacing: '-0.01em' }}>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f7f4' }}>
      {/* Desktop sidebar */}
      <div className="hidden md:flex flex-shrink-0">
        <Sidebar/>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 backdrop-blur-sm md:hidden"
              style={{ background: 'rgba(0,0,0,0.35)' }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 z-50 md:hidden"
            >
              <Sidebar mobile/>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center gap-3 px-4 md:px-6 py-3.5 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(0,0,0,0.07)', background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(20px)' }}>
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg transition-colors"
                  style={{ color: '#6b7280' }}>
            <Menu size={20}/>
          </button>

          <div className="flex-1"/>

          {/* Sub badge */}
          <div className={cn('badge text-xs font-semibold', user.subscriptionStatus === 'active'
            ? 'bg-emerald-400/10 border border-emerald-400/20 text-emerald-400'
            : 'border text-gray-500')}
            style={ user.subscriptionStatus !== 'active' ? { borderColor: 'rgba(0,0,0,0.1)', background: 'rgba(0,0,0,0.04)' } : {} }
          >
            <Crown size={9}/>
            {user.subscriptionStatus === 'active' ? 'Premium' : 'Gratuit'}
          </div>

          <button className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:bg-black/[0.05]"
                  style={{ border: '1px solid rgba(0,0,0,0.08)', color: '#6b7280' }}>
            <Bell size={14}/>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: '#C8384E', boxShadow: '0 0 6px rgba(200,56,78,0.7)' }}/>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.38, ease: [0.16,1,0.3,1] }}
              className="max-w-5xl mx-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

