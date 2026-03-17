import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `Il y a ${hours}h`;
  return formatDate(date);
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const axErr = err as any;
  return axErr?.response?.data?.message ?? 'Une erreur est survenue.';
}

export function getCompatibilityColor(score: number) {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-gold-400';
  return 'text-red-400';
}

export function getCompatibilityLabel(score: number) {
  if (score >= 80) return 'Excellente compatibilité';
  if (score >= 60) return 'Bonne compatibilité';
  if (score >= 40) return 'Compatibilité moyenne';
  return 'Faible compatibilité';
}

export function phaseLabel(phase: number) {
  const labels: Record<number, string> = {
    1: 'Présentation',
    2: 'Pratique religieuse',
    3: 'Valeurs & Éthique',
    4: 'Vision du mariage',
    5: 'Style de vie',
    6: 'Psychologie',
    7: 'Attentes & Préférences',
    8: 'Synthèse finale',
  };
  return labels[phase] ?? `Phase ${phase}`;
}

export function maritalStatusLabel(s: string) {
  const map: Record<string, string> = {
    single: 'Célibataire',
    married: 'Marié(e)',
    divorced: 'Divorcé(e)',
    widowed: 'Veuf/Veuve',
  };
  return map[s] ?? s;
}

export function religiousPracticeLabel(s: string) {
  const map: Record<string, string> = {
    little: 'Peu pratiquant(e)',
    practicing: 'Pratiquant(e)',
    very_practicing: 'Très pratiquant(e)',
  };
  return map[s] ?? s;
}
