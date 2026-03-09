'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Loader2, RefreshCw, ChevronDown, Bot, User } from 'lucide-react';
import { adminApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { AiLog } from '@/types';

export default function AdminAiLogsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: logs = [], isLoading, refetch, isFetching } = useQuery<AiLog[]>({
    queryKey: ['admin-ai-logs'],
    queryFn: () => adminApi.getAiLogs().then(r => r.data),
    refetchInterval: 30_000,
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Logs IA</h1>
          <p className="text-navy-400 text-sm mt-1">{logs.length} échanges enregistrés</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary text-xs px-4 py-2.5">
          <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''}/>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={22} className="animate-spin" style={{ color:'#f87171' }}/>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => {
            const isOpen = expanded === log._id;
            return (
              <motion.div key={log._id}
                initial={{ opacity:0,y:4 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.02 }}
                className="rounded-2xl overflow-hidden"
                style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)' }}>
                <button onClick={() => setExpanded(isOpen ? null : log._id)}
                  className="w-full flex items-center gap-3 p-4 text-left transition-colors"
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background='rgba(0,0,0,0.03)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background='transparent'}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                       style={{ background:'rgba(200,56,78,0.08)', border:'1px solid rgba(200,56,78,0.15)' }}>
                    <Bot size={14} style={{ color:'#C8384E' }}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium truncate" style={{ color:'#111827' }}>
                        Phase {log.phase ?? '?'} — <span style={{ color:'#9ca3af' }}>user</span>{' '}
                        <code className="text-xs" style={{ color:'#9ca3af' }}>
                          {typeof log.userId === 'object' ? (log.userId as any)?.email ?? (log.userId as any)?._id : log.userId}
                        </code>
                      </p>
                      <span className="text-xs shrink-0" style={{ color:'#d1d5db' }}>{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-xs mt-0.5 truncate" style={{ color:'#9ca3af' }}>{log.prompt}</p>
                  </div>
                  <ChevronDown size={14} className={`shrink-0 transition-transform ${isOpen ? 'rotate-180':''}`}
                               style={{ color:'#d1d5db' }}/>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height:0,opacity:0 }} animate={{ height:'auto',opacity:1 }}
                      exit={{ height:0,opacity:0 }} transition={{ duration:0.2 }}
                      className="overflow-hidden"
                      style={{ borderTop:'1px solid rgba(0,0,0,0.07)' }}>
                      <div className="p-4 space-y-3.5"
                           style={{ background:'rgba(255,255,255,0.95)' }}>
                        <div className="flex gap-2.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                               style={{ background:'rgba(0,0,0,0.07)' }}>
                            <User size={11} style={{ color:'#9ca3af' }}/>
                          </div>
                          <div>
                            <p className="text-xs mb-1" style={{ color:'#9ca3af' }}>Message utilisateur</p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color:'#111827' }}>{log.prompt}</p>
                          </div>
                        </div>
                        <div className="flex gap-2.5">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                               style={{ background:'rgba(200,56,78,0.08)' }}>
                            <Bot size={11} style={{ color:'#C8384E' }}/>
                          </div>
                          <div>
                            <p className="text-xs mb-1" style={{ color:'#9ca3af' }}>Réponse Nisfi IA</p>
                            <p className="text-sm whitespace-pre-wrap leading-relaxed" style={{ color:'#374151' }}>{log.response}</p>
                          </div>
                        </div>
                        {(log.tokensUsed != null || log.model) && (
                          <div className="flex gap-2 pt-1">
                            {log.tokensUsed != null && (
                              <span className="badge text-[10px]" style={{ color:'#9ca3af', background:'rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.09)' }}>
                                {log.tokensUsed} tokens
                              </span>
                            )}
                            {log.model && (
                              <span className="badge text-[10px]" style={{ color:'#9ca3af', background:'rgba(0,0,0,0.05)', border:'1px solid rgba(0,0,0,0.09)' }}>
                                {log.model}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          {logs.length === 0 && (
            <div className="rounded-2xl p-12 text-center text-sm"
                 style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(0,0,0,0.08)', color:'#9ca3af' }}>
              Aucun log disponible
            </div>
          )}
        </div>
      )}
    </div>
  );
}
