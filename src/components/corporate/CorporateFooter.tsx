import React from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Award, 
  ExternalLink,
  Cpu,
  FileText
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';
import { SolnexaLogo } from './SolnexaLogo';

interface CorporateFooterProps {
  onNavigateTab: (tab: CorporateTab) => void;
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
    <footer className="bg-[#0f172a] text-slate-300 text-sm border-t border-slate-800">
      {/* 1. Pre-Footer Quality & Association Trust Badges */}
      <div className="border-b border-slate-800/80 bg-[#080d1a]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">消防法・電気事業法完全適合</p>
                <p className="text-[11px] text-slate-400">保有空地3m離隔・工事計画届出標準対応</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">JIS規格・IEC準拠設計</p>
                <p className="text-[11px] text-slate-400">JIS C 8955耐風圧・IEC 62933 BESS安全</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">国土交通大臣許可（特定）</p>
                <p className="text-[11px] text-slate-400">電気工事業・機械器具設置工事業</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-amber-400 shrink-0" />
              <div>
                <p className="font-bold text-slate-200">特高・高圧系統連系 98.4%採択</p>
                <p className="text-[11px] text-slate-400">全国電力会社（東電・関電・九電等）実績</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Corporate Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Identity */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <SolnexaLogo size="lg" variant="horizontal" theme="dark" showSlogan={true} />
              <p className="text-xs text-slate-400 mt-2">
                株式会社ソルネクサ (SOLNEXA Inc.) ｜ 太陽光・系統用蓄電池総合エンジニアリング
              </p>
              <p className="text-[11px] text-amber-300/80 font-mono tracking-wider mt-0.5">
                ブランド語源: SOL (太陽) + NEXT (未来) + A (行動・創生)
              </p>
              {onOpenCompanyProfile && (
                <button
                  onClick={onOpenCompanyProfile}
                  className="mt-2 text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-amber-400/30 transition-all"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>会社概要・企業情報を詳しく見る</span>
                  <span>▶</span>
                </button>
              )}
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pr-4">
              太陽光発電（メガソーラー・自家消費PPA）および特別高圧・高圧系統用蓄電システム（BESS）の基本設計、機器選定、電気事業法・消防法許認可、受変電系統連系支援、および統合クラウドエンジニアリングツールを提供する総合再生可能エネルギー企業です。
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">本社:</strong> 〒116-0002 東京都荒川区荒川5-6-7 302号
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-slate-200">TEL:</strong>{' '}
                  <a href="tel:07089821052" className="text-amber-300 font-bold hover:underline font-mono">
                    070-8982-1052
                  </a>{' '}
                  <span className="text-slate-400">（代表・平日 9:00〜18:00）</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-slate-200">E-mail:</strong>{' '}
                  <a href="mailto:hoanganhtuan.solnexa@gmail.com" className="text-slate-300 hover:text-white underline font-mono">
                    hoanganhtuan.solnexa@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Column 1: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              事業ソリューション
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-amber-400 transition-colors text-left">
                  特別高圧・系統用蓄電池 (BESS)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-amber-400 transition-colors text-left">
                  産業用メガソーラー開発支援
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-amber-400 transition-colors text-left">
                  屋根置オンサイト／オフサイトPPA
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-amber-400 transition-colors text-left">
                  FIP蓄電池併設・インバランス対策
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-amber-400 transition-colors text-left">
                  O&M保守点検・遠隔監視スマートEMS
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2: Knowledge & Tech */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              ナレッジ・技術基準
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTab('knowledge')} className="hover:text-amber-400 transition-colors text-left">
                  太陽光・BESS 設計プロセス標準
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('knowledge')} className="hover:text-amber-400 transition-colors text-left">
                  消防法・保有空地3m規制解説
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('knowledge')} className="hover:text-amber-400 transition-colors text-left">
                  特別高圧受変電・系統連系協議
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('knowledge')} className="hover:text-amber-400 transition-colors text-left">
                  FIP・容量市場・需給調整市場運用
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('ai-advisor')} className="hover:text-amber-400 transition-colors text-left text-amber-300 font-semibold">
                  AI太陽光・蓄電池相談室
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 3: Engineering Platform & Products */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              設計ツール & 製品
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-amber-400 transition-colors text-left font-medium text-slate-200">
                  ▶ 統合設計ワークスペース
                </button>
              </li>
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-amber-400 transition-colors text-left">
                  単線結線図 (SLD) 作図エディタ
                </button>
              </li>
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-amber-400 transition-colors text-left">
                  JIS C 3605 ケーブル許容電流・電圧降下
                </button>
              </li>
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-amber-400 transition-colors text-left">
                  BESS充放電サイジング & パワコン選定
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('products')} className="hover:text-amber-400 transition-colors text-left">
                  製品カタログ（モジュール・PCS・蓄電）
                </button>
              </li>
              <li>
                <button onClick={onOpenContact} className="hover:text-amber-400 transition-colors text-left text-amber-300">
                  機器見積もり・資料請求
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Bottom Legal & Copyright */}
      <div className="border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <a href="#privacy" onClick={(e) => { e.preventDefault(); alert('プライバシーポリシー: 当社は個人情報保護法に基づき、収集した情報を厳格に管理いたします。'); }} className="hover:text-slate-300">
              個人情報保護方針
            </a>
            <span>·</span>
            <a href="#terms" onClick={(e) => { e.preventDefault(); alert('利用規約: 本ウェブサイトおよびエンジニアリングツールの知的財産権は株式会社ソルネクサに帰属します。'); }} className="hover:text-slate-300">
              サイト利用規約
            </a>
            <span>·</span>
            <a href="#security" onClick={(e) => { e.preventDefault(); alert('情報セキュリティ方針: ISO/IEC 27001基準に準拠したセキュアな設計データ管理体制を構築しています。'); }} className="hover:text-slate-300">
              情報セキュリティ基本方針
            </a>
            <span>·</span>
            <button onClick={onOpenContact} className="hover:text-slate-300">
              お問い合わせ・相談窓口
            </button>
          </div>
          <div className="text-[11px] text-slate-400">
            &copy; 2026 SOLNEXA Inc. All rights reserved. (株式会社ソルネクサ)
          </div>
        </div>
      </div>
    </footer>
  );
};
