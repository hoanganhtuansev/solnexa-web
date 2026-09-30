import React from 'react';
import {
  Cpu,
  FileCheck,
  Database,
  Calculator,
  Sliders,
  Activity,
  Zap,
  Sparkles,
  ClipboardList
} from 'lucide-react';
import { ActiveTab } from '../types';
export type { ActiveTab };

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  pendingReviewCount: number;
  approvedCount: number;
  aiProviderName: string;
  onOpenDiagnostics: () => void;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  pendingReviewCount,
  approvedCount,
  aiProviderName,
  onOpenDiagnostics,
  onOpenSettings
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-amber-500/20">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold tracking-wider text-xl text-white">
                  <span>SOLNE</span>
                  <span className="text-[#f97316]">X</span>
                  <span>A</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                  ENGINEERING
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Solar PV • BESS Platform</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex space-x-1">
            <button
              id="nav-dashboard-btn"
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Dashboard</span>
            </button>

            <button
              id="nav-projects-btn"
              onClick={() => onSelectTab('projects')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'projects' || activeTab === 'workspace'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Projects</span>
            </button>

            <button
              id="nav-library-btn"
              onClick={() => onSelectTab('library')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'library'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Equipment</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] rounded">
                {approvedCount}
              </span>
            </button>

            <button
              id="nav-datasheets-btn"
              onClick={() => onSelectTab('datasheets')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'datasheets' || activeTab === 'ingest' || activeTab === 'review'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Datasheets</span>
              {pendingReviewCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-full animate-pulse">
                  {pendingReviewCount}
                </span>
              )}
            </button>

            <button
              id="nav-cables-btn"
              onClick={() => onSelectTab('cables')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'cables'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Cables</span>
            </button>

            <button
              id="nav-price-book-btn"
              onClick={() => onSelectTab('price-book')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'price-book'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Price Book</span>
            </button>

            <button
              id="nav-calc-btn"
              onClick={() => onSelectTab('tools')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === 'tools' || activeTab === 'calculators'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>Quick Tools</span>
            </button>
          </nav>

          {/* Controls: AI Provider badge, Diagnostics, Settings */}
          <div className="flex items-center space-x-2.5">
            <button
              id="diagnostics-toggle-btn"
              onClick={onOpenDiagnostics}
              title="Extraction & System Diagnostics"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 text-xs font-mono transition-all"
            >
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Diagnostics</span>
            </button>

            <button
              id="settings-toggle-btn"
              onClick={onOpenSettings}
              title="AI Provider Settings"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-amber-400 hover:border-amber-500/40 text-xs transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline font-mono text-[11px] max-w-[110px] truncate">{aiProviderName}</span>
              <Sliders className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
