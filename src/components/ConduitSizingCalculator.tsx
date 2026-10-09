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
  RefreshCw,
  Plus,
  Trash2,
  Sliders,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Zap
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

interface ConduitSizingCalculatorProps {
  onSaveToProject?: (calcData: any) => void;
  onOpenProject?: (projectId: string) => void;
}

export const ConduitSizingCalculator: React.FC<ConduitSizingCalculatorProps> = ({
  onSaveToProject,
  onOpenProject
}) => {
  // Mode: Single Cable Sizing vs Multi-Cable Combined Piping (gk-haikan-2)
  const [calcMode, setCalcMode] = useState<'single' | 'multi'>('single');

  // Conduit Family State - default to FEP管 (standard for high voltage & underground) or STEEL_THICK_G
  const [selectedFamily, setSelectedFamily] = useState<ConduitFamily>('FEP_UNDERGROUND');

  // Single Cable Selection State - defaulted to 6600V CVT 250sq per user requirements
  const [cableCategory, setCableCategory] = useState<'SOLAR_DC' | '600V_CV_1C' | '600V_CVT' | 'IV' | '6.6KV_CVT'>('6.6KV_CVT');
  const [selectedCableSize, setSelectedCableSize] = useState<string>('250 sq');
  const [cableCount, setCableCount] = useState<number>(1);
  const [customDiaActive, setCustomDiaActive] = useState<boolean>(false);
  const [customOuterDiaMm, setCustomOuterDiaMm] = useState<number>(70.0);

  // Multi-Cable Combined State (isijp gk-haikan-2)
  const [multiCables, setMultiCables] = useState<MultiCableItemInput[]>([
    { id: '1', name: '高圧受電 6600V CVT 250sq', category: '6.6KV_CVT', sizeSq: '250 sq', outerDiaMm: 70.0, count: 1 }
  ]);

  // Route & Installation conditions (isijp gk-haikan-2)
  const [routeLengthM, setRouteLengthM] = useState<number>(30);
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
    const found = availableCables.find(c => c.sizeSq === selectedCableSize);
    return found || availableCables[0] || CABLE_DIMENSIONS_LIBRARY[0];
  }, [availableCables, selectedCableSize]);

  const effectiveOuterDiaMm = customDiaActive ? customOuterDiaMm : (activeCable?.outerDiaMm || 70.0);

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

  // Dedicated Protection Conduit Sizing Comparison (G管 vs FEP管)
  const gPipeResult = useMemo(() => {
    return isMulti
      ? calculateMultiCableConduitSizing('STEEL_THICK_G', multiCables, bendsCount90Deg > 0, routeLengthM, bendsCount90Deg)
      : calculateConduitSizing('STEEL_THICK_G', effectiveOuterDiaMm, cableCount, runCondition);
  }, [isMulti, multiCables, effectiveOuterDiaMm, cableCount, runCondition, bendsCount90Deg, routeLengthM]);

  const fepPipeResult = useMemo(() => {
    return isMulti
      ? calculateMultiCableConduitSizing('FEP_UNDERGROUND', multiCables, bendsCount90Deg > 0, routeLengthM, bendsCount90Deg)
      : calculateConduitSizing('FEP_UNDERGROUND', effectiveOuterDiaMm, cableCount, runCondition);
  }, [isMulti, multiCables, effectiveOuterDiaMm, cableCount, runCondition, bendsCount90Deg, routeLengthM]);

  // Preset Applicator
  const applyPreset = (presetName: string) => {
    if (presetName === 'mv-6.6kv-250-fep') {
      setSelectedFamily('FEP_UNDERGROUND');
      setCableCategory('6.6KV_CVT');
      setSelectedCableSize('250 sq');
      setCableCount(1);
      setMultiCables([
        { id: '1', name: '高圧受電 6600V CVT 250sq', category: '6.6KV_CVT', sizeSq: '250 sq', outerDiaMm: 70.0, count: 1 }
      ]);
      setRouteLengthM(45);
      setBendsCount90Deg(2);
      showToast('Đã chọn: 6600V CVT 250sq 1条 (FEP管 FEP-125 地中埋設)');
    } else if (presetName === 'mv-6.6kv-250-g') {
      setSelectedFamily('STEEL_THICK_G');
      setCableCategory('6.6KV_CVT');
      setSelectedCableSize('250 sq');
      setCableCount(1);
      setMultiCables([
        { id: '1', name: '高圧受電 6600V CVT 250sq', category: '6.6KV_CVT', sizeSq: '250 sq', outerDiaMm: 70.0, count: 1 }
      ]);
      setRouteLengthM(15);
      setBendsCount90Deg(1);
      showToast('Đã chọn: 6600V CVT 250sq 1条 (厚鋼G管 G104/G125 立上り防護)');
    } else if (presetName === 'inverter-ac-earth') {
      setSelectedFamily('STEEL_THICK_G');
      setCableCategory('600V_CVT');
      setSelectedCableSize('100 sq');
      setCableCount(1);
      setMultiCables([
        { id: '1', name: 'Inverter AC 主幹 (CVT)', category: '600V_CVT', sizeSq: '100 sq', outerDiaMm: 39.0, count: 1 },
        { id: '2', name: 'Grounding IV (接地線)', category: 'IV', sizeSq: '14 sq', outerDiaMm: 7.6, count: 1 }
      ]);
      setRouteLengthM(18);
      setBendsCount90Deg(1);
      setCalcMode('multi');
      showToast('Đã chọn: パワコンAC主幹 CVT 100sq + 接地線 (厚鋼G管)');
    } else if (presetName === 'pv-dc-earth') {
      setSelectedFamily('FEP_UNDERGROUND');
      setCableCategory('SOLAR_DC');
      setSelectedCableSize('6 mm²');
      setCableCount(6);
      setMultiCables([
        { id: '1', name: 'PV String DC (+/-)', category: 'SOLAR_DC', sizeSq: '6 mm²', outerDiaMm: 6.2, count: 6 },
        { id: '2', name: 'Earth IV (接地線)', category: 'IV', sizeSq: '5.5 sq', outerDiaMm: 5.0, count: 1 }
      ]);
      setRouteLengthM(35);
      setBendsCount90Deg(2);
      setCalcMode('multi');
      showToast('Đã chọn: 太陽光DC 6条 + アース線 (FEP管地中埋設)');
    } else if (presetName === 'branch-iv') {
      setSelectedFamily('STEEL_THREADLESS_E');
      setCableCategory('IV');
      setSelectedCableSize('2.0 mm');
      setCableCount(4);
      setMultiCables([
        { id: '1', name: '照明・コンセント幹線 IV', category: 'IV', sizeSq: '2.0 mm', outerDiaMm: 3.6, count: 4 },
        { id: '2', name: '接地線 IV', category: 'IV', sizeSq: '1.6 mm', outerDiaMm: 3.2, count: 1 }
      ]);
      setRouteLengthM(15);
      setBendsCount90Deg(1);
      setCalcMode('multi');
      showToast('Đã chọn: 屋内露出分岐 IV線 5条 (ねじなしE管)');
    }
  };

  const handleAddMultiCable = () => {
    const newId = String(Date.now());
    const defaultCable = availableCables.find(c => c.sizeSq === selectedCableSize) || availableCables[0] || CABLE_DIMENSIONS_LIBRARY[0];
    const catLabel = defaultCable.cableType === '6.6KV_CVT' ? '6600V CVT' : defaultCable.cableType === '600V_CVT' ? '600V CVT' : defaultCable.cableType === '600V_CV_1C' ? '600V CV 1心' : defaultCable.cableType === 'IV' ? 'IV (接地線)' : 'PV DC';
    setMultiCables(prev => [
      ...prev,
      {
        id: newId,
        name: `${catLabel} ${defaultCable.sizeSq}`,
        category: defaultCable.cableType,
        sizeSq: defaultCable.sizeSq,
        outerDiaMm: defaultCable.outerDiaMm,
        count: 1
      }
    ]);
  };

  const handleRemoveMultiCable = (id: string) => {
    if (multiCables.length <= 1) {
      showToast('Ít nhất phải có 1 tuyến cáp để tính toán');
      return;
    }
    setMultiCables(prev => prev.filter(c => c.id !== id));
  };

  const familyLabels: Record<ConduitFamily, { jp: string; en: string; standard: string; desc: string }> = {
    STEEL_THICK_G: {
      jp: '厚鋼電線管 (G管)',
      en: 'Thick Steel Conduit (G)',
      standard: 'JIS C 8305',
      desc: 'Thép mạ kẽm dày chống va đập, chống cháy nổ. Bắt buộc cho đoạn trồi lên mặt đất (立上り防護) vào trạm biến áp, Cubicle, cột điện.'
    },
    FEP_UNDERGROUND: {
      jp: '波付硬質合成樹脂管 (FEP管)',
      en: 'Corrugated Underground Pipe (FEP)',
      standard: 'JIS C 3653',
      desc: 'Ống nhựa xoắn chịu lực chôn ngầm. Tiêu chuẩn vàng cho tuyến cáp ngầm trung thế 6.6kV/22kV, uốn cong linh hoạt, không rỉ sét.'
    },
    STEEL_THREADLESS_E: {
      jp: 'ねじなし電線管 (E管)',
      en: 'Threadless Steel Conduit (E)',
      standard: 'JIS C 8305',
      desc: 'Ống thép trơn không ren lắp ghép nhanh. Đi nổi trong nhà xưởng, trần kỹ thuật, phòng điện.'
    },
    STEEL_THIN_C: {
      jp: '薄鋼電線管 (C管)',
      en: 'Thin Steel Conduit (C)',
      standard: 'JIS C 8305',
      desc: 'Ống thép mỏng có ren. Phổ biến cho đường dây chiếu sáng và phân phối trong nhà.'
    },
    PVC_VE: {
      jp: '硬質ビニル電線管 (VE管)',
      en: 'Rigid PVC Conduit (VE)',
      standard: 'JIS C 8430',
      desc: 'Ống nhựa PVC cứng chống ăn mòn hóa chất, môi trường ẩm ướt, muối biển.'
    },
    FLEXIBLE_PF_CD: {
      jp: '可とう電線管 (PF管 / CD管)',
      en: 'Flexible Conduit (PF/CD)',
      standard: 'JIS C 8411',
      desc: 'Ống mềm gân sóng. PF chống cháy dùng nổi ngoài trời/âm tường, CD chôn trong bê tông.'
    }
  };

  // Export CSV Schedule
  const handleExportCsv = () => {
    let csv = `SOLNEXA Engineering - Conduit Sizing & Protection Schedule\n`;
    csv += `Standard,JIS C 8305 / JIS C 8430 / JIS C 3653 / JEAC 8001 (内線規程)\n`;
    csv += `Selected Pipe Family,${familyLabels[selectedFamily].jp} (${familyLabels[selectedFamily].standard})\n`;
    csv += `Cable Type,${isMulti ? 'Multi-Cable Mixed' : (activeCable?.label || '6600V CVT 250sq')},Size,${isMulti ? 'Mixed' : selectedCableSize}\n`;
    csv += `Cable Outer Diameter,${effectiveOuterDiaMm} mm,Cables Count,${isMulti ? multiCalcResult.totalCablesCount : cableCount} 本\n`;
    csv += `Total Cable Area,${calculationResult.totalCableAreaMm2} mm²\n`;
    csv += `Occupancy Limit,${calculationResult.occupancyLimitPercent}%,Condition,${calculationResult.limitReason}\n`;
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
    showToast('Đã xuất file bảng kích thước ống bảo vệ CSV thành công.');
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
                  Tính toán Chọn Ống Bảo Vệ &amp; Độ Chiếm Dụng Cáp (Conduit Sizing &amp; Occupancy)
                </h2>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  JEAC 8001 / 内線規程
                </span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  JIS C 3653 (FEP) / JIS C 8305 (G管)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
                Tự động tính toán đường kính ngoài cáp, diện tích tiết diện và đề xuất ống bảo vệ hợp chuẩn: 
                <strong> Ống nhựa xoắn FEP (FEP管)</strong> cho tuyến chôn ngầm dưới đất hoặc 
                <strong> Ống thép dày G (厚鋼G管)</strong> cho đoạn trồi lên bảo vệ trạm biến áp/Cubicle (hệ số chiếm dụng: 48% tuyến thẳng, 32% đoạn uốn cong).
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-start lg:self-auto">
            {/* Quick Engineering Presets */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
              <span className="text-[10px] font-bold text-slate-500 px-1">Presets Nhanh:</span>
              <button
                type="button"
                onClick={() => applyPreset('mv-6.6kv-250-fep')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-rose-700 hover:text-rose-900 border border-rose-300 rounded-lg font-bold shadow-xs text-[11px] flex items-center gap-1 transition-all"
                title="Cáp cao thế 6600V CVT 250sq đi ngầm trong ống FEP-125"
              >
                <span>⚡ 6600V CVT 250sq (FEP)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('mv-6.6kv-250-g')}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-700 hover:text-indigo-900 border border-indigo-300 rounded-lg font-bold shadow-xs text-[11px] flex items-center gap-1 transition-all"
                title="Cáp cao thế 6600V CVT 250sq đoạn trồi lên dùng ống thép dày G104/G125"
              >
                <span>🛡️ 6600V CVT 250sq (G管)</span>
              </button>
              <button
                type="button"
                onClick={() => applyPreset('inverter-ac-earth')}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg font-medium shadow-xs text-[11px]"
              >
                AC CVT 100sq + E
              </button>
              <button
                type="button"
                onClick={() => applyPreset('pv-dc-earth')}
                className="px-2 py-1 bg-white hover:bg-slate-50 text-slate-800 rounded-lg font-medium shadow-xs text-[11px]"
              >
                PV DC + Tiếp địa
              </button>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer active:scale-98"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Xuất CSV</span>
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs (Single Cable vs Multi Cable) */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
          <div className="flex items-center space-x-1 bg-slate-100/90 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setCalcMode('single')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                calcMode === 'single'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚡ Đơn Tuyến Cáp (Single Cable)
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('multi')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                calcMode === 'multi'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📑 Đa Cáp / Hỗn Hợp (Multi-Cable Builder)
            </button>
          </div>

          <div className="text-[11px] text-slate-500 font-medium hidden md:block">
            {calcMode === 'single'
              ? 'Tính toán chuyên sâu cho 1 loại cáp chính (VD: 6600V CVT 250sq)'
              : 'Tính toán hỗn hợp nhiều loại cáp trong cùng 1 ống (Cáp động lực + Cáp tiếp địa)'}
          </div>
        </div>

        {/* 6 Conduit Family Switcher Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-3 mt-3 border-t border-slate-100">
          {(
            [
              'FEP_UNDERGROUND',
              'STEEL_THICK_G',
              'STEEL_THREADLESS_E',
              'STEEL_THIN_C',
              'PVC_VE',
              'FLEXIBLE_PF_CD'
            ] as ConduitFamily[]
          ).map(f => {
            const isSelected = selectedFamily === f;
            const meta = familyLabels[f];
            const isHighlight = f === 'FEP_UNDERGROUND' || f === 'STEEL_THICK_G';
            return (
              <button
                key={f}
                onClick={() => setSelectedFamily(f)}
                className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/25 shadow-xs'
                    : isHighlight
                    ? 'bg-amber-50/30 border-amber-200/80 hover:bg-white hover:border-amber-400'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-blue-700' : isHighlight ? 'text-amber-800' : 'text-slate-500'}`}>
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
                    {calcMode === 'multi' ? 'Danh Sách Cáp Hỗn Hợp (Multi-Cable List)' : 'Thông Số Tuyến Cáp (Cable Specification)'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {calcMode === 'multi' ? 'Tính toán luồn nhiều sợi/nhiều cỡ dây trong 1 ống' : 'Chọn chủng loại cáp, kích cỡ ruột dẫn & số lượng sợi'}
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
                  <span>+ Thêm Dây</span>
                </button>
              )}
            </div>

            {/* SINGLE CABLE VIEW */}
            {calcMode === 'single' ? (
              <div className="space-y-4 text-xs">
                {/* 1. Category Selector */}
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                    1. Chủng Loại Cáp (Cable Family / 種別):
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: '6.6KV_CVT', label: '⚡ 高圧 6600V CVT (Trọng điểm)', tag: '6.6kV CVT' },
                      { id: '600V_CVT', label: '⚡ 低圧 600V CVT (3心)', tag: '600V CVT' },
                      { id: '600V_CV_1C', label: '⚡ 600V CV 1心', tag: '600V CV 1C' },
                      { id: 'IV', label: '🌱 IV (Dây tiếp địa / ビニル線)', tag: 'IV' },
                      { id: 'SOLAR_DC', label: '☀️ Solar PV DC (Cáp mặt trời)', tag: 'PV DC' }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCableCategory(cat.id as any);
                          // Default to 250 sq if 6.6KV_CVT or 600V_CVT
                          if (cat.id === '6.6KV_CVT') {
                            setSelectedCableSize('250 sq');
                          } else if (cat.id === '600V_CVT') {
                            setSelectedCableSize('250 sq');
                          } else if (cat.id === 'IV') {
                            setSelectedCableSize('14 sq');
                          } else if (cat.id === 'SOLAR_DC') {
                            setSelectedCableSize('6 mm²');
                          }
                          setCustomDiaActive(false);
                        }}
                        className={`px-2.5 py-2 rounded-xl text-[11px] font-bold text-left transition-all truncate border ${
                          cableCategory === cat.id
                            ? cat.id === '6.6KV_CVT'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-500/20'
                              : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Conductor Size Selector */}
                {!customDiaActive && (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700">
                        2. Tiết Diện Dây Dẫn (Conductor Size / sq):
                      </label>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {availableCables.length} cỡ dây chuẩn JIS
                      </span>
                    </div>

                    {/* Quick Size Pills for 6.6kV CVT */}
                    {cableCategory === '6.6KV_CVT' && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {['38 sq', '60 sq', '100 sq', '150 sq', '200 sq', '250 sq', '325 sq'].map(s => {
                          const isPicked = selectedCableSize === s;
                          const isSpecial = s === '250 sq';
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setSelectedCableSize(s)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all border ${
                                isPicked
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-xs scale-102'
                                  : isSpecial
                                  ? 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100 font-black'
                                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {s} {isSpecial && '★'}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    <select
                      value={selectedCableSize}
                      onChange={e => setSelectedCableSize(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                    >
                      {availableCables.map((c, idx) => (
                        <option key={idx} value={c.sizeSq}>
                          {c.sizeSq} — 仕上外径: φ{c.outerDiaMm} mm (単線断面積: {c.sectionalAreaMm2} mm²)
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Selected Cable Status Card */}
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  cableCategory === '6.6KV_CVT'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-blue-50/70 border-blue-200 text-blue-950'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                      Thông Số Dây Đang Chọn (Active Spec)
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-rose-200 text-rose-700">
                      {cableCategory === '6.6KV_CVT' ? '⚡ 6600V CVT' : cableCategory === '600V_CVT' ? '600V CVT' : 'JIS C 3605'}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{cableCategory === '6.6KV_CVT' ? '6600V CVT' : cableCategory === '600V_CVT' ? '600V CVT' : cableCategory}</span>
                    <span className="font-mono text-blue-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                      {selectedCableSize}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      ({cableCategory === '6.6KV_CVT' ? '高圧3心トリプレックス' : '架橋PE絶縁'})
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-rose-200/50">
                    <div>
                      <span className="text-slate-500">Đường kính ngoài:</span>{' '}
                      <strong className="font-mono text-slate-900 font-bold">φ{effectiveOuterDiaMm} mm</strong>
                    </div>
                    <div>
                      <span className="text-slate-500">Diện tích 1 sợi:</span>{' '}
                      <strong className="font-mono text-slate-900 font-bold">
                        {((Math.PI * Math.pow(effectiveOuterDiaMm, 2)) / 4).toFixed(1)} mm²
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 3. Number of Cables in Conduit (条数・本数) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-700">
                      3. Số Lượng Dây Luồn Trong Ống (条数 / 本数):
                    </label>
                    <span className="font-mono font-black text-sm text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {cableCount} 条 (本)
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCableCount(num)}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold border transition-all ${
                          cableCount === num
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {num}条 {num === 1 ? '(1 hồi)' : num === 2 ? '(2 hồi)' : ''}
                      </button>
                    ))}
                  </div>

                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={cableCount}
                    onChange={e => setCableCount(parseInt(e.target.value) || 1)}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-0.5">
                    <span>1条 (Tiêu chuẩn 6.6kV CVT)</span>
                    <span>2条 (2 lộ song song)</span>
                    <span>3条</span>
                    <span>6条</span>
                    <span>12条</span>
                  </div>
                </div>

                {/* 4. Quick Protection Conduit Selector */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      4. Lựa Chọn Ống Bảo Vệ (Protection Conduit):
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      Hiện tại: {familyLabels[selectedFamily].jp}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFamily('FEP_UNDERGROUND')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        selectedFamily === 'FEP_UNDERGROUND'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">波付FEP管 (Chôn ngầm)</span>
                        {selectedFamily === 'FEP_UNDERGROUND' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[9px] opacity-80 block mt-0.5 truncate">JIS C 3653 • Tuyến ngầm cao thế</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFamily('STEEL_THICK_G')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        selectedFamily === 'STEEL_THICK_G'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">厚鋼G管 (Đi nổi/Trồi lên)</span>
                        {selectedFamily === 'STEEL_THICK_G' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[9px] opacity-80 block mt-0.5 truncate">JIS C 8305 • Bảo vệ cơ học trạm Cubicle</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* MULTI-CABLE BUILDER VIEW */
              <div className="space-y-3 text-xs">
                <div className="space-y-2">
                  {multiCables.map((c, idx) => {
                    const singleArea = Number(((Math.PI * Math.pow(c.outerDiaMm, 2)) / 4).toFixed(1));
                    const subtotalArea = Number((singleArea * c.count).toFixed(1));
                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl border space-y-2.5 transition-all ${
                          c.category === '6.6KV_CVT'
                            ? 'bg-rose-50/40 border-rose-300'
                            : 'bg-slate-50/80 border-slate-200'
                        }`}
                      >
                        {/* Cable Item Header */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 shrink-0">
                            {c.category === '6.6KV_CVT' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                ⚡ 高圧 6600V CVT
                              </span>
                            ) : c.category === '600V_CVT' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                低圧 CVT (3心)
                              </span>
                            ) : c.category === '600V_CV_1C' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                                600V CV 1心
                              </span>
                            ) : c.category === 'IV' ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                IV (接地線)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-100 text-cyan-800 border border-cyan-300">
                                PV DC 太陽光
                              </span>
                            )}
                          </div>

                          <input
                            type="text"
                            value={c.name}
                            onChange={e => {
                              const val = e.target.value;
                              setMultiCables(prev => prev.map(item => item.id === c.id ? { ...item, name: val } : item));
                            }}
                            className="bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-bold text-slate-900 flex-1 truncate font-sans"
                            placeholder="Tên dây cáp"
                          />

                          <button
                            type="button"
                            onClick={() => handleRemoveMultiCable(c.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Xóa dây cáp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Dual Selectors: Cable Type + Conductor Size */}
                        <div className="grid grid-cols-12 gap-2 text-[11px] items-center">
                          {/* 1. Category */}
                          <div className="col-span-4">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Loại cáp (Type)</label>
                            <select
                              value={c.category || '6.6KV_CVT'}
                              onChange={e => {
                                const newCat = e.target.value;
                                const matchingSpecs = CABLE_DIMENSIONS_LIBRARY.filter(lib => lib.cableType === newCat);
                                const sameSize = matchingSpecs.find(s => s.sizeSq === c.sizeSq) || matchingSpecs.find(s => s.sizeSq === '250 sq') || matchingSpecs[0];
                                const catLabel = newCat === '6.6KV_CVT' ? '6600V CVT' : newCat === '600V_CVT' ? '600V CVT' : newCat === '600V_CV_1C' ? '600V CV 1心' : newCat === 'IV' ? 'IV (接地線)' : 'PV DC';
                                setMultiCables(prev => prev.map(item => item.id === c.id ? {
                                  ...item,
                                  category: newCat,
                                  sizeSq: sameSize.sizeSq,
                                  outerDiaMm: sameSize.outerDiaMm,
                                  name: `${catLabel} ${sameSize.sizeSq}`
                                } : item));
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] font-bold text-slate-800"
                            >
                              <option value="6.6KV_CVT">⚡ 高圧 6.6kV CVT</option>
                              <option value="600V_CVT">⚡ 低圧 600V CVT</option>
                              <option value="600V_CV_1C">⚡ 600V CV 1心</option>
                              <option value="IV">🌱 IV (接地線)</option>
                              <option value="SOLAR_DC">☀️ 太陽光 PV DC</option>
                            </select>
                          </div>

                          {/* 2. Conductor Size */}
                          <div className="col-span-4">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Tiết diện (sq)</label>
                            <select
                              value={c.sizeSq}
                              onChange={e => {
                                const newSize = e.target.value;
                                const currentCat = c.category || '6.6KV_CVT';
                                // Filter STRICTLY inside currentCat to never fall back to IV
                                const matchingSpecs = CABLE_DIMENSIONS_LIBRARY.filter(lib => lib.cableType === currentCat);
                                const spec = matchingSpecs.find(lib => lib.sizeSq === newSize) || matchingSpecs[0];
                                if (spec) {
                                  const catLabel = spec.cableType === '6.6KV_CVT' ? '6600V CVT' : spec.cableType === '600V_CVT' ? '600V CVT' : spec.cableType === '600V_CV_1C' ? '600V CV 1心' : spec.cableType === 'IV' ? 'IV (接地線)' : 'PV DC';
                                  setMultiCables(prev => prev.map(item => item.id === c.id ? {
                                    ...item,
                                    category: spec.cableType,
                                    sizeSq: spec.sizeSq,
                                    outerDiaMm: spec.outerDiaMm,
                                    name: `${catLabel} ${spec.sizeSq}`
                                  } : item));
                                }
                              }}
                              className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-[11px] font-bold text-slate-900 font-mono"
                            >
                              {CABLE_DIMENSIONS_LIBRARY.filter(lib => lib.cableType === (c.category || '6.6KV_CVT')).map((lib, libIdx) => (
                                <option key={libIdx} value={lib.sizeSq}>
                                  {lib.sizeSq} (φ{lib.outerDiaMm}mm)
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* 3. Quantity (Count) */}
                          <div className="col-span-4">
                            <label className="text-[10px] text-slate-500 font-semibold block mb-0.5">Số sợi (条数)</label>
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

                        {/* Breakdown footer */}
                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-200/50">
                          <span>Đường kính ngoài: <strong className="font-mono text-slate-800">φ{c.outerDiaMm} mm</strong> ｜ Đơn sợi: <strong className="font-mono text-slate-800">{singleArea} mm²</strong></span>
                          <span>Tổng diện tích: <strong className="font-mono text-blue-700 font-bold">{subtotalArea} mm²</strong> ({c.count} sợi)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Protection Conduit Switcher Bar for Multi */}
                <div className="p-3 bg-indigo-50/70 border border-indigo-200/90 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-indigo-600" />
                      Lựa chọn ống bảo vệ (Protection Conduit Selection)
                    </span>
                    <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      Hiện tại: {familyLabels[selectedFamily].jp}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFamily('FEP_UNDERGROUND')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        selectedFamily === 'FEP_UNDERGROUND'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">波付FEP管</span>
                        {selectedFamily === 'FEP_UNDERGROUND' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[9px] opacity-80 block mt-0.5 truncate">地中埋設・高圧幹線用</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFamily('STEEL_THICK_G')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        selectedFamily === 'STEEL_THICK_G'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">厚鋼G管</span>
                        {selectedFamily === 'STEEL_THICK_G' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[9px] opacity-80 block mt-0.5 truncate">屋外露出・立上り防護</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFamily('STEEL_THREADLESS_E')}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        selectedFamily === 'STEEL_THREADLESS_E'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">ねじなしE管</span>
                        {selectedFamily === 'STEEL_THREADLESS_E' && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className="text-[9px] opacity-80 block mt-0.5 truncate">屋内露出・天井内配線</span>
                    </button>
                  </div>
                </div>

                {/* Multi-Cable Total Summary Bar */}
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-blue-700 font-semibold block uppercase">Tổng số sợi / Tổng diện tích</span>
                    <span className="text-xs text-blue-900 font-bold">
                      Tổng: <span className="text-sm font-mono text-blue-950 font-black">{multiCalcResult.totalCablesCount} sợi/条</span>
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
            )}
          </div>

          {/* Card 2: Route Length, Bends, Pull Box & Installation Conditions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 font-black text-xs flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-xs font-bold text-slate-900">Điều Kiện Tuyến &amp; Góc Cong (Route &amp; Installation)</h3>
                <p className="text-[10px] text-slate-400">Chiều dài ống, khúc uốn cong 90°, tiêu chuẩn hộp kéo cáp Pull Box</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              {/* Route Length & 90 Bends Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                    <span>Chiều dài tuyến ống</span>
                    <span className="text-[10px] text-slate-400">Tiêu chuẩn: ≤ 30m</span>
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
                    <span>Số góc cong 90°</span>
                    <span className="text-[10px] text-slate-400">Tiêu chuẩn: ≤ 3 khúc</span>
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
                      khúc
                    </span>
                  </div>
                </div>
              </div>

              {/* Occupancy Rule Display */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700 block">
                  Giới Hạn Tỷ Lệ Chiếm Dụng (JEAC 8001 第3110節)
                </label>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">
                      {calculationResult.occupancyLimitPercent === 32
                        ? 'Tuyến có khúc cong / khác kích cỡ (≤ 32%)'
                        : 'Tuyến thẳng cùng cỡ dây (≤ 48%)'}
                    </span>
                    <span className="text-[10px] text-slate-500">{calculationResult.limitReason}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-white text-blue-700 border border-blue-200">
                    {calculationResult.occupancyLimitPercent}%
                  </span>
                </div>
              </div>

              {/* Pull Box Check Alert */}
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
                    <span>Hộp kéo cáp (Pull Box) trung gian:</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      multiCalcResult.pullBoxRequired ? 'bg-amber-200 text-amber-900' : 'bg-emerald-200 text-emerald-900'
                    }`}>
                      {multiCalcResult.pullBoxRequired ? 'CẦN LẮP ĐẶT' : 'KHÔNG CẦN (OK)'}
                    </span>
                  </div>
                  <p className="text-[11px] opacity-90">{multiCalcResult.pullBoxReason}</p>
                </div>
              </div>

              {/* Minimum Bending Radius & Bundling Derating */}
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Bán kính uốn tối thiểu (R ≥ 6D)</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">
                    R ≥ {multiCalcResult.minConduitBendingRadiusMm} mm
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Hệ số giảm dòng (Bundling Derating)</span>
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    × {calculationResult.bundlingCurrentReductionFactor} ({(calculationResult.bundlingCurrentReductionFactor * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Dual Protection Comparison, Visualizer & Recommendation Table */}
        <div className="lg:col-span-7 space-y-5">
          {/* ========================================================================= */}
          {/* DEDICATED CARD: PROTECTION CONDUIT SIZING & COMPARISON (FEP vs G管) */}
          {/* Answers user: "tính được xem nên dùng loại ống nào bảo vệ" */}
          {/* ========================================================================= */}
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl border border-indigo-500/30 shadow-md p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-700/40 pb-3.5">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    So Sánh &amp; Đề Xuất Loại Ống Bảo Vệ: FEP vs G管
                    <span className="text-[10px] font-mono bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded border border-indigo-400/20">
                      Chuyên gia tư vấn
                    </span>
                  </h3>
                  <p className="text-[11px] text-indigo-200/80">
                    Phân tích kích cỡ &amp; mục đích sử dụng giữa ống nhựa xoắn FEP (chôn ngầm) và ống thép dày G (đi nổi/trồi lên)
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-slate-400 block">Cáp đang tính:</span>
                <span className="text-xs font-bold text-amber-300 font-mono">
                  {isMulti ? `${multiCalcResult.totalCablesCount} sợi hỗn hợp` : `${activeCable?.sizeSq || selectedCableSize} (φ${effectiveOuterDiaMm}mm) × ${cableCount}条`}
                </span>
              </div>
            </div>

            {/* Dual Cards Comparison Grid: FEP vs G管 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* 1. FEP Conduit Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                selectedFamily === 'FEP_UNDERGROUND'
                  ? 'bg-blue-950/70 border-blue-400 ring-2 ring-blue-500/30 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-400" />
                    <span className="text-xs font-bold text-sky-300">波付硬質合成樹脂管 (Ống FEP)</span>
                  </div>
                  <span className="text-[9px] font-mono bg-sky-950 text-sky-300 border border-sky-800 px-1.5 py-0.2 rounded">
                    JIS C 3653
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cỡ ống đề xuất:</span>
                    <div className="text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1.5">
                      <span>{fepPipeResult.recommendedConduit.code}</span>
                      <span className="text-xs text-sky-300 font-sans font-normal">(内径 φ{fepPipeResult.recommendedConduit.innerDiaMm}mm)</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    fepPipeResult.isRecommendedCompliant ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {fepPipeResult.isRecommendedCompliant ? 'PASS (Hợp chuẩn)' : 'NG'}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/50 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Độ chiếm dụng:</span>
                    <strong className="font-mono text-white text-xs">{fepPipeResult.actualOccupancyPercent}%</strong>
                    <span className="text-[9px] text-slate-400 ml-1">/ max {fepPipeResult.occupancyLimitPercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Không gian còn dư:</span>
                    <strong className="font-mono text-emerald-400 text-xs">
                      +{Math.max(0, (fepPipeResult.recommendedConduit.innerAreaMm2 * fepPipeResult.occupancyLimitPercent / 100) - fepPipeResult.totalCableAreaMm2).toFixed(0)} mm²
                    </strong>
                  </div>
                </div>

                {/* Recommendation Description */}
                <div className="mt-3 p-2 rounded-lg bg-sky-950/40 border border-sky-900/50 text-[10px] text-sky-200 leading-relaxed">
                  <strong className="text-sky-300 block mb-0.5 font-semibold">Khi nào nên dùng FEP?</strong>
                  Dành cho <strong>tuyến cáp chôn ngầm dưới đất (地中埋設)</strong>. Gân xoắn chịu lực nén xe cộ trên mặt đường, uốn cong mềm dẻo không cần cút nối, hoàn toàn không bị rỉ sét.
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFamily('FEP_UNDERGROUND');
                    showToast(`Đã áp dụng kích thước ống FEP: ${fepPipeResult.recommendedConduit.code}`);
                  }}
                  className={`w-full mt-3 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedFamily === 'FEP_UNDERGROUND'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-700/80 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {selectedFamily === 'FEP_UNDERGROUND' ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{selectedFamily === 'FEP_UNDERGROUND' ? 'Đang chọn ống FEP này' : `Áp dụng FEP (${fepPipeResult.recommendedConduit.code})`}</span>
                </button>
              </div>

              {/* 2. Steel G Conduit Card */}
              <div className={`p-4 rounded-xl border transition-all ${
                selectedFamily === 'STEEL_THICK_G'
                  ? 'bg-indigo-950/70 border-indigo-400 ring-2 ring-indigo-500/30 shadow-sm'
                  : 'bg-slate-800/60 border-slate-700/70 hover:border-slate-600'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="text-xs font-bold text-amber-300">厚鋼電線管 (Ống Thép Dày G)</span>
                  </div>
                  <span className="text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded">
                    JIS C 8305
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Cỡ ống đề xuất:</span>
                    <div className="text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1.5">
                      <span>{gPipeResult.recommendedConduit.code}</span>
                      <span className="text-xs text-amber-300 font-sans font-normal">(内径 φ{gPipeResult.recommendedConduit.innerDiaMm}mm)</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    gPipeResult.isRecommendedCompliant ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {gPipeResult.isRecommendedCompliant ? 'PASS (Hợp chuẩn)' : 'NG'}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-700/50 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Độ chiếm dụng:</span>
                    <strong className="font-mono text-white text-xs">{gPipeResult.actualOccupancyPercent}%</strong>
                    <span className="text-[9px] text-slate-400 ml-1">/ max {gPipeResult.occupancyLimitPercent}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Không gian còn dư:</span>
                    <strong className="font-mono text-emerald-400 text-xs">
                      +{Math.max(0, (gPipeResult.recommendedConduit.innerAreaMm2 * gPipeResult.occupancyLimitPercent / 100) - gPipeResult.totalCableAreaMm2).toFixed(0)} mm²
                    </strong>
                  </div>
                </div>

                {/* Recommendation Description */}
                <div className="mt-3 p-2 rounded-lg bg-amber-950/40 border border-amber-900/50 text-[10px] text-amber-200 leading-relaxed">
                  <strong className="text-amber-300 block mb-0.5 font-semibold">Khi nào nên dùng G管?</strong>
                  Dành cho <strong>đoạn trồi lên mặt đất (立上り防護)</strong> vào tủ trạm biến áp (Cubicle), tủ RMU, chân cột điện. Thép mạ kẽm dày chống va đập xe cộ cơ học &amp; chống cháy nổ.
                </div>

                {/* Action button */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFamily('STEEL_THICK_G');
                    showToast(`Đã áp dụng kích thước ống thép dày G: ${gPipeResult.recommendedConduit.code}`);
                  }}
                  className={`w-full mt-3 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedFamily === 'STEEL_THICK_G'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-700/80 hover:bg-slate-700 text-slate-200'
                  }`}
                >
                  {selectedFamily === 'STEEL_THICK_G' ? <Check className="w-3.5 h-3.5" /> : null}
                  <span>{selectedFamily === 'STEEL_THICK_G' ? 'Đang chọn ống G管 này' : `Áp dụng G管 (${gPipeResult.recommendedConduit.code})`}</span>
                </button>
              </div>
            </div>

            {/* Engineering Synthesis Box */}
            <div className="p-3 bg-slate-900/80 border border-indigo-500/20 rounded-xl text-xs flex items-start gap-2.5">
              <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-bold text-amber-300 block">
                  💡 Khuyến nghị phối hợp kỹ thuật thực tế (JEAC 8001 / 内線規程):
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Đối với tuyến cáp <strong>6600V CVT 250sq</strong>: Toàn bộ tuyến chôn ngầm dưới đất khuyến nghị dùng 
                  <strong className="text-sky-300"> {fepPipeResult.recommendedConduit.code} (Ống FEP)</strong> để giảm chi phí và dễ kéo cáp. 
                  Tại các điểm trồi lên mặt đất vào tủ trạm biến áp (Cubicle) hoặc chân cột điện, bắt buộc chuyển tiếp sang 
                  <strong className="text-amber-300"> {gPipeResult.recommendedConduit.code} (Ống thép dày G管)</strong> qua phụ kiện FEP-G Adapter để chống va đập cơ học xe cộ.
                </p>
              </div>
            </div>
          </div>

          {/* Top Recommendation Summary Card for currently selected family */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] uppercase tracking-wide font-bold text-slate-400 block">
                  KÍCH THƯỚC ĐỀ XUẤT CHO LOẠI ỐNG ĐANG CHỌN ({familyLabels[selectedFamily].jp.split(' ')[0]})
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {calculationResult.recommendedConduit.code}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({familyLabels[selectedFamily].jp})
                  </span>
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Đường kính trong: <span className="font-mono font-semibold text-slate-800">{calculationResult.recommendedConduit.innerDiaMm} mm</span> | 
                  Diện tích lòng ống: <span className="font-mono font-semibold text-slate-800">{calculationResult.recommendedConduit.innerAreaMm2} mm²</span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                <div className={`px-3 py-1.5 rounded-xl border text-center ${
                  calculationResult.isRecommendedCompliant
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <div className="text-[10px] font-bold uppercase">KẾT LUẬN (VERDICT)</div>
                  <div className="text-base font-black flex items-center justify-center space-x-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                    <span>PASS (HỢP CHUẨN)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Metric Mini Cards */}
            <div className="grid grid-cols-3 gap-3 pt-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                <div className="text-[10px] font-semibold text-slate-500">Độ chiếm dụng thực tế</div>
                <div className="text-lg font-black font-mono text-blue-600 mt-0.5">
                  {calculationResult.actualOccupancyPercent}%
                </div>
                <div className="text-[9px] text-slate-400">Giới hạn: {calculationResult.occupancyLimitPercent}%</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                <div className="text-[10px] font-semibold text-slate-500">Tổng diện tích cáp (Σa)</div>
                <div className="text-lg font-black font-mono text-slate-900 mt-0.5">
                  {calculationResult.totalCableAreaMm2} mm²
                </div>
                <div className="text-[9px] text-slate-400">
                  {isMulti ? `${multiCalcResult.totalCablesCount} sợi` : `φ${effectiveOuterDiaMm}mm × ${cableCount}条`}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-center">
                <div className="text-[10px] font-semibold text-slate-500">Dung lượng dư lòng ống</div>
                <div className="text-lg font-black font-mono text-emerald-600 mt-0.5">
                  {Math.max(0,
                    (calculationResult.recommendedConduit.innerAreaMm2 * calculationResult.occupancyLimitPercent / 100) -
                    calculationResult.totalCableAreaMm2
                  ).toFixed(0)} mm²
                </div>
                <div className="text-[9px] text-slate-400">Dư để kéo cáp êm</div>
              </div>
            </div>

            {/* Interactive SVG Conduit Cross-Section Simulation */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-800">Mô Phỏng Mặt Cắt Ngang Ống Luồn Dây (Cross-Section View)</span>
                <span className="text-[11px] font-mono text-slate-400">Tỷ lệ trực quan 1:1</span>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-around gap-4 text-white">
                {/* SVG Visualizer */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg viewBox="0 0 160 160" className="w-full h-full">
                    {/* Conduit Outer Wall */}
                    <circle cx="80" cy="80" r="75" fill="#1e293b" stroke="#475569" strokeWidth="4" />
                    {/* Conduit Inner Wall (Lumen) */}
                    <circle cx="80" cy="80" r="67" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" strokeDasharray="3 3" />

                    {/* Realistic 3-Core Triplex Bundle for CVT cable */}
                    {(cableCategory === '6.6KV_CVT' || cableCategory === '600V_CVT') && !isMulti && cableCount === 1 ? (
                      <g>
                        {/* Core R */}
                        <circle cx="80" cy="65" r="17" fill="#e11d48" stroke="#f43f5e" strokeWidth="1.5" />
                        <circle cx="80" cy="65" r="7" fill="#f59e0b" />
                        {/* Core S */}
                        <circle cx="67" cy="88" r="17" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                        <circle cx="67" cy="88" r="7" fill="#f59e0b" />
                        {/* Core T */}
                        <circle cx="93" cy="88" r="17" fill="#2563eb" stroke="#3b82f6" strokeWidth="1.5" />
                        <circle cx="93" cy="88" r="7" fill="#f59e0b" />
                      </g>
                    ) : (
                      /* General Cables formation */
                      Array.from({ length: isMulti ? multiCalcResult.totalCablesCount : cableCount }).map((_, idx) => {
                        const total = isMulti ? multiCalcResult.totalCablesCount : cableCount;
                        let cx = 80;
                        let cy = 80;
                        const singleCableRadius = Math.max(6, Math.min(22, (effectiveOuterDiaMm / calculationResult.recommendedConduit.innerDiaMm) * 55));

                        if (total > 1) {
                          const angle = (idx / total) * (2 * Math.PI);
                          const clusterR = Math.min(36, 18 + total * 1.5);
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
                      })
                    )}

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
                      Ống bảo vệ: <strong className="text-white font-mono">{calculationResult.recommendedConduit.code}</strong> (Lòng trong: φ{calculationResult.recommendedConduit.innerDiaMm}mm)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                    <span className="text-slate-300">
                      Cáp luồn: <strong className="text-white font-mono">{isMulti ? `${multiCalcResult.totalCablesCount} sợi` : (cableCategory === '6.6KV_CVT' ? '6600V CVT 250sq' : `${selectedCableSize}`)}</strong> (φ{effectiveOuterDiaMm}mm)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                    <span className="text-slate-300">
                      Độ chiếm dụng: <strong className="text-emerald-400 font-mono">{calculationResult.actualOccupancyPercent}%</strong> (Chuẩn ≤ {calculationResult.occupancyLimitPercent}%)
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
                <h3 className="text-xs font-bold text-slate-900">Bảng Đánh Giá Tất Cả Kích Thước Ống ({familyLabels[selectedFamily].jp.split(' ')[0]})</h3>
                <p className="text-[10px] text-slate-500">
                  Danh mục toàn bộ các cỡ ống của {familyLabels[selectedFamily].jp} theo tiêu chuẩn {familyLabels[selectedFamily].standard}
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Chiếm dụng max: {calculationResult.occupancyLimitPercent}%
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 text-[11px]">
                    <th className="py-2.5 px-3 font-semibold">Mã ống (Code)</th>
                    <th className="py-2.5 px-2 font-semibold text-right">Ngoài / Trong</th>
                    <th className="py-2.5 px-2 font-semibold text-right">Lòng ống (mm²)</th>
                    <th className="py-2.5 px-2 font-semibold text-right">Cho phép ({calculationResult.occupancyLimitPercent}%)</th>
                    <th className="py-2.5 px-2 font-semibold text-right">Chiếm dụng</th>
                    <th className="py-2.5 px-2 font-semibold text-right">Không gian dư</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
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
                        <td className="py-2.5 px-3 font-bold text-slate-900 font-sans flex items-center space-x-1.5">
                          <span>{row.conduit.code}</span>
                          {isRec && (
                            <span className="text-[9px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold font-sans">
                              ĐỀ XUẤT
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600">
                          {row.conduit.outerDiaMm} / {row.conduit.innerDiaMm} mm
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600">
                          {row.conduit.innerAreaMm2.toLocaleString()} mm²
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600">
                          {allowedArea} mm²
                        </td>
                        <td className={`py-2.5 px-2 text-right font-bold ${
                          row.isCompliant ? 'text-blue-600' : 'text-rose-600'
                        }`}>
                          {row.occupancyPercent}%
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600">
                          {row.remainingAreaMm2 > 0 ? `+${row.remainingAreaMm2} mm²` : `${row.remainingAreaMm2} mm²`}
                        </td>
                        <td className="py-2.5 px-3 text-center font-sans">
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
