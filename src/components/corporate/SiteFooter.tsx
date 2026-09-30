import React from 'react';
import { Sun, ArrowRight, ShieldCheck, ExternalLink, Mail, Phone, MapPin } from 'lucide-react';
import { CorporateTab } from './CorporateHeader';
import { SolnexaLogo } from './SolnexaLogo';

interface SiteFooterProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
}

export const SiteFooter: React.FC<SiteFooterProps> = ({
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenContact
}) => {
  return (
    <footer className="bg-[#001c30] text-slate-300 font-sans border-t border-slate-800">
      {/* 1. Main Directory Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          
          {/* Brand & Corporate Overview (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <SolnexaLogo size="lg" variant="horizontal" theme="dark" showSlogan={true} />

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              株式会社ソルネクサ（SOLNEXA）は、特別高圧メガソーラーおよび系統用蓄電池（BESS）の設計・設備調達・系統連系協議・クラウド電気解析を提供する日本の再生可能エネルギー総合エンジニアリング企業です。
            </p>

            <div className="space-y-1.5 text-xs text-slate-400 pt-2 font-mono">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">東京本社:</strong> 〒116-0002 東京都荒川区荒川5-6-7 302号
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-slate-200">TEL:</strong>{' '}
                  <a href="tel:07089821052" className="text-amber-300 font-bold hover:underline">
                    070-8982-1052
                  </a>{' '}
                  （平日 9:00〜18:00）
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>
                  <strong className="text-slate-200">E-mail:</strong>{' '}
                  <a href="mailto:hoanganhtuan.solnexa@gmail.com" className="text-slate-300 hover:text-white underline">
                    hoanganhtuan.solnexa@gmail.com
                  </a>
                </span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-slate-400">
              <span className="px-2 py-1 bg-white/5 rounded border border-white/10">JPEA（太陽光発電協会）正会員</span>
              <span className="px-2 py-1 bg-white/5 rounded border border-white/10">日本蓄電池工業会 賛助会員</span>
            </div>
          </div>

          {/* Links Column 1: Solutions & BESS (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-2">
              事業・製品 (Solutions)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-white transition-colors cursor-pointer text-left">
                  特別高圧 系統用蓄電池 (BESS)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-white transition-colors cursor-pointer text-left">
                  産業用メガソーラー &amp; FIP
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('solutions')} className="hover:text-white transition-colors cursor-pointer text-left">
                  自家消費・オンサイトPPA
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('products')} className="hover:text-white transition-colors cursor-pointer text-left">
                  液冷式LFP電池コンテナ
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('products')} className="hover:text-white transition-colors cursor-pointer text-left">
                  特高66kV変電スキッド
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 2: Engineering & Tools (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-2">
              エンジニアリング (Tools)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1">
                  <span>クラウド設計ワークスペース</span>
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-bold px-1 rounded">PRO</span>
                </button>
              </li>
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-white transition-colors cursor-pointer text-left">
                  JIS C 3605 ケーブル計算
                </button>
              </li>
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-white transition-colors cursor-pointer text-left">
                  単線結線図 (SLD) エディタ
                </button>
              </li>
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-white transition-colors cursor-pointer text-left">
                  PVストリング最低温度Voc判定
                </button>
              </li>
              <li>
                <button onClick={onOpenEngineeringTools} className="hover:text-white transition-colors cursor-pointer text-left">
                  BOQ概算見積書出力
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 3: Knowledge & Case Studies (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-2">
              ナレッジ・実績 (Projects)
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button onClick={() => onNavigateTab('projects')} className="hover:text-white transition-colors cursor-pointer text-left">
                  施工・導入実績一覧
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('knowledge')} className="hover:text-white transition-colors cursor-pointer text-left">
                  消防法告示第2号・保有空地3m
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('knowledge')} className="hover:text-white transition-colors cursor-pointer text-left">
                  電気事業法第48条 工事計画届出
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('knowledge')} className="hover:text-white transition-colors cursor-pointer text-left">
                  FIPマルチユース収益モデル
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('news')} className="hover:text-white transition-colors cursor-pointer text-left">
                  プレスリリース・お知らせ
                </button>
              </li>
            </ul>
          </div>

          {/* Links Column 4: Contact & Inquiries (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-700/80 pb-2">
              お問い合わせ (Inquiries)
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <button
                onClick={onOpenContact}
                className="w-full py-2.5 px-3 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>無料見積・相談窓口</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onOpenContact}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-medium rounded-md transition-colors cursor-pointer text-center block"
              >
                製品カタログ・資料請求
              </button>
              <button
                onClick={() => onNavigateTab('ai-advisor')}
                className="w-full py-2 px-3 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 text-xs font-medium rounded-md transition-colors cursor-pointer text-center block"
              >
                AI技術相談室（24時間受付）
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Bottom Copyright & Compliance Bar */}
      <div className="border-t border-slate-800 bg-[#001424] text-slate-500 text-[11px] py-6">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <button onClick={onOpenContact} className="hover:text-slate-300 transition-colors cursor-pointer">
              プライバシーポリシー（個人情報保護方針）
            </button>
            <span>|</span>
            <button onClick={onOpenContact} className="hover:text-slate-300 transition-colors cursor-pointer">
              サイトのご利用条件
            </button>
            <span>|</span>
            <button onClick={onOpenContact} className="hover:text-slate-300 transition-colors cursor-pointer">
              特定商取引法に基づく表記
            </button>
            <span>|</span>
            <span className="font-mono text-slate-400">JP / EN</span>
          </div>

          <p className="font-mono text-slate-500">
            &copy; 2026 SOLNEXA Japan Co., Ltd. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
