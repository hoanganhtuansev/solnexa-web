import React, { useState } from 'react';
import {
  Cpu,
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  ArrowRight,
  Download,
  Flame,
  Layers
} from 'lucide-react';
import { Project, EquipmentModel } from '../types';

interface PcsEquipmentViewProps {
  project: Project;
  onOpenDatasheet: (equipment: any) => void;
}

export const PcsEquipmentView: React.FC<PcsEquipmentViewProps> = ({
  project,
  onOpenDatasheet
}) => {
  const isBess = project.type === 'BESS';

  // State for active inverter / PCS selection
  const [selectedPcsId, setSelectedPcsId] = useState<string>(
    isBess ? 'huawei-pcs-2000' : 'huawei-sun2000-100ktl'
  );

  const solarInverterList = [
    {
      id: 'huawei-sun2000-100ktl',
      manufacturer: 'Huawei',
      model: 'SUN2000-100KTL-M2',
      powerKw: 100,
      unitsNeeded: 5,
      totalAcKw: 500,
      efficiencyPercent: 98.8,
      mpptCount: 10,
      dcInputsPerMppt: 2,
      maxDcVoltage: 1100,
      mpptVoltageRange: '200 - 1000 V',
      nominalAcVoltage: '400V 3P4W (50Hz)',
      maxAcCurrent: 160.4,
      totalAcCurrent: 802,
      protection: 'IP66, Type II SPD AC/DC, AFCI, Smart I-V Curve Diagnosis',
      cooling: 'Smart Air Cooling',
      unitPriceJpy: 850000
    },
    {
      id: 'sungrow-sg110cx',
      manufacturer: 'Sungrow',
      model: 'SG110CX-P2',
      powerKw: 110,
      unitsNeeded: 5,
      totalAcKw: 550,
      efficiencyPercent: 98.6,
      mpptCount: 9,
      dcInputsPerMppt: 2,
      maxDcVoltage: 1100,
      mpptVoltageRange: '200 - 1000 V',
      nominalAcVoltage: '400V 3P4W (50Hz)',
      maxAcCurrent: 175.2,
      totalAcCurrent: 876,
      protection: 'IP66, C5 Corrosion, Type II SPD',
      cooling: 'Smart Forced Air Cooling',
      unitPriceJpy: 920000
    },
    {
      id: 'huawei-sun2000-50ktl',
      manufacturer: 'Huawei',
      model: 'SUN2000-50KTL-M3',
      powerKw: 50,
      unitsNeeded: 10,
      totalAcKw: 500,
      efficiencyPercent: 98.5,
      mpptCount: 4,
      dcInputsPerMppt: 2,
      maxDcVoltage: 1100,
      mpptVoltageRange: '200 - 1000 V',
      nominalAcVoltage: '400V 3P4W (50Hz)',
      maxAcCurrent: 79.7,
      totalAcCurrent: 797,
      protection: 'IP66, Smart String Level Monitoring',
      cooling: 'Natural Convection Cooling',
      unitPriceJpy: 460000
    }
  ];

  const bessPcsList = [
    {
      id: 'huawei-pcs-2000',
      manufacturer: 'Huawei',
      model: 'Smart String PCS 2000kW',
      powerKw: 2000,
      unitsNeeded: 1,
      totalAcKw: 2000,
      efficiencyPercent: 99.0,
      mpptCount: 4, // 4 battery container branches
      dcInputsPerMppt: 1,
      maxDcVoltage: 1500,
      mpptVoltageRange: '1000 - 1500 V',
      nominalAcVoltage: '690V 3P3W (50Hz)',
      maxAcCurrent: 1756.8,
      totalAcCurrent: 1756.8,
      protection: 'IP65, Liquid-Cooled Power Module, Grid-Forming & Black Start, Synthetic Inertia',
      cooling: 'Intelligent Liquid Cooling',
      unitPriceJpy: 28500000
    },
    {
      id: 'sungrow-sc2000ud',
      manufacturer: 'Sungrow',
      model: 'SC2000UD Central Storage Inverter',
      powerKw: 2000,
      unitsNeeded: 1,
      totalAcKw: 2000,
      efficiencyPercent: 98.9,
      mpptCount: 2,
      dcInputsPerMppt: 2,
      maxDcVoltage: 1500,
      mpptVoltageRange: '950 - 1500 V',
      nominalAcVoltage: '690V 3P3W (50Hz)',
      maxAcCurrent: 1740.0,
      totalAcCurrent: 1740.0,
      protection: 'IP65, C5 Anti-Corrosion, 4-Quadrant P/Q Control',
      cooling: 'Smart Forced Air Cooling',
      unitPriceJpy: 27800000
    }
  ];

  const currentList = isBess ? bessPcsList : solarInverterList;
  const activePcs = currentList.find(p => p.id === selectedPcsId) || currentList[0];

  return (
    <div className="space-y-6">
      {/* 1. Top Spec Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${
            isBess ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-[#2563eb]'
          }`}>
            <Cpu className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {isBess ? 'Bidirectional Power Conversion System (PCS)' : 'Grid-Tied String Inverter System'}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isBess
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}>
                {activePcs.manufacturer} {activePcs.model}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBess
                ? 'Bidirectional 4-quadrant AC/DC conversion | 1,500V DC Bus | Grid-Forming & Black Start'
                : '1,100V Max DC String Inverter | High Euro-efficiency | 10 independent MPPTs with anti-PID'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenDatasheet(activePcs)}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
        >
          <FileText className="w-3.5 h-3.5 text-[#2563eb]" />
          <span>View Verified Datasheet</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Total AC Capacity</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {activePcs.totalAcKw.toLocaleString()} kW
          </div>
          <div className="text-[11px] text-[#2563eb] font-medium mt-0.5">
            {activePcs.unitsNeeded} unit{activePcs.unitsNeeded > 1 ? 's' : ''} &times; {activePcs.powerKw} kW
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Max System Efficiency</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {activePcs.efficiencyPercent} %
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            European Weighted: {(activePcs.efficiencyPercent - 0.4).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">AC Output Voltage</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {activePcs.nominalAcVoltage.split(' ')[0]}
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-0.5">
            {isBess ? '690V 3-Phase 3-Wire' : '400V 3-Phase 4-Wire'}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Max Total AC Current</div>
          <div className="text-2xl font-extrabold text-indigo-600 mt-1">
            {Math.round(activePcs.totalAcCurrent)} A
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Breaker: {Math.round(activePcs.totalAcCurrent * 1.25)}A Rated
          </div>
        </div>
      </div>

      {/* 3. Model Selector & Technical Details Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Model List & Selection (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3.5">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-[#2563eb]" />
            <span>Select Inverter / PCS Model</span>
          </h3>

          <div className="space-y-2.5">
            {currentList.map(item => {
              const isSelected = selectedPcsId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedPcsId(item.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-200 shadow-xs'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{item.manufacturer}</span>
                    <span className="text-xs font-mono font-bold text-[#2563eb]">
                      {item.powerKw} kW &times; {item.unitsNeeded}
                    </span>
                  </div>
                  <div className="text-xs text-slate-700 font-mono mt-0.5">{item.model}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                    <span>Eff: {item.efficiencyPercent}% | {item.nominalAcVoltage.split(' ')[0]}</span>
                    <span className="font-semibold text-slate-700">¥ {item.unitPriceJpy.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Technical Parameters Spec Sheet (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {activePcs.manufacturer} {activePcs.model}
              </h3>
              <p className="text-xs text-slate-500">Full electrical datasheet verified according to manufacturer catalog</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              IEC 62109 / VDE-AR-N 4110
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[11px]">DC Voltage Range</span>
              <p className="font-bold text-slate-900">{activePcs.mpptVoltageRange}</p>
              <p className="text-[10px] text-slate-400">Max DC: {activePcs.maxDcVoltage} V</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[11px]">MPPT / Inputs</span>
              <p className="font-bold text-slate-900">{activePcs.mpptCount} MPPTs</p>
              <p className="text-[10px] text-slate-400">{activePcs.dcInputsPerMppt} Inputs per MPPT</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[11px]">AC Grid Voltage</span>
              <p className="font-bold text-slate-900">{activePcs.nominalAcVoltage}</p>
              <p className="text-[10px] text-slate-400">Frequency: 50 Hz &plusmn; 2.5Hz</p>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[11px]">Thermal Management</span>
              <p className="font-bold text-slate-900">{activePcs.cooling}</p>
              <p className="text-[10px] text-slate-400">Ambient: -25&deg;C to +60&deg;C</p>
            </div>

            <div className="col-span-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <span className="text-slate-500 text-[11px]">Protective Functions &amp; Compliance</span>
              <p className="font-medium text-slate-800">{activePcs.protection}</p>
              <p className="text-[10px] text-slate-500">
                Anti-islanding, DC Reverse Polarity, AC Short-Circuit, Residual Current Monitoring, Insulation Resistance
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
