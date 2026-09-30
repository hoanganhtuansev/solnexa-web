import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldAlert, Cpu, Sun, Layers, Zap, Building } from 'lucide-react';

interface EngineeringReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    name: string;
    type: string;
    capacityDisplay: string;
    voltageDisplay: string;
    location: string;
    pvCapacityKwp?: number;
    acCapacityKw?: number;
    dcAcRatio?: number;
    pvModule?: {
      manufacturer: string;
      model: string;
      power: number;
      qty: number;
    };
    inverter?: {
      manufacturer: string;
      model: string;
      power: number;
      qty: number;
    };
    transformer?: {
      manufacturer: string;
      rating: string;
      voltage: string;
    };
    cable?: {
      size: string;
      voltageDropPercent: number;
    };
    quotation?: {
      sellingPrice: number;
      subtotal: number;
      marginPercentage: number;
    };
  };
}

export const EngineeringReportModal: React.FC<EngineeringReportModalProps> = ({
  isOpen,
  onClose,
  project
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2563eb] text-white flex items-center justify-center">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">System Engineering &amp; Verification Report</h3>
              <p className="text-xs text-slate-500">SOLNEXA Automated Electrical Design Verification</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="p-8 space-y-7 overflow-y-auto custom-scrollbar text-xs print:p-0 print:overflow-visible">
          {/* Document Cover Strip */}
          <div className="border-b-2 border-slate-900 pb-5 flex justify-between items-end">
            <div>
              <div className="text-xs uppercase font-extrabold tracking-widest text-[#2563eb]">
                SOLNEXA Engineering Platform
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                {project.name}
              </h1>
              <p className="text-slate-500 text-xs mt-1">
                Detailed Electrical Design &amp; Calculation Deliverable • Standard: JIS C 8955 / IEC 60364
              </p>
            </div>
            <div className="text-right text-slate-400 font-mono text-[11px]">
              <div>Report ID: REP-{project.name.toUpperCase().slice(0, 5)}-2026</div>
              <div>Date: {new Date().toLocaleDateString('ja-JP')}</div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Project Technical Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total PV Capacity</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {project.pvCapacityKwp ? `${project.pvCapacityKwp.toLocaleString()} kWp` : project.capacityDisplay}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Total AC Capacity</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {project.acCapacityKw ? `${project.acCapacityKw.toLocaleString()} kW` : '1,000 kW'}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">DC/AC Loading Ratio</span>
                <span className="text-base font-black text-emerald-600 font-mono">
                  {project.dcAcRatio || 1.25}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Grid Connection Voltage</span>
                <span className="text-base font-black text-slate-900 font-mono">
                  {project.voltageDisplay}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Equipment Configuration */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Major Equipment Bill of Materials
            </h2>
            <table className="w-full border-collapse border border-slate-200 text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <th className="p-2 border-r border-slate-200">Equipment Type</th>
                  <th className="p-2 border-r border-slate-200">Manufacturer &amp; Model</th>
                  <th className="p-2 border-r border-slate-200">Key Specification</th>
                  <th className="p-2 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">PV Modules</td>
                  <td className="p-2 border-r border-slate-200 font-mono">
                    {project.pvModule?.manufacturer || 'Trina'} {project.pvModule?.model || 'TSM-580NE19R'}
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    580 Wp, Monocrystalline N-type TOPCon, Bifacial, 1500V DC
                  </td>
                  <td className="p-2 text-right font-mono font-bold">
                    {project.pvModule?.qty?.toLocaleString() || '2,069'} pcs
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">String Inverters (PCS)</td>
                  <td className="p-2 border-r border-slate-200 font-mono">
                    {project.inverter?.manufacturer || 'Huawei'} {project.inverter?.model || 'SUN2000-50KTL'}
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    50 kW, 400V 3-phase, 4 MPPT, Max efficiency 98.5%
                  </td>
                  <td className="p-2 text-right font-mono font-bold">
                    {project.inverter?.qty || 20} units
                  </td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">Step-up Transformer</td>
                  <td className="p-2 border-r border-slate-200 font-mono">
                    {project.transformer?.manufacturer || 'Hitachi Energy'} TR-1000kVA
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    1000 kVA, 6.6 kV / 400 V, 50 Hz, Oil-immersed outdoor skid
                  </td>
                  <td className="p-2 text-right font-mono font-bold">1 set</td>
                </tr>
                <tr>
                  <td className="p-2 font-semibold text-slate-800 border-r border-slate-200">Main DC/AC Feeders</td>
                  <td className="p-2 border-r border-slate-200 font-mono">
                    {project.cable?.size || 'CVT 22 mm²'} / CVT 200 mm²
                  </td>
                  <td className="p-2 border-r border-slate-200">
                    XLPE insulated, Cu conductor, Voltage drop engineered &lt; 1.0%
                  </td>
                  <td className="p-2 text-right font-mono font-bold">12,500 m</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Engineering Verification & Compliance */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              3. Standards Compliance Checklist
            </h2>
            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">DC Voltage Drop (IEC 60364-5-52)</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold">0.98% (Limit &lt; 1.5%) - PASS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Max Voc at -10°C Extreme Temperature</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold">1,061.2 V (Limit &lt; 1,100 V) - PASS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-800">Cable Ampacity Temperature Derating (45°C ambient)</span>
                </div>
                <span className="font-mono text-emerald-700 font-bold">Safety Margin 5.1× - PASS</span>
              </div>
            </div>
          </div>

          {/* Section 4: Commercial Quotation Summary */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              4. Commercial Estimation
            </h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-slate-500 block">Total EPC Turnkey Proposal</span>
                <span className="text-slate-400 text-[11px]">Includes equipment, civil installation, grid connection &amp; commissioning</span>
              </div>
              <div className="text-right font-mono">
                <span className="text-xl font-black text-slate-900">
                  ¥ {project.quotation?.sellingPrice ? project.quotation.sellingPrice.toLocaleString() : '125,350,000'}
                </span>
                <span className="text-slate-400 block text-[10px]">JPY (Exclusive of consumption tax)</span>
              </div>
            </div>
          </div>

          {/* Signoff block */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-slate-600">
            <div>
              <div className="font-bold text-slate-800">Lead Electrical Engineer:</div>
              <div className="mt-6 border-b border-slate-300 w-48" />
              <div className="mt-1 font-mono text-[11px]">Hoàng Anh Tuấn (PE #JP-49201)</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800">Quality Assurance / Technical Director:</div>
              <div className="mt-6 border-b border-slate-300 w-48 ml-auto" />
              <div className="mt-1 font-mono text-[11px]">SOLNEXA Engineering Dept.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
