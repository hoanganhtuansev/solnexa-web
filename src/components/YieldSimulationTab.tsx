import React, { useState } from 'react';
import {
  LineChart,
  Sun,
  BatteryCharging,
  Zap,
  TrendingUp,
  Activity,
  Download,
  Calendar,
  Layers,
  Clock,
  Coins,
  ShieldCheck,
  CheckCircle2,
  ArrowDownRight
} from 'lucide-react';
import { Project } from '../types';

interface YieldSimulationTabProps {
  project: Project;
}

export const YieldSimulationTab: React.FC<YieldSimulationTabProps> = ({ project }) => {
  const isBess = project.type === 'BESS';

  // Solar Simulation Parameters (500 kW Chiba)
  const [tiltAngle, setTiltAngle] = useState(15);
  const [tariffJpy, setTariffJpy] = useState(12.5); // JPY/kWh
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  // BESS Simulation Parameters (2 MW / 8 MWh)
  const [cyclesPerDay, setCyclesPerDay] = useState(1.0);
  const [arbitrageSpreadJpy, setArbitrageSpreadJpy] = useState(16.0); // JPY/kWh spread
  const [capacityPaymentJpy, setCapacityPaymentJpy] = useState(3800); // JPY/kW-year

  // Monthly Solar Generation Data (Chiba, Japan - 500 kW system)
  const monthlySolarData = [
    { month: 'Jan', ghi: 85.2, poa: 104.5, kwh: 43200, pr: 83.5, sunshineHrs: 185 },
    { month: 'Feb', ghi: 98.4, poa: 114.2, kwh: 47100, pr: 83.1, sunshineHrs: 180 },
    { month: 'Mar', ghi: 132.5, poa: 142.1, kwh: 58500, pr: 82.8, sunshineHrs: 205 },
    { month: 'Apr', ghi: 154.2, poa: 158.4, kwh: 64900, pr: 82.2, sunshineHrs: 210 },
    { month: 'May', ghi: 168.0, poa: 165.2, kwh: 67300, pr: 81.5, sunshineHrs: 215 },
    { month: 'Jun', ghi: 142.5, poa: 136.8, kwh: 55400, pr: 80.8, sunshineHrs: 160 },
    { month: 'Jul', ghi: 165.1, poa: 160.3, kwh: 65100, pr: 80.2, sunshineHrs: 195 },
    { month: 'Aug', ghi: 172.4, poa: 170.8, kwh: 69200, pr: 80.5, sunshineHrs: 220 },
    { month: 'Sep', ghi: 128.6, poa: 132.5, kwh: 53800, pr: 81.8, sunshineHrs: 165 },
    { month: 'Oct', ghi: 110.2, poa: 122.4, kwh: 50100, pr: 82.6, sunshineHrs: 175 },
    { month: 'Nov', ghi: 88.5, poa: 106.8, kwh: 43900, pr: 83.2, sunshineHrs: 180 },
    { month: 'Dec', ghi: 81.2, poa: 102.1, kwh: 42100, pr: 83.8, sunshineHrs: 185 }
  ];

  const totalAnnualSolarKwh = monthlySolarData.reduce((sum, d) => sum + d.kwh, 0);
  const specificYield = Math.round(totalAnnualSolarKwh / (project.totalPvCapacityKwp || 500));
  const avgPr = 82.1;
  const annualSolarRevenue = Math.round(totalAnnualSolarKwh * tariffJpy);

  // 24-Hour BESS Dispatch Profile
  const bessHourlyProfile = [
    { hour: '00:00', powerMw: 0, socPercent: 20, gridPriceJpy: 8.5 },
    { hour: '02:00', powerMw: 0, socPercent: 20, gridPriceJpy: 7.8 },
    { hour: '04:00', powerMw: 0, socPercent: 20, gridPriceJpy: 7.2 },
    { hour: '06:00', powerMw: 0, socPercent: 20, gridPriceJpy: 9.5 },
    { hour: '08:00', powerMw: -1.0, socPercent: 32, gridPriceJpy: 11.2 },
    { hour: '09:00', powerMw: -2.0, socPercent: 55, gridPriceJpy: 9.8 }, // Charge
    { hour: '10:00', powerMw: -2.0, socPercent: 78, gridPriceJpy: 8.2 }, // Charge
    { hour: '11:00', powerMw: -2.0, socPercent: 90, gridPriceJpy: 6.5 }, // Full
    { hour: '12:00', powerMw: 0, socPercent: 90, gridPriceJpy: 7.0 },
    { hour: '14:00', powerMw: 0, socPercent: 90, gridPriceJpy: 9.0 },
    { hour: '16:00', powerMw: 0, socPercent: 90, gridPriceJpy: 14.5 },
    { hour: '17:00', powerMw: 2.0, socPercent: 68, gridPriceJpy: 26.5 }, // Discharge
    { hour: '18:00', powerMw: 2.0, socPercent: 46, gridPriceJpy: 31.0 }, // Peak discharge
    { hour: '19:00', powerMw: 2.0, socPercent: 24, gridPriceJpy: 28.5 }, // Discharge
    { hour: '20:00', powerMw: 1.0, socPercent: 15, gridPriceJpy: 22.0 }, // Finish
    { hour: '22:00', powerMw: 0, socPercent: 15, gridPriceJpy: 14.0 }
  ];

  // BESS Annual Financials
  const dailyDischargeKwh = 7150; // 8.128 MWh * 88% RTE
  const annualArbitrageGross = Math.round(dailyDischargeKwh * 365 * (arbitrageSpreadJpy / 1000) * 1000);
  const annualCapacityRevenue = Math.round(2000 * capacityPaymentJpy);
  const annualBessTotalRevenue = annualArbitrageGross + annualCapacityRevenue;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isBess ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <LineChart className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {isBess
                  ? 'BESS 24h Dispatch & Lifetime Degradation Simulation'
                  : 'Solar Energy Yield & Performance Ratio (PR) Simulation'}
              </h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isBess
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isBess ? '2 MW / 8 MWh (4x Huawei)' : '500 kWp (Chiba, JP)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {isBess
                ? 'Model: Huawei LUNA2000-2.0MWH-2H1 (4 units) | Liquid cooling LFP | JEPX Arbitrage & Capacity Market'
                : 'Meteo Data: METI / NEDO Monitored Solar Radiation DB | 862x Trina 580W N-type TOPCon'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => window.print()}
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Yield Report</span>
        </button>
      </div>

      {/* 2. Top Metric Cards */}
      {isBess ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Usable Battery Capacity</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">8,128 kWh</div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">4x Huawei Containers</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Round-Trip Efficiency (RTE)</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">88.5 %</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">AC to AC system efficiency</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Cycle Life Warranty</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">6,000 Cycles</div>
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">15 Years @ 1.0 cycle/day</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Projected Annual Revenue</div>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">¥{annualBessTotalRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">Arbitrage + Capacity Market</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Annual Energy Yield</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{totalAnnualSolarKwh.toLocaleString()} kWh</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">+3.2% vs standard P50</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Specific Yield</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{specificYield} kWh/kWp</div>
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">Chiba Rooftop (15° tilt)</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Performance Ratio (PR)</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{avgPr}%</div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">N-type TOPCon low thermal loss</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Annual Revenue (PPA / FIP)</div>
            <div className="text-xl font-extrabold text-amber-600 mt-1">¥{annualSolarRevenue.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">@ {tariffJpy} JPY/kWh tariff</div>
          </div>
        </div>
      )}

      {/* 3. Main Chart & Breakdown Section */}
      {isBess ? (
        /* BESS 24h Dispatch Visualization */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: 24h Dispatch Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  24-Hour Battery Dispatch Schedule (MW &amp; State-of-Charge %)
                </h3>
                <p className="text-xs text-slate-500">
                  Charging during daytime solar surge (09:00 - 12:00) | Discharging at evening peak tariff (17:00 - 20:00)
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block"></span>
                  <span className="text-slate-600">Discharge (+MW)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span>
                  <span className="text-slate-600">Charge (-MW)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-1 bg-amber-500 inline-block"></span>
                  <span className="text-slate-600">SoC (%)</span>
                </span>
              </div>
            </div>

            {/* Custom SVG Bar & Curve Chart */}
            <div className="h-64 w-full bg-slate-50/50 rounded-lg border border-slate-100 p-3 relative flex flex-col justify-between">
              {/* Top reference line for 100% SoC */}
              <div className="border-b border-dashed border-slate-200 flex justify-between text-[10px] text-slate-400 pb-0.5">
                <span>+2.0 MW / 100% SoC</span>
                <span>Peak Discharge</span>
              </div>
              <div className="border-b border-dashed border-slate-200 flex justify-between text-[10px] text-slate-400 py-0.5">
                <span>0.0 MW Standby (50% SoC)</span>
                <span>Idling / Grid Reserve</span>
              </div>
              <div className="border-b border-dashed border-slate-200 flex justify-between text-[10px] text-slate-400 pt-0.5">
                <span>-2.0 MW / 10% SoC</span>
                <span>Max Fast Charge</span>
              </div>

              {/* Bar visualization */}
              <div className="grid grid-cols-16 gap-1 h-36 items-end pt-2">
                {bessHourlyProfile.map((pt, i) => {
                  const isCharging = pt.powerMw < 0;
                  const isDischarging = pt.powerMw > 0;
                  const barHeight = Math.abs(pt.powerMw) * 45; // max 90px
                  return (
                    <div key={i} className="flex flex-col items-center justify-end h-full group relative">
                      {/* Bar */}
                      <div
                        style={{ height: `${barHeight}px` }}
                        className={`w-full rounded-xs transition-all ${
                          isDischarging
                            ? 'bg-emerald-500 group-hover:bg-emerald-600'
                            : isCharging
                            ? 'bg-blue-500 group-hover:bg-blue-600'
                            : 'bg-slate-200 h-1'
                        }`}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 bg-slate-900 text-white text-[10px] rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 pointer-events-none z-20 whitespace-nowrap shadow-md">
                        {pt.hour}: {pt.powerMw} MW (SoC {pt.socPercent}%)
                      </div>
                      <span className="text-[9px] text-slate-400 mt-1 transform -rotate-45 origin-left truncate">
                        {pt.hour.slice(0, 2)}h
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 15-Year Degradation Curve */}
            <div className="p-3.5 rounded-lg bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-indigo-950">Huawei Liquid-Cooled LFP Degradation Model</span>
                <span className="text-indigo-700 font-semibold font-mono">EOL: 70.8% Capacity @ Year 15</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-400 text-[10px]">Year 1 (BOL)</div>
                  <div className="font-bold text-slate-900">8,128 kWh (100%)</div>
                </div>
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-400 text-[10px]">Year 5</div>
                  <div className="font-bold text-slate-900">7,559 kWh (93.0%)</div>
                </div>
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-400 text-[10px]">Year 10</div>
                  <div className="font-bold text-slate-900">6,746 kWh (83.0%)</div>
                </div>
                <div className="bg-white p-2 rounded border border-indigo-100">
                  <div className="text-slate-400 text-[10px]">Year 15 (EOL)</div>
                  <div className="font-bold text-slate-900">5,754 kWh (70.8%)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: BESS Revenue & Dispatch Parameters (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Coins className="w-4 h-4 text-emerald-600" />
              <span>Revenue Parameters &amp; Arbitrage</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Daily Full Cycles (C-Rate 0.25C)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={cyclesPerDay}
                    onChange={e => setCyclesPerDay(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                  <span className="font-mono font-bold text-slate-900 w-12 text-right">{cyclesPerDay}x</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  JEPX Arbitrage Spread (JPY/kWh)
                </label>
                <input
                  type="number"
                  value={arbitrageSpreadJpy}
                  onChange={e => setArbitrageSpreadJpy(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Average spread between 11:00 charge &amp; 18:00 peak discharge</p>
              </div>

              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  Capacity Market Payment (JPY/kW-year)
                </label>
                <input
                  type="number"
                  value={capacityPaymentJpy}
                  onChange={e => setCapacityPaymentJpy(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">OCCTO Capacity Market auction price</p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Energy Arbitrage:</span>
                  <span className="font-bold text-slate-900">¥{annualArbitrageGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Capacity Market Payment:</span>
                  <span className="font-bold text-slate-900">¥{annualCapacityRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                  <span>Estimated Total Revenue:</span>
                  <span className="text-emerald-600 font-mono">¥{annualBessTotalRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Solar PV 500kW Monthly Generation Chart */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Monthly Generation Bar Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Monthly Energy Yield (kWh/Month) &amp; Global Irradiance
                </h3>
                <p className="text-xs text-slate-500">
                  Chiba Factory site simulation: 862x Trina 580W TOPCon | 15° Fixed tilt
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-3 rounded bg-amber-500 inline-block"></span>
                  <span className="text-slate-600">Generation (kWh)</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span className="w-3 h-1 bg-blue-500 inline-block"></span>
                  <span className="text-slate-600">PR ({avgPr}%)</span>
                </span>
              </div>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="h-64 w-full bg-slate-50/50 rounded-lg border border-slate-100 p-4 flex items-end justify-between gap-2">
              {monthlySolarData.map((d, i) => {
                const heightPercent = (d.kwh / 75000) * 100;
                const isSelected = selectedMonth === i;
                return (
                  <div
                    key={d.month}
                    onClick={() => setSelectedMonth(isSelected ? null : i)}
                    className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                  >
                    <div className="text-[10px] text-slate-500 mb-1 font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {Math.round(d.kwh / 1000)}k
                    </div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        isSelected
                          ? 'bg-amber-600 shadow-md ring-2 ring-amber-400'
                          : 'bg-amber-400 hover:bg-amber-500'
                      }`}
                    />
                    <span className="text-[10px] font-semibold text-slate-600 mt-2">
                      {d.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected Month Detail Banner */}
            {selectedMonth !== null && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-amber-950">
                    {monthlySolarData[selectedMonth].month} Details:
                  </span>{' '}
                  <span className="text-amber-900">
                    POA Irradiance: {monthlySolarData[selectedMonth].poa} kWh/m² | Sunshine: {monthlySolarData[selectedMonth].sunshineHrs} hrs | PR: {monthlySolarData[selectedMonth].pr}%
                  </span>
                </div>
                <div className="font-bold font-mono text-amber-800">
                  {monthlySolarData[selectedMonth].kwh.toLocaleString()} kWh
                </div>
              </div>
            )}
          </div>

          {/* Right: Loss Waterfall Analysis (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <Activity className="w-4 h-4 text-[#2563eb]" />
              <span>Loss Waterfall &amp; System Derate</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100">
                <span className="text-slate-600">Nominal STC Array Power:</span>
                <span className="font-bold text-slate-900">500.0 kWp</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>Soiling &amp; Dust Loss:</span>
                <span className="font-mono">-2.0%</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>Temperature Derating (TOPCon -0.30%/°C):</span>
                <span className="font-mono">-6.8%</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>Low Irradiance &amp; Reflection:</span>
                <span className="font-mono">-1.8%</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>DC Cable Ohmic Drop:</span>
                <span className="font-mono">-0.9%</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>Inverter Conversion Loss:</span>
                <span className="font-mono">-1.2%</span>
              </div>
              <div className="flex justify-between items-center text-rose-600">
                <span>Step-Up Transformer (Hitachi 500kVA):</span>
                <span className="font-mono">-1.4%</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-t border-slate-200 font-bold text-slate-900">
                <span>Overall System PR:</span>
                <span className="text-emerald-600 font-mono">82.1 %</span>
              </div>
            </div>

            {/* 25-Year Degradation Summary */}
            <div className="pt-2 border-t border-slate-100">
              <div className="text-[11px] font-semibold text-slate-700 mb-1.5">
                25-Year Linear Power Warranty (Trina Vertex N)
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Year 1 Degradation:</span>
                  <span className="font-bold text-slate-900">1.0% (99.0% output)</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual Fade (Years 2-25):</span>
                  <span className="font-bold text-slate-900">0.40% / year</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Year 25 Guaranteed Output:</span>
                  <span>87.4% of STC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
