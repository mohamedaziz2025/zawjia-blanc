'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  Brain, Send, Loader2, CheckCircle2, Sparkles,
} from 'lucide-react';
import { aiApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { getErrorMessage, phaseLabel } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { AiQuestionnaireResponse, ChatMessage } from '@/types';
import Link from 'next/link';

const PHASES = Array.from({ length: 8 }, (_, i) => ({
  n: i + 1,
  label: phaseLabel(i + 1),
}));

const PHASE_TO_CATEGORY: Record<number, string> = {
  1: 'religion',
  2: 'personality',
  3: 'vision',
  4: 'communication',
  5: 'lifestyle',
  6: 'family',
  7: 'finance_and_projects',
  8: 'parenting',
};

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5 max-w-sm">
      <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mb-1"
           style={{ background: 'linear-gradient(135deg, #a8243c, #C8384E)', boxShadow: '0 0 16px rgba(200,56,78,0.4)' }}>
        <Brain size={14} className="text-white"/>
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center"
           style={{ background: 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.09)' }}>
        {[0,1,2].map((i) => (
          <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
            style={{ background: '#6b7280' }}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.8, delay: i * 0.18, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.38, ease: [0.16,1,0.3,1] }}
      className={cn('flex items-end gap-2.5', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-2xl flex items-center justify-center flex-shrink-0 mb-0.5"
             style={{ background: 'linear-gradient(135deg, #a8243c, #C8384E)', boxShadow: '0 0 14px rgba(200,56,78,0.35)' }}>
          <Brain size={13} className="text-white"/>
        </div>
      )}
      <div className={cn('max-w-[78%] px-4 py-3 text-sm leading-relaxed',
        isUser
          ? 'rounded-2xl rounded-br-sm text-gray-900'
          : 'rounded-2xl rounded-bl-sm text-gray-900',
      )} style={isUser ? {
        background: 'linear-gradient(135deg, rgba(200,56,78,0.2), rgba(200,56,78,0.08))',
        border: '1px solid rgba(200,56,78,0.25)',
      } : {
        background: 'rgba(200,56,78,0.08)',
        border: '1px solid rgba(200,56,78,0.18)',
      }}>
        {msg.content.split('\n').map((line, i) => (
          <span key={i}>{line}{i < msg.content.split('\n').length - 1 && <br/>}</span>
        ))}
      </div>
    </motion.div>
  );
}

export default function AiChatPage() {
  const { user, updateUser } = useAuthStore();
  const [messages, setMessages]   = useState<ChatMessage[]>([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [phase, setPhase]         = useState(1);
  const [completed, setCompleted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  const { data: aiProfile } = useQuery({ queryKey: ['ai-profile'], queryFn: () => aiApi.getProfile().then(r => r.data) });
  const { data: aiQuestionnaire } = useQuery<AiQuestionnaireResponse>({
    queryKey: ['ai-questionnaire'],
    queryFn: () => aiApi.getQuestionnaire().then((r) => r.data),
  });

  const currentCategory = PHASE_TO_CATEGORY[phase] || 'vision';
  const suggestedQuestions = (aiQuestionnaire?.categories?.[currentCategory] || []).slice(0, 3);

  useEffect(() => {
    if (aiProfile) { setPhase(aiProfile.currentPhase ?? 1); if (user?.aiPhaseCompleted) setCompleted(true); }
  }, [aiProfile, user]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Assalamu alaikum wa rahmatullahi wa barakatuh${user?.firstName ? `, ${user.firstName}` : ''} ! 🌙\n\nJe suis Zawj IA, votre guide vers un mariage béni. Notre conversation se déroulera en ${PHASES.length} phases progressives.\n\nNous commençons par la phase 1 : **${phaseLabel(phase)}**.\n\nParlez-moi de vous — qui êtes-vous en quelques mots ?`,
        timestamp: Date.now(),
      }]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text, timestamp: Date.now() }]);
    setLoading(true);
    try {
      const res = await aiApi.chat(text);
      const { response, aiPhaseCompleted, currentPhase } = res.data;
      setMessages((prev) => [...prev, { role: 'assistant', content: response, timestamp: Date.now() }]);
      if (currentPhase) setPhase(currentPhase);
      if (aiPhaseCompleted) {
        setCompleted(true);
        updateUser({ aiPhaseCompleted: true, matchingUnlocked: true });
        toast.success('🎉 Analyse IA terminée ! Le matching est maintenant débloqué !', { duration: 5000 });
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-3">

      {/* Header */}
      <motion.div
        initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        transition={{ duration:0.45 }}
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.08)', backdropFilter: 'blur(20px)' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
             style={{ background: 'linear-gradient(135deg, #a8243c, #C8384E)', boxShadow: '0 0 20px rgba(200,56,78,0.4)' }}>
          <Brain size={19} className="text-white"/>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h1 className="font-display font-semibold text-gray-900 text-sm" style={{ letterSpacing: '-0.01em' }}>
              Zawj IA
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                   style={{ background: '#C8384E', boxShadow: '0 0 6px rgba(200,56,78,0.8)' }}/>
              <span className="text-[10px]" style={{ color: '#9ca3af' }}>En ligne</span>
            </div>
          </div>
          <p className="text-[11px] truncate" style={{ color: '#9ca3af' }}>
            {completed ? '✓ Analyse complète — Matching débloqué' : `Phase ${phase}/8 — ${phaseLabel(phase)}`}
          </p>
        </div>

        {/* Phase progress pills */}
        <div className="hidden sm:flex flex-col items-end gap-2">
          <div className="flex gap-1">
            {PHASES.map((p) => (
              <motion.div
                key={p.n}
                title={p.label}
                className="h-1.5 rounded-full"
                style={{
                  width: '18px',
                  background: completed || p.n < phase ? '#C8384E' : p.n === phase ? 'rgba(200,56,78,0.4)' : 'rgba(0,0,0,0.09)',
                  boxShadow: (completed || p.n < phase) ? '0 0 6px rgba(200,56,78,0.5)' : 'none',
                }}
                whileHover={{ scaleY: 1.5 }}
              />
            ))}
          </div>
          <p className="text-[10px]" style={{ color: '#9ca3af' }}>
            {completed ? '8/8 ✓' : `${phase}/8`}
          </p>
        </div>
      </motion.div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col overflow-hidden rounded-2xl"
           style={{ background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.07)' }}>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => <ChatBubble key={i} msg={msg}/>)}
          </AnimatePresence>
          {loading && <TypingIndicator/>}
          <div ref={bottomRef}/>
        </div>

        {/* Completion banner */}
        <AnimatePresence>
          {completed && (
            <motion.div
              initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
              className="m-3 p-4 rounded-xl flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, rgba(200,56,78,0.12), rgba(45,125,82,0.08))', border: '1px solid rgba(200,56,78,0.2)' }}
            >
              <CheckCircle2 size={18} style={{ color: '#C8384E', flexShrink: 0 }}/>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">Analyse complète !</p>
                <p className="text-xs" style={{ color: '#6b7280' }}>
                  Votre profil IA est prêt. Le matching est débloqué.
                </p>
              </div>
              <Link href="/proposals" className="btn-primary text-xs px-4 py-2 flex-shrink-0">
                Voir les propositions
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Input area */}
        {!completed && (
          <div className="p-3 flex gap-2.5 items-end"
               style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Répondez à Zawj IA… (Entrée pour envoyer)"
                rows={1}
                disabled={loading}
                className="input-field resize-none leading-relaxed"
                style={{ minHeight: '44px', maxHeight: '120px', paddingRight: '1rem' }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = 'auto';
                  t.style.height = Math.min(t.scrollHeight, 120) + 'px';
                }}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              className="btn-primary w-11 h-11 p-0 flex-shrink-0 rounded-xl"
            >
              {loading ? <Loader2 size={15} className="animate-spin"/> : <Send size={15}/>}
            </button>
          </div>
        )}

        {!completed && suggestedQuestions.length > 0 && (
          <div className="px-3 pb-3">
            <p className="text-[11px] mb-2" style={{ color: '#9ca3af' }}>
              Suggestions pour cette phase
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => setInput(question)}
                  className="badge text-[11px] transition-opacity hover:opacity-90"
                  style={{
                    background: 'rgba(200,56,78,0.08)',
                    border: '1px solid rgba(200,56,78,0.2)',
                    color: '#C8384E',
                  }}
                >
                  <Sparkles size={10}/>{question}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phase chips */}
      <div className="flex-shrink-0 flex flex-wrap gap-1.5">
        {PHASES.map((p) => (
          <div key={p.n} className="badge text-[10px] font-medium"
               style={{
                 background: completed || p.n < phase ? 'rgba(200,56,78,0.1)' : p.n === phase ? 'rgba(45,125,82,0.1)' : 'rgba(0,0,0,0.04)',
                 border: `1px solid ${completed || p.n < phase ? 'rgba(200,56,78,0.22)' : p.n === phase ? 'rgba(45,125,82,0.25)' : 'rgba(0,0,0,0.08)'}`,
                 color: completed || p.n < phase ? '#C8384E' : p.n === phase ? '#3cbe88' : '#9ca3af',
               }}>
            {(completed || p.n < phase) && <CheckCircle2 size={9}/>}
            {p.n}. {p.label}
          </div>
        ))}
      </div>
    </div>
  );
}


