import React, { useState } from 'react';
import {
  Calculator,
  Zap,
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  VoltageDropInput,
  VoltageDropOutput,
  CableSelectionInput,
  CableSelectionOutput,
  PVStringDesignInput,
  PVStringDesignOutput
} from '../types';

export const EngineeringCalculators: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'vdrop' | 'cable' | 'string'>('vdrop');

  // 1. Voltage Drop State
  const [vDropInput, setVDropInput] = useState<VoltageDropInput>({
    systemType: '3_PHASE',
    voltage: 400,
    current: 72.2, // Typical 50kW inverter output at 400V
    powerFactor: 0.95,
    cableLength: 120, // meters
    conductorMaterial: 'COPPER',
    crossSectionMm2: 35,
    operatingTemp: 70
  });
  const [vDropResult, setVDropResult] = useState<VoltageDropOutput | null>(null);

  // 2. Cable Sizing State
  const [cableInput, setCableInput] = useState<CableSelectionInput>({
    systemVoltage: 400,
    systemType: '3_PHASE',
    loadCurrent: 80,
    installationMethod: 'TRAY',
    ambientTempC: 40,
    numberOfCircuits: 1,
    runLengthMeters: 100,
    maxVoltageDropPercent: 3.0
  });
  const [cableResult, setCableResult] = useState<CableSelectionOutput | null>(null);

  // 3. PV String Design State (seeded with Trina Vertex S+ 440W & Huawei 50KTL)
  const [stringInput, setStringInput] = useState<PVStringDesignInput>({
    pvVocSTC: 52.2,
    pvVmpSTC: 43.6,
    pvIscSTC: 10.67,
    pvImpSTC: 10.10,
    pvTempCoeffVoc: -0.24,
    pvTempCoeffPmax: -0.30,
    minAmbientTempC: -5,
    maxAmbientTempC: 45,
    maxModuleTempC: 70,
    inverterMaxDcVoltage: 1100,
    inverterMpptMinVoltage: 200,
    inverterMpptMaxVoltage: 1000,
    inverterMaxIscPerMppt: 40,
    inverterMpptCount: 4,
    inverterInputsPerMppt: 2
  });
  const [stringResult, setStringResult] = useState<PVStringDesignOutput | null>(null);

  // Handlers
  const handleCalculateVDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calculations/voltage-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vDropInput)
      });
      const data = await res.json();
      setVDropResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectCable = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calculations/cable-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cableInput)
      });
      const data = await res.json();
      setCableResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDesignString = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/calculations/pv-string-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stringInput)
      });
      const data = await res.json();
      setStringResult(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="mb-6 p-6 rounded-3xl liquid-glass border border-white/90 shadow-sm relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-amber-800 font-mono text-[11px] uppercase tracking-wider font-bold bg-amber-100/80 px-2 py-0.5 rounded-md border border-amber-200">
                ENGINEERING MODULES
              </span>
              <span className="text-xs font-semibold text-slate-500">
                IEC 60364 & IEC 62548 Verification
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1.5">
              Tính toán Kỹ thuật Điện & Chuỗi Solar PV
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Các mô-đun tính toán vật lý chuẩn hóa sử dụng thông số kỹ thuật thực tế từ các thiết bị đã được phê duyệt trong hệ thống SOLNEXA.
            </p>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setActiveModule('vdrop')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                activeModule === 'vdrop'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sụt áp cáp (ΔV)
            </button>
            <button
              onClick={() => setActiveModule('cable')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                activeModule === 'cable'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Chọn tiết diện cáp
            </button>
            <button
              onClick={() => setActiveModule('string')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
                activeModule === 'string'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cấu hình chuỗi PV
            </button>
          </div>
        </div>
      </div>

      {/* 1. Voltage Drop Calculator */}
      {activeModule === 'vdrop' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleCalculateVDrop} className="liquid-glass-panel rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
              Tham số sụt áp (IEC 60364-5-52)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Số pha hệ thống</label>
                  <select
                    value={vDropInput.systemType}
                    onChange={e => setVDropInput({ ...vDropInput, systemType: e.target.value as any })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  >
                    <option value="3_PHASE">3 Pha (400V)</option>
                    <option value="1_PHASE">1 Pha (230V)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Điện áp định mức (V)</label>
                  <input
                    type="number"
                    value={vDropInput.voltage}
                    onChange={e => setVDropInput({ ...vDropInput, voltage: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Dòng tải làm việc (A)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vDropInput.current}
                    onChange={e => setVDropInput({ ...vDropInput, current: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hệ số cos φ</label>
                  <input
                    type="number"
                    step="0.01"
                    value={vDropInput.powerFactor}
                    onChange={e => setVDropInput({ ...vDropInput, powerFactor: parseFloat(e.target.value) || 0.95 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Chiều dài tuyến cáp (m)</label>
                  <input
                    type="number"
                    value={vDropInput.cableLength}
                    onChange={e => setVDropInput({ ...vDropInput, cableLength: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Tiết diện ruột dẫn (mm²)</label>
                  <select
                    value={vDropInput.crossSectionMm2}
                    onChange={e => setVDropInput({ ...vDropInput, crossSectionMm2: parseFloat(e.target.value) || 25 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  >
                    {[10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300].map(s => (
                      <option key={s} value={s}>{s} mm²</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">Vật liệu dẫn điện</label>
                <select
                  value={vDropInput.conductorMaterial}
                  onChange={e => setVDropInput({ ...vDropInput, conductorMaterial: e.target.value as any })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                >
                  <option value="COPPER">Đồng (Copper - Cu)</option>
                  <option value="ALUMINUM">Nhôm (Aluminum - Al)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 mt-4 cursor-pointer"
            >
              Tính toán sụt áp & tổn hao
            </button>
          </form>

          {/* Results Display */}
          <div className="lg:col-span-2 liquid-glass-panel rounded-3xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80">
                <h3 className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider">
                  Kết quả sụt áp & tổn thất điện áp
                </h3>
                {vDropResult && (
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold font-mono ${
                      vDropResult.isCompliant
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-50 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {vDropResult.isCompliant ? 'ĐẠT TIÊU CHUẨN IEC (<= 3%)' : 'VƯỢT NGƯỠNG (> 3%)'}
                  </span>
                )}
              </div>

              {vDropResult ? (
                <div className="mt-5 space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono">
                    <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Độ sụt áp (ΔV)</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{vDropResult.voltageDropVolts} V</p>
                    </div>

                    <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Tỷ lệ sụt áp (%)</span>
                      <p
                        className={`text-2xl font-black mt-1 ${
                          vDropResult.isCompliant ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {vDropResult.voltageDropPercentage}%
                      </p>
                    </div>

                    <div className="p-4 bg-white/80 border border-slate-200/80 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase text-slate-500 font-bold">Điện áp cuối tuyến</span>
                      <p className="text-2xl font-black text-slate-900 mt-1">{vDropResult.endVoltageVolts} V</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 font-mono text-xs">
                    <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200/80">
                      <span className="text-amber-800 font-medium">Tổn thất công suất dây (I²R):</span>
                      <p className="text-amber-900 font-black text-base mt-0.5">{vDropResult.powerLossKw} kW</p>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                      <span className="text-slate-600 font-medium">Điện trở tại {vDropInput.operatingTemp}°C:</span>
                      <p className="text-slate-900 font-bold text-base mt-0.5">{vDropResult.cableResistancePerKm} Ω/km</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-xs text-slate-500">
                  Cài đặt các thông số dây dẫn và nhấp nút "Tính toán sụt áp & tổn hao".
                </div>
              )}
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl text-[11px] text-slate-600 font-mono mt-6 border border-slate-200">
              Công thức: ΔV = √3 × I × L × (R cosφ + X sinφ) / 1000 có hiệu chỉnh nhiệt độ điện trở R_T.
            </div>
          </div>
        </div>
      )}

      {/* 2. Cable Sizing Calculator */}
      {activeModule === 'cable' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleSelectCable} className="liquid-glass-panel rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
              Chọn tiết diện cáp & Dòng mang điện
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Dòng điện tính toán (A)</label>
                <input
                  type="number"
                  value={cableInput.loadCurrent}
                  onChange={e => setCableInput({ ...cableInput, loadCurrent: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nhiệt độ môi trường (°C)</label>
                  <input
                    type="number"
                    value={cableInput.ambientTempC}
                    onChange={e => setCableInput({ ...cableInput, ambientTempC: parseFloat(e.target.value) || 30 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Số mạch ghép nhóm</label>
                  <input
                    type="number"
                    min={1}
                    value={cableInput.numberOfCircuits}
                    onChange={e => setCableInput({ ...cableInput, numberOfCircuits: parseInt(e.target.value, 10) || 1 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Chiều dài tuyến (m)</label>
                  <input
                    type="number"
                    value={cableInput.runLengthMeters}
                    onChange={e => setCableInput({ ...cableInput, runLengthMeters: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Giới hạn sụt áp (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={cableInput.maxVoltageDropPercent}
                    onChange={e => setCableInput({ ...cableInput, maxVoltageDropPercent: parseFloat(e.target.value) || 3.0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono shadow-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 mt-4 cursor-pointer"
            >
              Xác định tiết diện cáp
            </button>
          </form>

          {/* Sizing Output */}
          <div className="lg:col-span-2 liquid-glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider pb-4 border-b border-slate-200/80">
              Kết quả đề xuất tiết diện & Khả năng mang dòng
            </h3>

            {cableResult ? (
              <div className="mt-5 space-y-6">
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between shadow-sm">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-amber-800 font-bold">Tiết diện khuyến nghị</span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                      {cableResult.recommendedSizeMm2} mm² Cu XLPE
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 font-mono">
                      Dòng cho phép sau hiệu chỉnh: <span className="text-emerald-700 font-bold">{cableResult.effectiveAmpacity} A</span> (Tải: {cableInput.loadCurrent} A)
                    </p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Sụt áp thực tế</span>
                    <p className="text-xl font-black text-emerald-700">{cableResult.calculatedVoltageDropPercent}%</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-mono uppercase text-slate-500 font-bold mb-2.5">Các cấp tiết diện lân cận</h4>
                  <div className="overflow-x-auto rounded-2xl border border-slate-200 text-xs font-mono overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase border-b border-slate-200">
                        <tr>
                          <th className="p-3">Tiết diện (mm²)</th>
                          <th className="p-3">Dòng định mức hiệu chỉnh</th>
                          <th className="p-3">Sụt áp (%)</th>
                          <th className="p-3">Độ phù hợp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                        {cableResult.alternativeSizes.map(s => (
                          <tr key={s.sizeMm2} className={s.sizeMm2 === cableResult.recommendedSizeMm2 ? 'bg-amber-50/70 font-bold' : ''}>
                            <td className="p-3 font-bold">{s.sizeMm2} mm²</td>
                            <td className="p-3">{s.effectiveAmpacity} A</td>
                            <td className="p-3">{s.vDropPercent}%</td>
                            <td className="p-3">
                              {s.suitable ? (
                                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">Thỏa mãn</span>
                              ) : (
                                <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 font-bold">Không đủ</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Nhấp nút "Xác định tiết diện cáp" để thực hiện tính toán hiệu chỉnh nhiệt độ và ghép nhóm.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. PV String Design Calculator */}
      {activeModule === 'string' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleDesignString} className="liquid-glass-panel rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase text-amber-800 tracking-wider">
              Thông số tấm PV & Dải MPPT Inverter
            </h3>

            <div className="space-y-3 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PV Voc (STC, V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stringInput.pvVocSTC}
                    onChange={e => setStringInput({ ...stringInput, pvVocSTC: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">PV Vmp (STC, V)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={stringInput.pvVmpSTC}
                    onChange={e => setStringInput({ ...stringInput, pvVmpSTC: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Hệ số nhiệt Voc (%/°C)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={stringInput.pvTempCoeffVoc}
                    onChange={e => setStringInput({ ...stringInput, pvTempCoeffVoc: parseFloat(e.target.value) || -0.25 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Nhiệt độ MT thấp nhất (°C)</label>
                  <input
                    type="number"
                    value={stringInput.minAmbientTempC}
                    onChange={e => setStringInput({ ...stringInput, minAmbientTempC: parseFloat(e.target.value) || -5 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Inverter Max DC (V)</label>
                  <input
                    type="number"
                    value={stringInput.inverterMaxDcVoltage}
                    onChange={e => setStringInput({ ...stringInput, inverterMaxDcVoltage: parseFloat(e.target.value) || 1100 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-medium mb-1">Inverter MPPT Min (V)</label>
                  <input
                    type="number"
                    value={stringInput.inverterMpptMinVoltage}
                    onChange={e => setStringInput({ ...stringInput, inverterMpptMinVoltage: parseFloat(e.target.value) || 200 })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-amber-500/20 mt-4 cursor-pointer"
            >
              Kiểm tra cấu hình chuỗi
            </button>
          </form>

          {/* Sizing Output */}
          <div className="lg:col-span-2 liquid-glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase text-slate-900 tracking-wider pb-4 border-b border-slate-200/80">
              Kiểm tra số tấm PV trên một chuỗi & Voc mùa lạnh
            </h3>

            {stringResult ? (
              <div className="mt-5 space-y-6 font-mono">
                <div className="p-4 bg-white/80 border border-slate-200 rounded-2xl grid grid-cols-3 gap-4 text-center shadow-sm">
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Số tấm tối thiểu/chuỗi</span>
                    <p className="text-xl font-black text-slate-900 mt-1">{stringResult.minModulesPerString}</p>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] uppercase text-amber-800 font-bold">Số tấm khuyến nghị</span>
                    <p className="text-2xl font-black text-amber-700 mt-1">{stringResult.recommendedModulesPerString} Tấm</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-slate-500 font-bold">Số tấm tối đa/chuỗi</span>
                    <p className="text-xl font-black text-slate-900 mt-1">{stringResult.maxModulesPerString}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-slate-500 font-medium">Voc cực đại chuỗi ở {stringInput.minAmbientTempC}°C:</span>
                    <p className="text-lg font-black text-slate-900">{stringResult.totalStringVocMax} V</p>
                    <p className="text-[11px] text-slate-500">Giới hạn Inverter: {stringInput.inverterMaxDcVoltage} V</p>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <span className="text-slate-500 font-medium">Vmp tối thiểu chuỗi ở {stringInput.maxModuleTempC}°C:</span>
                    <p className="text-lg font-black text-slate-900">{stringResult.totalStringVmpMin} V</p>
                    <p className="text-[11px] text-slate-500">Cửa sổ MPPT: {stringInput.inverterMpptMinVoltage}V - {stringInput.inverterMpptMaxVoltage}V</p>
                  </div>
                </div>

                {stringResult.warnings.length > 0 && (
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-800 text-xs">
                    {stringResult.warnings.map((w, i) => (
                      <p key={i}>• {w}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-500">
                Nhấp nút "Kiểm tra cấu hình chuỗi" để tính toán dải điện áp và số tấm phù hợp.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
