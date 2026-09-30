import React, { useState } from 'react';
import { ArrowRight, Menu, X, UserRound } from 'lucide-react';
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
  onOpenLogin,
  onOpenContact,
  onOpenDesignQuotation,
  onOpenCompanyProfile,
  onLogout,
  isLoggedIn = false,
  currentUser
}) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const quoteAction = () => {
    if (onOpenDesignQuotation) onOpenDesignQuotation();
    else onOpenContact();
  };

  const nav = [
    { id: 'business', label: 'BUSINESS', action: () => onNavigateTab('solutions'), active: currentTab === 'solutions' },
    { id: 'works', label: 'WORKS', action: () => onNavigateTab('projects'), active: currentTab === 'projects' },
    { id: 'tools', label: 'TOOLS', action: onOpenEngineeringTools, active: currentTab === 'tools-workspace', emphasized: true },
    { id: 'ai', label: 'AI相談', action: () => onNavigateTab('ai-advisor'), active: currentTab === 'ai-advisor' },
    { id: 'news', label: 'NEWS', action: () => onNavigateTab('news'), active: currentTab === 'news' },
    { id: 'company', label: 'COMPANY', action: () => onOpenCompanyProfile?.(), active: false }
  ];

  const runMobileAction = (action: () => void) => {
    setIsMobileOpen(false);
    action();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
        <button
          type="button"
          onClick={() => onNavigateTab('home')}
          className="shrink-0"
          aria-label="SOLNEXA ホーム"
        >
          <SolnexaLogo className="h-9 w-auto" />
        </button>

        <nav className="ml-auto hidden items-center gap-7 lg:flex">
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={item.action}
              className={[
                'relative py-6 text-[13px] font-semibold tracking-[0.08em] transition-colors',
                item.emphasized ? 'text-[#002b49]' : 'text-slate-700 hover:text-[#002b49]',
                item.active ? 'text-[#002b49]' : ''
              ].join(' ')}
            >
              {item.label}
              {(item.active || item.emphasized) && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-[#d81a28]" />
              )}
            </button>
          ))}

          <button
            type="button"
            onClick={quoteAction}
            className="ml-1 inline-flex items-center gap-2 bg-[#d81a28] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#b81420]"
          >
            <span>見積依頼</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {isLoggedIn ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
              title={currentUser?.name || 'ログアウト'}
              aria-label="ログアウト"
            >
              <UserRound className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="flex h-10 w-10 items-center justify-center border border-slate-200 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900"
              title="ログイン"
              aria-label="ログイン"
            >
              <UserRound className="h-4 w-4" />
            </button>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsMobileOpen((v) => !v)}
          className="ml-auto flex h-11 w-11 items-center justify-center lg:hidden"
          aria-label="メニュー"
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {isMobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 pb-6 pt-2 lg:hidden">
          <div className="divide-y divide-slate-100">
            {nav.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => runMobileAction(item.action)}
                className={[
                  'flex w-full items-center justify-between py-4 text-left text-sm font-semibold tracking-[0.08em]',
                  item.emphasized ? 'text-[#002b49]' : 'text-slate-800'
                ].join(' ')}
              >
                <span>{item.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </button>
            ))}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => runMobileAction(quoteAction)}
              className="inline-flex items-center justify-center gap-2 bg-[#d81a28] px-5 py-3.5 text-sm font-semibold text-white"
            >
              見積依頼
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => runMobileAction(isLoggedIn ? () => onLogout?.() : onOpenLogin)}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 px-5 py-3.5 text-sm font-semibold text-slate-800"
            >
              <UserRound className="h-4 w-4" />
              {isLoggedIn ? 'ログアウト' : 'ログイン'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
