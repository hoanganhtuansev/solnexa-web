import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  Layers,
  FileText,
  Printer,
  BookmarkCheck,
  CheckCircle2,
  Info,
  Maximize2,
  Compass,
  ArrowRight
} from 'lucide-react';

interface BessFireSafetyCalculatorProps {
  onOpenContact?: () => void;
  isLoggedIn?: boolean;
}

export const BessFireSafetyCalculator: React.FC<BessFireSafetyCalculatorProps> = ({
  onOpenContact,
  isLoggedIn
}) => {
  // Preset benchmarks
  const [containerType, setContainerType] = useState<'20ft' | '40ft' | 'custom'>('20ft');
  const [containerCount, setContainerCount] = useState<number>(2);
  const [batteryChemistry, setBatteryChemistry] = useState<'LFP' | 'NMC'>('LFP');
  const [totalCapacityKwh, setTotalCapacityKwh] = useState<number>(4000);
  
  // Distances (meters)
  const [boundaryDistanceM, setBoundaryDistanceM] = useState<number>(3.5);
  const [buildingDistanceM, setBuildingDistanceM] = useState<number>(3.2);
  const [interContainerSpacingM, setInterContainerSpacingM] = useState<number>(1.2);
  const [hasFireWall, setHasFireWall] = useState<boolean>(false);
  const [fireWallSpec, setFireWallSpec] = useState<'NONE' | 'CONCRETE_100MM' | 'STEEL_NON_COMBUSTIBLE'>('NONE');
  
  // Fire detection & suppression
  const [hasGasSuppression, setHasGasSuppression] = useState<boolean>(true);
  const [hasGasDetection, setHasGasDetection] = useState<boolean>(true);

  const [savedToDossier, setSavedToDossier] = useState<boolean>(false);

  // Preset Handler
  const handleSelectPreset = (preset: '20ft_2mwh' | '40ft_8mwh' | 'utility_10mwh' | 'ci_500kwh') => {
    if (preset === '20ft_2mwh') {
      setContainerType('20ft');
      setContainerCount(1);
      setBatteryChemistry('LFP');
      setTotalCapacityKwh(2000);
      setBoundaryDistanceM(3.5);
      setBuildingDistanceM(4.0);
      setInterContainerSpacingM(1.2);
      setHasFireWall(false);
    } else if (preset === '40ft_8mwh') {
      setContainerType('40ft');
      setContainerCount(2);
      setBatteryChemistry('LFP');
      setTotalCapacityKwh(8146);
      setBoundaryDistanceM(3.2);
      setBuildingDistanceM(3.5);
      setInterContainerSpacingM(1.5);
      setHasFireWall(false);
    } else if (preset === 'utility_10mwh') {
      setContainerType('40ft');
      setContainerCount(3);
      setBatteryChemistry('LFP');
      setTotalCapacityKwh(12000);
      setBoundaryDistanceM(2.0); // Intentionally narrow to show fire wall requirement!
      setBuildingDistanceM(2.2);
      setInterContainerSpacingM(1.2);
      setHasFireWall(true);
      setFireWallSpec('CONCRETE_100MM');
    } else {
      setContainerType('20ft');
      setContainerCount(1);
      setBatteryChemistry('LFP');
      setTotalCapacityKwh(500);
      setBoundaryDistanceM(3.0);
      setBuildingDistanceM(3.0);
      setInterContainerSpacingM(1.0);
      setHasFireWall(false);
    }
  };

  // Regulatory Evaluation Logic per Fire Service Act & Fire Prevention Ordinance
  const evaluation = useMemo(() => {
    const isExceeding4800Kwh = totalCapacityKwh >= 4800;
    
    // Required Boundary Distance
    // Standard rule: 3.0m minimum holding space (保有空地).
    // If reinforced fire wall exists (耐火壁 厚さ100mm以上), boundary can be relaxed to 1.0m.
    const minRequiredBoundaryM = (hasFireWall && fireWallSpec === 'CONCRETE_100MM') ? 1.0 : 3.0;
    const isBoundaryOk = boundaryDistanceM >= minRequiredBoundaryM;

    // Adjacent building clearance
    const minRequiredBuildingM = (hasFireWall && fireWallSpec !== 'NONE') ? 1.5 : 3.0;
    const isBuildingOk = buildingDistanceM >= minRequiredBuildingM;

    // Inter-container clearance (for emergency egress & maintenance)
    const minInterContainerM = 0.8;
    const isInterContainerOk = interContainerSpacingM >= minInterContainerM;

    // Overall Status
    const isCompliant = isBoundaryOk && isBuildingOk && isInterContainerOk;
    
    // Fire Dept Consultation Status
    let consultationPriority = '届出（着工7日前）';
    if (isExceeding4800Kwh || !hasFireWall && boundaryDistanceM < 3.0) {
      consultationPriority = '消防署 事前協議 必須（重点審査）';
    }

    return {
      isExceeding4800Kwh,
      minRequiredBoundaryM,
      isBoundaryOk,
      minRequiredBuildingM,
      isBuildingOk,
      minInterContainerM,
      isInterContainerOk,
      isCompliant,
      consultationPriority,
      holdingSpaceStatus: boundaryDistanceM >= 3.0 ? 'PASS (3m以上保有)' : hasFireWall ? 'RELAXED (耐火壁緩和適用)' : 'NG (保有空地不足)'
    };
  }, [
    totalCapacityKwh,
    boundaryDistanceM,
    buildingDistanceM,
    interContainerSpacingM,
    hasFireWall,
    fireWallSpec
  ]);

  const handleSaveToDossier = () => {
    try {
      const existing = localStorage.getItem('solnexa_engineering_dossier');
      const dossierList = existing ? JSON.parse(existing) : [];
      const item = {
        id: `bess-fire-${Date.now()}`,
        toolId: 'bess-fire-safety',
        toolTitle: 'BESS 消防法 離隔距離 & 保有空地判定',
        timestamp: Date.now(),
        dateStr: new Date().toLocaleString('ja-JP'),
        summary: `蓄電池容量: ${totalCapacityKwh.toLocaleString()}kWh (${containerCount}基) ｜ 敷地境界離隔: ${boundaryDistanceM}m ｜ 判定: ${evaluation.isCompliant ? 'PASS' : 'REVIEW'}`,
        data: {
          capacityKwh: `${totalCapacityKwh.toLocaleString()} kWh`,
          batteryType: `${batteryChemistry} (${containerType} x ${containerCount}基)`,
          boundaryDistanceM: `${boundaryDistanceM} m (要求: ${evaluation.minRequiredBoundaryM}m)`,
          buildingDistanceM: `${buildingDistanceM} m`,
          holdingSpaceStatus: evaluation.holdingSpaceStatus,
          fireWallSpec: hasFireWall ? fireWallSpec : 'なし',
          consultationPriority: evaluation.consultationPriority,
          status: evaluation.isCompliant ? 'PASS' : 'NG'
        }
      };
      const updated = [item, ...dossierList.filter((d: any) => d.toolId !== 'bess-fire-safety')];
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
      <div className="bg-gradient-to-r from-[#002B49] via-[#0b3c63] to-[#124e78] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-rose-500/20 border border-rose-400/30 rounded-lg text-rose-300">
                <ShieldAlert className="w-5 h-5 text-rose-300" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                FIRE SERVICE LAW ｜ 消防危第2号・市町村火災予防条例準拠
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>BESS 消防法 離隔距離 ＆ 保有空地チェッカー</span>
              <span className="text-xs sm:text-sm font-normal text-slate-300 hidden sm:inline">
                (Fire Safety Clearance &amp; Holding Space)
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              系統用蓄電池（BESS）の設置時に必須となる<strong>消防法第17条・消防危第2号・市町村火災予防条例</strong>に基づく「3m保有空地」「敷地境界・隣接建物離隔距離」および「耐火壁設置による緩和要件」を即座に自動判定。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleSaveToDossier}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold backdrop-blur-xs border transition-all cursor-pointer ${
                savedToDossier
                  ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border-emerald-400/30'
              }`}
            >
              <BookmarkCheck className="w-4 h-4 text-emerald-300" />
              <span>{savedToDossier ? '技術計算書に追加完了！' : '技術計算書に追加'}</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>A4印刷 / 提出用PDF</span>
            </button>
          </div>
        </div>

        {/* Regulatory threshold reminder */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-300">
          <Info className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            蓄電池容量が<strong>4,800 kWh以上</strong>の場合、消防庁通達により「点検スペース・自動消火・常時監視装置」等の強化安全基準および消防署事前協議が必須となります。
          </span>
        </div>
      </div>

      {/* Preset Quick Benchmarks */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            実務ベンチマーク プリセット (ワンクリック適用)
          </span>
          <span className="text-[11px] text-slate-400">国内実稼働プロジェクト基準</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleSelectPreset('20ft_2mwh')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              totalCapacityKwh === 2000 && containerType === '20ft'
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">20ft 2MWh (標準)</span>
            <span className="text-[10px] text-slate-500">千葉サイト基準 / 3.5m空地</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('40ft_8mwh')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              totalCapacityKwh === 8146
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">40ft 8.146MWh (特高)</span>
            <span className="text-[10px] text-slate-500">埼玉サイト基準 / 2基並列</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('utility_10mwh')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              totalCapacityKwh === 12000
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">12MWh + 耐火壁設置</span>
            <span className="text-[10px] text-slate-500">境界2m狭小地 / 耐火壁緩和</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPreset('ci_500kwh')}
            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
              totalCapacityKwh === 500
                ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold'
                : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-xs block font-bold">高圧 500kWh (自家消費)</span>
            <span className="text-[10px] text-slate-500">工場敷地内キュービクル式</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters Inputs (Left 5 cols) & Evaluation & Visual Schematic (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Input Parameters Form */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">
              設備仕様・離隔パラメータ入力
            </h2>
            <p className="text-[11px] text-slate-500">
              蓄電池コンテナ寸法、離隔距離、耐火壁の有無を設定
            </p>
          </div>

          {/* 1. Container & Capacity */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  コンテナ規格
                </label>
                <select
                  value={containerType}
                  onChange={e => setContainerType(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="20ft">20ft (約6.06m x 2.44m)</option>
                  <option value="40ft">40ft (約12.19m x 2.44m)</option>
                  <option value="custom">小型キュービクル (3.0m x 2.0m)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  設置コンテナ基数
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={containerCount}
                  onChange={e => setContainerCount(Math.max(1, Number(e.target.value)))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  セル種別 (Chemistry)
                </label>
                <select
                  value={batteryChemistry}
                  onChange={e => setBatteryChemistry(e.target.value as any)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                >
                  <option value="LFP">LFP (リン酸鉄リチウム・高熱安定)</option>
                  <option value="NMC">NMC (三元系リチウム・高密度)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  総蓄電容量 (kWh)
                </label>
                <input
                  type="number"
                  step={100}
                  value={totalCapacityKwh}
                  onChange={e => setTotalCapacityKwh(Number(e.target.value))}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-blue-900"
                />
              </div>
            </div>
          </div>

          {/* 2. Measured Clearances (meters) */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              実測離隔距離 (CLEARANCE METRICS)
            </span>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700">
                  敷地境界線までの最短距離
                </label>
                <span className={`font-mono font-bold ${evaluation.isBoundaryOk ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {boundaryDistanceM.toFixed(1)} m {evaluation.isBoundaryOk ? '✓ 適合' : '✗ 不足'}
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.1}
                value={boundaryDistanceM}
                onChange={e => setBoundaryDistanceM(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400">
                原則3.0m以上（耐火壁設置時1.0m緩和）。現在要求値: {evaluation.minRequiredBoundaryM.toFixed(1)}m
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700">
                  隣接建築物・特高受変電までの距離
                </label>
                <span className={`font-mono font-bold ${evaluation.isBuildingOk ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {buildingDistanceM.toFixed(1)} m {evaluation.isBuildingOk ? '✓ 適合' : '✗ 不足'}
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={8.0}
                step={0.1}
                value={buildingDistanceM}
                onChange={e => setBuildingDistanceM(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400">
                延焼防止のための外壁離隔。基準値: 3.0m以上
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label className="font-semibold text-slate-700">
                  コンテナ相互間の点検・離隔距離
                </label>
                <span className={`font-mono font-bold ${evaluation.isInterContainerOk ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {interContainerSpacingM.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={4.0}
                step={0.1}
                value={interContainerSpacingM}
                onChange={e => setInterContainerSpacingM(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <span className="text-[10px] text-slate-400">
                点検歩廊・排気拡散基準（0.8m以上推奨）
              </span>
            </div>
          </div>

          {/* 3. Fire Wall & Mitigation Measures */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              防火設備・耐火壁（MITIGATION WALL）
            </span>

            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-xs font-semibold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasFireWall}
                  onChange={e => {
                    setHasFireWall(e.target.checked);
                    if (e.target.checked && fireWallSpec === 'NONE') {
                      setFireWallSpec('CONCRETE_100MM');
                    }
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>耐火壁（防火隔壁）を境界または隣接側に設置する</span>
              </label>

              {hasFireWall && (
                <div className="pl-6 space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block">
                    耐火壁の仕様
                  </label>
                  <select
                    value={fireWallSpec}
                    onChange={e => setFireWallSpec(e.target.value as any)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-medium"
                  >
                    <option value="CONCRETE_100MM">
                      鉄筋コンクリート造（厚さ100mm以上・完全耐火構造）
                    </option>
                    <option value="STEEL_NON_COMBUSTIBLE">
                      不燃材料造隔壁（厚さ50mm以上不燃ボード）
                    </option>
                  </select>
                  <span className="text-[10px] text-emerald-700 font-semibold block">
                    ※ 鉄筋コンクリート造耐火壁の設置により、境界離隔基準が 3.0m ➡️ 1.0m に法的に緩和されます。
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Evaluation Cards & 2D Layout Visualization (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Status Verdict Header Card */}
          <div className={`p-5 rounded-2xl border-2 transition-all shadow-sm ${
            evaluation.isCompliant
              ? 'bg-emerald-50/60 border-emerald-400'
              : 'bg-rose-50/60 border-rose-400'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {evaluation.isCompliant ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                )}
                <div>
                  <h3 className={`text-base font-bold ${evaluation.isCompliant ? 'text-emerald-950' : 'text-rose-950'}`}>
                    {evaluation.isCompliant ? '【判定：PASS】消防法・離隔基準に適合' : '【判定：NG】保有空地・離隔距離が不足'}
                  </h3>
                  <span className={`text-xs ${evaluation.isCompliant ? 'text-emerald-700' : 'text-rose-700'}`}>
                    保有空地状態: {evaluation.holdingSpaceStatus} ｜ 消防署事前協議: {evaluation.consultationPriority}
                  </span>
                </div>
              </div>

              <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-full ${
                evaluation.isCompliant
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}>
                {evaluation.isCompliant ? '基準適合' : '要レイアウト修正'}
              </span>
            </div>

            {/* Checklist items */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 mt-3 border-t border-black/10 text-xs">
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">敷地境界離隔</span>
                <strong className={`text-sm font-mono ${evaluation.isBoundaryOk ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {boundaryDistanceM} m / 要求 {evaluation.minRequiredBoundaryM} m
                </strong>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">隣接建築物離隔</span>
                <strong className={`text-sm font-mono ${evaluation.isBuildingOk ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {buildingDistanceM} m / 要求 {evaluation.minRequiredBuildingM} m
                </strong>
              </div>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block">4,800kWh通達判定</span>
                <strong className={`text-sm font-mono ${evaluation.isExceeding4800Kwh ? 'text-amber-800' : 'text-slate-800'}`}>
                  {evaluation.isExceeding4800Kwh ? '4,800kWh以上（強化基準）' : '標準基準適用'}
                </strong>
              </div>
            </div>
          </div>

          {/* 2D Clearance Schematic Visualizer */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  2D 保有空地 ＆ 離隔レイアウト模式図 (2D CLEARANCE PLAN)
                </h4>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                縮尺イメージ（上空見下げ）
              </span>
            </div>

            {/* Visual SVG schematic */}
            <div className="w-full h-56 bg-slate-900 rounded-xl relative overflow-hidden flex items-center justify-center p-4 select-none">
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px]" />
              
              {/* Site Boundary Line */}
              <div className="absolute left-4 top-4 bottom-4 w-1 border-l-2 border-dashed border-amber-400 flex flex-col justify-between py-2 text-[9px] font-mono text-amber-300">
                <span className="rotate-90 origin-left ml-2 whitespace-nowrap">敷地境界線</span>
              </div>

              {/* Fire wall if present */}
              {hasFireWall && (
                <div className="absolute left-10 top-6 bottom-6 w-2 bg-rose-500 rounded shadow-lg flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white rotate-90 whitespace-nowrap">耐火壁 100mm</span>
                </div>
              )}

              {/* Clearance Buffer Zone Indicator */}
              <div 
                style={{ left: hasFireWall ? '48px' : '20px', width: `${Math.min(180, Math.max(40, boundaryDistanceM * 35))}px` }}
                className={`absolute top-8 bottom-8 rounded border border-dashed flex items-center justify-center text-[10px] font-mono ${
                  evaluation.isBoundaryOk ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300' : 'bg-rose-500/15 border-rose-400 text-rose-300'
                }`}
              >
                <span>離隔 {boundaryDistanceM}m</span>
              </div>

              {/* Containers Schematic */}
              <div className="flex items-center gap-3 z-10 ml-28">
                {Array.from({ length: Math.min(3, containerCount) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-24 h-36 bg-gradient-to-b from-blue-700 to-slate-800 rounded-lg border border-blue-400/60 shadow-xl flex flex-col justify-between p-2 text-white text-center"
                  >
                    <div className="flex items-center justify-between text-[9px] font-mono text-blue-200">
                      <span>BESS #{i + 1}</span>
                      <span>{containerType}</span>
                    </div>
                    <div>
                      <span className="text-xs font-bold font-mono block text-amber-300">
                        {Math.round(totalCapacityKwh / containerCount)} kWh
                      </span>
                      <span className="text-[9px] text-slate-300 font-mono">{batteryChemistry}</span>
                    </div>
                    <div className="text-[8px] bg-white/10 rounded py-0.5 font-mono text-emerald-300">
                      自動消火 完備
                    </div>
                  </div>
                ))}
              </div>

              {/* Legend right */}
              <div className="absolute right-3 top-3 bottom-3 flex flex-col justify-between text-right text-[9px] font-mono text-slate-400">
                <span className="text-amber-300">-- 敷地境界</span>
                <span className="text-emerald-400">■ 3m保有空地ゾーン</span>
                <span className="text-blue-300">■ BESS コンテナ</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              ※ 本模式図は消防危第2号の基準配置を表したものです。敷地形状や地方自治体の「火災予防条例」（東京都、大阪府、神奈川県等）によって、離隔規定の上乗せ基準が存在する場合があります。
            </p>
          </div>

          {/* Action Checklist for Fire Department Consultation */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>所轄消防署 事前協議・提出書類チェックリスト（実務手引き）</span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-slate-900 block">蓄電池設備設置届出書（着工7日前提出）</strong>
                  <span className="text-slate-500 text-[11px]">設置場所の配置図、保有空地実測図、キュービクル承認図を添付。</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">2</span>
                <div>
                  <strong className="text-slate-900 block">不燃構造・耐火構造認定書（耐火壁適用時）</strong>
                  <span className="text-slate-500 text-[11px]">国土交通大臣認定番号（耐火1時間認定など）および基礎構造計算書。</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-200">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-slate-900 block">緊急時自動停止 ＆ 可燃性ガス排出換気系統図</strong>
                  <span className="text-slate-500 text-[11px]">BMS異常検知時の系統解列および空調ダンパー遮断シーケンス。</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
