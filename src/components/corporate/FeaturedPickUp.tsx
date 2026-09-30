import React from 'react';
import { ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';

interface FeaturedPickUpProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenEngineeringTools: () => void;
}

export const FeaturedPickUp: React.FC<FeaturedPickUpProps> = ({
  onNavigateTab,
  onOpenEngineeringTools
}) => {
  const pickupItems = [
    {
      id: 'pickup-1',
      category: 'UI/UX・Web設計論',
      badge: '最新研究',
      title: 'Solar Frontier様式に基づくWebプラットフォーム設計論：色彩心理学・情報階層化・文字重複の根絶手法',
      desc: 'ミッドナイトネイビー(#002B49)とコーポレートレッド(#D81A28)の心理効果、F型視線誘導、実務データの定量的提示を解説。',
      image: APP_IMAGES.headerBanner,
      date: '2026.09.26',
      action: () => onNavigateTab('knowledge')
    },
    {
      id: 'pickup-2',
      category: '系統用蓄電池 BESS',
      badge: '特高連系',
      title: '特別高圧66kV系統連系 40MW / 160MWh 系統用大型蓄電所の設計・主要機器供給実績',
      desc: '消防法第17条および告示第2号保有空地3m基準に完全適合した液冷LFPコンテナ蓄電池システムを納入。',
      image: APP_IMAGES.bessContainer,
      date: '2026.09.20',
      action: () => onNavigateTab('projects')
    },
    {
      id: 'pickup-3',
      category: '法令・技術基準',
      badge: '消防法基準',
      title: '系統用蓄電池（BESS）の消防法規制・保有空地3m基準と全域ガス自動消火設備実務',
      desc: 'リチウムイオン電池の熱暴走リスク対策、自治体消防協議の要件、UL9540A試験データ提出の指針。',
      image: APP_IMAGES.solarFacility,
      date: '2026.09.15',
      action: () => onNavigateTab('knowledge')
    },
    {
      id: 'pickup-4',
      category: 'クラウド設計ツール',
      badge: 'PROツール',
      title: 'ソルネクサ統合エンジニアリングツール：JIS C 3605ケーブル計算・SLD作図・過積載判定',
      desc: 'ブラウザ上で即座に実行可能。無料会員登録ですべての高度解析機能が無制限に利用できます。',
      image: APP_IMAGES.ambientBg,
      date: '2026.09.10',
      action: () => onOpenEngineeringTools()
    }
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
            <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
              Pick up
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            ピックアップ・注目の取り組み
          </h2>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          最新の技術論文、特高BESS実績、およびエンジニアリングツール
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {pickupItems.map((item) => (
          <div
            key={item.id}
            onClick={item.action}
            className="bg-white rounded-xl border border-slate-200/90 overflow-hidden hover:border-[#002b49] hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Photo Container with subtle zoom */}
              <div className="h-44 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-[#002b49]/90 backdrop-blur-xs text-white text-[10px] font-bold rounded">
                  {item.badge}
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-slate-200 text-[10px] font-mono">
                  {item.date}
                </div>
              </div>

              {/* Text Body */}
              <div className="p-4 space-y-2">
                <span className="text-[11px] font-extrabold text-[#d81a28] uppercase tracking-wider block">
                  {item.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#002b49] transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>

            {/* Bottom Arrow Indicator */}
            <div className="px-4 pb-3.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002b49]">
              <span>詳細を見る</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#d81a28]" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
