import React from 'react';
import { ArrowRight, ChevronRight, BatteryCharging, Sun, Cpu, ShieldCheck } from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';

interface BusinessSolutionsProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
}

export const BusinessSolutions: React.FC<BusinessSolutionsProps> = ({
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenContact
}) => {
  const divisions = [
    {
      id: 'bess',
      code: '01',
      enTitle: 'BESS',
      enSub: 'Battery Energy Storage System',
      jpTitle: '系統用蓄電池の\n設計から主要機器供給まで。',
      desc: '特別高圧66kV系統連系に対応した大規模蓄電所（10MW〜100MW+）の包括的エンジニアリング。消防法第17条および告示第2号保有空地3m基準に完全適合した液冷式LFP電池コンテナシステムと特高変電設備を供給します。',
      image: APP_IMAGES.bessContainer,
      tag: '特別高圧連系 ｜ 消防法告示第2号適合',
      action: () => onNavigateTab('solutions')
    },
    {
      id: 'solar-pv',
      code: '02',
      enTitle: 'SOLAR PV',
      enSub: 'Industrial Mega-Solar & FIP Transition',
      jpTitle: '産業用太陽光の\n高効率アレイ設計とFIP最適化。',
      desc: '直流過積載比率140〜160%の最適設計、JIS C 8955耐風圧架台力学計算、およびインバランスリスクを極小化する発電量予測連動アルゴリズム。電力会社との系統連系事前相談から契約申込まで完遂します。',
      image: APP_IMAGES.solarFacility,
      tag: 'JIS C 8955準拠 ｜ FIPマルチユース',
      action: () => onNavigateTab('solutions')
    },
    {
      id: 'engineering',
      code: '03',
      enTitle: 'ENGINEERING',
      enSub: 'Cloud Electrical Suite & Standards',
      jpTitle: 'クラウドで完結する\n次世代電気設計プラットフォーム。',
      desc: 'JIS C 3605規格に基づく幹線ケーブル許容電流・電圧降下計算、単線結線図（SLD）作図、特別高圧変圧器サイジング、および主要メーカー仕様書PDF解析をブラウザ上で即座に実行可能です。',
      image: APP_IMAGES.ambientBg,
      tag: 'JIS C 3605 ｜ SLD自動作図 ｜ BOQ見積',
      action: () => onOpenEngineeringTools()
    },
    {
      id: 'om',
      code: '04',
      enTitle: 'O&M & ASSET',
      enSub: 'Operations, Maintenance & Market EMS',
      jpTitle: '20年間の発電収益を守る\nAI遠隔監視と保安管理。',
      desc: '電気主任技術者外部委託承認制度への対応、赤外線サーモグラフィ搭載ドローンによるモジュール点検、およびJEPXスポット市場価格と連動した蓄電池充放電スケジューリングEMSを提供します。',
      image: APP_IMAGES.headerBanner,
      tag: '電気事業法第48条 ｜ AIスマートEMS',
      action: () => onNavigateTab('solutions')
    }
  ];

  return (
    <section className="space-y-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#002b49] rounded-xs" />
            <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
              Business Divisions
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            事業分野・ソリューション
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl leading-relaxed">
            企画・基本設計から系統連系協議、消防法適合設備供給、クラウド電気解析までトータルで支援します。
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('solutions')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002b49] hover:text-[#d81a28] transition-colors shrink-0"
        >
          <span>すべての事業ソリューションを見る</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Asymmetric Alternating Large Entrances (Not ordinary small cards) */}
      <div className="space-y-8">
        {divisions.map((div, idx) => {
          const isReversed = idx % 2 === 1;
          return (
            <div
              key={div.id}
              onClick={div.action}
              className={`bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#002b49] hover:shadow-xl transition-all duration-300 cursor-pointer group grid grid-cols-1 lg:grid-cols-12 items-stretch ${
                isReversed ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* Photo Column (5 cols) */}
              <div className={`lg:col-span-5 relative overflow-hidden min-h-[260px] sm:min-h-[320px] ${
                isReversed ? 'lg:order-2' : 'lg:order-1'
              }`}>
                <img
                  src={div.image}
                  alt={div.enTitle}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#002b49]/90 backdrop-blur-xs text-white text-[11px] font-bold rounded-md">
                  {div.tag}
                </div>
                <div className="absolute bottom-4 left-4 text-4xl sm:text-5xl font-mono font-black text-white/30 select-none">
                  {div.code}
                </div>
              </div>

              {/* Text Editorial Column (7 cols) */}
              <div className={`lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between ${
                isReversed ? 'lg:order-1' : 'lg:order-2'
              }`}>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-[#002b49]">
                      {div.enTitle}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-400">
                      {div.enSub}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug whitespace-pre-line tracking-tight">
                    {div.jpTitle}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                    {div.desc}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 group-hover:text-[#002b49] transition-colors">
                    ソリューション詳細・機器仕様を見る
                  </span>
                  <div className="w-9 h-9 rounded-full bg-slate-100 group-hover:bg-[#d81a28] group-hover:text-white flex items-center justify-center transition-all text-slate-700">
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
