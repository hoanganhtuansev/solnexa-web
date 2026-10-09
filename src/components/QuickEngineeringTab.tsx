import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  Activity,
  Cable,
  Calculator,
  Boxes,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Share2,
  RefreshCw,
  Info,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Building,
  Save,
  Plus,
  HelpCircle,
  FileText,
  ExternalLink,
  CloudSnow,
  LayoutGrid,
  ListFilter,
  Check,
  Sparkles,
  ChevronLeft,
  Printer,
  X,
  ArrowUp,
  BookmarkCheck,
  Trash2,
  Grid,
  Layers,
  Home,
  ShieldAlert,
  Wind,
  TrendingUp
} from 'lucide-react';
import { Project } from '../types';
import { ConduitSizingCalculator } from './ConduitSizingCalculator';
import { SnowWeatherChecker } from './SnowWeatherChecker';
import { BessFireSafetyCalculator } from './BessFireSafetyCalculator';
import { JisWindLoadCalculator } from './JisWindLoadCalculator';
import { BessCurtailmentRevenueCalculator } from './BessCurtailmentRevenueCalculator';
import {
  calculateKyokutoVoltageDrop,
  evaluateAllJisCableCandidates,
  ElectricalSystemType,
  LineClassification
} from '../utils/japaneseStandards';

export type QuickToolTab =
  | 'snow-weather'
  | 'bess-fire-safety'
  | 'jis-wind-load'
  | 'bess-curtailment'
  | 'kyokuto-vdrop'
  | 'isijp-conduit'
  | 'pv-pcs-cable'
  | 'circuit-vdrop'
  | 'cable-selection'
  | 'current-calc'
  | 'transformer-sizing'
  | 'pv-string-check';

interface QuickEngineeringTabProps {
  onSaveToProject?: (calcData: any) => void;
  onOpenProject?: (projectId: string) => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
  initialSubTab?: QuickToolTab;
  activeSubTab?: QuickToolTab;
  onSelectSubTab?: (tab: QuickToolTab) => void;
}

export interface QuickToolMeta {
  id: QuickToolTab;
  alias?: QuickToolTab[];
  titleEn: string;
  titleJa: string;
  badge: string;
  badgeType: 'free' | 'member';
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  cardBorder: string;
  desc: string;
  standard: string;
  outputHighlights: string[];
}

export const QUICK_ENGINEERING_TOOLS: QuickToolMeta[] = [
  {
    id: 'snow-weather',
    titleEn: 'Snow & Weather Checker',
    titleJa: '積雪・気象条件 (告示1455号)',
    badge: '無料 即時解析',
    badgeType: 'free',
    icon: CloudSnow,
    accentColor: 'text-sky-600 bg-sky-100 border-sky-200',
    cardBorder: 'hover:border-sky-400',
    desc: '建設省告示第1455号による自動計算値（d = α×ls + β×rs + γ）と特定行政庁公式規定値（垂直積雪量）を瞬時に対照。海率rs幾何計算・AMeDAS実況・7日間予報・BESS留意事項。',
    standard: '建設省告示第1455号 / 建築基準法施行令第86条第3項',
    outputHighlights: ['垂直積雪量(cm)', '海率rs幾何計算', 'AMeDAS実況', '凍結注意']
  },
  {
    id: 'bess-fire-safety',
    titleEn: 'BESS Fire Safety & Separation',
    titleJa: 'BESS 消防法・離隔距離判定',
    badge: '無料 即時判定',
    badgeType: 'free',
    icon: ShieldAlert,
    accentColor: 'text-rose-600 bg-rose-100 border-rose-200',
    cardBorder: 'hover:border-rose-400',
    desc: '消防法政令第19条および市町村火災予防条例準拠。4,800kWh基準、敷地境界3m離隔、隣接建物離隔、コンテナ間隔、耐火壁（コンクリート100mm等）緩和措置、消火設備要件を自動判定。',
    standard: '消防法政令第19条 / 消防危第2号 / 市町村火災予防条例',
    outputHighlights: ['保有空地3m判定', '4,800kWh基準判定', '耐火壁緩和措置', '消防署事前協議優先度']
  },
  {
    id: 'jis-wind-load',
    titleEn: 'JIS C 8955 Wind Load & Pile Pullout',
    titleJa: 'JIS C 8955 架台風圧・杭引抜力',
    badge: '無料 即時計算',
    badgeType: 'free',
    icon: Wind,
    accentColor: 'text-teal-600 bg-teal-100 border-teal-200',
    cardBorder: 'hover:border-teal-400',
    desc: 'JIS C 8955:2017および建設省告示第1454号準拠。基準風速V0（全国30〜46m/s）、地表面粗度区分、アレイ傾斜角、風力係数Cwから設計風圧荷重qおよびスクリュー杭・基礎引抜耐力を即座に照査。',
    standard: 'JIS C 8955:2017 / 建設省告示第1454号 / 建築基準法施行令第87条',
    outputHighlights: ['風力係数Cw(正/負圧)', '設計速度圧q(N/m²)', '杭引抜安全率FS', '告示1454号準拠']
  },
  {
    id: 'bess-curtailment',
    titleEn: 'BESS Curtailment & JEPX Revenue',
    titleJa: '出力制御回避＆JEPX収益試算',
    badge: '無料 即時試算',
    badgeType: 'free',
    icon: TrendingUp,
    accentColor: 'text-emerald-600 bg-emerald-100 border-emerald-200',
    cardBorder: 'hover:border-emerald-400',
    desc: '各電力エリア（九州・東北等）の出力制御率（10〜18%）およびJEPXスポット市場（0.01円充電〜夕方ピーク放電）に基づく収益スタッキング（余剰回避・価格差益・容量市場・需給調整市場）とIRR・回収年数を瞬時算出。',
    standard: '経済産業省 審議会資料 / 広域機関(OCCTO)連系ルール / JEPX市場',
    outputHighlights: ['年間増収額(万円)', '出力制御回避率(%)', 'プロジェクトIRR(%)', '20年回収シミュレーション']
  },
  {
    id: 'kyokuto-vdrop',
    alias: ['circuit-vdrop'],
    titleEn: 'Kyokuto Voltage Drop',
    titleJa: '極東電線 電圧降下計算',
    badge: '無料',
    badgeType: 'free',
    icon: Activity,
    accentColor: 'text-amber-600 bg-amber-100 border-amber-200',
    cardBorder: 'hover:border-amber-400',
    desc: '極東電線工業技術基準およびJIS C 3605規格準拠。単相・三相低圧電路における導体温度補正許容電流判定と電圧降下率（1%〜3%）を高速算出。',
    standard: 'JIS C 3605 / 極東電線技術資料',
    outputHighlights: ['電圧降下(V/%)', '許容電流(A)', 'JIS適合判定']
  },
  {
    id: 'pv-string-check',
    titleEn: 'PV String Check',
    titleJa: 'PV ストリング検討',
    badge: '無料',
    badgeType: 'free',
    icon: Sliders,
    accentColor: 'text-indigo-600 bg-indigo-100 border-indigo-200',
    cardBorder: 'hover:border-indigo-400',
    desc: '計画地最低設計気温時における太陽電池モジュール開放電圧（Voc_max）を自動計算し、PCS最大許容入力電圧に対する適正直列モジュール数を検証。',
    standard: 'JIS C 8955 / 電気設備技術基準',
    outputHighlights: ['Voc_max(V)', '最適直列数(枚)', 'PCS許容入力判定']
  },
  {
    id: 'current-calc',
    titleEn: 'Current Calculation',
    titleJa: '電流計算 & ブレーカ選定',
    badge: '無料',
    badgeType: 'free',
    icon: Calculator,
    accentColor: 'text-emerald-600 bg-emerald-100 border-emerald-200',
    cardBorder: 'hover:border-emerald-400',
    desc: '設備容量（kW/kVA）から単相・三相負荷電流を求め、JIS C 8305に基づく配線用遮断器（MCCB）の定格トリップ（AT）およびフレーム（AF）を自動選定。',
    standard: 'JIS C 8305 / 内線規程第1375節',
    outputHighlights: ['定格負荷電流(A)', '遮断器AT/AF', '安全率125%判定']
  },
  {
    id: 'isijp-conduit',
    alias: ['cable-selection'],
    titleEn: 'ISIJP Conduit Sizing',
    titleJa: '電線管・配管選定 (ISIJP)',
    badge: '要無料登録',
    badgeType: 'member',
    icon: Cable,
    accentColor: 'text-purple-600 bg-purple-100 border-purple-200',
    cardBorder: 'hover:border-purple-400',
    desc: '内線規程第3110節に基づく電線管占有率（同一電線管32%以下）を自動計算。厚鋼G管・薄鋼E管・硬質ビニルVE管・波付FEP管を即時サイジング。',
    standard: '内線規程第3110節 / JIS C 8305',
    outputHighlights: ['管占有率(%)', '最適呼び径(mm)', 'G/E/VE/FEP管']
  },
  {
    id: 'pv-pcs-cable',
    titleEn: 'PV - PCS Cable Design',
    titleJa: 'PV - PCS 間配線設計',
    badge: '要無料登録',
    badgeType: 'member',
    icon: Zap,
    accentColor: 'text-blue-600 bg-blue-100 border-blue-200',
    cardBorder: 'hover:border-blue-400',
    desc: '接続箱・集電盤からPCS間の直流幹線ケーブル選定。JIS C 3605規格許容電流低減係数、周囲温度補正、埋設トレンチ熱抵抗を反映。',
    standard: 'JIS C 3605 / JIS C 8955',
    outputHighlights: ['幹線サイズ(sq)', '条数選定', '温度・埋設熱補正']
  },
  {
    id: 'transformer-sizing',
    titleEn: 'Transformer Sizing',
    titleJa: '変圧器容量選定 (トランス)',
    badge: '要無料登録',
    badgeType: 'member',
    icon: Boxes,
    accentColor: 'text-rose-600 bg-rose-100 border-rose-200',
    cardBorder: 'hover:border-rose-400',
    desc: '太陽光発電所および系統用蓄電システム（BESS）の受電・連系用変圧器容量（kVA/MVA）を力率・需要率・インピーダンス整合に基づきサイジング。',
    standard: 'JEC-2200 / 電気設備技術基準解釈',
    outputHighlights: ['変圧器容量(kVA)', '特高・高圧区分', '力率自動補正']
  }
];

export const QuickEngineeringTab: React.FC<QuickEngineeringTabProps> = ({
  onSaveToProject,
  onOpenProject,
  isLoggedIn = false,
  onOpenLogin,
  initialSubTab = 'snow-weather',
  activeSubTab: propActiveSubTab,
  onSelectSubTab
}) => {
  const [localActiveSubTab, setLocalActiveSubTab] = useState<QuickToolTab>(propActiveSubTab || initialSubTab || 'snow-weather');
  const activeSubTab = propActiveSubTab || localActiveSubTab;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (propActiveSubTab) {
      setLocalActiveSubTab(propActiveSubTab);
    } else if (initialSubTab) {
      setLocalActiveSubTab(initialSubTab);
    }
  }, [propActiveSubTab, initialSubTab]);

  const setActiveSubTab = (tab: QuickToolTab) => {
    setLocalActiveSubTab(tab);
    onSelectSubTab?.(tab);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const activeToolMeta = useMemo(() => {
    return QUICK_ENGINEERING_TOOLS.find(
      t => t.id === activeSubTab || (t.alias && t.alias.includes(activeSubTab))
    ) || QUICK_ENGINEERING_TOOLS[0];
  }, [activeSubTab]);

  const handleSelectTool = (toolId: QuickToolTab) => {
    setActiveSubTab(toolId);
    // Smooth scroll down to the active tool viewport so user immediately sees it
    setTimeout(() => {
      const el = document.getElementById('active-tool-viewport');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 60);
  };

  // State for Tool Grid Modal & Dossier Modal
  const [isToolGridModalOpen, setIsToolGridModalOpen] = useState(false);
  const [isDossierModalOpen, setIsDossierModalOpen] = useState(false);
  const [dossierList, setDossierList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('solnexa_engineering_dossier');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const refreshDossier = () => {
    try {
      const saved = localStorage.getItem('solnexa_engineering_dossier');
      setDossierList(saved ? JSON.parse(saved) : []);
    } catch {
      setDossierList([]);
    }
  };

  useEffect(() => {
    const handleUpdate = () => refreshDossier();
    window.addEventListener('solnexa-dossier-updated', handleUpdate);
    return () => window.removeEventListener('solnexa-dossier-updated', handleUpdate);
  }, []);

  const currentToolIndex = useMemo(() => {
    const idx = QUICK_ENGINEERING_TOOLS.findIndex(
      t => t.id === activeSubTab || (t.alias && t.alias.includes(activeSubTab))
    );
    return idx >= 0 ? idx : 0;
  }, [activeSubTab]);

  const handlePrevTool = () => {
    const prevIdx = currentToolIndex > 0 ? currentToolIndex - 1 : QUICK_ENGINEERING_TOOLS.length - 1;
    handleSelectTool(QUICK_ENGINEERING_TOOLS[prevIdx].id);
  };

  const handleNextTool = () => {
    const nextIdx = currentToolIndex < QUICK_ENGINEERING_TOOLS.length - 1 ? currentToolIndex + 1 : 0;
    handleSelectTool(QUICK_ENGINEERING_TOOLS[nextIdx].id);
  };

  const handleRemoveDossierItem = (id: string) => {
    const updated = dossierList.filter(item => item.id !== id);
    setDossierList(updated);
    try {
      localStorage.setItem('solnexa_engineering_dossier', JSON.stringify(updated));
      window.dispatchEvent(new Event('solnexa-dossier-updated'));
    } catch {}
    showToast('計算書から項目を削除しました。');
  };

  const handleClearDossier = () => {
    setDossierList([]);
    try {
      localStorage.removeItem('solnexa_engineering_dossier');
      window.dispatchEvent(new Event('solnexa-dossier-updated'));
    } catch {}
    showToast('技術計算書をリセットしました。');
  };

  const handleExportCombinedDossier = () => {
    if (dossierList.length === 0) {
      showToast('技術計算書に保存された項目がありません。各ツールの「技術計算書に追加」を押してください。');
      return;
    }
    const reportData = `================================================================================
株式会社ソルネクサ (SOLNEXA JAPAN)
総合技術計算書・設計照査報告書（Unified Engineering Calculation Dossier）
発行日時: ${new Date().toLocaleString('ja-JP')}
対象プロジェクト: ${pvPcsProject}
準拠基準: 建設省告示第1455号 / JIS C 3605 / JIS C 8955 / 内線規程第3110節 / JEC-2200
================================================================================

【収録計算項目一覧: 合計 ${dossierList.length} 件】
${dossierList.map((item, idx) => `
--------------------------------------------------------------------------------
[項目 ${idx + 1}] ${item.toolTitle} (保存日時: ${item.dateStr || '記録済み'})
概要: ${item.summary}
詳細パラメータ:
${item.data ? Object.entries(item.data).map(([k, v]) => `  ・${k}: ${v}`).join('\n') : '  (計算結果保持)'}
--------------------------------------------------------------------------------
`).join('')}

================================================================================
判定所見:
上記計算値はSOLNEXA統合エンジニアリングエンジンにより日本国内の法規および電気設備技術基準に基づき照合・導出されました。
確認申請および一般送配電事業者との系統連系協議提出資料として保管されます。
================================================================================`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOLNEXA_Unified_Engineering_Dossier_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('総合技術計算書を出力しました。');
  };

  // -------------------------------------------------------------
  // TOOL 1: PV - PCS Cable Design (Matching Image 6 directly)
  // -------------------------------------------------------------
  const [pvPcsProject, setPvPcsProject] = useState('Chiba 1MW Solar — Reference Engineering');
  const [pvPcsLocation, setPvPcsLocation] = useState('Chiba Prefecture, Japan');
  const [pvPcsSystemType, setPvPcsSystemType] = useState<'PV_TO_PCS' | 'PCS_TO_GRID'>('PV_TO_PCS');
  const [pvPcsDcVoltage, setPvPcsDcVoltage] = useState(1000);
  const [pvPcsPowerKw, setPvPcsPowerKw] = useState(1000.0);
  const [pvPcsInstallMethod, setPvPcsInstallMethod] = useState('Underground (Trench)');
  const [pvPcsRouteLength, setPvPcsRouteLength] = useState(300);
  const [pvPcsAmbientTemp, setPvPcsAmbientTemp] = useState(25);
  const [pvPcsParallelRuns, setPvPcsParallelRuns] = useState(1);
  const [pvPcsConductor, setPvPcsConductor] = useState<'COPPER' | 'ALUMINUM'>('COPPER');
  const [pvPcsSafetyAmpacity, setPvPcsSafetyAmpacity] = useState(1.25);
  const [pvPcsSafetyVDropLimit, setPvPcsSafetyVDropLimit] = useState(3.0);
  const [selectedCableSize, setSelectedCableSize] = useState<number>(70);

  // Computed Current for PV to PCS (DC)
  const pvPcsCurrentA = useMemo(() => {
    if (pvPcsDcVoltage <= 0) return 0;
    return (pvPcsPowerKw * 1000) / pvPcsDcVoltage;
  }, [pvPcsPowerKw, pvPcsDcVoltage]);

  // Cable options database for PV-PCS
  const cableOptionsData = useMemo(() => {
    const sizes = [50, 70, 95, 120, 150];
    const baseSpecs: Record<number, { r: number; baseAmp: number }> = {
      50: { r: 0.387, baseAmp: 170 },
      70: { r: 0.268, baseAmp: 215 },
      95: { r: 0.193, baseAmp: 260 },
      120: { r: 0.153, baseAmp: 305 },
      150: { r: 0.124, baseAmp: 345 }
    };

    return sizes.map(size => {
      const spec = baseSpecs[size];
      // Conductor resistance at 20°C: Cu
      const mult = pvPcsConductor === 'ALUMINUM' ? 1.6 : 1.0;
      const r = spec.r * mult;
      // Ambient derating factor kt = sqrt((90-Tamb)/(90-30))
      const kt = Math.sqrt(Math.max(0.1, (90 - pvPcsAmbientTemp) / 60));
      // Installation derating
      let km = 1.0;
      if (pvPcsInstallMethod.includes('Underground')) km = 0.92;
      else if (pvPcsInstallMethod.includes('Conduit')) km = 0.85;
      else if (pvPcsInstallMethod.includes('Tray')) km = 1.0;

      const correctedAmpacity = Math.round(spec.baseAmp * kt * km * pvPcsParallelRuns);
      // DC Voltage Drop: DeltaV = 2 * I * R * L * 10^-3 (V)
      const deltaV = 2 * (pvPcsCurrentA / pvPcsParallelRuns) * (r / 1000) * pvPcsRouteLength;
      const vDropPercent = Number(((deltaV / pvPcsDcVoltage) * 100).toFixed(2));
      // Power Loss = 2 * I^2 * R * L * 10^-3 * parallel (W)
      const currentPerCable = pvPcsCurrentA / pvPcsParallelRuns;
      const lossWatts = Math.round(2 * Math.pow(currentPerCable, 2) * (r / 1000) * pvPcsRouteLength * pvPcsParallelRuns);

      const isDropOk = vDropPercent <= pvPcsSafetyVDropLimit;
      const isAmpOk = correctedAmpacity >= (pvPcsCurrentA / pvPcsParallelRuns) * (pvPcsSafetyAmpacity || 1.0) * 0.2; // distributed check
      const status = isDropOk ? 'OK' : 'NG';

      return {
        size,
        r: Number(r.toFixed(3)),
        ampacity: correctedAmpacity,
        vDropPercent,
        deltaV: Number(deltaV.toFixed(1)),
        lossWatts,
        lossKw: (lossWatts / 1000).toFixed(2),
        lossPercentOfTotal: ((lossWatts / (pvPcsPowerKw * 1000)) * 100).toFixed(2),
        status,
        isDropOk,
        isAmpOk
      };
    });
  }, [
    pvPcsConductor,
    pvPcsAmbientTemp,
    pvPcsInstallMethod,
    pvPcsParallelRuns,
    pvPcsCurrentA,
    pvPcsRouteLength,
    pvPcsDcVoltage,
    pvPcsSafetyVDropLimit,
    pvPcsSafetyAmpacity,
    pvPcsPowerKw
  ]);

  // Find recommended size: lowest size with OK status
  const recommendedCable = useMemo(() => {
    const passed = cableOptionsData.filter(c => c.status === 'OK');
    return passed.length > 0 ? passed[0] : cableOptionsData[cableOptionsData.length - 1];
  }, [cableOptionsData]);

  // Selected candidate object
  const activeSelectedCandidate = useMemo(() => {
    return cableOptionsData.find(c => c.size === selectedCableSize) || recommendedCable;
  }, [cableOptionsData, selectedCableSize, recommendedCable]);

  // -------------------------------------------------------------
  // TOOL 2: Kyokuto Voltage Drop Engine (https://www.kyokuto-k.co.jp/voltagedrop.html)
  // -------------------------------------------------------------
  const [kyokutoSysType, setKyokutoSysType] = useState<ElectricalSystemType>('3P_3W');
  const [kyokutoMethod, setKyokutoMethod] = useState<'PRECISE' | 'SIMPLIFIED'>('PRECISE');
  const [circuitName, setCircuitName] = useState('Main Inverter AC Trunk (主幹電線)');
  const [sysVoltage, setSysVoltage] = useState(400);
  const [sysVoltageUnit, setSysVoltageUnit] = useState<'V' | 'kV'>('V');
  const [loadPowerKw, setLoadPowerKw] = useState(250);
  const [powerFactor, setPowerFactor] = useState(0.95);
  const [parallelRuns, setParallelRuns] = useState(1);
  const [cableLengthM, setCableLengthM] = useState(120);

  const [cableType, setCableType] = useState('600V CVT (トリプレックス)');
  const [conductorMaterial, setConductorMaterial] = useState<'COPPER' | 'ALUMINUM'>('COPPER');
  const [installMethod, setInstallMethod] = useState('Conduit in Ground (電線管地中埋設)');
  const [ambientTemp, setAmbientTemp] = useState(30);
  const [operatingTempC, setOperatingTempC] = useState(75);
  const [lineClassification, setLineClassification] = useState<LineClassification>('TRUNK');
  const [hasOnsiteTransformer, setHasOnsiteTransformer] = useState(true);
  const [selectedCableSizeSq, setSelectedCableSizeSq] = useState<number>(38);
  const [tariffJpy, setTariffJpy] = useState<number>(16);
  const [annualHours, setAnnualHours] = useState<number>(1600);

  // Calculated current for circuit vdrop
  const calculatedCurrent = useMemo(() => {
    const voltageInV = sysVoltageUnit === 'kV' ? sysVoltage * 1000 : sysVoltage;
    if (voltageInV <= 0) return 0;

    if (kyokutoSysType === '3P_3W' || kyokutoSysType === '3P_4W_LINE') {
      return Number(((loadPowerKw * 1000) / (Math.sqrt(3) * voltageInV * powerFactor)).toFixed(1));
    } else if (kyokutoSysType === '1P_3W' || kyokutoSysType === '3P_4W_PHASE' || kyokutoSysType === '1P_2W') {
      return Number(((loadPowerKw * 1000) / (voltageInV * powerFactor)).toFixed(1));
    } else {
      // DC_2W
      return Number(((loadPowerKw * 1000) / voltageInV).toFixed(1));
    }
  }, [sysVoltage, sysVoltageUnit, loadPowerKw, powerFactor, kyokutoSysType]);

  // Kyokuto Single Voltage Drop Evaluation
  const kyokutoResult = useMemo(() => {
    const voltageInV = sysVoltageUnit === 'kV' ? sysVoltage * 1000 : sysVoltage;
    const currentPerRun = calculatedCurrent / parallelRuns;
    return calculateKyokutoVoltageDrop({
      systemType: kyokutoSysType,
      voltageV: voltageInV,
      currentA: currentPerRun,
      lengthM: cableLengthM,
      cableSizeSq: selectedCableSizeSq,
      conductorMaterial,
      powerFactor,
      ambientTempC: ambientTemp,
      operatingTempC,
      lineType: lineClassification,
      hasOnsiteTransformer
    });
  }, [
    kyokutoSysType,
    sysVoltage,
    sysVoltageUnit,
    calculatedCurrent,
    parallelRuns,
    cableLengthM,
    selectedCableSizeSq,
    conductorMaterial,
    powerFactor,
    ambientTemp,
    operatingTempC,
    lineClassification,
    hasOnsiteTransformer
  ]);

  // Full Candidate Cables (All 15 JIS Standard Sizes) per Kyokuto & 内線規程
  const candidateComparisonOutput = useMemo(() => {
    const voltageInV = sysVoltageUnit === 'kV' ? sysVoltage * 1000 : sysVoltage;
    const currentPerRun = calculatedCurrent / parallelRuns;
    return evaluateAllJisCableCandidates(
      {
        systemType: kyokutoSysType,
        voltageV: voltageInV,
        currentA: currentPerRun,
        lengthM: cableLengthM,
        cableSizeSq: selectedCableSizeSq,
        conductorMaterial,
        powerFactor,
        ambientTempC: ambientTemp,
        operatingTempC,
        lineType: lineClassification,
        hasOnsiteTransformer
      },
      annualHours,
      tariffJpy
    );
  }, [
    kyokutoSysType,
    sysVoltage,
    sysVoltageUnit,
    calculatedCurrent,
    parallelRuns,
    cableLengthM,
    selectedCableSizeSq,
    conductorMaterial,
    powerFactor,
    ambientTemp,
    operatingTempC,
    lineClassification,
    hasOnsiteTransformer,
    annualHours,
    tariffJpy
  ]);

  const recommendedCableCandidate = useMemo(() => {
    return candidateComparisonOutput.recommendedCandidate;
  }, [candidateComparisonOutput]);

  // -------------------------------------------------------------
  // TOOL 3: Cable Selection Tool
  // -------------------------------------------------------------
  const [csLoadCurrent, setCsLoadCurrent] = useState(350);
  const [csVoltage, setCsVoltage] = useState(400);
  const [csLength, setCsLength] = useState(80);
  const [csMethod, setCsMethod] = useState('Cable Tray');
  const [csMaxDrop, setCsMaxDrop] = useState(2.0);

  // -------------------------------------------------------------
  // TOOL 4: Current Calculation Tool
  // -------------------------------------------------------------
  const [ccType, setCcType] = useState<'3_PHASE' | '1_PHASE' | 'DC'>('3_PHASE');
  const [ccPowerKw, setCcPowerKw] = useState(1200);
  const [ccVoltage, setCcVoltage] = useState(690);
  const [ccPf, setCcPf] = useState(0.98);
  const [ccEfficiency, setCcEfficiency] = useState(0.985);

  const ccResultCurrent = useMemo(() => {
    if (ccVoltage <= 0) return 0;
    if (ccType === '3_PHASE') {
      return (ccPowerKw * 1000) / (Math.sqrt(3) * ccVoltage * ccPf * ccEfficiency);
    } else if (ccType === '1_PHASE') {
      return (ccPowerKw * 1000) / (ccVoltage * ccPf * ccEfficiency);
    } else {
      return (ccPowerKw * 1000) / (ccVoltage * ccEfficiency);
    }
  }, [ccType, ccPowerKw, ccVoltage, ccPf, ccEfficiency]);

  // -------------------------------------------------------------
  // TOOL 5: Transformer Sizing Tool
  // -------------------------------------------------------------
  const [trTotalPowerKw, setTrTotalPowerKw] = useState(2400);
  const [trPowerFactor, setTrPowerFactor] = useState(0.95);
  const [trAmbientMax, setTrAmbientMax] = useState(40);
  const [trReserveMargin, setTrReserveMargin] = useState(1.2);

  const trCalculatedKva = useMemo(() => {
    const apparentKva = trTotalPowerKw / trPowerFactor;
    return Math.round(apparentKva * trReserveMargin);
  }, [trTotalPowerKw, trPowerFactor, trReserveMargin]);

  const trStandardSizes = [500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000];
  const trRecommendedKva = useMemo(() => {
    return trStandardSizes.find(s => s >= trCalculatedKva) || 3000;
  }, [trCalculatedKva]);

  // -------------------------------------------------------------
  // TOOL 6: PV String Check Tool
  // -------------------------------------------------------------
  const [scModuleVoc, setScModuleVoc] = useState(52.3);
  const [scModuleVmp, setScModuleVmp] = useState(43.7);
  const [scModuleIsc, setScModuleIsc] = useState(14.15);
  const [scTempCoeffVoc, setScTempCoeffVoc] = useState(-0.275); // %/°C
  const [scMinTemp, setScMinTemp] = useState(-10);
  const [scMaxTemp, setScMaxTemp] = useState(40);
  const [scModulesPerString, setScModulesPerString] = useState(26);
  const [scInvMaxDcV, setScInvMaxDcV] = useState(1500);
  const [scInvMpptMin, setScInvMpptMin] = useState(500);
  const [scInvMpptMax, setScInvMpptMax] = useState(1500);

  const scCalculations = useMemo(() => {
    // Voc at min ambient temp: Voc * (1 + coeff * (Tmin - 25) / 100)
    const vocCold = scModuleVoc * (1 + (scTempCoeffVoc * (scMinTemp - 25)) / 100);
    const stringVocMax = Number((vocCold * scModulesPerString).toFixed(1));

    // Vmp at hot cell temp (Tcell = Tamb + 30 = 70°C)
    const hotCellTemp = scMaxTemp + 30;
    const vmpHot = scModuleVmp * (1 + (scTempCoeffVoc * (hotCellTemp - 25)) / 100);
    const stringVmpHot = Number((vmpHot * scModulesPerString).toFixed(1));

    // Vmp at STC
    const stringVmpStc = Number((scModuleVmp * scModulesPerString).toFixed(1));

    const isVocSafe = stringVocMax <= scInvMaxDcV;
    const isMpptOk = stringVmpHot >= scInvMpptMin && stringVocMax <= scInvMpptMax;

    return {
      stringVocMax,
      stringVmpHot,
      stringVmpStc,
      isVocSafe,
      isMpptOk,
      overallStatus: isVocSafe && isMpptOk ? 'PASS' : 'NG'
    };
  }, [
    scModuleVoc,
    scModuleVmp,
    scTempCoeffVoc,
    scMinTemp,
    scMaxTemp,
    scModulesPerString,
    scInvMaxDcV,
    scInvMpptMin,
    scInvMpptMax
  ]);

  // Handler to export calculation report
  const handleExportReport = () => {
    const reportData = `SOLNEXA Engineering - Quick Calculation Report
=====================================================
Tool: ${activeSubTab}
Generated: ${new Date().toLocaleString()}
Reference Project: ${pvPcsProject}
System Voltage: ${activeSubTab === 'pv-pcs-cable' ? pvPcsDcVoltage : sysVoltage} V
Calculated Current: ${activeSubTab === 'pv-pcs-cable' ? pvPcsCurrentA : calculatedCurrent} A
Recommended Cable: ${activeSubTab === 'pv-pcs-cable' ? `${selectedCableSize} mm²` : `${recommendedCableCandidate.sizeSq} mm²`}
Status: ${kyokutoResult.isCompliant ? 'PASS' : 'REVIEW'}
Standard: JIS C 3605 / 極東電線 技術資料 / 内線規程
=====================================================`;

    const blob = new Blob([reportData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOLNEXA_${activeSubTab}_Calculation_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Calculation report exported successfully.');
  };

  const handleSaveCalculationToProject = () => {
    showToast(`Calculation saved to "${pvPcsProject}". Circuits and dependencies updated.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Streamlined Active Tool Top Banner (Replacing the crowded red-boxed horizontal overflow bar) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${activeToolMeta.accentColor}`}>
            <activeToolMeta.icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                クイック設計ツール
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                activeToolMeta.badgeType === 'free' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : 'bg-amber-50 text-amber-800 border border-amber-200/60'
              }`}>
                {activeToolMeta.badge}
              </span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                👈 左側サイドバーから7つのツールを瞬時に切替可能
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span>{activeToolMeta.titleJa}</span>
              <span className="text-xs sm:text-sm font-normal text-slate-500 hidden sm:inline">
                ({activeToolMeta.titleEn})
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeToolMeta.standard}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-auto">
          {/* Sequential Tool Switcher */}
          <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={handlePrevTool}
              className="p-1.5 hover:bg-white text-slate-700 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
              title="前のツールへ切替"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono font-bold text-slate-700 px-2">
              {currentToolIndex + 1} / {QUICK_ENGINEERING_TOOLS.length}
            </span>
            <button
              type="button"
              onClick={handleNextTool}
              className="p-1.5 hover:bg-white text-slate-700 hover:text-blue-700 rounded-lg transition-colors cursor-pointer"
              title="次のツールへ切替"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Tool Grid Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsToolGridModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/80 transition-all shadow-2xs cursor-pointer active:scale-98"
            title={`${QUICK_ENGINEERING_TOOLS.length}つの全計算ツールをカード一覧で表示`}
          >
            <Grid className="w-3.5 h-3.5 text-blue-600" />
            <span>ツール一覧 ({QUICK_ENGINEERING_TOOLS.length})</span>
          </button>

          {/* Dossier Modal Trigger */}
          <button
            type="button"
            onClick={() => setIsDossierModalOpen(true)}
            className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98 border ${
              dossierList.length > 0
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="計算結果を合算した総合技術計算書（Dossier）を確認"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>技術計算書</span>
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {dossierList.length}
            </span>
          </button>

          <button
            onClick={handleExportReport}
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer active:scale-98"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>単体出力</span>
          </button>
        </div>
      </div>

      {/* Member Gating Notice Bar */}
      {!isLoggedIn && (activeSubTab === 'isijp-conduit' || activeSubTab === 'pv-pcs-cable' || activeSubTab === 'transformer-sizing') && (
        <div className="bg-gradient-to-r from-amber-50 via-blue-50 to-amber-50 border border-amber-300/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                【無料会員限定機能】この高度解析ツールは無料アカウント登録で即座にご利用可能です
              </p>
              <p className="text-[11px] text-slate-600">
                電線管占有率計算、トレンチ地中埋設補正、特高変圧器サイジング、CAD出力、プロジェクト保存が無制限に開放されます。
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-4 py-2 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-lg shadow-sm transition-all"
            >
              無料会員登録（30秒）
            </button>
            <button
              onClick={onOpenLogin}
              className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              ログイン
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 0. BESS SNOW & WEATHER CHECKER (積雪・気象条件チェック)   */}
      {/* ========================================================= */}
      {activeSubTab === 'snow-weather' && (
        <SnowWeatherChecker
          onOpenProject={onOpenProject}
          isLoggedIn={isLoggedIn}
          onOpenLogin={onOpenLogin}
        />
      )}

      {/* ========================================================= */}
      {/* 0.1 BESS FIRE SAFETY CALCULATOR (消防法・離隔距離判定)     */}
      {/* ========================================================= */}
      {activeSubTab === 'bess-fire-safety' && (
        <BessFireSafetyCalculator
          onOpenContact={onOpenLogin}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* ========================================================= */}
      {/* 0.2 JIS C 8955 WIND LOAD & PILE (架台風圧・杭引抜力)      */}
      {/* ========================================================= */}
      {activeSubTab === 'jis-wind-load' && (
        <JisWindLoadCalculator
          onOpenContact={onOpenLogin}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* ========================================================= */}
      {/* 0.3 BESS CURTAILMENT & JEPX REVENUE (出力制御回避・収益)   */}
      {/* ========================================================= */}
      {activeSubTab === 'bess-curtailment' && (
        <BessCurtailmentRevenueCalculator
          onOpenContact={onOpenLogin}
          isLoggedIn={isLoggedIn}
        />
      )}

      {/* ========================================================= */}
      {/* 1. PV - PCS CABLE DESIGN VIEW (Matching Image 6 directly) */}
      {/* ========================================================= */}
      {activeSubTab === 'pv-pcs-cable' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* LEFT COLUMN: Project & Basic Parameters (Image 6 Left) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Project &amp; Basic Parameters</h2>
              <p className="text-[11px] text-slate-500">プロジェクト情報・基本条件</p>
            </div>

            {/* Project Select */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Project / 設置場所</span>
              </label>
              <select
                value={pvPcsProject}
                onChange={e => setPvPcsProject(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option>Chiba 1MW Solar — Reference Engineering</option>
                <option>Saitama 2MW / 8.146MWh BESS — Reference Engineering</option>
                <option>Manual Input (スタンドアロン計算)</option>
              </select>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Location / 設置場所</label>
              <div className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                <Building className="w-3.5 h-3.5 text-blue-600" />
                <span>{pvPcsLocation}</span>
              </div>
            </div>

            {/* System Type Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">System Type / システム種別</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPvPcsSystemType('PV_TO_PCS')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    pvPcsSystemType === 'PV_TO_PCS'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  PV to PCS
                </button>
                <button
                  type="button"
                  onClick={() => setPvPcsSystemType('PCS_TO_GRID')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    pvPcsSystemType === 'PCS_TO_GRID'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  PCS to Grid
                </button>
              </div>
            </div>

            {/* Electrical Parameters */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Electrical Parameters
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">DC Voltage (V) / 直流電圧</label>
                  <input
                    type="number"
                    value={pvPcsDcVoltage}
                    onChange={e => setPvPcsDcVoltage(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Power (kW) / 設計電力</label>
                  <input
                    type="number"
                    value={pvPcsPowerKw}
                    onChange={e => setPvPcsPowerKw(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">
                  Current (A) / 電流 (自動計算)
                </label>
                <div className="w-full text-xs font-bold font-mono bg-blue-50 text-blue-900 border border-blue-100 rounded-lg px-3 py-2 flex justify-between items-center">
                  <span>{pvPcsCurrentA.toFixed(1)} A</span>
                  <span className="text-[10px] font-normal text-blue-600">P / V</span>
                </div>
              </div>
            </div>

            {/* Installation Parameters */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Installation Parameters
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Installation Method / 設置方法</label>
                <select
                  value={pvPcsInstallMethod}
                  onChange={e => setPvPcsInstallMethod(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800"
                >
                  <option>Underground (Trench)</option>
                  <option>Cable Tray (Perforated)</option>
                  <option>Conduit in ground (地中埋設管)</option>
                  <option>Direct Buried (直埋設)</option>
                  <option>Free Air (気中)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Route Length (one way) / 配線長 (片道)</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pvPcsRouteLength}
                      onChange={e => setPvPcsRouteLength(Number(e.target.value))}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-slate-900"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      m
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Ambient Temp / 周囲温度</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={pvPcsAmbientTemp}
                      onChange={e => setPvPcsAmbientTemp(Number(e.target.value))}
                      className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 pr-8 text-slate-900"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                      °C
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Parallel Circuits / 並列回路数</label>
                <select
                  value={pvPcsParallelRuns}
                  onChange={e => setPvPcsParallelRuns(Number(e.target.value))}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800"
                >
                  <option value={1}>1 run (単条)</option>
                  <option value={2}>2 runs (2並列)</option>
                  <option value={3}>3 runs (3並列)</option>
                  <option value={4}>4 runs (4並列)</option>
                </select>
              </div>
            </div>

            {/* Conductor & Safety */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Conductor &amp; Safety
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Conductor Material / 導体材料</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPvPcsConductor('COPPER')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      pvPcsConductor === 'COPPER'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Copper (Cu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPvPcsConductor('ALUMINUM')}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      pvPcsConductor === 'ALUMINUM'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    Aluminum (Al)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Safety Factor (Ampacity) / 許容電流係数</label>
                  <input
                    type="number"
                    step="0.05"
                    value={pvPcsSafetyAmpacity}
                    onChange={e => setPvPcsSafetyAmpacity(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">VDrop Limit (%) / 許容降下</label>
                  <input
                    type="number"
                    step="0.1"
                    value={pvPcsSafetyVDropLimit}
                    onChange={e => setPvPcsSafetyVDropLimit(Number(e.target.value))}
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setPvPcsDcVoltage(1000);
                  setPvPcsPowerKw(1000);
                  setPvPcsRouteLength(300);
                  setPvPcsAmbientTemp(25);
                  setPvPcsParallelRuns(1);
                  setPvPcsSafetyAmpacity(1.25);
                  setPvPcsSafetyVDropLimit(3.0);
                  setSelectedCableSize(70);
                  showToast('Parameters reset to default.');
                }}
                className="flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset / リセット</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('Project parameters loaded successfully.');
                }}
                className="flex-1 flex items-center justify-center space-x-1 py-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Load from Project</span>
              </button>
            </div>
          </div>

          {/* CENTER COLUMN: Calculation Details & Cable Options (Image 6 Center) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Header & Formulas Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-600" />
                    <span>PV - PCS Cable Design</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">PV-PCS 配線設計</p>
                </div>
                <a
                  href="#standards"
                  className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                >
                  <span>Calculation Guide</span>
                  <ChevronRight className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Design the optimal cable size for PV to PCS connection based on current, voltage drop and installation conditions.
                太陽光からPCSまでの接続における、電流・電圧降下・設置条件に基づいた最適なケーブルサイズを設計します。
              </p>

              {/* Formulas & Standards 2-Column */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Formulas */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">Key Formulas / 主要な計算式</div>
                  <div className="space-y-1.5 font-mono text-[11px] text-slate-800">
                    <div className="p-1.5 bg-white rounded-md border border-slate-200 text-center font-bold text-blue-950">
                      I = P / (√3 × V × η)
                    </div>
                    <div className="p-1.5 bg-white rounded-md border border-slate-200 text-center font-bold text-blue-950">
                      ΔV = √3 × I × R × L × 10⁻³
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 space-y-0.5">
                    <div>I : Current (A) | P : Power (W)</div>
                    <div>V : Voltage (V) | R : Resistance (mΩ/m)</div>
                    <div>L : One-way length (m)</div>
                  </div>
                </div>

                {/* Standards */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] font-bold text-slate-700 mb-1.5">Applicable Standards / 適用規格</div>
                  <ul className="text-[10px] text-slate-600 space-y-1 list-disc pl-3.5 leading-tight">
                    <li>JIS C 3605 600V ビニル絶縁電線</li>
                    <li>JIS C 3606 600V CVケーブル</li>
                    <li>JIS C 3610 6600V CVケーブル</li>
                    <li>IEC 60364 Low-voltage installations</li>
                    <li>IEC 62930 PV DC application</li>
                    <li>JIS C 8961 太陽光発電設計ガイドライン</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Cable Options Table Card (Matching Image 6 Table) */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cable Options / ケーブル候補</h3>
                  <p className="text-[11px] text-slate-500">規格対応ケーブルの評価・比較一覧</p>
                </div>
                <span className="text-[11px] font-medium text-slate-500">
                  JIS C 3605準拠
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600 text-[11px]">
                      <th className="py-2 px-2.5 font-semibold text-center w-8">選定</th>
                      <th className="py-2 px-2.5 font-semibold">Size<br /><span className="text-[9px] font-normal text-slate-400">サイズ</span></th>
                      <th className="py-2 px-2.5 font-semibold">Resistance<br /><span className="text-[9px] font-normal text-slate-400">導体抵抗 (mΩ/m)</span></th>
                      <th className="py-2 px-2.5 font-semibold">Ampacity<br /><span className="text-[9px] font-normal text-slate-400">許容電流 (A)</span></th>
                      <th className="py-2 px-2.5 font-semibold">Voltage Drop<br /><span className="text-[9px] font-normal text-slate-400">電圧降下 (%)</span></th>
                      <th className="py-2 px-2.5 font-semibold">Power Loss<br /><span className="text-[9px] font-normal text-slate-400">電力損失 (W)</span></th>
                      <th className="py-2 px-2.5 font-semibold text-center">Status<br /><span className="text-[9px] font-normal text-slate-400">判定</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cableOptionsData.map(c => {
                      const isSelected = selectedCableSize === c.size;
                      return (
                        <tr
                          key={c.size}
                          onClick={() => setSelectedCableSize(c.size)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-50/70 font-semibold'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-2.5 text-center">
                            <input
                              type="radio"
                              name="pv-pcs-cable-choice"
                              checked={isSelected}
                              onChange={() => setSelectedCableSize(c.size)}
                              className="text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-slate-900">
                            {c.size} mm²
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-slate-700">
                            {c.r}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-slate-700">
                            {c.ampacity}
                          </td>
                          <td className={`py-2.5 px-2.5 font-mono font-bold ${
                            c.vDropPercent <= pvPcsSafetyVDropLimit ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {c.vDropPercent}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-slate-600">
                            {c.lossWatts.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2.5 text-center">
                            {c.status === 'OK' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                NG
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Recommendation Callout (Image 6 callout) */}
              <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-start space-x-2.5">
                <span className="text-base">💡</span>
                <p className="text-xs text-blue-950 font-medium leading-relaxed">
                  <strong className="font-bold text-blue-700">{recommendedCable.size} mm²</strong> is recommended based on voltage drop (≤ {pvPcsSafetyVDropLimit}%) and ampacity requirements.
                  電圧降下（{pvPcsSafetyVDropLimit}%以下）および許容電流の条件を満たす {recommendedCable.size} mm² を推奨します。
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Results & Chart (Image 6 Right) */}
          <div className="lg:col-span-3 space-y-5">
            {/* Main Result Card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">Results / 計算結果</h3>
                <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PASS</span>
                </span>
              </div>

              <div className="text-[11px] text-emerald-700 font-medium bg-emerald-50/70 px-2.5 py-1.5 rounded-lg border border-emerald-100">
                All requirements satisfied / すべての要件を満たしています
              </div>

              {/* Recommended Cable Card Tile */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50/40 to-slate-50 border border-blue-200/80 space-y-2">
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide flex items-center space-x-1.5">
                  <Cable className="w-4 h-4 text-blue-600" />
                  <span>Recommended Cable Size</span>
                </div>
                <div className="text-xl font-extrabold text-blue-950 tracking-tight">
                  {activeSelectedCandidate.size} mm²
                  <span className="text-xs font-normal text-slate-600 ml-1.5">
                    ({pvPcsConductor === 'COPPER' ? 'Copper / 銅' : 'Aluminum / アルミ'})
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  JIS C 3605 600V CV / 架橋ポリエチレン絶縁ビニルシース
                </div>
              </div>

              {/* 4 Key Metrics */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium">Calculated Current</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {pvPcsCurrentA.toFixed(1)} A
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium">Voltage Drop</div>
                  <div className="text-sm font-bold font-mono text-blue-600 mt-0.5 flex items-center justify-between">
                    <span>{activeSelectedCandidate.vDropPercent} %</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ OK</span>
                  </div>
                  <div className="text-[9px] text-slate-400">≤ {pvPcsSafetyVDropLimit}%</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium">Ampacity (Design)</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5 flex items-center justify-between">
                    <span>{activeSelectedCandidate.ampacity} A</span>
                    <span className="text-[10px] text-emerald-600 font-semibold">✓ OK</span>
                  </div>
                  <div className="text-[9px] text-slate-400">After derating</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="text-[10px] text-slate-500 font-medium">Power Loss</div>
                  <div className="text-sm font-bold font-mono text-slate-900 mt-0.5">
                    {activeSelectedCandidate.lossKw} kW
                  </div>
                  <div className="text-[9px] text-slate-400">
                    {activeSelectedCandidate.lossPercentOfTotal}% of total
                  </div>
                </div>
              </div>

              {/* Voltage Drop Comparison Bar Chart (Image 6 Chart) */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">Voltage Drop Comparison</span>
                  <span className="text-[10px] text-slate-400">電圧降下の比較</span>
                </div>

                {/* SVG Bar Chart */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80">
                  <div className="h-32 flex items-end justify-between px-2 pt-4 relative">
                    {/* Limit dashed line at 3.0% (approx 60% height from bottom) */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-red-500 z-10 flex justify-end"
                      style={{ bottom: '50%' }}
                    >
                      <span className="text-[9px] font-bold text-red-600 bg-red-50 px-1 -translate-y-2.5">
                        Limit {pvPcsSafetyVDropLimit}%
                      </span>
                    </div>

                    {cableOptionsData.map(c => {
                      const isSelected = selectedCableSize === c.size;
                      const barHeight = Math.min(100, Math.max(15, (c.vDropPercent / 5.0) * 100));
                      const isPass = c.vDropPercent <= pvPcsSafetyVDropLimit;

                      return (
                        <div
                          key={c.size}
                          onClick={() => setSelectedCableSize(c.size)}
                          className="flex flex-col items-center cursor-pointer group"
                        >
                          <span className="text-[9px] font-mono text-slate-600 mb-1 font-bold">
                            {c.vDropPercent}%
                          </span>
                          <div
                            className={`w-6 rounded-t-md transition-all ${
                              isSelected
                                ? 'bg-blue-600 shadow-md'
                                : isPass
                                ? 'bg-slate-300 group-hover:bg-slate-400'
                                : 'bg-red-400 group-hover:bg-red-500'
                            }`}
                            style={{ height: `${barHeight}px` }}
                          />
                          <span className="text-[9px] text-slate-500 mt-1 font-medium whitespace-nowrap">
                            {c.size}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons (Image 6 footer) */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveCalculationToProject}
                  className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Project / プロジェクトに保存</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    showToast(`Added ${activeSelectedCandidate.size} mm² cable (${pvPcsRouteLength}m) to Project BOQ.`);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Add to BOQ / 見積に追加</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportReport}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export Report / レポート出力</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. KYOKUTO VOLTAGE DROP VIEW (https://www.kyokuto-k.co.jp/voltagedrop.html) */}
      {/* ========================================================= */}
      {(activeSubTab === 'kyokuto-vdrop' || activeSubTab === 'circuit-vdrop') && (
        <div className="space-y-6">
          {/* Top Bar: System Selector & Calculation Method */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                    JIS C 3605 &amp; 内線規程 第1310節
                  </span>
                  <a
                    href="https://www.kyokuto-k.co.jp/voltagedrop.html"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-[11px] font-mono text-blue-600 hover:underline"
                  >
                    <span>極東電線 電圧降下計算式</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-1">
                  Kyokuto Voltage Drop Calculation Engine / 極東電線 電圧降下計算
                </h2>
                <p className="text-xs text-slate-500">
                  直流・単相・三相の6配電方式に対応。JIS C 3605導体抵抗・リアクタンスによる精算インピーダンス計算および簡易計算法を実装。
                </p>
              </div>

              {/* Method Switcher */}
              <div className="flex items-center space-x-2 self-start lg:self-auto">
                <span className="text-xs text-slate-500 font-medium">計算方法:</span>
                <div className="inline-flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setKyokutoMethod('PRECISE')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      kyokutoMethod === 'PRECISE'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    精算法 (インピーダンス法)
                  </button>
                  <button
                    type="button"
                    onClick={() => setKyokutoMethod('SIMPLIFIED')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      kyokutoMethod === 'SIMPLIFIED'
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    簡易計算法 (e=k·L·I/1000A)
                  </button>
                </div>
              </div>
            </div>

            {/* 6 Distribution Systems Selector (Matching Kyokuto standard) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">
                配電方式の選択 (Distribution System per Kyokuto Standards):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {[
                  { id: '3P_3W' as ElectricalSystemType, label: '三相3線式', sub: '3φ 3W (k=√3)', code: '30.8' },
                  { id: '3P_4W_LINE' as ElectricalSystemType, label: '三相4線 (線間)', sub: '3φ 4W Line (k=√3)', code: '30.8' },
                  { id: '3P_4W_PHASE' as ElectricalSystemType, label: '三相4線 (相電圧)', sub: '3φ 4W Phase (k=1)', code: '17.8' },
                  { id: '1P_3W' as ElectricalSystemType, label: '単相3線式', sub: '1φ 3W (k=1)', code: '17.8' },
                  { id: '1P_2W' as ElectricalSystemType, label: '単相2線式', sub: '1φ 2W (k=2)', code: '35.6' },
                  { id: 'DC_2W' as ElectricalSystemType, label: '直流2線式', sub: 'DC 2W (k=2)', code: '35.6' },
                ].map(sys => {
                  const isSelected = kyokutoSysType === sys.id;
                  return (
                    <button
                      key={sys.id}
                      type="button"
                      onClick={() => setKyokutoSysType(sys.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          {sys.label}
                        </span>
                        <span className={`text-[10px] font-mono px-1 rounded ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                          k={sys.code}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{sys.sub}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 4-Box Engineering Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Basic Information */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Circuit &amp; Load Specs</h3>
                  <p className="text-[10px] text-slate-500">回路名・負荷条件</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Circuit Name / 回路名</label>
                  <input
                    type="text"
                    value={circuitName}
                    onChange={e => setCircuitName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-medium focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">System Voltage / 系統電圧</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      value={sysVoltage}
                      onChange={e => setSysVoltage(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:bg-white"
                    />
                    <select
                      value={sysVoltageUnit}
                      onChange={e => setSysVoltageUnit(e.target.value as 'V' | 'kV')}
                      className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-slate-800 font-medium"
                    >
                      <option value="V">V</option>
                      <option value="kV">kV</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Load Power / 負荷電力 (kW)</label>
                  <input
                    type="number"
                    value={loadPowerKw}
                    onChange={e => setLoadPowerKw(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600 flex items-center justify-between">
                      <span>Power Factor / 力率</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min={0.5}
                      max={1.0}
                      value={powerFactor}
                      onChange={e => setPowerFactor(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:bg-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">Parallel / 並列条数</label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={parallelRuns}
                      onChange={e => setParallelRuns(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Route Length / 片道長 (m)</label>
                  <input
                    type="number"
                    min={1}
                    value={cableLengthM}
                    onChange={e => setCableLengthM(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono focus:bg-white"
                  />
                </div>

                <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-100 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-blue-900">計算電流 (Load Current):</span>
                  <span className="font-mono font-extrabold text-blue-700 text-sm">{calculatedCurrent} A</span>
                </div>
              </div>
            </div>

            {/* Card 2: Regulatory & Environmental Conditions */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Standards &amp; Route Specs</h3>
                  <p className="text-[10px] text-slate-500">内線規程・導体条件</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Conductor Material / 導体材料</label>
                  <select
                    value={conductorMaterial}
                    onChange={e => setConductorMaterial(e.target.value as 'COPPER' | 'ALUMINUM')}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800"
                  >
                    <option value="COPPER">Copper (銅導体) - 標準</option>
                    <option value="ALUMINUM">Aluminum (アルミニウム導体)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Cable Type / ケーブル種別</label>
                  <select
                    value={cableType}
                    onChange={e => setCableType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800"
                  >
                    <option>600V CVT (トリプレックス) JIS C 3605</option>
                    <option>600V CV (単心/多心) JIS C 3605</option>
                    <option>6.6kV CVT (高圧トリプレックス)</option>
                    <option>PV-CC (太陽電池発電設備用直流電線)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">線路区分 (内線規程 第1310節)</label>
                  <select
                    value={lineClassification}
                    onChange={e => setLineClassification(e.target.value as LineClassification)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800"
                  >
                    <option value="TRUNK">幹線 (Trunk Line - 許容降下 2%〜3%)</option>
                    <option value="BRANCH">分岐回路 (Branch Circuit - 許容降下 2%)</option>
                    <option value="FEEDER">太陽光直流フィーダー (PV DC Feeder)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[11px] font-medium text-slate-700">自家用変電設備あり:</span>
                  <input
                    type="checkbox"
                    checked={hasOnsiteTransformer}
                    onChange={e => setHasOnsiteTransformer(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">周囲温度 (°C)</label>
                    <input
                      type="number"
                      value={ambientTemp}
                      onChange={e => setAmbientTemp(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-slate-600">導体温度 (°C)</label>
                    <input
                      type="number"
                      value={operatingTempC}
                      onChange={e => setOperatingTempC(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 font-mono"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200 text-slate-700 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-amber-900 font-bold">内線規程 許容降下率:</span>
                    <span className="font-mono font-bold text-amber-800">{kyokutoResult.allowableLimitPercent.toFixed(1)} %</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-600">逆算所要最小断面積:</span>
                    <span className="font-mono font-bold text-blue-700">{candidateComparisonOutput.minimumRequiredSizeSq.toFixed(1)} mm²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Formula & Intermediate Physical Breakdown */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Formula &amp; Physical Values</h3>
                  <p className="text-[10px] text-slate-500">極東電線計算式 &amp; 物理定数</p>
                </div>
              </div>

              {/* Formula Badge Display */}
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl text-xs space-y-2">
                <div className="text-[10px] text-blue-400 font-mono font-semibold uppercase tracking-wider">
                  {kyokutoMethod === 'PRECISE' ? '◆ インピーダンス精算法' : '◆ 簡易計算法'}
                </div>
                <div className="font-mono text-[11px] leading-relaxed text-amber-300">
                  {kyokutoMethod === 'PRECISE' ? kyokutoResult.preciseFormula : kyokutoResult.simplifiedFormula}
                </div>
                <div className="text-[10px] text-slate-400">
                  ※ JIS C 3605 CV 75°C 導体抵抗 &amp; リアクタンス基準
                </div>
              </div>

              {/* Physical Parameters List */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span className="text-slate-500">選択中サイズ:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedCableSizeSq} mm²</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span className="text-slate-500">交流導体抵抗 R ({operatingTempC}°C):</span>
                  <span className="font-mono font-semibold text-slate-900">{kyokutoResult.resistanceOhmPerKm.toFixed(4)} Ω/km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span className="text-slate-500">リアクタンス X (JIS C 3605):</span>
                  <span className="font-mono font-semibold text-slate-900">{kyokutoResult.reactanceOhmPerKm.toFixed(4)} Ω/km</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span className="text-slate-500">電圧降下値 (Voltage Drop):</span>
                  <span className="font-mono font-bold text-blue-700">
                    {(kyokutoMethod === 'PRECISE' ? kyokutoResult.preciseDropV : kyokutoResult.simplifiedDropV).toFixed(2)} V
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 text-slate-600">
                  <span className="text-slate-500">降下率 (Drop Ratio):</span>
                  <span className="font-mono font-bold text-blue-700">
                    {(kyokutoMethod === 'PRECISE' ? kyokutoResult.preciseDropPercent : kyokutoResult.simplifiedDropPercent).toFixed(2)} %
                  </span>
                </div>
              </div>
            </div>

            {/* Card 4: Evaluation & 20-Year Economic Yield Loss */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  kyokutoResult.isCompliant ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  4
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Compliance &amp; 20-Yr Loss</h3>
                  <p className="text-[10px] text-slate-500">判定 &amp; 20年損失試算</p>
                </div>
              </div>

              {/* Status Banner */}
              <div className={`p-3 rounded-xl border flex items-center justify-between ${
                kyokutoResult.isCompliant
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50/80 border-rose-200 text-rose-900'
              }`}>
                <div className="flex items-center space-x-2">
                  {kyokutoResult.isCompliant ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-600" />
                  )}
                  <div>
                    <div className="text-xs font-bold">
                      {kyokutoResult.isCompliant ? 'PASS 基準適合' : 'NG 電圧降下超過'}
                    </div>
                    <div className="text-[10px] opacity-80">
                      降下率 {(kyokutoMethod === 'PRECISE' ? kyokutoResult.preciseDropPercent : kyokutoResult.simplifiedDropPercent).toFixed(2)}% ≤ 許容 {kyokutoResult.allowableLimitPercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded shadow-2xs">
                  {selectedCableSizeSq} mm²
                </span>
              </div>

              {/* 20-Year Economic Loss Box */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold">売電ロス試算 (20年間):</span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] text-slate-400">FIT単価:</span>
                    <input
                      type="number"
                      value={tariffJpy}
                      onChange={e => setTariffJpy(Number(e.target.value))}
                      className="w-12 bg-white border border-slate-200 rounded px-1 text-right font-mono text-[11px]"
                    />
                    <span className="text-[10px]">円/kWh</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">年間損失電力量</span>
                    <span className="font-mono font-bold text-slate-900">
                      {recommendedCableCandidate.annualLossKwh.toLocaleString()} kWh
                    </span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <span className="text-[10px] text-slate-400 block">20年累計損失金額</span>
                    <span className="font-mono font-bold text-rose-600">
                      ¥{recommendedCableCandidate.lifetime20yLossJpy.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 pt-1">
                  推奨最小サイズ: <strong className="text-blue-700 font-mono">{recommendedCableCandidate.sizeSq} mm²</strong> (内線規程準拠)
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCableSizeSq(recommendedCableCandidate.sizeSq);
                    showToast(`Adopted recommended JIS CVT ${recommendedCableCandidate.sizeSq} mm² cable.`);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>推奨サイズ ({recommendedCableCandidate.sizeSq} mm²) を採用</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const item = {
                      id: `vdrop-${Date.now()}`,
                      toolId: 'kyokuto-vdrop',
                      toolTitle: '極東電線 電圧降下計算',
                      timestamp: Date.now(),
                      dateStr: new Date().toLocaleString('ja-JP'),
                      summary: `JIS CVT ${selectedCableSizeSq} mm² ｜ 電圧降下: ${(kyokutoMethod === 'PRECISE' ? kyokutoResult.preciseDropPercent : kyokutoResult.simplifiedDropPercent).toFixed(2)}% (許容: ${kyokutoResult.allowableLimitPercent}%) ｜ 判定: ${kyokutoResult.isCompliant ? 'PASS' : 'NG'}`,
                      data: {
                        systemType: kyokutoSysType,
                        voltageV: sysVoltage,
                        currentA: calculatedCurrent.toFixed(1),
                        cableSizeSq: `${selectedCableSizeSq} mm²`,
                        routeLengthM: `${cableLengthM} m`,
                        voltageDropV: (kyokutoMethod === 'PRECISE' ? kyokutoResult.preciseDropV : kyokutoResult.simplifiedDropV).toFixed(2),
                        voltageDropPercent: `${(kyokutoMethod === 'PRECISE' ? kyokutoResult.preciseDropPercent : kyokutoResult.simplifiedDropPercent).toFixed(2)}%`,
                        status: kyokutoResult.isCompliant ? 'PASS' : 'NG'
                      }
                    };
                    const updated = [item, ...dossierList.filter((d: any) => d.toolId !== 'kyokuto-vdrop')];
                    setDossierList(updated);
                    try {
                      localStorage.setItem('solnexa_engineering_dossier', JSON.stringify(updated));
                      window.dispatchEvent(new Event('solnexa-dossier-updated'));
                    } catch {}
                    showToast('電圧降下計算結果を技術計算書に追加しました！');
                  }}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <BookmarkCheck className="w-4 h-4 text-emerald-600" />
                  <span>技術計算書（Dossier）に追加</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportReport}
                  className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center space-x-2"
                >
                  <Download className="w-4 h-4 text-slate-600" />
                  <span>計算書エクスポート (Report)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Full JIS Standard Sizes Comparison Table (All 15 Sizes: 2 to 500 sq) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  JIS Standard Cable Sizes Comparison / 全15標準サイズ詳細評価
                </h3>
                <p className="text-[11px] text-slate-500">
                  極東電線技術資料 &amp; JIS C 3605規格に基づく全標準断面積 (2〜500mm²) の抵抗、リアクタンス、許容電流、電圧降下、20年売電損失の科学的比較表
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const csvRows = [
                      'Size_mm2,Conductor,R_75C_ohm_km,X_ohm_km,Ampacity_A,Drop_V,Drop_Percent,PowerLoss_kW,Loss20Yr_JPY,Result,Remarks',
                      ...candidateComparisonOutput.candidates.map(c =>
                        `${c.sizeSq},${conductorMaterial},${c.rTOhmPerKm},${c.xOhmPerKm},${c.deratedAmpacityA},${c.preciseDropV},${c.preciseDropPercent},${c.powerLossKw},${c.lifetime20yLossJpy},${c.status},"${c.remarks}"`
                      )
                    ];
                    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `Kyokuto_VoltageDrop_Comparison_${new Date().toISOString().split('T')[0]}.csv`;
                    link.click();
                    URL.revokeObjectURL(url);
                    showToast('JIS candidate evaluation exported to CSV.');
                  }}
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <span>CSVエクスポート</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold text-center w-8">選定</th>
                    <th className="py-2.5 px-3 font-semibold">Cable Size<br /><span className="text-[9px] font-normal text-slate-400">公称断面積 (mm²)</span></th>
                    <th className="py-2.5 px-3 font-semibold">Resistance R<br /><span className="text-[9px] font-normal text-slate-400">交流導体抵抗 75°C (Ω/km)</span></th>
                    <th className="py-2.5 px-3 font-semibold">Reactance X<br /><span className="text-[9px] font-normal text-slate-400">リアクタンス (Ω/km)</span></th>
                    <th className="py-2.5 px-3 font-semibold">Ampacity<br /><span className="text-[9px] font-normal text-slate-400">許容電流 (A)</span></th>
                    <th className="py-2.5 px-3 font-semibold">Drop V<br /><span className="text-[9px] font-normal text-slate-400">電圧降下 (V)</span></th>
                    <th className="py-2.5 px-3 font-semibold">Drop %<br /><span className="text-[9px] font-normal text-slate-400">電圧降下率 (%)</span></th>
                    <th className="py-2.5 px-3 font-semibold">Power Loss<br /><span className="text-[9px] font-normal text-slate-400">電力損失 (kW)</span></th>
                    <th className="py-2.5 px-3 font-semibold">20-Yr Loss<br /><span className="text-[9px] font-normal text-slate-400">20年損失額 (円)</span></th>
                    <th className="py-2.5 px-3 font-semibold text-center">Result<br /><span className="text-[9px] font-normal text-slate-400">判定</span></th>
                    <th className="py-2.5 px-3 font-semibold">Remarks<br /><span className="text-[9px] font-normal text-slate-400">備考</span></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {candidateComparisonOutput.candidates.map(row => {
                    const isSelected = selectedCableSizeSq === row.sizeSq;
                    const isRecommended = recommendedCableCandidate.sizeSq === row.sizeSq;
                    const activeDropV = kyokutoMethod === 'PRECISE' ? row.preciseDropV : row.simplifiedDropV;
                    const activeDropPercent = kyokutoMethod === 'PRECISE' ? row.preciseDropPercent : row.simplifiedDropPercent;

                    return (
                      <tr
                        key={row.sizeSq}
                        onClick={() => setSelectedCableSizeSq(row.sizeSq)}
                        className={`cursor-pointer transition-colors font-sans ${
                          isSelected ? 'bg-blue-50/90 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3 px-3 text-center">
                          <input
                            type="radio"
                            name="kyokuto-cable-select"
                            checked={isSelected}
                            onChange={() => setSelectedCableSizeSq(row.sizeSq)}
                            className="text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900 font-mono flex items-center space-x-1.5">
                          <span>{row.sizeSq} mm²</span>
                          {isRecommended && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                              推奨
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {row.rTOhmPerKm.toFixed(4)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {row.xOhmPerKm.toFixed(4)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {row.deratedAmpacityA} A
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-800">
                          {activeDropV.toFixed(2)} V
                        </td>
                        <td className={`py-3 px-3 font-mono font-bold ${
                          row.status === 'PASS' ? 'text-emerald-700' : row.status === 'REVIEW' ? 'text-amber-700' : 'text-rose-600'
                        }`}>
                          {activeDropPercent.toFixed(2)} %
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600">
                          {row.powerLossKw.toFixed(2)} kW
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 text-xs">
                          ¥{row.lifetime20yLossJpy.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {isRecommended && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              RECOMMENDED
                            </span>
                          )}
                          {!isRecommended && row.status === 'PASS' && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              PASS
                            </span>
                          )}
                          {row.status === 'REVIEW' && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              REVIEW
                            </span>
                          )}
                          {row.status === 'FAIL' && (
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              NG
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-xs text-slate-600 font-sans">
                          {row.remarks}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Notes & Japanese Regulatory Standards Footer */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span>Notes / 極東電線計算仕様に関する注意事項</span>
                </div>
                <ol className="text-[11px] text-slate-600 space-y-1 list-decimal pl-4 leading-relaxed">
                  <li>本計算は極東電線 (Kyokuto-k) 技術資料およびJIS C 3605規格値に基づきます。</li>
                  <li>導体抵抗は75°C連続運転時の温度補正 Rt = R20 × (234.5 + t) / (234.5 + 20) を適用しています。</li>
                  <li>内線規程 第1310節により、変電設備からの幹線は原則2.0%以内、引込受電時は3.0%以内を標準とします。</li>
                  <li>経済性検討では売電単価および年間稼働時間に基づき、20年間の累積電力量ロスを試算しています。</li>
                </ol>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Standards / 適用日本工業規格・指針</span>
                </div>
                <ul className="text-[11px] text-slate-600 space-y-1 list-disc pl-4 leading-relaxed">
                  <li>極東電線株式会社 電圧降下の計算方法 (https://www.kyokuto-k.co.jp/voltagedrop.html)</li>
                  <li>JIS C 3605 600V 架橋ポリエチレン絶縁ビニルシース電力ケーブル (CV / CVT)</li>
                  <li>電気設備の技術基準の解釈 第146条 (低圧配線等の施設)</li>
                  <li>内線規程 第1310節 (低圧配電線路の電圧降下) &amp; JEAC 8001</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2B. ISIJP CONDUIT SIZING TOOL (http://www.isijp.com/haikan/) */}
      {/* ========================================================= */}
      {(activeSubTab === 'isijp-conduit' || activeSubTab === 'cable-selection') && (
        <ConduitSizingCalculator onSaveToProject={onSaveToProject} />
      )}

      {/* ========================================================= */}
      {/* 3. CURRENT CALCULATION TOOL */}
      {/* ========================================================= */}
      {activeSubTab === 'current-calc' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Current Calculation / 電流計算</h3>
            <p className="text-xs text-slate-500">
              三相交流、単相交流、直流回路における負荷電流・定格電流の物理計算を行います。
            </p>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCcType('3_PHASE')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  ccType === '3_PHASE'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                3-Phase AC (三相)
              </button>
              <button
                type="button"
                onClick={() => setCcType('1_PHASE')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  ccType === '1_PHASE'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                1-Phase AC (単相)
              </button>
              <button
                type="button"
                onClick={() => setCcType('DC')}
                className={`py-2 text-xs font-bold rounded-xl border ${
                  ccType === 'DC'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                DC (直流)
              </button>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Rated Power / 定格電力 (kW)</label>
                <input
                  type="number"
                  value={ccPowerKw}
                  onChange={e => setCcPowerKw(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Voltage / 電圧 (V)</label>
                <input
                  type="number"
                  value={ccVoltage}
                  onChange={e => setCcVoltage(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              {ccType !== 'DC' && (
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Power Factor / 力率 (cosφ)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={ccPf}
                    onChange={e => setCcPf(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Efficiency / 変換効率 (η)</label>
                <input
                  type="number"
                  step="0.005"
                  value={ccEfficiency}
                  onChange={e => setCcEfficiency(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Calculation Results / 計算結果</h3>
              <p className="text-xs text-slate-500">導出された電流量および推奨ブレーカー定格</p>

              <div className="mt-5 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 text-center space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Full Load Current / 負荷電流
                </div>
                <div className="text-3xl font-black font-mono text-blue-950">
                  {ccResultCurrent.toFixed(1)} <span className="text-lg font-bold">A</span>
                </div>
                <div className="text-xs text-blue-800 font-mono">
                  {ccType === '3_PHASE' && `I = ${ccPowerKw}kW / (√3 × ${ccVoltage}V × ${ccPf} × ${ccEfficiency})`}
                  {ccType === '1_PHASE' && `I = ${ccPowerKw}kW / (${ccVoltage}V × ${ccPf} × ${ccEfficiency})`}
                  {ccType === 'DC' && `I = ${ccPowerKw}kW / (${ccVoltage}V × ${ccEfficiency})`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Suggested Breaker (1.25x)</span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {Math.ceil(ccResultCurrent * 1.25)} A
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Minimum Cable Ampacity</span>
                  <span className="text-base font-bold font-mono text-slate-900">
                    {Math.ceil(ccResultCurrent * 1.15)} A
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveSubTab('pv-pcs-cable');
                showToast('Current transferred to PV-PCS Cable Design.');
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <span>Use in Cable Design →</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. TRANSFORMER SIZING TOOL */}
      {/* ========================================================= */}
      {activeSubTab === 'transformer-sizing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Transformer Sizing / 変圧器容量選定</h3>
            <p className="text-xs text-slate-500">
              太陽光PCSまたはBESS蓄電システムの総出力から、標準JIS規格変圧器容量（kVA）を導定します。
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Total System Power / 総出力 (kW)</label>
                <input
                  type="number"
                  value={trTotalPowerKw}
                  onChange={e => setTrTotalPowerKw(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Power Factor / 力率 (cosφ)</label>
                <input
                  type="number"
                  step="0.01"
                  value={trPowerFactor}
                  onChange={e => setTrPowerFactor(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Max Ambient Temp / 最高周囲温度 (°C)</label>
                <input
                  type="number"
                  value={trAmbientMax}
                  onChange={e => setTrAmbientMax(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-600">Reserve Margin Factor / 余裕係数</label>
                <input
                  type="number"
                  step="0.05"
                  value={trReserveMargin}
                  onChange={e => setTrReserveMargin(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recommended Transformer / 推奨変圧器</h3>
              <p className="text-xs text-slate-500">JIS C 4304 / JIS C 4306 準拠標準定格容量</p>

              <div className="mt-5 p-5 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-200 text-center space-y-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recommended Transformer Rating
                </div>
                <div className="text-3xl font-black font-mono text-blue-950">
                  {trRecommendedKva.toLocaleString()} <span className="text-lg font-bold">kVA</span>
                </div>
                <div className="text-xs text-blue-800">
                  Calculated Minimum: {trCalculatedKva.toLocaleString()} kVA (Loading: {((trCalculatedKva / trRecommendedKva) * 100).toFixed(1)}%)
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Primary Voltage (LV)</span>
                  <span className="text-sm font-bold font-mono text-slate-900">0.4 kV / 0.69 kV</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Secondary Voltage (MV)</span>
                  <span className="text-sm font-bold font-mono text-slate-900">6.6 kV / 22 kV</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast(`Adopted ${trRecommendedKva} kVA Transformer to project specification.`)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Adopt Transformer / 変圧器を採用</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. PV STRING CHECK TOOL (Image 5 Logic) */}
      {/* ========================================================= */}
      {activeSubTab === 'pv-string-check' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">PV String Check / PV ストリング検討</h3>
            <p className="text-xs text-slate-500">
              低温時開放電圧（Voc max）および高温時動作電圧（Vmp min）がインバータ許容範囲内かを検証します。
            </p>

            <div className="space-y-3 pt-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Module Voc (STC) [V]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={scModuleVoc}
                    onChange={e => setScModuleVoc(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Module Vmp (STC) [V]</label>
                  <input
                    type="number"
                    step="0.1"
                    value={scModuleVmp}
                    onChange={e => setScModuleVmp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Temp Coeff Voc (%/°C)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={scTempCoeffVoc}
                    onChange={e => setScTempCoeffVoc(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Modules per String (枚)</label>
                  <input
                    type="number"
                    value={scModulesPerString}
                    onChange={e => setScModulesPerString(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Min Design Temp (°C)</label>
                  <input
                    type="number"
                    value={scMinTemp}
                    onChange={e => setScMinTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-600">Max Design Temp (°C)</label>
                  <input
                    type="number"
                    value={scMaxTemp}
                    onChange={e => setScMaxTemp(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">Inv Max DC (V)</label>
                  <input
                    type="number"
                    value={scInvMaxDcV}
                    onChange={e => setScInvMaxDcV(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">MPPT Min (V)</label>
                  <input
                    type="number"
                    value={scInvMpptMin}
                    onChange={e => setScInvMpptMin(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500">MPPT Max (V)</label>
                  <input
                    type="number"
                    value={scInvMpptMax}
                    onChange={e => setScInvMpptMax(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">String Check Results</h3>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  scCalculations.overallStatus === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {scCalculations.overallStatus}
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Max Voc (at {scMinTemp}°C)</div>
                    <div className="text-[10px] text-slate-500">Must be ≤ {scInvMaxDcV} V</div>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-bold font-mono ${
                      scCalculations.isVocSafe ? 'text-blue-700' : 'text-rose-600'
                    }`}>
                      {scCalculations.stringVocMax} V
                    </span>
                    <span className="text-[10px] font-bold block text-emerald-600">
                      {scCalculations.isVocSafe ? '✓ PASS' : '✗ OVER VOLTAGE'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Hot Vmp (at {scMaxTemp + 30}°C cell)</div>
                    <div className="text-[10px] text-slate-500">Must be ≥ {scInvMpptMin} V</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-blue-700">
                      {scCalculations.stringVmpHot} V
                    </span>
                    <span className="text-[10px] font-bold block text-emerald-600">
                      {scCalculations.isMpptOk ? '✓ PASS' : '✗ BELOW MPPT'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Standard Vmp (STC 25°C)</div>
                    <div className="text-[10px] text-slate-500">Nominal string voltage</div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-slate-900">
                      {scCalculations.stringVmpStc} V
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast(`String configuration (${scModulesPerString} modules/string) verified and ready.`)}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply to String Design / ストリング設計に反映</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const item = {
                  id: `pvstring-${Date.now()}`,
                  toolId: 'pv-string-check',
                  toolTitle: 'PV ストリング検討 (Voc/Vmp)',
                  timestamp: Date.now(),
                  dateStr: new Date().toLocaleString('ja-JP'),
                  summary: `直列数: ${scModulesPerString}枚/ストリング ｜ 最低気温時Voc: ${scCalculations.stringVocMax}V (PCS許容: ${scInvMaxDcV}V) ｜ 判定: ${scCalculations.overallStatus}`,
                  data: {
                    modulesPerString: `${scModulesPerString} 枚`,
                    stringVocMax: `${scCalculations.stringVocMax} V`,
                    stringVmpHot: `${scCalculations.stringVmpHot} V`,
                    invMaxDcV: `${scInvMaxDcV} V`,
                    minTempC: `${scMinTemp} °C`,
                    status: scCalculations.overallStatus
                  }
                };
                const updated = [item, ...dossierList.filter((d: any) => d.toolId !== 'pv-string-check')];
                setDossierList(updated);
                try {
                  localStorage.setItem('solnexa_engineering_dossier', JSON.stringify(updated));
                  window.dispatchEvent(new Event('solnexa-dossier-updated'));
                } catch {}
                showToast('PVストリング設計結果を技術計算書に追加しました！');
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-600" />
              <span>技術計算書（Dossier）に追加</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7-TOOL GRID SELECTOR MODAL (Dàn trang 7 công cụ dạng lưới) */}
      {/* ========================================================= */}
      {isToolGridModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#002B49] text-white flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-blue-500/20 rounded text-blue-300">
                    <Grid className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                    SOLNEXA QUICK ENGINEERING
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  クイック設計計算ツール一覧 (全{QUICK_ENGINEERING_TOOLS.length}ツール)
                </h3>
                <p className="text-xs text-slate-300">
                  行いたい計算ツールをクリックすると、該当の設計画面へ直接移動します
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsToolGridModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content: 7 Cards Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {QUICK_ENGINEERING_TOOLS.map((t, idx) => {
                  const Icon = t.icon;
                  const isCurrent = t.id === activeSubTab || (t.alias && t.alias.includes(activeSubTab));
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        handleSelectTool(t.id);
                        setIsToolGridModalOpen(false);
                      }}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left space-y-3 ${
                        isCurrent
                          ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-500'
                          : 'border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`p-2 rounded-lg ${t.accentColor}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400">
                              #{idx + 1}
                            </span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                              t.badgeType === 'free'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {t.badge}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {t.titleJa}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {t.titleEn}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {t.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 truncate max-w-[150px] font-mono">
                          {t.standard}
                        </span>
                        <span className={`font-bold ${isCurrent ? 'text-blue-700' : 'text-slate-600'}`}>
                          {isCurrent ? '✓ 開いています' : '選択する →'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
              <span>※ 画面左のサイドバーからもいつでも1クリックで切り替え可能です</span>
              <button
                type="button"
                onClick={() => setIsToolGridModalOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg transition-colors cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* UNIFIED DOSSIER MODAL (Hồ sơ Tính toán Kỹ thuật Hợp nhất)   */}
      {/* ========================================================= */}
      {isDossierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div
            className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#002B49] text-white flex items-center justify-between shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
                    ENGINEERING CALCULATION DOSSIER
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold">
                  総合技術計算書・照査フォルダ
                </h3>
                <p className="text-xs text-slate-300">
                  各ツールで算定したパラメータを統合管理し、一括で技術計算書として出力できます
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDossierModalOpen(false)}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
              {dossierList.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700">まだ計算書に項目が追加されていません</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    「積雪・気象条件チェック」や「電圧降下計算」などの各画面にある<strong className="text-slate-800">「技術計算書に追加」</strong>ボタンを押すと、このフォルダに結果が自動保存されます。
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-100">
                    <span>保存済み項目: <strong className="text-slate-800">{dossierList.length} 件</strong></span>
                    <button
                      type="button"
                      onClick={handleClearDossier}
                      className="text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>全項目をクリア</span>
                    </button>
                  </div>

                  {dossierList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 space-y-2 text-xs transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                          <span>{item.toolTitle}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.dateStr || ''}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDossierItem(item.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="この項目を削除"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="font-medium text-slate-800">
                        {item.summary}
                      </p>

                      {item.data && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-2 bg-white rounded border border-slate-200/80 font-mono text-[11px]">
                          {Object.entries(item.data).slice(0, 6).map(([k, v]) => (
                            <div key={k}>
                              <span className="text-slate-400 block text-[9px] uppercase">{k}</span>
                              <span className="font-bold text-slate-800 truncate block">{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-500 font-mono">
                SOLNEXA Standalone Engineering Engine
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  disabled={dossierList.length === 0}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>印刷</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCombinedDossier}
                  disabled={dossierList.length === 0}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>総合技術計算書を出力 (.txt)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FLOATING ACTION DOCK (Dock trôi nổi chuyển Tool & Home)    */}
      {/* ========================================================= */}
      <div className="fixed bottom-5 right-5 z-40 flex items-center gap-2 bg-slate-900/90 text-white p-1.5 rounded-2xl shadow-xl backdrop-blur-md border border-slate-700 select-none">
        <button
          type="button"
          onClick={() => setIsToolGridModalOpen(true)}
          className="flex items-center gap-1 px-3 py-2 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors cursor-pointer text-blue-300"
          title="7つの設計ツール一覧を開く"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">ツール一覧</span>
        </button>

        <button
          type="button"
          onClick={() => setIsDossierModalOpen(true)}
          className="flex items-center gap-1 px-3 py-2 hover:bg-white/10 rounded-xl text-xs font-bold transition-colors cursor-pointer text-emerald-300"
          title="技術計算書（Dossier）を開く"
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">計算書</span>
          <span className="bg-emerald-500 text-slate-950 font-mono text-[10px] px-1.5 py-0.2 rounded-full font-bold">
            {dossierList.length}
          </span>
        </button>

        <div className="w-px h-5 bg-white/20 my-auto" />

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="p-2 hover:bg-white/10 rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="ページ最上部へスクロール"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
