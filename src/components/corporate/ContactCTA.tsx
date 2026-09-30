import React from 'react';
import { ArrowRight, Phone, Mail, FileText, CheckCircle2, ShieldCheck, Sun } from 'lucide-react';

interface ContactCTAProps {
  onOpenContact: () => void;
}

export const ContactCTA: React.FC<ContactCTAProps> = ({ onOpenContact }) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#001c30] via-[#002b49] to-[#001726] text-white rounded-3xl p-8 sm:p-14 lg:p-16 border border-blue-900/60 shadow-2xl">
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#d81a28]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
        
        {/* Category Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-amber-300 border border-white/15">
          <Sun className="w-3.5 h-3.5 text-amber-400" />
          <span className="uppercase tracking-wider font-mono">SOLNEXA: SMARTER ENERGY. BRIGHTER TOMORROW.</span>
        </div>

        {/* Grand Headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-white">
          LET'S BUILD<br />
          THE NEXT ENERGY<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-sky-200">
            INFRASTRUCTURE.
          </span>
        </h2>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-slate-200 max-w-2xl mx-auto leading-relaxed">
          系統用蓄電池（BESS）の基本計画、特別高圧66kV系統連系協議、消防法告示第2号・保有空地3m協議、そして太陽光発電所のFIP最適化設計。経験豊富なチーフ電気主任技術者が誠意をもって伴走します。
        </p>

        {/* Key Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-300 pt-2 font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            事前相談・接続検討初期診断 無料
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            特高66kV / 高圧22kV 変電スキッド供給対応
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            全国対応（東電・関電・九電・東北・中部他）
          </span>
        </div>

        {/* Dual Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto px-8 py-4 bg-[#d81a28] hover:bg-[#b51420] active:scale-95 text-white font-bold text-xs sm:text-sm rounded-lg shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>お問い合わせ・無料見積相談</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenContact}
            className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-lg border border-white/20 backdrop-blur-md transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <FileText className="w-4 h-4 text-amber-300" />
            <span>製品カタログ・設計資料請求</span>
          </button>
        </div>

        {/* Corporate Contact Note */}
        <div className="pt-6 border-t border-white/10 text-xs text-slate-300 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <span className="flex items-center gap-1.5 font-bold">
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            お電話でのお問い合わせ:{' '}
            <a href="tel:07089821052" className="text-amber-300 hover:underline font-mono">
              070-8982-1052
            </a>{' '}
            （平日 9:00〜18:00）
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-amber-400" />
            <a href="mailto:hoanganhtuan.solnexa@gmail.com" className="text-slate-200 hover:underline font-mono">
              hoanganhtuan.solnexa@gmail.com
            </a>
          </span>
          <span className="text-slate-400">東京本社: 〒116-0002 東京都荒川区荒川5-6-7 302号</span>
        </div>

      </div>
    </section>
  );
};
