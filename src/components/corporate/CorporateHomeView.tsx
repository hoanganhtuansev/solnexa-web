import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  ArrowUpRight, 
  Phone, 
  Mail, 
  Layers, 
  BatteryCharging, 
  Calculator, 
  FileSpreadsheet, 
  Sparkles, 
  Building2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';
import { ScrollReveal, ScrollRevealItem } from './ScrollReveal';
import { 
  CORPORATE_EASE, 
  heroSlideVariants, 
  heroChildVariants,
  reducedHeroSlideVariants,
  reducedHeroChildVariants
} from '../../utils/motionConfig';
import { AdminEditFloatingBar } from './AdminEditFloatingBar';
import { AdminVisualCustomizerModal } from './AdminVisualCustomizerModal';
import { InlineEditableText } from './InlineEditableText';
import { SiteConfig } from '../../types/siteConfig';
import { DEFAULT_SITE_CONFIG } from '../../utils/siteConfigDefaults';

interface CorporateHomeViewProps {
  onNavigateTab: (tab: CorporateTab, subTab?: string) => void;
  onOpenEngineeringTools: () => void;
  onOpenEngineeringTool?: (view: any, projectId?: string) => void;
  onOpenContact: () => void;
  onOpenCompanyProfile?: () => void;
  onOpenChatBot?: () => void;
  onOpenLogin?: () => void;
  onAskAiPrompt?: (promptText: string) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  currentUser?: any;
}

export const CorporateHomeView: React.FC<CorporateHomeViewProps> = ({
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenEngineeringTool,
  onOpenContact,
  onOpenCompanyProfile,
  onOpenChatBot,
  isAdmin = false,
  currentUser
}) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isVisualCustomizerOpen, setIsVisualCustomizerOpen] = useState(false);
  const [isInlineEditActive, setIsInlineEditActive] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHoveringHero, setIsHoveringHero] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  // Load site visual configuration from backend API
  useEffect(() => {
    fetch('/api/site-config')
      .then(res => res.json())
      .then(data => {
        if (data && data.config) {
          setSiteConfig(data.config);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveSiteConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch('/api/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(siteConfig)
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        alert('Cấu hình giao diện đã được lưu thành công vào máy chủ!');
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Lỗi khi lưu cấu hình. Vui lòng kiểm tra quyền quản trị.');
      }
    } catch {
      alert('Không thể kết nối đến máy chủ.');
    } finally {
      setIsSavingConfig(false);
    }
  };

  const heroSlides = [
    {
      id: 0,
      image: siteConfig.hero?.bgImage || APP_IMAGES.solarFrontierDaylight,
      tag: siteConfig.hero?.tagline || '01 ｜ UTILITY-SCALE SOLAR & SUBSTATION',
      headline: (siteConfig.hero?.titleLine1 
        ? `${siteConfig.hero.titleLine1}${siteConfig.hero.titleLine2 ? '\n' + siteConfig.hero.titleLine2 : ''}` 
        : '太陽光・BESSを、\n技術で支える。'),
      subhead: siteConfig.hero?.description || '設計、施工支援、シミュレーション。\nプロジェクトに必要な技術を、シンプルに、正確に。',
      facility: siteConfig.hero?.accentBadge || '福島県相馬市 45MW メガソーラー特高連系',
    },
    {
      id: 1,
      image: APP_IMAGES.cleanBessFacility,
      tag: '02 ｜ GRID-SCALE BESS STORAGE',
      headline: '次世代グリッドを拓く、\n系統用蓄電池。',
      subhead: '消防法告示第2号保有空地3m協議から、電事法第48条届出まで。\n蓄電所エンジニアリングを一貫サポート。',
      facility: '40MW / 160MWh 系統用大型蓄電所',
    },
    {
      id: 2,
      image: APP_IMAGES.cleanWhiteSubstation,
      tag: '03 ｜ EXTRA HIGH VOLTAGE SUBSTATION',
      headline: '高圧・特高変電所の安全と、\n確かな信頼を。',
      subhead: 'JIS C 3605許容電流、JIS C 8955耐風圧架台力学計算。\n系統連系協議を迅速にクリアする図面と技術計算書。',
      facility: '特別高圧 66kV GIS受変電設備・自営線',
    },
    {
      id: 3,
      image: APP_IMAGES.smartEmsDaylight,
      tag: '04 ｜ ASSET LIFETIME SIMULATION',
      headline: '20年の投資価値を守る、\n長期安定シミュレーション。',
      subhead: '気象データ連携、日影PR損失解析、FIP市場・容量市場20年計画解析。\n不確実性を排除するデータエンジニアリング。',
      facility: 'FIP・容量市場シミュレーションモデル',
    },
  ];

  // Auto transition slides every 5.5 seconds
  useEffect(() => {
    if (isPaused || isHoveringHero) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused, isHoveringHero, heroSlides.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const handleScrollTo = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLaunchTool = (toolId: string) => {
    if (onOpenEngineeringTool) {
      onOpenEngineeringTool(toolId);
    } else {
      onOpenEngineeringTools();
    }
  };

  const activeSlideData = heroSlides[currentSlide];

  return (
    <div className="w-full text-slate-800 bg-white selection:bg-slate-200 selection:text-slate-900">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Auto Carousel with Smooth Cross-Fade & Progress)         */}
      {/* ========================================================================= */}
      <section 
        className="relative min-h-[85vh] lg:min-h-[88vh] flex items-center overflow-hidden border-b border-slate-200"
        onMouseEnter={() => setIsHoveringHero(true)}
        onMouseLeave={() => setIsHoveringHero(false)}
      >
        {/* Background Image Carousel with Smooth Motion Cross-fade and subtle Ken-Burns */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: shouldReduceMotion ? 0.15 : 0.88, 
                ease: CORPORATE_EASE 
              }}
              className="absolute inset-0 z-1"
            >
              <motion.img 
                src={activeSlideData.image} 
                alt={activeSlideData.headline} 
                initial={{ scale: 1.0 }}
                animate={{ scale: shouldReduceMotion ? 1.0 : 1.028 }}
                transition={shouldReduceMotion ? { duration: 0.1 } : { duration: 6.5, ease: "easeOut" }}
                className="w-full h-full object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>

          {/* Refined gradient scrim: crisp white-to-transparent for photographic elegance */}
          <div className="absolute inset-0 z-2 bg-gradient-to-r from-white/88 via-white/70 to-transparent lg:w-[58%] pointer-events-none" />
          <div className="absolute inset-0 z-2 bg-gradient-to-t from-white/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Hero Content with Smooth Overlapping Entrance/Exit on Slide Change */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-20 lg:py-24 w-full">
          <div className="relative min-h-[380px] sm:min-h-[420px] lg:min-h-[440px] max-w-2xl">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div 
                key={currentSlide} 
                variants={shouldReduceMotion ? reducedHeroSlideVariants : heroSlideVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-7 w-full"
              >
                {/* 1. Minimal Brand Kicker & Facility Location Badge */}
                <motion.div variants={shouldReduceMotion ? reducedHeroChildVariants : heroChildVariants} className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#d81a28]" />
                    <p className="text-xs font-semibold tracking-[0.25em] text-[#002B49] uppercase font-mono">
                      {activeSlideData.tag}
                    </p>
                  </div>
                  <span className="text-slate-300 hidden sm:inline">|</span>
                  <span className="text-[11px] font-mono text-slate-500 bg-white/75 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 shadow-2xs">
                    {activeSlideData.facility}
                  </span>
                </motion.div>

                {/* 2. Hero Main Headline */}
                {isInlineEditActive ? (
                  <div className="py-2">
                    <InlineEditableText
                      value={activeSlideData.headline}
                      isEditMode={isInlineEditActive}
                      as="h1"
                      multiline={true}
                      label={`Chỉnh sửa tiêu đề Slide ${currentSlide + 1}`}
                      className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#002B49] tracking-tight leading-[1.22] jp-heading"
                      onSave={(val) => {
                        setSiteConfig(prev => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            titleLine1: val.split('\n')[0] || val,
                            titleLine2: val.split('\n').slice(1).join('\n') || ''
                          }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                ) : (
                  <motion.h1 
                    variants={shouldReduceMotion ? reducedHeroChildVariants : heroChildVariants}
                    className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#002B49] tracking-tight leading-[1.22] jp-heading"
                  >
                    {activeSlideData.headline.split('\n').map((line, idx) => (
                      <span key={idx} className="block">
                        <span className="jp-chunk">{line}</span>
                      </span>
                    ))}
                  </motion.h1>
                )}

                {/* 3. Subtitle / Engineering Description */}
                {isInlineEditActive ? (
                  <div className="py-2">
                    <InlineEditableText
                      value={activeSlideData.subhead}
                      isEditMode={isInlineEditActive}
                      as="p"
                      multiline={true}
                      label={`Chỉnh sửa mô tả kỹ thuật Slide ${currentSlide + 1}`}
                      className="text-base sm:text-lg text-slate-600 font-normal leading-[1.85] max-w-xl jp-heading"
                      onSave={(val) => {
                        setSiteConfig(prev => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            description: val
                          }
                        }));
                        setHasUnsavedChanges(true);
                      }}
                    />
                  </div>
                ) : (
                  <motion.p 
                    variants={shouldReduceMotion ? reducedHeroChildVariants : heroChildVariants}
                    className="text-base sm:text-lg text-slate-600 font-normal leading-[1.85] max-w-xl jp-heading"
                  >
                    {activeSlideData.subhead.split('\n').map((line, idx) => (
                      <span key={idx} className="block">
                        <span className="jp-chunk">{line}</span>
                      </span>
                    ))}
                  </motion.p>
                )}

                {/* 4. Dual Call To Action */}
                <motion.div variants={shouldReduceMotion ? reducedHeroChildVariants : heroChildVariants} className="pt-2 flex flex-wrap items-center gap-4">
                  <button
                    onClick={() => handleScrollTo('business')}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#002B49] hover:bg-[#001D33] active:scale-98 text-white text-xs sm:text-[13px] font-medium tracking-wider rounded-md transition-colors shadow-xs cursor-pointer group"
                  >
                    <span>私たちについてを見る</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={onOpenEngineeringTools}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/90 hover:bg-white active:scale-98 text-[#002B49] border border-slate-300 hover:border-slate-400 text-xs sm:text-[13px] font-medium tracking-wider rounded-md transition-colors shadow-2xs cursor-pointer group"
                  >
                    <span>TOOLSを使う</span>
                    <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-[#002B49] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>

                  {onOpenChatBot && (
                    <button
                      onClick={onOpenChatBot}
                      className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-50/90 hover:bg-blue-100/90 active:scale-98 text-[#002B49] border border-blue-200/90 text-xs sm:text-[13px] font-semibold tracking-wider rounded-md transition-colors shadow-2xs cursor-pointer group"
                    >
                      <Sparkles className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
                      <span>AI技術相談</span>
                    </button>
                  )}
                </motion.div>

              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Carousel Bottom Controller (Dots, Progress & Pause/Play) */}
        <div className="absolute bottom-6 right-6 lg:right-12 z-20 flex items-center gap-3 bg-white/85 backdrop-blur-md px-4 py-2 rounded-full border border-slate-200/80 shadow-xs">
          {/* Slide buttons */}
          <div className="flex items-center gap-2">
            {heroSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 flex items-center justify-center font-mono text-[11px] cursor-pointer ${
                  idx === currentSlide
                    ? 'w-7 h-5 bg-[#002B49] text-white font-bold rounded-full'
                    : 'w-5 h-5 text-slate-500 hover:text-slate-900 rounded-full'
                }`}
                title={`スライド ${idx + 1}`}
              >
                0{idx + 1}
              </button>
            ))}
          </div>

          <span className="w-px h-3.5 bg-slate-300" />

          {/* Pause / Play toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 text-slate-500 hover:text-[#002B49] transition-colors cursor-pointer"
            title={isPaused ? '自動再生を再開' : '一時停止'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevSlide}
              className="p-1 text-slate-500 hover:text-[#002B49] transition-colors cursor-pointer"
              title="前の画像"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextSlide}
              className="p-1 text-slate-500 hover:text-[#002B49] transition-colors cursor-pointer"
              title="次の画像"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. 私たちについて (ABOUT US - 3 Fields: 01 設計 / 02 施工支援 / 03 シミュレーション) */}
      {/* ========================================================================= */}
      <section id="business" className="py-24 sm:py-32 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-24 lg:space-y-32">
          
          {/* Section Header */}
          <div className="space-y-3 border-b border-slate-200 pb-8 max-w-3xl">
            <ScrollReveal variant="label" delayMs={0}>
              <span className="text-xs font-semibold tracking-[0.25em] text-[#002B49] uppercase font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#d81a28]" />
                01 ｜ ABOUT US ｜ 私たちについて
              </span>
            </ScrollReveal>
            <ScrollReveal variant="heading" delayMs={70}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002B49] tracking-tight">
                私たちについて
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="body" delayMs={140}>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed pt-1 font-normal">
                SOLNEXAは、太陽光・系統用蓄電池（BESS）のプロジェクトを具現化するエンジニアリングファームです。<br className="hidden sm:inline" />
                「<strong className="text-[#002B49] font-semibold">01 設計</strong>」「<strong className="text-[#002B49] font-semibold">02 施工支援</strong>」「<strong className="text-[#002B49] font-semibold">03 シミュレーション</strong>」の3つの実務領域を核とし、現場の安全と投資の長期価値を確かな技術で支えます。
              </p>
            </ScrollReveal>
          </div>

          {/* 01 DESIGN / 設計 (Image Left, Text Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <ScrollReveal variant="image" delayMs={80}>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.cleanWhiteSubstation} 
                    alt="SOLNEXA Engineering Design" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                </div>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
              <ScrollReveal variant="label" delayMs={0}>
                <span className="text-xs font-semibold text-slate-400 tracking-widest font-mono">
                  01 DESIGN
                </span>
              </ScrollReveal>
              <ScrollReveal variant="heading" delayMs={60}>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#002B49] tracking-tight leading-snug jp-heading">
                  <span className="jp-chunk">特別高圧・高圧受変電から、</span>
                  <br className="hidden sm:inline" />
                  <span className="jp-chunk">アレイ最適設計まで。</span>
                </h3>
              </ScrollReveal>
              <ScrollReveal variant="body" delayMs={120}>
                <p className="text-slate-600 text-base leading-[1.85] font-normal">
                  地質・日射環境調査に基づき、耐風圧架台力学計算やJIS C 3605規格ケーブルの最適選定を実施。一般送配電事業者との系統連系協議に耐えうる高精度な設計図書を作成します。
                </p>
              </ScrollReveal>
              <ScrollReveal variant="cta" delayMs={180}>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('solutions')}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#002B49] hover:text-[#d81a28] transition-colors cursor-pointer group"
                  >
                    <span>設計ソリューションの詳細を見る</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* 02 CONSTRUCTION SUPPORT / 施工支援 (Text Left, Image Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-5 space-y-5">
              <ScrollReveal variant="label" delayMs={0}>
                <span className="text-xs font-semibold text-slate-400 tracking-widest font-mono">
                  02 CONSTRUCTION SUPPORT
                </span>
              </ScrollReveal>
              <ScrollReveal variant="heading" delayMs={60}>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#002B49] tracking-tight leading-snug jp-heading">
                  <span className="jp-chunk">消防法と電気事業法を、</span>
                  <br className="hidden sm:inline" />
                  <span className="jp-chunk">確実にクリアする現場支援。</span>
                </h3>
              </ScrollReveal>
              <ScrollReveal variant="body" delayMs={120}>
                <p className="text-slate-600 text-base leading-[1.85] font-normal">
                  総務省消防庁告示第2号に基づく屋外蓄電池保有空地3m離隔協議から、経済産業省・産業保安監督部への第48条工事計画届出まで、現場実務を一貫支援します。
                </p>
              </ScrollReveal>
              <ScrollReveal variant="cta" delayMs={180}>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('solutions')}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#002B49] hover:text-[#d81a28] transition-colors cursor-pointer group"
                  >
                    <span>施工・法規支援の詳細を見る</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-7">
              <ScrollReveal variant="image" delayMs={80}>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.cleanBessFacility} 
                    alt="SOLNEXA Construction Support & Fire Regulation" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* 03 SIMULATION / シミュレーション (Image Left, Text Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 order-2 lg:order-1">
              <ScrollReveal variant="image" delayMs={80}>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.smartEmsDaylight} 
                    alt="SOLNEXA Power & BESS Simulation" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                </div>
              </ScrollReveal>
            </div>
            <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
              <ScrollReveal variant="label" delayMs={0}>
                <span className="text-xs font-semibold text-slate-400 tracking-widest font-mono">
                  03 SIMULATION
                </span>
              </ScrollReveal>
              <ScrollReveal variant="heading" delayMs={60}>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[#002B49] tracking-tight leading-snug jp-heading">
                  <span className="jp-chunk">20年間の投資価値を守る、</span>
                  <br className="hidden sm:inline" />
                  <span className="jp-chunk">高精度発電・充放電解析。</span>
                </h3>
              </ScrollReveal>
              <ScrollReveal variant="body" delayMs={120}>
                <p className="text-slate-600 text-base leading-[1.85] font-normal">
                  気象データとアレイ影損失を精密に算定し、年間PR値やインバランスリスクをシミュレーション。FIP市場や容量市場に最適化された運用モデルをご提案します。
                </p>
              </ScrollReveal>
              <ScrollReveal variant="cta" delayMs={180}>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('solutions')}
                    className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#002B49] hover:text-[#d81a28] transition-colors cursor-pointer group"
                  >
                    <span>シミュレーション技術の詳細を見る</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. SOLNEXA TOOLS (The Key Differentiation - Calm, Precise & Practical)    */}
      {/* ========================================================================= */}
      <section id="tools" className="py-24 sm:py-32 bg-[#f8fafc] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16">
          
          {/* Header & Philosophy */}
          <div className="space-y-4 max-w-2xl">
            <ScrollReveal variant="label" delayMs={0}>
              <span className="text-xs font-semibold tracking-[0.2em] text-[#002B49] uppercase font-mono">
                02 ｜ ENGINEERING SUITE
              </span>
            </ScrollReveal>
            <ScrollReveal variant="heading" delayMs={70}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#002B49] tracking-tight">
                設計を、もっと速く。
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="body" delayMs={140}>
              <p className="text-slate-600 text-base leading-[1.85] font-normal pt-1">
                SOLNEXAは、机上の理論にとどまらず、現場の電気主任技術者や設計者が毎日使える実践的なエンジニアリングツールを自社開発しています。
              </p>
            </ScrollReveal>
          </div>

          {/* Minimal 4-Grid Tools (Quiet thin borders, small icons, no SaaS noise) */}
          <ScrollReveal variant="stagger" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tool 1: PV Array & String */}
            <ScrollRevealItem>
              <div 
                onClick={() => handleLaunchTool('pv-array')}
                className="bg-white rounded-lg border border-slate-200 p-7 hover:border-[#002B49] transition-all cursor-pointer flex flex-col justify-between group h-full shadow-2xs hover:shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-[#002B49]">
                    <Layers className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-base font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                    PV・ストリング設計
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    直並列数算定、開放電圧照合、過積載率150%〜200%最適化計算。
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-[#002B49]">
                  <span>ツールを起動</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </ScrollRevealItem>

            {/* Tool 2: BESS Sizing */}
            <ScrollRevealItem delayMs={60}>
              <div 
                onClick={() => handleLaunchTool('bess-storage')}
                className="bg-white rounded-lg border border-slate-200 p-7 hover:border-[#002B49] transition-all cursor-pointer flex flex-col justify-between group h-full shadow-2xs hover:shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-[#002B49]">
                    <BatteryCharging className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-base font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                    BESSサイジング
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    蓄電容量(MWh)、C-rate、充放電深度(DOD)、消防法保有空地3m算定。
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-[#002B49]">
                  <span>ツールを起動</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </ScrollRevealItem>

            {/* Tool 3: Cable & Voltage Drop */}
            <ScrollRevealItem delayMs={120}>
              <div 
                onClick={() => handleLaunchTool('cable-voltage-drop')}
                className="bg-white rounded-lg border border-slate-200 p-7 hover:border-[#002B49] transition-all cursor-pointer flex flex-col justify-between group h-full shadow-2xs hover:shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-[#002B49]">
                    <Calculator className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-base font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                    ケーブル・電圧降下
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    JIS C 3605準拠、低圧・高圧CVT許容電流および長距離電圧降下。
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-[#002B49]">
                  <span>ツールを起動</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </ScrollRevealItem>

            {/* Tool 4: BOQ & Cost Estimation */}
            <ScrollRevealItem delayMs={180}>
              <div 
                onClick={() => handleLaunchTool('quotation')}
                className="bg-white rounded-lg border border-slate-200 p-7 hover:border-[#002B49] transition-all cursor-pointer flex flex-col justify-between group h-full shadow-2xs hover:shadow-sm"
              >
                <div className="space-y-4">
                  <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-[#002B49]">
                    <FileSpreadsheet className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-base font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                    BOQ・設計計算
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    単線結線図(SLD)連動、主要機器積算、工事費概算シミュレーション。
                  </p>
                </div>
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-[#002B49]">
                  <span>ツールを起動</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </ScrollRevealItem>

          </ScrollReveal>

          {/* Action Link to Workspace */}
          <ScrollReveal variant="cta" delayMs={200}>
            <div className="pt-2 text-center sm:text-left">
              <button
                onClick={onOpenEngineeringTools}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-medium rounded-md transition-colors cursor-pointer shadow-xs"
              >
                <span>統合エンジニアリングワークスペースを開く</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. AI TECHNICAL CONSULT (AI相談 - Calm Asymmetry)                         */}
      {/* ========================================================================= */}
      <section id="ai-consult" className="py-24 sm:py-32 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 space-y-6">
              <ScrollReveal variant="label" delayMs={0}>
                <span className="text-xs font-semibold tracking-[0.2em] text-[#002B49] uppercase font-mono">
                  03 ｜ AI TECHNICAL CONSULT
                </span>
              </ScrollReveal>
              <ScrollReveal variant="heading" delayMs={60}>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#002B49] tracking-tight leading-snug jp-heading">
                  <span className="jp-chunk">技術相談を、</span>
                  <span className="jp-chunk">もっと身近に。</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="body" delayMs={120}>
                <p className="text-slate-600 text-base leading-[1.85] font-normal">
                  消防法告示第2号の保有空地基準、特別高圧受変電の系統連系指針、電気事業法の届出要件など、専門知識が必要な疑問に専門エンジニアの知見をベースとしたAIが即座に回答します。
                </p>
              </ScrollReveal>
              <ScrollReveal variant="cta" delayMs={180}>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('ai-advisor')}
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#002B49] hover:bg-[#001D33] text-white text-xs sm:text-[13px] font-medium rounded-md transition-all shadow-xs cursor-pointer group"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>AIに相談する</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-6">
              <ScrollReveal variant="image" delayMs={80}>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.ambientBg} 
                    alt="SOLNEXA AI Engineering Consultation" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. WORKS (導入実績 - 3 Representative Projects Only)                    */}
      {/* ========================================================================= */}
      <section id="works" className="py-24 sm:py-32 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-16">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-2 max-w-xl">
              <ScrollReveal variant="label" delayMs={0}>
                <span className="text-xs font-semibold tracking-[0.2em] text-[#002B49] uppercase font-mono">
                  04 ｜ TRACK RECORD
                </span>
              </ScrollReveal>
              <ScrollReveal variant="heading" delayMs={60}>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#002B49] tracking-tight">
                  技術が支える、現場の実績。
                </h2>
              </ScrollReveal>
            </div>
            <ScrollReveal variant="cta" delayMs={120}>
              <button
                onClick={() => onNavigateTab('projects')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#002B49] hover:text-[#d81a28] transition-colors cursor-pointer group"
              >
                <span>導入実績一覧を見る</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </ScrollReveal>
          </div>

          {/* 3 Clean Representative Cards */}
          <ScrollReveal variant="stagger" className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Project 1 */}
            <ScrollRevealItem>
              <div 
                onClick={() => onNavigateTab('projects')}
                className="group cursor-pointer space-y-4"
              >
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.bessContainer} 
                    alt="系統用大型蓄電所" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-slate-500 font-mono">
                    特別高圧 66kV ｜ 40MW / 160MWh
                  </div>
                  <h3 className="text-base font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                    福島県相馬市 系統用大型蓄電所
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    消防法保有空地完全適合の液冷蓄電コンテナと特高変電設備を一括納入。
                  </p>
                </div>
              </div>
            </ScrollRevealItem>

            {/* Project 2 */}
            <ScrollRevealItem delayMs={60}>
              <div 
                onClick={() => onNavigateTab('projects')}
                className="group cursor-pointer space-y-4"
              >
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.solarFacility} 
                    alt="産業用メガソーラー" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-slate-500 font-mono">
                    高圧22kV自営線 ｜ 15MW ＋ 30MWh
                  </div>
                  <h3 className="text-base font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                    北海道十勝郡 FIPメガソーラー＋BESS
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    ノンファーム接続における出力制御回避と夜間放電インバランス低減設計。
                  </p>
                </div>
              </div>
            </ScrollRevealItem>

            {/* Project 3 */}
            <ScrollRevealItem delayMs={120}>
              <div 
                onClick={() => onNavigateTab('projects')}
                className="group cursor-pointer space-y-4"
              >
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.rooftopSolarDaylight} 
                    alt="自家消費型コーポレートPPA" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="text-xs text-slate-500 font-mono">
                    オンサイトPPA ｜ 2.4MW 物流施設屋根置
                  </div>
                  <h3 className="text-base font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                    群馬県太田市 物流施設 自家消費型PPA
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal">
                    折板屋根ハゼ締め金具固定による孔開けレス工法と安全遮断保護協調。
                  </p>
                </div>
              </div>
            </ScrollRevealItem>

          </ScrollReveal>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. NEWS (お知らせ - Exactly 3 Clean Lines)                               */}
      {/* ========================================================================= */}
      <section id="news" className="py-24 sm:py-28 bg-[#f8fafc] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-slate-200 pb-6">
            <div className="space-y-2 max-w-xl">
              <ScrollReveal variant="label" delayMs={0}>
                <span className="text-xs font-semibold tracking-[0.2em] text-[#002B49] uppercase font-mono">
                  05 ｜ NEWS &amp; INSIGHTS
                </span>
              </ScrollReveal>
              <ScrollReveal variant="heading" delayMs={60}>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#002B49] tracking-tight">
                  お知らせ・動向
                </h2>
              </ScrollReveal>
            </div>
            <ScrollReveal variant="cta" delayMs={120}>
              <button
                onClick={() => onNavigateTab('news')}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#002B49] hover:text-[#d81a28] transition-colors cursor-pointer group"
              >
                <span>お知らせ一覧へ</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </ScrollReveal>
          </div>

          {/* Minimal 3-Line List */}
          <ScrollReveal variant="body" delayMs={80}>
            <div className="divide-y divide-slate-200 border-t border-b border-slate-200 bg-white rounded-lg overflow-hidden shadow-2xs">
              
              <div 
                onClick={() => onNavigateTab('news')}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <span className="text-xs font-mono text-slate-500 shrink-0">2026.04.15</span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 w-fit">政策・法令</span>
                  <h3 className="text-sm sm:text-base font-medium text-slate-800 group-hover:text-[#002B49] transition-colors">
                    系統用蓄電池の消防法告示第2号における保有空地3m基準と最新自治体指針について
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#002B49] group-hover:translate-x-1 transition-all shrink-0 hidden md:block" />
              </div>

              <div 
                onClick={() => onNavigateTab('news')}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <span className="text-xs font-mono text-slate-500 shrink-0">2026.04.02</span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 w-fit">プレスリリース</span>
                  <h3 className="text-sm sm:text-base font-medium text-slate-800 group-hover:text-[#002B49] transition-colors">
                    クラウド型電気解析ツール「SOLNEXA Engineering Suite」2026年版を公開
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#002B49] group-hover:translate-x-1 transition-all shrink-0 hidden md:block" />
              </div>

              <div 
                onClick={() => onNavigateTab('news')}
                className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                  <span className="text-xs font-mono text-slate-500 shrink-0">2026.03.20</span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0 w-fit">技術動向</span>
                  <h3 className="text-sm sm:text-base font-medium text-slate-800 group-hover:text-[#002B49] transition-colors">
                    特別高圧66kV系統連系における保護継電器協調（OCR/DGR）実務解説レポート
                  </h3>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#002B49] group-hover:translate-x-1 transition-all shrink-0 hidden md:block" />
              </div>

            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. COMPANY (会社概要 - Clean Statement & Direct Modal Link)              */}
      {/* ========================================================================= */}
      <section id="company" className="py-24 sm:py-32 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <ScrollReveal variant="label" delayMs={0}>
                <span className="text-xs font-semibold tracking-[0.2em] text-[#002B49] uppercase font-mono">
                  06 ｜ COMPANY PROFILE
                </span>
              </ScrollReveal>
              <ScrollReveal variant="heading" delayMs={60}>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#002B49] tracking-tight leading-snug jp-heading">
                  <span className="jp-chunk">エネルギーインフラの信頼性を、</span>
                  <br className="hidden sm:inline" />
                  <span className="jp-chunk">妥協なき工学設計で支える。</span>
                </h2>
              </ScrollReveal>
              <ScrollReveal variant="body" delayMs={120}>
                <p className="text-slate-600 text-base leading-[1.85] font-normal max-w-2xl">
                  株式会社ソルネクサ（SOLNEXA）は、東京都荒川区を拠点に、特別高圧・高圧分野における電気主任技術者および系統解析エンジニアが結集した再生可能エネルギー総合技術企業です。太陽光発電および系統用蓄電池の基本設計から系統連系協議、実務ツールの開発まで、プロジェクトの長期的な信頼性を支えます。
                </p>
              </ScrollReveal>
              <ScrollReveal variant="cta" delayMs={180}>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigateTab('company')}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 hover:border-slate-400 text-[#002B49] text-xs sm:text-[13px] font-medium rounded-md transition-colors shadow-2xs cursor-pointer group"
                  >
                    <Building2 className="w-4 h-4 text-slate-500" />
                    <span>会社概要・企業情報を詳しく見る</span>
                    <ArrowRight className="w-4 h-4 text-[#d81a28] group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </ScrollReveal>
            </div>

            <div className="lg:col-span-5">
              <ScrollReveal variant="image" delayMs={80}>
                <div className="relative rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                  <img 
                    src={APP_IMAGES.headerBanner} 
                    alt="SOLNEXA Tokyo Headquarters" 
                    className="w-full h-full object-cover editorial-img-hover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#002B49]/90 via-transparent to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                    <p className="text-xs font-mono text-amber-300 font-medium">SOLNEXA JAPAN HQ</p>
                    <p className="text-xs text-slate-200 mt-0.5">東京都荒川区荒川5-6-7 302号 ｜ TEL: 070-8982-1052</p>
                  </div>
                </div>
              </ScrollReveal>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. CONTACT (Closing CTA - Spacious, Calm & Reassuring)                  */}
      {/* ========================================================================= */}
      <section id="contact" className="py-24 sm:py-32 bg-[#002B49] text-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center space-y-8">
          
          <div className="space-y-4">
            <ScrollReveal variant="label" delayMs={0}>
              <span className="text-xs font-semibold tracking-[0.25em] text-amber-300 uppercase font-mono">
                CONTACT &amp; INQUIRY
              </span>
            </ScrollReveal>
            <ScrollReveal variant="heading" delayMs={60}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
                設計・技術相談、お見積りはこちら。
              </h2>
            </ScrollReveal>
            <ScrollReveal variant="body" delayMs={120}>
              <p className="text-slate-300 text-sm sm:text-base leading-[1.85] font-normal max-w-2xl mx-auto">
                太陽光発電および系統用蓄電池の初期計画、単線結線図(SLD)作図、消防法届出、系統連系協議まで、専門エンジニアが誠意をもってお応えします。
              </p>
            </ScrollReveal>
          </div>

          <ScrollReveal variant="cta" delayMs={180}>
            <div className="pt-4 flex flex-wrap justify-center items-center gap-4">
              <button
                onClick={onOpenContact}
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#d81a28] hover:bg-[#b91522] active:scale-98 text-white text-xs sm:text-sm font-semibold tracking-wider rounded-md transition-all shadow-md cursor-pointer group"
              >
                <Mail className="w-4 h-4" />
                <span>お問い合わせ・見積依頼</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>

              <a
                href="tel:07089821052"
                className="inline-flex items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/15 active:scale-98 text-white border border-white/20 text-xs sm:text-sm font-mono tracking-wider rounded-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4 text-amber-300" />
                <span>TEL: 070-8982-1052</span>
              </a>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* Admin Direct Live CMS Floating Bar */}
      {isAdmin && (
        <AdminEditFloatingBar
          isAdmin={isAdmin}
          adminName={currentUser?.name || 'Hoàng Anh Tuấn'}
          isInlineEditActive={isInlineEditActive}
          onToggleInlineEdit={() => setIsInlineEditActive(prev => !prev)}
          onOpenCustomizer={() => setIsVisualCustomizerOpen(true)}
          onQuickAddButton={() => setIsVisualCustomizerOpen(true)}
          onSaveConfig={handleSaveSiteConfig}
          isSaving={isSavingConfig}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      )}

      {/* Admin Visual Customizer Modal */}
      <AdminVisualCustomizerModal
        isOpen={isVisualCustomizerOpen}
        onClose={() => setIsVisualCustomizerOpen(false)}
        config={siteConfig}
        onChangeConfig={(newCfg) => {
          setSiteConfig(newCfg);
          setHasUnsavedChanges(true);
        }}
        onSaveToServer={handleSaveSiteConfig}
        onResetToDefault={() => {
          setSiteConfig(DEFAULT_SITE_CONFIG);
          setHasUnsavedChanges(true);
        }}
      />

    </div>
  );
};
