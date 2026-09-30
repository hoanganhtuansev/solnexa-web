import React from 'react';
import { ArrowRight, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';

interface AboutSectionProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenContact: () => void;
  onOpenCompanyProfile?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  onNavigateTab,
  onOpenContact,
  onOpenCompanyProfile
}) => {
  return (
    <section className="py-10 space-y-10 border-t border-slate-200/80">
      {/* Top Editorial Headline */}
      <div className="space-y-3 max-w-4xl">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-[#002b49] rounded-xs" />
          <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
            Corporate Philosophy &amp; Engineering Trust ｜ 企業情報・会社概要
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#002b49] tracking-tight leading-tight">
          ENGINEERING A SUSTAINABLE FUTURE.
        </h2>

        <p className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
          エネルギーインフラの信頼性を、妥協なき工学設計で支える。
        </p>
      </div>

      {/* Asymmetric Architectural Composition (Large Photo + Spacious Text Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Large Architectural Photograph (7 cols) */}
        <div className="lg:col-span-7">
          <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-16/10 group">
            <img
              src={APP_IMAGES.headerBanner}
              alt="SOLNEXA Engineering Philosophy"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001c30]/95 via-[#001c30]/40 to-transparent flex flex-col justify-end p-5 sm:p-7">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider">
                SOLNEXA TOKYO HEADQUARTERS ｜ SMARTER ENERGY. BRIGHTER TOMORROW.
              </span>
              <p className="text-sm sm:text-base font-bold text-white mt-1">
                株式会社ソルネクサ ｜ 東京都荒川区荒川5-6-7 302号 (TEL: 070-8982-1052)
              </p>
              <p className="text-xs text-slate-300 mt-1">
                ブランド語源: SOL (太陽) + NEXT (未来) + A (行動・創生) ｜ JPEA正会員 ｜ 日本蓄電池工業会 賛助会員
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Narrative Copy with Spacious Typographic Rhythm (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <p>
              再エネ主力電源化への道のりは、単なる発電パネルや蓄電設備の設置にとどまりません。電力系統の混雑、周波数・電圧の安定度、そして厳しい消防法・電気事業法の法令遵守という複雑な課題が存在します。
            </p>
            <p>
              株式会社ソルネクサ（SOLNEXA）は、特別高圧・高圧分野における電気主任技術者および系統解析エンジニアが結集した総合技術企業です。
            </p>
            <p>
              地質・日射環境調査から、JIS C 8955耐風圧架台力学計算、JIS C 3605ケーブル最適選定、そして66kV特別高圧受変電設備の保護協調まで、妥協のない技術力でクライアントの投資価値を20年間にわたり守り抜きます。
            </p>
          </div>

          {/* Credentials List */}
          <div className="border-t border-b border-slate-200 py-3.5 space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">経済産業省・産業保安監督部 第48条工事計画届出実績多数</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">総務省消防庁告示第2号 屋外蓄電池保有空地3m自治体協議完全対応</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">国内全一般送配電事業者（東電・関電・九電他）との特高連系実績</span>
            </div>
          </div>

          <div className="pt-1 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (onOpenCompanyProfile) onOpenCompanyProfile();
                else onOpenContact();
              }}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#002b49] hover:bg-[#001d32] text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              <span>企業情報・会社概要を詳しく見る</span>
              <ArrowRight className="w-4 h-4 text-[#d81a28]" />
            </button>
            <button
              onClick={onOpenContact}
              className="inline-flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <span>お問い合わせ・ご相談</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
