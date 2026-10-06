import React from 'react';
import {
  Home,
  LayoutDashboard,
  FolderGit2,
  Database,
  FileText,
  Zap,
  Cable,
  CreditCard,
  Calculator,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cpu,
  Boxes,
  Network,
  Sliders,
  Activity,
  Ruler,
  ShieldCheck,
  FileSpreadsheet,
  DollarSign,
  Folder,
  BatteryCharging,
  LineChart,
  GitFork,
  ArrowLeft,
  CloudSnow
} from 'lucide-react';
import { ActiveTab } from '../types';
import { APP_IMAGES } from '../assets/images';
import { SolnexaLogo } from './corporate/SolnexaLogo';

export type QuickToolId =
  | 'snow-weather'
  | 'kyokuto-vdrop'
  | 'circuit-vdrop'
  | 'pv-string-check'
  | 'current-calc'
  | 'isijp-conduit'
  | 'cable-selection'
  | 'pv-pcs-cable'
  | 'transformer-sizing';

export const QUICK_TOOLS_SIDEBAR_ITEMS = [
  {
    id: 'snow-weather' as QuickToolId,
    name: '積雪・気象条件 (告示1455号)',
    en: 'Snow & Weather',
    icon: CloudSnow,
    badge: '無料',
    isMember: false,
    iconBg: 'text-sky-600 bg-sky-50'
  },
  {
    id: 'kyokuto-vdrop' as QuickToolId,
    alias: ['circuit-vdrop'] as QuickToolId[],
    name: '極東電線 電圧降下',
    en: 'Kyokuto Voltage Drop',
    icon: Activity,
    badge: '無料',
    isMember: false,
    iconBg: 'text-amber-600 bg-amber-50'
  },
  {
    id: 'pv-string-check' as QuickToolId,
    name: 'PV ストリング検討',
    en: 'PV String Check',
    icon: Sliders,
    badge: '無料',
    isMember: false,
    iconBg: 'text-indigo-600 bg-indigo-50'
  },
  {
    id: 'current-calc' as QuickToolId,
    name: '電流計算 & ブレーカ',
    en: 'Current Calculation',
    icon: Calculator,
    badge: '無料',
    isMember: false,
    iconBg: 'text-emerald-600 bg-emerald-50'
  },
  {
    id: 'isijp-conduit' as QuickToolId,
    alias: ['cable-selection'] as QuickToolId[],
    name: '電線管・配管選定',
    en: 'ISIJP Conduit Sizing',
    icon: Cable,
    badge: '会員',
    isMember: true,
    iconBg: 'text-purple-600 bg-purple-50'
  },
  {
    id: 'pv-pcs-cable' as QuickToolId,
    name: 'PV-PCS 配線設計',
    en: 'PV-PCS Cable Design',
    icon: Zap,
    badge: '会員',
    isMember: true,
    iconBg: 'text-blue-600 bg-blue-50'
  },
  {
    id: 'transformer-sizing' as QuickToolId,
    name: '変圧器容量選定',
    en: 'Transformer Sizing',
    icon: Boxes,
    badge: '会員',
    isMember: true,
    iconBg: 'text-rose-600 bg-rose-50'
  }
];

export type ProjectSubView =
  | 'overview'
  | 'pv-array'
  | 'bess-storage'
  | 'pcs'
  | 'transformer'
  | 'grid'
  | 'string-design'
  | 'cable-voltage-drop'
  | 'equipment-sizing'
  | 'simulation'
  | 'schematic'
  | 'protection'
  | 'boq'
  | 'quotation'
  | 'reports'
  | 'files'
  | 'project-settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  activeProjectSubView?: ProjectSubView;
  onSelectProjectSubView?: (view: ProjectSubView) => void;
  onExitProjectToProjects?: () => void;
  projectType?: 'SOLAR_PV' | 'BESS';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  onBackToCorporate?: () => void;
  activeQuickTool?: QuickToolId;
  onSelectQuickTool?: (tool: QuickToolId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  activeProjectSubView = 'overview',
  onSelectProjectSubView,
  onExitProjectToProjects,
  projectType = 'SOLAR_PV',
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onMobileClose,
  onBackToCorporate,
  activeQuickTool = 'snow-weather',
  onSelectQuickTool
}) => {
  const isWorkspaceMode = activeTab === 'workspace';

  // Global Platform Navigation Items (Screen 1 & 6)
  const globalNavItems = [
    { id: 'dashboard' as ActiveTab, label: 'ホーム', jp: 'ホーム', icon: Home },
    { id: 'quick-engineering' as ActiveTab, label: 'クイック設計ツール', jp: 'クイック設計', icon: Zap },
    { id: 'projects' as ActiveTab, label: 'プロジェクト一覧', jp: 'プロジェクト', icon: FolderGit2 },
    { id: 'library' as ActiveTab, label: '機器データベース', jp: '機器ライブラリ', icon: Cpu },
    { id: 'cables' as ActiveTab, label: 'JISケーブル規格', jp: 'ケーブル規格', icon: Cable },
    { id: 'datasheets' as ActiveTab, label: '仕様書データAI解析', jp: '仕様書データ', icon: Database },
    { id: 'price-book' as ActiveTab, label: '積算価格マスタ', jp: '価格マスタ', icon: CreditCard },
    { id: 'settings' as ActiveTab, label: 'システム設定', jp: '設定', icon: Settings }
  ];

  // Project Workspace Navigation Sections - tailored for Solar PV vs BESS
  const isBess = projectType === 'BESS';

  const projectNavSections = [
    {
      title: 'システム構成・主要設備',
      items: isBess
        ? [
            { id: 'bess-storage' as ProjectSubView, label: '蓄電システム (BESS)', icon: BatteryCharging },
            { id: 'pcs' as ProjectSubView, label: 'パワコン (PCS)', icon: Cpu },
            { id: 'transformer' as ProjectSubView, label: '昇圧変圧器', icon: Boxes },
            { id: 'grid' as ProjectSubView, label: '系統連系協調', icon: Network }
          ]
        : [
            { id: 'pv-array' as ProjectSubView, label: 'PVモジュールアレイ', icon: Sun },
            { id: 'pcs' as ProjectSubView, label: 'パワコン (PCS)', icon: Cpu },
            { id: 'transformer' as ProjectSubView, label: '受変電トランス', icon: Boxes },
            { id: 'grid' as ProjectSubView, label: '系統連系協調', icon: Network }
          ]
    },
    {
      title: '詳細エンジニアリング',
      items: isBess
        ? [
            { id: 'cable-voltage-drop' as ProjectSubView, label: 'ケーブル・電圧降下', icon: Activity },
            { id: 'equipment-sizing' as ProjectSubView, label: '空調・補機負荷計算', icon: Ruler },
            { id: 'simulation' as ProjectSubView, label: '充放電シミュレーション', icon: LineChart },
            { id: 'schematic' as ProjectSubView, label: '単線結線図 (SLD)', icon: GitFork },
            { id: 'protection' as ProjectSubView, label: '保護継電器協調', icon: ShieldCheck }
          ]
        : [
            { id: 'string-design' as ProjectSubView, label: 'ストリング設計・Voc', icon: Sliders },
            { id: 'cable-voltage-drop' as ProjectSubView, label: 'ケーブル・電圧降下', icon: Activity },
            { id: 'equipment-sizing' as ProjectSubView, label: '設備容量サイジング', icon: Ruler },
            { id: 'simulation' as ProjectSubView, label: '発電量シミュレーション', icon: LineChart },
            { id: 'schematic' as ProjectSubView, label: '単線結線図 (SLD)', icon: GitFork },
            { id: 'protection' as ProjectSubView, label: '保護継電器協調', icon: ShieldCheck }
          ]
    },
    {
      title: '積算・見積もり',
      items: [
        { id: 'boq' as ProjectSubView, label: '工事内訳書 (BOQ)', icon: FileSpreadsheet },
        { id: 'quotation' as ProjectSubView, label: '概算見積書出力', icon: DollarSign }
      ]
    },
    {
      title: '設計図書・設定',
      items: [
        { id: 'reports' as ProjectSubView, label: '技術計算レポート', icon: FileText },
        { id: 'files' as ProjectSubView, label: '仕様書・図面保管', icon: Folder },
        { id: 'project-settings' as ProjectSubView, label: 'プロジェクト設定', icon: Settings }
      ]
    }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col bg-white border-r border-slate-200/90 text-slate-700 transition-all duration-200 ease-in-out select-none shadow-2xs ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${isCollapsed ? 'w-16' : 'w-64'}`}
    >
      {/* 1. Header / Logo Branding */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-slate-100 shrink-0">
        <button
          type="button"
          onClick={() => {
            if (onBackToCorporate) {
              onBackToCorporate();
            } else {
              onSelectTab('dashboard');
            }
            onMobileClose?.();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center cursor-pointer overflow-hidden min-w-0 text-left focus:outline-hidden group"
          title="SOLNEXA ホームページ / コーポレートサイトへ戻る"
        >
          {isCollapsed ? (
            <SolnexaLogo size="sm" variant="mark-only" />
          ) : (
            <SolnexaLogo size="sm" variant="horizontal" showSlogan={false} />
          )}
        </button>
      </div>

      {/* 2. Navigation Area */}
      <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3 custom-scrollbar">
        {/* CASE A: WORKSPACE MODE (Screens 2, 3, 4, 5) */}
        {isWorkspaceMode ? (
          <div className="space-y-3">
            {/* Overview Button (Screen 2) */}
            <div>
              <button
                onClick={() => {
                  onSelectProjectSubView?.('overview');
                  onMobileClose?.();
                }}
                className={`w-full flex items-center rounded-lg text-xs font-semibold transition-colors ${
                  isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
                } ${
                  activeProjectSubView === 'overview'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
                title={isCollapsed ? 'Overview' : undefined}
              >
                <LayoutDashboard className={`w-4 h-4 shrink-0 ${activeProjectSubView === 'overview' ? 'text-blue-600' : 'text-slate-400'}`} />
                {!isCollapsed && <span>Overview / 概要</span>}
              </button>
            </div>

            {/* Project Navigation Sections */}
            {projectNavSections.map(section => (
              <div key={section.title} className="space-y-0.5">
                {!isCollapsed && (
                  <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {section.title}
                  </div>
                )}
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = activeProjectSubView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectProjectSubView?.(item.id);
                        onMobileClose?.();
                      }}
                      className={`w-full flex items-center rounded-lg text-xs font-medium transition-colors ${
                        isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
                      } ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-semibold'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* CASE B: GLOBAL PLATFORM MODE (Screen 1) */
          <div className="space-y-1">
            {globalNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onMobileClose?.();
                  }}
                  className={`w-full flex items-center rounded-lg text-xs font-medium transition-colors ${
                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2 space-x-2.5'
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {!isCollapsed && (
                    <div className="flex items-baseline justify-between w-full min-w-0 pr-1">
                      <span className="truncate font-medium">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal ml-1 shrink-0">{item.jp}</span>
                    </div>
                  )}
                </button>
              );
            })}

            {/* Quick Engineering Sub-tools List - Vertical Navigation in Green Box Area (User Requested) */}
            {activeTab === 'quick-engineering' && (
              <div className="pt-2.5 mt-2.5 border-t border-slate-200/90 space-y-1 animate-in fade-in duration-150">
                {!isCollapsed && (
                  <div className="px-2 py-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                      設計計算ツール (7)
                    </span>
                    <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold border border-blue-200/60">
                      垂直切替
                    </span>
                  </div>
                )}
                {QUICK_TOOLS_SIDEBAR_ITEMS.map(tool => {
                  const Icon = tool.icon;
                  const isSelected = activeQuickTool === tool.id || (tool.alias && tool.alias.includes(activeQuickTool as any));

                  return (
                    <button
                      key={tool.id}
                      onClick={() => {
                        onSelectTab('quick-engineering');
                        onSelectQuickTool?.(tool.id);
                        onMobileClose?.();
                      }}
                      className={`w-full flex items-center rounded-xl text-xs transition-all cursor-pointer ${
                        isCollapsed ? 'justify-center p-2' : 'px-2.5 py-2 space-x-2'
                      } ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-500/25 ring-1 ring-blue-500'
                          : 'text-slate-700 hover:bg-slate-100/90 hover:text-slate-900 font-medium'
                      }`}
                      title={isCollapsed ? `${tool.name} (${tool.en})` : undefined}
                    >
                      <div className={`p-1 rounded-lg shrink-0 ${
                        isSelected ? 'bg-white/20 text-white' : tool.iconBg
                      }`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      {!isCollapsed && (
                        <div className="flex items-center justify-between flex-1 min-w-0 text-left">
                          <span className="truncate text-[11px] leading-tight font-semibold">
                            {tool.name}
                          </span>
                          <span className={`text-[9px] px-1 py-0.2 rounded ml-1 shrink-0 font-medium ${
                            isSelected 
                              ? 'bg-white/20 text-white'
                              : tool.isMember 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {tool.badge}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Footer */}
      <div className="border-t border-slate-100 flex flex-col shrink-0 bg-slate-50/50">
        {onBackToCorporate && (
          <button
            onClick={() => {
              onBackToCorporate();
              onMobileClose?.();
            }}
            className={`w-full flex items-center gap-2 p-2.5 text-xs font-bold text-[#003366] hover:bg-blue-50 border-b border-slate-100 transition-colors ${
              isCollapsed ? 'justify-center' : 'px-3'
            }`}
            title="株式会社ソルネクサ 公式コーポレートサイトへ戻る"
          >
            <ArrowLeft className="w-4 h-4 shrink-0 text-[#003366]" />
            {!isCollapsed && <span className="truncate">コーポレートサイトへ戻る</span>}
          </button>
        )}
        <div className="h-10 px-3.5 flex items-center justify-between text-slate-400 text-xs">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-mono text-[10px] text-slate-500">SOLNEXA 日本標準</span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-auto"
            title={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
