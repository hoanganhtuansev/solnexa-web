import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BatteryCharging,
  Zap,
  BarChart3,
  FileText,
  Printer,
  BookmarkCheck,
  CheckCircle2,
  Info,
  Sliders,
  DollarSign,
  ArrowRight,
  Sun,
  Layers,
  ShieldCheck,
  Activity,
  AlertTriangle
} from 'lucide-react';

interface BessCurtailmentRevenueCalculatorProps {
  onOpenContact?: () => void;
  isLoggedIn?: boolean;
}

export const BessCurtailmentRevenueCalculator: React.FC<BessCurtailmentRevenueCalculatorProps> = ({
  onOpenContact,
  isLoggedIn
}) => {
  // 1. Regional Electric Power Company (EPCO) & Grid Parameters
  // Based on METI / OCCTO 2024-2025 actual curtailment statistics
  const [selectedRegion, setSelectedRegion] = useState<'kyushu' | 'tohoku' | 'chugoku' | 'shikoku' | 'chubu' | 'tokyo' | 'kansai'>('kyushu');
  const [systemType, setSystemType] = useState<'FIP_COLOCATED' | 'STANDALONE_BESS'>('FIP_COLOCATED');

  // Solar & BESS sizing
  const [solarDcMw, setSolarDcMw] = useState<number>(5.0); // 5 MW-DC
  const [solarAcMw, setSolarAcMw] = useState<number>(4.0); // 4 MW-AC PCS
  const [annualSolarYieldKwhPerKw, setAnnualSolarYieldKwhPerKw] = useState<number>(1250); // kWh/kWp/year
  
  // BESS specifications
  const [bessPcsMw, setBessPcsMw] = useState<number>(2.0); // 2 MW PCS
  const [bessCapacityMwh, setBessCapacityMwh] = useState<number>(8.0); // 8 MWh (4h duration)
  const [roundTripEfficiency, setRoundTripEfficiency] = useState<number>(87.5); // % (LFP DC-DC or AC-AC)
  const [annualDegradationPct, setAnnualDegradationPct] = useState<number>(2.0); // %/year
  const [dodPct, setDodPct] = useState<number>(90); // % Depth of Discharge (usable energy)

  // Market & Pricing Parameters (JEPX & Capacity Market)
  const [fipTariffYen, setFipTariffYen] = useState<number>(9.5); // FIP 基準価格 (円/kWh)
  const [middayChargePriceYen, setMiddayChargePriceYen] = useState<number>(0.01); // 出力制御時/昼間買電 (円/kWh)
  const [eveningPeakPriceYen, setEveningPeakPriceYen] = useState<number>(24.5); // 夕方ピーク売電 JEPX (円/kWh)
  const [enableCapacityMarket, setEnableCapacityMarket] = useState<boolean>(true); // 容量市場約定金
  const [capacityMarketYenPerKwYear, setCapacityMarketYenPerKwYear] = useState<number>(6800); // 円/kW/年
  const [enableBalancingMarket, setEnableBalancingMarket] = useState<boolean>(false); // 需給調整市場 (三次②)
  const [balancingMarketRevenueManYear, setBalancingMarketRevenueManYear] = useState<number>(350); // 万円/年

  // Capex & Financials
  const [bessCapexManPerKwh, setBessCapexManPerKwh] = useState<number>(4.5); // 4.5万円/kWh (45,000円/kWh EPC込)
  const [bessOpexPctOfCapex, setBessOpexPctOfCapex] = useState<number>(1.5); // 1.5% 保守点検費
  const [projectLifeYears, setProjectLifeYears] = useState<number>(20);

  const [savedToDossier, setSavedToDossier] = useState<boolean>(false);

  // Regional Profiles: Typical curtailment rate & average JEPX peak spread
  const REGIONAL_PROFILES = {
    kyushu: {
      name: '九州電力送配電エリア',
      curtailmentRatePct: 18.2,
      note: '国内最大の出力制御発生率。春・秋の昼間にJEPX価格が0.01円に急落。蓄電池併設の収益メリット最大。',
      defaultSpread: 26.8,
      solarYield: 1280
    },
    tohoku: {
      name: '東北電力ネットワークエリア',
      curtailmentRatePct: 12.5,
      note: '風力・太陽光の連系急増に伴い制御率が年々拡大。冬期夕方の暖房需要ピークによる価格高騰が大きい。',
      defaultSpread: 25.4,
      solarYield: 1180
    },
    chugoku: {
      name: '中国電力ネットワークエリア',
      curtailmentRatePct: 10.4,
      note: '瀬戸内メガソーラー集積地域。昼間の余剰電力吸収と山陽工業地帯の夕方ピーク需要がマッチ。',
      defaultSpread: 23.9,
      solarYield: 1250
    },
    shikoku: {
      name: '四国電力送配電エリア',
      curtailmentRatePct: 14.1,
      note: '系統規模が小さく再エネ比率が高いため春季の制御頻発。蓄電池導入による回避率が極めて高い。',
      defaultSpread: 24.2,
      solarYield: 1260
    },
    chubu: {
      name: '中部電力パワーグリッドエリア',
      curtailmentRatePct: 5.8,
      note: '製造業の平日高需要を背景に制御は限定的だが、土日祝日の0.01円安値時間帯の充電が有効。',
      defaultSpread: 23.1,
      solarYield: 1220
    },
    tokyo: {
      name: '東京電力パワーグリッドエリア',
      curtailmentRatePct: 2.1,
      note: '直接の出力制御は僅少。系統用単独BESSによるJEPXアービトラージ・容量市場・需給調整市場特化型。',
      defaultSpread: 26.5,
      solarYield: 1200
    },
    kansai: {
      name: '関西電力送配電エリア',
      curtailmentRatePct: 4.2,
      note: '原子力稼働基盤による夜間ベースロード安定。昼夕価格差を狙った系統用蓄電所の計画が増加中。',
      defaultSpread: 22.8,
      solarYield: 1210
    }
  };

  // Quick Preset Selection Handlers
  const handleSelectPreset = (preset: 'kyushu_5mw_solar_bess' | 'tohoku_2mw_fip' | 'tokyo_standalone_grid' | 'chugoku_ci_peakcut') => {
    if (preset === 'kyushu_5mw_solar_bess') {
      setSelectedRegion('kyushu');
      setSystemType('FIP_COLOCATED');
      setSolarDcMw(5.0);
      setSolarAcMw(4.0);
      setAnnualSolarYieldKwhPerKw(1280);
      setBessPcsMw(2.0);
      setBessCapacityMwh(8.0);
      setFipTariffYen(9.5);
      setMiddayChargePriceYen(0.01);
      setEveningPeakPriceYen(26.8);
      setEnableCapacityMarket(true);
      setEnableBalancingMarket(false);
      setBessCapexManPerKwh(4.2);
    } else if (preset === 'tohoku_2mw_fip') {
      setSelectedRegion('tohoku');
      setSystemType('FIP_COLOCATED');
      setSolarDcMw(2.0);
      setSolarAcMw(1.99);
      setAnnualSolarYieldKwhPerKw(1180);
      setBessPcsMw(1.0);
      setBessCapacityMwh(3.5);
      setFipTariffYen(10.0);
      setMiddayChargePriceYen(0.01);
      setEveningPeakPriceYen(25.4);
      setEnableCapacityMarket(true);
      setEnableBalancingMarket(false);
      setBessCapexManPerKwh(4.5);
    } else if (preset === 'tokyo_standalone_grid') {
      setSelectedRegion('tokyo');
      setSystemType('STANDALONE_BESS');
      setSolarDcMw(0);
      setSolarAcMw(0);
      setBessPcsMw(2.0);
      setBessCapacityMwh(8.0);
      setMiddayChargePriceYen(7.5); // Average daytime buy
      setEveningPeakPriceYen(26.5);
      setEnableCapacityMarket(true);
      setCapacityMarketYenPerKwYear(7200);
      setEnableBalancingMarket(true);
      setBalancingMarketRevenueManYear(420);
      setBessCapexManPerKwh(4.0);
    } else if (preset === 'chugoku_ci_peakcut') {
      setSelectedRegion('chugoku');
      setSystemType('FIP_COLOCATED');
      setSolarDcMw(1.5);
      setSolarAcMw(1.2);
      setAnnualSolarYieldKwhPerKw(1250);
      setBessPcsMw(0.5);
      setBessCapacityMwh(2.0);
      setFipTariffYen(10.5);
      setMiddayChargePriceYen(0.01);
      setEveningPeakPriceYen(24.0);
      setEnableCapacityMarket(false);
      setBessCapexManPerKwh(4.8);
    }
  };

  // Comprehensive Calculation Model
  const calcResults = useMemo(() => {
    const regionInfo = REGIONAL_PROFILES[selectedRegion];
    const curtailmentRatePct = regionInfo.curtailmentRatePct;

    // 1. Solar generation before BESS
    const annualSolarGenMwh = (solarDcMw * 1000 * annualSolarYieldKwhPerKw) / 1000; // MWh/year
    const annualCurtailedEnergyMwh = systemType === 'FIP_COLOCATED'
      ? annualSolarGenMwh * (curtailmentRatePct / 100)
      : 0; // MWh lost without BESS

    // 2. Usable daily battery energy
    const usableDailyCapacityMwh = bessCapacityMwh * (dodPct / 100);
    const rteFactor = roundTripEfficiency / 100;

    // Days with curtailment per year (approximate from curtailment rate)
    // E.g. 18% curtailment represents ~90-120 days of heavy curtailment hours
    const estimatedCurtailmentDays = Math.min(180, Math.round(curtailmentRatePct * 6.5));
    const normalArbitrageDays = 365 - estimatedCurtailmentDays;

    // 3. Curtailment recovery kWh
    // Daily absorption capped by battery usable capacity
    const dailyCurtailedSolarAverageMwh = estimatedCurtailmentDays > 0 
      ? annualCurtailedEnergyMwh / estimatedCurtailmentDays 
      : 0;
    const dailyAbsorbedMwh = Math.min(usableDailyCapacityMwh, dailyCurtailedSolarAverageMwh);
    const annualRecoveredCurtailmentMwh = dailyAbsorbedMwh * estimatedCurtailmentDays;
    const curtailmentAvoidanceRate = annualCurtailedEnergyMwh > 0
      ? Math.min(100, (annualRecoveredCurtailmentMwh / annualCurtailedEnergyMwh) * 100)
      : 0;

    // Energy discharged from curtailment absorption (accounting for RTE)
    const annualDischargedFromCurtailmentMwh = annualRecoveredCurtailmentMwh * rteFactor;

    // Curtailment recovery revenue (discharged at evening peak or FIP price)
    // Energy cost was 0 yen (curtailed otherwise discarded), sell at evening peak or FIP reference
    const dischargePriceYen = Math.max(fipTariffYen, eveningPeakPriceYen);
    const annualCurtailmentRevenueYen = (annualDischargedFromCurtailmentMwh * 1000) * dischargePriceYen;
    const annualCurtailmentRevenueMan = annualCurtailmentRevenueYen / 10000; // 万円

    // 4. Arbitrage on non-curtailment days (or for standalone grid BESS)
    // Daily cycles = 1.0 (or 1.25)
    const dailyArbitrageDischargeMwh = usableDailyCapacityMwh * rteFactor;
    const priceSpreadYen = Math.max(0, eveningPeakPriceYen - (middayChargePriceYen / rteFactor));
    const arbitrageDaysCount = systemType === 'STANDALONE_BESS' ? 365 : normalArbitrageDays;
    const annualArbitrageDischargeMwh = dailyArbitrageDischargeMwh * arbitrageDaysCount;
    const annualArbitrageRevenueYen = (annualArbitrageDischargeMwh * 1000) * priceSpreadYen;
    const annualArbitrageRevenueMan = annualArbitrageRevenueYen / 10000; // 万円

    // 5. Capacity Market (容量市場) Revenue
    // Payment based on PCS capacity (kW) and availability factor (usually ~85% for 4h battery)
    const capacityFactor = bessCapacityMwh / bessPcsMw >= 4 ? 0.84 : (bessCapacityMwh / bessPcsMw >= 2 ? 0.65 : 0.40);
    const annualCapacityMarketRevenueYen = enableCapacityMarket 
      ? (bessPcsMw * 1000 * capacityFactor * capacityMarketYenPerKwYear)
      : 0;
    const annualCapacityMarketRevenueMan = annualCapacityMarketRevenueYen / 10000;

    // 6. Balancing Market (需給調整市場)
    const annualBalancingRevenueMan = enableBalancingMarket ? balancingMarketRevenueManYear : 0;

    // 7. Total Gross Revenue
    const annualTotalGrossRevenueMan = annualCurtailmentRevenueMan + annualArbitrageRevenueMan + annualCapacityMarketRevenueMan + annualBalancingRevenueMan;

    // 8. Capex and Opex
    const totalCapexMan = (bessCapacityMwh * 1000) * bessCapexManPerKwh; // 万円
    const annualOpexMan = totalCapexMan * (bessOpexPctOfCapex / 100); // 万円/年
    const annualNetCashFlowYear1Man = annualTotalGrossRevenueMan - annualOpexMan;

    // 9. Financial Metrics: Simple Payback & Estimated IRR
    const simplePaybackYears = annualNetCashFlowYear1Man > 0 
      ? (totalCapexMan / annualNetCashFlowYear1Man)
      : 99;

    // Rough 20-Year Project IRR estimation taking battery degradation into account
    let cumulativeCashFlow = -totalCapexMan;
    const cashFlows: number[] = [-totalCapexMan];
    for (let yr = 1; yr <= projectLifeYears; yr++) {
      const degradationFactor = Math.pow(1 - (annualDegradationPct / 100), yr - 1);
      const yrGross = (annualCurtailmentRevenueMan + annualArbitrageRevenueMan) * degradationFactor + (annualCapacityMarketRevenueMan + annualBalancingRevenueMan);
      const yrNet = yrGross - annualOpexMan;
      cashFlows.push(yrNet);
      cumulativeCashFlow += yrNet;
    }

    // Binary search approximation for IRR
    let irr = 0;
    if (annualNetCashFlowYear1Man > 0) {
      let low = 0.0;
      let high = 0.40;
      for (let iter = 0; iter < 40; iter++) {
        const mid = (low + high) / 2;
        let npv = cashFlows[0];
        for (let t = 1; t <= projectLifeYears; t++) {
          npv += cashFlows[t] / Math.pow(1 + mid, t);
        }
        if (npv > 0) {
          low = mid;
        } else {
          high = mid;
        }
      }
      irr = ((low + high) / 2) * 100;
    }

    return {
      annualSolarGenMwh,
      annualCurtailedEnergyMwh,
      annualRecoveredCurtailmentMwh,
      curtailmentAvoidanceRate,
      annualCurtailmentRevenueMan,
      annualArbitrageRevenueMan,
      annualCapacityMarketRevenueMan,
      annualBalancingRevenueMan,
      annualTotalGrossRevenueMan,
      totalCapexMan,
      annualOpexMan,
      annualNetCashFlowYear1Man,
      simplePaybackYears,
      irr,
      cumulative20YrNetProfitMan: cumulativeCashFlow,
      priceSpreadYen
    };
  }, [
    selectedRegion,
    systemType,
    solarDcMw,
    solarAcMw,
    annualSolarYieldKwhPerKw,
    bessPcsMw,
    bessCapacityMwh,
    roundTripEfficiency,
    annualDegradationPct,
    dodPct,
    fipTariffYen,
    middayChargePriceYen,
    eveningPeakPriceYen,
    enableCapacityMarket,
    capacityMarketYenPerKwYear,
    enableBalancingMarket,
    balancingMarketRevenueManYear,
    bessCapexManPerKwh,
    bessOpexPctOfCapex,
    projectLifeYears
  ]);

  const handleSaveToDossier = () => {
    try {
      const existing = localStorage.getItem('solnexa_engineering_dossier');
      const dossierList = existing ? JSON.parse(existing) : [];
      const regionName = REGIONAL_PROFILES[selectedRegion].name;
      const item = {
        id: `bess-curtailment-${Date.now()}`,
        toolId: 'bess-curtailment',
        toolTitle: '系統用・FIP 出力制御回避＆JEPXアービトラージ収益シミュレーション',
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString('ja-JP'),
        summary: `${regionName} ｜ 蓄電池: ${bessPcsMw}MW / ${bessCapacityMwh}MWh ｜ 年間収益: ¥${Math.round(calcResults.annualTotalGrossRevenueMan).toLocaleString()}万円 ｜ IRR: ${calcResults.irr.toFixed(1)}%`,
        data: {
          area: regionName,
          systemType: systemType === 'FIP_COLOCATED' ? '太陽光併設型FIP蓄電所' : '系統用スタンドアロン蓄電所',
          solarCapacity: systemType === 'FIP_COLOCATED' ? `${solarDcMw} MW-DC / ${solarAcMw} MW-AC` : 'なし',
          bessSpec: `PCS ${bessPcsMw} MW ｜ 蓄電容量 ${bessCapacityMwh} MWh (${(bessCapacityMwh / bessPcsMw).toFixed(1)}h)`,
          curtailmentAvoided: `${Math.round(calcResults.annualRecoveredCurtailmentMwh).toLocaleString()} MWh/年 (回避率: ${calcResults.curtailmentAvoidanceRate.toFixed(1)}%)`,
          annualRevenueBreakdown: `出力制御回避: ¥${Math.round(calcResults.annualCurtailmentRevenueMan).toLocaleString()}万 + スポット差益: ¥${Math.round(calcResults.annualArbitrageRevenueMan).toLocaleString()}万 + 容量市場等: ¥${Math.round(calcResults.annualCapacityMarketRevenueMan + calcResults.annualBalancingRevenueMan).toLocaleString()}万`,
          annualTotalGrossRevenue: `¥${Math.round(calcResults.annualTotalGrossRevenueMan).toLocaleString()} 万円/年`,
          totalCapex: `¥${Math.round(calcResults.totalCapexMan).toLocaleString()} 万円 (${(calcResults.totalCapexMan / 10000).toFixed(2)} 億円)`,
          simplePayback: `${calcResults.simplePaybackYears.toFixed(1)} 年`,
          projectIrr: `${calcResults.irr.toFixed(1)} % (税引前20年)`
        }
      };
      const updated = [item, ...dossierList.filter((d: any) => d.toolId !== 'bess-curtailment')];
      localStorage.setItem('solnexa_engineering_dossier', JSON.stringify(updated));
      window.dispatchEvent(new Event('solnexa-dossier-updated'));
      setSavedToDossier(true);
      setTimeout(() => setSavedToDossier(false), 3000);
    } catch (e) {
      console.warn('Failed to save to dossier:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#09416a] to-[#12588c] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-300">
                <TrendingUp className="w-5 h-5 text-emerald-300" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20">
                JEPX MARKET &amp; GRID CURTAILMENT SIMULATOR ｜ 経産省・広域機関ルール準拠
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              系統用・FIP太陽光 蓄電池 出力制御回避＆JEPXアービトラージ収益シミュレーター
            </h1>
            <p className="text-xs text-blue-100 max-w-3xl leading-relaxed">
              各電力エリア（九州・東北・中国等）のリアルな出力制御発生率、JEPXスポット市場（0.01円昼間余剰電力吸収〜夕方ピーク放電）、容量市場（長期脱炭素/メイン市場）、需給調整市場の複合収益スタッキング（Revenue Stacking）と事業性IRR・回収年数を瞬時に試算します。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleSaveToDossier}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                savedToDossier
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {savedToDossier ? (
                <>
                  <BookmarkCheck className="w-4 h-4 text-white" />
                  <span>技術計算書に追加済</span>
                </>
              ) : (
                <>
                  <BookmarkCheck className="w-4 h-4" />
                  <span>技術計算書に追加</span>
                </>
              )}
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white text-[#002B49] hover:bg-slate-100 transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>印刷 / PDF出力</span>
            </button>
          </div>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-800">国内代表ケース 瞬時プリセット読み込み</span>
          </div>
          <span className="text-[11px] text-slate-500">ワンクリックで実務ベンチマーク値を反映</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 pt-3">
          <button
            onClick={() => handleSelectPreset('kyushu_5mw_solar_bess')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">九州 5MW太陽光 + 8MWh BESS</div>
            <div className="text-[10px] text-slate-500">制御率18.2%・余剰吸収＋夕方放電</div>
          </button>
          <button
            onClick={() => handleSelectPreset('tohoku_2mw_fip')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">東北 2MW FIP + 3.5MWh BESS</div>
            <div className="text-[10px] text-slate-500">高圧特別仕様・冬期夕方高値狙い</div>
          </button>
          <button
            onClick={() => handleSelectPreset('tokyo_standalone_grid')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">東京 系統用単独 2MW/8MWh</div>
            <div className="text-[10px] text-slate-500">JEPX差益＋容量市場＋需給調整市場</div>
          </button>
          <button
            onClick={() => handleSelectPreset('chugoku_ci_peakcut')}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group cursor-pointer"
          >
            <div className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700">中国 自家消費 1.5MW + 2MWh</div>
            <div className="text-[10px] text-slate-500">工場デマンドピークカット併用</div>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters Left, Results & Charts Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 space-y-5">
          {/* Section 1: Area & Project Type */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              電力エリア &amp; 事業形態
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>連系電力エリア (送配電会社)</span>
                <span className="text-blue-600 font-mono text-[11px]">制御率: {REGIONAL_PROFILES[selectedRegion].curtailmentRatePct}%</span>
              </label>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value as any)}
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="kyushu">九州電力 (年制御率 18.2% ｜ 最多)</option>
                <option value="tohoku">東北電力 (年制御率 12.5% ｜ 急増中)</option>
                <option value="chugoku">中国電力 (年制御率 10.4%)</option>
                <option value="shikoku">四国電力 (年制御率 14.1%)</option>
                <option value="chubu">中部電力 (年制御率 5.8%)</option>
                <option value="tokyo">東京電力 (年制御率 2.1% ｜ 系統用蓄電中心)</option>
                <option value="kansai">関西電力 (年制御率 4.2%)</option>
              </select>
              <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100">
                💡 {REGIONAL_PROFILES[selectedRegion].note}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">事業種別</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSystemType('FIP_COLOCATED')}
                  className={`p-2.5 text-xs rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    systemType === 'FIP_COLOCATED'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50/50 text-slate-600'
                  }`}
                >
                  太陽光併設型 FIP
                </button>
                <button
                  type="button"
                  onClick={() => setSystemType('STANDALONE_BESS')}
                  className={`p-2.5 text-xs rounded-xl border text-center font-bold transition-all cursor-pointer ${
                    systemType === 'STANDALONE_BESS'
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50/50 text-slate-600'
                  }`}
                >
                  系統用単独 BESS
                </button>
              </div>
            </div>

            {systemType === 'FIP_COLOCATED' && (
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">太陽光 DC容量 (MW)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={solarDcMw}
                    onChange={e => setSolarDcMw(Number(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">PCS AC容量 (MW)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={solarAcMw}
                    onChange={e => setSolarAcMw(Number(e.target.value))}
                    className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Section 2: BESS Capacity & Efficiencies */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              蓄電池システム (BESS) 定格
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">PCS 出力 (MW)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={bessPcsMw}
                  onChange={e => setBessPcsMw(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">蓄電容量 (MWh)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.2"
                  value={bessCapacityMwh}
                  onChange={e => setBessCapacityMwh(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div>
                <span className="text-[10px] text-slate-500 block">放電持続時間</span>
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {(bessCapacityMwh / bessPcsMw).toFixed(1)} 時間
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">総合充放電効率</span>
                <span className="text-xs font-bold text-emerald-600 font-mono">
                  {roundTripEfficiency}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">実効DoD深度</span>
                <span className="text-xs font-bold text-slate-800 font-mono">
                  {dodPct}%
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 flex justify-between">
                <span>年間劣化率 (%/年)</span>
                <span className="text-slate-500 font-mono text-[11px]">{annualDegradationPct}% (20年後残存 ~67%)</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="3.5"
                step="0.1"
                value={annualDegradationPct}
                onChange={e => setAnnualDegradationPct(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Market Prices & Multi-Revenue Stacking */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              JEPX市場価格 &amp; 収益スタッキング
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  昼間充電価格 (円/kWh)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.01"
                  value={middayChargePriceYen}
                  onChange={e => setMiddayChargePriceYen(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
                <span className="text-[10px] text-slate-400">制御時は0.01円/kWh</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  夕方放電価格 (円/kWh)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="5"
                  value={eveningPeakPriceYen}
                  onChange={e => setEveningPeakPriceYen(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
                <span className="text-[10px] text-emerald-600 font-bold font-mono">
                  差益: +{calcResults.priceSpreadYen.toFixed(1)}円/kWh
                </span>
              </div>
            </div>

            {/* Capacity Market & Balancing Market Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableCapacityMarket}
                  onChange={e => setEnableCapacityMarket(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">容量市場 (約定単価 ¥{capacityMarketYenPerKwYear.toLocaleString()}/kW/年)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableBalancingMarket}
                  onChange={e => setEnableBalancingMarket(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-xs font-semibold text-slate-700">需給調整市場 (三次調整力②参入想定)</span>
              </label>
            </div>
          </div>

          {/* Section 4: Capex & Financial Parameters */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-600"></span>
              設備投資費 (CAPEX) &amp; OPEX
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">BESS単価 (万円/kWh)</label>
                <input
                  type="number"
                  step="0.2"
                  min="2.0"
                  value={bessCapexManPerKwh}
                  onChange={e => setBessCapexManPerKwh(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
                <span className="text-[10px] text-slate-400">EPC/土木/連系込</span>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">年間保守OPEX (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={bessOpexPctOfCapex}
                  onChange={e => setBessOpexPctOfCapex(Number(e.target.value))}
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-800"
                />
                <span className="text-[10px] text-slate-400">CAPEX比率 (年間)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Key KPI Cards & Detailed Economics Analysis */}
        <div className="lg:col-span-7 space-y-5">
          {/* Executive KPI Summary Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">年間総増収額</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600 font-mono mt-1">
                ¥{Math.round(calcResults.annualTotalGrossRevenueMan).toLocaleString()}
                <span className="text-xs font-normal text-slate-500 ml-1">万円</span>
              </div>
              <div className="text-[10px] text-emerald-700 font-medium mt-1">
                約 {(calcResults.annualTotalGrossRevenueMan / 10000).toFixed(2)} 億円/年
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">プロジェクトIRR</div>
              <div className={`text-xl sm:text-2xl font-black font-mono mt-1 ${
                calcResults.irr >= 8 ? 'text-blue-600' : calcResults.irr >= 5 ? 'text-amber-600' : 'text-slate-700'
              }`}>
                {calcResults.irr > 0 ? `${calcResults.irr.toFixed(1)}%` : '—'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">税引前 20年IRR</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">単純投資回収年数</div>
              <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
                {calcResults.simplePaybackYears < 30 ? `${calcResults.simplePaybackYears.toFixed(1)}年` : '> 30年'}
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                初期投資: ¥{(calcResults.totalCapexMan / 10000).toFixed(2)}億円
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">出力制御回避率</div>
              <div className="text-xl sm:text-2xl font-black text-sky-600 font-mono mt-1">
                {calcResults.curtailmentAvoidanceRate.toFixed(1)}%
              </div>
              <div className="text-[10px] text-slate-500 font-medium mt-1">
                回収: {Math.round(calcResults.annualRecoveredCurtailmentMwh).toLocaleString()} MWh
              </div>
            </div>
          </div>

          {/* Revenue Stacking Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">収益スタッキング（内訳構成）</h3>
                <p className="text-[11px] text-slate-500">電力取引・容量市場・余剰吸収の複合キャッシュフロー</p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                1年目ネットCF: ¥{Math.round(calcResults.annualNetCashFlowYear1Man).toLocaleString()}万円
              </span>
            </div>

            {/* Stacked bar visual */}
            <div className="space-y-3">
              <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden flex">
                <div
                  style={{
                    width: `${calcResults.annualTotalGrossRevenueMan > 0 ? (calcResults.annualCurtailmentRevenueMan / calcResults.annualTotalGrossRevenueMan) * 100 : 0}%`
                  }}
                  className="bg-sky-500 h-full transition-all"
                  title="出力制御回避"
                />
                <div
                  style={{
                    width: `${calcResults.annualTotalGrossRevenueMan > 0 ? (calcResults.annualArbitrageRevenueMan / calcResults.annualTotalGrossRevenueMan) * 100 : 0}%`
                  }}
                  className="bg-emerald-500 h-full transition-all"
                  title="JEPXスポット差益"
                />
                <div
                  style={{
                    width: `${calcResults.annualTotalGrossRevenueMan > 0 ? (calcResults.annualCapacityMarketRevenueMan / calcResults.annualTotalGrossRevenueMan) * 100 : 0}%`
                  }}
                  className="bg-blue-600 h-full transition-all"
                  title="容量市場"
                />
                <div
                  style={{
                    width: `${calcResults.annualTotalGrossRevenueMan > 0 ? (calcResults.annualBalancingRevenueMan / calcResults.annualTotalGrossRevenueMan) * 100 : 0}%`
                  }}
                  className="bg-purple-500 h-full transition-all"
                  title="需給調整市場"
                />
              </div>

              {/* Legend & Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50 border border-sky-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0"></span>
                    <span className="font-semibold text-slate-700">出力制御 回避売電</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">
                    ¥{Math.round(calcResults.annualCurtailmentRevenueMan).toLocaleString()} 万円
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="font-semibold text-slate-700">JEPX スポット価格差益</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">
                    ¥{Math.round(calcResults.annualArbitrageRevenueMan).toLocaleString()} 万円
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0"></span>
                    <span className="font-semibold text-slate-700">容量市場 (固定対価)</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">
                    ¥{Math.round(calcResults.annualCapacityMarketRevenueMan).toLocaleString()} 万円
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0"></span>
                    <span className="font-semibold text-slate-700">需給調整市場 (三次②)</span>
                  </div>
                  <span className="font-bold font-mono text-slate-900">
                    ¥{Math.round(calcResults.annualBalancingRevenueMan).toLocaleString()} 万円
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 24-Hour Profile Illustration (Charge Zone vs Discharge Peak) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between">
              <span>日内運用カーブ（JEPX価格＆蓄電池充放電パターン）</span>
              <span className="text-[10px] text-slate-400 font-mono">00:00 〜 24:00 (30分コマ)</span>
            </h3>

            <div className="h-40 bg-slate-50 rounded-xl p-3 border border-slate-100 relative flex flex-col justify-between">
              {/* Top labels */}
              <div className="flex justify-between text-[10px] text-slate-400 border-b border-slate-200 pb-1">
                <span>00:00</span>
                <span>06:00</span>
                <span className="text-blue-600 font-bold">11:00〜14:00 (充電帯)</span>
                <span className="text-rose-600 font-bold">17:00〜20:00 (放電帯)</span>
                <span>24:00</span>
              </div>

              {/* Graphic Representation */}
              <div className="flex-1 flex items-end gap-1 pt-2 pb-1">
                {/* 24 vertical bars representing typical hour profile */}
                {[
                  8, 7, 7, 7, 8, 10, 14, 18, 12, 5, 2, 0.01, 0.01, 0.01, 3, 9, 16, 25, 27, 24, 19, 14, 11, 9
                ].map((price, idx) => {
                  const isChargingZone = idx >= 10 && idx <= 13;
                  const isDischargingZone = idx >= 17 && idx <= 19;
                  const heightPct = Math.min(100, (price / 28) * 100);

                  return (
                    <div key={idx} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-t-sm transition-all ${
                          isChargingZone
                            ? 'bg-sky-400 group-hover:bg-sky-500'
                            : isDischargingZone
                            ? 'bg-rose-500 group-hover:bg-rose-600'
                            : 'bg-slate-300'
                        }`}
                      />
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-1 text-[9px] bg-slate-900 text-white px-1.5 py-0.5 rounded pointer-events-none whitespace-nowrap z-20">
                        {idx}:00 ｜ {price}円
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom legend */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2 bg-sky-400 rounded-xs"></span>
                  昼間充電：余剰太陽光・0.01円JEPX電力を吸収
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2 bg-rose-500 rounded-xs"></span>
                  夕方放電：ピーク価格帯（{eveningPeakPriceYen}円/kWh）で逆潮流
                </span>
              </div>
            </div>
          </div>

          {/* Regulatory & Advisory Notice */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">
                系統連系・広域機関（OCCTO）ルールおよびFIP制度上の留意点
              </span>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                本シミュレーターの数値は、経済産業省資源エネルギー庁の出力制御ルール、JEPX過去実績スポット価格中央値、および容量市場メインオークション約定結果をモデル化しています。実際の系統用蓄電池の連系検討にあたっては、各一般送配電事業者による「系統空き容量調査（ノンファーム連系受電）」および消防法事前協議が必要となります。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
