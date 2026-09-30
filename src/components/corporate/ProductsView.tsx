import React, { useState } from 'react';
import { 
  Package, 
  BatteryCharging, 
  Sun, 
  Zap, 
  Cpu, 
  FileText, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Filter
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';

interface ProductsViewProps {
  onOpenContact: () => void;
  onOpenEngineeringTools: () => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  onOpenContact,
  onOpenEngineeringTools
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  const products = [
    {
      id: 'prod-bess-20ft',
      category: 'bess',
      categoryLabel: '系統用蓄電システム',
      name: 'SOLNEXA-BESS-3720L',
      subName: '20ft 液冷式系統用蓄電池コンテナ（3.72MWh / LFP）',
      image: APP_IMAGES.cleanWhiteSubstation,
      badge: '消防法第17条適合',
      summary: '国内の厳しい消防法保有空地基準（3m離隔）および火災予防条例に対応した、高密度液冷式リン酸鉄リチウムイオン（LFP）蓄電コンテナ。',
      highlights: [
        '蓄電容量: 3,727 kWh (3.72 MWh) @ 1,331V',
        '高効率液冷方式: セル温度偏差≦2℃で長寿命化（8000サイクル以上）',
        '全域ガス自動消火システム（FK-5-1-12/Novec代替）標準搭載',
        '防錆等級: C5高耐塩害仕様、保護等級: IP55'
      ],
      specs: {
        '電池セルタイプ': 'CATL / EVE 高耐久LFPセル 314Ah',
        '定格電圧': '1,331.2 V',
        '電圧動作範囲': '1,164.8 V 〜 1,497.6 V',
        '最大充放電レート': '0.5C（連続）/ 1.0C（ピーク短時間）',
        '外形寸法 (L×W×H)': '6,058 × 2,438 × 2,896 mm (20ft High Cube)',
        '総重量': '約 32,000 kg',
        '動作環境温度': '-30℃ 〜 +50℃'
      }
    },
    {
      id: 'prod-bess-40ft',
      category: 'bess',
      categoryLabel: '系統用蓄電システム',
      name: 'SOLNEXA-BESS-5000L',
      subName: '40ft 液冷式大規模系統用蓄電池コンテナ（5.0MWh / LFP）',
      image: APP_IMAGES.cleanBessFacility,
      badge: '特高メガプロジェクト向け',
      summary: '50MW〜100MW超の大規模系統用蓄電所向けに設計された5MWh大容量コンテナ。敷地面積あたりの蓄電密度を最大化し、土木工事費を低減。',
      highlights: [
        '蓄電容量: 5,015 kWh (5.01 MWh)',
        'セル単位の電圧・温度常時監視（BMS3段階保護）',
        '消防法対応 自動煙・熱・可燃性ガス連動遮断機構',
        '充放電往復効率 (RTE): ≧ 88.5% (PCS端子間)'
      ],
      specs: {
        '電池セルタイプ': 'リン酸鉄リチウムイオン (LFP) 314Ah',
        '定格電圧': '1,331.2 V',
        '外形寸法 (L×W×H)': '12,192 × 2,438 × 2,896 mm (40ft High Cube)',
        '総重量': '約 50,000 kg',
        '冷却方式': 'インテリジェント液冷 (グリコール水溶液循環)',
        '通信方式': 'MODBUS TCP, IEC 61850'
      }
    },
    {
      id: 'prod-pcs-3125',
      category: 'pcs',
      categoryLabel: 'パワーコンディショナ (PCS)',
      name: 'SOLNEXA-PCS-3125K',
      subName: '3,125kW 系統用双方向蓄電インバータ（屋外型・特高直結対応）',
      image: APP_IMAGES.cleanWhiteSubstation,
      badge: '特高変電所最適化',
      summary: '系統用蓄電池および特高メガソーラーに直結可能な集中型双方向PCS。高調波抑制・力率制御・自律周波数応答（FRT/FVT）機能を完全網羅。',
      highlights: [
        '定格出力: 3,125 kVA @ 40℃ (交流側 690V)',
        '最大直流入力電圧: 1,500 Vdc',
        '変換効率: 99.0% (最大効率)',
        '一般送配電事業者の系統連系保護要件（FRT、力率±0.85）完全準拠'
      ],
      specs: {
        '定格交流電圧': '690 Vac, 3相3線',
        '定格周波数': '50Hz / 60Hz 切替',
        '直流入力電圧範囲': '950 V 〜 1,500 V',
        '力率制御範囲': '遅れ0.8 〜 進み0.8',
        '保護等級': 'IP65 (屋外設置対応)',
        '過負荷耐量': '110% 連続運転可能'
      }
    },
    {
      id: 'prod-pv-topcon',
      category: 'module',
      categoryLabel: '太陽電池モジュール',
      name: 'SOLNEXA-TOPCon-620W',
      subName: '単結晶 N型 TOPCon 高効率両面受光モジュール (620W+)',
      image: APP_IMAGES.solarFrontierDaylight,
      badge: 'JIS C 8918認証',
      summary: '最新のN型TOPConセル技術を採用した超高効率太陽電池モジュール。裏面発電（両面受光率80±5%）により、地表面反射光を吸収して総発電量を最大25%向上。',
      highlights: [
        '最大出力: 620W （モジュール変換効率 22.95%）',
        '温度係数 Pmax: -0.30%/℃ （高温時の出力低下が極めて少ない）',
        '初期劣化（LID）フリー ＆ 30年間出力保証（87.4%残存）',
        '耐風圧荷重 2,400Pa / 耐積雪荷重 5,400Pa (JIS C 8955適合)'
      ],
      specs: {
        '開放電圧 (Voc)': '51.80 V',
        '短絡電流 (Isc)': '15.15 A',
        '最大出力時電圧 (Vmp)': '43.20 V',
        '最大出力時電流 (Imp)': '14.36 A',
        '外形寸法': '2,465 × 1,134 × 30 mm',
        '質量': '31.5 kg',
        'ガラス': '2.0mm + 2.0mm 半強化高透過ガラス (ダブルガラス)'
      }
    },
    {
      id: 'prod-skid-66kv',
      category: 'substation',
      categoryLabel: '受変電設備・スキッド',
      name: 'SOLNEXA-SKID-66KV',
      subName: '特別高圧 (66kV / 22kV / 6.6kV) プレハブ変電スキッド',
      image: APP_IMAGES.cleanWhiteSubstation,
      badge: '短工期・一体輸送',
      summary: '変圧器、真空遮断器（VCB）、断路器（DS）、保護継電器盤を鋼製スキッド上に一体配置したプレハブ特高受変電設備。現地工期を従来の半分に短縮。',
      highlights: [
        '定格容量: 5MVA 〜 50MVA 受変電対応',
        '保護協調盤（87T、51、64OV）を工場にて配線・試験完了済み',
        '電気事業法第48条 工事計画届出書・試験成績書添付',
        '耐震設計: 建築基準法 局部震度法 1.0G 構造計算対応'
      ],
      specs: {
        '一次電圧': '66 kV / 77 kV / 22 kV',
        '二次電圧': '6.6 kV / 690 V',
        '遮断器': 'ガス遮断器 (GCB) または 真空遮断器 (VCB)',
        '冷却方式': '油入自冷式 (ONAN)',
        '保護継電器': 'デジタル形マルチリレー（JIS準拠）'
      }
    },
    {
      id: 'prod-smart-ems',
      category: 'ems',
      categoryLabel: 'AIスマートEMS',
      name: 'SOLNEXA-SMART-EMS',
      subName: '電力市場連動型 統合エネルギーマネジメントシステム',
      image: APP_IMAGES.smartEmsDaylight,
      badge: 'JEPX連動アルゴリズム',
      summary: '翌日のJEPXスポット価格、需給調整市場、太陽光発電量予測データをAIが分析し、PCSと蓄電コンテナの充放電スケジュールを1分単位で自律制御。',
      highlights: [
        'JEPX市場アービトラージ・出力制御自動追従制御',
        'PCS・蓄電池・キュービクル統合リアルタイムロギング（1秒周期）',
        '遠隔異常通報・絶縁抵抗低下・過熱予兆検知機能',
        '電力会社向け遠隔出力制御装置（オンライン代理制御）標準対応'
      ],
      specs: {
        '通信プロトコル': 'MODBUS TCP/RTU, IEC 61850, DNP3',
        'サーバー構成': 'オンプレミス産業用PC ＋ クラウド二重冗長化',
        '制御周期': '100ミリ秒 〜 1分',
        'セキュリティ': '産業用ファイアウォール・VPN常時暗号化'
      }
    }
  ];

  const filteredProducts = filterCategory === 'all'
    ? products
    : products.filter(p => p.category === filterCategory);

  return (
    <div className="space-y-10">
      {/* Header Banner - High-Key Daylight Architectural Style */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md min-h-[200px] flex items-center bg-white">
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src={APP_IMAGES.cleanWhiteSubstation} 
            alt="SOLNEXA Product & Equipment Catalog" 
            className="w-full h-full object-cover object-center"
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.88) 45%, rgba(255, 255, 255, 0.40) 75%, transparent 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-3xl p-6 sm:p-10 space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
            <span className="text-xs font-bold text-[#002b49] uppercase tracking-wider">
              SOLNEXA Equipment & Systems Catalog
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
              主要機器国内即納・仕様書完備
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#002b49]">
            取扱製品・設備カタログ
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            消防法完全適合の液冷式系統用蓄電池コンテナ、N型TOPConモジュール、集中型双方向PCS、特別高圧変電スキッド、AIスマートEMSをワンストップで供給いたします。
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenContact}
              className="px-4 py-2 bg-[#d81a28] hover:bg-[#b51420] text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>製品一括見積・仕様書請求</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenEngineeringTools}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-[#002b49] border border-[#002b49] font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>設計ツールで機器パラメータを適用</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          <span>製品カテゴリ:</span>
        </span>
        {[
          { id: 'all', label: 'すべての製品' },
          { id: 'bess', label: '系統用蓄電システム' },
          { id: 'module', label: '太陽電池モジュール' },
          { id: 'pcs', label: 'パワーコンディショナ (PCS)' },
          { id: 'substation', label: '受変電・特高スキッド' },
          { id: 'ems', label: 'AIスマートEMS' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
              filterCategory === cat.id 
                ? 'bg-[#003366] text-white shadow-xs' 
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div 
            key={prod.id}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="h-52 overflow-hidden relative">
                <img 
                  src={prod.image} 
                  alt={prod.name} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#002244]/90 backdrop-blur-xs text-amber-300 text-[10px] font-bold rounded">
                  {prod.badge}
                </div>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 backdrop-blur-xs text-white text-[11px] font-medium rounded">
                  {prod.categoryLabel}
                </div>
              </div>

              <div className="p-5 space-y-3">
                <div>
                  <h3 className="text-base font-bold font-mono text-slate-900 group-hover:text-[#003366] transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    {prod.subName}
                  </p>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {prod.summary}
                </p>

                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-1 text-xs">
                  {prod.highlights.slice(0, 3).map((hl, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-[11px] leading-snug">{hl}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
              <button
                onClick={() => setSelectedProduct(prod)}
                className="text-xs font-bold text-[#003366] hover:underline"
              >
                仕様書詳細を見る
              </button>
              <button
                onClick={onOpenContact}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded transition-colors"
              >
                見積依頼
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Spec Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-xs font-bold text-[#003366]">{selectedProduct.categoryLabel}</span>
                <h3 className="text-xl font-bold font-mono text-slate-900 mt-1">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-600">{selectedProduct.subName}</p>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕ 閉じる
              </button>
            </div>

            <div className="rounded-lg overflow-hidden border border-slate-200">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-56 object-cover" />
            </div>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedProduct.summary}
            </p>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase">主要仕様パラメータ</h4>
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 divide-y divide-slate-200/80 text-xs">
                {Object.entries(selectedProduct.specs).map(([k, v], i) => (
                  <div key={i} className="py-1.5 flex justify-between gap-4">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-semibold text-slate-900 text-right">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  alert(`【仕様書PDF】${selectedProduct.name} の正式データシートPDFをダウンロードします。`);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#003366] hover:underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>製品データシート (PDF) をダウンロード</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200"
                >
                  閉じる
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    onOpenContact();
                  }}
                  className="px-4 py-2 bg-[#003366] text-white text-xs font-bold rounded-md hover:bg-[#002244]"
                >
                  見積・調達の相談をする
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
