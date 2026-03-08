'use client';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Loader2, User, Phone, Mail, Heart, Info, Shield } from 'lucide-react';
import { waliApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage } from '@/lib/utils';

const schema = z.object({
  name:         z.string().min(2,'Nom complet requis'),
  phone:        z.string().min(8,'Numéro requis'),
  email:        z.string().email('Email invalide'),
  relationship: z.string().min(2,'Lien de parenté requis'),
});
type FormData = z.infer<typeof schema>;

export default function WaliPage() {
  const { user } = useAuthStore();

  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => waliApi.add(data),
    onSuccess: () => { toast.success('Wali enregistré ! Un email de vérification lui a été envoyé.'); reset(); },
    onError:   (err) => toast.error(getErrorMessage(err)),
  });

  if (user?.role !== 'female') {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
             style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <Info size={26} style={{ color:'rgba(232,227,213,0.3)' }}/>
        </div>
        <h2 className="font-display font-semibold" style={{ color:'#E8E3D5', fontSize:'1.1rem', letterSpacing:'-0.02em' }}>
          Fonctionnalité réservée aux sœurs
        </h2>
        <p className="text-sm max-w-xs" style={{ color:'rgba(232,227,213,0.4)' }}>
          L&apos;ajout d&apos;un Wali est uniquement disponible pour les profils féminins.
        </p>
      </div>
    );
  }

  const errStyle = { color:'rgba(248,113,113,0.85)', fontSize:'11px', marginTop:'5px', display:'block' };

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div>
        <h1 className="page-title">Mon Wali</h1>
        <p className="text-sm mt-1" style={{ color:'rgba(232,227,213,0.4)' }}>
          Ajoutez les coordonnées de votre Wali pour compléter votre démarche
        </p>
      </div>

      {/* Info card */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5,ease:[0.16,1,0.3,1] }}
        className="flex gap-4 rounded-2xl p-5"
        style={{ background:'rgba(200,56,78,0.05)', border:'1px solid rgba(200,56,78,0.15)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background:'rgba(200,56,78,0.1)', border:'1px solid rgba(200,56,78,0.25)' }}>
          <Sparkles size={17} style={{ color:'#C8384E' }}/>
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1.5" style={{ color:'#E8E3D5' }}>Pourquoi un Wali ?</h3>
          <p className="text-xs leading-relaxed" style={{ color:'rgba(232,227,213,0.5)' }}>
            Conformément à la sunnah, le mariage islamique requiert la présence d&apos;un Wali (tuteur) pour la femme.
            Ses coordonnées seront transmises au frère uniquement en cas de{' '}
            <strong style={{ color:'rgba(232,227,213,0.75)' }}>match réciproque final validé par les deux parties</strong>.
            Elles sont protégées et chiffrées.
          </p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ duration:0.5,ease:[0.16,1,0.3,1],delay:0.08 }}
        className="rounded-2xl p-6"
        style={{ background:'rgba(17,22,32,0.85)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="section-title mb-5">Informations du Wali</h2>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-4">
          {/* Name */}
          <div>
            <label className="label">Nom complet</label>
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
              <input {...register('name')} className="input-field pl-9" placeholder="Mohammed Al-Farouq"/>
            </div>
            {errors.name && <span style={errStyle}>{errors.name.message}</span>}
          </div>

          {/* Relationship */}
          <div>
            <label className="label">Lien de parenté</label>
            <div className="relative">
              <Heart size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
              <select {...register('relationship')} className="input-field pl-9">
                <option value="">Sélectionner</option>
                <option value="father">Père</option>
                <option value="brother">Frère</option>
                <option value="uncle_paternal">Oncle paternel</option>
                <option value="uncle_maternal">Oncle maternel</option>
                <option value="grandfather">Grand-père paternel</option>
                <option value="other">Autre</option>
              </select>
            </div>
            {errors.relationship && <span style={errStyle}>{errors.relationship.message}</span>}
          </div>

          {/* Phone */}
          <div>
            <label className="label">Téléphone</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
              <input {...register('phone')} type="tel" className="input-field pl-9" placeholder="+33 6 XX XX XX XX"/>
            </div>
            {errors.phone && <span style={errStyle}>{errors.phone.message}</span>}
          </div>

          {/* Email */}
          <div>
            <label className="label">Adresse e-mail</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color:'rgba(232,227,213,0.25)' }}/>
              <input {...register('email')} type="email" className="input-field pl-9" placeholder="wali@mail.com"/>
            </div>
            {errors.email && <span style={errStyle}>{errors.email.message}</span>}
          </div>

          {isSubmitSuccessful && (
            <div className="p-3.5 rounded-xl text-xs"
                 style={{ background:'rgba(45,125,82,0.08)', border:'1px solid rgba(45,125,82,0.2)', color:'#2D7D52' }}>
              ✓ Un email de vérification a été envoyé à votre Wali. Il doit confirmer son accord pour compléter la démarche.
            </div>
          )}

          <button type="submit" disabled={isSubmitting || mutation.isPending} className="btn-primary w-full py-3.5 mt-1">
            {mutation.isPending ? <Loader2 size={15} className="animate-spin"/> : <Sparkles size={15}/>}
            Enregistrer le Wali
          </button>
        </form>
      </motion.div>

      {/* Privacy note */}
      <div className="flex items-center justify-center gap-2 text-center">
        <Shield size={11} style={{ color:'rgba(232,227,213,0.2)' }}/>
        <p className="text-[11px]" style={{ color:'rgba(232,227,213,0.25)' }}>
          Coordonnées chiffrées · Jamais visibles par d&apos;autres membres · Transmises uniquement en cas de match validé
        </p>
      </div>
    </div>
  );
}
