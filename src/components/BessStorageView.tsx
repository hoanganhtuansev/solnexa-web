import React, { useState } from 'react';
import {
  BatteryCharging,
  Thermometer,
  ShieldCheck,
  Cpu,
  Layers,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Upload,
  RefreshCw,
  Box,
  Sliders
} from 'lucide-react';
import { Project, EquipmentModel } from '../types';
import { APP_IMAGES } from '../assets/images';

interface BessStorageViewProps {
  project: Project;
  onUpdateProject?: (updated: Partial<Project>) => void;
  onOpenDatasheetModal?: () => void;
}

export const BessStorageView: React.FC<BessStorageViewProps> = ({
  project,
  onUpdateProject,
  onOpenDatasheetModal
}) => {
  const [containerCount, setContainerCount] = useState<number>(
    project.bessConfig?.enclosureCount || 4
  );
  const [targetCRate, setTargetCRate] = useState<number>(
    project.bessConfig?.cRate || 0.25
  );
  const [dodPercent, setDodPercent] = useState<number>(
    project.bessConfig?.depthOfDischargePercent || 85
  );
  const [activeContainerTab, setActiveContainerTab] = useState<number>(1);

  // Each Huawei LUNA2000 container is 2.032 MWh
  const perContainerCapacityKwh = 2032;
  const totalCapacityKwh = containerCount * perContainerCapacityKwh;
  const totalCapacityMwh = (totalCapacityKwh / 1000).toFixed(2);
  const dischargeHours = (1 / targetCRate).toFixed(1);
  const totalDcPowerKw = Math.round(totalCapacityKwh * targetCRate);

  const handleContainerChange = (count: number) => {
    setContainerCount(count);
    if (onUpdateProject) {
      onUpdateProject({
        storageCapacityMwh: parseFloat((count * 2.032).toFixed(2)),
        bessConfig: {
          ...project.bessConfig!,
          enclosureCount: count,
          usableCapacityMwh: parseFloat((count * 2.032 * (dodPercent / 100)).toFixed(2))
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Top Spec Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BatteryCharging className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Huawei Smart String Utility BESS Architecture
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                4x LUNA2000-2.0MWH-2H1
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard 20-foot High Cube Container | Liquid-Cooled LFP Architecture | Certified to NFPA 855, UL 9540A
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenDatasheetModal}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Datasheet</span>
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total Storage Capacity</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCapacityMwh} MWh</div>
          <div className="text-[11px] text-indigo-600 font-medium mt-0.5">
            {containerCount}x 2.032 MWh Containers
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Nominal DC Discharge</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{(totalDcPowerKw / 1000).toFixed(2)} MW</div>
          <div className="text-[11px] text-slate-600 font-medium mt-0.5">
            @ {targetCRate}C ({dischargeHours} Hours duration)
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Operating Voltage Range</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">1,000 - 1,500 V</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Nominal 1,200V DC bus</div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Battery Chemistry &amp; Life</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">LFP 6,000 C</div>
          <div className="text-[11px] text-slate-500 mt-0.5">15 Years @ 85% DoD</div>
        </div>
      </div>

      {/* 3. Container Configuration Controls & Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Container Selector & Graphic (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Box className="w-4 h-4 text-indigo-600" />
              <span>Container Layout &amp; Individual Enclosure Telemetry</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              Enclosure Form: ISO 20ft High Cube (6.06m × 2.44m × 2.90m)
            </span>
          </div>

          {/* Visual Container Yard Photo Banner */}
          <div className="relative h-44 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 group">
            <img
              src={APP_IMAGES.bessContainer}
              alt="BESS Modular Container Units"
              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />
            <div className="absolute top-3 left-3 flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-600 text-white shadow-xs">
                UTILITY BESS YARD
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                Liquid Cooled LFP Enclosures
              </span>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
              <div className="font-semibold drop-shadow-xs">
                Active Enclosure Station #{activeContainerTab} of {containerCount}
              </div>
              <div className="text-[11px] font-mono text-emerald-300 bg-black/40 px-2 py-0.5 rounded border border-emerald-500/30">
                Liquid Loop: 24.8°C (Optimal)
              </div>
            </div>
          </div>

          {/* 4 Interactive Container Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {Array.from({ length: containerCount }).map((_, idx) => {
              const num = idx + 1;
              const isSelected = activeContainerTab === num;
              return (
                <div
                  key={num}
                  onClick={() => setActiveContainerTab(num)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50/80 border-indigo-400 ring-2 ring-indigo-200 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">Container #{num}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  </div>
                  <div className="text-xs font-semibold text-indigo-700">2,032 kWh</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">12 Racks | 1,200V DC</div>
                </div>
              );
            })}
          </div>

          {/* Selected Container Internal Specs Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white">
                  Huawei LUNA2000-2.0MWH-2H1 (Unit #{activeContainerTab})
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ONLINE &bull; NORMAL
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono">Serial: HW-LUNA-2026-00{activeContainerTab}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Cell Chemistry</span>
                <p className="font-semibold text-slate-100">Lithium Iron Phosphate (LFP)</p>
                <p className="text-[10px] text-slate-400">280 Ah Prismatic Cells</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Thermal Management</span>
                <p className="font-semibold text-slate-100">Intelligent Liquid Cooling</p>
                <p className="text-[10px] text-emerald-400">&Delta;T &le; 2.5&deg;C cell-to-cell</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Max DC Current</span>
                <p className="font-semibold text-slate-100">416.7 A (Continuous)</p>
                <p className="text-[10px] text-slate-400">Integrated DC Breaker 630A</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 text-[11px]">Fire Suppression</span>
                <p className="font-semibold text-slate-100">NFPA 855 / 69 Certified</p>
                <p className="text-[10px] text-slate-400">Aerosol + Gas Detection</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Thermometer className="w-4 h-4 text-cyan-400" />
                <span>Liquid Chiller Auxiliary Consumption: <strong>32.0 kW avg</strong></span>
              </div>
              <div className="text-slate-400 font-mono text-[11px]">
                Enclosure Weight: 31,000 kg (with cells)
              </div>
            </div>
          </div>
        </div>

        {/* Right: Engineering Sizing Controls (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#2563eb]" />
            <span>BESS Operational Parameters</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Number of Huawei Containers
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[1, 2, 4, 6].map(num => (
                  <button
                    key={num}
                    onClick={() => handleContainerChange(num)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                      containerCount === num
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num} Units
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                4 Containers = 8.128 MWh matches the user request
              </p>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Discharge C-Rate
              </label>
              <select
                value={targetCRate}
                onChange={e => setTargetCRate(parseFloat(e.target.value))}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs"
              >
                <option value={0.25}>0.25 C (4.0 Hours Duration - Standard Utility)</option>
                <option value={0.5}>0.50 C (2.0 Hours Duration)</option>
                <option value={1.0}>1.00 C (1.0 Hour Fast Response)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                Depth of Discharge (DoD Window)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="70"
                  max="95"
                  step="5"
                  value={dodPercent}
                  onChange={e => setDodPercent(parseInt(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <span className="font-mono font-bold text-slate-900 w-12 text-right">{dodPercent}%</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">Recommended 85% for 15-year warranty protection</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Total Energy Available:</span>
                <span className="font-bold text-slate-900 font-mono">{(totalCapacityKwh * (dodPercent / 100)).toLocaleString()} kWh</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>PCS Power Output:</span>
                <span className="font-bold text-slate-900 font-mono">2,000 kW AC</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>DC Cable Cross-Section:</span>
                <span className="font-bold text-indigo-700 font-mono">CVT 150 mm² (1500V)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Auxiliary Chiller Load:</span>
                <span className="font-bold text-slate-900 font-mono">{(containerCount * 32)} kW</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
