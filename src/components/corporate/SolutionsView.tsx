import React, { useState } from 'react';
import { 
  BatteryCharging, 
  Sun, 
  Building, 
  Cpu, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Zap, 
  Activity, 
  Layers, 
  TrendingUp,
  FileCheck
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';

interface SolutionsViewProps {
  onOpenContact: () => void;
  onOpenEngineeringTools: () => void;
  initialTab?: 'bess' | 'solar' | 'ppa' | 'grid' | 'ems';
}

export const SolutionsView: React.FC<SolutionsViewProps> = ({
  onOpenContact,
  onOpenEngineeringTools,
  initialTab = 'grid'
}) => {
  const [activeTab, setActiveTab] = useState<'bess' | 'solar' | 'ppa' | 'grid' | 'ems'>(initialTab);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const solutions = [
    {
      id: 'grid',
      title: '特別高圧・高圧受変電 & 系統連系協調',
      tag: '系統連系エンジニアリング',
      subtitle: '一般送配電事業者との連系協議、保護継電器整定、工事計画届出を一括支援',
      image: APP_IMAGES.cleanWhiteSubstation,
      description: '東京電力PG、関西電力送配電、九州電力送配電をはじめとする全国の一般送配電事業者との系統アクセス検討、接続検討申請、特別高圧（66kV/22kV）受変電設備の単線結線図（SLD）作成、保護継電器協調（87T比率差動、51過電流、64OV地絡、67R逆電力）計算を確実に完遂します。',
      features: [
        '系統連系協議の採択実績98.4%: 一般送配電事業者の最新技術要件を熟知した事前シミュレーション',
        '電気事業法第48条 工事計画届出書作成: 産業保安監督部への技術基準適合確認届出を全面サポート',
        '単線結線図（SLD）自動生成: 当社のエンジニアリングツール上でJIS電気用図記号に完全準拠したCAD図面を出力',
        '系統短絡容量・過渡安定度解析: 連系点での短絡比（SCR）および電圧変動率の事前検証'
      ],
      specs: [
        { label: '受変電設備', value: 'キュービクル（高圧）、特高変電所（GIS/開放型）' },
        { label: '対応保護リレー', value: '87T, 51, 51V, 64OV, 67R, 27, 59' },
        { label: '接続方式', value: '専用線接続、既設系統分岐、T分岐' },
        { label: '保安規程', value: '主任技術者選任届出および保安規程制定支援' }
      ]
    },
    {
      id: 'bess',
      title: '系統用蓄電システム (Grid-Scale BESS)',
      tag: '特別高圧／高圧対応',
      subtitle: '容量市場・需給調整市場・JEPX裁定取引に最適化された大型蓄電所ソリューション',
      image: APP_IMAGES.cleanWhiteSubstation,
      description: '日本国内の電力市場（JEPX、需給調整市場、長期脱炭素電源オークション）において、最大収益を実現するための高信頼性蓄電所を設計・構築します。消防法告示基準に準拠した液冷式LFPコンテナ蓄電池（3.72MWh〜5.0MWh/台）と特高変電スキッドを組み合わせ、10MW〜100MW+の大規模蓄電所に対応します。',
      features: [
        '消防法完全準拠: 保有空地3m離隔、全域ガス自動消火システム（FK-5-1-12/エアロゾル）標準搭載',
        '高効率液冷技術: セル間温度差≦2℃を実現し、電池寿命（8000サイクル以上）と充放電効率（RTE 88%以上）を最大化',
        '特高受変電スキッド: 変圧器、66kV/22kV真空遮断器（VCB）、保護継電器をプレハブ一体化した高圧スキッド',
        'マルチマーケット対応EMS: JEPX価格予測、出力制御指令、周波数調整指令に瞬時連動する高度制御'
      ],
      specs: [
        { label: '推奨蓄電容量', value: '10MWh 〜 200MWh+' },
        { label: '連系電圧区分', value: '特別高圧 (22kV / 66kV / 77kV / 154kV)' },
        { label: '電池種類', value: 'リン酸鉄リチウムイオン (LFP)' },
        { label: '充放電レート', value: '0.25C 〜 1.0C (用途に応じ最適選定)' },
        { label: '法規制適合', value: '消防法第17条、電気事業法第48条、IEC 62933' }
      ]
    },
    {
      id: 'solar',
      title: '産業用メガソーラー & FIP蓄電池併設',
      tag: 'FIT／FIP制度対応',
      subtitle: '過積載設計と蓄電池併設によるインバランス低減・再エネ最大活用モデル',
      image: APP_IMAGES.solarFrontierDaylight,
      description: 'FITからFIP制度への移行が進む中、発電量予測誤差によるインバランスペナルティの回避と出力制御損失の最小化が最重要課題です。ソルネクサは、高効率単結晶N型TOPConモジュール、過積載比率140〜160%の直流回路設計、および直流側または交流側蓄電池併設により、事業採算性を極大化します。',
      features: [
        'JIS C 8955:2017準拠架台設計: 地域ごとの基準風速（Vo=30〜46m/s）および垂直積雪量に応じた強度構造解析',
        '高効率ストリング設計: 冬季最低外気温でのVoc開放電圧安全余裕とMPPT最大入力電圧の最適マッチング',
        '交流損失・電圧降下低減: JIS C 3605規格ケーブルの最適サイズ選定により全系電圧降下2%以下を達成',
        'ノンファーム型接続対応: 出力制御指令時に蓄電池へ自動充電退避させ、無駄な発電ロスをゼロ化'
      ],
      specs: [
        { label: '発電所規模', value: '高圧 (500kW〜) 〜 特別高圧 (50MW+)' },
        { label: '過積載比率', value: '130% 〜 170% 推奨' },
        { label: 'モジュール効率', value: '22.5% 〜 23.5% (N型TOPCon)' },
        { label: 'PCS構成', value: '集中型 (1250kW〜) または 分散型ストリングPCS' },
        { label: '法規制適合', value: '電気事業法、電気設備技術基準、農地法・森林法' }
      ]
    },
    {
      id: 'ppa',
      title: '自家消費型・コーポレートPPA',
      tag: 'オンサイト／オフサイトPPA',
      subtitle: '企業のScope 2削減、RE100達成、電気代高騰ヘッジを可能にする屋根置き・カーポートPV',
      image: APP_IMAGES.rooftopSolarDaylight,
      description: '製造業の工場、物流倉庫、商業施設、データセンターの屋根や遊休地を活用した自家消費型太陽光発電システムです。電力消費パターンに合わせた蓄電池（ピークカット用BESS）を組み合わせることで、契約電力（デマンド値）の引き下げと基本料金削減、BCP非常時電源供給を同時に達成します。',
      features: [
        '孔開けレス折板屋根工法: 建築躯体の防水保証を維持するハゼ締めクランプ固定技術',
        '逆潮流防止・デマンドコントロール連動: RPR（逆電力継電器）とPCS高速出力追従制御（0.5秒以内）',
        'BCP停電時自立運転: 商用系統停電時、重要負荷へ蓄電池から無瞬断で電力供給',
        'CO2削減価値トラッキング: 環境価値（非化石証書等）のリアルタイム集計とレポーティング'
      ],
      specs: [
        { label: '設置場所', value: '折板屋根、スレート屋根、駐車場ソーラーカーポート' },
        { label: 'システム規模', value: '100kW 〜 5,000kW (屋根置オンサイト)' },
        { label: '電力削減率', value: '工場消費電力の 30% 〜 60% を代替' },
        { label: '消防法対応', value: '建築基準法耐震基準、少量危険物適合蓄電設備' },
        { label: '契約スキーム', value: 'オンサイトPPA（自己所有または第三者所有型）' }
      ]
    },
    {
      id: 'ems',
      title: '遠隔監視 & AIスマートEMS',
      tag: '市場運用アルゴリズム',
      subtitle: '気象予測・JEPX市場価格連動による充放電スケジュール自動最適化',
      image: APP_IMAGES.smartEmsDaylight,
      description: '気象庁アメダス・衛星日射量データに基づく発電量予測エンジンと、翌日のJEPXスポット価格・需給調整市場の価格シグナルをAIが解析し、蓄電池の充放電スケジュールを1分単位で自動最適化。PCSおよびスマートメーターと高速通信（MODBUS TCP/IEC 61850）で連携します。',
      features: [
        'JEPX裁定取引アルゴリズム: 昼間の底値時間帯に自動充電し、夕方・夜間の高値時間帯に最大放電',
        '出力制御（ノンファーム）自動追従: 電力会社からのリアルタイム制御シグナルをミリ秒単位で検知し蓄電退避',
        'ストリング・セルレベル遠隔監視: モジュール1列ごと、蓄電池セル1本ごとの電圧・温度・SOH劣化状態を可視化',
        '異常予兆検知: 局所発熱（ホットスポット）や絶縁抵抗低下の初期段階をAIがアラート通知'
      ],
      specs: [
        { label: '通信プロトコル', value: 'MODBUS TCP/RTU, IEC 61850, DNP3' },
        { label: '監視サンプリング', value: '1秒 〜 1分 (高精度ロギング)' },
        { label: 'データ保持期間', value: '20年間クラウド安全保管' },
        { label: 'セキュリティ', value: '金融機関水準 TLS 1.3 暗号化・閉域VPN網' }
      ]
    }
  ];

  const current = solutions.find(s => s.id === activeTab) || solutions[0];

  return (
    <div className="space-y-10">
      {/* Header Banner - Solar Frontier Architectural Daylight Presentation */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg min-h-[220px] sm:min-h-[250px] flex items-center bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src={APP_IMAGES.solarFrontierDaylight} 
            alt="SOLNEXA Solar & BESS Architectural Infrastructure" 
            className="w-full h-full object-cover object-center"
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.96) 0%, rgba(255, 255, 255, 0.90) 45%, rgba(255, 255, 255, 0.40) 75%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl p-6 sm:p-10 space-y-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
            <span className="text-xs font-black text-[#002b49] uppercase tracking-wider">
              SOLNEXA Engineering Solutions
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              JIS C 3605 / 消防法適合
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#002b49]">
            ソリューション・事業案内
          </h1>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            系統用大型蓄電池（BESS）から産業用特高メガソーラー、屋根置自家消費PPA、そして高圧受変電設備まで、日本の電力インフラ基準（JIS、電気事業法、消防法）に完全準拠した総合エンジニアリングサービスを提供します。
          </p>

          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenContact}
              className="px-5 py-2.5 bg-gradient-to-r from-[#d81a28] to-[#ea580c] hover:from-[#b51420] hover:to-[#c2410c] text-white font-extrabold text-xs rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>【無料】太陽光・BESS設計 見積依頼はこちら</span>
            </button>
            <button
              onClick={onOpenEngineeringTools}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-[#002b49] border border-[#002b49] font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Cpu className="w-4 h-4 text-[#002b49]" />
              <span>設計ツールで事前計算を試す</span>
            </button>
          </div>
        </div>
      </div>

      {/* Solution Selector Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {solutions.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`px-4 py-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-left flex items-center gap-2 border ${
              activeTab === item.id 
                ? 'bg-[#003366] text-white border-[#003366] shadow-xs' 
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.id === 'bess' && <BatteryCharging className="w-4 h-4 text-amber-400" />}
            {item.id === 'solar' && <Sun className="w-4 h-4 text-amber-400" />}
            {item.id === 'ppa' && <Building className="w-4 h-4 text-amber-400" />}
            {item.id === 'grid' && <Zap className="w-4 h-4 text-amber-400" />}
            {item.id === 'ems' && <Cpu className="w-4 h-4 text-amber-400" />}
            <span>{item.title}</span>
          </button>
        ))}
      </div>

      {/* Detailed Solution Body */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-100 text-[#003366] font-bold text-xs rounded">
                {current.tag}
              </span>
              <span className="text-xs text-slate-500">標準対応</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
              {current.title}
            </h2>
            <p className="text-sm font-semibold text-slate-700">
              {current.subtitle}
            </p>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-2">
              {current.description}
            </p>

            <div className="pt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>技術的強み・特徴</span>
              </h4>
              <ul className="space-y-2">
                {current.features.map((feat, idx) => (
                  <li key={idx} className="text-xs sm:text-sm text-slate-700 flex items-start gap-2">
                    <span className="text-amber-500 font-bold shrink-0 mt-0.5">✔</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenContact}
                className="px-5 py-2.5 bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs rounded-md shadow-xs transition-colors"
              >
                このソリューションについて相談・見積依頼
              </button>
              <button
                onClick={onOpenEngineeringTools}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-md border border-slate-300 transition-colors"
              >
                設計ツールで事前計算を試す
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-md">
              <img 
                src={current.image} 
                alt={current.title} 
                className="w-full h-64 object-cover"
              />
            </div>

            {/* Technical Specifications Table */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                標準技術仕様・パラメータ
              </h4>
              <div className="divide-y divide-slate-200/60 text-xs">
                {current.specs.map((spec, i) => (
                  <div key={i} className="py-2 flex justify-between gap-4">
                    <span className="text-slate-500 font-medium">{spec.label}</span>
                    <span className="text-slate-900 font-bold text-right">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
