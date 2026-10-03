import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  ArrowRight, 
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  Copy,
  Check,
  ShieldCheck,
  Zap,
  HelpCircle,
  Calculator,
  MessageSquare
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { CORPORATE_EASE } from '../../utils/motionConfig';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  source?: string;
}

interface ChatBotWidgetProps {
  onOpenContact?: () => void;
  onOpenEngineeringTools?: () => void;
  onOpenDesignQuotation?: () => void;
}

export const ChatBotWidget: React.FC<ChatBotWidgetProps> = ({
  onOpenContact,
  onOpenEngineeringTools,
  onOpenDesignQuotation
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const initialGreeting: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    content: `株式会社ソルネクサ（SOLNEXA Japan）AI技術相談室へようこそ。
私は太陽光発電（PV）および系統用蓄電池（Grid-scale BESS）を専門とする専属AIチーフ技術顧問です。

【主な相談対応領域】
・系統用蓄電池の消防法適合（保有空地3m規制、自動消火設備、少量危険物）
・電気事業法第48条 工事計画届出および保安規程
・FIPインバランスペナルティ対策、JEPXアービトラージ、需給調整市場
・特別高圧（66kV/22kV）受変電設備、単線結線図（SLD）、保護協調（87T, 51）
・JIS C 8955架台耐風圧計算、JIS C 3605ケーブル許容電流・電圧降下

何でもお気軽にご相談ください。`,
    timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
    model: 'gemini-3.8-flash',
    source: 'solnexa-knowledge-engine'
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);

  const presetQuestions = [
    '系統用蓄電池の消防法上の保有空地3m基準と緩和条件は？',
    'FIP制度で蓄電池を併設した場合のJEPXアービトラージ収益性',
    '特別高圧（66kV）受変電設備の単線結線図と保護協調ポイント',
    'JIS C 3605ケーブル許容電流と電圧降下2%以内の設計手法',
    '電気事業法第48条工事計画届出の必要書類と期間'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Format previous history for multi-turn Gemini API
    const historyPayload = messages
      .filter(m => m.id !== 'welcome-msg')
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: historyPayload,
          model: selectedModel
        })
      });

      if (!res.ok) {
        throw new Error('サーバーからの応答に失敗しました。');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || '申し訳ございません。回答を生成できませんでした。',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        model: data.model || selectedModel,
        source: data.source
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: '一時的に通信エラーが発生しました。時間を置いて再度お試しいただくか、担当技術者へ直接お問い合わせください。',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        ...initialGreeting,
        id: `welcome-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING TRIGGER BUTTON (Bottom-Right, Elegant Corporate Style)        */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3 font-sans">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.22, ease: CORPORATE_EASE }}
              className="flex items-center gap-2"
            >
              {/* Tooltip callout badge on desktop */}
              <div 
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-slate-200 text-xs font-semibold text-[#002B49] cursor-pointer hover:bg-white hover:shadow-xl transition-all"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>AI技術相談 24/7</span>
              </div>

              {/* Main Circular Launcher */}
              <button
                onClick={() => setIsOpen(true)}
                className="group relative flex items-center justify-center w-14 h-14 bg-[#002B49] hover:bg-[#001D33] active:scale-95 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer border border-blue-900/60"
                title="SOLNEXA AI技術顧問チャットボットを開く"
                aria-label="AIチャットボット"
              >
                <Sparkles className="w-6 h-6 text-amber-300 group-hover:rotate-12 transition-transform duration-300" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d81a28] opacity-75" />
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-[#d81a28] border-2 border-white" />
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================================= */}
      {/* 2. CHAT DRAWER PANEL (Multi-Turn Chatbot Interface)                        */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.28, ease: CORPORATE_EASE }}
            className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 w-[calc(100vw-32px)] sm:w-[430px] h-[640px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden font-sans backdrop-blur-md"
          >
            {/* --- Header Bar --- */}
            <div className="bg-[#002B49] text-white px-5 py-3.5 flex items-center justify-between border-b border-blue-900/80 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
                  <Bot className="w-5 h-5 text-amber-300" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#002B49]" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white tracking-tight truncate">
                      SOLNEXA AI 技術顧問
                    </h3>
                    <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-xs font-semibold">
                      ONLINE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate">
                    太陽光・系統用蓄電池エンジニアリング専門
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handleResetChat}
                  title="対話履歴をリセット"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="リセット"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="チャットを閉じる"
                  className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  aria-label="閉じる"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* --- Model Selector Bar --- */}
            <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between gap-2 text-[11px] shrink-0">
              <span className="text-slate-500 font-medium shrink-0">モデル選択:</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedModel('gemini-3.8-flash')}
                  className={`px-2 py-0.8 rounded font-mono transition-colors cursor-pointer ${
                    selectedModel === 'gemini-3.8-flash'
                      ? 'bg-[#002B49] text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                  title="標準・高精度（推奨）"
                >
                  3.8 Flash
                </button>
                <button
                  onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                  className={`px-2 py-0.8 rounded font-mono transition-colors cursor-pointer ${
                    selectedModel === 'gemini-3.1-flash-lite'
                      ? 'bg-[#002B49] text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                  title="超高速レスポンス"
                >
                  3.1 Lite
                </button>
                <button
                  onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                  className={`px-2 py-0.8 rounded font-mono transition-colors cursor-pointer ${
                    selectedModel === 'gemini-3.1-pro-preview'
                      ? 'bg-[#002B49] text-white font-bold shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                  title="高度解析・計算"
                >
                  3.1 Pro
                </button>
              </div>
            </div>

            {/* --- Scrollable Message Thread --- */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[10px] text-slate-400">
                    <span>{msg.role === 'user' ? 'お客様' : 'SOLNEXA AI顧問'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                    {msg.model && (
                      <span className="font-mono text-slate-500 bg-slate-200/70 px-1 py-0.2 rounded-xs">
                        {msg.model}
                      </span>
                    )}
                  </div>

                  <div
                    className={`relative group max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-[#002B49] text-white rounded-br-xs shadow-xs'
                        : 'bg-white text-slate-800 rounded-bl-xs border border-slate-200/80 shadow-xs'
                    }`}
                  >
                    {msg.content}

                    {/* Copy Button for Assistant answers */}
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="absolute bottom-2 right-2 p-1 text-slate-400 hover:text-slate-700 bg-white/80 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer shadow-2xs"
                        title="内容をコピー"
                        aria-label="コピー"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#002B49]/10 text-[#002B49] flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-[#002B49] animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#002B49] animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-[#002B49] animate-bounce" style={{ animationDelay: '300ms' }} />
                      <span className="text-[11px] text-slate-500 ml-1">AI顧問が技術回答を作成中...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* --- Quick Question Preset Chips --- */}
            {messages.length <= 3 && !isLoading && (
              <div className="px-4 py-2 border-t border-slate-200 bg-white shrink-0 overflow-x-auto">
                <div className="flex items-center gap-1.5 pb-1">
                  <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" />
                    頻出の相談テーマ:
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {presetQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q)}
                      className="text-[11px] bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-[#002B49] px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-200 transition-colors cursor-pointer shrink-0"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- Quick Action Footer (Links to Tools & Contact) --- */}
            <div className="px-4 py-2 bg-slate-100/70 border-t border-slate-200/80 flex items-center justify-between text-[11px] shrink-0">
              <div className="flex items-center gap-3">
                {onOpenDesignQuotation && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenDesignQuotation();
                    }}
                    className="text-[#d81a28] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>無料 設計見積</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
                {onOpenEngineeringTools && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenEngineeringTools();
                    }}
                    className="text-[#002B49] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>設計ツール</span>
                  </button>
                )}
              </div>

              {onOpenContact && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenContact();
                  }}
                  className="text-slate-500 hover:text-slate-800 underline cursor-pointer"
                >
                  お問い合わせ
                </button>
              )}
            </div>

            {/* --- Chat Input Box --- */}
            <div className="p-3 bg-white border-t border-slate-200 shrink-0">
              <div className="relative flex items-center border border-slate-300 focus-within:border-[#002B49] rounded-xl overflow-hidden shadow-2xs transition-colors bg-white">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="太陽光・蓄電池の技術仕様・法令基準・計算について質問... (Enterで送信)"
                  rows={2}
                  disabled={isLoading}
                  className="w-full px-3.5 py-2 text-xs focus:outline-hidden resize-none leading-relaxed text-slate-800 placeholder:text-slate-400"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 mr-1.5 bg-[#002B49] hover:bg-[#001D33] active:scale-95 text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer shrink-0"
                  title="メッセージを送信"
                  aria-label="送信"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 px-1">
                <span>Shift + Enter で改行</span>
                <span>Powered by Google Gemini</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
export default ChatBotWidget;
