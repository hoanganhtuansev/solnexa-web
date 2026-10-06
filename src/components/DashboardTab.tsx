import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Clock,
  FileSpreadsheet,
  Cpu,
  Layers,
  Zap,
  Cable,
  Calculator,
  Compass,
  ArrowRight,
  Sun,
  BatteryCharging,
  Sliders,
  Sparkles,
  Tag,
  Activity,
  GitFork,
  DollarSign,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Boxes,
  FileText,
  ChevronRight,
  CloudSnow
} from 'lucide-react';
import { Project, ActiveTab } from '../types';
import { NewProjectModal } from './NewProjectModal';
import { APP_IMAGES } from '../assets/images';

interface DashboardTabProps {
  onNavigateToTab: (tab: ActiveTab) => void;
  onOpenProject: (projectId: string) => void;
  onNewProject: (type: 'SOLAR_PV' | 'BESS') => void;
  onOpenQuickTool: (toolName: string) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigateToTab,
  onOpenProject,
  onNewProject,
  onOpenQuickTool
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    totalProjects: 12,
    projectsInDesign: 5,
    projectsQuotation: 3,
    totalEquipment: 24,
    datasheetsProcessed: 18
  });
  const [loading, setLoading] = useState(true);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [newProjectType, setNewProjectType] = useState<'SOLAR_PV' | 'BESS'>('SOLAR_PV');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [projRes, statsRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/stats')
      ]);

      if (projRes.ok) {
        const projData = await projRes.json();
        setProjects(projData);
      }
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(prev => ({
          totalProjects: statsData.totalProjects || prev.totalProjects,
          projectsInDesign: statsData.projectsInDesign || prev.projectsInDesign,
          projectsQuotation: statsData.projectsQuotation || prev.projectsQuotation,
          totalEquipment: statsData.totalEquipment || prev.totalEquipment,
          datasheetsProcessed: statsData.datasheetsProcessed || prev.datasheetsProcessed
        }));
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData: any) => {
    try {
      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      });
      setProjects(prev => [projectData, ...prev]);
      setStats(prev => ({ ...prev, totalProjects: prev.totalProjects + 1, projectsInDesign: prev.projectsInDesign + 1 }));
      onOpenProject(projectData.id);
    } catch (err) {
      console.error('Failed to create project:', err);
      onOpenProject('proj-chiba-solar');
    }
  };

  // Fallback projects matching exactly the 2 requested sample projects
  const fallbackProjects = [
    {
      id: 'proj-chiba-solar',
      name: 'Chiba 500kW Commercial Solar PV',
      type: 'Solar PV',
      capacity: '500 kWp / 500 kW',
      status: 'In Design',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      progress: '60%',
      updated: '2026/03/20',
      iconType: 'solar'
    },
    {
      id: 'proj-tokyo-bess',
      name: 'Yokohama Port 2MW / 8MWh Utility BESS',
      type: 'BESS',
      capacity: '2 MW / 8 MWh (4x Huawei Containers)',
      status: 'In Design',
      statusClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      progress: '35%',
      updated: '2026/03/20',
      iconType: 'bess'
    }
  ];

  const displayProjects = projects.length > 0
    ? projects.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type === 'BESS' ? 'BESS' : 'Solar PV',
        capacity: p.capacityDisplay || (p.type === 'BESS' ? `${p.storagePowerMw || 2} MW / ${p.storageCapacityMwh || 8} MWh` : `${p.totalPvCapacityKwp || 500} kWp`),
        status: p.status === 'IN_DESIGN' ? 'In Design' : p.status === 'QUOTATION' ? 'Quotation' : 'Completed',
        statusClass: p.status === 'IN_DESIGN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200',
        progress: `${p.completionPercent || 50}%`,
        updated: p.updatedAt ? new Date(p.updatedAt).toISOString().split('T')[0].replace(/-/g, '/') : '2026/03/20',
        iconType: p.type === 'BESS' ? 'bess' : 'solar'
      }))
    : fallbackProjects;

  return (
    <div className="relative space-y-6 pb-12">
      {/* Ambient Blurred Engineering Wallpaper at Top & Top-Left */}
      <div className="pointer-events-none absolute -top-8 -left-6 -right-6 h-[400px] overflow-hidden select-none -z-0">
        {/* Soft, blurred high-res engineering wallpaper in top-left */}
        <div
          className="absolute -top-12 -left-12 w-[640px] lg:w-[840px] h-[360px] bg-cover bg-left-top rounded-br-[160px] opacity-25 filter blur-2xl transform-gpu transition-opacity duration-500"
          style={{
            backgroundImage: `url(${APP_IMAGES.ambientHomeBg})`,
            maskImage: 'radial-gradient(circle at 20% 20%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 80%)',
            WebkitMaskImage: 'radial-gradient(circle at 20% 20%, rgba(0,0,0,1) 35%, rgba(0,0,0,0) 80%)'
          }}
        />
        {/* Ambient cyan/blue glow accent across top */}
        <div className="absolute -top-20 left-12 w-[480px] h-[260px] bg-gradient-to-r from-blue-500/15 via-cyan-400/10 to-transparent rounded-full filter blur-3xl" />
        <div className="absolute -top-16 left-1/3 w-[500px] h-[220px] bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full filter blur-3xl" />
      </div>

      {/* 1. Executive Workspace Header with subtle top-left wallpaper & frosted glass */}
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        {/* Subtle blurred corner wallpaper on header card */}
        <div
          className="absolute -top-6 -left-6 w-96 h-full pointer-events-none opacity-20 filter blur-md bg-cover bg-left-top -z-0"
          style={{
            backgroundImage: `url(${APP_IMAGES.ambientHomeBg})`,
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                JIS C 3605 &amp; 内線規程 Standardized
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500 font-medium">
                極東電線 &amp; isijp.com 技術仕様準拠
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Engineering Workspace
              <span className="text-sm font-normal text-slate-500 ml-2">太陽光・蓄電池エンジニアリング</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Integrated preliminary design platform for commercial &amp; utility-scale Solar PV and BESS — equipment sizing, cable voltage drop, conduit fill calculation, and commercial BOQ quotations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto shrink-0">
            <button
              onClick={() => {
                setNewProjectType('SOLAR_PV');
                setIsNewProjectOpen(true);
              }}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project (新規プロジェクト)</span>
            </button>

            <button
              onClick={() => onNavigateToTab('quick-engineering')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200/80 cursor-pointer active:scale-98"
            >
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>Kyokuto Sụt Áp (電圧降下)</span>
            </button>

            <button
              onClick={() => onNavigateToTab('quick-engineering')}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer active:scale-98"
            >
              <Cable className="w-3.5 h-3.5 text-slate-600" />
              <span>ISIJP Ống Luồn (配管選定)</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive KPI Metrics Row (4 Single-Elevation Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Active Pipeline</span>
            <FolderGit2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              {stats.totalProjects} <span className="text-xs font-normal text-slate-500 font-sans">Projects</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center space-x-1">
              <span className="text-emerald-600 font-semibold">{stats.projectsInDesign} In Design</span>
              <span>·</span>
              <span>{stats.projectsQuotation} Quotation</span>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Solar PV Portfolio</span>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              18.5 <span className="text-xs font-normal text-slate-500 font-sans">MWp</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Chiba (1MW) · Kansai (15MW) · Kyushu (2.5MW)
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">BESS Storage</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2">
            <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 tabular-nums">
              24.2 <span className="text-xs font-normal text-slate-500 font-sans">MWh</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Saitama (8.1MWh) · Tokyo Port (16.1MWh)
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium">Standards Compliance</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2">
            <div className="text-base font-bold text-slate-900">
              JIS C 3605 &amp; 8305
            </div>
            <div className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>内線規程 第1310/3110節 適合</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Fast Engineering Tools Launchpad (6 Direct Tools) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <span>Engineering Tools / 各種検討ツール</span>
              <span className="text-xs font-normal text-slate-400">· 1-Click Launch</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              極東電線 sụt áp &amp; ISIJP ống luồn cáp theo tiêu chuẩn kỹ thuật Nhật Bản
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('quick-engineering')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>Open Tools Studio</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Tool 0: BESS Snow & Weather Checker */}
          <button
            onClick={() => onNavigateToTab('quick-engineering')}
            className="p-3.5 rounded-xl border-2 border-blue-400/80 bg-blue-50/40 hover:border-blue-600 hover:bg-blue-50/80 transition-all text-left group flex items-start space-x-3 cursor-pointer shadow-2xs relative overflow-hidden"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <CloudSnow className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                  Snow &amp; Weather Checker (積雪・気象)
                </span>
                <span className="text-[9px] font-bold bg-[#d81a28] text-white px-1 py-0.2 rounded-xs">
                  NEW
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                建設省告示第1455号×自治体公式規定値×気象庁AMeDASハイブリッド解析
              </p>
              <div className="mt-2 text-[10px] text-blue-700 font-mono font-bold flex items-center gap-1">
                <span>公式値CHECK &amp; 自動計算 対照</span>
                <span>→</span>
              </div>
            </div>
          </button>

          {/* Tool 1: Kyokuto Voltage Drop */}
          <button
            onClick={() => onNavigateToTab('quick-engineering')}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group flex items-start space-x-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                Kyokuto Voltage Drop (極東電線 電圧降下)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                6配電方式・JIS C 3605インピーダンス精算・簡易計算法・20年売電損失試算
              </p>
              <div className="mt-2 text-[10px] text-blue-600 font-mono font-medium">
                kyokuto-k.co.jp準拠 →
              </div>
            </div>
          </button>

          {/* Tool 2: ISIJP Conduit Sizing */}
          <button
            onClick={() => onNavigateToTab('quick-engineering')}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group flex items-start space-x-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <Cable className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                ISIJP Conduit Sizing (電線管・配管選定)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                C/E/G/VE/PF/FEP 6系統・32%/48%内線規程占有率・プルボックス&amp;曲がり判定
              </p>
              <div className="mt-2 text-[10px] text-emerald-600 font-mono font-medium">
                isijp.com準拠 →
              </div>
            </div>
          </button>

          {/* Tool 3: PV String Sizing */}
          <button
            onClick={() => onNavigateToTab('quick-engineering')}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group flex items-start space-x-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Sliders className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                PV String Sizing (ストリング検討)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                低温Voc/高温Vmp温度係数・インバータMPPT電圧範囲適合性・直列数最適化
              </p>
              <div className="mt-2 text-[10px] text-amber-600 font-mono font-medium">
                JIS C 8955準拠 →
              </div>
            </div>
          </button>

          {/* Tool 4: Current Calculation */}
          <button
            onClick={() => onNavigateToTab('quick-engineering')}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group flex items-start space-x-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Calculator className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                Current &amp; Breaker (電流計算・ブレーカ)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                三相/単相/直流の負荷電流・力率補正・定格遮断容量・過電流保護協調
              </p>
              <div className="mt-2 text-[10px] text-indigo-600 font-mono font-medium">
                JIS C 0168準拠 →
              </div>
            </div>
          </button>

          {/* Tool 5: Transformer Check */}
          <button
            onClick={() => onNavigateToTab('quick-engineering')}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group flex items-start space-x-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0 group-hover:bg-violet-600 group-hover:text-white transition-colors">
              <Boxes className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 group-hover:text-violet-700 transition-colors">
                Transformer Sizing (変圧器選定)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                特高/高圧受変電容量(kVA)・周囲温度低減係数・予備率マージンチェック
              </p>
              <div className="mt-2 text-[10px] text-violet-600 font-mono font-medium">
                JEM 1133準拠 →
              </div>
            </div>
          </button>

          {/* Tool 6: Cable Library */}
          <button
            onClick={() => onNavigateToTab('cables')}
            className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/30 transition-all text-left group flex items-start space-x-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
              <FileSpreadsheet className="w-4 h-4 stroke-[2]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 group-hover:text-slate-900 transition-colors">
                Cable Library (ケーブル規格マスタ)
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                JIS C 3605 600V/6.6kV CV/CVT・気中/地中許容電流・抵抗・リアクタンス
              </p>
              <div className="mt-2 text-[10px] text-slate-600 font-mono font-medium">
                View Full Library →
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 4. Primary Engineering Projects (Clean, Structured Presentation) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Active Projects / 参照プロジェクト</h2>
            <p className="text-xs text-slate-500">標準的な設計例として活用できるリファレンスプロジェクト</p>
          </div>
          <button
            onClick={() => onNavigateToTab('projects')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
          >
            <span>View All Projects ({stats.totalProjects})</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Project 1: Chiba 1MW Solar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                      Solar PV
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 text-[11px]">Chiba Prefecture, Japan</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-emerald-700 text-[11px] font-medium">In Design (90%)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    Chiba 1MW Commercial Solar PV — Reference
                  </h3>
                  <p className="text-xs text-slate-500">千葉 1MW 太陽光発電所 系統連系設計</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold font-mono text-slate-900">1.0 MWp</div>
                  <div className="text-[10px] text-slate-500">6.6 kV Grid-Tie</div>
                </div>
              </div>

              {/* Equipment Specifications Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">PV Module &amp; Inverter</span>
                  <span className="font-semibold text-slate-800">1,000 kWp · 2× SG500HV</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Transformer &amp; Grid</span>
                  <span className="font-semibold text-slate-800">1,250 kVA · 6.6 kV Grid</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">AC Circuit Voltage Drop</span>
                  <span className="font-semibold text-emerald-600 font-mono">1.42% (Pass ≤ 2.0%)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Conduit Standard</span>
                  <span className="font-semibold text-slate-800">C31 Steel Conduit (28.4%)</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Engineering Progress / 設計進捗</span>
                  <span className="text-blue-600 font-bold">90%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 grid grid-cols-4 gap-2">
              <button
                onClick={() => onOpenProject('proj-chiba-solar')}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Workspace</span>
              </button>
              <button
                onClick={() => onOpenQuickTool('cables')}
                className="py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Voltage Drop</span>
              </button>
              <button
                onClick={() => onOpenQuickTool('schematic')}
                className="py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>SLD View</span>
              </button>
              <button
                onClick={() => onOpenQuickTool('quotation')}
                className="py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>BOQ Quote</span>
              </button>
            </div>
          </div>

          {/* Project 2: Saitama 2MW / 8.146MWh BESS */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between">
            <div className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                      Utility BESS
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-500 text-[11px]">Saitama Prefecture, Japan</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-emerald-700 text-[11px] font-medium">In Design (90%)</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 truncate">
                    Saitama 2MW / 8.146MWh BESS — Reference
                  </h3>
                  <p className="text-xs text-slate-500">埼玉 2MW / 8.146MWh 系統用蓄電池設計</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold font-mono text-slate-900">2.0 MW / 8.1 MWh</div>
                  <div className="text-[10px] text-slate-500">22 kV Grid Interconnection</div>
                </div>
              </div>

              {/* Equipment Specifications Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Battery &amp; PCS Station</span>
                  <span className="font-semibold text-slate-800">4× 2.03MWh · 2× SC1250UD</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Transformer &amp; Substation</span>
                  <span className="font-semibold text-slate-800">2,500 kVA · 22 kV Grid</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">MV Cable Sizing</span>
                  <span className="font-semibold text-emerald-600 font-mono">CVT 150 mm² (Pass)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Liquid Cooling Load</span>
                  <span className="font-semibold text-slate-800">Aux 45 kW Verified</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-600">Engineering Progress / 設計進捗</span>
                  <span className="text-indigo-600 font-bold">90%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 grid grid-cols-4 gap-2">
              <button
                onClick={() => onOpenProject('proj-tokyo-bess')}
                className="py-1.5 px-2 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Workspace</span>
              </button>
              <button
                onClick={() => onOpenQuickTool('pcs')}
                className="py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>PCS Station</span>
              </button>
              <button
                onClick={() => onOpenQuickTool('cables')}
                className="py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>Cable Sizing</span>
              </button>
              <button
                onClick={() => onOpenQuickTool('quotation')}
                className="py-1.5 px-2 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <span>BESS BOQ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Recent Verified Calculations Activity Feed */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Recent Engineering Verifications / 最近の計算ログ
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">Live Engine Activity</span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Main Inverter AC Trunk:</span>{' '}
                <span className="text-slate-600">CVT 38 mm² (3P_3W 400V, 120m, 250kW)</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-emerald-700 font-semibold">1.42% Drop (PASS ≤ 2.0%)</span>
              <span className="text-[11px] text-slate-400">10m ago</span>
            </div>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">DC Array Feeder Conduit:</span>{' '}
                <span className="text-slate-600">C31 Thin Steel Conduit (3× PV-CC 6mm², 20m)</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-emerald-700 font-semibold">28.4% Occupancy (PASS ≤ 32%)</span>
              <span className="text-[11px] text-slate-400">25m ago</span>
            </div>
          </div>

          <div className="py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <span className="font-bold text-slate-900">Substation Step-up Transformer:</span>{' '}
                <span className="text-slate-600">1,250 kVA Oil-immersed (Load 1,000 kW, pf 0.95)</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-emerald-700 font-semibold">Margin 1.19x (PASS)</span>
              <span className="text-[11px] text-slate-400">1h ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* New Project Modal */}
      <NewProjectModal
        isOpen={isNewProjectOpen}
        onClose={() => setIsNewProjectOpen(false)}
        defaultType={newProjectType}
        onCreateProject={handleCreateProject}
      />
    </div>
  );
};
