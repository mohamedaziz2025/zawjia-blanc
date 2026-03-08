'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Eye, EyeOff, UserPlus, Loader2, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { authApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  role:               z.enum(['male','female'], { required_error: 'Choisissez votre genre' }),
  email:              z.string().email('Email invalide'),
  password:           z.string().min(8,'Minimum 8 caractères').regex(/[A-Z]/,'Au moins une majuscule').regex(/[0-9]/,'Au moins un chiffre'),
  confirmPassword:    z.string(),
  firstName:          z.string().min(2,'Prénom requis'),
  age:                z.coerce.number().min(18,'18 ans minimum').max(70,'Âge invalide'),
  country:            z.string().min(2,'Pays requis'),
  city:               z.string().min(2,'Ville requise'),
  maritalStatus:      z.enum(['single','divorced','widowed'], { required_error:'Situation requise' }),
  hasAcceptedCharter: z.literal(true, { errorMap: () => ({ message:'Vous devez accepter la charte' }) }),
}).refine(d => d.password === d.confirmPassword, { message:'Mots de passe différents', path:['confirmPassword'] });
type FormData = z.infer<typeof schema>;

const STEPS = [
  { title:'Votre profil',     sub:'Comment souhaitez-vous être accompagné(e) ?' },
  { title:'Vos identifiants', sub:'Créez vos accès sécurisés' },
  { title:'À propos de vous', sub:'Informations de base pour le matching' },
  { title:'Charte éthique',   sub:'Un engagement pour une démarche sérieuse' },
];

export default function RegisterPage() {
  const router          = useRouter();
  const setAuth         = useAuthStore(s => s.setAuth);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [step, setStep]   = useState(0);
  const [show, setShow]   = useState(false);
  const [show2, setShow2] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, watch, trigger, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const selectedRole = watch('role');

  const nextStep = async () => {
    const fieldsMap: Array<Array<keyof FormData>> = [
      ['role'],
      ['email','password','confirmPassword'],
      ['firstName','age','country','city','maritalStatus'],
      ['hasAcceptedCharter'],
    ];
    const ok = await trigger(fieldsMap[step]);
    if (ok) setStep(s => Math.min(s+1, STEPS.length-1));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({
        email:data.email, password:data.password, role:data.role,
        firstName:data.firstName, age:data.age, country:data.country,
        city:data.city, maritalStatus:data.maritalStatus, hasAcceptedCharter:true,
      });
      const { token, role, userId } = res.data;
      try {
        const userRes = await userApi.getProfile();
        setAuth(token, { ...userRes.data.user, _id:userId, role });
      } catch {
        setAuth(token, { _id:userId, role, email:data.email } as never);
      }
      toast.success('Compte créé ! Bienvenue sur Zawjia 🌙');
      router.push('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const errStyle = { color:'rgba(248,113,113,0.85)', fontSize:'11px', marginTop:'5px', display:'block' };
  const cardBase = { borderRadius:'16px', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(255,255,255,0.03)', padding:'16px 20px' };

  return (
    <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}>
      {/* Header */}
      <div className="mb-7">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
            transition={{ duration:0.28 }}>
            <h1 className="font-display font-bold" style={{ fontSize:'1.75rem', letterSpacing:'-0.03em', color:'#E8E3D5' }}>
              {STEPS[step].title}
            </h1>
            <p className="text-sm mt-1" style={{ color:'rgba(232,227,213,0.45)' }}>{STEPS[step].sub}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mb-7">
        {STEPS.map((_,i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-500"
               style={{ background: i <= step ? '#C8384E' : 'rgba(255,255,255,0.08)' }}/>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 0: Gender */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}
              transition={{ duration:0.3 }} className="space-y-3">
              <p className="text-sm text-center mb-5" style={{ color:'rgba(232,227,213,0.45)' }}>
                Zawjia adapte votre parcours selon votre profil pour respecter les valeurs islamiques.
              </p>
              {([
                { v:'male',   emoji:'👳', title:'Frère (Homme)',  sub:"Recherche d'une épouse" },
                { v:'female', emoji:'🧕', title:'Sœur (Femme)',   sub:"Recherche d'un époux" },
              ] as const).map(({ v, emoji, title, sub }) => {
                const active = selectedRole === v;
                return (
                  <button key={v} type="button" onClick={() => setValue('role', v)}
                    className="w-full text-left flex items-center gap-4 rounded-2xl p-5 transition-all duration-300"
                    style={{
                      border: active ? '1.5px solid #C8384E' : '1px solid rgba(255,255,255,0.08)',
                      background: active ? 'rgba(200,56,78,0.08)' : 'rgba(255,255,255,0.02)',
                      boxShadow: active ? '0 0 20px rgba(200,56,78,0.15)' : 'none',
                    }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                         style={{ background:'rgba(255,255,255,0.06)' }}>{emoji}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color:'#E8E3D5' }}>{title}</p>
                      <p className="text-xs mt-0.5" style={{ color:'rgba(232,227,213,0.4)' }}>{sub}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                         style={{ border:`2px solid ${active ? '#C8384E' : 'rgba(255,255,255,0.2)'}`, background: active ? '#C8384E' : 'transparent' }}>
                      {active && <div className="w-2 h-2 rounded-full bg-white"/>}
                    </div>
                  </button>
                );
              })}
              {errors.role && <span style={errStyle}>{errors.role.message}</span>}
            </motion.div>
          )}

          {/* Step 1: Credentials */}
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}
              transition={{ duration:0.3 }} className="space-y-4">
              <div>
                <label className="label">Adresse e-mail</label>
                <input {...register('email')} type="email" placeholder="vous@exemple.com" className="input-field" autoComplete="email"/>
                {errors.email && <span style={errStyle}>{errors.email.message}</span>}
              </div>
              <div>
                <label className="label">Mot de passe</label>
                <div className="relative">
                  <input {...register('password')} type={show ? 'text':'password'} placeholder="••••••••" className="input-field pr-12" autoComplete="new-password"/>
                  <button type="button" onClick={() => setShow(!show)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:'rgba(232,227,213,0.35)' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(232,227,213,0.7)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(232,227,213,0.35)'}>
                    {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.password && <span style={errStyle}>{errors.password.message}</span>}
                <p className="text-[11px] mt-1.5" style={{ color:'rgba(232,227,213,0.3)' }}>8+ caractères, 1 majuscule, 1 chiffre</p>
              </div>
              <div>
                <label className="label">Confirmer le mot de passe</label>
                <div className="relative">
                  <input {...register('confirmPassword')} type={show2 ? 'text':'password'} placeholder="••••••••" className="input-field pr-12" autoComplete="new-password"/>
                  <button type="button" onClick={() => setShow2(!show2)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:'rgba(232,227,213,0.35)' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(232,227,213,0.7)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(232,227,213,0.35)'}>
                    {show2 ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.confirmPassword && <span style={errStyle}>{errors.confirmPassword.message}</span>}
              </div>
            </motion.div>
          )}

          {/* Step 2: Profile */}
          {step === 2 && (
            <motion.div key="s2" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}
              transition={{ duration:0.3 }} className="space-y-4">
              <div>
                <label className="label">Prénom</label>
                <input {...register('firstName')} placeholder="Votre prénom" className="input-field"/>
                {errors.firstName && <span style={errStyle}>{errors.firstName.message}</span>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Âge</label>
                  <input {...register('age')} type="number" min={18} max={70} placeholder="25" className="input-field"/>
                  {errors.age && <span style={errStyle}>{errors.age.message}</span>}
                </div>
                <div>
                  <label className="label">Situation</label>
                  <select {...register('maritalStatus')} className="input-field">
                    <option value="">Choisir</option>
                    <option value="single">Célibataire</option>
                    <option value="divorced">Divorcé(e)</option>
                    <option value="widowed">Veuf / Veuve</option>
                  </select>
                  {errors.maritalStatus && <span style={errStyle}>{errors.maritalStatus.message}</span>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Pays</label>
                  <input {...register('country')} placeholder="France" className="input-field"/>
                  {errors.country && <span style={errStyle}>{errors.country.message}</span>}
                </div>
                <div>
                  <label className="label">Ville</label>
                  <input {...register('city')} placeholder="Paris" className="input-field"/>
                  {errors.city && <span style={errStyle}>{errors.city.message}</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Charter */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}
              transition={{ duration:0.3 }} className="space-y-4">
              <div className="rounded-2xl p-4 text-sm leading-relaxed space-y-2.5 max-h-44 overflow-y-auto"
                   style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <p className="font-semibold text-[11px] tracking-widest uppercase" style={{ color:'#C8384E' }}>
                  Charte Éthique Islamique Zawjia
                </p>
                <p style={{ color:'rgba(232,227,213,0.6)' }}>En vous inscrivant, vous vous engagez à :</p>
                <ul className="space-y-1.5" style={{ color:'rgba(232,227,213,0.5)' }}>
                  {[
                    'Avoir une démarche sérieuse orientée vers le mariage',
                    'Ne pas partager de contenus inconvenants',
                    'Respecter chaque membre avec dignité',
                    "Impliquer votre Wali (pour les sœurs)",
                    'Ne pas utiliser la plateforme à des fins interdites',
                    "Signaler tout comportement inapproprié",
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle2 size={12} className="mt-0.5 flex-shrink-0" style={{ color:'rgba(200,56,78,0.6)' }}/>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input {...register('hasAcceptedCharter')} type="checkbox" className="sr-only peer"/>
                  <div className="w-5 h-5 rounded-md transition-all duration-200 flex items-center justify-center peer-checked:bg-[#C8384E]"
                       style={{ border:'1.5px solid rgba(255,255,255,0.2)' }}>
                    <svg className="hidden peer-checked:block w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <p className="text-sm leading-relaxed transition-colors"
                   style={{ color:'rgba(232,227,213,0.55)' }}>
                  J&apos;ai lu et j&apos;accepte la charte éthique islamique. Je m&apos;engage à une démarche sérieuse orientée vers le mariage.
                </p>
              </label>
              {errors.hasAcceptedCharter && <span style={errStyle}>{errors.hasAcceptedCharter.message}</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 0 && (
            <button type="button" onClick={() => setStep(s => s-1)} className="btn-secondary flex-1">
              <ChevronLeft size={16}/> Retour
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={nextStep} className="btn-primary flex-1">
              Continuer <ChevronRight size={16}/>
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
              {isSubmitting ? <Loader2 size={15} className="animate-spin"/> : <><UserPlus size={15}/> Créer mon compte</>}
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm" style={{ color:'rgba(232,227,213,0.4)' }}>
          Déjà inscrit(e) ?{' '}
          <Link href="/login" className="font-semibold transition-colors" style={{ color:'#C8384E' }}
            onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='rgba(200,56,78,0.7)'}
            onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#C8384E'}>
            Se connecter
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
