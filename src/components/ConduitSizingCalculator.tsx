import React, { useState, useMemo } from 'react';
import {
  Box,
  CheckCircle2,
  AlertTriangle,
  Info,
  Download,
  Copy,
  Layers,
  ArrowRight,
  Shield,
  HelpCircle,
  FileSpreadsheet,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  ConduitFamily,
  CONDUIT_SPECS_DATABASE,
  CABLE_DIMENSIONS_LIBRARY,
  CableDimensionSpec,
  calculateConduitSizing,
  calculateMultiCableConduitSizing,
  MultiCableItemInput
} from '../utils/japaneseStandards';
import { Plus, Trash2, Sliders, AlertCircle } from 'lucide-react';

interface ConduitSizingCalculatorProps {
  onSaveToProject?: (calcData: any) => void;
  onOpenProject?: (projectId: string) => void;
}

export const ConduitSizingCalculator: React.FC<ConduitSizingCalculatorProps> = ({
  onSaveToProject,
  onOpenProject
}) => {
  // Mode: Single Cable Sizing vs Multi-Cable Combined Piping (gk-haikan-2)
  const [calcMode, setCalcMode] = useState<'single' | 'multi'>('multi');

  // Conduit Family State
  const [selectedFamily, setSelectedFamily] = useState<ConduitFamily>('STEEL_THICK_G');

  // Single Cable Selection State
  const [cableCategory, setCableCategory] = useState<'SOLAR_DC' | '600V_CV_1C' | '600V_CVT' | 'IV' | '6.6KV_CVT'>('SOLAR_DC');
  const [selectedCableIndex, setSelectedCableIndex] = useState<number>(1); // e.g. 6mm²
  const [cableCount, setCableCount] = useState<number>(4);
  const [customDiaActive, setCustomDiaActive] = useState<boolean>(false);
  const [customOuterDiaMm, setCustomOuterDiaMm] = useState<number>(6.2);

  // Multi-Cable Combined State (isijp gk-haikan-2)
  const [multiCables, setMultiCables] = useState<MultiCableItemInput[]>([
    { id: '1', name: 'PV String DC (+/-)', category: 'SOLAR_DC', sizeSq: '6 mm²', outerDiaMm: 6.2, count: 4 },
    { id: '2', name: 'Grounding Conductor (アース接地線)', category: 'IV', sizeSq: '5.5 sq', outerDiaMm: 5.0, count: 1 }
  ]);

  // Route & Installation conditions (isijp gk-haikan-2)
  const [routeLengthM, setRouteLengthM] = useState<number>(25);
  const [bendsCount90Deg, setBendsCount90Deg] = useState<number>(1);
  const [runCondition, setRunCondition] = useState<'SAME_SIZE_STRAIGHT' | 'CURVED_OR_DIFFERENT_SIZES'>('CURVED_OR_DIFFERENT_SIZES');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter available cables by selected category
  const availableCables = useMemo(() => {
    return CABLE_DIMENSIONS_LIBRARY.filter(c => c.cableType === cableCategory);
  }, [cableCategory]);

  const activeCable = useMemo(() => {
    return availableCables[selectedCableIndex] || availableCables[0];
  }, [availableCables, selectedCableIndex]);

  const effectiveOuterDiaMm = customDiaActive ? customOuterDiaMm : (activeCable?.outerDiaMm || 6.2);

  // Single Cable Calculation Output
  const singleCalcResult = useMemo(() => {
    return calculateConduitSizing(
      selectedFamily,
      effectiveOuterDiaMm,
      cableCount,
      runCondition
    );
  }, [selectedFamily, effectiveOuterDiaMm, cableCount, runCondition]);

  // Multi-Cable Calculation Output
  const multiCalcResult = useMemo(() => {
    return calculateMultiCableConduitSizing(
      selectedFamily,
      multiCables,
      bendsCount90Deg > 0,
      routeLengthM,
      bendsCount90Deg
    );
  }, [selectedFamily, multiCables, routeLengthM, bendsCount90Deg]);

  // Active result based on mode
  const isMulti = calcMode === 'multi';
  const calculationResult = isMulti ? {
    recommendedConduit: multiCalcResult.recommendedConduit,
    actualOccupancyPercent: multiCalcResult.actualOccupancyPercent,
    isRecommendedCompliant: multiCalcResult.isRecommendedCompliant,
    occupancyLimitPercent: multiCalcResult.occupancyLimitPercent,
    limitReason: multiCalcResult.limitReason,
    totalCableAreaMm2: multiCalcResult.totalCablesAreaMm2,
    singleCableAreaMm2: 0,
    bundlingCurrentReductionFactor: multiCalcResult.bundlingCurrentReductionFactor,
    comparisonList: multiCalcResult.comparisonList
  } : singleCalcResult;

  // Preset Applicator
  const applyPreset = (presetName: string) => {
    if (presetName === 'pv-dc-earth') {
      setSelectedFamily('FEP_UNDERGROUND');
      setMultiCables([
        { id: '1', name: 'PV String DC (+/-)', category: 'SOLAR_DC', sizeSq: '6 mm²', outerDiaMm: 6.2, count: 6 },
        { id: '2', name: 'Earth IV (接地線)', category: 'IV', sizeSq: '5.5 sq', outerDiaMm: 5.0, count: 1 }
      ]);
      setRouteLengthM(35);
      setBendsCount90Deg(2);
      setCalcMode('multi');
      showToast('Loaded Preset: 太陽光DC 6条 + アース線 (FEP管地中埋設)');
    } else if (presetName === 'inverter-ac-earth') {
      setSelectedFamily('STEEL_THICK_G');
      setMultiCables([
        { id: '1', name: 'Inverter AC (CVT)', category: '600V_CVT', sizeSq: '100 sq', outerDiaMm: 39.0, count: 1 },
        { id: '2', name: 'Grounding IV (接地線)', category: 'IV', sizeSq: '14 sq', outerDiaMm: 7.6, count: 1 }
      ]);
      setRouteLengthM(18);
      setBendsCount90Deg(1);
      setCalcMode('multi');
      showToast('Loaded Preset: パワコンAC主幹 CVT 100sq + 接地線 (厚鋼G管)');
    } else if (presetName === 'mv-6.6kv') {
      setSelectedFamily('FEP_UNDERGROUND');
      setMultiCables([
        { id: '1', name: '高圧受電 6.6kV CVT', category: '6.6KV_CVT', sizeSq: '100 sq', outerDiaMm: 51.0, count: 1 }
      ]);
      setRouteLengthM(45);
      setBendsCount90Deg(3);
      setCalcMode('multi');
      showToast('Loaded Preset: 高圧6.6kV CVT 100sq (FEP管長距離地中)');
    } else if (presetName === 'branch-iv') {
      setSelectedFamily('STEEL_THREADLESS_E');
      setMultiCables([
        { id: '1', name: '照明・コンセント幹線 IV', category: 'IV', sizeSq: '2.0 mm', outerDiaMm: 3.6, count: 4 },
        { id: '2', name: '接地線 IV', category: 'IV', sizeSq: '1.6 mm', outerDiaMm: 3.2, count: 1 }
      ]);
      setRouteLengthM(15);
      setBendsCount90Deg(1);
      setCalcMode('multi');
      showToast('Loaded Preset: 屋内露出分岐 IV線 5条 (ねじなしE管)');
    }
  };

  const handleAddMultiCable = () => {
    const newId = String(Date.now());
    const defaultCable = availableCables[0] || CABLE_DIMENSIONS_LIBRARY[0];
    setMultiCables(prev => [
      ...prev,
      {
        id: newId,
        name: `Cable #${prev.length + 1} (${defaultCable.sizeSq})`,
        category: cableCategory,
        sizeSq: defaultCable.sizeSq,
        outerDiaMm: defaultCable.outerDiaMm,
        count: 1
      }
    ]);
  };

  const handleRemoveMultiCable = (id: string) => {
    if (multiCables.length <= 1) {
      showToast('少なくとも1本の電線が必要です');
      return;
    }
    setMultiCables(prev => prev.filter(c => c.id !== id));
  };

  const familyLabels: Record<ConduitFamily, { jp: string; en: string; standard: string; desc: string }> = {
    STEEL_THICK_G: {
      jp: '厚鋼電線管 (G管)',
      en: 'Thick Steel Conduit (G)',
      standard: 'JIS C 8305',
      desc: '耐衝撃性・防爆・重防食。屋外プラント・受変電設備・高圧配線に標準採用。'
    },
    STEEL_THREADLESS_E: {
      jp: 'ねじなし電線管 (E管)',
      en: 'Threadless Steel Conduit (E)',
      standard: 'JIS C 8305',
      desc: 'ねじ切り不要の差込式。屋内露出・天井内配線の主流。'
    },
    STEEL_THIN_C: {
      jp: '薄鋼電線管 (C管)',
      en: 'Thin Steel Conduit (C)',
      standard: 'JIS C 8305',
      desc: '一般ねじ付き鋼製管。軽量で屋内露出配管に広く使用。'
    },
    PVC_VE: {
      jp: '硬質ビニル電線管 (VE管)',
      en: 'Rigid PVC Conduit (VE)',
      standard: 'JIS C 8430',
      desc: '耐腐食性・絶縁性。化学環境、露出湿気場所、屋外露出に最適。'
    },
    FLEXIBLE_PF_CD: {
      jp: '可とう電線管 (PF管 / CD管)',
      en: 'Flexible Conduit (PF/CD)',
      standard: 'JIS C 8411',
      desc: '可とう性抜群。PF管は屋外・隠ぺい配線、CD管はコンクリート埋設専用。'
    },
    FEP_UNDERGROUND: {
      jp: '波付硬質合成樹脂管 (FEP管)',
      en: 'Corrugated Underground Pipe (FEP)',
      standard: 'JIS C 3653',
      desc: '太陽光発電・BESS・特別高圧の地中埋設幹線配管のデファクトスタンダード。'
    }
  };

  // Export CSV Schedule
  const handleExportCsv = () => {
    let csv = `ISIJ-JP Standards - Conduit Sizing & Occupancy Schedule\n`;
    csv += `Standard,JIS C 8305 / JIS C 8430 / JIS C 3653 / JEAC 8001 (内線規程)\n`;
    csv += `Selected Pipe Family,${familyLabels[selectedFamily].jp} (${familyLabels[selectedFamily].standard})\n`;
    csv += `Cable Type,${activeCable?.label || 'Custom Cable'},Size,${activeCable?.sizeSq || 'Custom'}\n`;
    csv += `Cable Outer Diameter,${effectiveOuterDiaMm} mm,Cables Count,${cableCount} 本\n`;
    csv += `Single Cable Area,${calculationResult.singleCableAreaMm2} mm²,Total Cable Area,${calculationResult.totalCableAreaMm2} mm²\n`;
    csv += `Occupancy Limit,${calculationResult.occupancyLimitPercent}%,Condition,${calculationResult.limitReason}\n`;
    csv += `Bundling Derating Factor,${calculationResult.bundlingCurrentReductionFactor} (電流減少係数)\n`;
    csv += `Recommended Pipe,${calculationResult.recommendedConduit.code},Actual Occupancy,${calculationResult.actualOccupancyPercent}%\n\n`;

    csv += `Conduit Code,Outer Dia (mm),Inner Dia (mm),Inner Area (mm²),Allowable Area (mm²),Actual Occupancy (%),Remaining Area (mm²),Status\n`;
    calculationResult.comparisonList.forEach(row => {
      const allowedArea = (row.conduit.innerAreaMm2 * calculationResult.occupancyLimitPercent / 100).toFixed(1);
      csv += `"${row.conduit.code}",${row.conduit.outerDiaMm},${row.conduit.innerDiaMm},${row.conduit.innerAreaMm2},${allowedArea},${row.occupancyPercent}%,${row.remainingAreaMm2},"${row.status}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SOLNEXA_Conduit_Sizing_${calculationResult.recommendedConduit.code}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Conduit sizing CSV schedule exported successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Reference Notes */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  電線管サイズ選定・配管占有率計算 (Conduit Sizing &amp; Occupancy)
                </h2>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  内線規程 JEAC 8001 / isijp.com
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  JIS C 8305 / 8430 / 3653
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                ケーブル外径と電線管の内断面積から、内線規程に準拠した許容占有率（同一太さ: 48%以下、屈曲部・異線混在: 32%以下）および多条敷設の電流減少係数を自動算定します。
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start lg:self-auto">
            {/* Quick Engineering Presets */}
            <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[10px] font-bold text-slate-500 px-2">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset('pv-dc-earth')}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg font-medium shadow-xs text-[11px]"
              >
                PV DC+アース
              </button>
              <button
                type="button"
                onClick={() => applyPreset('inverter-ac-earth')}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg font-medium shadow-xs text-[11px]"
              >
                AC主幹 CVT+接地
              </button>
              <button
                type="button"
                onClick={() => applyPreset('mv-6.6kv')}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg font-medium shadow-xs text-[11px]"
              >
                6.6kV CVT
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Calculation Mode Toggle (Single Cable vs Multi-Cable Combined) */}
        <div className="flex items-center space-x-2 pt-3 border-t border-slate-100 mt-3">
          <span className="text-xs font-bold text-slate-600">検討モード (Calculation Mode):</span>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setCalcMode('multi')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcMode === 'multi'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              複数電線・多条混在配管 (isijp gk-haikan-2 準拠)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('single')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcMode === 'single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              単一電線サイズ (gk-haikan-1)
            </button>
          </div>
        </div>

        {/* 6 Conduit Family Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-4 mt-4 border-t border-slate-100">
          {(
            [
              'STEEL_THICK_G',
              'STEEL_THREADLESS_E',
              'STEEL_THIN_C',
              'PVC_VE',
              'FLEXIBLE_PF_CD',
              'FEP_UNDERGROUND'
            ] as ConduitFamily[]
          ).map(f => {
            const isSelected = selectedFamily === f;
            const meta = familyLabels[f];
            return (
              <button
                key={f}
                onClick={() => setSelectedFamily(f)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>
                    {meta.standard}
                  </span>
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />}
                </div>
                <div className="text-xs font-bold text-slate-900 mt-1 truncate">
                  {meta.jp.split(' ')[0]}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {meta.jp.split(' ')[1] || meta.en}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 2-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Inputs & Parameters */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Cable Specifications & Multi-Cable Builder */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center">
                  1
                </span>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {calcMode === 'multi' ? 'Multi-Cable List / 収容電線一覧' : 'Cable Specifications / 収容電線'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {calcMode === 'multi' ? 'isijp gk-haikan-2 異線・多条混在計算' : '単一電線・仕上外径'}
                  </p>
                </div>
              </div>

              {calcMode === 'multi' && (
                <button
                  type="button"
                  onClick={handleAddMultiCable}
                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 電線追加</span>
                </button>
              )}
            </div>

            {/* MULTI-CABLE BUILDER VIEW */}
            {calcMode === 'multi' ? (
              <div className="space-y-3 text-xs">
                <div className="space-y-2">
                  {multiCables.map((c, idx) => {
                    const singleArea = Number(((Math.PI * Math.pow(c.outerDiaMm, 2)) / 4).toFixed(1));
                    const subtotalArea = Number((singleArea * c.count).toFixed(1));
                    return (
                      <div
                        key={c.id}
                        className="p-3 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={c.name}
                            onChange={e => {
                              const val = e.target.value;
                              setMultiCables(prev => prev.map(item => item.id === c.id ? { ...item, name: val } : item));
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 flex-1 mr-2"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveMultiCable(c.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Remove Cable"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-12 gap-2 text-[11px] items-center">
                          <div className="col-span-5">
                            <label className="text-[10px] text-slate-500 block">種別・規格</label>
                            <select
                              value={c.sizeSq}
                              onChange={e => {
                                const selectedSpec = CABLE_DIMENSIONS_LIBRARY.find(lib => lib.sizeSq === e.target.value);
                                if (selectedSpec) {
                                  setMultiCables(prev => prev.map(item => item.id === c.id ? {
                                    ...item,
                                    sizeSq: selectedSpec.sizeSq,
                                    outerDiaMm: selectedSpec.outerDiaMm,
                                    category: selectedSpec.cableType
                                  } : item));
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 text-[11px] font-medium"
                            >
                              {CABLE_DIMENSIONS_LIBRARY.map((lib, libIdx) => (
                                <option key={libIdx} value={lib.sizeSq}>
                                  {lib.cableType.replace('_', ' ')}: {lib.sizeSq} (φ{lib.outerDiaMm}mm)
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-span-3">
                            <label className="text-[10px] text-slate-500 block">外径 (mm)</label>
                            <input
                              type="number"
                              step="0.1"
                              value={c.outerDiaMm}
                              onChange={e => {
                                const val = parseFloat(e.target.value) || 1;
                                setMultiCables(prev => prev.map(item => item.id === c.id ? { ...item, outerDiaMm: val } : item));
                              }}
                              className="w-full bg-white border border-slate-200 rounded px-2 py-1 font-mono text-right"
                            />
                          </div>

                          <div className="col-span-4">
                            <label className="text-[10px] text-slate-500 block">条数 (本)</label>
                            <div className="flex items-center space-x-1">
                              <button
                                type="button"
                                onClick={() => {
                                  if (c.count > 1) {
                                    setMultiCables(prev => prev.map(item => item.id === c.id ? { ...item, count: item.count - 1 } : item));
                                  }
                                }}
                                className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold flex items-center justify-center text-slate-700"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-center flex-1">{c.count}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setMultiCables(prev => prev.map(item => item.id === c.id ? { ...item, count: item.count + 1 } : item));
                                }}
                                className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 font-bold flex items-center justify-center text-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                          <span>単線断面積: <strong className="font-mono text-slate-700">{singleArea} mm²</strong></span>
                          <span>小計断面積: <strong className="font-mono text-blue-700">{subtotalArea} mm²</strong> ({c.count}本分)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Multi-Cable Total Summary Bar */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-blue-700 font-semibold block uppercase">電線総条数 / 総断面積</span>
                    <span className="text-xs text-blue-900 font-bold">
                      合計: <span className="text-sm font-mono text-blue-950 font-black">{multiCalcResult.totalCablesCount} 本</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-blue-700 font-semibold block uppercase">Σa (Total Cable Area)</span>
                    <span className="text-base font-black font-mono text-blue-950">
                      {multiCalcResult.totalCablesAreaMm2} <span className="text-xs font-normal">mm²</span>
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* SINGLE CABLE VIEW */
              <div className="space-y-3.5 text-xs">
                {/* Category Selector */}
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1.5">
                    Cable Family / ケーブル種別
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'SOLAR_DC', label: 'Solar PV DC (太陽光)' },
                      { id: '600V_CV_1C', label: '600V CV 1心' },
                      { id: '600V_CVT', label: '600V CVT (3心)' },
                      { id: 'IV', label: 'IV (ビニル線)' },
                      { id: '6.6KV_CVT', label: '高圧 6.6kV CVT' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCableCategory(cat.id as any);
                          setSelectedCableIndex(0);
                          setCustomDiaActive(false);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-left transition-colors truncate border ${
                          cableCategory === cat.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cable Size Selector */}
                {!customDiaActive && (
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Conductor Size / 電線サイズ (sq)
                    </label>
                    <select
                      value={selectedCableIndex}
                      onChange={e => setSelectedCableIndex(parseInt(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    >
                      {availableCables.map((c, idx) => (
                        <option key={idx} value={idx}>
                          {c.sizeSq} — 外径: {c.outerDiaMm} mm (断面積: {c.sectionalAreaMm2} mm²)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Custom Diameter Toggle & Input */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700 flex items-center space-x-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customDiaActive}
                        onChange={e => setCustomDiaActive(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Custom Cable Outer Diameter (外径を直接入力)</span>
                    </label>
                  </div>

                  {customDiaActive && (
                    <div className="flex items-center space-x-2 pt-1">
                      <input
                        type="number"
                        step="0.1"
                        min={1}
                        max={120}
                        value={customOuterDiaMm}
                        onChange={e => setCustomOuterDiaMm(parseFloat(e.target.value) || 1)}
                        className="w-28 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900 text-right"
                      />
                      <span className="text-xs text-slate-500">mm (仕上外径)</span>
                    </div>
                  )}
                </div>

                {/* Number of Cables (本数) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Number of Cables in Pipe / 収容本数:
                    </label>
                    <span className="font-mono font-black text-sm text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {cableCount} 本
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={24}
                    value={cableCount}
                    onChange={e => setCableCount(parseInt(e.target.value) || 1)}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>1本 (単線)</span>
                    <span>3本 (三相)</span>
                    <span>4本 (PVストリング組)</span>
                    <span>8本</span>
                    <span>24本</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Route Length, Bends, Pull Box & Installation Conditions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Route &amp; Installation Conditions</h3>
                <p className="text-[10px] text-slate-400">配管長・屈曲箇所・内線規程基準</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Route Length & 90 Bends Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                    <span>Route Length (配管長)</span>
                    <span className="text-[10px] text-slate-400">基準: 30m以下</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={routeLengthM}
                      onChange={e => setRouteLengthM(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-medium">
                      m
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                    <span>90° Bends (曲がり数)</span>
                    <span className="text-[10px] text-slate-400">基準: 3箇所以内</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      value={bendsCount90Deg}
                      onChange={e => setBendsCount90Deg(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono font-bold text-slate-900"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-500 font-medium">
                      箇所
                    </span>
                  </div>
                </div>
              </div>

              {/* Occupancy Rule Display */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Occupancy Limit Rule (内線規程 第3110節)
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {calculationResult.occupancyLimitPercent === 32
                        ? '異なる太さ混在 / 屈曲配管 (32%以下)'
                        : '同一太さ直線管路 (48%以下)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{calculationResult.limitReason}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white text-blue-700 border border-blue-200">
                    {calculationResult.occupancyLimitPercent}%
                  </span>
                </div>
              </div>

              {/* Pull Box Check Alert (isijp gk-haikan-2) */}
              <div className={`p-3 rounded-xl border flex items-start space-x-2.5 text-xs ${
                multiCalcResult.pullBoxRequired
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                {multiCalcResult.pullBoxRequired ? (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-0.5 leading-relaxed">
                  <div className="font-bold flex items-center space-x-1.5">
                    <span>プルボックス (Pull Box) 設置基準:</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      multiCalcResult.pullBoxRequired ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {multiCalcResult.pullBoxRequired ? '要設置 (REQUIRED)' : '不要 (OK)'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">{multiCalcResult.pullBoxReason}</p>
                </div>
              </div>

              {/* Minimum Bending Radius & Bundling Derating */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">最小曲げ半径 (内径×6)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    R ≥ {multiCalcResult.minConduitBendingRadiusMm} mm
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">電流減少係数 (内線規程)</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    × {calculationResult.bundlingCurrentReductionFactor} ({(calculationResult.bundlingCurrentReductionFactor * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): SVG Visualizer, Recommendation & Comparison Table */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Recommendation Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wide font-bold text-slate-400 block">
                  RECOMMENDED MINIMUM CONDUIT SIZE
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {calculationResult.recommendedConduit.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({familyLabels[selectedFamily].jp.split(' ')[0]})
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  内径: <span className="font-mono font-semibold text-slate-800">{calculationResult.recommendedConduit.innerDiaMm} mm</span> | 
                  管内断面積: <span className="font-mono font-semibold text-slate-800">{calculationResult.recommendedConduit.innerAreaMm2} mm²</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1.5 rounded-xl border text-center ${
                  calculationResult.isRecommendedCompliant
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="text-[10px] font-bold uppercase">判定 (VERDICT)</div>
                  <div className="text-base font-black flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                    <span>PASS (合格)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Metric Mini Cards */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                <div className="text-[10px] font-semibold text-slate-500">実占有率 (Actual Occupancy)</div>
                <div className="text-lg font-black font-mono text-blue-600 mt-0.5">
                  {calculationResult.actualOccupancyPercent}%
                </div>
                <div className="text-[9px] text-slate-400">上限: {calculationResult.occupancyLimitPercent}%</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                <div className="text-[10px] font-semibold text-slate-500">電線総断面積 (Total Area)</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  {calculationResult.totalCableAreaMm2} mm²
                </div>
                <div className="text-[9px] text-slate-400">{effectiveOuterDiaMm}mm × {cableCount}本</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                <div className="text-[10px] font-semibold text-slate-500">許容残余面積 (Free Margin)</div>
                <div className="text-lg font-black font-mono text-emerald-600 mt-0.5">
                  {(
                    (calculationResult.recommendedConduit.innerAreaMm2 * calculationResult.occupancyLimitPercent / 100) -
                    calculationResult.totalCableAreaMm2
                  ).toFixed(0)} mm²
                </div>
                <div className="text-[9px] text-slate-400">通線余力</div>
              </div>
            </div>

            {/* Interactive SVG Conduit Cross-Section Simulation */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-800">Conduit Cross-Section View / 配管断面シミュレーション</span>
                <span className="text-[11px] font-mono text-slate-400">1:1 Proportional Scale</span>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-around gap-4 text-white">
                {/* SVG Visualizer */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-full h-full">
                    {/* Conduit Outer Wall */}
                    <circle cx="80" cy="80" r="75" fill="#1e293b" stroke="#475569" strokeWidth="4" />
                    {/* Conduit Inner Wall (Lumen) */}
                    <circle cx="80" cy="80" r="67" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />

                    {/* Cables inside packed in circular formation */}
                    {Array.from({ length: cableCount }).map((_, idx) => {
                      const maxR = 40;
                      let cx = 80;
                      let cy = 80;
                      const singleCableRadius = Math.max(5, Math.min(22, (effectiveOuterDiaMm / calculationResult.recommendedConduit.innerDiaMm) * 55));

                      if (cableCount > 1) {
                        const angle = (idx / cableCount) * (2 * Math.PI);
                        const clusterR = Math.min(38, 20 + cableCount * 1.5);
                        cx = 80 + clusterR * Math.cos(angle);
                        cy = 80 + clusterR * Math.sin(angle);
                      }

                      return (
                        <g key={idx}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={singleCableRadius}
                            fill="#f59e0b"
                            stroke="#fbbf24"
                            strokeWidth="1.5"
                          />
                          <circle cx={cx} cy={cy} r={singleCableRadius * 0.45} fill="#b45309" />
                        </g>
                      );
                    })}

                    {/* Pipe Code Text in Center */}
                    <text x="80" y="84" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" opacity="0.8">
                      {calculationResult.recommendedConduit.code}
                    </text>
                  </svg>
                </div>

                {/* Simulation Legend & Specs */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full border border-sky-400 bg-slate-900 inline-block" />
                    <span className="text-slate-300">
                      管内径: <strong className="text-white font-mono">{calculationResult.recommendedConduit.innerDiaMm} mm</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="text-slate-300">
                      電線外径: <strong className="text-white font-mono">{effectiveOuterDiaMm} mm</strong> × {cableCount}本
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-300">
                      配管占有率: <strong className="text-emerald-400 font-mono">{calculationResult.actualOccupancyPercent}%</strong> (OK)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 pt-1 font-mono">
                    {calculationResult.limitReason}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Conduit Options Comparison Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900">Conduit Size Schedule / 配管サイズ適合一覧</h3>
                <p className="text-[10px] text-slate-500">
                  {familyLabels[selectedFamily].jp} 全サイズの占有率・余力比較表
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                占有率上限: {calculationResult.occupancyLimitPercent}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">呼び径 (Code)</th>
                    <th className="py-2.5 px-2 font-semibold text-right">外径 / 内径</th>
                    <th className="py-2.5 px-2 font-semibold text-right">管内断面積</th>
                    <th className="py-2.5 px-2 font-semibold text-right">許容面積 ({calculationResult.occupancyLimitPercent}%)</th>
                    <th className="py-2.5 px-2 font-semibold text-right">実占有率</th>
                    <th className="py-2.5 px-2 font-semibold text-right">残余余力</th>
                    <th className="py-2.5 px-3 font-semibold text-center">適合判定</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {calculationResult.comparisonList.map(row => {
                    const isRec = row.conduit.code === calculationResult.recommendedConduit.code;
                    const allowedArea = ((row.conduit.innerAreaMm2 * calculationResult.occupancyLimitPercent) / 100).toFixed(0);

                    return (
                      <tr
                        key={row.conduit.code}
                        className={`transition-colors ${
                          isRec ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-2.5 px-3 font-bold text-slate-900 flex items-center space-x-1.5">
                          <span>{row.conduit.code}</span>
                          {isRec && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">
                              推奨
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right text-slate-600">
                          {row.conduit.outerDiaMm} / {row.conduit.innerDiaMm} mm
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right text-slate-600">
                          {row.conduit.innerAreaMm2.toLocaleString()} mm²
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right text-slate-600">
                          {allowedArea} mm²
                        </td>
                        <td className={`py-2.5 px-2 font-mono text-right font-bold ${
                          row.isCompliant ? 'text-blue-600' : 'text-rose-600'
                        }`}>
                          {row.occupancyPercent}%
                        </td>
                        <td className="py-2.5 px-2 font-mono text-right text-slate-600">
                          {row.remainingAreaMm2 > 0 ? `+${row.remainingAreaMm2} mm²` : `${row.remainingAreaMm2} mm²`}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {row.status === 'PASS' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              PASS
                            </span>
                          ) : row.status === 'REVIEW' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              REVIEW
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              FAIL (NG)
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
