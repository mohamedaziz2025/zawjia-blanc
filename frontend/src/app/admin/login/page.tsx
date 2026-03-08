'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Loader2, Shield, Mail, Lock } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/utils';
import type { User } from '@/types';

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1,'Mot de passe requis'),
});
type FormData = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const setAuth = useAuthStore(s => s.setAuth);
  const [show, setShow]       = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (!hydrated) return;
    const stored = localStorage.getItem('Zawjia_auth');
    if (stored) {
      try {
        const state = JSON.parse(stored)?.state;
        if (state?.user?.role === 'admin' && state?.token) window.location.href = '/admin';
      } catch { /* ignore */ }
    }
  }, [hydrated]);

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { token, role, userId } = res.data;
      if (role !== 'admin') { toast.error('Accès réservé aux administrateurs.'); return; }
      localStorage.setItem('Zawjia_token', token);
      setAuth(token, { _id:userId, role, email:data.email } as User);
      toast.success('Bienvenue dans le panneau admin.');
      window.location.href = '/admin';
    } catch (err) { toast.error(getErrorMessage(err)); }
  };

  const errStyle = { color:'rgba(248,113,113,0.85)', fontSize:'11px', marginTop:'5px', display:'block' };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background:'#070b10' }}>
      {/* BG orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute" style={{ width:'500px', height:'500px', borderRadius:'50%', top:'-100px', left:'-100px',
          background:'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)' }}/>
        <div className="absolute" style={{ width:'400px', height:'400px', borderRadius:'50%', bottom:'-80px', right:'-80px',
          background:'radial-gradient(circle, rgba(200,56,78,0.05) 0%, transparent 70%)' }}/>
      </div>

      <motion.div initial={{ opacity:0,y:24,scale:0.97 }} animate={{ opacity:1,y:0,scale:1 }}
        transition={{ duration:0.55,ease:[0.16,1,0.3,1] }}
        className="relative w-full max-w-md">
        <div className="rounded-2xl p-8"
             style={{ background:'rgba(17,22,32,0.9)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 8px 60px rgba(0,0,0,0.5)' }}>

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                 style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', boxShadow:'0 0 30px rgba(239,68,68,0.12)' }}>
              <Shield size={26} style={{ color:'#f87171' }}/>
            </div>
            <h1 className="font-display font-bold text-center" style={{ color:'#E8E3D5', fontSize:'1.5rem', letterSpacing:'-0.03em' }}>
              Accès Administration
            </h1>
            <p className="text-sm mt-1 text-center" style={{ color:'rgba(232,227,213,0.4)' }}>
              Réservé aux administrateurs Zawjia
            </p>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }}/>
            <Lock size={11} style={{ color:'rgba(232,227,213,0.2)' }}/>
            <div className="flex-1 h-px" style={{ background:'rgba(255,255,255,0.06)' }}/>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email administrateur</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
                <input type="email" placeholder="admin@zawjia.com" {...register('email')} className="input-field pl-9" autoComplete="username"/>
              </div>
              {errors.email && <span style={errStyle}>{errors.email.message}</span>}
            </div>

            <div>
              <label className="label">Mot de passe</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
                <input type={show ? 'text':'password'} placeholder="••••••••" {...register('password')} className="input-field pl-9 pr-11" autoComplete="current-password"/>
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color:'rgba(232,227,213,0.3)' }}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(232,227,213,0.7)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(232,227,213,0.3)'}>
                  {show ? <EyeOff size={15}/> : <Eye size={15}/>}
                </button>
              </div>
              {errors.password && <span style={errStyle}>{errors.password.message}</span>}
            </div>

            <button type="submit" disabled={isSubmitting}
              className="w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2"
              style={{ background:'linear-gradient(135deg,#ef4444,#dc2626)', color:'#fff', boxShadow:'0 4px 20px rgba(239,68,68,0.3)' }}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 6px 28px rgba(239,68,68,0.45)'}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.boxShadow='0 4px 20px rgba(239,68,68,0.3)'}>
              {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <><Shield size={15}/> Accéder au panneau</>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
