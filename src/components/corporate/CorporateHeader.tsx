import React, { useState, useRef, useEffect } from 'react';
import { 
  Phone, 
  Mail, 
  User, 
  Sparkles, 
  Cpu, 
  Menu, 
  X, 
  ChevronRight,
  LogOut,
  Zap,
  BatteryCharging,
  Sun,
  Building,
  Building2,
  Calculator,
  FileSpreadsheet,
  Layers,
  Activity,
  FileText,
  Sliders,
  ShieldCheck,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { SolnexaLogo } from './SolnexaLogo';
import { ProjectSubView } from '../Sidebar';

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
  onOpenEngineeringTool?: (view: ProjectSubView, projectId?: string) => void;
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
  onAskAiPrompt
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
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
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  // OPTION 2: 5 Streamlined, High-Level Focus Groups (No redundant items, no cramped wrapping)
  const navItems: { id: CorporateTab | 'tools'; label: string; hasDropdown: boolean; isSpecial?: boolean }[] = [
    { id: 'solutions', label: 'ソリューション・製品', hasDropdown: true },
    { id: 'tools', label: '設計ツール', hasDropdown: true, isSpecial: true },
    { id: 'projects', label: '導入実績', hasDropdown: true },
    { id: 'knowledge', label: 'ナレッジ・法令', hasDropdown: true },
    { id: 'ai-advisor', label: 'AI技術相談', hasDropdown: true },
  ];

  // 1. Solutions Items
  const solutionsSubItems = [
    {
      id: 'grid',
      title: '特別高圧・高圧受変電 & 系統連系協調',
      desc: '一般送配電事業者との連系協議、保護継電器整定、工事計画届出を一括支援',
      icon: Zap,
      badge: '特高66kV/22kV'
    },
    {
      id: 'bess',
      title: '系統用蓄電システム (Grid-Scale BESS)',
      desc: '容量市場・需給調整市場・JEPX裁定取引に最適化された大型蓄電所ソリューション',
      icon: BatteryCharging,
      badge: '液冷3.72MWh'
    },
    {
      id: 'solar',
      title: '産業用メガソーラー & FIP蓄電池併設',
      desc: '過積載設計と蓄電池併設によるインバランス低減・再エネ最大活用モデル',
      icon: Sun,
      badge: '過積載150%'
    },
    {
      id: 'ppa',
      title: '自家消費型・コーポレートPPA',
      desc: '企業のScope 2削減、RE100達成、電気代高騰ヘッジを可能にする屋根置きPV',
      icon: Building,
      badge: 'ハゼ締め折板'
    },
    {
      id: 'ems',
      title: '遠隔監視 & AIスマートEMS',
      desc: '気象予測・JEPX市場価格連動による充放電スケジュール自動最適化',
      icon: Cpu,
      badge: 'AI自動最適化'
    }
  ];

  // Products Highlights
  const productsSubItems = [
    {
      name: '系統用蓄電池コンテナ (CATL / BYD 液冷 3.72MWh〜5MWh)',
      tag: 'BESSコンテナ',
      spec: '液冷制御・長寿命8,000サイクル・IEC62933認証'
    },
    {
      name: '特高・高圧パワコン (PCS / Sungrow / Huawei)',
      tag: '高圧・特高PCS',
      spec: '変換効率99%・系統安定化機能（FRT/無効電力制御）'
    },
    {
      name: '超高効率N型TOPCon / HJT 太陽光モジュール (620W〜720W)',
      tag: '高出力モジュール',
      spec: '変換効率22.8%以上・両面発電係数85%'
    },
    {
      name: '特高・高圧受変電キュービクル設備一式',
      tag: '受変電設備',
      spec: 'VCB・特高トランス・保護継電器盤・工事計画届出標準準拠'
    }
  ];

  // 2. Engineering Tools (Trang chuyên sâu)
  const engineeringToolItems: {
    id: ProjectSubView;
    title: string;
    vnTitle: string;
    desc: string;
    icon: any;
    badge: string;
  }[] = [
    {
      id: 'schematic',
      title: '単線結線図 (SLD) CAD作図',
      vnTitle: 'Vẽ sơ đồ đơn tuyến SLD & CAD',
      desc: '特高66kV/22kV/6.6kV受変電・受電点・保護協調の単線結線図自動作成・CAD出力',
      icon: Layers,
      badge: 'SLD CAD'
    },
    {
      id: 'bess-storage',
      title: '系統用蓄電池 (BESS) サイジング',
      vnTitle: 'Tính toán dung lượng Pin & BESS',
      desc: '蓄電容量 (MWh/MW)、C-rate、充放電深度(DOD)、消防法保有空地3m算定',
      icon: BatteryCharging,
      badge: 'BESS 3.72MWh'
    },
    {
      id: 'pv-array',
      title: 'PVアレイ & ストリング直並列設計',
      vnTitle: 'Thiết kế chuỗi String & Mảng PV',
      desc: 'モジュール直並列数、開放電圧・動作電圧照合、過積載率150%〜200%最適化',
      icon: Sun,
      badge: 'Overloading'
    },
    {
      id: 'cable-voltage-drop',
      title: '幹線ケーブル許容電流・電圧降下',
      vnTitle: 'Tính cáp & Sụt áp đường dây',
      desc: '内線規程・JIS C 3605準拠、低圧・高圧CVTケーブル許容電流・長距離電圧降下シミュレーション',
      icon: Calculator,
      badge: 'JIS C 3605'
    },
    {
      id: 'transformer',
      title: '特高受変電・変圧器容量サイジング',
      vnTitle: 'Chọn dung lượng máy biến áp Trạm biến áp',
      desc: '契約電力、設備容量、変圧器インピーダンス・％インピーダンス・短絡容量計算',
      icon: Zap,
      badge: '66kV/22kV'
    },
    {
      id: 'simulation',
      title: '年間発電量 & 総合損失シミュレーション',
      vnTitle: 'Mô phỏng sản lượng điện & Suy hao',
      desc: 'METI日射量データ、アレイ影損失、インバータ効率、年間総合PR値算出',
      icon: Activity,
      badge: 'PR Analysis'
    },
    {
      id: 'quotation',
      title: 'EPC工事費・機器積算見積 (BOQ)',
      vnTitle: 'Bóc tách khối lượng BOQ & Dự toán EPC',
      desc: 'モジュール・PCS・架台・土木・受変電・連系負担金の一括積算シミュレーター',
      icon: FileSpreadsheet,
      badge: 'BOQ EPC'
    },
    {
      id: 'protection',
      title: '保護継電器整定 & 系統協調 (OCR/DGR)',
      vnTitle: 'Phối hợp bảo vệ rơ-le & Đấu nối lưới',
      desc: '電力会社受変電指針に準拠した過電流・地絡保護協調曲線の確認・整定計算',
      icon: Sliders,
      badge: 'Relay Study'
    }
  ];

  // 3. Projects Items
  const projectsSubItems = [
    {
      title: '北海道・九州 特別高圧 50MW / 200MWh 系統用蓄電所',
      type: '系統用蓄電池',
      scale: '特別高圧66kV'
    },
    {
      title: '関東エリア 35MW 産業用メガソーラー＆自営線22kV工事',
      type: 'メガソーラー',
      scale: '高圧22kV自営線'
    },
    {
      title: '関西・中部 大規模物流センター屋根置き自家消費型PPA (3.2MW)',
      type: '自家消費PPA',
      scale: 'ハゼ締め折板工法'
    },
    {
      title: '港湾コンテナターミナル マイクログリッド連系・系統協調実証',
      type: 'スマートEMS',
      scale: '逆潮流制御・ピークカット'
    }
  ];

  // 4. Combined Knowledge & Regulations & Policy News
  const knowledgeSubItems = [
    {
      category: '消防法・安全基準',
      title: '系統用蓄電池の保有空地3m基準と緩和条件（総務省消防庁告示第2号）',
      tag: '消防法告示第2号',
      icon: ShieldCheck
    },
    {
      category: '電力市場・FIP制度',
      title: 'FIP制度における太陽光＋蓄電池併設モデルとJEPX・需給調整市場取引',
      tag: 'FIP/容量市場',
      icon: Activity
    },
    {
      category: '法令許認可・電事法',
      title: '電気事業法第48条に基づく工事計画届出の実務要領と提出書類チェックシート',
      tag: '電事法第48条',
      icon: FileText
    },
    {
      category: '系統連系技術指針',
      title: '66kV特別高圧受変電設備の受電点協調と一般送配電事業者との事前協議要件',
      tag: '特高66kV連系',
      icon: Zap
    }
  ];

  // 5. AI Advisor prompts
  const aiAdvisorPrompts = [
    '系統用蓄電池の消防法上の保有空地3m基準と緩和条件を教えて',
    'FIP制度で太陽光に蓄電池を併設した場合のJEPXアービトラージ収益性は？',
    '特別高圧（66kV）受変電設備の単線結線図（SLD）設計の重要ポイント',
    '電気事業法第48条の工事計画届出に必要な提出書類と期間は？'
  ];

  const handleLaunchTool = (toolId: ProjectSubView) => {
    setActiveDropdown(null);
    if (onOpenEngineeringTool) {
      onOpenEngineeringTool(toolId);
    } else {
      onOpenEngineeringTools();
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200/90 shadow-2xs font-sans w-full max-w-full overflow-x-clip">
      {/* 1. Top Utility Bar */}
      <div className="bg-[#f8fafc] text-slate-600 text-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          {/* Left: Latest Notice */}
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-[11px] font-bold text-[#d81a28] shrink-0 tracking-tight">
              お知らせ
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600 truncate text-[11px] sm:text-xs">
              2026年度 系統用蓄電池の消防法適合ガイドライン及びFIP・容量市場最新レポートを公開中
            </span>
          </div>
          
          {/* Right: Phone, Inquiries, Links & Auth State */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 text-[11px] sm:text-xs font-medium">
            <a 
              href="tel:07089821052"
              className="text-[#002b49] font-bold font-mono hover:text-[#d81a28] transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
            >
              <Phone className="w-3 h-3 text-[#f97316]" />
              <span>TEL: 070-8982-1052</span>
            </a>
            <span className="text-slate-300 hidden md:inline">|</span>
            <button 
              onClick={() => {
                if (onOpenCompanyProfile) onOpenCompanyProfile();
                else onNavigateTab('home');
              }}
              className="text-slate-600 hover:text-[#002b49] transition-colors hidden md:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
              title="会社概要・企業情報 (Giới thiệu công ty)"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>会社概要</span>
            </button>
            <span className="text-slate-300 hidden md:inline">|</span>
            <button 
              onClick={() => onNavigateTab('news')}
              className="text-slate-600 hover:text-[#002b49] transition-colors hidden md:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              プレスリリース
            </button>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button 
              onClick={onOpenContact}
              className="text-slate-600 hover:text-[#002b49] transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              カタログ請求
            </button>
            <span className="text-slate-300">|</span>

            {/* Inquiries Button right next to Login */}
            <button 
              onClick={onOpenContact}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-bold text-slate-800 hover:text-[#d81a28] bg-white hover:bg-slate-100 border border-slate-300 rounded-md shadow-2xs transition-all cursor-pointer whitespace-nowrap"
              title="お問い合わせ・技術相談 (Liên hệ & Tư vấn kỹ thuật)"
            >
              <Mail className="w-3.5 h-3.5 text-[#d81a28]" />
              <span>お問い合わせ</span>
            </button>
            <span className="text-slate-300">|</span>

            {/* Auth Account State */}
            {isLoggedIn && currentUser ? (
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1 text-[#002b49] font-bold hover:underline cursor-pointer whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5 text-[#002b49]" />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                  {isAdmin && (
                    <span className="text-[10px] font-extrabold bg-[#d81a28] text-white px-1.5 py-0.5 rounded tracking-tight ml-0.5 shadow-2xs">
                      管理者
                    </span>
                  )}
                </button>
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="text-slate-400 hover:text-slate-700 text-[10px] p-0.5 cursor-pointer"
                    title="ログアウト (Đăng xuất)"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1 text-[#002b49] hover:text-[#d81a28] font-bold transition-colors cursor-pointer whitespace-nowrap"
              >
                <User className="w-3.5 h-3.5" />
                <span>無料会員登録 / ログイン</span>
              </button>
            )}

            <span className="text-slate-300 hidden lg:inline">|</span>
            <span className="text-slate-400 font-mono text-[11px] hidden lg:inline">JP</span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar (Clean & Spacious Layout, No Cramping) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo (Clicking returns to Home) */}
          <div className="flex items-center shrink-0">
            <button 
              onClick={() => {
                onNavigateTab('home');
                setActiveDropdown(null);
              }}
              className="flex items-center text-left focus:outline-hidden cursor-pointer"
              title="SOLNEXA Japan ホームへ戻る"
            >
              <SolnexaLogo size="md" variant="horizontal" showSlogan={false} />
            </button>
          </div>

          {/* Desktop Navigation Links: Option 2 (5 Clean Groups, NO Chevron Arrow, Pure Clean Typography) */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4">
            {navItems.map((item) => {
              const isActive = (item.id === 'tools' && currentTab === 'tools-workspace') || currentTab === item.id;
              const isDropdownOpen = activeDropdown === item.id;
              const hasDropdown = item.hasDropdown;

              return (
                <div 
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => hasDropdown ? handleMouseEnter(item.id) : undefined}
                  onMouseLeave={hasDropdown ? handleMouseLeave : undefined}
                >
                  <button
                    onClick={() => {
                      if (item.id === 'tools') {
                        onOpenEngineeringTools();
                      } else {
                        onNavigateTab(item.id as CorporateTab);
                      }
                      setActiveDropdown(null);
                    }}
                    className={`px-3.5 xl:px-4 py-2 text-[13px] xl:text-[14px] font-bold tracking-tight whitespace-nowrap transition-all relative flex items-center gap-1.5 rounded-lg cursor-pointer ${
                      isActive || isDropdownOpen
                        ? 'text-[#002b49] bg-slate-100/90' 
                        : 'text-slate-700 hover:text-[#d81a28] hover:bg-slate-50'
                    }`}
                  >
                    {item.id === 'ai-advisor' && <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                    <span>{item.label}</span>
                    {item.isSpecial && (
                      <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full leading-none shrink-0 shadow-2xs">
                        PRO
                      </span>
                    )}
                    {/* NO CHEVRON ARROW: Clean Japanese typography, hover triggers popup seamlessly */}
                    {isActive && (
                      <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-[#d81a28] rounded-full" />
                    )}
                  </button>
                </div>
              );
            })}
          </nav>

          {/* Right Action CTA (Single, Bold Conversion Action - Never Clipped) */}
          <div className="hidden lg:flex items-center shrink-0">
            <button
              onClick={onOpenDesignQuotation || onOpenContact}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs xl:text-[13px] font-black text-white bg-gradient-to-r from-[#d81a28] via-[#e65100] to-[#d81a28] hover:brightness-105 active:scale-98 transition-all rounded-lg shadow-sm hover:shadow-md border border-red-500/30 whitespace-nowrap cursor-pointer group"
              title="太陽光発電・系統用蓄電池の基本設計・単線結線図(SLD)・見積作成の無料相談 (Báo giá thiết kế Solar & BESS)"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">太陽光・BESS設計 見積依頼</span>
              <span className="text-[10px] bg-white/20 text-white font-bold px-1.5 py-0.5 rounded leading-none shrink-0 group-hover:bg-white group-hover:text-[#d81a28] transition-colors">
                無料
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle & Quick Buttons */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              onClick={onOpenContact}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md whitespace-nowrap cursor-pointer shadow-2xs"
              title="お問い合わせ"
            >
              <Mail className="w-3.5 h-3.5 text-[#d81a28]" />
              <span className="hidden sm:inline">問合せ</span>
            </button>
            <button
              onClick={onOpenDesignQuotation || onOpenContact}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-black text-white bg-gradient-to-r from-[#d81a28] to-[#e65100] rounded-md whitespace-nowrap cursor-pointer shadow-xs"
            >
              <Zap className="w-3 h-3 text-amber-300" />
              <span>設計見積</span>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DYNAMIC POPUP / MEGA-MENU PANELS FOR THE 5 CLEAN GROUPS                   */}
      {/* ========================================================================= */}

      {/* POPUP 1: ソリューション・製品 (Solutions & Products Combined) */}
      {activeDropdown === 'solutions' && (
        <div 
          onMouseEnter={() => handleMouseEnter('solutions')}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b-2 border-[#002b49] shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
                <h4 className="text-xs font-extrabold text-[#002b49] uppercase tracking-wider">
                  SOLNEXA 事業ソリューション &amp; 取扱い主要製品カタログ
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    onNavigateTab('solutions');
                    setActiveDropdown(null);
                  }}
                  className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer"
                >
                  <span>ソリューション一覧</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('products');
                    setActiveDropdown(null);
                  }}
                  className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer"
                >
                  <span>製品カタログ一覧</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 5 Solutions (7 Cols) */}
              <div className="lg:col-span-7 space-y-2.5">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">事業・ソリューション分野 (5分野)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {solutionsSubItems.map((sub) => {
                    const Icon = sub.icon;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => {
                          setActiveDropdown(null);
                          onNavigateTab('solutions', sub.id);
                        }}
                        className="p-3 rounded-xl border border-slate-200 bg-white hover:border-[#002b49] hover:bg-blue-50/40 hover:shadow-sm transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#002b49] group-hover:bg-[#002b49] group-hover:text-white transition-colors flex items-center justify-center">
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {sub.badge}
                            </span>
                          </div>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#002b49] transition-colors leading-snug line-clamp-1">
                            {sub.title}
                          </h5>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                            {sub.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Major Products (5 Cols) */}
              <div className="lg:col-span-5 space-y-2.5 border-t lg:border-t-0 lg:border-l border-slate-200 pt-4 lg:pt-0 lg:pl-6">
                <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">主要機器・設備カタログ</p>
                <div className="space-y-2">
                  {productsSubItems.map((prod, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveDropdown(null);
                        onNavigateTab('products');
                      }}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 transition-all cursor-pointer group flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            {prod.tag}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug line-clamp-1">
                            {prod.name}
                          </h5>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-1">
                          {prod.spec}
                        </p>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP 2: 設計ツール (Engineering Tools - Trang chuyên sâu) */}
      {activeDropdown === 'tools' && (
        <div 
          onMouseEnter={() => handleMouseEnter('tools')}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b-2 border-amber-500 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
                <h4 className="text-xs font-black text-[#002b49] uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-amber-500" />
                  <span>SOLNEXA クラウド設計ツール ｜ 太陽光・系統用蓄電池 実務エンジニアリング基盤</span>
                </h4>
                <span className="text-[11px] text-slate-500 hidden xl:inline">
                  （クリックすると各専門ツールの設計ワークスペースへ遷移します）
                </span>
              </div>
              <button
                onClick={() => {
                  onOpenEngineeringTools();
                  setActiveDropdown(null);
                }}
                className="text-xs font-bold text-white bg-[#002b49] hover:bg-[#001c30] px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
              >
                <span>🚀 総合設計ポータル（全機能）を開く</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
              </button>
            </div>

            {/* 8 Core Specialized Engineering Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {engineeringToolItems.map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.id}
                    onClick={() => handleLaunchTool(tool.id)}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/30 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#002b49] group-hover:bg-[#002b49] group-hover:text-amber-300 transition-colors flex items-center justify-center">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#002b49] border border-blue-200">
                          {tool.badge}
                        </span>
                      </div>
                      <div>
                        <h5 className="text-xs font-black text-slate-900 group-hover:text-[#002b49] transition-colors leading-snug">
                          {tool.title}
                        </h5>
                        <p className="text-[10px] text-amber-800 font-medium">
                          {tool.vnTitle}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {tool.desc}
                      </p>
                    </div>
                    <div className="pt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-700 group-hover:text-[#d81a28]">
                      <span>ツールを起動 (Launch)</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POPUP 3: 導入実績 (Projects) */}
      {activeDropdown === 'projects' && (
        <div 
          onMouseEnter={() => handleMouseEnter('projects')}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b-2 border-indigo-600 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs" />
                <h4 className="text-xs font-extrabold text-[#002b49] uppercase tracking-wider">
                  太陽光・BESS 導入実績 &amp; EPCプロジェクト事例
                </h4>
              </div>
              <button
                onClick={() => {
                  onNavigateTab('projects');
                  setActiveDropdown(null);
                }}
                className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer"
              >
                <span>実績一覧を見る</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {projectsSubItems.map((proj, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveDropdown(null);
                    onNavigateTab('projects');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {proj.type}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {proj.scale}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 transition-colors leading-snug">
                      {proj.title}
                    </h5>
                  </div>
                  <div className="pt-2 text-[11px] font-bold text-indigo-700 flex items-center justify-between">
                    <span>事例詳細を見る</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* POPUP 4: ナレッジ・法令 (Knowledge, Regulations & Policy News Combined) */}
      {activeDropdown === 'knowledge' && (
        <div 
          onMouseEnter={() => handleMouseEnter('knowledge')}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b-2 border-blue-600 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-extrabold text-[#002b49] uppercase tracking-wider">
                  技術ナレッジ・法令基準・最新市場動向
                </h4>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    onNavigateTab('knowledge');
                    setActiveDropdown(null);
                  }}
                  className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer"
                >
                  <span>技術ナレッジ全記事</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    onNavigateTab('news');
                    setActiveDropdown(null);
                  }}
                  className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer"
                >
                  <span>お知らせ・動向</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {knowledgeSubItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      setActiveDropdown(null);
                      onNavigateTab('knowledge');
                    }}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.category}
                        </span>
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-[#002b49] transition-colors leading-snug line-clamp-3">
                        {item.title}
                      </h5>
                    </div>
                    <div className="pt-2 text-[11px] font-bold text-blue-700 flex items-center justify-between">
                      <span>解説を読む</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* POPUP 5: AI技術相談 (AI Advisor) */}
      {activeDropdown === 'ai-advisor' && (
        <div 
          onMouseEnter={() => handleMouseEnter('ai-advisor')}
          onMouseLeave={handleMouseLeave}
          className="absolute top-full left-0 w-full bg-white/98 backdrop-blur-md border-b-2 border-amber-500 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-extrabold text-[#002b49] uppercase tracking-wider">
                  AI技術相談室 ｜ JIS規格・消防法・電気事業法 即答アシスタント
                </h4>
              </div>
              <button
                onClick={() => {
                  onNavigateTab('ai-advisor');
                  setActiveDropdown(null);
                }}
                className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 cursor-pointer"
              >
                <span>AI相談室を開く</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {aiAdvisorPrompts.map((prompt, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveDropdown(null);
                    if (onAskAiPrompt) onAskAiPrompt(prompt);
                    else onNavigateTab('ai-advisor');
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-amber-400 hover:bg-amber-50/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">
                      質問テンプレート
                    </span>
                    <p className="text-xs font-medium text-slate-800 group-hover:text-[#002b49] leading-snug line-clamp-3">
                      “{prompt}”
                    </p>
                  </div>
                  <div className="pt-2 text-[11px] font-bold text-amber-700 flex items-center justify-between">
                    <span>この内容でAIに質問</span>
                    <Sparkles className="w-3 h-3 text-amber-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MOBILE DRAWER MENU                                                        */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3 max-h-[85vh] overflow-y-auto">
          {/* Engineering Tools Direct Ribbon on Mobile */}
          <div className="p-3 bg-[#002b49] text-white rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black flex items-center gap-1.5 text-amber-300">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>クラウド設計ツール (PRO)</span>
              </span>
              <span className="text-[10px] bg-amber-400 text-slate-950 font-bold px-1.5 py-0.5 rounded">
                8ツール搭載
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              単線結線図CAD、BESSサイジング、ケーブル計算、過積載率計算など
            </p>
            <button
              onClick={() => {
                onOpenEngineeringTools();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>設計ツールを起動する</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider px-2">メニュー</p>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'tools') {
                    onOpenEngineeringTools();
                  } else {
                    onNavigateTab(item.id as CorporateTab);
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-bold rounded-lg cursor-pointer ${
                  currentTab === item.id ? 'bg-slate-100 text-[#002b49]' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.id === 'ai-advisor' && <Sparkles className="w-4 h-4 text-amber-500" />}
                  {item.label}
                  {item.isSpecial && (
                    <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full leading-none">
                      PRO
                    </span>
                  )}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            ))}

            <button
              onClick={() => {
                if (onOpenCompanyProfile) onOpenCompanyProfile();
                else onNavigateTab('home');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 text-sm font-bold rounded-lg cursor-pointer text-slate-700 hover:bg-slate-50 border-t border-slate-100"
            >
              <span className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-slate-500" />
                <span>会社概要・企業情報</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          {/* Quick Action CTAs on Mobile */}
          <div className="pt-2 space-y-2 border-t border-slate-200">
            <button
              onClick={() => {
                if (onOpenDesignQuotation) onOpenDesignQuotation();
                else onOpenContact();
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-[#d81a28] to-[#e65100] text-white rounded-lg text-xs font-black shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>太陽光・BESS設計 見積依頼（無料）</span>
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenContact();
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-3 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 text-center bg-slate-50 cursor-pointer"
              >
                お問い合わせ
              </button>
              <button
                onClick={() => {
                  onOpenLogin();
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-3 bg-[#002b49] text-white rounded-lg text-xs font-bold text-center cursor-pointer"
              >
                {isLoggedIn ? 'アカウント' : 'ログイン'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
