import React, { useState } from 'react';
import {
  Zap,
  Activity,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Layers,
  Thermometer,
  Radio,
  Download,
  AlertCircle
} from 'lucide-react';
import { Project } from '../types';

interface TransformerGridViewProps {
  project: Project;
  mode: 'transformer' | 'grid';
  onOpenDatasheet?: (equip: any) => void;
}

export const TransformerGridView: React.FC<TransformerGridViewProps> = ({
  project,
  mode,
  onOpenDatasheet
}) => {
  const isBess = project.type === 'BESS';

  // Transformer specifications
  const transformerData = isBess
    ? {
        manufacturer: 'Hitachi Energy',
        model: 'TR-2500kVA-6.6kV',
        ratingKva: 2500,
        primaryVoltage: '690 V (Delta)',
        secondaryVoltage: '6,600 V (Wye / Dyn11)',
        frequency: '50 Hz',
        impedancePercent: 6.0,
        coolingType: 'ONAN (Oil Natural Air Natural)',
        noLoadLossKw: 2.8,
        loadLossKw: 18.5,
        totalEfficiency: 99.15,
        insulationClass: 'A (Oil-immersed outdoor)',
        tempRiseLimit: '55 °C winding / 50 °C oil',
        standard: 'JIS C 4304 / JEC-2200',
        weightKg: 6800,
        oilVolumeLiters: 1650,
        priceJpy: 18500000
      }
    : {
        manufacturer: 'Hitachi Energy',
        model: 'TR-500kVA-6.6kV',
        ratingKva: 500,
        primaryVoltage: '400 V (Delta)',
        secondaryVoltage: '6,600 V (Wye / Dyn11)',
        frequency: '50 Hz',
        impedancePercent: 4.5,
        coolingType: 'ONAN (Oil Natural Air Natural)',
        noLoadLossKw: 0.95,
        loadLossKw: 4.8,
        totalEfficiency: 98.86,
        insulationClass: 'A (Oil-immersed outdoor)',
        tempRiseLimit: '55 °C winding / 50 °C oil',
        standard: 'JIS C 4304 / JEC-2200',
        weightKg: 2450,
        oilVolumeLiters: 680,
        priceJpy: 6800000
      };

  // Grid Interconnection Switchgear specifications
  const gridSwitchgearData = isBess
    ? {
        pccVoltage: '6.6 kV High Voltage',
        ratedCurrent: '1,250 A',
        shortCircuitBreaking: '20.0 kA / 3s',
        vcbModel: 'Mitsubishi Electric VCB 7.2kV 1250A 20kA',
        dsModel: 'Disconnecting Switch DS 7.2kV 1250A Gang-Operated',
        laModel: 'Gapless ZnO Lightning Arrester 8.4kV 5kA',
        vctRating: 'VCT 6600V/110V (Cl 0.5) / 250/5A (Cl 0.5)',
        protectiveRelays: [
          { code: '51', name: 'Overcurrent Relay (OCR)', status: 'Active (T=0.3s)' },
          { code: '51N', name: 'Ground Overcurrent (OCGR)', status: 'Active (Io=0.2A)' },
          { code: '67 / DGR', name: 'Directional Ground Relay', status: 'Mandatory (Zero Seq Vo/Io)' },
          { code: '27 / 59', name: 'Under / Over Voltage', status: 'Active (UVR 80%, OVR 115%)' },
          { code: '81U / 81O', name: 'Under / Over Frequency', status: 'Active (49.5Hz / 50.5Hz)' }
        ],
        utilityCompliance: 'TEPCO Power Grid High-Voltage System Interconnection Code compliant'
      }
    : {
        pccVoltage: '6.6 kV High Voltage',
        ratedCurrent: '630 A',
        shortCircuitBreaking: '12.5 kA / 3s',
        vcbModel: 'Mitsubishi Electric VCB 7.2kV 630A 12.5kA',
        dsModel: 'Disconnecting Switch DS 7.2kV 630A Gang-Operated',
        laModel: 'Gapless ZnO Lightning Arrester 8.4kV 2.5kA',
        vctRating: 'VCT 6600V/110V (Cl 0.5) / 60/5A (Cl 0.5)',
        protectiveRelays: [
          { code: '51', name: 'Overcurrent Relay (OCR)', status: 'Active (T=0.3s)' },
          { code: '51N', name: 'Ground Overcurrent (OCGR)', status: 'Active (Io=0.2A)' },
          { code: '67 / DGR', name: 'Directional Ground Relay', status: 'Mandatory (Zero Seq Vo/Io)' },
          { code: '27 / 59', name: 'Under / Over Voltage', status: 'Active (UVR 80%, OVR 115%)' },
          { code: '81U / 81O', name: 'Under / Over Frequency', status: 'Active (49.5Hz / 50.5Hz)' }
        ],
        utilityCompliance: 'TEPCO Power Grid High-Voltage System Interconnection Code compliant'
      };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            {mode === 'transformer' ? (
              <Layers className="w-6 h-6 stroke-[2]" />
            ) : (
              <Radio className="w-6 h-6 stroke-[2]" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {mode === 'transformer'
                  ? 'High-Efficiency Step-Up Transformer (Hitachi Energy)'
                  : '6.6 kV High-Voltage Grid Interconnection Switchgear (PCC)'}
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {mode === 'transformer' ? transformerData.model : 'TEPCO Interconnection'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {mode === 'transformer'
                ? `${transformerData.ratingKva} kVA | ${transformerData.primaryVoltage} to ${transformerData.secondaryVoltage} | JIS C 4304 compliant`
                : `${gridSwitchgearData.pccVoltage} | ${gridSwitchgearData.ratedCurrent} Rated | VCB / DS / LA / VCT Cubicle`}
            </p>
          </div>
        </div>

        {mode === 'transformer' && onOpenDatasheet && (
          <button
            onClick={() => onOpenDatasheet(transformerData)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
          >
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>View Datasheet</span>
          </button>
        )}
      </div>

      {/* 2. Top Metric Cards */}
      {mode === 'transformer' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Rated Power</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {transformerData.ratingKva.toLocaleString()} kVA
            </div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">Dyn11 Vector Group</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Impedance Voltage (%Z)</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {transformerData.impedancePercent} %
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Limits Short-Circuit kA</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Peak Full-Load Efficiency</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              {transformerData.totalEfficiency} %
            </div>
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">
              Loss: {transformerData.loadLossKw} kW @ 100%
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Equipment Unit Cost</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">
              &yen;{transformerData.priceJpy.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Hitachi Energy Japan</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Interconnection Voltage</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">6.6 kV 3&Phi;3W</div>
            <div className="text-[11px] text-indigo-600 font-medium mt-0.5">TEPCO High Voltage</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Switchgear Rated Current</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{gridSwitchgearData.ratedCurrent}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Continuous Rating</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">VCB Breaking Capacity</div>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{gridSwitchgearData.shortCircuitBreaking}</div>
            <div className="text-[11px] text-slate-600 font-medium mt-0.5">Symmetrical 3-Phase</div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs">
            <div className="text-xs font-semibold text-slate-500">Interconnection Status</div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">APPROVED</div>
            <div className="text-[11px] text-slate-500 mt-0.5">JESC E2001 Compliant</div>
          </div>
        </div>
      )}

      {/* 3. Detailed Specifications Grid */}
      {mode === 'transformer' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Electrical Performance &amp; Losses</h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Primary / LV Voltage:</span>
                <span className="font-bold text-slate-900 font-mono">{transformerData.primaryVoltage}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Secondary / HV Voltage:</span>
                <span className="font-bold text-slate-900 font-mono">{transformerData.secondaryVoltage}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Vector Group:</span>
                <span className="font-bold text-indigo-700 font-mono">Dyn11 (Neutral Grounded)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">No-Load Core Loss (Po):</span>
                <span className="font-bold text-slate-900 font-mono">{transformerData.noLoadLossKw} kW</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Load Copper Loss (Pk @ 75&deg;C):</span>
                <span className="font-bold text-slate-900 font-mono">{transformerData.loadLossKw} kW</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Tap Changer Range:</span>
                <span className="font-bold text-slate-900 font-mono">F6900 - 6600 - R6300 V (&plusmn;2.5%, &plusmn;5%)</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Mechanical &amp; Environmental Ratings</h3>
            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Cooling &amp; Fluid:</span>
                <span className="font-bold text-slate-900">{transformerData.coolingType}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Temperature Rise:</span>
                <span className="font-bold text-slate-900">{transformerData.tempRiseLimit}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Insulating Mineral Oil:</span>
                <span className="font-bold text-slate-900 font-mono">{transformerData.oilVolumeLiters} Liters</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Total Weight (with oil):</span>
                <span className="font-bold text-slate-900 font-mono">{transformerData.weightKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Manufacturing Standard:</span>
                <span className="font-bold text-emerald-700">{transformerData.standard}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">High-Voltage Apparatus Components</h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900">{gridSwitchgearData.vcbModel}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Motor-operated spring mechanism | Trip coil 100V DC</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900">{gridSwitchgearData.dsModel}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">With grounding switch interlock &amp; auxiliary contacts</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900">{gridSwitchgearData.laModel}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Discharge counter and leakage current monitor installed</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div className="font-bold text-slate-900">{gridSwitchgearData.vctRating}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Utility certified revenue grade CT/VT metering box</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Protective Relay Coordination</h3>
            <div className="space-y-2 text-xs">
              {gridSwitchgearData.protectiveRelays.map(relay => (
                <div
                  key={relay.code}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded bg-indigo-50 text-indigo-700 font-bold font-mono text-[11px] flex items-center justify-center shrink-0">
                      {relay.code}
                    </span>
                    <span className="font-semibold text-slate-800">{relay.name}</span>
                  </div>
                  <span className="text-emerald-700 font-mono text-[11px] font-medium">
                    {relay.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
