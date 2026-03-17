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
  dateOfBirth:        z.string().min(1, 'Date de naissance requise'),
  nationality:        z.string().min(2, 'Nationalité requise'),
  origin:             z.string().min(2, 'Origine requise'),
  ethnicity:          z.enum(['arab','african','turkish','caucasian','asian','indian','latin','other'], { required_error: 'Ethnie requise' }),
  hadPreviousMarriage:z.enum(['true','false'], { required_error: 'Champ requis' }),
  childrenHas:        z.enum(['true','false'], { required_error: 'Champ requis' }),
  childrenCount:      z.coerce.number().min(0).max(20).optional(),
  religiousPractice:  z.enum(['little','practicing','very_practicing'], { required_error: 'Champ requis' }),
  prayers:            z.enum(['regular','irregular','rarely'], { required_error: 'Champ requis' }),
  religiousFollowing: z.enum(['none','self_taught','student'], { required_error: 'Champ requis' }),
  madhhab:            z.enum(['hanafi','maliki','shafii','hanbali','none'], { required_error: 'Champ requis' }),
  wantsChildren:      z.enum(['yes','no','undecided'], { required_error: 'Champ requis' }),
  willingToRelocate:  z.enum(['true','false'], { required_error: 'Champ requis' }),
  hijra:              z.enum(['already_done','possible_with_country','not_desired'], { required_error: 'Champ requis' }),
  hijraCountry:       z.string().optional(),
  femaleVeil:         z.enum(['hijab','niqab','none']).optional(),
  femaleAcceptPolygamy:z.enum(['yes','no','conditional']).optional(),
  femaleWantsToWork:  z.enum(['yes','no','flexible']).optional(),
  maleProfessionalSituation:z.enum(['student','employee','entrepreneur','other']).optional(),
  maleFinancialStability:z.enum(['stable','building']).optional(),
  malePolygamyStatus: z.enum(['no','possible','already_married']).optional(),
  criteriaAgeMin: z.coerce.number().min(18, 'Age min requis').max(99, 'Age min invalide'),
  criteriaAgeMax: z.coerce.number().min(18, 'Age max requis').max(99, 'Age max invalide'),
  criteriaMaritalStatuses: z.array(z.enum(['single','divorced','widowed','any'])).min(1, 'Champ requis'),
  criteriaAcceptWithChildren: z.enum(['yes','no','limited','conditional','any'], { required_error: 'Champ requis' }),
  criteriaChildrenLimit: z.coerce.number().min(0).max(20).optional(),
  criteriaNationalities: z.string().min(1, 'Champ requis'),
  criteriaOrigins: z.string().min(1, 'Champ requis'),
  criteriaEthnicities: z.string().optional(),
  criteriaDesiredResidence: z.enum(['same_country','europe_only','worldwide','any']).optional(),
  criteriaDesiredReligiousPractice: z.enum(['little','practicing','very_practicing','any'], { required_error: 'Champ requis' }),
  criteriaPrayersExpectation: z.enum(['regular_required','progress_accepted','any'], { required_error: 'Champ requis' }),
  criteriaMadhhabType: z.enum(['same','any','specific']).optional(),
  criteriaMadhhabSpecific: z.string().optional(),
  criteriaReligiousFollowing: z.enum(['student','self_taught','serious_self_taught','any']).optional(),
  criteriaHijraVision: z.enum(['must_hijra','open_hijra','not_desired','any']).optional(),
  criteriaHeightMin: z.coerce.number().min(120).max(230).optional(),
  criteriaHeightMax: z.coerce.number().min(120).max(230).optional(),
  criteriaBodyType: z.enum(['slim','average','strong','any']).optional(),
  criteriaFemaleHijab: z.enum(['required','niqab_only','hijab_ok','any']).optional(),
  criteriaMaleBeard: z.enum(['required','preferred','any']).optional(),
  criteriaDesiredWork: z.enum(['yes','no','flexible','any']).optional(),
  criteriaMaleProfessionalMinimum: z.enum(['student_ok','employee_min','entrepreneur','any']).optional(),
  criteriaMaleFinancialStabilityReq: z.enum(['required','building_ok','any']).optional(),
  criteriaMaleAmbition: z.enum(['very_ambitious','stable','any']).optional(),
  criteriaPolygamy: z.enum(['yes','no','conditional','future_possible','monogamy_only','any'], { required_error: 'Champ requis' }),
  criteriaAcceptAlreadyMarried: z.enum(['yes','no','any']).optional(),
  criteriaWantsChildren: z.enum(['yes','no','undecided','any']).optional(),
  criteriaDesiredChildrenCount: z.coerce.number().min(0).max(12).optional(),
  criteriaRelocation: z.enum(['required','flexible','not_required','yes','no','any'], { required_error: 'Champ requis' }),
  hasAcceptedCharter: z.literal(true, { errorMap: () => ({ message:'Vous devez accepter la charte' }) }),
}).refine(d => d.password === d.confirmPassword, { message:'Mots de passe différents', path:['confirmPassword'] })
  .superRefine((d, ctx) => {
    if (d.childrenHas === 'true' && (d.childrenCount == null || Number.isNaN(d.childrenCount))) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['childrenCount'], message: 'Nombre d\'enfants requis' });
    }
    if (d.hijra === 'possible_with_country' && !d.hijraCountry?.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['hijraCountry'], message: 'Pays de hijra requis' });
    }
    if (d.role === 'female') {
      if (!d.femaleVeil) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['femaleVeil'], message: 'Champ requis' });
      if (!d.femaleAcceptPolygamy) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['femaleAcceptPolygamy'], message: 'Champ requis' });
      if (!d.femaleWantsToWork) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['femaleWantsToWork'], message: 'Champ requis' });
      if (!d.criteriaMaleBeard) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['criteriaMaleBeard'], message: 'Champ requis' });
    }
    if (d.role === 'male') {
      if (!d.maleProfessionalSituation) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['maleProfessionalSituation'], message: 'Champ requis' });
      if (!d.maleFinancialStability) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['maleFinancialStability'], message: 'Champ requis' });
      if (!d.malePolygamyStatus) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['malePolygamyStatus'], message: 'Champ requis' });
      if (!d.criteriaFemaleHijab) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['criteriaFemaleHijab'], message: 'Champ requis' });
    }
    if (d.criteriaAgeMin > d.criteriaAgeMax) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['criteriaAgeMax'], message: 'Age max doit etre >= age min' });
    }
  });
type FormData = z.infer<typeof schema>;

const STEPS = [
  { title:'Votre profil',     sub:'Comment souhaitez-vous être accompagné(e) ?' },
  { title:'Vos identifiants', sub:'Créez vos accès sécurisés' },
  { title:'À propos de vous', sub:'Informations de base pour le matching' },
  { title:'Questionnaire',    sub:'Religion, valeurs et projet de vie' },
  { title:'Charte éthique',   sub:'Un engagement pour une démarche sérieuse' },
];

export default function RegisterPage() {
  const router          = useRouter();
  const setAuth         = useAuthStore(s => s.setAuth);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const [step, setStep]   = useState(0);
  const [questionnaireStep, setQuestionnaireStep] = useState(0);
  const [show, setShow]   = useState(false);
  const [show2, setShow2] = useState(false);
  const [countrySuggestions, setCountrySuggestions] = useState<Array<{ name: string; code: string }>>([]);
  const [citySuggestions, setCitySuggestions] = useState<Array<{ name: string; country: string; admin1?: string }>>([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<Array<{ name: string; code: string }>>([]);
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState('');
  const [countriesRef, setCountriesRef] = useState<Array<{ name: string; code: string }>>([]);

  useEffect(() => {
    if (isAuthenticated()) router.replace('/dashboard');
  }, [isAuthenticated, router]);

  const { register, handleSubmit, watch, trigger, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      criteriaMaritalStatuses: [],
    },
  });

  const selectedRole = watch('role');
  const childrenHas = watch('childrenHas');
  const hijra = watch('hijra');
  const countryValue = watch('country') || '';
  const cityValue = watch('city') || '';
  const originValue = watch('origin') || '';
  const criteriaMaritalStatuses = watch('criteriaMaritalStatuses') || [];

  const countryField = register('country');
  const cityField = register('city');
  const originField = register('origin');

  useEffect(() => {
    let mounted = true;
    fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted || !Array.isArray(data)) return;
        const normalized = data
          .map((c: { name?: { common?: string }; cca2?: string }) => ({
            name: c?.name?.common || '',
            code: c?.cca2 || '',
          }))
          .filter((c: { name: string; code: string }) => c.name && c.code)
          .sort((a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, 'fr'));
        setCountriesRef(normalized);
      })
      .catch(() => {
        setCountriesRef([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if ((countryValue || '').trim().length < 2) {
      setCountrySuggestions([]);
      setShowCountrySuggestions(false);
      return;
    }

    const q = countryValue.trim().toLowerCase();
    const next = countriesRef.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
    setCountrySuggestions(next);
    setShowCountrySuggestions(next.length > 0);

    const exact = countriesRef.find((c) => c.name.toLowerCase() === q);
    setSelectedCountryCode(exact?.code || '');
  }, [countryValue, countriesRef]);

  useEffect(() => {
    if ((originValue || '').trim().length < 2) {
      setOriginSuggestions([]);
      setShowOriginSuggestions(false);
      return;
    }

    const q = originValue.trim().toLowerCase();
    const next = countriesRef.filter((c) => c.name.toLowerCase().includes(q)).slice(0, 8);
    setOriginSuggestions(next);
    setShowOriginSuggestions(next.length > 0);
  }, [originValue, countriesRef]);

  useEffect(() => {
    if ((cityValue || '').trim().length < 2) {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          name: cityValue.trim(),
          count: '8',
          language: 'fr',
          format: 'json',
        });
        if (selectedCountryCode) params.set('countryCode', selectedCountryCode);

        const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        const rows = Array.isArray(data?.results)
          ? data.results.map((r: { name?: string; country?: string; admin1?: string }) => ({
              name: r.name || '',
              country: r.country || '',
              admin1: r.admin1 || '',
            }))
          : [];

        setCitySuggestions(rows.filter((r: { name: string }) => r.name).slice(0, 8));
        setShowCitySuggestions(rows.length > 0);
      } catch {
        if (!controller.signal.aborted) {
          setCitySuggestions([]);
          setShowCitySuggestions(false);
        }
      }
    }, 280);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [cityValue, selectedCountryCode]);

  const QUESTIONNAIRE_STEPS = [
    'Identité',
    'Religion',
    'Situation familiale',
    'Hijra',
    'Profil spécifique',
    'Critères essentiels',
    'Critères avancés',
    'Validation',
  ];

  const nextStep = async () => {
    if (step === 3) {
      const questionnaireFieldsMap: Array<Array<keyof FormData>> = [
        ['dateOfBirth','nationality','origin','ethnicity'],
        ['religiousPractice','prayers','religiousFollowing','madhhab'],
        ['wantsChildren','willingToRelocate','hadPreviousMarriage','childrenHas','childrenCount'],
        ['hijra','hijraCountry'],
        ['femaleVeil','femaleAcceptPolygamy','femaleWantsToWork','maleProfessionalSituation','maleFinancialStability','malePolygamyStatus'],
        ['criteriaAgeMin','criteriaAgeMax','criteriaMaritalStatuses','criteriaAcceptWithChildren','criteriaNationalities','criteriaOrigins'],
        ['criteriaDesiredReligiousPractice','criteriaPrayersExpectation','criteriaPolygamy','criteriaRelocation','criteriaFemaleHijab','criteriaMaleBeard'],
        [],
      ];
      const ok = await trigger(questionnaireFieldsMap[questionnaireStep]);
      if (!ok) return;
      if (questionnaireStep < QUESTIONNAIRE_STEPS.length - 1) {
        setQuestionnaireStep((s) => s + 1);
        return;
      }
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      return;
    }

    const fieldsMap: Array<Array<keyof FormData>> = [
      ['role'],
      ['email','password','confirmPassword'],
      ['firstName','age','country','city','maritalStatus'],
      [],
      ['hasAcceptedCharter'],
    ];
    const ok = await trigger(fieldsMap[step]);
    if (ok) setStep(s => Math.min(s+1, STEPS.length-1));
  };

  const prevStep = () => {
    if (step === 3 && questionnaireStep > 0) {
      setQuestionnaireStep((s) => s - 1);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const onSubmit = async (data: FormData) => {
    try {
      const res = await authApi.register({
        email:data.email, password:data.password, role:data.role,
        firstName:data.firstName, age:data.age, country:data.country,
        city:data.city, maritalStatus:data.maritalStatus,
        dateOfBirth: data.dateOfBirth || undefined,
        nationality: data.nationality || undefined,
        origin: data.origin || undefined,
        ethnicity: data.ethnicity,
        hadPreviousMarriage: data.hadPreviousMarriage === undefined ? undefined : data.hadPreviousMarriage === 'true',
        children: data.childrenHas === undefined ? undefined : {
          has: data.childrenHas === 'true',
          count: data.childrenHas === 'true' ? Number(data.childrenCount || 0) : 0,
        },
        religiousPractice: data.religiousPractice,
        prayers: data.prayers,
        religiousFollowing: data.religiousFollowing,
        madhhab: data.madhhab,
        wantsChildren: data.wantsChildren,
        willingToRelocate: data.willingToRelocate === undefined ? undefined : data.willingToRelocate === 'true',
        hijra: data.hijra,
        hijraCountry: data.hijraCountry || undefined,
        femaleProfile: data.role === 'female' ? {
          veil: data.femaleVeil,
          acceptPolygamy: data.femaleAcceptPolygamy,
          wantsToWork: data.femaleWantsToWork,
        } : undefined,
        maleProfile: data.role === 'male' ? {
          professionalSituation: data.maleProfessionalSituation,
          financialStability: data.maleFinancialStability,
          polygamyStatus: data.malePolygamyStatus,
        } : undefined,
        searchCriteria: {
          ageMin: data.criteriaAgeMin,
          ageMax: data.criteriaAgeMax,
          acceptedMaritalStatuses: data.criteriaMaritalStatuses,
          acceptWithChildren: data.criteriaAcceptWithChildren,
          childrenLimit: data.criteriaChildrenLimit,
          preferredNationalities: data.criteriaNationalities
            ? data.criteriaNationalities.split(',').map((v) => v.trim()).filter(Boolean)
            : undefined,
          preferredOrigins: data.criteriaOrigins
            ? data.criteriaOrigins.split(',').map((v) => v.trim()).filter(Boolean)
            : undefined,
          preferredEthnicities: data.criteriaEthnicities
            ? data.criteriaEthnicities.split(',').map((v) => v.trim()).filter(Boolean)
            : undefined,
          desiredResidence: data.criteriaDesiredResidence,
          desiredReligiousPractice: data.criteriaDesiredReligiousPractice,
          prayersExpectation: data.criteriaPrayersExpectation,
          madhhabPreferenceType: data.criteriaMadhhabType,
          madhhabSpecific: data.criteriaMadhhabSpecific,
          desiredReligiousFollowing: data.criteriaReligiousFollowing,
          hijraVision: data.criteriaHijraVision,
          heightMin: data.criteriaHeightMin,
          heightMax: data.criteriaHeightMax,
          preferredBodyType: data.criteriaBodyType,
          femaleHijabPreference: data.criteriaFemaleHijab,
          maleBeardPreference: data.criteriaMaleBeard,
          desiredWorkPreference: data.criteriaDesiredWork,
          maleProfessionalMinimum: data.criteriaMaleProfessionalMinimum,
          maleFinancialStabilityRequirement: data.criteriaMaleFinancialStabilityReq,
          maleAmbition: data.criteriaMaleAmbition,
          polygamyPreference: data.criteriaPolygamy,
          acceptAlreadyMarried: data.criteriaAcceptAlreadyMarried,
          wantsChildrenPreference: data.criteriaWantsChildren,
          desiredChildrenCount: data.criteriaDesiredChildrenCount,
          relocationRequirement: data.criteriaRelocation,
        },
        hasAcceptedCharter:true,
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
  const cardBase = { borderRadius:'16px', border:'1px solid rgba(0,0,0,0.08)', background:'rgba(0,0,0,0.04)', padding:'16px 20px' };
  const maritalStatusOptions = [
    { value: 'single', label: 'Célibataire' },
    { value: 'divorced', label: 'Divorcé(e)' },
    { value: 'widowed', label: 'Veuf / Veuve' },
    { value: 'any', label: 'Peu importe' },
  ] as const;

  const toggleCriteriaMaritalStatus = (value: (typeof maritalStatusOptions)[number]['value']) => {
    const current = criteriaMaritalStatuses;
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    setValue('criteriaMaritalStatuses', next, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}>
      {/* Header */}
      <div className="mb-7">
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-8 }}
            transition={{ duration:0.28 }}>
            <h1 className="font-display font-bold" style={{ fontSize:'1.75rem', letterSpacing:'-0.03em', color:'#111827' }}>
              {STEPS[step].title}
            </h1>
            <p className="text-sm mt-1" style={{ color:'#6b7280' }}>
              {STEPS[step].sub}
              {step === 3 ? ` · ${questionnaireStep + 1}/${QUESTIONNAIRE_STEPS.length}` : ''}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step dots */}
      <div className="flex gap-2 mb-7">
        {STEPS.map((_,i) => (
          <div key={i} className="flex-1 h-0.5 rounded-full transition-all duration-500"
               style={{ background: i <= step ? '#C8384E' : 'rgba(0,0,0,0.09)' }}/>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <AnimatePresence mode="wait">
          {/* Step 0: Gender */}
          {step === 0 && (
            <motion.div key="s0" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}
              transition={{ duration:0.3 }} className="space-y-3">
              <div className="text-center rounded-2xl p-4 mb-5" style={{ background:'rgba(200,56,78,0.06)', border:'1px solid rgba(200,56,78,0.18)' }}>
                <p className="font-arabic text-lg" style={{ color:'#C8384E' }}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
                <h2 className="font-display font-bold mt-2" style={{ color:'#111827', fontSize:'1.2rem', letterSpacing:'-0.03em' }}>
                  Votre chemin vers<br/>un mariage béni
                </h2>
                <p className="text-xs mt-2" style={{ color:'#6b7280' }}>
                  Zawjia allie valeurs islamiques et intelligence artificielle pour vous accompagner dans une démarche sérieuse et pudique.
                </p>
                <ul className="mt-3 text-xs space-y-1" style={{ color:'#4b5563' }}>
                  <li>Analyse IA sur 8 phases approfondies</li>
                  <li>Matching basé sur la compatibilité réelle</li>
                  <li>Système Wali intégré et sécurisé</li>
                  <li>Confidentialité et pudeur garanties</li>
                </ul>
              </div>
              {([
                { v:'male',   emoji:'👳', title:'Frère (Homme)',  sub:"Recherche d'une épouse" },
                { v:'female', emoji:'🧕', title:'Sœur (Femme)',   sub:"Recherche d'un époux" },
              ] as const).map(({ v, emoji, title, sub }) => {
                const active = selectedRole === v;
                return (
                  <button key={v} type="button" onClick={() => setValue('role', v)}
                    className="w-full text-left flex items-center gap-4 rounded-2xl p-5 transition-all duration-300"
                    style={{
                      border: active ? '1.5px solid #C8384E' : '1px solid rgba(0,0,0,0.09)',
                      background: active ? 'rgba(200,56,78,0.08)' : 'rgba(0,0,0,0.03)',
                      boxShadow: active ? '0 0 20px rgba(200,56,78,0.15)' : 'none',
                    }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                         style={{ background:'rgba(0,0,0,0.07)' }}>{emoji}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm" style={{ color:'#111827' }}>{title}</p>
                      <p className="text-xs mt-0.5" style={{ color:'#9ca3af' }}>{sub}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                         style={{ border:`2px solid ${active ? '#C8384E' : 'rgba(0,0,0,0.15)'}`, background: active ? '#C8384E' : 'transparent' }}>
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
                    style={{ color:'#9ca3af' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#374151'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#9ca3af'}>
                    {show ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                {errors.password && <span style={errStyle}>{errors.password.message}</span>}
                <p className="text-[11px] mt-1.5" style={{ color:'#9ca3af' }}>8+ caractères, 1 majuscule, 1 chiffre</p>
              </div>
              <div>
                <label className="label">Confirmer le mot de passe</label>
                <div className="relative">
                  <input {...register('confirmPassword')} type={show2 ? 'text':'password'} placeholder="••••••••" className="input-field pr-12" autoComplete="new-password"/>
                  <button type="button" onClick={() => setShow2(!show2)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color:'#9ca3af' }}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#374151'}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='#9ca3af'}>
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
                  <div className="relative">
                    <input
                      {...countryField}
                      value={countryValue}
                      onChange={(e) => {
                        countryField.onChange(e);
                        setValue('country', e.target.value, { shouldValidate: true, shouldDirty: true });
                        setShowCountrySuggestions(e.target.value.trim().length >= 2);
                      }}
                      onFocus={() => {
                        if ((countryValue || '').trim().length >= 2 && countrySuggestions.length > 0) {
                          setShowCountrySuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowCountrySuggestions(false), 120);
                      }}
                      placeholder="France"
                      className="input-field"
                      autoComplete="off"
                    />
                    {showCountrySuggestions && countrySuggestions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border max-h-52 overflow-auto"
                           style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.12)' }}>
                        {countrySuggestions.map((item) => (
                          <button
                            key={`${item.code}-${item.name}`}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm"
                            style={{ color: '#111827' }}
                            onMouseDown={() => {
                              setValue('country', item.name, { shouldValidate: true, shouldDirty: true });
                              setSelectedCountryCode(item.code);
                              setShowCountrySuggestions(false);
                              setValue('city', '', { shouldValidate: true, shouldDirty: true });
                              setCitySuggestions([]);
                            }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color:'#9ca3af' }}>Tapez 2 lettres pour voir les suggestions</p>
                  {errors.country && <span style={errStyle}>{errors.country.message}</span>}
                </div>
                <div>
                  <label className="label">Ville</label>
                  <div className="relative">
                    <input
                      {...cityField}
                      value={cityValue}
                      onChange={(e) => {
                        cityField.onChange(e);
                        setValue('city', e.target.value, { shouldValidate: true, shouldDirty: true });
                        setShowCitySuggestions(e.target.value.trim().length >= 2);
                      }}
                      onFocus={() => {
                        if ((cityValue || '').trim().length >= 2 && citySuggestions.length > 0) {
                          setShowCitySuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowCitySuggestions(false), 120);
                      }}
                      placeholder="Paris"
                      className="input-field"
                      autoComplete="off"
                    />
                    {showCitySuggestions && citySuggestions.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full rounded-xl border max-h-52 overflow-auto"
                           style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.12)' }}>
                        {citySuggestions.map((item, idx) => (
                          <button
                            key={`${item.name}-${item.country}-${idx}`}
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm"
                            style={{ color: '#111827' }}
                            onMouseDown={() => {
                              setValue('city', item.name, { shouldValidate: true, shouldDirty: true });
                              if (!selectedCountryCode && item.country) {
                                const found = countriesRef.find((c) => c.name.toLowerCase() === item.country.toLowerCase());
                                if (found) {
                                  setValue('country', found.name, { shouldValidate: true, shouldDirty: true });
                                  setSelectedCountryCode(found.code);
                                }
                              }
                              setShowCitySuggestions(false);
                            }}
                          >
                            {item.name}
                            <span style={{ color: '#6b7280' }}>
                              {item.admin1 ? `, ${item.admin1}` : ''}{item.country ? `, ${item.country}` : ''}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] mt-1.5" style={{ color:'#9ca3af' }}>Tapez 2 lettres pour voir les suggestions</p>
                  {errors.city && <span style={errStyle}>{errors.city.message}</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Charter */}
          {step === 3 && (
            <motion.div key="s3" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}
              transition={{ duration:0.3 }} className="space-y-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  {QUESTIONNAIRE_STEPS.map((label, i) => (
                    <div key={label} className="flex-1">
                      <div className="h-1.5 rounded-full" style={{ background: i <= questionnaireStep ? '#C8384E' : 'rgba(0,0,0,0.1)' }}/>
                      <p className="text-[10px] mt-1" style={{ color: i === questionnaireStep ? '#C8384E' : '#9ca3af' }}>{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {questionnaireStep === 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Date de naissance</label>
                      <input {...register('dateOfBirth')} type="date" className="input-field"/>
                      {errors.dateOfBirth && <span style={errStyle}>{errors.dateOfBirth.message}</span>}
                    </div>
                    <div>
                      <label className="label">Nationalité</label>
                      <input {...register('nationality')} placeholder="Française" className="input-field"/>
                      {errors.nationality && <span style={errStyle}>{errors.nationality.message}</span>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Origine</label>
                      <div className="relative">
                        <input
                          {...originField}
                          value={originValue}
                          onChange={(e) => {
                            originField.onChange(e);
                            setValue('origin', e.target.value, { shouldValidate: true, shouldDirty: true });
                            setShowOriginSuggestions(e.target.value.trim().length >= 2);
                          }}
                          onFocus={() => {
                            if ((originValue || '').trim().length >= 2 && originSuggestions.length > 0) {
                              setShowOriginSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowOriginSuggestions(false), 120);
                          }}
                          placeholder="Maghreb, Afrique de l'Ouest..."
                          className="input-field"
                          autoComplete="off"
                        />
                        {showOriginSuggestions && originSuggestions.length > 0 && (
                          <div className="absolute z-20 mt-1 w-full rounded-xl border max-h-52 overflow-auto"
                               style={{ background: '#fff', borderColor: 'rgba(0,0,0,0.12)' }}>
                            {originSuggestions.map((item) => (
                              <button
                                key={`${item.code}-${item.name}`}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm"
                                style={{ color: '#111827' }}
                                onMouseDown={() => {
                                  setValue('origin', item.name, { shouldValidate: true, shouldDirty: true });
                                  setShowOriginSuggestions(false);
                                }}
                              >
                                {item.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] mt-1.5" style={{ color:'#9ca3af' }}>Tapez 2 lettres pour voir les suggestions</p>
                      {errors.origin && <span style={errStyle}>{errors.origin.message}</span>}
                    </div>
                    <div>
                      <label className="label">Ethnie</label>
                      <select {...register('ethnicity')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="arab">Arabe</option>
                        <option value="african">Africaine</option>
                        <option value="turkish">Turque</option>
                        <option value="caucasian">Caucasienne</option>
                        <option value="asian">Asiatique</option>
                        <option value="indian">Indienne</option>
                        <option value="latin">Latine</option>
                        <option value="other">Autre</option>
                      </select>
                      {errors.ethnicity && <span style={errStyle}>{errors.ethnicity.message}</span>}
                    </div>
                  </div>
                </>
              )}

              {questionnaireStep === 1 && (
                <>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Niveau de pratique</label>
                  <select {...register('religiousPractice')} className="input-field">
                    <option value="">Choisir</option>
                    <option value="little">Peu pratiquant(e)</option>
                    <option value="practicing">Pratiquant(e)</option>
                    <option value="very_practicing">Très pratiquant(e)</option>
                  </select>
                  {errors.religiousPractice && <span style={errStyle}>{errors.religiousPractice.message}</span>}
                </div>
                <div>
                  <label className="label">Prières</label>
                  <select {...register('prayers')} className="input-field">
                    <option value="">Choisir</option>
                    <option value="regular">Régulières</option>
                    <option value="irregular">Irrégulières</option>
                    <option value="rarely">Rarement</option>
                  </select>
                  {errors.prayers && <span style={errStyle}>{errors.prayers.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Suivi religieux</label>
                  <select {...register('religiousFollowing')} className="input-field">
                    <option value="">Choisir</option>
                    <option value="none">Aucun</option>
                    <option value="self_taught">Autodidacte</option>
                    <option value="student">Étudiant(e)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Madhhab</label>
                  <select {...register('madhhab')} className="input-field">
                    <option value="">Choisir</option>
                    <option value="hanafi">Hanafi</option>
                    <option value="maliki">Maliki</option>
                    <option value="shafii">Shafi'i</option>
                    <option value="hanbali">Hanbali</option>
                    <option value="none">Aucun</option>
                  </select>
                </div>
              </div>

                </>
              )}

              {questionnaireStep === 2 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Souhaite des enfants</label>
                      <select {...register('wantsChildren')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="yes">Oui</option>
                        <option value="no">Non</option>
                        <option value="undecided">Indécis(e)</option>
                      </select>
                      {errors.wantsChildren && <span style={errStyle}>{errors.wantsChildren.message}</span>}
                    </div>
                    <div>
                      <label className="label">Prêt(e) à déménager</label>
                      <select {...register('willingToRelocate')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Déjà été marié(e)</label>
                      <select {...register('hadPreviousMarriage')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">A des enfants</label>
                      <select {...register('childrenHas')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="true">Oui</option>
                        <option value="false">Non</option>
                      </select>
                    </div>
                  </div>

                  {childrenHas === 'true' && (
                    <div>
                      <label className="label">Nombre d'enfants</label>
                      <input {...register('childrenCount')} type="number" min={0} className="input-field" placeholder="1"/>
                    </div>
                  )}
                </>
              )}

              {questionnaireStep === 3 && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Hijra</label>
                    <select {...register('hijra')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="already_done">Déjà faite</option>
                      <option value="possible_with_country">Envisageable</option>
                      <option value="not_desired">Non souhaitée</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Pays hijra (si envisagée)</label>
                    <input {...register('hijraCountry')} disabled={hijra !== 'possible_with_country'} placeholder="Maroc, Qatar..." className="input-field disabled:opacity-60"/>
                  </div>
                </div>
              )}

              {questionnaireStep === 4 && selectedRole === 'female' && (
                <div style={cardBase} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:'#C8384E' }}>Profil spécifique sœur</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">Voile</label>
                      <select {...register('femaleVeil')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="hijab">Hijab</option>
                        <option value="niqab">Niqab</option>
                        <option value="none">Aucun</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Polygamie</label>
                      <select {...register('femaleAcceptPolygamy')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="yes">Oui</option>
                        <option value="no">Non</option>
                        <option value="conditional">Sous conditions</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Souhaite travailler</label>
                      <select {...register('femaleWantsToWork')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="yes">Oui</option>
                        <option value="no">Non</option>
                        <option value="flexible">Au choix</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {questionnaireStep === 4 && selectedRole === 'male' && (
                <div style={cardBase} className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:'#C8384E' }}>Profil spécifique frère</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label">Situation pro</label>
                      <select {...register('maleProfessionalSituation')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="student">Étudiant</option>
                        <option value="employee">Salarié</option>
                        <option value="entrepreneur">Entrepreneur</option>
                        <option value="other">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Stabilité financière</label>
                      <select {...register('maleFinancialStability')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="stable">Oui</option>
                        <option value="building">En construction</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Polygamie</label>
                      <select {...register('malePolygamyStatus')} className="input-field">
                        <option value="">Choisir</option>
                        <option value="no">Non</option>
                        <option value="possible">Possible</option>
                        <option value="already_married">Déjà marié</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {questionnaireStep === 5 && (
              <div style={cardBase} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:'#C8384E' }}>
                  {selectedRole === 'male' ? 'Ce que le frère recherche' : 'Ce que la sœur recherche'}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Âge min recherché</label>
                    <input {...register('criteriaAgeMin')} type="number" min={18} max={99} className="input-field" placeholder="20"/>
                  </div>
                  <div>
                    <label className="label">Âge max recherché</label>
                    <input {...register('criteriaAgeMax')} type="number" min={18} max={99} className="input-field" placeholder="35"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Statuts matrimoniaux acceptés</label>
                    <div className="rounded-xl border p-3 space-y-2" style={{ borderColor: 'rgba(0,0,0,0.12)', background: '#fff' }}>
                      {maritalStatusOptions.map((option) => (
                        <label key={option.value} className="flex items-center gap-2 text-sm" style={{ color: '#111827' }}>
                          <input
                            type="checkbox"
                            checked={criteriaMaritalStatuses.includes(option.value)}
                            onChange={() => toggleCriteriaMaritalStatus(option.value)}
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    {errors.criteriaMaritalStatuses && <span style={errStyle}>{errors.criteriaMaritalStatuses.message}</span>}
                  </div>
                  <div>
                    <label className="label">Avec enfants</label>
                    <select {...register('criteriaAcceptWithChildren')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                      <option value="limited">Oui, limite</option>
                      <option value="conditional">Oui, sous conditions</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Nationalités (séparées par virgule)</label>
                    <input {...register('criteriaNationalities')} className="input-field" placeholder="Marocaine, Française"/>
                  </div>
                  <div>
                    <label className="label">Origines (séparées par virgule)</label>
                    <input {...register('criteriaOrigins')} className="input-field" placeholder="Maghreb, Afrique de l'Ouest"/>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Niveau religieux recherché</label>
                    <select {...register('criteriaDesiredReligiousPractice')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="little">Peu pratiquant(e)</option>
                      <option value="practicing">Pratiquant(e)</option>
                      <option value="very_practicing">Très pratiquant(e)</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Prières</label>
                    <select {...register('criteriaPrayersExpectation')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="regular_required">Régulières obligatoires</option>
                      <option value="progress_accepted">Progression acceptée</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>
                </div>

              </div>
              )}

              {questionnaireStep === 6 && (
              <div style={cardBase} className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color:'#C8384E' }}>
                  {selectedRole === 'male' ? 'Préférences avancées du frère' : 'Préférences avancées de la sœur'}
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Polygamie</label>
                    <select {...register('criteriaPolygamy')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                      <option value="conditional">Sous conditions</option>
                      <option value="future_possible">Possible dans le futur</option>
                      <option value="monogamy_only">Monogamie uniquement</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Prêt(e) à déménager</label>
                    <select {...register('criteriaRelocation')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="required">Oui obligatoire</option>
                      <option value="flexible">Flexible</option>
                      <option value="not_required">Non obligatoire</option>
                      <option value="yes">Oui</option>
                      <option value="no">Non</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>
                </div>

                {selectedRole === 'male' ? (
                  <div>
                    <label className="label">Port du hijab</label>
                    <select {...register('criteriaFemaleHijab')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="required">Obligatoire</option>
                      <option value="niqab_only">Niqab uniquement</option>
                      <option value="hijab_ok">Hijab suffisant</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>
                ) : (
                  <div>
                    <label className="label">Barbe</label>
                    <select {...register('criteriaMaleBeard')} className="input-field">
                      <option value="">Choisir</option>
                      <option value="required">Oui obligatoire</option>
                      <option value="preferred">Souhaitée</option>
                      <option value="any">Peu importe</option>
                    </select>
                  </div>
                )}
              </div>
              )}

              {questionnaireStep === 7 && (
                <div style={cardBase} className="space-y-3">
                  <p className="text-sm font-semibold" style={{ color:'#111827' }}>Vérification rapide</p>
                  <p className="text-xs" style={{ color:'#6b7280' }}>
                    Vos réponses questionnaire sont enregistrées en plusieurs étapes pour faciliter l'inscription.
                    Cliquez sur Continuer pour passer à la charte éthique.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Charter */}
          {step === 4 && (
            <motion.div key="s4" initial={{ opacity:0,x:30 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-30 }}
              transition={{ duration:0.3 }} className="space-y-4">
              <div className="rounded-2xl p-4 text-sm leading-relaxed space-y-2.5 max-h-44 overflow-y-auto"
                   style={{ background:'rgba(0,0,0,0.04)', border:'1px solid rgba(0,0,0,0.08)' }}>
                <p className="font-semibold text-[11px] tracking-widest uppercase" style={{ color:'#C8384E' }}>
                  Charte Éthique Islamique Zawjia
                </p>
                <p style={{ color:'#4b5563' }}>En vous inscrivant, vous vous engagez à :</p>
                <ul className="space-y-1.5" style={{ color:'#6b7280' }}>
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
                       style={{ border:'1.5px solid rgba(0,0,0,0.15)' }}>
                    <svg className="hidden peer-checked:block w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                </div>
                <p className="text-sm leading-relaxed transition-colors"
                   style={{ color:'#6b7280' }}>
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
            <button type="button" onClick={prevStep} className="btn-secondary flex-1">
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
        <p className="text-sm" style={{ color:'#9ca3af' }}>
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
