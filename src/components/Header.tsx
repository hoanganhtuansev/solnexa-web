import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Bell,
  Menu,
  ChevronRight,
  Check,
  CheckCheck,
  Zap,
  Cpu,
  FolderGit2,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Shield,
  User,
  LogOut,
  ExternalLink,
  X,
  Plus,
  ArrowLeft,
  Building2,
  Home
} from 'lucide-react';
import { ActiveTab } from '../types';
import { ProjectSubView } from './Sidebar';
import { APP_IMAGES } from '../assets/images';

interface HeaderProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  projectName?: string;
  activeProjectSubView?: ProjectSubView;
  onSelectProjectSubView?: (view: ProjectSubView) => void;
  onToggleMobileSidebar: () => void;
  isSidebarCollapsed: boolean;
  onOpenSettings?: () => void;
  onBackToCorporate?: () => void;
  currentUser?: any;
  isLoggedIn?: boolean;
  onLogout?: () => void;
  onOpenLogin?: () => void;
}

const TAB_LABELS: Record<string, string> = {
  dashboard: '統合エンジニアリングワークスペース',
  'quick-engineering': 'クイック設計・計算ツール',
  projects: 'プロジェクト一覧・パイプライン',
  workspace: 'プロジェクト設計空間',
  library: '機器仕様ライブラリ',
  cables: 'JIS C 3605 ケーブル規格',
  datasheets: '仕様書データAI解析',
  ingest: 'データシートPDF取込',
  review: '仕様データ照合・承認',
  'price-book': '機器・工事積算価格マスタ',
  boq: '工事内訳書 (BOQ) ＆ 概算見積',
  tools: 'エンジニアリングツール',
  calculators: '各種技術計算機',
  settings: 'システム設定'
};

const SUBVIEW_LABELS: Record<ProjectSubView, string> = {
  overview: '設計概要・全体サマリー',
  'pv-array': 'PVモジュールアレイ配置',
  'bess-storage': '系統用蓄電システム (BESS)',
  pcs: 'パワーコンディショナ (PCS)',
  transformer: '受変電・昇圧変圧器',
  grid: '電力会社系統連系協調',
  'string-design': 'ストリング設計・Voc検証',
  'cable-voltage-drop': 'ケーブル選定・電圧降下計算',
  'equipment-sizing': '補機・空調容量サイジング',
  simulation: '発電量・充放電シミュレーション',
  schematic: '単線結線図 (SLD) エディタ',
  protection: '保護継電器協調・保安',
  boq: '工事内訳書 (BOQ)',
  quotation: '概算見積書出力',
  reports: '技術計算書・総合レポート',
  files: '設計図面・データシート保管',
  'project-settings': 'プロジェクト個別設定'
};

interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'warning' | 'info' | 'success';
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  projectName = 'Chiba Factory Solar',
  activeProjectSubView = 'overview',
  onSelectProjectSubView,
  onToggleMobileSidebar,
  onOpenSettings,
  onBackToCorporate,
  currentUser,
  isLoggedIn = false,
  onLogout,
  onOpenLogin
}) => {
  const isWorkspace = activeTab === 'workspace';

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Circuit C04 Voltage Drop Notice',
      desc: 'Voltage drop reached 2.82% on 300m run (threshold: 3.0%). Recommend 95mm² conductor.',
      time: '10m ago',
      read: false,
      type: 'warning'
    },
    {
      id: 'n2',
      title: 'Datasheet Specification Verified',
      desc: 'Sungrow SG500HV PCS & Trina 580W TOPCon parameters approved by Lead Engineer.',
      time: '1h ago',
      read: false,
      type: 'success'
    },
    {
      id: 'n3',
      title: 'Commercial Price Master Updated',
      desc: '2026 Q2 PV module benchmark updated to ¥28.5/W for utility scale projects.',
      time: '3h ago',
      read: false,
      type: 'info'
    }
  ]);

  // Profile menu state
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsNotifOpen(false);
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search items list
  const searchableItems = [
    { title: 'Chiba 1MW Solar — Reference Engineering', category: 'Project', tab: 'workspace' as ActiveTab, sub: 'overview' as ProjectSubView, icon: FolderGit2 },
    { title: 'Saitama 2MW / 8.146MWh Utility BESS', category: 'Project', tab: 'workspace' as ActiveTab, sub: 'bess-storage' as ProjectSubView, icon: FolderGit2 },
    { title: 'Circuit Voltage Drop Calculator', category: 'Tool', tab: 'quick-engineering' as ActiveTab, sub: undefined, icon: Zap },
    { title: 'Cable Selection & Ampacity Master', category: 'Tool', tab: 'cables' as ActiveTab, sub: undefined, icon: Zap },
    { title: 'Trina Vertex N TSM-580NE19R', category: 'Equipment', tab: 'library' as ActiveTab, sub: undefined, icon: Cpu },
    { title: 'Sungrow SG500HV 500kW Central PCS', category: 'Equipment', tab: 'library' as ActiveTab, sub: undefined, icon: Cpu },
    { title: 'Commercial Cost Quotation & BOQ', category: 'Commercial', tab: 'boq' as ActiveTab, sub: undefined, icon: FileSpreadsheet },
    { title: 'JIS C 8955 / IEC 60364-7-712 Standard Data', category: 'Data', tab: 'datasheets' as ActiveTab, sub: undefined, icon: Shield }
  ];

  const filteredSearchResults = searchableItems.filter(item =>
    searchQuery.trim() === '' ||
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markAllNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between transition-all">
      {/* Left: Mobile hamburger, Solnexa Home Link & Workspace Breadcrumbs */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Solnexa Home Return Button (Available everywhere) */}
        <button
          type="button"
          onClick={() => {
            if (onBackToCorporate) {
              onBackToCorporate();
            } else {
              onSelectTab('dashboard');
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-slate-700 hover:text-[#003366] hover:bg-blue-50/80 transition-all cursor-pointer group shrink-0 border border-transparent hover:border-blue-200/60"
          title="SOLNEXA ホームページ / トップ画面へ戻る"
        >
          <Home className="w-4 h-4 text-[#003366] group-hover:scale-110 transition-transform" />
          <span className="font-bold text-xs text-[#003366] hidden md:inline">SOLNEXA ホーム</span>
        </button>

        {isWorkspace ? (
          <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-medium truncate">
            <button
              onClick={() => onSelectTab('projects')}
              className="hover:text-blue-600 hover:underline flex items-center space-x-1 font-normal text-slate-500 transition-colors"
            >
              <span>←</span>
              <span>Projects</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <button
              onClick={() => onSelectProjectSubView?.('overview')}
              className={`hover:text-blue-600 transition-colors truncate ${
                activeProjectSubView === 'overview' ? 'text-slate-900 font-semibold' : 'text-slate-500'
              }`}
            >
              {projectName}
            </button>

            {activeProjectSubView !== 'overview' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-slate-900 font-semibold truncate bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                  {SUBVIEW_LABELS[activeProjectSubView]}
                </span>
              </>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-500 font-medium">
            <span className="text-slate-400">Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-900 font-semibold">{TAB_LABELS[activeTab] || 'Workspace'}</span>
          </div>
        )}
      </div>

      {/* Right: Search Input, Quick Command, Notifications, User Avatar "HT" */}
      <div className="flex items-center space-x-3 shrink-0">
        {/* Search input with functional Command Palette popup */}
        <div ref={searchContainerRef} className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="Search projects, equipment... (⌘K)"
            className="w-full pl-8.5 pr-10 py-1.5 rounded-lg border border-slate-200 bg-slate-50/80 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all font-normal"
          />
          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-white border border-slate-200 rounded-sm pointer-events-none">
              ⌘K
            </kbd>
          )}

          {/* Live Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-full mt-1.5 right-0 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Quick Search / クイック検索</span>
                <span className="text-[10px] text-slate-400">{filteredSearchResults.length} results</span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {filteredSearchResults.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching item found.
                  </div>
                ) : (
                  filteredSearchResults.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          onSelectTab(item.tab);
                          if (item.sub && onSelectProjectSubView) {
                            onSelectProjectSubView(item.sub);
                          }
                          setIsSearchOpen(false);
                          setSearchQuery('');
                        }}
                        className="w-full text-left px-3 py-2.5 hover:bg-blue-50/70 transition-colors flex items-center space-x-2.5 group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 truncate">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.category}
                          </div>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500" />
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Back to Corporate Portal Button */}
        {onBackToCorporate && (
          <button
            onClick={onBackToCorporate}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-[#003366] bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors shadow-2xs shrink-0 cursor-pointer"
            title="株式会社ソルネクサ 公式コーポレートサイトへ戻る"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">コーポレートサイトへ</span>
            <span className="sm:hidden">企業ポータル</span>
          </button>
        )}

        {/* Quick New Project Button */}
        <button
          onClick={() => onSelectTab('projects')}
          className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs shrink-0 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>新規プロジェクト</span>
        </button>

        {/* Notifications Bell with real dropdown */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className={`relative p-1.5 rounded-lg transition-colors cursor-pointer ${
              isNotifOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Engineering Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute top-full mt-2 right-0 w-84 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-100">
              <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded-full">
                    {unreadCount} new
                  </span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-medium flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 hover:bg-slate-50 transition-colors flex items-start space-x-3 ${
                      !n.read ? 'bg-blue-50/30' : ''
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        n.type === 'warning'
                          ? 'bg-amber-500'
                          : n.type === 'success'
                          ? 'bg-emerald-500'
                          : 'bg-blue-500'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 ml-2 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    setIsNotifOpen(false);
                    onSelectTab('workspace');
                    if (onSelectProjectSubView) onSelectProjectSubView('cable-voltage-drop');
                  }}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Review Circuits &amp; Standards →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Settings Button */}
        <button
          onClick={() => {
            onSelectTab('settings');
            onOpenSettings?.();
          }}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
          }`}
          title="System Settings (システム設定)"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* User Profile or Login Button */}
        {isLoggedIn && currentUser ? (
          <div ref={profileRef} className="relative">
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 pl-1 cursor-pointer select-none group"
              title={`${currentUser.name} - ${currentUser.role}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-transparent group-hover:ring-blue-400/40 transition-all uppercase">
                {currentUser.name ? currentUser.name.slice(0, 2) : 'US'}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                  <span className="truncate max-w-[110px]">{currentUser.name}</span>
                  {currentUser.isAdmin && (
                    <span className="text-[9px] font-bold bg-[#d81a28] text-white px-1.5 py-0.2 rounded tracking-wider uppercase">
                      ADMIN
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
                  {currentUser.role || 'Partner Engineer'}
                </div>
              </div>
            </div>

            {isProfileOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in duration-100">
                <div className="p-4 bg-slate-900 text-white">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 font-black text-sm flex items-center justify-center ring-2 ring-white/30 uppercase">
                      {currentUser.name ? currentUser.name.slice(0, 2) : 'US'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                        <span>{currentUser.name}</span>
                        {currentUser.isAdmin && (
                          <span className="text-[9px] font-bold bg-[#d81a28] text-white px-1.5 py-0.2 rounded uppercase">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono truncate">{currentUser.email}</div>
                      <div className="text-[10px] text-slate-300 truncate">{currentUser.role}</div>
                      <div className="text-[9px] text-slate-400 truncate">{currentUser.company}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2 text-xs space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onOpenSettings?.();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <SettingsIcon className="w-4 h-4 text-slate-400" />
                    <span>Platform &amp; AI Settings (設定)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSelectTab('price-book');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-slate-400" />
                    <span>Commercial Price Book (価格マスタ)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSelectTab('datasheets');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-700 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Standards &amp; Datasheets (規格)</span>
                  </button>
                  {onLogout && (
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 font-medium flex items-center space-x-2.5 transition-colors cursor-pointer border-t border-slate-100 pt-2"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>ログアウト (Logout)</span>
                    </button>
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-[11px] text-slate-500 bg-slate-50 flex items-center justify-between">
                  <span>SOLNEXA v1.6.0 Pro</span>
                  <span className="text-emerald-600 font-bold flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    <span>Connected</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onOpenLogin}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-300" />
            <span>ログイン</span>
          </button>
        )}
      </div>
    </header>
  );
};

