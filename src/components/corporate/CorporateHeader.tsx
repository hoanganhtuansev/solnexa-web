import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ArrowUpRight, 
  LogOut, 
  ChevronRight, 
  ArrowRight,
  Layers, 
  BatteryCharging, 
  Calculator, 
  FileSpreadsheet, 
  Sparkles, 
  Building2,
  Mail,
  HelpCircle,
  FileDown,
  Users,
  Globe,
  Bell,
  CheckCircle2,
  Download,
  Lock
} from 'lucide-react';
import { SolnexaLogo } from './SolnexaLogo';
import { APP_IMAGES } from '../solarAssets';

export type CorporateTab = 
  | 'home' 
  | 'solutions' 
  | 'knowledge' 
  | 'products' 
  | 'projects' 
  | 'news' 
  | 'ai-advisor';

interface CorporateHeaderProps {
  currentTab: CorporateTab | 'tools-workspace';
  onNavigateTab: (tab: CorporateTab, subTab?: string) => void;
  onOpenEngineeringTools: () => void;
  onOpenEngineeringTool?: (view: any, projectId?: string) => void;
  onOpenLogin: () => void;
  onOpenContact: () => void;
  onOpenDesignQuotation?: () => void;
  onOpenCompanyProfile?: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  currentUser?: any;
  onAskAiPrompt?: (prompt: string) => void;
}

export const CorporateHeader: React.FC<CorporateHeaderProps> = ({
  currentTab,
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenEngineeringTool,
  onOpenLogin,
  onOpenContact,
  onOpenDesignQuotation,
  onOpenCompanyProfile,
  onLogout,
  isLoggedIn = false,
  currentUser,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [activeLang, setActiveLang] = useState<'JP' | 'EN'>('JP');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isAdmin = Boolean(currentUser?.isAdmin);

  const handleMouseEnter = (itemId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveDropdown(itemId);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 280);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const handleNavClick = (target: string) => {
    setIsMobileMenuOpen(false);
    setActiveDropdown(null);

    if (target === 'business') {
      if (currentTab === 'home') {
        const el = document.getElementById('business');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigateTab('home');
        setTimeout(() => {
          const el = document.getElementById('business');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
      return;
    }

    if (target === 'works') {
      if (currentTab === 'home') {
        const el = document.getElementById('works');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigateTab('home');
        setTimeout(() => {
          const el = document.getElementById('works');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
      return;
    }

    if (target === 'tools') {
      if (currentTab === 'home') {
        const el = document.getElementById('tools');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else onOpenEngineeringTools();
      } else {
        onOpenEngineeringTools();
      }
      return;
    }

    if (target === 'ai-consult') {
      onNavigateTab('ai-advisor');
      return;
    }

    if (target === 'news') {
      if (currentTab === 'home') {
        const el = document.getElementById('news');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        onNavigateTab('news');
      }
      return;
    }

    if (target === 'company') {
      if (onOpenCompanyProfile) {
        onOpenCompanyProfile();
      } else {
        const el = document.getElementById('company');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
  };

  const handleLaunchSpecificTool = (toolId: string) => {
    setActiveDropdown(null);
    if (onOpenEngineeringTool) {
      onOpenEngineeringTool(toolId);
    } else {
      onOpenEngineeringTools();
    }
  };

  // Main Nav Items in Japanese (Bilingual stacked for authentic Japanese corporate look)
  const navMenuItems = [
    { id: 'business', label: '私たちについて', enLabel: 'ABOUT US', hasPopup: true },
    { id: 'works', label: '実績紹介', enLabel: 'WORKS', hasPopup: true },
    { id: 'tools', label: '設計ツール', enLabel: 'TOOLS', isTools: true, hasPopup: true },
    { id: 'ai-consult', label: 'AI技術相談', enLabel: 'AI CONSULT', hasPopup: false },
    { id: 'news', label: 'お知らせ', enLabel: 'NEWS', hasPopup: true },
    { id: 'company', label: '企業情報', enLabel: 'COMPANY', hasPopup: true },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 transition-all font-sans shadow-xs">
      
      {/* ========================================================================= */}
      {/* 1. TOP UTILITY ROW (Chuẩn Solar Frontier: サポート お知らせ カタログ... )   */}
      {/* ========================================================================= */}
      <div className="bg-[#f8fafc] border-b border-slate-200/90 hidden sm:block text-[11px] text-slate-600">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-8 flex items-center justify-between">
          
          {/* Left: Brand tag line */}
          <div className="flex items-center gap-2 font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#002B49]" />
            <span className="font-mono tracking-wider text-[10px] text-[#002B49] uppercase">
              SOLNEXA JAPAN ｜ 太陽光・系統用蓄電池 総合エンジニアリング
            </span>
          </div>

          {/* Right: Exact Solar Frontier Utility Links */}
          <div className="flex items-center gap-4 lg:gap-5 font-normal">
            <button
              onClick={onOpenContact}
              className="hover:text-[#002B49] transition-colors cursor-pointer flex items-center gap-1"
              title="技術サポート・お問い合わせ"
            >
              <span>サポート</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => {
                if (currentTab === 'home') {
                  const el = document.getElementById('news');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  onNavigateTab('news');
                }
              }}
              className="hover:text-[#002B49] transition-colors cursor-pointer"
            >
              お知らせ
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="hover:text-[#002B49] transition-colors cursor-pointer flex items-center gap-1"
              title="技術カタログ・仕様書PDFダウンロード"
            >
              <FileDown className="w-3 h-3 text-[#002B49]" />
              <span>カタログダウンロード</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsRecruitModalOpen(true)}
              className="hover:text-[#002B49] transition-colors cursor-pointer"
            >
              採用情報
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setIsPartnerModalOpen(true)}
              className="hover:text-[#002B49] transition-colors cursor-pointer"
            >
              販売店サイト
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveLang(activeLang === 'JP' ? 'EN' : 'JP')}
              className="font-mono text-slate-500 hover:text-[#002B49] transition-colors cursor-pointer flex items-center gap-1"
              title="言語切り替え / Switch Language"
            >
              <span className={activeLang === 'JP' ? 'font-bold text-[#002B49]' : 'text-slate-400'}>JP</span>
              <span className="text-slate-300">/</span>
              <span className={activeLang === 'EN' ? 'font-bold text-[#002B49]' : 'text-slate-400'}>EN</span>
            </button>

            {/* Auth status if logged in */}
            {isLoggedIn && currentUser && (
              <>
                <span className="text-slate-300">|</span>
                <span className="text-[#002B49] font-medium flex items-center gap-1">
                  {currentUser.name}
                  {isAdmin && <span className="text-[9px] bg-slate-200 px-1 rounded">ADMIN</span>}
                  {onLogout && (
                    <button onClick={onLogout} title="ログアウト" className="text-slate-400 hover:text-slate-600 ml-1">
                      <LogOut className="w-3 h-3" />
                    </button>
                  )}
                </span>
              </>
            )}
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MAIN NAVIGATION ROW (74px)                                             */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 h-18 sm:h-20 flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => {
              onNavigateTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center text-left focus:outline-hidden cursor-pointer group"
            title="SOLNEXA Japan - 太陽光・系統用蓄電池総合エンジニアリング"
          >
            <SolnexaLogo size="md" variant="horizontal" showSlogan={false} />
          </button>
        </div>

        {/* Desktop Bilingual Navigation (Chuẩn Solar Frontier: Tiếng Nhật chính + Tiếng Anh phụ) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 h-full">
          {navMenuItems.map((item) => {
            const isHovered = activeDropdown === item.id;
            return (
              <div
                key={item.id}
                className="h-full flex items-center"
                onMouseEnter={() => item.hasPopup ? handleMouseEnter(item.id) : undefined}
                onMouseLeave={item.hasPopup ? handleMouseLeave : undefined}
              >
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`py-2 px-1 relative flex flex-col items-start cursor-pointer group text-left transition-colors ${
                    isHovered ? 'text-[#002B49]' : 'text-slate-800 hover:text-[#002B49]'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13.5px] xl:text-[14.5px] font-semibold tracking-tight transition-colors">
                      {item.label}
                    </span>
                    {item.isTools && (
                      <span className="text-[9px] font-mono font-bold bg-[#002B49] text-amber-300 px-1 py-0.2 rounded-xs leading-none">
                        PRO
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-mono tracking-widest uppercase transition-colors ${
                    isHovered ? 'text-[#d81a28] font-medium' : 'text-slate-400 group-hover:text-slate-600'
                  }`}>
                    {item.enLabel}
                  </span>

                  {/* Active indicator red line */}
                  <span className={`absolute bottom-0 left-0 h-[2.5px] bg-[#d81a28] transition-all duration-300 ${
                    isHovered ? 'w-full' : 'w-0'
                  }`} />
                </button>
              </div>
            );
          })}
        </nav>

        {/* Right Action CTAs (Solar Frontier Style: Mail Inquiries + Quote Button) */}
        <div className="hidden lg:flex items-center gap-3.5 xl:gap-4">
          
          {/* お問い合わせ・資料請求 (Red link with mail icon as in Solar Frontier) */}
          <button
            onClick={onOpenContact}
            className="inline-flex items-center gap-1.5 text-xs xl:text-sm font-semibold text-[#d81a28] hover:text-[#b91522] transition-colors py-2 px-1.5 cursor-pointer group"
          >
            <Mail className="w-4 h-4 text-[#d81a28]" />
            <span className="whitespace-nowrap">お問い合わせ・資料請求</span>
          </button>

          {/* Prominent Action Button: 設計見積書 (Nổi bật, thu hút) */}
          <button
            onClick={onOpenDesignQuotation || onOpenContact}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#d81a28] hover:bg-[#b91522] active:scale-98 text-white text-xs xl:text-sm font-bold tracking-wider rounded-md transition-all shadow-md hover:shadow-lg cursor-pointer group"
            title="無料・設計見積書作成"
          >
            <span className="text-amber-300 font-normal text-[11px] bg-red-900/30 px-1 rounded-xs">無料</span>
            <span>設計見積書</span>
            <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

        </div>

        {/* Mobile Hamburger & Quick CTA */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={onOpenDesignQuotation || onOpenContact}
            className="px-3 py-1.5 bg-[#d81a28] text-white text-xs font-bold rounded transition-colors"
          >
            設計見積
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-700 hover:text-[#002B49] focus:outline-hidden cursor-pointer"
            aria-label="メニューを開く"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SOLAR FRONTIER STYLE HOVER POPUPS (Smooth Animated Slide-down with Easing) */}
      {/* ========================================================================= */}

      {/* 1. 私たちについて (ABOUT US - 3 Domains: 設計 / 施工支援 / シミュレーション) */}
      <div
        onMouseEnter={() => handleMouseEnter('business')}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-full left-0 w-full bg-white border-b border-slate-200/90 shadow-2xl z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:w-full before:h-3 ${
          activeDropdown === 'business'
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
              <span className="text-xs font-bold tracking-widest text-[#002B49] uppercase font-mono">
                私たちについて ｜ 3つの事業領域
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                太陽光・系統用蓄電池の基本計画から受変電設計、施工支援、運用解析まで、技術で支える3領域
              </span>
            </div>
            <button
              onClick={() => handleNavClick('business')}
              className="text-xs font-semibold text-[#002B49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>事業内容の詳細を見る</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Item 1: 設計 */}
            <div
              onClick={() => handleNavClick('business')}
              className="group cursor-pointer space-y-3 p-3.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all"
            >
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                <img
                  src={APP_IMAGES.cleanWhiteSubstation}
                  alt="01 設計 / DESIGN"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#002B49] font-bold">01 設計 / DESIGN</span>
                  <span className="text-[10px] text-slate-400 font-mono">受変電・アレイ</span>
                </div>
                <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                  特別高圧・高圧受変電 &amp; アレイ設計
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  JIS C 3605規格ケーブル最適選定、JIS C 8955耐風圧架台力学計算、単線結線図CAD作図。
                </p>
              </div>
            </div>

            {/* Item 2: 施工支援 */}
            <div
              onClick={() => handleNavClick('business')}
              className="group cursor-pointer space-y-3 p-3.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all"
            >
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                <img
                  src={APP_IMAGES.cleanBessFacility}
                  alt="02 施工支援 / CONSTRUCTION SUPPORT"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#002B49] font-bold">02 施工支援 / SUPPORT</span>
                  <span className="text-[10px] text-slate-400 font-mono">法規・現場管理</span>
                </div>
                <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                  消防法協議 &amp; 電事法工事計画届出
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  総務省消防庁告示第2号保有空地3m協議、経済産業省第48条届出書類作成支援。
                </p>
              </div>
            </div>

            {/* Item 3: シミュレーション */}
            <div
              onClick={() => handleNavClick('business')}
              className="group cursor-pointer space-y-3 p-3.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all"
            >
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                <img
                  src={APP_IMAGES.smartEmsDaylight}
                  alt="03 シミュレーション / SIMULATION"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#002B49] font-bold">03 シミュレーション / SIM</span>
                  <span className="text-[10px] text-slate-400 font-mono">発電PR・20年解析</span>
                </div>
                <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                  発電量PR解析 &amp; 充放電シミュレーション
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  気象データ連携、日影損失解析、FIP市場・容量市場20年計画シミュレーション。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. WORKS POPUP */}
      <div
        onMouseEnter={() => handleMouseEnter('works')}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-full left-0 w-full bg-white border-b border-slate-200/90 shadow-2xl z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:w-full before:h-3 ${
          activeDropdown === 'works'
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
              <span className="text-xs font-bold tracking-widest text-[#002B49] uppercase font-mono">
                WORKS ｜ 実績紹介
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                全国における特別高圧メガソーラーおよび系統用蓄電池の実務実績
              </span>
            </div>
            <button
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('projects');
              }}
              className="text-xs font-semibold text-[#002B49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>導入実績一覧を見る</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('projects');
              }}
              className="group cursor-pointer space-y-3 p-3.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all"
            >
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                <img
                  src={APP_IMAGES.bessContainer}
                  alt="系統用大型蓄電所"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">福島県相馬市 ｜ 特高66kV</span>
                <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                  40MW / 160MWh 系統用大型蓄電所
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  消防法告示第2号完全適合の液冷蓄電コンテナ40台と特高変電設備。
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('projects');
              }}
              className="group cursor-pointer space-y-3 p-3.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all"
            >
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                <img
                  src={APP_IMAGES.solarFacility}
                  alt="産業用メガソーラー"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">北海道十勝郡 ｜ 高圧22kV自営線</span>
                <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                  15MW 太陽光 ＋ 30MWh 蓄電池複合所
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  ノンファーム接続における出力制御回避とインバランス低減。
                </p>
              </div>
            </div>

            <div
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('projects');
              }}
              className="group cursor-pointer space-y-3 p-3.5 rounded-lg border border-transparent hover:border-slate-200 hover:bg-slate-50/80 transition-all"
            >
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 aspect-16/10">
                <img
                  src={APP_IMAGES.rooftopSolarDaylight}
                  alt="自家消費型PPA"
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 font-semibold">群馬県太田市 ｜ オンサイトPPA</span>
                <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                  2.4MW 物流施設屋根置 自家消費PPA
                </h4>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                  折板屋根ハゼ締め金具固定による孔開けレス工法と安全遮断。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOOLS POPUP */}
      <div
        onMouseEnter={() => handleMouseEnter('tools')}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-full left-0 w-full bg-white border-b border-slate-200/90 shadow-2xl z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:w-full before:h-3 ${
          activeDropdown === 'tools'
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
              <span className="text-xs font-bold tracking-widest text-[#002B49] uppercase font-mono">
                ENGINEERING TOOLS ｜ 実務ツール群
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                現場の電気主任技術者が毎日使える実践的な計算・設計CAD
              </span>
            </div>
            <button
              onClick={() => {
                setActiveDropdown(null);
                onOpenEngineeringTools();
              }}
              className="text-xs font-semibold text-[#002B49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>統合ワークスペースを起動</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div
              onClick={() => handleLaunchSpecificTool('pv-array')}
              className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#002B49] transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-[#002B49] mb-3">
                <Layers className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                PV・ストリング設計
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                直並列数算定、開放電圧照合、過積載率最適化計算。
              </p>
              <span className="text-[11px] font-medium text-[#002B49] mt-3 inline-flex items-center gap-1">
                <span>ツールを起動</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div
              onClick={() => handleLaunchSpecificTool('bess-storage')}
              className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#002B49] transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-[#002B49] mb-3">
                <BatteryCharging className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                BESSサイジング
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                蓄電容量(MWh)、C-rate、消防法保有空地3m算定。
              </p>
              <span className="text-[11px] font-medium text-[#002B49] mt-3 inline-flex items-center gap-1">
                <span>ツールを起動</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div
              onClick={() => handleLaunchSpecificTool('cable-voltage-drop')}
              className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#002B49] transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-[#002B49] mb-3">
                <Calculator className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                ケーブル・電圧降下
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                JIS C 3605規格準拠、低圧・高圧CVT許容電流計算。
              </p>
              <span className="text-[11px] font-medium text-[#002B49] mt-3 inline-flex items-center gap-1">
                <span>ツールを起動</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>

            <div
              onClick={() => handleLaunchSpecificTool('quotation')}
              className="p-5 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#002B49] transition-all cursor-pointer group"
            >
              <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-[#002B49] mb-3">
                <FileSpreadsheet className="w-4 h-4 text-slate-700" />
              </div>
              <h4 className="text-sm font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors">
                BOQ・設計計算
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed font-normal">
                単線結線図(SLD)連動、機器積算、工事費内訳算出。
              </p>
              <span className="text-[11px] font-medium text-[#002B49] mt-3 inline-flex items-center gap-1">
                <span>ツールを起動</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. NEWS POPUP */}
      <div
        onMouseEnter={() => handleMouseEnter('news')}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-full left-0 w-full bg-white border-b border-slate-200/90 shadow-2xl z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:w-full before:h-3 ${
          activeDropdown === 'news'
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
              <span className="text-xs font-bold tracking-widest text-[#002B49] uppercase font-mono">
                NEWS ｜ お知らせ・プレスリリース
              </span>
              <span className="text-xs text-slate-500 hidden sm:inline">
                技術更新、プロジェクト進捗、法規対応レポートの最新情報
              </span>
            </div>
            <button
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('news');
              }}
              className="text-xs font-semibold text-[#002B49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>お知らせ一覧を見る</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('news');
              }}
              className="p-4 rounded-lg border border-slate-200 hover:border-[#002B49] hover:bg-slate-50/50 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">2026.09.28</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded-xs">技術発表</span>
              </div>
              <h4 className="text-xs font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors leading-snug">
                福島県相馬市 40MW/160MWh 系統用蓄電所の特高連系設計を完了
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                特別高圧66kV受変電設備と告示第2号保有空地設計を最適化し一般送配電事業者との協議を妥結。
              </p>
            </div>

            <div
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('news');
              }}
              className="p-4 rounded-lg border border-slate-200 hover:border-[#002B49] hover:bg-slate-50/50 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">2026.09.15</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 rounded-xs">プロダクト</span>
              </div>
              <h4 className="text-xs font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors leading-snug">
                クラウド型電気設計ツール「SOLNEXA TOOLS」Ver 3.2を公開
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                JIS C 3605規格ケーブル計算および消防法保有空地自動検証機能を追加しました。
              </p>
            </div>

            <div
              onClick={() => {
                setActiveDropdown(null);
                onNavigateTab('news');
              }}
              className="p-4 rounded-lg border border-slate-200 hover:border-[#002B49] hover:bg-slate-50/50 transition-all cursor-pointer space-y-2 group"
            >
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-slate-400">2026.08.30</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-900 rounded-xs">法規レポート</span>
              </div>
              <h4 className="text-xs font-semibold text-[#002B49] group-hover:text-[#d81a28] transition-colors leading-snug">
                消防法告示第2号「保有空地3m離隔協議」実務ガイドライン策定
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                全国自治体消防との事前協議実績に基づき、蓄電池コンテナ配置の標準仕様をとりまとめました。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. COMPANY POPUP (企業情報) */}
      <div
        onMouseEnter={() => handleMouseEnter('company')}
        onMouseLeave={handleMouseLeave}
        className={`absolute top-full left-0 w-full bg-white border-b border-slate-200/90 shadow-2xl z-50 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform origin-top before:content-[''] before:absolute before:-top-3 before:left-0 before:w-full before:h-3 ${
          activeDropdown === 'company'
            ? 'opacity-100 translate-y-0 visible pointer-events-auto'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
                <span className="text-xs font-bold tracking-widest text-[#002B49] uppercase font-mono">
                  COMPANY PROFILE ｜ 企業情報
                </span>
              </div>
              <h4 className="text-lg font-bold text-[#002B49]">
                株式会社ソルネクサ (SOLNEXA Japan Co., Ltd.)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-normal max-w-xl">
                特別高圧・高圧分野における電気主任技術者および系統解析エンジニアが結集した再生可能エネルギー総合技術企業です。
                本社：東京都荒川区荒川5-6-7 302号 ｜ TEL: 070-8982-1052
              </p>
              <div className="pt-1 flex items-center gap-4">
                <button
                  onClick={() => {
                    setActiveDropdown(null);
                    if (onOpenCompanyProfile) onOpenCompanyProfile();
                    else handleNavClick('company');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#002B49] text-white text-xs font-semibold rounded-md hover:bg-[#001D33] transition-colors cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>会社概要・基本データを詳しく見る</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-lg overflow-hidden border border-slate-200 aspect-16/9 bg-slate-100">
                <img
                  src={APP_IMAGES.headerBanner}
                  alt="SOLNEXA Tokyo Headquarters"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-18 bg-white border-b border-slate-200 p-6 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col divide-y divide-slate-100">
            {navMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="py-3.5 flex items-center justify-between text-left text-sm font-medium text-slate-800 hover:text-[#002B49] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span>{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-400">({item.enLabel})</span>
                  {item.isTools && (
                    <span className="text-[10px] bg-amber-400 text-slate-900 font-bold px-1 rounded-xs">
                      PRO
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}
          </nav>

          <div className="pt-2 space-y-2.5">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                if (onOpenDesignQuotation) onOpenDesignQuotation();
                else onOpenContact();
              }}
              className="w-full py-3 bg-[#d81a28] text-white text-xs font-bold tracking-wider rounded-md text-center cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
            >
              <span className="text-amber-300 font-normal">無料</span>
              <span>設計見積依頼</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full py-2.5 border border-slate-300 text-slate-700 text-xs font-medium rounded-md text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#d81a28]" />
              <span>お問い合わせ・資料請求</span>
            </button>
          </div>
        </div>
      )}

      {/* Recruitment Modal info */}
      {isRecruitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#002B49]" />
                <h3 className="text-base font-bold text-[#002B49]">SOLNEXA 採用情報</h3>
              </div>
              <button onClick={() => setIsRecruitModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">
                特別高圧・高圧電気主任技術者および系統解析エンジニアを募集しています。
              </p>
              <p>
                SOLNEXAは、系統用蓄電池（BESS）や産業用メガソーラーの最先端技術実務に挑戦できるプロフェッショナル集団です。
              </p>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <p><strong>勤務地:</strong> 東京都荒川区（本社）/ リモート併用可</p>
                <p><strong>必須資格・経験:</strong> 第一種・第二種電気主任技術者、または系統解析・CAD設計経験</p>
                <p><strong>給与待遇:</strong> 経験・能力を考慮の上、優遇いたします</p>
              </div>
            </div>
            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setIsRecruitModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-md"
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  setIsRecruitModalOpen(false);
                  onOpenContact();
                }}
                className="px-4 py-2 bg-[#002B49] text-white text-xs font-bold rounded-md hover:bg-[#001D33]"
              >
                採用について問い合わせる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Catalog Download Modal */}
      {isCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-7 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <FileDown className="w-5 h-5 text-[#d81a28]" />
                <h3 className="text-base font-bold text-[#002B49]">技術資料・カタログダウンロード</h3>
              </div>
              <button onClick={() => { setIsCatalogModalOpen(false); setDownloadSuccess(null); }} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {downloadSuccess ? (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-lg text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-900">ダウンロードの準備が整いました</h4>
                <p className="text-xs text-emerald-700">{downloadSuccess} のPDFを保存しました。</p>
                <button
                  onClick={() => setDownloadSuccess(null)}
                  className="mt-3 px-4 py-1.5 bg-emerald-700 text-white text-xs font-medium rounded-md hover:bg-emerald-800"
                >
                  他の資料を見る
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600">
                  SOLNEXAのエンジニアリング仕様書および最新製品カタログPDFを無料ダウンロードいただけます。
                </p>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-lg border border-slate-200 hover:border-[#002B49] bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-[#002B49] font-bold">2026年最新版 ｜ PDF 18.4MB</span>
                      <h4 className="text-xs font-bold text-slate-800">SOLNEXA 総合エンジニアリングカタログ</h4>
                      <p className="text-[11px] text-slate-500">特高受変電・系統用蓄電池・シミュレーションの実務概要</p>
                    </div>
                    <button
                      onClick={() => setDownloadSuccess('SOLNEXA 総合エンジニアリングカタログ 2026')}
                      className="px-3 py-1.5 bg-[#002B49] text-white text-xs font-semibold rounded hover:bg-[#001D33] shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DL</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 hover:border-[#002B49] bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-[#002B49] font-bold">技術仕様書 ｜ PDF 12.1MB</span>
                      <h4 className="text-xs font-bold text-slate-800">系統用蓄電池(BESS) 消防法・特高連系設計基準書</h4>
                      <p className="text-[11px] text-slate-500">告示第2号保有空地3m離隔指針・電事法48条届出フロー</p>
                    </div>
                    <button
                      onClick={() => setDownloadSuccess('系統用蓄電池(BESS) 消防法・特高連系設計基準書')}
                      className="px-3 py-1.5 bg-[#002B49] text-white text-xs font-semibold rounded hover:bg-[#001D33] shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DL</span>
                    </button>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 hover:border-[#002B49] bg-slate-50/60 hover:bg-white transition-all flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-mono text-[#002B49] font-bold">CAD/計算ツール ｜ PDF 8.6MB</span>
                      <h4 className="text-xs font-bold text-slate-800">SOLNEXA TOOLS クラウド機能紹介 &amp; 計算例</h4>
                      <p className="text-[11px] text-slate-500">JIS C 3605ケーブル許容電流・JIS C 8955耐風圧計算例</p>
                    </div>
                    <button
                      onClick={() => setDownloadSuccess('SOLNEXA TOOLS クラウド機能紹介 & 計算例')}
                      className="px-3 py-1.5 bg-[#002B49] text-white text-xs font-semibold rounded hover:bg-[#001D33] shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>DL</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-between items-center border-t border-slate-100 text-xs">
              <span className="text-slate-400 text-[11px]">個別特注設計書のご相談はお問い合わせへ</span>
              <button
                onClick={() => {
                  setIsCatalogModalOpen(false);
                  onOpenContact();
                }}
                className="text-[#d81a28] font-bold hover:underline"
              >
                お問い合わせ・資料請求はこちら
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Partner / Dealer Portal Modal */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs font-sans">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-5 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#002B49]" />
                <h3 className="text-base font-bold text-[#002B49]">販売店・認定パートナー専用サイト</h3>
              </div>
              <button onClick={() => setIsPartnerModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p>
                SOLNEXA提携EPCパートナー、機器販売店、特約店様向けの専用ポータルです。
                設計単価表、CADシンボルライブラリ、最新の機器在庫状況をご照会いただけます。
              </p>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                アカウントをお持ちでない販売店様は、事務局（070-8982-1052）または下記のお問い合わせより加盟登録をご申請ください。
              </div>

              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">パートナーID / メールアドレス</label>
                  <input
                    type="text"
                    placeholder="partner@example.co.jp"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-hidden focus:border-[#002B49]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">パスワード</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-xs focus:outline-hidden focus:border-[#002B49]"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center gap-3">
              <button
                onClick={() => {
                  setIsPartnerModalOpen(false);
                  onOpenContact();
                }}
                className="text-xs text-slate-500 hover:text-[#002B49] underline"
              >
                新規パートナー加盟申請
              </button>
              <button
                onClick={() => {
                  setIsPartnerModalOpen(false);
                  onOpenLogin();
                }}
                className="px-4 py-2 bg-[#002B49] text-white text-xs font-bold rounded-md hover:bg-[#001D33]"
              >
                ログイン
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};
