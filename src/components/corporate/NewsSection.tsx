import React, { useState } from 'react';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { CorporateTab } from './CorporateHeader';

interface NewsSectionProps {
  onNavigateTab: (tab: CorporateTab) => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({ onNavigateTab }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const newsItems = [
    {
      id: 'news-1',
      date: '2026.09.24',
      category: '政策・法令',
      title: '経済産業省・資源エネルギー庁、「系統用蓄電池のノンファーム型接続運用ルールおよび出力制御補償」最新解説公表',
      summary: '基幹系統混雑地域における蓄電所接続の運用指針が改定され、充放電スケジューリングにおけるAI自動制御の要件が明確化されました。',
      isHot: true
    },
    {
      id: 'news-2',
      date: '2026.09.18',
      category: 'プレスリリース',
      title: 'ソルネクサ、東北エリアにて特別高圧66kV系統連系 40MW / 160MWh 系統用蓄電所の設計・主要機器供給を受注',
      summary: '消防法第17条および告示第2号に完全準拠した液冷LFPコンテナ蓄電池システムおよび特高変電スキッドを一括納入いたします。',
      isHot: true
    },
    {
      id: 'news-3',
      date: '2026.09.10',
      category: '技術動向',
      title: '【技術論文】FIP太陽光発電所におけるインバランスペナルティ最小化と蓄電池併設マルチユース運用の実証データ',
      summary: 'NEDO予測データベースとJEPXスポット市場価格変動を連動させた蓄電池運用の最新実証分析結果を公開いたしました。',
      isHot: false
    },
    {
      id: 'news-4',
      date: '2026.09.02',
      category: '補助金情報',
      title: '令和8年度 経済産業省「再生可能エネルギー導入加速化・系統用蓄電池等導入支援補助金」の公募要領が発表',
      summary: '蓄電容量10MWh以上の系統用蓄電所に対する設備費補助（最大1/3）の申請枠が拡充されました。申請事前相談を受付中です。',
      isHot: false
    },
    {
      id: 'news-5',
      date: '2026.08.20',
      category: '企業情報',
      title: '株式会社ソルネクサ、技術開発拠点「SOLNEXA Advanced Energy Lab」を千葉県柏市に開設',
      summary: '実規模蓄電コンテナの熱マネジメント試験および一般送配電事業者との遠隔制御通信プロトコル検証設備を本格稼働。',
      isHot: false
    }
  ];

  const filtered = activeCategory === 'all' 
    ? newsItems 
    : newsItems.filter(n => n.category === activeCategory);

  return (
    <section className="space-y-6">
      {/* Header with Title and Category Filters */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#002b49] rounded-xs" />
            <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
              News &amp; Information
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
            新着情報・市場動向・法令ニュース
          </h2>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-semibold overflow-x-auto">
          {['all', '政策・法令', 'プレスリリース', '技術動向', '補助金情報'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === cat 
                  ? 'bg-[#002b49] text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'all' ? 'すべて' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Minimalist News List with Thin 1px Separators (Solar Frontier style, NOT card clutter) */}
      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-xs">
        {filtered.map((item) => (
          <div 
            key={item.id}
            onClick={() => onNavigateTab('news')}
            className="p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2.5 text-xs text-slate-500">
                <span className="font-mono text-slate-600 font-medium">{item.date}</span>
                <span aria-hidden="true" className="text-slate-300">·</span>
                <span className="font-semibold text-[#002b49] bg-blue-50/80 px-2 py-0.5 rounded text-[11px]">
                  {item.category}
                </span>
                {item.isHot && (
                  <>
                    <span aria-hidden="true" className="text-slate-300">·</span>
                    <span className="text-[#d81a28] font-bold text-[11px]">重要</span>
                  </>
                )}
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#002b49] transition-colors leading-snug">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-[#002b49]">
              <span>詳細</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#d81a28]" />
            </div>
          </div>
        ))}
      </div>

      <div className="text-center pt-2">
        <button
          onClick={() => onNavigateTab('news')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#002b49] hover:text-[#d81a28] transition-colors cursor-pointer"
        >
          <span>ニュース・法令レポート一覧へ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
