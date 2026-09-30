import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  BatteryCharging, 
  Sun, 
  Building, 
  Cpu, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Calendar, 
  ExternalLink, 
  CheckCircle2, 
  ChevronRight, 
  TrendingUp, 
  Download, 
  Flame, 
  Award, 
  BookOpen,
  Layers,
  Palette,
  UserPlus,
  LogIn,
  Edit2,
  Edit3,
  Plus,
  Save,
  Image as ImageIcon,
  Sliders,
  RotateCcw,
  Check,
  Trash2
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';
import { AboutSection } from './AboutSection';
import { SiteConfig, SiteButtonConfig } from '../../types/siteConfig';
import { DEFAULT_SITE_CONFIG, BG_IMAGE_PRESETS } from '../../utils/siteConfigDefaults';
import { InlineEditableText } from './InlineEditableText';
import { AdminVisualCustomizerModal } from './AdminVisualCustomizerModal';
import { AdminEditFloatingBar } from './AdminEditFloatingBar';
import { ArticleEditorModal, ArticleData } from './ArticleEditorModal';

interface CorporateHomeViewProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
  onOpenCompanyProfile?: () => void;
  onOpenLogin: () => void;
  onAskAiPrompt: (promptText: string) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  currentUser?: any;
}

export const CorporateHomeView: React.FC<CorporateHomeViewProps> = ({
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenContact,
  onOpenCompanyProfile,
  onOpenLogin,
  onAskAiPrompt,
  isLoggedIn = false,
  isAdmin = false,
  currentUser
}) => {
  const [activeNewsCategory, setActiveNewsCategory] = useState<string>('all');
  
  // Persistent Site Visual Configuration
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(() => {
    try {
      const saved = localStorage.getItem('solnexa_site_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.hero?.titleLine2 === '太陽光と系統用蓄電池の最先端技術') {
          parsed.hero.titleLine2 = '太陽光と系統用蓄電池の';
          parsed.hero.titleLine3 = '最先端技術で創る。';
        }
        return parsed;
      }
    } catch {}
    return DEFAULT_SITE_CONFIG;
  });

  const [isInlineEditActive, setIsInlineEditActive] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync with server on initial mount
  useEffect(() => {
    fetch('/api/site-config')
      .then(res => res.json())
      .then(data => {
        if (data?.config?.hero) {
          const cfg = data.config;
          if (cfg.hero.titleLine2 === '太陽光と系統用蓄電池の最先端技術') {
            cfg.hero.titleLine2 = '太陽光と系統用蓄電池の';
            cfg.hero.titleLine3 = '最先端技術で創る。';
          }
          setSiteConfig(cfg);
          localStorage.setItem('solnexa_site_config', JSON.stringify(cfg));
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveConfig = async (configToSave = siteConfig) => {
    setIsSavingConfig(true);
    try {
      localStorage.setItem('solnexa_site_config', JSON.stringify(configToSave));
      await fetch('/api/site-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave)
      });
      setHasUnsavedChanges(false);
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleResetConfig = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục thiết kế ban đầu chuẩn Solar Frontier không?')) {
      setSiteConfig(DEFAULT_SITE_CONFIG);
      handleSaveConfig(DEFAULT_SITE_CONFIG);
    }
  };

  const handleQuickAddButton = () => {
    const newBtn: SiteButtonConfig = {
      id: `btn-${Date.now().toString(36)}`,
      label: 'Khám phá giải pháp mới',
      target: 'solutions',
      style: 'primary-red',
      icon: 'arrow',
      visible: true
    };
    const updated = {
      ...siteConfig,
      hero: {
        ...siteConfig.hero,
        buttons: [...siteConfig.hero.buttons, newBtn]
      }
    };
    setSiteConfig(updated);
    setHasUnsavedChanges(true);
  };

  const initialPickupCards = [
    {
      id: 'pickup-1',
      category: 'UI/UX・Web設計論',
      badge: '最新研究',
      title: 'Solar Frontier様式に基づくWebプラットフォーム設計論：色彩心理学・情報階層化・文字重複の根絶手法',
      desc: 'ミッドナイトネイビー(#002B49)とコーポレートレッド(#D81A28)の心理効果、F型視線誘導、実務データの定量的提示を解説。',
      image: APP_IMAGES.headerBanner,
      date: '2026.09.26',
      tabTarget: 'knowledge' as CorporateTab
    },
    {
      id: 'pickup-2',
      category: '系統用蓄電池 BESS',
      badge: '特高連系',
      title: '特別高圧66kV系統連系 40MW / 160MWh 系統用大型蓄電所の設計・主要機器供給実績',
      desc: '消防法第17条および告示第2号保有空地3m基準に完全適合した液冷LFPコンテナ蓄電池システムを納入。',
      image: APP_IMAGES.bessContainer,
      date: '2026.09.20',
      tabTarget: 'projects' as CorporateTab
    },
    {
      id: 'pickup-3',
      category: '法令・技術基準',
      badge: '消防法基準',
      title: '系統用蓄電池（BESS）の消防法規制・保有空地3m基準と全域ガス自動消火設備実務',
      desc: 'リチウムイオン電池の熱暴走リスク対策、自治体消防協議の要件、UL9540A試験データ提出の指針。',
      image: APP_IMAGES.solarFacility,
      date: '2026.09.15',
      tabTarget: 'knowledge' as CorporateTab
    },
    {
      id: 'pickup-4',
      category: 'クラウド設計ツール',
      badge: 'PROツール',
      title: 'ソルネクサ統合エンジニアリングツール：JIS C 3605ケーブル計算・SLD作図・過積載判定',
      desc: 'ブラウザ上で即座に実行可能。無料会員登録ですべての高度解析機能が無制限に利用できます。',
      image: APP_IMAGES.ambientBg,
      date: '2026.09.10',
      tabTarget: 'tools'
    }
  ];

  const initialNewsItems = [
    {
      id: 'news-1',
      date: '2026.09.24',
      category: '政策・法令',
      title: '経済産業省・資源エネルギー庁、「系統用蓄電池のノンファーム型接続運用ルールおよび出力制御補償」最新解説公表',
      summary: '基幹系統混雑地域における蓄電所接続の運用指針が改定され、充放電スケジューリングにおけるAI自動制御の要件が明確化されました。',
      isHot: true
    },
    {
      id: 'news-2',
      date: '2026.09.18',
      category: 'プレスリリース',
      title: 'ソルネクサ、東北エリアにて特別高圧66kV系統連系 40MW / 160MWh 系統用蓄電所の設計・主要機器供給を受注',
      summary: '消防法第17条および告示第2号に完全準拠した液冷LFPコンテナ蓄電池システムおよび特高変電スキッドを一括納入いたします。',
      isHot: true
    },
    {
      id: 'news-3',
      date: '2026.09.10',
      category: '技術動向',
      title: '【技術論文】FIP太陽光発電所におけるインバランスペナルティ最小化と蓄電池併設マルチユース運用の実証データ',
      summary: 'NEDO予測データベースとJEPXスポット市場価格変動を連動させた蓄電池運用の最新実証分析結果を公開いたしました。',
      isHot: false
    },
    {
      id: 'news-4',
      date: '2026.09.02',
      category: '補助金情報',
      title: '令和8年度 経済産業省「再生可能エネルギー導入加速化・系統用蓄電池等導入支援補助金」の公募要領が発表',
      summary: '蓄電容量10MWh以上の系統用蓄電所に対する設備費補助（最大1/3）の申請枠が拡充されました。申請事前相談を受付中です。',
      isHot: false
    },
  ];

  const [pickupList, setPickupList] = useState(initialPickupCards);
  const [newsList, setNewsList] = useState(initialNewsItems);
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<ArticleData | null>(null);
  const [articleTargetType, setArticleTargetType] = useState<'article' | 'news'>('news');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleEditNewsItem = (item: any) => {
    setArticleToEdit({
      id: item.id,
      category: item.category,
      title: item.title,
      author: '株式会社ソルネクサ 広報室',
      readTime: '所要時間 約5分',
      date: item.date,
      summary: item.summary,
      content: item.content || item.summary,
      isHot: item.isHot
    });
    setArticleTargetType('news');
    setIsArticleModalOpen(true);
  };

  const handleAddNewNews = () => {
    setArticleToEdit(null);
    setArticleTargetType('news');
    setIsArticleModalOpen(true);
  };

  const handleEditPickupCard = (card: any) => {
    setArticleToEdit({
      id: card.id,
      category: card.category,
      title: card.title,
      author: '株式会社ソルネクサ 技術設計部',
      readTime: '所要時間 約8分',
      date: card.date,
      summary: card.desc,
      content: card.desc,
      isHot: card.badge === '最新研究'
    });
    setArticleTargetType('article');
    setIsArticleModalOpen(true);
  };

  const handleArticleSaveSuccess = (savedArticle: ArticleData) => {
    if (articleTargetType === 'news') {
      setNewsList(prev => {
        const exists = prev.some(n => n.id === savedArticle.id);
        if (exists) {
          return prev.map(n => n.id === savedArticle.id ? { ...n, ...savedArticle } : n);
        }
        return [{
          id: savedArticle.id,
          date: savedArticle.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
          category: savedArticle.category || '政策・法令',
          title: savedArticle.title,
          summary: savedArticle.summary || savedArticle.content?.slice(0, 100) || '',
          content: savedArticle.content,
          isHot: Boolean(savedArticle.isHot)
        } as any, ...prev];
      });
      showToast(`Đã lưu bản tin "${savedArticle.title}" thành công!`);
    } else {
      setPickupList(prev => {
        return prev.map(p => p.id === savedArticle.id ? { ...p, title: savedArticle.title, desc: savedArticle.summary || savedArticle.content?.slice(0, 100) || p.desc } : p);
      });
      showToast(`Đã cập nhật bài viết "${savedArticle.title}" thành công!`);
    }
    setIsArticleModalOpen(false);
    setArticleToEdit(null);
  };

  const filteredNews = activeNewsCategory === 'all' 
    ? newsList 
    : newsList.filter(n => n.category === activeNewsCategory);

  const getFontFamilyStyle = () => {
    switch (siteConfig.theme.fontFamily) {
      case 'inter':
        return { fontFamily: "'Inter', sans-serif" };
      case 'zen':
        return { fontFamily: "'Zen Kaku Gothic New', sans-serif" };
      case 'jakarta':
        return { fontFamily: "'Plus Jakarta Sans', sans-serif" };
      case 'serif':
        return { fontFamily: "'Shippori Mincho', 'Noto Serif JP', serif" };
      case 'noto':
      default:
        return { fontFamily: "'Noto Sans JP', sans-serif" };
    }
  };

  const sampleAiPrompts = [
    '系統用蓄電池の消防法上の保有空地3m基準と緩和条件を教えて',
    'FIP制度で太陽光に蓄電池を併設した場合のJEPXアービトラージ収益性は？',
    '特別高圧（66kV）受変電設備の単線結線図（SLD）設計の重要ポイント',
    '電気事業法第48条の工事計画届出に必要な提出書類と期間は？'
  ];

  return (
    <div 
      className="space-y-16 pb-24"
      style={{ ...getFontFamilyStyle(), '--primary-accent': siteConfig.theme.primaryAccent } as React.CSSProperties}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#001c30] text-white px-4 py-2.5 rounded-xl shadow-2xl border border-blue-500/40 flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Hero Section (Solar Frontier Clean High-Key Architectural Style - Bright Daylight Composition) */}
      <section className="relative overflow-hidden bg-white text-slate-900 rounded-2xl shadow-xl border border-slate-200/90 min-h-[580px] sm:min-h-[660px] flex flex-col justify-between">
        
        {/* High-Key Daytime Background Canvas with Natural Sunlight Exposure */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <img 
            src={siteConfig.hero.bgImage} 
            alt="SOLNEXA Solar & BESS Architectural Infrastructure" 
            className="w-full h-full object-cover object-center scale-[1.01] transition-all duration-700"
            style={{ filter: `brightness(${siteConfig.hero.bgBrightness || 1.0})` }}
          />

          {/* Luminous Directional Daylight Veil (Solar Frontier Signature: Left White Glow for Contrast, Right Side Crisp Landscape) */}
          {siteConfig.hero.textColor === 'dark' ? (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, rgba(255, 255, 255, ${0.93 + siteConfig.hero.overlayOpacity * 0.1}) 0%, rgba(255, 255, 255, ${0.84 + siteConfig.hero.overlayOpacity * 0.15}) 45%, rgba(255, 255, 255, ${0.35 + siteConfig.hero.overlayOpacity * 0.2}) 72%, transparent 100%)`
              }}
            />
          ) : (
            <div 
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to right, rgba(0, 24, 44, ${0.88 + siteConfig.hero.overlayOpacity * 0.15}) 0%, rgba(0, 28, 48, ${0.75 + siteConfig.hero.overlayOpacity * 0.15}) 45%, rgba(0, 28, 48, 0.3) 75%, transparent 100%)`
              }}
            />
          )}

          {/* Soft ambient natural sunlight glow */}
          <div 
            className="absolute -top-32 -left-32 w-[640px] h-[640px] opacity-20 mix-blend-multiply blur-3xl rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(14, 165, 233, 0.35) 0%, rgba(216, 26, 40, 0.18) 45%, transparent 75%)' }}
          />
        </div>

        {/* Hero Content Area */}
        <div className="relative z-10 px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14 pb-8 max-w-5xl">
          
          {/* Quick Daylight Background Ideas Bar (Immediate Switcher for Bright Solar Frontier Aesthetic - Admin Only) */}
          {isAdmin && (
            <div className="mb-6 p-3 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Ý tưởng ảnh nền sáng (Chuẩn Solar Frontier):</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Nhấp để chuyển đổi ngay các concept kiến trúc quang điện ban ngày rực rỡ, không bị tối
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                {BG_IMAGE_PRESETS.map((preset) => {
                  const isCurrent = siteConfig.hero.bgImage === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        setSiteConfig(prev => ({
                          ...prev,
                          hero: {
                            ...prev.hero,
                            bgImage: preset.url,
                            textColor: 'dark',
                            overlayType: 'light-clean',
                            bgBrightness: 1.05,
                            overlayOpacity: 0.12
                          },
                          theme: {
                            ...prev.theme,
                            heroTheme: preset.recommendedTheme
                          }
                        }));
                        setHasUnsavedChanges(true);
                        showToast(`Đã áp dụng ảnh nền sáng: ${preset.name}`);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer shrink-0 border ${
                        isCurrent
                          ? 'bg-[#002b49] text-white border-[#002b49] shadow-xs ring-2 ring-amber-400/70'
                          : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                      title={preset.description}
                    >
                      <img src={preset.url} alt={preset.name} className="w-5 h-5 rounded-md object-cover border border-white/60" />
                      <span className="truncate max-w-[130px]">{preset.category}</span>
                      {isCurrent && <Check className="w-3 h-3 text-amber-300" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Direct Live Admin Control Bar (Sliders for Brightness & Overlay) */}
          {isInlineEditActive && (
            <div className="mb-6 p-3 bg-amber-50/95 border border-amber-300 rounded-xl flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-800 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#d81a28]" />
                <span className="font-bold text-[#002b49]">Thanh chỉnh nhanh ảnh &amp; độ mờ:</span>
              </div>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">Độ sáng ảnh nền:</span>
                  <input
                    type="range"
                    min="0.8"
                    max="1.35"
                    step="0.05"
                    value={siteConfig.hero.bgBrightness || 1.0}
                    onChange={(e) => {
                      setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, bgBrightness: parseFloat(e.target.value) } }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-24 accent-[#d81a28]"
                  />
                  <span className="font-mono text-[11px] font-bold text-emerald-700">
                    {Math.round((siteConfig.hero.bgBrightness || 1.0) * 100)}%
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px]">Độ mờ lớp phủ chữ:</span>
                  <input
                    type="range"
                    min="0.0"
                    max="0.5"
                    step="0.02"
                    value={siteConfig.hero.overlayOpacity}
                    onChange={(e) => {
                      setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, overlayOpacity: parseFloat(e.target.value) } }));
                      setHasUnsavedChanges(true);
                    }}
                    className="w-24 accent-[#d81a28]"
                  />
                  <span className="font-mono text-[11px] font-bold text-[#d81a28]">
                    {Math.round(siteConfig.hero.overlayOpacity * 100)}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="px-2.5 py-1 bg-[#d81a28] hover:bg-[#b51420] text-white rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Palette className="w-3 h-3" />
                  <span>Mở bảng chọn đầy đủ</span>
                </button>
              </div>
            </div>
          )}

          {/* Top Admin Controls & Brand Tagline */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            
            {/* Unboxed Metadata & Tagline (Anti-Slop Clean Typography) */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              <span className="font-mono font-bold text-[#d81a28] tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#d81a28] animate-pulse" />
                <InlineEditableText
                  value={siteConfig.hero.tagline}
                  onSave={(val) => {
                    setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, tagline: val } }));
                    setHasUnsavedChanges(true);
                  }}
                  isEditMode={isInlineEditActive}
                  label="Khẩu hiệu Slogan"
                />
              </span>
              <span className="text-slate-300">|</span>
              <span className={`font-medium ${siteConfig.hero.textColor === 'dark' ? 'text-slate-600' : 'text-slate-300'}`}>
                <InlineEditableText
                  value={siteConfig.hero.accentBadge}
                  onSave={(val) => {
                    setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, accentBadge: val } }));
                    setHasUnsavedChanges(true);
                  }}
                  isEditMode={isInlineEditActive}
                  label="Nhãn tiêu chuẩn"
                />
              </span>
            </div>

            {/* Admin Quick Action Pill (Direct Background & Visual Trigger) */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsCustomizerOpen(true)}
                  className="px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-lg shadow-sm border border-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all hover:shadow-md cursor-pointer"
                  title="Thay đổi ảnh nền kiến trúc sáng và màu sắc trang"
                >
                  <Palette className="w-3.5 h-3.5 text-[#d81a28]" />
                  <span>Đổi ảnh nền sáng &amp; Màu sắc</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsInlineEditActive(!isInlineEditActive)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                    isInlineEditActive
                      ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm'
                      : 'bg-white/90 text-slate-700 border-slate-300 hover:bg-white'
                  }`}
                  title="Bật/Tắt chế độ sửa trực tiếp mọi dòng chữ"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isInlineEditActive ? 'Đang sửa trực tiếp: BẬT' : 'Sửa chữ trực tiếp'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Grand Architectural Headline (Solar Frontier Editorial Scale) */}
          <h1 className={`font-black tracking-tight leading-[1.14] mb-6 break-keep [word-break:keep-all] ${
            siteConfig.hero.textColor === 'dark' ? 'text-[#002b49]' : 'text-white'
          } ${
            siteConfig.theme.fontSizeScale === 'large'
              ? 'text-3xl sm:text-5xl lg:text-[58px]'
              : siteConfig.theme.fontSizeScale === 'compact'
              ? 'text-2xl sm:text-4xl lg:text-5xl'
              : 'text-2xl sm:text-4xl lg:text-[54px]'
          }`}>
            <span className="block break-keep">
              <InlineEditableText
                value={siteConfig.hero.titleLine1}
                onSave={(val) => {
                  setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, titleLine1: val } }));
                  setHasUnsavedChanges(true);
                }}
                isEditMode={isInlineEditActive}
                label="Tiêu đề Dòng 1"
              />
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#d81a28] via-[#e65100] to-[#002b49] break-keep">
              <InlineEditableText
                value={siteConfig.hero.titleLine2}
                onSave={(val) => {
                  setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, titleLine2: val } }));
                  setHasUnsavedChanges(true);
                }}
                isEditMode={isInlineEditActive}
                label="Tiêu đề Dòng 2"
              />
            </span>
            <span className="block break-keep">
              <InlineEditableText
                value={siteConfig.hero.titleLine3}
                onSave={(val) => {
                  setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, titleLine3: val } }));
                  setHasUnsavedChanges(true);
                }}
                isEditMode={isInlineEditActive}
                label="Tiêu đề Dòng 3"
              />
            </span>
          </h1>

          {/* Japanese Subtitle */}
          <p className={`text-lg sm:text-2xl font-bold tracking-tight mb-4 leading-snug ${
            siteConfig.hero.textColor === 'dark' ? 'text-slate-800' : 'text-slate-100'
          }`}>
            <InlineEditableText
              value={siteConfig.hero.jpSubtitle}
              onSave={(val) => {
                setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, jpSubtitle: val } }));
                setHasUnsavedChanges(true);
              }}
              isEditMode={isInlineEditActive}
              label="Phụ đề tiếng Nhật"
            />
          </p>

          {/* Description Body */}
          <div className={`text-xs sm:text-sm leading-relaxed max-w-2xl mb-8 ${
            siteConfig.hero.textColor === 'dark' ? 'text-slate-600' : 'text-slate-200'
          }`}>
            <InlineEditableText
              value={siteConfig.hero.description}
              multiline={true}
              onSave={(val) => {
                setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, description: val } }));
                setHasUnsavedChanges(true);
              }}
              isEditMode={isInlineEditActive}
              label="Đoạn văn mô tả"
            />
          </div>

          {/* Dynamic Action Buttons (Configurable via Admin Live CMS) */}
          <div className="flex flex-wrap items-center gap-3.5 mb-10">
            {siteConfig.hero.buttons.filter(b => b.visible).map((btn) => {
              const getBtnStyle = () => {
                switch (btn.style) {
                  case 'primary-red':
                    return 'bg-[#d81a28] hover:bg-[#b51420] text-white shadow-md hover:shadow-lg active:scale-95';
                  case 'deep-navy':
                    return 'bg-[#002b49] hover:bg-[#001d32] text-white shadow-md active:scale-95';
                  case 'accent-amber':
                    return 'bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-bold shadow-md active:scale-95';
                  case 'outline':
                    return siteConfig.hero.textColor === 'dark'
                      ? 'bg-white/90 hover:bg-white text-slate-900 border-2 border-slate-300 font-bold shadow-xs'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md';
                  case 'ghost':
                    return 'bg-transparent hover:bg-black/5 text-slate-800 font-bold';
                  default:
                    return 'bg-[#d81a28] text-white';
                }
              };
              return (
                <div key={btn.id} className="relative group/btn">
                  <button
                    onClick={() => {
                      if (btn.target === 'solutions') onNavigateTab('solutions');
                      else if (btn.target === 'tools') onOpenEngineeringTools();
                      else if (btn.target === 'ai-advisor') onNavigateTab('ai-advisor');
                      else if (btn.target === 'contact') onOpenContact();
                      else onNavigateTab(btn.target as any);
                    }}
                    className={`inline-flex items-center gap-2 px-6 py-3.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${getBtnStyle()}`}
                  >
                    {btn.icon === 'cpu' && <Cpu className="w-4 h-4 text-amber-300" />}
                    {btn.icon === 'sparkles' && <Sparkles className="w-4 h-4 text-amber-300" />}
                    <span>{btn.label}</span>
                    {btn.icon === 'arrow' && <ArrowRight className="w-4 h-4" />}
                  </button>
                  {isInlineEditActive && (
                    <button
                      type="button"
                      onClick={() => setIsCustomizerOpen(true)}
                      className="absolute -top-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md flex items-center gap-0.5 z-20 cursor-pointer"
                      title="Sửa nút này trong bảng tùy biến"
                    >
                      <Edit2 className="w-2.5 h-2.5" />
                      <span>Sửa</span>
                    </button>
                  )}
                </div>
              );
            })}

            {isInlineEditActive && (
              <button
                type="button"
                onClick={handleQuickAddButton}
                className="px-4 py-3 rounded-lg border-2 border-dashed border-slate-400 hover:border-[#d81a28] text-slate-700 hover:text-[#d81a28] text-xs font-bold flex items-center gap-1.5 cursor-pointer bg-white/70"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm nút CTA</span>
              </button>
            )}
          </div>

          {/* Quick Metrics Bar - Authentic Japanese Industry Data (Inline Editable) */}
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t ${
            siteConfig.hero.textColor === 'dark' ? 'border-slate-300/80' : 'border-white/15'
          }`}>
            {siteConfig.hero.metrics.map((m, idx) => (
              <div key={m.id} className="space-y-0.5">
                <p className={`text-[11px] font-bold uppercase tracking-tight ${
                  siteConfig.hero.textColor === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <InlineEditableText
                    value={m.label}
                    onSave={(val) => {
                      const updated = [...siteConfig.hero.metrics];
                      updated[idx] = { ...updated[idx], label: val };
                      setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: updated } }));
                      setHasUnsavedChanges(true);
                    }}
                    isEditMode={isInlineEditActive}
                  />
                </p>
                <p className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                  siteConfig.hero.textColor === 'dark' ? 'text-[#002b49]' : 'text-white'
                }`}>
                  <InlineEditableText
                    value={m.value}
                    onSave={(val) => {
                      const updated = [...siteConfig.hero.metrics];
                      updated[idx] = { ...updated[idx], value: val };
                      setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: updated } }));
                      setHasUnsavedChanges(true);
                    }}
                    isEditMode={isInlineEditActive}
                  />
                  <span className="text-base sm:text-lg font-bold text-[#d81a28] ml-1">
                    <InlineEditableText
                      value={m.unit}
                      onSave={(val) => {
                        const updated = [...siteConfig.hero.metrics];
                        updated[idx] = { ...updated[idx], unit: val };
                        setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: updated } }));
                        setHasUnsavedChanges(true);
                      }}
                      isEditMode={isInlineEditActive}
                    />
                  </span>
                </p>
                <p className={`text-[11px] font-medium ${
                  siteConfig.hero.textColor === 'dark' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  <InlineEditableText
                    value={m.sub}
                    onSave={(val) => {
                      const updated = [...siteConfig.hero.metrics];
                      updated[idx] = { ...updated[idx], sub: val };
                      setSiteConfig(prev => ({ ...prev, hero: { ...prev.hero, metrics: updated } }));
                      setHasUnsavedChanges(true);
                    }}
                    isEditMode={isInlineEditActive}
                  />
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 2. Solar Frontier Style: Pick up (ピックアップ) Cards Grid */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
              <span className="text-xs font-extrabold text-[#002b49] uppercase tracking-wider">Pick up</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              <InlineEditableText
                value={siteConfig.sectionTitles?.pickup || 'ピックアップ・注目の取り組み'}
                onSave={(val) => {
                  setSiteConfig(prev => ({
                    ...prev,
                    sectionTitles: { ...(prev.sectionTitles || {}), pickup: val }
                  }));
                  setHasUnsavedChanges(true);
                }}
                isEditMode={isInlineEditActive}
                label="Tiêu đề mục Pick up"
              />
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            最新の技術論文、特高BESS実績、およびエンジニアリングツール
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {pickupList.map((card) => (
            <div
              key={card.id}
              onClick={() => {
                if (card.tabTarget === 'tools') {
                  onOpenEngineeringTools();
                } else {
                  onNavigateTab(card.tabTarget as CorporateTab);
                }
              }}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-[#002b49] hover:shadow-lg hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="h-40 overflow-hidden relative">
                  <img 
                    src={card.image} 
                    alt={card.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#002b49]/90 backdrop-blur-xs text-white text-[10px] font-bold rounded">
                    {card.badge}
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-slate-200 text-[10px] font-mono">
                    {card.date}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[11px] font-bold text-[#d81a28]">
                    {card.category}
                  </span>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#002b49] transition-colors line-clamp-2 leading-snug">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>

              <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#002b49]">
                  <span>詳しく見る</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#d81a28]" />
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditPickupCard(card);
                    }}
                    className="w-full py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-[11px] font-bold rounded flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                    title="Chỉnh sửa trực tiếp nội dung bài nghiên cứu này"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Sửa bài viết</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Emergency / Policy Notice Bar (JPEA / Solar Frontier Notice Style) */}
      <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-lg shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-amber-200">
        <div className="flex items-start sm:items-center gap-3">
          <span className="px-2.5 py-0.5 bg-amber-500 text-white font-bold text-xs rounded shrink-0">
            重要告示
          </span>
          <span className="text-xs sm:text-sm font-semibold text-slate-800">
            【経済産業省・資源エネルギー庁】系統用蓄電所の接続容量枠および消防法届出に関する最新指針についてのご案内
          </span>
        </div>
        <button
          onClick={() => onNavigateTab('knowledge')}
          className="text-xs font-bold text-[#002b49] hover:underline flex items-center gap-1 shrink-0"
        >
          <span>詳細解説を見る</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#d81a28]" />
        </button>
      </div>

      {/* 4. The 4 Core Business Solutions */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#002b49] rounded-xs" />
              <span className="text-xs font-extrabold text-[#002b49] tracking-wider uppercase">Business Solutions</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              事業分野・ソリューション
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              発電事業計画から特別高圧受変電、系統連系協議、設備供給、O&Mまでトータルで支援します。
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('solutions')}
            className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 shrink-0"
          >
            <span>すべてのソリューションを見る</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: 系統用蓄電池 BESS */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-[#002b49] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-[#002b49] mb-4 group-hover:bg-[#002b49] group-hover:text-white transition-colors">
                <BatteryCharging className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                特別高圧 系統用蓄電池 (BESS)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                容量市場・需給調整市場・JEPXアービトラージに対応する大型蓄電所（10MW〜100MW+）の設計、消防法適合コンテナ選定、特高変電スキッドをワンストップ供給。
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">消防法 保有空地3m適合</span>
              <button 
                onClick={() => onNavigateTab('solutions')}
                className="font-bold text-[#002b49] group-hover:text-[#d81a28] group-hover:translate-x-0.5 transition-transform"
              >
                詳細 →
              </button>
            </div>
          </div>

          {/* Card 2: 産業用メガソーラー */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-[#002b49] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                産業用メガソーラー & FIP併設
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                FITからFIPへの移行、インバランス回避のための蓄電池併設最適化。JIS C 8955耐風圧架台計算、直流過積載比率140〜160%の高効率設計と系統連系協議を支援。
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">JIS C 8955準拠設計</span>
              <button 
                onClick={() => onNavigateTab('solutions')}
                className="font-bold text-amber-700 group-hover:translate-x-0.5 transition-transform"
              >
                詳細 →
              </button>
            </div>
          </div>

          {/* Card 3: 自家消費型・オンサイトPPA */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-[#002b49] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Building className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                自家消費型・コーポレートPPA
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                工場・物流施設・商業施設の屋根置き太陽光およびピークカット用蓄電池システム。電気代高騰対策、Scope 2排出量削減、BCP非常用電源バックアップを実現。
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">RE100 / Scope 2対応</span>
              <button 
                onClick={() => onNavigateTab('solutions')}
                className="font-bold text-emerald-700 group-hover:translate-x-0.5 transition-transform"
              >
                詳細 →
              </button>
            </div>
          </div>

          {/* Card 4: クラウド統合エンジニアリング */}
          <div className="bg-white rounded-xl border border-blue-200 p-6 hover:shadow-lg hover:border-[#002b49] hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-blue-50/40 to-white">
            <div className="absolute top-2 right-2">
              <span className="bg-[#002b49] text-white text-[10px] font-bold px-2 py-0.5 rounded">FREE / PRO</span>
            </div>
            <div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 border border-blue-300 flex items-center justify-center text-[#002b49] mb-4 group-hover:bg-[#002b49] group-hover:text-white transition-colors">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                統合エンジニアリングツール
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                単線結線図（SLD）作図、JIS規格ケーブル許容電流・電圧降下計算、BESS充放電サイジング、仕様書PDF自動解析、BOQ見積書生成をブラウザ上で実行。
              </p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-blue-900 font-bold">基本計算無料</span>
              <button 
                onClick={onOpenEngineeringTools}
                className="font-bold text-[#d81a28] group-hover:translate-x-0.5 transition-transform flex items-center gap-1"
              >
                <span>ツールを起動</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Special Focus Section: Japanese Grid-Scale BESS (系統用蓄電池の最前線) */}
      <section className="bg-[#00223a] text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden border border-blue-900 shadow-xl">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#d81a28] text-white font-bold text-xs rounded">
                技術・制度特集
              </span>
              <span className="text-xs text-slate-300">日本市場特有の規制と収益化モデル</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-bold leading-tight text-white">
              なぜ今、日本国内で<br />
              <span className="text-amber-400">系統用蓄電池（BESS）</span>なのか？
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              再エネ出力制御の急増、容量市場（長期脱炭素電源オークション）の開設、需給調整市場の整備に伴い、日本全国で特別高圧・高圧蓄電所の需要が拡大しています。ソルネクサは、厳しい消防法基準（保有空地3m離隔・自動消火設備）および電気事業法第48条工事計画届出をクリアした高品質な蓄電所構築を実現します。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">消防法第17条・告示第2号完全適合</p>
                  <p className="text-slate-300 text-[11px]">屋外コンテナ保有空地3m離隔、ガス系消火設備搭載</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">マルチマーケット収益シミュレーション</p>
                  <p className="text-slate-300 text-[11px]">JEPX裁定取引 ＋ 需給調整市場 ＋ 容量市場20年計画</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">電力会社 系統連系協調（東電・関電・九電）</p>
                  <p className="text-slate-300 text-[11px]">特高66kV/22kV連系、保護継電器協調（87T, 51, 67R）</p>
                </div>
              </div>
              <div className="flex items-start gap-2 bg-white/10 p-3 rounded-lg border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-white">液冷式LFP電池コンテナ（3.72MWh〜5MWh）</p>
                  <p className="text-slate-300 text-[11px]">温度ムラ≦2℃、C5防錆耐塩害仕様、サイクル寿命8000回</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigateTab('knowledge')}
                className="px-5 py-3 bg-[#d81a28] hover:bg-[#b51420] text-white font-bold text-xs rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>BESS技術ガイドラインを見る</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenContact}
                className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-md border border-white/20 transition-colors"
              >
                蓄電所開発の相談・見積依頼
              </button>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
              <img 
                src={APP_IMAGES.bessContainer} 
                alt="SOLNEXA 20ft Liquid Cooling BESS Container" 
                className="w-full h-72 sm:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-5">
                <span className="text-xs font-mono text-amber-400 font-bold">SOLNEXA-BESS-3720L</span>
                <p className="text-sm font-bold text-white">20ft 液冷式系統用蓄電池コンテナ（3.72MWh / LFP）</p>
                <p className="text-[11px] text-slate-300">消防法安全基準準拠 / 自動エアロゾル・ガス消火内蔵 / IP55</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5b. Corporate Philosophy & Company Profile Overview (Mục Tổng Quát Giới Thiệu Công Ty) */}
      <AboutSection 
        onNavigateTab={onNavigateTab}
        onOpenContact={onOpenContact}
        onOpenCompanyProfile={onOpenCompanyProfile}
      />

      {/* 6. Latest News & Market Updates (JPEA / Solar Frontier Style) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#002b49] rounded-xs" />
              <span className="text-xs font-extrabold text-[#002b49] tracking-wider uppercase">Information & Insights</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              <InlineEditableText
                value={siteConfig.sectionTitles?.news || '新着情報・市場動向・法令ニュース'}
                onSave={(val) => {
                  setSiteConfig(prev => ({
                    ...prev,
                    sectionTitles: { ...(prev.sectionTitles || {}), news: val }
                  }));
                  setHasUnsavedChanges(true);
                }}
                isEditMode={isInlineEditActive}
                label="Tiêu đề mục Tin tức & Pháp lý"
              />
            </h2>
          </div>

          {/* Category filter tabs & Admin Add Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              {['all', '政策・法令', 'プレスリリース', '技術動向', '補助金情報'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveNewsCategory(cat)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    activeNewsCategory === cat 
                      ? 'bg-[#002b49] text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'すべて' : cat}
                </button>
              ))}
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleAddNewNews}
                className="px-3.5 py-1.5 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs transition-all shrink-0 cursor-pointer"
                title="Tạo bản tin hoặc thông cáo mới"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Thêm tin tức mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean News List */}
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
          {filteredNews.map((item) => (
            <div 
              key={item.id}
              onClick={() => onNavigateTab('news')}
              className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2.5 text-xs text-slate-500">
                  <span className="font-mono text-slate-600">{item.date}</span>
                  <span aria-hidden="true" className="text-slate-300">·</span>
                  <span className="font-semibold text-[#002b49] bg-blue-50 px-2 py-0.5 rounded">{item.category}</span>
                  {item.isHot && (
                    <>
                      <span aria-hidden="true" className="text-slate-300">·</span>
                      <span className="text-[#d81a28] font-bold text-[11px]">重要</span>
                    </>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#002b49] transition-colors leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-500 line-clamp-1">
                  {item.summary}
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditNewsItem(item);
                    }}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs transition-all cursor-pointer"
                    title="Chỉnh sửa trực tiếp nội dung bài viết này"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Sửa bài viết</span>
                  </button>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-[#002b49]">
                  <span>記事を読む</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#d81a28]" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => onNavigateTab('news')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002b49] hover:underline"
          >
            <span>ニュース・法令レポート一覧へ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 7. Featured Project Case Studies (実証・施工実績) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#002b49] rounded-xs" />
              <span className="text-xs font-extrabold text-[#002b49] tracking-wider uppercase">Proven Track Record</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">
              <InlineEditableText
                value={siteConfig.sectionTitles?.projects || '主要導入事例・プロジェクト実績'}
                onSave={(val) => {
                  setSiteConfig(prev => ({
                    ...prev,
                    sectionTitles: { ...(prev.sectionTitles || {}), projects: val }
                  }));
                  setHasUnsavedChanges(true);
                }}
                isEditMode={isInlineEditActive}
                label="Tiêu đề mục Dự án tiêu biểu"
              />
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              全国の特別高圧メガソーラーおよび系統用蓄電所の設計・施工支援実績をご紹介します。
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('projects')}
            className="text-xs font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 shrink-0"
          >
            <span>実績一覧を見る</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Project 1 */}
          <div 
            onClick={() => onNavigateTab('projects')}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#002b49] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={APP_IMAGES.solarFacility} 
                  alt="福島相馬 系統用大型蓄電所" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-[#002b49]/90 backdrop-blur-xs text-white text-[11px] font-bold rounded">
                  特別高圧 66kV連系
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="text-xs text-slate-500">
                  福島県相馬市 ｜ 2025年竣工
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#002b49] transition-colors">
                  40MW / 160MWh 系統用大型蓄電所
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  東北電力エリアにおける系統安定化および容量市場応札案件。消防法完全準拠の液冷蓄電コンテナ40台と特高変電設備を一括納入。
                </p>
              </div>
            </div>
            <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002b49]">
              <span>詳細を見る</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#d81a28]" />
            </div>
          </div>

          {/* Project 2 */}
          <div 
            onClick={() => onNavigateTab('projects')}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#002b49] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={APP_IMAGES.headerBanner} 
                  alt="北海道十勝 FIPメガソーラー＋BESS" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-[#002b49]/90 backdrop-blur-xs text-white text-[11px] font-bold rounded">
                  FIP 蓄電池併設
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="text-xs text-slate-500">
                  北海道十勝郡 ｜ 2025年竣工
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#002b49] transition-colors">
                  15MW 太陽光 ＋ 30MWh 蓄電池複合所
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  北海道電力エリアのノンファーム型接続案件。出力制御時間帯の発電電力を蓄電コンテナに充電し、夜間放電でインバランスを回避。
                </p>
              </div>
            </div>
            <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002b49]">
              <span>詳細を見る</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#d81a28]" />
            </div>
          </div>

          {/* Project 3 */}
          <div 
            onClick={() => onNavigateTab('projects')}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-[#002b49] hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={APP_IMAGES.ambientBg} 
                  alt="群馬 大型物流センター 屋根置自家消費" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-[#002b49]/90 backdrop-blur-xs text-white text-[11px] font-bold rounded">
                  オンサイトPPA
                </div>
              </div>
              <div className="p-5 space-y-2">
                <div className="text-xs text-slate-500">
                  群馬県太田市 ｜ 2024年竣工
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#002b49] transition-colors">
                  2.4MW 物流施設屋根置 自家消費PPA
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  折板屋根ハゼ締め金具固定による孔開けレス工法を採用。年間約2,600MWhを発電し、施設の消費電力の45%を再エネでカバー。
                </p>
              </div>
            </div>
            <div className="px-5 pb-4 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002b49]">
              <span>詳細を見る</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#d81a28]" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. Gateway to Engineering Workspace (会員特典 & ツールへの誘導) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
              <span className="text-xs font-extrabold text-[#002b49] uppercase tracking-wider">Engineering Platform</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">基本計算無料 ｜ 会員登録ですべて無制限</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900">
              SOLNEXA クラウド統合設計・電気解析ワークスペース
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              太陽光発電および系統用蓄電池の基本設計・電気解析をブラウザ上で完結。主要メーカーの仕様書PDF自動解析、JIS C 3605規格に基づくケーブル電圧降下計算、単線結線図（SLD）作図、および工事内訳書（BOQ・見積書）を即座に出力できます。
            </p>
            <div className="flex flex-wrap gap-2 pt-2 text-xs text-slate-700">
              <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 font-medium">単線結線図 (SLD)</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 font-medium">JIS C 3605 ケーブル計算</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 font-medium">BESS充放電サイジング</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 font-medium">仕様書PDF AI解析</span>
              <span className="px-2.5 py-1 bg-slate-100 rounded-md border border-slate-200 font-medium">BOQ内訳書・見積生成</span>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3 justify-center">
            <button
              onClick={onOpenEngineeringTools}
              className="w-full py-3.5 px-5 bg-[#002b49] hover:bg-[#001d32] active:scale-95 text-white rounded-md font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>ワークスペースを起動する</span>
            </button>
            {!isLoggedIn ? (
              <button
                onClick={onOpenLogin}
                className="w-full py-2.5 px-5 bg-[#d81a28] hover:bg-[#b51420] text-white rounded-md font-bold text-xs shadow-xs transition-colors text-center flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>無料会員登録で全機能を開放</span>
              </button>
            ) : (
              <div className="text-center text-xs text-emerald-700 font-bold bg-emerald-50 py-2 rounded border border-emerald-200">
                ✓ 会員ログイン済み（全機能利用可能）
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. Contact & Consultation CTA Bar - Solar Frontier Navy & Red */}
      <section className="bg-gradient-to-r from-blue-50 via-white to-blue-50 rounded-xl border border-blue-200 p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          太陽光発電・系統用蓄電池の計画・設計・機器調達をご検討ですか？
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          株式会社ソルネクサでは、現地調査・基本計画から系統連系協議、消防法協議、主要機器供給、詳細設計図面作成まで経験豊富な専門エンジニアが誠意をもって対応いたします。
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <button
            onClick={onOpenContact}
            className="px-6 py-3.5 bg-[#d81a28] hover:bg-[#b51420] text-white font-bold text-sm rounded-md shadow-sm transition-all hover:scale-105 active:scale-95"
          >
            お問い合わせ・無料見積相談
          </button>
          <button
            onClick={onOpenContact}
            className="px-6 py-3.5 bg-white hover:bg-slate-50 text-[#002b49] font-bold text-sm rounded-md border border-[#002b49] shadow-xs transition-all"
          >
            製品カタログ・設計資料請求
          </button>
        </div>
      </section>
      {/* Admin Floating Control Dock */}
      {isAdmin && (
        <AdminEditFloatingBar
          isAdmin={isAdmin}
          adminName={currentUser?.name || 'Administrator'}
          isInlineEditActive={isInlineEditActive}
          onToggleInlineEdit={() => setIsInlineEditActive(!isInlineEditActive)}
          onOpenCustomizer={() => setIsCustomizerOpen(true)}
          onQuickAddButton={handleQuickAddButton}
          onSaveConfig={() => handleSaveConfig()}
          isSaving={isSavingConfig}
          hasUnsavedChanges={hasUnsavedChanges}
        />
      )}

      {/* Admin Visual Customizer Modal (Theme, Background, Typography, Colors, Buttons, Metrics, Articles) */}
      <AdminVisualCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={siteConfig}
        onChangeConfig={(newConfig: SiteConfig) => {
          setSiteConfig(newConfig);
          setHasUnsavedChanges(true);
        }}
        onSaveToServer={() => handleSaveConfig()}
        onResetToDefault={handleResetConfig}
        onOpenArticleEditor={(targetType) => {
          setArticleTargetType(targetType);
          setArticleToEdit(null);
          setIsArticleModalOpen(true);
        }}
      />

      {/* In-place Article & News Editor Modal */}
      <ArticleEditorModal
        isOpen={isArticleModalOpen}
        onClose={() => {
          setIsArticleModalOpen(false);
          setArticleToEdit(null);
        }}
        initialData={articleToEdit}
        targetType={articleTargetType}
        mode={articleToEdit ? 'edit' : 'create'}
        onSaveSuccess={handleArticleSaveSuccess}
      />
    </div>
  );
};
