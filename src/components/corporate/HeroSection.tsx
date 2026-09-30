import React, { useState, useEffect } from 'react';
import { ArrowRight, ChevronRight, Cpu, Sparkles, Sun, BatteryCharging, ShieldCheck, ChevronLeft } from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';

interface HeroSectionProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
}

interface HeroSlide {
  id: string;
  tagline: string;
  enTitleLine1: string;
  enTitleLine2: string;
  enTitleLine3: string;
  jpSubtitle: string;
  description: string;
  image: string;
  accentBadge: string;
  primaryCtaText: string;
  primaryAction: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenContact
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: HeroSlide[] = [
    {
      id: 'slide-bess',
      tagline: 'SMARTER ENERGY. BRIGHTER TOMORROW.',
      enTitleLine1: 'ENERGY',
      enTitleLine2: 'ENGINEERED',
      enTitleLine3: 'FOR THE FUTURE.',
      jpSubtitle: '未来のエネルギーを、設計する。',
      description: '特別高圧66kV系統連系 40MW / 160MWh 系統用蓄電池の基本設計・主要機器供給から、消防法告示第2号・保有空地3m協議、そして電力需給調整市場の最適化まで。',
      image: APP_IMAGES.headerBanner,
      accentBadge: '系統用蓄電池 (BESS) ｜ 消防法告示第2号・特高66kV連系完全準拠',
      primaryCtaText: '法人のお客様へ（ソリューション）',
      primaryAction: () => onNavigateTab('solutions')
    },
    {
      id: 'slide-pv',
      tagline: 'UTILITY-SCALE SOLAR PV &amp; FIP TRANSITION',
      enTitleLine1: 'PRECISION',
      enTitleLine2: 'MEETS POWER',
      enTitleLine3: 'AT SCALE.',
      jpSubtitle: '太陽光発電の真価を、極限まで高める。',
      description: 'FITからFIP制度への移行に伴うインバランス回避、JIS C 8955耐風圧架台設計、DC/AC過積載比率140〜160%の高効率アレイ配置と系統連系協調を完遂。',
      image: APP_IMAGES.solarFacility,
      accentBadge: '産業用メガソーラー ｜ JIS C 8955 ＆ FIPインバランス抑制',
      primaryCtaText: '太陽光ソリューションを見る',
      primaryAction: () => onNavigateTab('solutions')
    },
    {
      id: 'slide-tools',
      tagline: 'CLOUD ELECTRICAL ENGINEERING PLATFORM',
      enTitleLine1: 'INTELLIGENT',
      enTitleLine2: 'ENGINEERING',
      enTitleLine3: 'IN THE CLOUD.',
      jpSubtitle: '電気解析を、ブラウザ上で瞬時に。',
      description: 'JIS C 3605規格に基づく幹線ケーブル許容電流・電圧降下計算、単線結線図（SLD）作図、および主要メーカー仕様書PDF解析をワンストップで実行。',
      image: APP_IMAGES.ambientBg,
      accentBadge: '統合設計ワークスペース ｜ 無料で即座に計算開始',
      primaryCtaText: '設計ツールを使ってみる',
      primaryAction: () => onOpenEngineeringTools()
    }
  ];

  // Auto advance slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const active = slides[currentSlide];

  return (
    <section className="relative overflow-hidden bg-[#001c30] text-white min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex flex-col justify-between rounded-2xl shadow-xl border border-blue-900/50">
      {/* Background Architectural Canvas (Clean, luminous, non-muddy overlay) */}
      <div className="absolute inset-0 pointer-events-none">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.image}
              alt={slide.enTitleLine1}
              className="w-full h-full object-cover object-center scale-102 transition-transform duration-10000 ease-out"
            />
          </div>
        ))}

        {/* Japanese editorial luminous directional gradient: leaves right photography crisp & clear while ensuring text contrast on left */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to right, rgba(0, 24, 44, 0.92) 0%, rgba(0, 28, 48, 0.78) 45%, rgba(0, 28, 48, 0.3) 75%, transparent 100%)'
          }}
        />

        {/* Ambient Top-Left Engineering Glow as requested in prompt */}
        <div 
          className="absolute -top-32 -left-32 w-[680px] h-[680px] opacity-40 mix-blend-screen blur-3xl rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(14, 165, 233, 0.45) 0%, rgba(216, 26, 40, 0.22) 42%, transparent 75%)'
          }}
        />

        {/* Precision Sub-grid mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />
      </div>

      {/* Main Content Area: Left Asymmetric Composition */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pt-12 sm:pt-16 pb-8 w-full flex-1 flex flex-col justify-center">
        
        {/* Category & Standard Badge */}
        <div className="flex flex-wrap items-center gap-3 mb-6 animate-in fade-in slide-in-from-top-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-400/20 backdrop-blur-md rounded-full text-xs font-mono font-bold text-amber-300 border border-amber-400/30">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="tracking-wider uppercase">SMARTER ENERGY. BRIGHTER TOMORROW.</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold text-slate-200 border border-white/15">
            <span className="tracking-wider">{active.accentBadge}</span>
          </div>
        </div>

        {/* Grand Grotesque Headline + Japanese Editorial Subheading */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[0.98] text-white">
            <span className="block">{active.enTitleLine1}</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-white to-sky-200">
              {active.enTitleLine2}
            </span>
            <span className="block">{active.enTitleLine3}</span>
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-slate-100 tracking-tight pt-1 leading-snug">
            {active.jpSubtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl pt-2">
            {active.description}
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-4 pt-8">
          <button
            onClick={active.primaryAction}
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-md bg-[#d81a28] hover:bg-[#b51420] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer"
          >
            <span>{active.primaryCtaText}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenEngineeringTools}
            className="inline-flex items-center gap-2 px-6 py-4 rounded-md bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm transition-all border border-white/20 backdrop-blur-md cursor-pointer"
          >
            <Cpu className="w-4 h-4 text-amber-300" />
            <span>エンジニアリング設計ツール (PRO)</span>
          </button>
        </div>
      </div>

      {/* Bottom Bar: Slide Controls & Authentic Metrics */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 pb-8 w-full border-t border-white/10 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Slide Switcher Controls */}
          <div className="lg:col-span-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 transition-all rounded-full cursor-pointer ${
                    idx === currentSlide ? 'w-8 bg-[#d81a28]' : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`スライド ${idx + 1}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              0{currentSlide + 1} / 0{slides.length}
            </span>
            <div className="flex items-center gap-1 ml-auto lg:ml-2">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 cursor-pointer"
                aria-label="前へ"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
                className="p-1 rounded-md bg-white/5 hover:bg-white/15 text-slate-300 cursor-pointer"
                aria-label="次へ"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Authentic Real Metrics */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-slate-400 text-[11px]">国内累計実績</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-white">1.4 GW<span className="text-amber-400 text-xs">+</span></p>
              <p className="text-[10px] text-slate-400">メガソーラー・蓄電所合計</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">系統連系協議採択率</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-white">98.4 <span className="text-amber-400 text-xs">%</span></p>
              <p className="text-[10px] text-slate-400">特高66kV / 高圧22kV</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">消防法・電気事業法</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-white">100 <span className="text-emerald-400 text-xs">%</span></p>
              <p className="text-[10px] text-slate-400">保有空地3m・第48条完全適合</p>
            </div>
            <div>
              <p className="text-slate-400 text-[11px]">運用期間最適化</p>
              <p className="text-lg sm:text-xl font-bold font-mono text-white">20 <span className="text-amber-400 text-xs">年</span></p>
              <p className="text-[10px] text-slate-400">FIP・JEPX・容量市場予測</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
