'use client';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Camera, Save, Loader2, User, MapPin, Heart, BookOpen } from 'lucide-react';
import { userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  firstName:          z.string().min(2).optional(),
  kunya:              z.string().optional(),
  age:                z.coerce.number().min(18).max(70).optional(),
  country:            z.string().optional(),
  city:               z.string().optional(),
  maritalStatus:      z.enum(['single','divorced','widowed']).optional(),
  religiousPractice:  z.enum(['little','practicing','very_practicing']).optional(),
  prayers:            z.enum(['regular','irregular','rarely']).optional(),
  madhhab:            z.enum(['hanafi','maliki','shafii','hanbali','other']).optional(),
  wantsChildren:      z.enum(['yes','no','undecided']).optional(),
  willingToRelocate:  z.coerce.boolean().optional(),
  nationality:        z.string().optional(),
  ethnicity:          z.enum(['arab','african','turkish','caucasian','asian','indian','latin','other']).optional(),
});
type FormData = z.infer<typeof schema>;

function Section({ icon: Icon, title, accent = '#C8384E', delay = 0, children }: {
  icon: React.ElementType; title: string; accent?: string; delay?: number; children: React.ReactNode
}) {
  return (
    <motion.div initial={{ opacity:0,y:18 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5,ease:[0.16,1,0.3,1],delay }}
      className="rounded-2xl p-6"
      style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
      <div className="flex items-center gap-2.5 mb-5 pb-4" style={{ borderBottom:'1px solid rgba(0,0,0,0.07)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
             style={{ background:`${accent}15`, border:`1px solid ${accent}30` }}>
          <Icon size={14} style={{ color: accent }}/>
        </div>
        <h3 className="font-semibold text-sm" style={{ color:'#111827' }}>{title}</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
    </motion.div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="text-xs mt-1" style={{ color:'rgba(248,113,113,0.8)' }}>{error}</p>}
    </div>
  );
}

export default function ProfilePage() {
  const qc         = useQueryClient();
  const { user, updateUser } = useAuthStore();
  const fileRef    = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  () => userApi.getProfile().then(r => r.data),
  });

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: data?.user ? {
      firstName:         data.user.firstName ?? '',
      kunya:             data.user.kunya ?? '',
      age:               data.user.age,
      country:           data.user.country ?? '',
      city:              data.user.city ?? '',
      maritalStatus:     data.user.maritalStatus,
      religiousPractice: data.user.religiousPractice,
      prayers:           data.user.prayers,
      madhhab:           data.user.madhhab,
      wantsChildren:     data.user.wantsChildren,
      willingToRelocate: data.user.willingToRelocate,
      nationality:       data.user.nationality ?? '',
      ethnicity:         data.user.ethnicity,
    } : undefined,
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => userApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data);
      qc.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profil mis à jour !');
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => userApi.uploadPhoto(file),
    onSuccess: () => toast.success('Photo enregistrée. Elle sera visible après un match.'),
    onError:   (err) => toast.error(getErrorMessage(err)),
  });

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    photoMutation.mutate(file);
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={26} className="animate-spin" style={{ color:'#C8384E' }}/>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-title">Mon profil</h1>
          <p className="text-sm mt-1" style={{ color:'#9ca3af' }}>
            Renseignez vos informations pour améliorer votre matching
          </p>
        </div>
        {user?.profileCompleted && (
          <span className="badge text-[11px] font-semibold"
                style={{ color:'#2D7D52', background:'rgba(45,125,82,0.1)', border:'1px solid rgba(45,125,82,0.25)' }}>
            ✓ Profil complet
          </span>
        )}
      </div>

      {/* Avatar card */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5,ease:[0.16,1,0.3,1] }}
        className="rounded-2xl p-6 flex items-center gap-5"
        style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center"
               style={{ background:'linear-gradient(135deg,rgba(200,56,78,0.25),rgba(200,56,78,0.05))', border:'2px solid rgba(200,56,78,0.3)' }}>
            {photoPreview
              ? <img src={photoPreview} alt="" className="w-full h-full object-cover"/>
              : <span className="font-display font-bold text-3xl" style={{ color:'#C8384E' }}>{user?.firstName?.[0] ?? '?'}</span>
            }
          </div>
          <button onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
            style={{ background:'#C8384E', boxShadow:'0 0 12px rgba(200,56,78,0.5)' }}>
            <Camera size={12} style={{ color:'#fff' }}/>
          </button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handlePhoto}/>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold font-display" style={{ color:'#111827', fontSize:'1.05rem', letterSpacing:'-0.02em' }}>
            {user?.firstName ?? 'Votre prénom'}
          </p>
          <p className="text-sm truncate" style={{ color:'#6b7280' }}>{user?.email}</p>
          <p className="text-[11px] mt-1.5" style={{ color:'#d1d5db' }}>
            Votre photo restera masquée jusqu&apos;au match réciproque
          </p>
        </div>
        {photoMutation.isPending && (
          <div className="flex items-center gap-2 text-xs" style={{ color:'#9ca3af' }}>
            <Loader2 size={13} className="animate-spin"/> Envoi…
          </div>
        )}
      </motion.div>

      <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
        <Section icon={User} title="Identité" accent="#C8384E" delay={0.08}>
          <Field label="Prénom" error={errors.firstName?.message}>
            <input {...register('firstName')} className="input-field" placeholder="Votre prénom"/>
          </Field>
          <Field label="Kunya (optionnel)">
            <input {...register('kunya')} className="input-field" placeholder="Abou Bilal, Oum Zaynab…"/>
          </Field>
          <Field label="Âge" error={errors.age?.message}>
            <input {...register('age')} type="number" className="input-field" placeholder="25"/>
          </Field>
          <Field label="Nationalité">
            <input {...register('nationality')} className="input-field" placeholder="Française"/>
          </Field>
          <Field label="Ethnie">
            <select {...register('ethnicity')} className="input-field">
              <option value="">Non renseigné</option>
              {['arab','african','turkish','caucasian','asian','indian','latin','other'].map(e => (
                <option key={e} value={e}>{e.charAt(0).toUpperCase()+e.slice(1)}</option>
              ))}
            </select>
          </Field>
        </Section>

        <Section icon={MapPin} title="Localisation" accent="#C8384E" delay={0.12}>
          <Field label="Pays">
            <input {...register('country')} className="input-field" placeholder="France"/>
          </Field>
          <Field label="Ville">
            <input {...register('city')} className="input-field" placeholder="Paris"/>
          </Field>
          <div className="flex items-center gap-3 sm:col-span-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input {...register('willingToRelocate')} type="checkbox" className="sr-only peer"/>
              <div className="w-10 h-5 rounded-full transition-colors peer-checked:bg-[#C8384E]"
                   style={{ background:'rgba(0,0,0,0.08)' }}>
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-5"/>
              </div>
            </label>
            <span className="text-sm" style={{ color:'#4b5563' }}>Prêt(e) à déménager</span>
          </div>
        </Section>

        <Section icon={Heart} title="Situation familiale" accent="#C8384E" delay={0.16}>
          <Field label="Statut matrimonial">
            <select {...register('maritalStatus')} className="input-field">
              <option value="">Choisir</option>
              <option value="single">Célibataire</option>
              <option value="divorced">Divorcé(e)</option>
              <option value="widowed">Veuf / Veuve</option>
            </select>
          </Field>
          <Field label="Désir d'enfants">
            <select {...register('wantsChildren')} className="input-field">
              <option value="">Choisir</option>
              <option value="yes">Oui</option>
              <option value="no">Non</option>
              <option value="undecided">Indécis(e)</option>
            </select>
          </Field>
        </Section>

        <Section icon={BookOpen} title="Pratique religieuse" accent="#C8384E" delay={0.2}>
          <Field label="Niveau de pratique">
            <select {...register('religiousPractice')} className="input-field">
              <option value="">Choisir</option>
              <option value="little">Peu pratiquant(e)</option>
              <option value="practicing">Pratiquant(e)</option>
              <option value="very_practicing">Très pratiquant(e)</option>
            </select>
          </Field>
          <Field label="Prières">
            <select {...register('prayers')} className="input-field">
              <option value="">Choisir</option>
              <option value="regular">Régulières</option>
              <option value="irregular">Irrégulières</option>
              <option value="rarely">Rarement</option>
            </select>
          </Field>
          <Field label="Madhab">
            <select {...register('madhhab')} className="input-field">
              <option value="">Non renseigné</option>
              <option value="hanafi">Hanafi</option>
              <option value="maliki">Maliki</option>
              <option value="shafii">Shafi&apos;i</option>
              <option value="hanbali">Hanbali</option>
              <option value="other">Autre</option>
            </select>
          </Field>
        </Section>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={isSubmitting || !isDirty} className="btn-primary px-8">
            {isSubmitting ? <Loader2 size={15} className="animate-spin"/> : <Save size={15}/>}
            Sauvegarder
          </button>
        </div>
      </form>
    </div>
  );
}
