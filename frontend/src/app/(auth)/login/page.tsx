'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, ArrowRight, Loader2, Lock, Mail } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/utils';
import type { User } from '@/types';

const schema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});
type FormData = z.infer<typeof schema>;

const stagger = { show: { transition: { staggerChildren: 0.07 } } };
const fadeUp  = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16,1,0.3,1] } } };

export default function LoginPage() {
  const setAuth         = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router          = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      const role = useAuthStore.getState().user?.role;
      router.replace(role === 'admin' ? '/admin' : '/ai-chat');
    }
  }, [isAuthenticated, router]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.login(data);
      const { token, role, userId } = res.data;
      localStorage.setItem('Zawjia_token', token);
      let profile: User;
      if (role === 'admin') {
        profile = { _id: userId, role, email: data.email } as User;
      } else {
        const { userApi } = await import('@/lib/api');
        const userRes = await userApi.getProfile();
        profile = { ...userRes.data.user, _id: userId, role };
      }
      setAuth(token, profile);
      toast.success('Bienvenue !');
      window.location.href = role === 'admin' ? '/admin' : '/ai-chat';
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={stagger}
      className="space-y-8"
    >
      {/* Header */}
      <motion.div variants={fadeUp} className="space-y-2">
        <h1 className="font-display font-bold text-gray-900"
            style={{ fontSize: '2rem', letterSpacing: '-0.03em' }}>
          Bon retour
        </h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>
          Connectez-vous à votre espace Zawjia
        </p>
      </motion.div>

      <motion.form variants={fadeUp} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="label">Adresse e-mail</label>
          <div className="relative">
            <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#d1d5db' }}/>
            <input
              {...register('email')}
              type="email"
              placeholder="vous@exemple.com"
              className="input-field pl-10"
              autoComplete="email"
            />
          </div>
          {errors.email && (
            <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
              className="text-xs mt-1.5" style={{ color: '#f07a8a' }}>
              {errors.email.message}
            </motion.p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="label">Mot de passe</label>
          <div className="relative">
            <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: '#d1d5db' }}/>
            <input
              {...register('password')}
              type={show ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-field pl-10 pr-12"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: '#9ca3af' }}
            >
              {show ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          {errors.password && (
            <motion.p initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
              className="text-xs mt-1.5" style={{ color: '#f07a8a' }}>
              {errors.password.message}
            </motion.p>
          )}
        </div>

        <div className="pt-1">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-sm">
            {isSubmitting
              ? <Loader2 size={16} className="animate-spin"/>
              : <><span>Se connecter</span><ArrowRight size={16}/></>
            }
          </button>
        </div>
      </motion.form>

      <motion.div variants={fadeUp} className="text-center text-sm" style={{ color: '#6b7280' }}>
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-semibold transition-colors hover:text-gray-900"
              style={{ color: '#C8384E' }}>
          S&apos;inscrire gratuitement
        </Link>
      </motion.div>

      <motion.div
        variants={fadeUp}
        className="p-4 rounded-xl text-xs text-center"
        style={{
          background: 'rgba(0,0,0,0.04)',
          border: '1px solid rgba(0,0,0,0.07)',
          color: '#6b7280',
        }}
      >
        🔒 Données protégées conformément au RGPD — Aucun partage sans consentement
      </motion.div>
    </motion.div>
  );
}


