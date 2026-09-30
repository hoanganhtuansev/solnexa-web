import React, { useState } from 'react';
import { ArrowRight, ChevronRight, MapPin, Zap, Calendar, ExternalLink } from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';

interface CaseStudiesProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenContact: () => void;
}

export const CaseStudies: React.FC<CaseStudiesProps> = ({
  onNavigateTab,
  onOpenContact
}) => {
  const [filter, setFilter] = useState<'all' | 'BESS' | 'SOLAR'>('all');

  const projects = [
    {
      id: 'proj-soma',
      category: 'BESS',
      name: 'Soma Utility BESS Project',
      jpName: '福島県相馬市 40MW / 160MWh 系統用大型蓄電所',
      location: 'Fukushima, Japan ｜ 東北電力ネットワーク管内',
      capacity: '40 MW / 160 MWh (4時間定格)',
      systemType: '特別高圧66kV系統連系 / 液冷LFPコンテナ40台',
      year: '2025年 竣工・連系',
      desc: '東北エリアにおける再エネ出力制御緩和および容量市場（長期脱炭素電源オークション）応札案件。総務省消防庁告示第2号・保有空地3m基準に完全適合し、全域ガス自動消火設備と特高66kV変電スキッドを一括納入。',
      image: APP_IMAGES.solarFacility,
      badge: '特高66kV連系'
    },
    {
      id: 'proj-iwata',
      category: 'BESS',
      name: 'Iwata BESS Project',
      jpName: '静岡県磐田市 2MW / 8MWh 系統安定化蓄電所',
      location: 'Shizuoka, Japan ｜ 中部電力パワーグリッド管内',
      capacity: '2 MW / 8 MWh',
      systemType: '高圧22kV連系 / JEPXアービトラージ &amp; 需給調整市場三次②',
      year: '2025年 竣工',
      desc: 'JEPXスポット市場価格差益取引および需給調整市場三次調整力②へのマルチ参入モデル。AIスマートEMSによる高速充放電スケジューリングで年間稼働率99.8%を達成。',
      image: APP_IMAGES.bessContainer,
      badge: 'マルチユース運用'
    },
    {
      id: 'proj-tokachi',
      category: 'SOLAR',
      name: 'Tokachi Solar &amp; BESS Hybrid Facility',
      jpName: '北海道十勝郡 15MW 太陽光 ＋ 30MWh 蓄電池複合所',
      location: 'Hokkaido, Japan ｜ 北海道電力ネットワーク管内',
      capacity: '15 MW PV ＋ 30 MWh BESS',
      systemType: 'FIP制度ノンファーム型接続 / 耐積雪1.8kN/m²',
      year: '2025年 竣工',
      desc: '基幹系統混雑地域におけるノンファーム型接続案件。出力制御時間帯の余剰発電電力を大容量蓄電システムに充電し、夜間売電によりインバランス発生率を0.3%未満に抑制。',
      image: APP_IMAGES.headerBanner,
      badge: 'FIPノンファーム'
    },
    {
      id: 'proj-gunma',
      category: 'SOLAR',
      name: 'Gunma Logistics Hub Rooftop PPA',
      jpName: '群馬県太田市 2.4MW 物流センター 屋根置自家消費',
      location: 'Gunma, Japan ｜ 東京電力パワーグリッド管内',
      capacity: '2.4 MW DC (1,990 kW AC)',
      systemType: 'オンサイトコーポレートPPA / ハゼ折板孔開けレス工法',
      year: '2024年 竣工',
      desc: '大型物流施設の金属折板屋根に防水保証を損なわないハゼ締め専用金具工法を採用。年間約2,600MWhを発電し、施設の消費電力の45%をグリーン電力で賄います。',
      image: APP_IMAGES.ambientBg,
      badge: 'オンサイトPPA'
    }
  ];

  const filtered = filter === 'all' ? projects : projects.filter(p => p.category === filter);

  return (
    <section className="space-y-8">
      {/* Section Header with Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#002b49] rounded-xs" />
            <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
              Case Studies &amp; Projects
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            主要導入事例・プロジェクト実績
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
            全国の特別高圧メガソーラーおよび系統用蓄電所の設計・主要設備納入実績です。
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-[#002b49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            すべて ({projects.length})
          </button>
          <button
            onClick={() => setFilter('BESS')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filter === 'BESS'
                ? 'bg-[#002b49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            系統用蓄電池
          </button>
          <button
            onClick={() => setFilter('SOLAR')}
            className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
              filter === 'SOLAR'
                ? 'bg-[#002b49] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            産業用太陽光
          </button>
        </div>
      </div>

      {/* Projects Grid (Architectural Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((proj) => (
          <div
            key={proj.id}
            onClick={() => onNavigateTab('projects')}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:border-[#002b49] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              {/* Photo Banner with Zoom */}
              <div className="h-60 sm:h-72 overflow-hidden relative">
                <img
                  src={proj.image}
                  alt={proj.name}
                  className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 bg-[#002b49]/90 backdrop-blur-xs text-white text-[11px] font-bold rounded">
                  {proj.badge}
                </div>
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/65 backdrop-blur-xs text-white text-xs font-mono font-medium rounded">
                  {proj.year}
                </div>
              </div>

              {/* Architectural Technical Specifications */}
              <div className="p-6 sm:p-7 space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 font-mono block">
                    {proj.name}
                  </span>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#002b49] transition-colors leading-snug mt-0.5">
                    {proj.jpName}
                  </h3>
                </div>

                {/* Specs Box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-700">
                    <span className="text-slate-400 font-sans">LOCATION:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[240px]">{proj.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 border-t border-slate-200/50 pt-1.5">
                    <span className="text-slate-400 font-sans">CAPACITY:</span>
                    <span className="font-bold text-[#002b49]">{proj.capacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 border-t border-slate-200/50 pt-1.5">
                    <span className="text-slate-400 font-sans">SYSTEM:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[240px]">{proj.systemType}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {proj.desc}
                </p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#002b49]">
              <span className="group-hover:text-[#d81a28] transition-colors">
                プロジェクト詳細・単線結線図を見る
              </span>
              <div className="flex items-center gap-1 text-[#d81a28]">
                <span>詳細</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
