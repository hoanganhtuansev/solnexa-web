import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Phone, 
  Mail, 
  User, 
  LogIn, 
  Sparkles, 
  Cpu, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronRight,
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Edit3,
  LogOut,
  Sun,
  BatteryCharging,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { MegaMenu, MegaMenuCategory } from './MegaMenu';
import { CorporateTab } from './CorporateHeader';
import { LoginUser } from './LoginModal';
import { SolnexaLogo } from './SolnexaLogo';

interface SiteHeaderProps {
  currentTab: CorporateTab | 'tools-workspace';
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenEngineeringTools: () => void;
  onOpenLogin: () => void;
  onOpenContact: () => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
  currentUser?: LoginUser | null;
  onOpenAdminCms?: () => void;
}

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  currentTab,
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenLogin,
  onOpenContact,
  onLogout,
  isLoggedIn = false,
  currentUser,
  onOpenAdminCms
}) => {
  const [activeMegaCategory, setActiveMegaCategory] = useState<MegaMenuCategory | null>(null);
  const [isMegaOpen, setIsMegaOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Monitor scroll for subtle elevation shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = currentUser?.isAdmin === true;

  // MegaMenu categories definition
  const megaCategories: Record<string, MegaMenuCategory> = {
    solutions: {
      id: 'solutions',
      label: '事業・ソリューション',
      enLabel: 'BUSINESS SOLUTIONS',
      description: '発電事業者・EPC向けに特別高圧メガソーラーから系統用大型蓄電所までワンストップでエンジニアリングを提供します。',
      image: APP_IMAGES.headerBanner,
      links: [
        {
          title: '特別高圧 系統用蓄電池 (BESS)',
          sub: '40MW〜100MW+ の特高系統連系、消防法告示第2号保有空地3m適合設計',
          action: () => onNavigateTab('solutions'),
          badge: '特高案件'
        },
        {
          title: '産業用メガソーラー & FIP最適化',
          sub: 'FITからFIP移行、インバランス抑制と蓄電池併設アービトラージ',
          action: () => onNavigateTab('solutions')
        },
        {
          title: '自家消費型太陽光 ＆ オンサイトPPA',
          sub: '工場・物流施設向け屋根置き、孔開けレス工法とScope 2削減',
          action: () => onNavigateTab('solutions')
        },
        {
          title: 'クラウド統合エンジニアリング基盤',
          sub: 'JIS C 3605規格ケーブル計算、単線結線図作図、BOQ自動生成',
          action: () => onOpenEngineeringTools(),
          badge: 'PRO'
        }
      ]
    },
    bess: {
      id: 'bess',
      label: '系統用蓄電池 (BESS)',
      enLabel: 'GRID-SCALE BESS',
      description: '容量市場・需給調整市場・JEPXアービトラージに対応する日本最高峰の蓄電所エンジニアリング。',
      image: APP_IMAGES.bessContainer,
      links: [
        {
          title: '液冷式LFP電池コンテナシステム (3.72MWh〜)',
          sub: '温度ムラ≦2℃、UL9540A認証、消防法適合全域ガス消火内蔵',
          action: () => onNavigateTab('products'),
          badge: '主力製品'
        },
        {
          title: '特高66kV / 高圧22kV 変電スキッド',
          sub: '遮断器・断路器・保護継電器（87T, 51, 67R）一体型受変電設備',
          action: () => onNavigateTab('products')
        },
        {
          title: '消防法第17条・保有空地3m自治体協議支援',
          sub: '全国自治体の火災予防条例に対応した防火壁設計と届出支援',
          action: () => onNavigateTab('knowledge')
        },
        {
          title: 'マルチマーケット収益シミュレーション',
          sub: 'JEPXスポット市場価格と需給調整市場三次②の最適充放電アルゴリズム',
          action: () => onNavigateTab('knowledge')
        }
      ]
    },
    engineering: {
      id: 'engineering',
      label: 'エンジニアリング ＆ ツール',
      enLabel: 'ENGINEERING & CLOUD TOOLS',
      description: '実務技術者向けの電気解析、JIS規格計算、単線結線図自動作成クラウドスイート。',
      image: APP_IMAGES.ambientBg,
      links: [
        {
          title: 'JIS C 3605 幹線ケーブル許容電流・電圧降下計算',
          sub: '直埋・管路・トレンチ敷設低減係数と20年売電損失の極小化',
          action: () => onOpenEngineeringTools()
        },
        {
          title: 'PVストリング設計 ＆ 低温開放電圧判定',
          sub: 'JIS C 8955準拠、冬期最低温度におけるPCS最大入力電圧（1500V）検証',
          action: () => onOpenEngineeringTools(),
          badge: '無料'
        },
        {
          title: '単線結線図 (SLD) クラウド作図エディタ',
          sub: '特別高圧受変電からPCS・接続箱までの電気系統図をブラウザで作成',
          action: () => onOpenEngineeringTools()
        },
        {
          title: '仕様書PDF AI自動解析 ＆ BOQ見積書作成',
          sub: '主要メーカーデータシートから電気諸元を瞬時に抽出し内訳書生成',
          action: () => onOpenEngineeringTools(),
          badge: 'PRO'
        }
      ]
    },
    projects: {
      id: 'projects',
      label: '施工・導入実績',
      enLabel: 'PROVEN TRACK RECORD',
      description: '全国の特別高圧メガソーラーおよび系統用蓄電所の設計・主要機器供給実績。',
      image: APP_IMAGES.solarFacility,
      links: [
        {
          title: '福島県相馬市 40MW / 160MWh 系統用蓄電所',
          sub: '特別高圧66kV系統連系、消防法告示第2号保有空地3m適合（2025年竣工）',
          action: () => onNavigateTab('projects'),
          badge: '特高'
        },
        {
          title: '北海道十勝 15MW 太陽光 ＋ 30MWh 蓄電池複合所',
          sub: 'ノンファーム型接続、インバランスペナルティゼロ実証（2025年竣工）',
          action: () => onNavigateTab('projects')
        },
        {
          title: '群馬県太田市 2.4MW 物流施設屋根置 自家消費PPA',
          sub: '孔開けレス金具工法、年間2,600MWh供給（2024年竣工）',
          action: () => onNavigateTab('projects')
        },
        {
          title: '実績レポート・技術論文ダウンロード',
          sub: '詳細な設計データ、単線結線図サンプル、実運用データ資料',
          action: () => onNavigateTab('knowledge')
        }
      ]
    }
  };

  const handleNavMouseEnter = (catKey: string) => {
    if (megaCategories[catKey]) {
      setActiveMegaCategory(megaCategories[catKey]);
      setIsMegaOpen(true);
    } else {
      setIsMegaOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white font-sans">
      {/* 1. Top Utility Navigation Bar (Solar Frontier Standard) */}
      <div className="bg-[#f8fafc] text-slate-600 text-xs border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between">
          {/* Left: Latest Announcement & Policy Ticker */}
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-[11px] font-bold text-[#d81a28] shrink-0 tracking-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d81a28] animate-ping" />
              お知らせ
            </span>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => onNavigateTab('news')}
              className="text-slate-600 hover:text-[#002b49] truncate text-[11px] sm:text-xs text-left cursor-pointer transition-colors"
            >
              2026年度 系統用蓄電池の消防法適合ガイドライン及びFIP・容量市場最新レポートを公開中
            </button>
          </div>
          
          {/* Right: Corporate Links, Catalog, Auth & Language */}
          <div className="flex items-center gap-3.5 shrink-0 text-[11px] sm:text-xs font-medium">
            <a 
              href="tel:07089821052"
              className="text-[#002b49] font-bold font-mono hover:text-[#d81a28] transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
            >
              <Phone className="w-3 h-3 text-[#f97316]" />
              <span>TEL: 070-8982-1052</span>
            </a>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <button 
              onClick={() => onNavigateTab('news')}
              className="text-slate-600 hover:text-[#002b49] transition-colors hidden md:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              ニュース
            </button>
            <span className="text-slate-300 hidden md:inline">|</span>
            <button 
              onClick={onOpenContact}
              className="text-slate-600 hover:text-[#002b49] transition-colors hidden sm:inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              カタログ資料請求
            </button>
            <span className="text-slate-300 hidden sm:inline">|</span>

            {/* Member Account State */}
            {isLoggedIn && currentUser ? (
              <div className="inline-flex items-center gap-2">
                <button
                  onClick={onOpenLogin}
                  className="inline-flex items-center gap-1.5 text-[#002b49] font-bold hover:underline cursor-pointer whitespace-nowrap bg-blue-50/80 px-2 py-0.5 rounded-md border border-blue-200/60"
                  title="アカウント切り替え / 会員情報"
                >
                  <User className="w-3.5 h-3.5 text-[#002b49]" />
                  <span>{currentUser.name}</span>
                  {isAdmin && (
                    <span className="text-[10px] font-extrabold bg-[#d81a28] text-white px-1.5 py-0.2 rounded tracking-tight ml-0.5">
                      管理者
                    </span>
                  )}
                </button>
                {onLogout && (
                  <button 
                    onClick={onLogout}
                    className="text-slate-400 hover:text-[#d81a28] text-[11px] p-0.5 flex items-center gap-0.5 transition-colors cursor-pointer"
                    title="ログアウト"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden lg:inline text-[10px]">ログアウト</span>
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 text-[#002b49] hover:text-[#d81a28] font-bold transition-colors cursor-pointer whitespace-nowrap bg-slate-100 hover:bg-slate-200/80 px-2.5 py-0.5 rounded-md border border-slate-300"
              >
                <User className="w-3.5 h-3.5" />
                <span>無料会員登録 / ログイン</span>
              </button>
            )}

            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
              <span className="text-[#002b49] font-bold">JP</span>
              <span className="text-slate-300">/</span>
              <span className="hover:text-slate-800 cursor-pointer">EN</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div 
        className={`bg-white transition-all duration-200 border-b border-slate-200 ${
          isScrolled ? 'shadow-md py-3' : 'py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo & Brand Identity */}
          <div 
            onClick={() => {
              onNavigateTab('home');
              setIsMegaOpen(false);
            }}
            className="flex items-center cursor-pointer group shrink-0"
          >
            <SolnexaLogo size="md" variant="horizontal" showSlogan={true} />
          </div>

          {/* Desktop Primary Navigation Menu Items */}
          <nav 
            className="hidden xl:flex items-center gap-1"
            onMouseLeave={() => setIsMegaOpen(false)}
          >
            <button
              onClick={() => { onNavigateTab('home'); setIsMegaOpen(false); }}
              className={`px-3.5 py-2 text-xs font-bold transition-all rounded-md whitespace-nowrap cursor-pointer ${
                currentTab === 'home'
                  ? 'text-[#002b49] bg-blue-50/70 border-b-2 border-[#002b49]'
                  : 'text-slate-700 hover:text-[#002b49] hover:bg-slate-50'
              }`}
            >
              ホーム
            </button>

            <button
              onMouseEnter={() => handleNavMouseEnter('solutions')}
              onClick={() => { onNavigateTab('solutions'); setIsMegaOpen(false); }}
              className={`px-3.5 py-2 text-xs font-bold transition-all rounded-md flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                currentTab === 'solutions'
                  ? 'text-[#002b49] bg-blue-50/70 border-b-2 border-[#002b49]'
                  : 'text-slate-700 hover:text-[#002b49] hover:bg-slate-50'
              }`}
            >
              <span>事業・ソリューション</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onMouseEnter={() => handleNavMouseEnter('bess')}
              onClick={() => { onNavigateTab('products'); setIsMegaOpen(false); }}
              className={`px-3.5 py-2 text-xs font-bold transition-all rounded-md flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                currentTab === 'products'
                  ? 'text-[#002b49] bg-blue-50/70 border-b-2 border-[#002b49]'
                  : 'text-slate-700 hover:text-[#002b49] hover:bg-slate-50'
              }`}
            >
              <span>系統用蓄電池 (BESS)</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onMouseEnter={() => handleNavMouseEnter('engineering')}
              onClick={() => { onOpenEngineeringTools(); setIsMegaOpen(false); }}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-[#002b49] hover:bg-slate-50 transition-all rounded-md flex items-center gap-1 whitespace-nowrap cursor-pointer"
            >
              <span>エンジニアリング</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onMouseEnter={() => handleNavMouseEnter('projects')}
              onClick={() => { onNavigateTab('projects'); setIsMegaOpen(false); }}
              className={`px-3.5 py-2 text-xs font-bold transition-all rounded-md flex items-center gap-1 whitespace-nowrap cursor-pointer ${
                currentTab === 'projects'
                  ? 'text-[#002b49] bg-blue-50/70 border-b-2 border-[#002b49]'
                  : 'text-slate-700 hover:text-[#002b49] hover:bg-slate-50'
              }`}
            >
              <span>施工・導入実績</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60" />
            </button>

            <button
              onClick={() => { onNavigateTab('knowledge'); setIsMegaOpen(false); }}
              className={`px-3.5 py-2 text-xs font-bold transition-all rounded-md whitespace-nowrap cursor-pointer ${
                currentTab === 'knowledge'
                  ? 'text-[#002b49] bg-blue-50/70 border-b-2 border-[#002b49]'
                  : 'text-slate-700 hover:text-[#002b49] hover:bg-slate-50'
              }`}
            >
              技術ナレッジ・基準
            </button>

            <button
              onClick={() => { onNavigateTab('news'); setIsMegaOpen(false); }}
              className={`px-3.5 py-2 text-xs font-bold transition-all rounded-md whitespace-nowrap cursor-pointer ${
                currentTab === 'news'
                  ? 'text-[#002b49] bg-blue-50/70 border-b-2 border-[#002b49]'
                  : 'text-slate-700 hover:text-[#002b49] hover:bg-slate-50'
              }`}
            >
              お知らせ・動向
            </button>

            <button
              onClick={() => { onNavigateTab('ai-advisor'); setIsMegaOpen(false); }}
              className={`px-3 py-2 text-xs font-bold transition-all rounded-md flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                currentTab === 'ai-advisor'
                  ? 'text-amber-800 bg-amber-50 border-b-2 border-amber-600'
                  : 'text-slate-700 hover:text-amber-700 hover:bg-amber-50/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI技術相談室</span>
            </button>
          </nav>

          {/* Action CTAs: Pro Tools + Contact */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <button
              onClick={onOpenEngineeringTools}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-md bg-[#002b49] hover:bg-[#001d32] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              <span>設計ツール (PRO)</span>
            </button>

            <button
              onClick={onOpenContact}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-[#d81a28] hover:bg-[#b51420] active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>お問い合わせ・相談</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              onClick={onOpenContact}
              className="px-3 py-1.5 bg-[#d81a28] text-white text-[11px] font-bold rounded-md"
            >
              お問い合わせ
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="メニュー開閉"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Interactive MegaMenu (Desktop) */}
      <MegaMenu
        category={activeMegaCategory}
        isOpen={isMegaOpen}
        onClose={() => setIsMegaOpen(false)}
        onOpenEngineeringTools={onOpenEngineeringTools}
        onOpenContact={onOpenContact}
      />

      {/* 4. Independent Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 top-[110px] z-50 bg-white/98 backdrop-blur-md overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right duration-200 border-t border-slate-200">
          {/* User state banner in mobile */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#002b49]" />
              <span className="text-xs font-bold text-slate-800">
                {isLoggedIn && currentUser ? currentUser.name : 'ゲストユーザー'}
              </span>
              {isAdmin && (
                <span className="text-[10px] font-bold bg-[#d81a28] text-white px-1.5 py-0.5 rounded">
                  管理者
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenLogin();
              }}
              className="text-xs font-bold text-[#002b49] hover:underline"
            >
              {isLoggedIn ? 'アカウント' : 'ログイン'}
            </button>
          </div>

          <div className="space-y-1 divide-y divide-slate-100">
            <button
              onClick={() => { onNavigateTab('home'); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
            >
              <span>ホーム (Home)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigateTab('solutions'); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
            >
              <span>事業・ソリューション (Solutions)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigateTab('products'); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
            >
              <span>系統用蓄電池・主要機器 (BESS Products)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigateTab('projects'); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
            >
              <span>施工・導入実績 (Case Studies)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigateTab('knowledge'); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
            >
              <span>技術ナレッジ・法令基準 (Knowledge)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigateTab('news'); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-bold text-sm text-slate-900 flex items-center justify-between"
            >
              <span>新着情報・市場動向 (News)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => { onNavigateTab('ai-advisor'); setIsMobileMenuOpen(false); }}
              className="w-full py-3 text-left font-bold text-sm text-amber-700 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI技術相談室 (AI Advisor)</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenEngineeringTools();
              }}
              className="w-full py-3 bg-[#002b49] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>統合設計ツール (PRO) を起動</span>
            </button>

            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenContact();
              }}
              className="w-full py-3 bg-[#d81a28] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>お問い合わせ・無料相談</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
