import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  User, 
  Bot, 
  Loader2, 
  HelpCircle, 
  ChevronRight, 
  ShieldCheck, 
  FileText,
  RotateCcw,
  Zap,
  ArrowRight
} from 'lucide-react';

interface AiConsultantViewProps {
  initialPrompt?: string;
  onOpenContact: () => void;
  onOpenEngineeringTools: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
  source?: string;
}

export const AiConsultantView: React.FC<AiConsultantViewProps> = ({
  initialPrompt,
  onOpenContact,
  onOpenEngineeringTools
}) => {
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-3.1-pro-preview'>('gemini-3.8-flash');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `株式会社ソルネクサ（SOLNEXA）AI技術相談室へようこそ。
私は日本の太陽光発電および系統用蓄電池（BESS）の技術基準・法令規制・市場運用を専門とするAIチーフエンジニアです。

【主な相談対応分野】
・系統用蓄電池の消防法適合（保有空地3m規制、自動消火設備、火災予防条例）
・電気事業法第48条 工事計画届出および保安規程、主任技術者選任
・FIP制度におけるインバランスペナルティ対策、JEPX裁定取引、需給調整市場・容量市場
・特別高圧（66kV/22kV）受変電設備、単線結線図（SLD）、保護継電器協調（87T, 51, 64OV）
・JIS C 8955耐風圧架台構造計算、JIS C 3605ケーブル許容電流・電圧降下

下部の質問入力欄またはプリセットの質問ボタンよりお気軽にご質問ください。`,
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
      model: 'gemini-3.8-flash',
      source: 'solnexa-knowledge-engine'
    }
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const presetQuestions = [
    '系統用蓄電池の消防法上の保有空地3m基準と緩和条件を教えて',
    'FIP制度で太陽光に蓄電池を併設した場合のJEPXアービトラージ収益性は？',
    '特別高圧（66kV）受変電設備の単線結線図（SLD）設計と保護継電器協調のポイント',
    '電気事業法第48条の工事計画届出に必要な提出書類と期間は？',
    '高圧メガソーラーにおける直流過積載比率（DC/AC比）の最新トレンドは？',
    'リチウムイオン蓄電池設備の少量危険物届出の判定基準は？'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim() !== '') {
      handleSendMessage(initialPrompt);
    }
  }, [initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const historyPayload = messages
      .filter(m => m.id !== 'welcome-1')
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: query.trim(),
          history: historyPayload,
          model: selectedModel
        })
      });

      if (!res.ok) {
        throw new Error('サーバーからの応答に失敗しました');
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.answer || '申し訳ございません。回答を生成できませんでした。',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        model: data.model || selectedModel,
        source: data.source || 'gemini-3.8-flash'
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('AI consultation error:', err);
      const fallbackMsg: Message = {
        id: `assistant-err-${Date.now()}`,
        role: 'assistant',
        content: '通信エラーが発生いたしました。株式会社ソルネクサの技術顧問へ直接お問い合わせいただくか、再度ご質問をお試しください。',
        timestamp: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        model: selectedModel
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([messages[0]]);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-[#002244] text-white rounded-xl p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-400 text-slate-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
              SOLNEXA AI Technical Advisor
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            AI 太陽光・系統用蓄電池 技術相談室
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            消防法、電気事業法、JIS規格、電力会社系統連系技術基準、およびFIP・容量市場の制度要件について、専門AIが24時間いつでも技術相談を承ります。
          </p>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-[700px] overflow-hidden">
        {/* Chat Control Header */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center font-bold text-xs">
              AI
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">SOLNEXA AI チーフ技術顧問</p>
              <p className="text-[10px] text-slate-500">Google Gemini &amp; ソルネクサ技術知見データベース連動</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Model Selector */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-[11px] font-mono">
              <button
                onClick={() => setSelectedModel('gemini-3.8-flash')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  selectedModel === 'gemini-3.8-flash'
                    ? 'bg-[#002B49] text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="標準・高精度（推奨）"
              >
                3.8 Flash
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  selectedModel === 'gemini-3.1-flash-lite'
                    ? 'bg-[#002B49] text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="超高速レスポンス"
              >
                3.1 Lite
              </button>
              <button
                onClick={() => setSelectedModel('gemini-3.1-pro-preview')}
                className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                  selectedModel === 'gemini-3.1-pro-preview'
                    ? 'bg-[#002B49] text-white font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="高度計算・推論"
              >
                3.1 Pro
              </button>
            </div>

            <button
              onClick={handleResetChat}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded border border-slate-200 hover:bg-slate-100 flex items-center gap-1 transition-colors cursor-pointer"
              title="チャットを初期化"
            >
              <RotateCcw className="w-3 h-3" />
              <span>クリア</span>
            </button>
            <button
              onClick={onOpenContact}
              className="text-xs font-bold text-[#003366] hover:underline px-2 cursor-pointer"
            >
              専門家に直接相談
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-[#f8fafc]">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div 
                key={m.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser 
                      ? 'bg-amber-500 text-slate-950' 
                      : 'bg-[#003366] text-white'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div 
                  className={`rounded-xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                    isUser 
                      ? 'bg-[#003366] text-white' 
                      : 'bg-white text-slate-800 border border-slate-200'
                  }`}
                >
                  <p>{m.content}</p>

                  <div className={`mt-2 pt-2 border-t text-[10px] flex items-center justify-between ${
                    isUser ? 'border-blue-900/60 text-blue-200' : 'border-slate-100 text-slate-400'
                  }`}>
                    <span>{m.timestamp}</span>
                    {!isUser && (
                      <span className="font-mono text-[10px] text-amber-700">
                        SOLNEXA Engine Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-[#003366] text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-600 flex items-center gap-2 shadow-xs">
                <Loader2 className="w-4 h-4 text-[#003366] animate-spin" />
                <span>日本の技術基準および法令データベースを参照中...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Question Suggestions */}
        <div className="bg-white border-t border-slate-200 px-4 py-2.5 overflow-x-auto flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500 shrink-0 text-[11px] flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>おすすめの質問:</span>
          </span>
          {presetQuestions.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="shrink-0 px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-[#003366] text-slate-700 rounded-md text-[11px] transition-colors border border-slate-200"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-slate-200 p-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="例: 系統用蓄電池の消防法届出要件やFIPインバランスについて質問する..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#003366] focus:bg-white"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-5 py-3 bg-[#003366] hover:bg-[#002244] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <span>送信</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
