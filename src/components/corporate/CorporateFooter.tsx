import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { CorporateTab } from './CorporateHeader';
import { SolnexaLogo } from './SolnexaLogo';

interface CorporateFooterProps {
  onNavigateTab: (tab: CorporateTab, subTab?: string) => void;
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
  onOpenCompanyProfile?: () => void;
}

export const CorporateFooter: React.FC<CorporateFooterProps> = ({
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenContact,
  onOpenCompanyProfile,
}) => {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        
        {/* Main Footer Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pb-12 border-b border-slate-200">
          
          {/* Company Brand Column (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            <SolnexaLogo size="md" variant="horizontal" showSlogan={false} />
            
            <p className="text-xs text-slate-500 leading-relaxed font-normal max-w-md pt-2">
              株式会社ソルネクサ（SOLNEXA Inc.）<br />
              特別高圧太陽光発電および系統用蓄電池（BESS）の基本設計、系統連系協議支援、および実務向けエンジニアリングツールを提供する総合再生可能エネルギー技術企業です。
            </p>

            <div className="space-y-1 text-xs text-slate-500 font-normal pt-1">
              <p>〒116-0002 東京都荒川区荒川5-6-7 302号</p>
              <p>TEL: <a href="tel:07089821052" className="text-[#002B49] font-mono hover:underline">070-8982-1052</a>（代表・平日 9:00〜18:00）</p>
              <p>E-mail: <span className="font-mono text-slate-600">hoanganhtuan.solnexa@gmail.com</span></p>
            </div>
          </div>

          {/* Navigation Links Column (7 Cols) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            
            {/* Col 1: Domains */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold text-[#002B49] uppercase tracking-wider font-mono">
                BUSINESS
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-normal">
                <li>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('business');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else onNavigateTab('solutions');
                    }} 
                    className="hover:text-[#002B49] transition-colors text-left cursor-pointer"
                  >
                    設計 / DESIGN
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('business');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else onNavigateTab('solutions');
                    }} 
                    className="hover:text-[#002B49] transition-colors text-left cursor-pointer"
                  >
                    施工支援 / SUPPORT
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => {
                      const el = document.getElementById('business');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                      else onNavigateTab('solutions');
                    }} 
                    className="hover:text-[#002B49] transition-colors text-left cursor-pointer"
                  >
                    シミュレーション / SIM
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateTab('solutions')} 
                    className="hover:text-[#002B49] transition-colors text-left cursor-pointer"
                  >
                    事業ソリューション一覧
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 2: Tools & AI */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold text-[#002B49] uppercase tracking-wider font-mono">
                TOOLS &amp; AI
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-normal">
                <li>
                  <button onClick={onOpenEngineeringTools} className="hover:text-[#002B49] transition-colors text-left cursor-pointer flex items-center gap-1 font-medium text-[#002B49]">
                    <span>実務ワークスペース</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                </li>
                <li>
                  <button onClick={onOpenEngineeringTools} className="hover:text-[#002B49] transition-colors text-left cursor-pointer">
                    PV・ストリング設計
                  </button>
                </li>
                <li>
                  <button onClick={onOpenEngineeringTools} className="hover:text-[#002B49] transition-colors text-left cursor-pointer">
                    BESSサイジング
                  </button>
                </li>
                <li>
                  <button onClick={onOpenEngineeringTools} className="hover:text-[#002B49] transition-colors text-left cursor-pointer">
                    ケーブル・電圧降下
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab('ai-advisor')} className="hover:text-[#002B49] transition-colors text-left cursor-pointer">
                    AI技術相談室
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Corporate */}
            <div className="space-y-3.5">
              <h4 className="text-xs font-semibold text-[#002B49] uppercase tracking-wider font-mono">
                COMPANY
              </h4>
              <ul className="space-y-2.5 text-xs text-slate-500 font-normal">
                <li>
                  <button 
                    onClick={() => onNavigateTab('company', 'overview')} 
                    className="hover:text-[#002B49] transition-colors text-left cursor-pointer"
                  >
                    会社概要・基本データ
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => onNavigateTab('company', 'message')} 
                    className="hover:text-[#002B49] transition-colors text-left cursor-pointer"
                  >
                    代表メッセージ・理念
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab('projects')} className="hover:text-[#002B49] transition-colors text-left cursor-pointer">
                    導入実績 (WORKS)
                  </button>
                </li>
                <li>
                  <button onClick={() => onNavigateTab('news')} className="hover:text-[#002B49] transition-colors text-left cursor-pointer">
                    お知らせ (NEWS)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenContact} className="hover:text-[#d81a28] transition-colors text-left cursor-pointer font-medium text-[#d81a28]">
                    お問い合わせ・見積相談
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-slate-400 font-normal">
          <p className="font-mono">
            &copy; 2026 SOLNEXA Inc. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 transition-colors cursor-pointer">プライバシーポリシー</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">サイト利用規約</span>
            <span className="hover:text-slate-600 transition-colors cursor-pointer">情報セキュリティ基本方針</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
