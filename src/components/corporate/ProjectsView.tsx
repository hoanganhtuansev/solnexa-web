import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Calendar, 
  BatteryCharging, 
  Sun, 
  Zap, 
  CheckCircle2, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';

interface ProjectsViewProps {
  onOpenContact: () => void;
  onOpenEngineeringTools: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  onOpenContact,
  onOpenEngineeringTools
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<any | null>(null);

  const projects = [
    {
      id: 'proj-fukushima-bess',
      type: 'bess',
      typeLabel: '系統用蓄電所',
      name: '福島相馬 系統用特別高圧大型蓄電所',
      location: '福島県相馬市',
      completedYear: '2025年 竣工',
      scale: '40 MW / 160 MWh',
      voltage: '特別高圧 66 kV 連系',
      client: '大手インフラファンド / 東北電力エリア',
      image: APP_IMAGES.solarFacility,
      summary: '東北電力エリアにおける再エネ受入拡大と、長期脱炭素電源オークション（容量市場）落札に基づく4時間持続型（160MWh）大型蓄電所。',
      challenges: '冬期の降雪・凍結環境への耐候性と、敷地境界に対する消防法保有空地3mの確保、66kV特高受変電所の一体化設計。',
      solutions: '耐塩害・寒冷地仕様の液冷LFPコンテナ40台を採用。全域ガス自動消火設備および特高変電スキッドを工場出荷時プレハブ化することで、冬季工期を3ヶ月短縮。',
      results: '系統連系試験（FAC）を一発合格。需給調整市場およびJEPXアービトラージにおいて計画通りの収益性を実証。',
      specs: [
        { label: '蓄電容量', value: '40MW / 160MWh (LFP液冷 40台)' },
        { label: '連系電圧', value: '特別高圧 66kV (架空送電線直結)' },
        { label: 'PCS構成', value: '3,125kVA 双方向インバータ × 13台' },
        { label: '消防法適合', value: '保有空地3m確保、FK-5-1-12消火設備' }
      ]
    },
    {
      id: 'proj-hokkaido-fip',
      type: 'hybrid',
      typeLabel: 'PV＋BESS FIP複合',
      name: '北海道十勝 FIPメガソーラー ＋ 蓄電池併設プロジェクト',
      location: '北海道十勝郡',
      completedYear: '2025年 竣工',
      scale: '太陽光 15 MWdc ＋ 蓄電池 30 MWh',
      voltage: '特別高圧 22 kV 連系',
      client: '国内総合エネルギー事業者 / 北海道電力エリア',
      image: APP_IMAGES.headerBanner,
      summary: '北海道電力のノンファーム型接続（系統混雑時の出力制御前提）に対し、30MWhの蓄電池を併設することで発電ロスを回避し、FIP制度下での売電収入を極大化。',
      challenges: '出力制御指令が頻発する昼間の大電力を高速で蓄電池に退避させ、インバランスペナルティをゼロ化すること。',
      solutions: 'ソルネクサのAIスマートEMSを導入し、発電予測と北海道電力の制御シグナルをミリ秒単位で連動。過積載150%の太陽光電力を漏れなく充電。',
      results: '年間出力制御損失率を従来の28%から2.1%に削減。FIPプレミアム単価の高値時間帯放電により投資回収期間を2.5年短縮。',
      specs: [
        { label: '太陽光直流容量', value: '15.2 MWdc (N型TOPCon 620W)' },
        { label: '蓄電池容量', value: '30 MWh (20ftコンテナ 8台)' },
        { label: '受変電設備', value: '22kV プレハブ変電スキッド' },
        { label: '過積載比率', value: '152%' }
      ]
    },
    {
      id: 'proj-gunma-ppa',
      type: 'ppa',
      typeLabel: '屋根置 自家消費PPA',
      name: '群馬太田 大型物流センター 屋根置き自家消費PPA',
      location: '群馬県太田市',
      completedYear: '2024年 竣工',
      scale: '2.4 MWdc (屋根置き)',
      voltage: '高圧 6.6 kV 連系',
      client: '大手物流ディベロッパー / 東京電力PGエリア',
      image: APP_IMAGES.ambientBg,
      summary: '延床面積60,000㎡の大型物流倉庫屋根を活用したオンサイトPPA。冷凍冷蔵倉庫の昼間空調ピーク電力を再エネで相殺。',
      challenges: '屋根の防水保証を毀損しない施工方法の選定と、無許可逆潮流を100%遮断する高圧保護協調。',
      solutions: 'ハゼ締め金具による無孔工法架台を採用。逆電力継電器（RPR）と分散型PCSの高速出力追従制御（0.4秒応答）を構築。',
      results: '施設の年間買電電力量の42%を自家消費化。Scope 2排出量を年間約1,380トン削減。',
      specs: [
        { label: '太陽電池容量', value: '2,420 kWdc (3,900枚)' },
        { label: 'PCS構成', value: '100kW 分散型PCS × 20台' },
        { label: '工法', value: '折板屋根ハゼ締めクランプ孔開けレス' },
        { label: '年間発電量', value: '約 2,750,000 kWh' }
      ]
    },
    {
      id: 'proj-kyushu-bess',
      type: 'bess',
      typeLabel: '系統用蓄電所',
      name: '九州 50MWh 出力制御対策 系統直結型蓄電所',
      location: '福岡県・熊本県境界',
      completedYear: '2024年 竣工',
      scale: '25 MW / 50 MWh',
      voltage: '特別高圧 66 kV 連系',
      client: '再エネ発電事業者連合 / 九州電力送配電エリア',
      image: APP_IMAGES.bessContainer,
      summary: '日本国内で最も再エネ出力制御が頻発する九州エリアにおいて、制御回避とJEPX裁定取引に特化した系統直結BESS。',
      challenges: '真夏の周囲温度40℃を超える高温環境下での連続高Cレート充放電と、局地的大雨・浸水対策。',
      solutions: '独立空調・液冷デュアル熱マネジメントシステム搭載のLFPコンテナを採用。嵩上げ基礎（GL+1.2m）による浸水防止構造。',
      results: '昼間の0.01円/kWh余剰電力を充電し、夕方35円/kWhで売電。稼働初年度より計画比118%のキャッシュフローを達成。',
      specs: [
        { label: '出力 / 容量', value: '25 MW / 50 MWh (2時間放電型)' },
        { label: '放電サイクル', value: '1日 1.5サイクル (充放電最適化)' },
        { label: '冷却システム', value: '液冷循環 (セル温度差≦1.8℃)' },
        { label: '系統保護', value: '87T, 51, 64OV 完全協調' }
      ]
    },
    {
      id: 'proj-nagano-agri',
      type: 'solar',
      typeLabel: 'ソーラーシェアリング',
      name: '長野佐久 営農型太陽光発電 ＋ 小型蓄電システム',
      location: '長野県佐久市',
      completedYear: '2024年 竣工',
      scale: '1.8 MWdc ＋ 2 MWh BESS',
      voltage: '高圧 6.6 kV 連系',
      client: '農業法人・地域エネルギー協議会',
      image: APP_IMAGES.solarFacility,
      summary: '遮光率30%の両面発電モジュールを下部農地（果樹・高原野菜）の上部に高脚架台（支柱高3.2m）で設置した営農型太陽光。',
      challenges: '大型農業機械の走行動線確保と、農地転用許可（一時転用3年更新）および強風対策。',
      solutions: 'JIS C 8955耐風圧基準をクリアする高張力鋼管杭構造。下部日照を確保する両面受光セルレイアウト。',
      results: '農作物の収量を維持しながら、売電収入および農業施設の非常用電源（BESSバックアップ）を両立。',
      specs: [
        { label: '支柱高さ', value: '地上高 3.2 m (トラクター通行可能)' },
        { label: '営農作物', value: 'ブルーベリーおよび高原ハーブ' },
        { label: '架台強度', value: '基準風速 Vo=34m/s 耐風構造' },
        { label: '蓄電池', value: '2 MWh (農業施設自立運転兼用)' }
      ]
    },
    {
      id: 'proj-ibaraki-mega',
      type: 'solar',
      typeLabel: '産業用メガソーラー',
      name: '茨城水戸 10MW 特高メガソーラー（過積載165%）',
      location: '茨城県水戸市郊外',
      completedYear: '2023年 竣工',
      scale: '10.5 MWdc / 6.4 MWac',
      voltage: '特別高圧 22 kV 連系',
      client: '外資系再生可能エネルギー投資法人',
      image: APP_IMAGES.headerBanner,
      summary: 'ゴルフ場跡地を活用した特別高圧メガソーラー。起伏のある地形に対し、3D日影解析に基づく最適アレイ配置を実施。',
      challenges: '傾斜地による段差影と、連系点までの幹線ケーブル延長（2.2km）による交流電圧降下対策。',
      solutions: 'JIS C 3605規格 CVケーブルのサイズアップおよび分散型ストリングPCS採用により、全系損失を3.4%に抑制。',
      results: '初年度発電量 13,200,000 kWh（シミュレーション比104%）を記録。現在も安定稼働中。',
      specs: [
        { label: '直流容量', value: '10,500 kWdc' },
        { label: '交流容量', value: '6,400 kWac (過積載 164%)' },
        { label: 'ケーブル選定', value: 'JIS C 3605 6600V CVT 150sq' },
        { label: '受変電所', value: '22kV 受電設備（特高変圧器 7.5MVA）' }
      ]
    }
  ];

  const filtered = filterType === 'all'
    ? projects
    : projects.filter(p => p.type === filterType);

  return (
    <div className="space-y-12">
      {/* Header Banner */}
      <div className="bg-[#002244] text-white rounded-xl p-8 sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
            SOLNEXA Project References
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            導入実績・プロジェクト事例
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            日本全国の特別高圧系統用蓄電所（40MW+）、FIP太陽光＋蓄電池併設、自家消費PPAなど、厳しい日本の法令・系統連系基準をクリアした代表的なプロジェクト実績をご紹介します。
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>種別で絞り込み:</span>
        </span>
        {[
          { id: 'all', label: 'すべての実績' },
          { id: 'bess', label: '系統用蓄電所' },
          { id: 'hybrid', label: '太陽光＋BESS併設' },
          { id: 'ppa', label: '自家消費・PPA' },
          { id: 'solar', label: '産業用メガソーラー' }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilterType(btn.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterType === btn.id
                ? 'bg-[#003366] text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((proj) => (
          <div 
            key={proj.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={proj.image} 
                  alt={proj.name} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#002244]/90 backdrop-blur-xs text-amber-300 text-[10px] font-bold rounded">
                  {proj.typeLabel}
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium rounded flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  <span>{proj.location}</span>
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                <div className="text-xs text-slate-400 font-mono flex items-center justify-between">
                  <span>{proj.completedYear}</span>
                  <span className="font-bold text-slate-800">{proj.scale}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#003366] transition-colors leading-snug">
                  {proj.name}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2">
                  {proj.summary}
                </p>

                <div className="pt-2 text-xs text-slate-500 font-medium">
                  連系規格: <span className="font-bold text-slate-800">{proj.voltage}</span>
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between mt-2">
              <button
                onClick={() => setSelectedProject(proj)}
                className="text-xs font-bold text-[#003366] hover:underline"
              >
                事例詳細・技術仕様を見る
              </button>
              <button
                onClick={onOpenContact}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded transition-colors"
              >
                同様案件の相談
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-amber-700">{selectedProject.typeLabel} ｜ {selectedProject.location}</span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">{selectedProject.name}</h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">規模: {selectedProject.scale} ｜ {selectedProject.voltage}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ 閉じる
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200">
              <img src={selectedProject.image} alt={selectedProject.name} className="w-full h-56 object-cover" />
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">【プロジェクト概要】</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProject.summary}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">【技術的課題と背景】</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProject.challenges}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">【ソルネクサのエンジニアリング対応】</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProject.solutions}</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">【導入成果・パフォーマンス】</h4>
                <p className="text-slate-600 leading-relaxed">{selectedProject.results}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">主要設備構成</h4>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 divide-y divide-slate-200 text-xs">
                {selectedProject.specs.map((s: any, i: number) => (
                  <div key={i} className="py-1.5 flex justify-between gap-4">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="font-semibold text-slate-900 text-right">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
              <button
                onClick={() => setSelectedProject(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200"
              >
                閉じる
              </button>
              <button
                onClick={() => {
                  setSelectedProject(null);
                  onOpenContact();
                }}
                className="px-4 py-2 bg-[#003366] text-white text-xs font-bold rounded-md hover:bg-[#002244]"
              >
                この実績を参考に見積もりを依頼
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
