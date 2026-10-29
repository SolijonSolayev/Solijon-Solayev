import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bot,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  User,
  X,
  Zap,
} from 'lucide-react';
import { ProfileData } from '../types/profile';
import { formatUzbekText, UzbekAlphabetMode } from '../utils/uzbekAlphabet';

export type ChatbotRoleId = 'portfolio_guide' | 'tech_advisor' | 'astronomy_linguistics';
export type ChatbotModelMode = 'general' | 'fast' | 'complex';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  modelUsed?: string;
}

interface PortfolioChatbotProps {
  profile: ProfileData;
  alphabetMode: UzbekAlphabetMode;
  onAlphabetModeChange?: (mode: UzbekAlphabetMode) => void;
  isOpenExternal?: boolean;
  onOpenChangeExternal?: (open: boolean) => void;
}

const ROLE_OPTIONS: Array<{
  id: ChatbotRoleId;
  label: string;
  description: string;
  welcome: string;
  starters: string[];
}> = [
  {
    id: 'portfolio_guide',
    label: 'Vizitka Yordamchisi',
    description: "Solijon Solayevning loyihalari, faoliyati va bog'lanish tartibi bo'yicha yordamchi",
    welcome:
      "Assalomu alaykum! Men Solijon Solayevning virtual yordamchisiman. Solaris 3D (solaris3d.uz), Tilimlo.uz, GitHub'dagi dasturlar yoki bog'lanish tartibi haqida savolingiz bo'lsa, bemalol so'rang.",
    starters: [
      'Solaris 3D (solaris3d.uz) qanday loyiha?',
      'Tilimlo.uz sayti nima haqida?',
      "Solijonning GitHub'dagi dasturlari haqida aytib ber",
      "Solijon bilan qanday bog'lanish mumkin?",
    ],
  },
  {
    id: 'tech_advisor',
    label: 'IT & Kod Maslahatchi',
    description: "Frontend (HTML/CSS/React), Python va tizim dasturlari bo'yicha maslahatchi",
    welcome:
      "Salom! Men veb-dasturlash (HTML, CSS, Tailwind, React), Python'da foydali vositalar (masalan, usb-formatter) va Windows skriptlari bo'yicha savollaringizga javob beraman.",
    starters: [
      "Frontend dasturlashni o'rganishni nimadan boshlash kerak?",
      'usb-formatter va AqlliTozalash qanday ishlaydi?',
      'React va Tailwind CSS afzalliklari nimada?',
    ],
  },
  {
    id: 'astronomy_linguistics',
    label: 'Koinot & Imlo (Solaris / Tilimlo)',
    description: "Solaris 3D astronomiyasi va Tilimlo.uz o'zbek tili imlosi bo'yicha suhbatdosh",
    welcome:
      "Xush kelibsiz! Bu rejimda Solijonning Solaris 3D (solaris3d.uz) va Tilimlo.uz loyihalariga uyg'un ravishda Quyosh tizimi astronomiyasi yoki o'zbek tili imlo qoidalari haqida suhbatlashamiz.",
    starters: [
      'Quyosh tizimidagi sayyoralar ketma-ketligini tushuntirib ber',
      "Yangilangan o'zbek alifbosida (Ö, Ğ, Ş, Ç) qanday o'zgarishlar bor?",
      "O'zbekcha Vikipediyaga qanday hissa qo'shish mumkin?",
    ],
  },
];

const MODEL_OPTIONS: Array<{
  id: ChatbotModelMode;
  label: string;
  badge: string;
}> = [
  {
    id: 'general',
    label: 'Standart',
    badge: 'gemini-3.8-flash',
  },
  {
    id: 'fast',
    label: 'Tezkor',
    badge: 'gemini-3.1-flash-lite',
  },
  {
    id: 'complex',
    label: 'Chuqur tahlil',
    badge: 'gemini-4-argon',
  },
];

export const PortfolioChatbot: React.FC<PortfolioChatbotProps> = ({
  profile,
  alphabetMode,
  onAlphabetModeChange,
  isOpenExternal,
  onOpenChangeExternal,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isOpenExternal !== undefined ? isOpenExternal : internalOpen;

  const tr = (text: string) => formatUzbekText(text, alphabetMode);

  const setOpen = (next: boolean) => {
    setInternalOpen(next);
    if (onOpenChangeExternal) {
      onOpenChangeExternal(next);
    }
  };

  const [roleId, setRoleId] = useState<ChatbotRoleId>('portfolio_guide');
  const [modelMode, setModelMode] = useState<ChatbotModelMode>('general');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const activeRole = useMemo(
    () => ROLE_OPTIONS.find((r) => r.id === roleId) || ROLE_OPTIONS[0],
    [roleId]
  );

  const [histories, setHistories] = useState<Record<ChatbotRoleId, ChatMessage[]>>(() => ({
    portfolio_guide: [
      {
        id: 'init-portfolio',
        role: 'model',
        text: ROLE_OPTIONS[0].welcome,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    tech_advisor: [
      {
        id: 'init-tech',
        role: 'model',
        text: ROLE_OPTIONS[1].welcome,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    astronomy_linguistics: [
      {
        id: 'init-astro',
        role: 'model',
        text: ROLE_OPTIONS[2].welcome,
        timestamp: new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  }));

  const currentMessages = histories[roleId] || [];
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [currentMessages, isLoading, isOpen, roleId, alphabetMode]);

  const profileSummary = useMemo(() => {
    const projectLines = profile.projects
      .map((p) => `- ${p.title} (${p.category}): ${p.summary} [Havola: ${p.liveUrl}]`)
      .join('\n');
    return `Ism: ${profile.personal.fullName}\nYo'nalish: ${profile.personal.role}\nBio: ${profile.personal.shortBio}\nLoyihalar:\n${projectLines}`;
  }, [profile]);

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const nowTime = new Date().toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: nowTime,
    };

    const updatedThread = [...currentMessages, userMsg];
    setHistories((prev) => ({
      ...prev,
      [roleId]: updatedThread,
    }));
    setInput('');
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId,
          modelMode,
          alphabetMode,
          profileSummary,
          messages: updatedThread.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || tr("Xatolik yuz berdi. Qayta urinib ko'ring."));
      }

      const replyMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString('uz-UZ', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        modelUsed: data.model,
      };

      setHistories((prev) => ({
        ...prev,
        [roleId]: [...(prev[roleId] || []), replyMsg],
      }));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : tr("Tarmoq xatosi yuz berdi. Qayta urinib ko'ring.");
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const handleResetConversation = () => {
    setErrorMsg(null);
    setHistories((prev) => ({
      ...prev,
      [roleId]: [
        {
          id: `reset-${Date.now()}`,
          role: 'model',
          text: activeRole.welcome,
          timestamp: new Date().toLocaleTimeString('uz-UZ', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    }));
  };

  return (
    <>
      {/* Floating Launcher Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40"
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setOpen(true)}
              title={tr("AI Yordamchi · Savol so'rang")}
              aria-label={tr('Virtual yordamchi chatini ochish')}
              className="group flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-3.5 rounded-full bg-[#0F0F12]/80 hover:bg-[#0F0F12]/95 backdrop-blur-md border border-zinc-800/90 hover:border-blue-500/50 text-zinc-300 hover:text-white shadow-lg transition-all cursor-pointer opacity-80 hover:opacity-100"
            >
              <MessageSquare className="w-4 h-4 text-blue-400 group-hover:text-blue-300 transition-colors shrink-0" />
              <span className="hidden sm:inline text-[11px] font-medium tracking-wide whitespace-nowrap">
                {tr('AI Yordamchi')}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Multi-Turn Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            aria-label={tr('Solijon Solayev Virtual Yordamchisi')}
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[430px] max-h-[82vh] h-[620px] rounded-2xl bg-[#0F0F12] border border-zinc-800 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-[#050505] border-b border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold text-white truncate">
                    {tr('Solijonning Virtual Yordamchisi')}
                  </h3>
                  <p className="text-[11px] text-zinc-400 truncate">
                    {tr(activeRole.label)} · Gemini AI
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {onAlphabetModeChange && (
                  <button
                    type="button"
                    onClick={() =>
                      onAlphabetModeChange(alphabetMode === 'new_2026' ? 'classic' : 'new_2026')
                    }
                    title={tr('Alifboni almashtirish')}
                    className="px-2 py-1 text-[10px] font-mono-tabular font-medium rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
                  >
                    {alphabetMode === 'new_2026' ? 'ÖĞŞÇ' : "OʻGʻShCh"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleResetConversation}
                  title={tr('Suhbatni tozalash')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  title={tr('Yopish')}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Role & Model Selector Bar */}
            <div className="px-4 py-2.5 bg-[#0A0A0D] border-b border-zinc-800/80 space-y-2">
              {/* Role Selector */}
              <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => {
                      setRoleId(role.id);
                      setErrorMsg(null);
                    }}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      roleId === role.id
                        ? 'bg-blue-600 text-white'
                        : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/70'
                    }`}
                  >
                    {tr(role.label)}
                  </button>
                ))}
              </div>

              {/* Model Speed/Depth Selector */}
              <div className="flex items-center justify-between gap-2 text-[11px]">
                <span className="text-zinc-500 inline-flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-blue-400" /> {tr('Rejim:')}
                </span>
                <div className="flex items-center gap-1">
                  {MODEL_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setModelMode(opt.id)}
                      title={opt.badge}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono-tabular transition-colors cursor-pointer ${
                        modelMode === opt.id
                          ? 'bg-zinc-800 text-blue-400 border border-blue-500/40'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {opt.id === 'fast' && <Zap className="w-2.5 h-2.5 inline mr-0.5 text-amber-400" />}
                      {tr(opt.label)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Conversation Thread */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[#0F0F12]"
            >
              {currentMessages.map((msg) => {
                const isUser = msg.role === 'user';
                const displayText = isUser ? msg.text : tr(msg.text);
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className={`flex items-start gap-2.5 ${
                      isUser ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#050505] border border-zinc-800 text-blue-400'
                      }`}
                    >
                      {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>

                    <div
                      className={`max-w-[82%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed space-y-1.5 ${
                        isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-[#050505] border border-zinc-800 text-zinc-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{displayText}</p>
                      <div
                        className={`flex items-center gap-2 text-[10px] ${
                          isUser ? 'text-blue-200 justify-end' : 'text-zinc-500'
                        }`}
                      >
                        <span className="font-mono-tabular">{msg.timestamp}</span>
                        {msg.modelUsed && !isUser && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono-tabular text-zinc-500">{msg.modelUsed}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Starter Prompts when thread only has welcome message */}
              {currentMessages.length === 1 && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pt-2 space-y-2"
                >
                  <p className="text-[11px] text-zinc-500">{tr('Tezkor savollar:')}</p>
                  <div className="flex flex-col gap-1.5">
                    {activeRole.starters.map((promptText) => {
                      const localizedPrompt = tr(promptText);
                      return (
                        <button
                          key={promptText}
                          type="button"
                          onClick={() => void sendMessage(localizedPrompt)}
                          className="text-left px-3 py-2 rounded-lg bg-[#050505] border border-zinc-800/90 hover:border-blue-500/50 text-xs text-zinc-300 hover:text-white transition-colors cursor-pointer"
                        >
                          {localizedPrompt}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#050505] border border-zinc-800 flex items-center justify-center shrink-0">
                    <Bot className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                  </div>
                  <div className="rounded-xl px-3.5 py-2.5 bg-[#050505] border border-zinc-800 text-xs text-zinc-400">
                    {tr('Javob yozilmoqda...')}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-300">
                  {tr(errorMsg)}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={handleFormSubmit}
              className="p-3 bg-[#050505] border-t border-zinc-800 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={tr('Savolingizni yozing...')}
                disabled={isLoading}
                maxLength={600}
                className="flex-1 px-3.5 py-2.5 text-xs bg-[#0F0F12] border border-zinc-800 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                aria-label={tr('Xabarni yuborish')}
                className="px-3.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white transition-colors inline-flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};
