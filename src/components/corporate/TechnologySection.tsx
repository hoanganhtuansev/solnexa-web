import React from 'react';
import { Cpu, ArrowRight, CheckCircle2, ShieldCheck, FileSpreadsheet, Layers, Sparkles, UserPlus } from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';

interface TechnologySectionProps {
  onOpenEngineeringTools: () => void;
  onOpenLogin: () => void;
  isLoggedIn?: boolean;
}

export const TechnologySection: React.FC<TechnologySectionProps> = ({
  onOpenEngineeringTools,
  onOpenLogin,
  isLoggedIn = false
}) => {
  const toolsList = [
    {
      title: 'JIS C 3605 幹線ケーブル許容電流・電圧降下計算',
      desc: '架橋ポリエチレン絶縁電力ケーブル（CV/CVD/CVT）の直埋・管路・トレンチ敷設低減係数と20年間の売電ロスを極小化。',
      badge: 'JIS C 3605準拠'
    },
    {
      title: '単線結線図 (SLD) クラウド作図エディタ',
      desc: '特別高圧66kV受変電設備から変圧器、PCS、直流接続箱、PVアレイまでの系統図をブラウザ上で直感的に配置・DWG出力。',
      badge: 'SLD自動生成'
    },
    {
      title: '系統用蓄電池 (BESS) 充放電サイジング & 劣化予測',
      desc: 'セル温度ムラ制御、充放電Cレート、20年間のLFPサイクル劣化減衰曲線とJEPX市場価格連動アービトラージシミュレーション。',
      badge: '20年劣化解析'
    },
    {
      title: '機器仕様書PDF AI自動解析 & BOQ概算見積書',
      desc: '主要モジュール・PCSメーカーの技術仕様書PDFを瞬時に読み取り、電気諸元データベースへ登録。工事内訳書（BOQ）を自動作成。',
      badge: 'AI自動解析'
    }
  ];

  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm relative overflow-hidden">
      {/* Background blueprint subtle mesh */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#002b4906_1px,transparent_1px),linear-gradient(to_bottom,#002b4906_1px,transparent_1px)] bg-[size:28px_28px] pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Column: Platform Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
              <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
                Engineering Cloud Suite
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                基本計算無料 ｜ 会員登録ですべて無制限
              </span>
            </div>

            <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug jp-heading">
              <span className="jp-chunk">設計実務をクラウドで自動化。</span>
              <br className="hidden sm:inline" />
              <span className="text-[#002b49] jp-chunk">SOLNEXA 統合設計ワークスペース</span>
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            日本の電気事業法第48条工事計画届出、JIS C 8955耐風圧基準、および総務省消防庁告示第2号を完全に組み込んだ実務エンジニア向けクラウドプラットフォーム。計算書の作成から図面出力まで数分で完了します。
          </p>

          {/* 4 Feature Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {toolsList.map((tool, idx) => (
              <div key={idx} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 hover:border-[#002b49] transition-colors">
                <span className="text-[10px] font-bold text-[#002b49] bg-blue-100/70 px-2 py-0.5 rounded">
                  {tool.badge}
                </span>
                <h4 className="text-xs font-bold text-slate-900 leading-snug">
                  {tool.title}
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {tool.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <button
              onClick={onOpenEngineeringTools}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-[#002b49] hover:bg-[#001d32] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>ワークスペースを起動する</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {!isLoggedIn ? (
              <button
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1.5 px-5 py-3.5 rounded-md bg-[#d81a28] hover:bg-[#b51420] active:scale-95 text-white font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>無料会員登録で全機能を開放</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-md border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>会員認証済み（PRO機能全開放）</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Platform Visual Showcase */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl group">
            <img
              src={APP_IMAGES.ambientBg}
              alt="SOLNEXA Integrated Engineering Workspace"
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-103 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#001c30] via-[#001c30]/40 to-transparent flex flex-col justify-end p-6">
              <span className="text-xs font-mono text-amber-400 font-bold">SOLNEXA WORKSPACE PRO</span>
              <p className="text-base font-bold text-white mt-1">
                JIS C 3605 ケーブル計算 ＆ 単線結線図 (SLD) 作図環境
              </p>
              <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                ブラウザ上でリアルタイムに過積載比率、電圧降下率、変圧器インピーダンス短絡容量を評価。
              </p>
              <div className="pt-3">
                <button
                  onClick={onOpenEngineeringTools}
                  className="px-4 py-2 bg-white text-[#002b49] hover:bg-slate-100 font-bold text-xs rounded-md shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>今すぐ計算ツールを試す</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#d81a28]" />
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
