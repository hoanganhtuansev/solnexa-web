import React, { useState, useRef } from 'react';
import {
  GitFork,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Zap,
  BatteryCharging,
  Cpu,
  Boxes,
  ShieldCheck,
  CheckCircle2,
  Info,
  Maximize2
} from 'lucide-react';
import { Project } from '../types';

interface SingleLineDiagramProps {
  project: Project;
  onExportSvg?: () => void;
}

export const SingleLineDiagram: React.FC<SingleLineDiagramProps> = ({ project }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [diagramMode, setDiagramMode] = useState<'AUTO' | 'SOLAR' | 'BESS'>(
    project.type === 'BESS' ? 'BESS' : 'SOLAR'
  );
  const svgRef = useRef<SVGSVGElement | null>(null);

  const isBess = diagramMode === 'BESS' || (diagramMode === 'AUTO' && project.type === 'BESS');

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.15, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.15, 0.6));
  const handleResetZoom = () => setZoomLevel(1);

  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${project.name.replace(/\s+/g, '_')}_Single_Line_Diagram.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isBess ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <GitFork className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Single Line Diagram (SLD) / Sơ Đồ Một Sợi
              </h2>
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                isBess
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {isBess ? 'BESS 2MW / 8MWh' : 'Solar PV 500kW'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Compliant with JIS C 3605, JIS C 4304, IEC 60364-7-712, and METI High-Voltage Interconnection Code
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Zoom controls */}
          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50 text-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 hover:bg-slate-100 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-medium text-slate-600">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 hover:bg-slate-100 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 hover:bg-slate-100 border-l border-slate-200 transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Export SVG */}
          <button
            onClick={handleExportSvg}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export SVG</span>
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive SVG Canvas Viewport */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-inner overflow-hidden relative min-h-[640px]">
        {/* Top Overlay Legend */}
        <div className="absolute top-3 left-3 z-10 bg-slate-950/80 backdrop-blur-xs border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-slate-200 text-[11px] uppercase tracking-wider mb-1 flex items-center space-x-1.5">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Legend & Spec Details</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shrink-0"></span>
            <span>DC Generation / Storage Bus (1000V - 1500V DC)</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block shrink-0"></span>
            <span>Low-Voltage AC Bus ({isBess ? '690V 3P3W' : '400V 3P4W'})</span>
          </div>
          <div className="flex items-center space-x-2 text-[11px]">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block shrink-0"></span>
            <span>High-Voltage Interconnection (6.6 kV 50Hz)</span>
          </div>
          <div className="text-[10px] text-slate-400 pt-1">
            *Click any symbol below to inspect electrical ratings
          </div>
        </div>

        {/* Zoomable Container */}
        <div className="w-full h-full overflow-auto p-8 flex items-center justify-center">
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease-out'
            }}
            className="w-full flex justify-center"
          >
            {isBess ? (
              /* ========================================================================= */
              /* BESS 2MW / 8MWh (4x Huawei Containers) Single Line Diagram SVG */
              /* ========================================================================= */
              <svg
                ref={svgRef}
                viewBox="0 0 1100 800"
                className="w-full max-w-[1050px] select-none"
                style={{ minWidth: '950px' }}
              >
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="bess-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="huawei-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#312e81" />
                    <stop offset="100%" stopColor="#1e1b4b" />
                  </linearGradient>
                  <linearGradient id="pcs-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#134e4a" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="#090d16" />
                <rect width="100%" height="100%" fill="url(#bess-grid)" />

                {/* Title Block on SVG */}
                <text x="550" y="36" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="bold">
                  YOKOHAMA PORT 2.0 MW / 8.128 MWh UTILITY BESS - SINGLE LINE DIAGRAM
                </text>
                <text x="550" y="56" textAnchor="middle" fill="#94a3b8" fontSize="11">
                  System Architecture: 4x Huawei LUNA2000-2.0MWH-2H1 + 1x Huawei Smart String PCS 2000kW + 1x Hitachi 2500kVA TR
                </text>

                {/* ============================================================ */}
                {/* 1. 4x Huawei Battery Containers (Top Row) */}
                {/* ============================================================ */}
                {[0, 1, 2, 3].map(idx => {
                  const x = 110 + idx * 240;
                  const isSelected = selectedNode === `container-${idx + 1}`;
                  return (
                    <g
                      key={`cont-${idx}`}
                      onClick={() => setSelectedNode(`container-${idx + 1}`)}
                      className="cursor-pointer transition-all hover:opacity-90"
                    >
                      {/* Container Outline */}
                      <rect
                        x={x}
                        y="90"
                        width="180"
                        height="120"
                        rx="8"
                        fill="url(#huawei-grad)"
                        stroke={isSelected ? '#38bdf8' : '#6366f1'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                      />
                      {/* Header Badge */}
                      <rect x={x + 10} y="98" width="160" height="22" rx="4" fill="#4338ca" />
                      <text x={x + 90} y="113" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                        CONTAINER #{idx + 1}: HUAWEI
                      </text>
                      <text x={x + 90} y="132" textAnchor="middle" fill="#cbd5e1" fontSize="10">
                        LUNA2000-2.0MWH-2H1
                      </text>
                      <text x={x + 90} y="148" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">
                        2,032 kWh (LFP Liquid-Cool)
                      </text>
                      <text x={x + 90} y="163" textAnchor="middle" fill="#94a3b8" fontSize="9">
                        Nominal Voltage: 1,200V DC
                      </text>
                      <text x={x + 90} y="177" textAnchor="middle" fill="#94a3b8" fontSize="9">
                        Range: 1,000V - 1,500V DC
                      </text>
                      <text x={x + 90} y="193" textAnchor="middle" fill="#4ade80" fontSize="9">
                        Rated Discharge: 500 kW / 416A
                      </text>

                      {/* DC Output Line from Container */}
                      <line x1={x + 90} y1="210" x2={x + 90} y2="250" stroke="#10b981" strokeWidth="3" />

                      {/* DC Disconnect Switch & Fuse */}
                      <rect x={x + 78} y="250" width="24" height="26" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                      <text x={x + 90} y="267" textAnchor="middle" fill="#10b981" fontSize="9" fontWeight="bold">
                        DC-SW
                      </text>
                      <text x={x + 90} y="288" textAnchor="middle" fill="#94a3b8" fontSize="8">
                        630A 1500V
                      </text>

                      {/* Line to Common DC Bus */}
                      <line x1={x + 90} y1="276" x2={x + 90} y2="330" stroke="#10b981" strokeWidth="3" />
                      {/* Cable Callout */}
                      <text x={x + 95} y="315" fill="#6ee7b7" fontSize="8">
                        CVT 150 mm² DC
                      </text>
                    </g>
                  );
                })}

                {/* ============================================================ */}
                {/* 2. Common DC Collector Bus (1200V DC, 2000A) */}
                {/* ============================================================ */}
                <line x1="160" y1="330" x2="920" y2="330" stroke="#10b981" strokeWidth="6" strokeLinecap="round" />
                <rect x="440" y="318" width="220" height="24" rx="4" fill="#047857" stroke="#10b981" strokeWidth="1" />
                <text x="550" y="334" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  COMMON DC BUS: 1000V-1500V DC (2000A RATED)
                </text>

                {/* Main DC Feeder to PCS */}
                <line x1="550" y1="342" x2="550" y2="385" stroke="#10b981" strokeWidth="4" />
                <text x="560" y="365" fill="#6ee7b7" fontSize="9">
                  4x CVT 250 mm² DC (Total 1,664A @ 1200V)
                </text>

                {/* ============================================================ */}
                {/* 3. Central Inverter / PCS (Huawei 2000kW) */}
                {/* ============================================================ */}
                <g
                  onClick={() => setSelectedNode('pcs')}
                  className="cursor-pointer transition-all hover:opacity-90"
                >
                  <rect
                    x="390"
                    y="385"
                    width="320"
                    height="125"
                    rx="10"
                    fill="url(#pcs-grad)"
                    stroke={selectedNode === 'pcs' ? '#38bdf8' : '#14b8a6'}
                    strokeWidth={selectedNode === 'pcs' ? '2.5' : '1.5'}
                  />
                  {/* Badge */}
                  <rect x="405" y="395" width="290" height="22" rx="4" fill="#0d9488" />
                  <text x="550" y="410" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                    CENTRAL PCS: HUAWEI SMART STRING PCS 2000kW
                  </text>
                  <text x="550" y="432" textAnchor="middle" fill="#ccfbf1" fontSize="10">
                    Rated AC Output: 2,000 kW / 2,000 kVA @ 40°C
                  </text>
                  <text x="550" y="450" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="bold">
                    AC Voltage: 690 V (3-Phase, 3-Wire, 50 Hz)
                  </text>
                  <text x="550" y="468" textAnchor="middle" fill="#99f6e4" fontSize="9">
                    Nominal Current: 1,673.5 A (Max 1,708 A) | PF: ±0.8 adjustable
                  </text>
                  <text x="550" y="486" textAnchor="middle" fill="#99f6e4" fontSize="9">
                    Bi-directional 4-Quadrant Control | Grid-Forming &amp; Black Start
                  </text>
                </g>

                {/* AC Feeder from PCS */}
                <line x1="550" y1="510" x2="550" y2="540" stroke="#f59e0b" strokeWidth="4" />

                {/* 690V Main AC Air Circuit Breaker (ACB) */}
                <g onClick={() => setSelectedNode('acb')} className="cursor-pointer">
                  <rect x="525" y="540" width="50" height="34" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="550" y="556" textAnchor="middle" fill="#f59e0b" fontSize="10" fontWeight="bold">
                    ACB
                  </text>
                  <text x="550" y="568" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                    690V 2500A
                  </text>
                </g>

                {/* Line to Step-Up Transformer with Cable Annotation */}
                <line x1="550" y1="574" x2="550" y2="615" stroke="#f59e0b" strokeWidth="4" />
                <text x="560" y="598" fill="#fde047" fontSize="9">
                  600V CVT 325 mm² × 5 runs / phase (L = 25m, ΔV = 0.52%)
                </text>

                {/* ============================================================ */}
                {/* 4. Step-up Transformer (Hitachi 2500 kVA, 690V / 6600V) */}
                {/* ============================================================ */}
                <g onClick={() => setSelectedNode('transformer')} className="cursor-pointer">
                  {/* Two Interlocking Coils */}
                  <circle cx="550" cy="632" r="18" fill="none" stroke="#f59e0b" strokeWidth="3" />
                  <circle cx="550" cy="650" r="18" fill="none" stroke="#ef4444" strokeWidth="3" />

                  {/* Specification Box */}
                  <rect x="585" y="622" width="280" height="48" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
                  <text x="595" y="638" fill="#ffffff" fontSize="10" fontWeight="bold">
                    HITACHI STEP-UP TRANSFORMER: 2,500 kVA
                  </text>
                  <text x="595" y="652" fill="#c7d2fe" fontSize="9">
                    Primary: 690 V (Delta) | Secondary: 6.6 kV (Wye Dyn11)
                  </text>
                  <text x="595" y="664" fill="#94a3b8" fontSize="8">
                    Impedance: %Z = 6.0% | Oil-immersed Outdoor Type
                  </text>
                </g>

                {/* MV 6.6kV Line */}
                <line x1="550" y1="668" x2="550" y2="700" stroke="#ef4444" strokeWidth="4" />
                <text x="560" y="688" fill="#fca5a5" fontSize="9">
                  6.6kV CVT 100 mm² (I_rated = 218.7 A, L = 80m, ΔV = 0.28%)
                </text>

                {/* ============================================================ */}
                {/* 5. 6.6kV High Voltage Switchgear (VCB) & Grid Interconnection */}
                {/* ============================================================ */}
                <g onClick={() => setSelectedNode('vcb')} className="cursor-pointer">
                  <rect x="525" y="700" width="50" height="34" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="550" y="716" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                    VCB
                  </text>
                  <text x="550" y="728" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                    7.2kV 630A
                  </text>
                  {/* Protection Relay Callout */}
                  <rect x="360" y="700" width="150" height="34" rx="4" fill="#3f1414" stroke="#f87171" strokeWidth="1" />
                  <text x="435" y="715" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="bold">
                    PROTECTION: 51 / 51N / 67
                  </text>
                  <text x="435" y="727" textAnchor="middle" fill="#fca5a5" fontSize="8">
                    Overcurrent, Ground Fault, DGR
                  </text>
                  <line x1="510" y1="717" x2="525" y2="717" stroke="#f87171" strokeWidth="1" strokeDasharray="3,3" />
                </g>

                {/* Final Connection to Grid */}
                <line x1="550" y1="734" x2="550" y2="760" stroke="#ef4444" strokeWidth="4" />
                <polygon points="550,775 542,760 558,760" fill="#ef4444" />

                {/* Utility Grid Badge */}
                <rect x="420" y="770" width="260" height="24" rx="4" fill="#dc2626" />
                <text x="550" y="786" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  TEPCO 6.6 kV 3-PHASE UTILITY DISTRIBUTION GRID
                </text>
              </svg>
            ) : (
              /* ========================================================================= */
              /* Solar PV 500 kW Single Line Diagram SVG */
              /* ========================================================================= */
              <svg
                ref={svgRef}
                viewBox="0 0 1100 800"
                className="w-full max-w-[1050px] select-none"
                style={{ minWidth: '950px' }}
              >
                <defs>
                  <pattern id="solar-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" />
                  </pattern>
                  <linearGradient id="pv-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#854d0e" />
                    <stop offset="100%" stopColor="#451a03" />
                  </linearGradient>
                  <linearGradient id="inv-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#1e3a8a" />
                    <stop offset="100%" stopColor="#172554" />
                  </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="#090d16" />
                <rect width="100%" height="100%" fill="url(#solar-grid)" />

                {/* Title Block on SVG */}
                <text x="550" y="36" textAnchor="middle" fill="#f8fafc" fontSize="16" fontWeight="bold">
                  CHIBA FACTORY 500 kW COMMERCIAL SOLAR PV - SINGLE LINE DIAGRAM
                </text>
                <text x="550" y="56" textAnchor="middle" fill="#94a3b8" fontSize="11">
                  862x Trina 580W TOPCon Modules | 5x Huawei SUN2000-100KTL-M2 Inverters | 1x Hitachi 500kVA TR
                </text>

                {/* ============================================================ */}
                {/* 1. PV Modules & Strings Representation (Top Block) */}
                {/* ============================================================ */}
                {[0, 1, 2, 3, 4].map(idx => {
                  const x = 70 + idx * 200;
                  return (
                    <g key={`pv-inv-${idx}`}>
                      {/* PV String Group */}
                      <rect x={x} y="85" width="160" height="95" rx="6" fill="url(#pv-grad)" stroke="#eab308" strokeWidth="1.5" />
                      <rect x={x + 10} y="92" width="140" height="18" rx="3" fill="#ca8a04" />
                      <text x={x + 80} y="105" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        PV SUB-ARRAY #{idx + 1}
                      </text>
                      <text x={x + 80} y="122" textAnchor="middle" fill="#fef08a" fontSize="9">
                        ~172 Modules (Trina 580W)
                      </text>
                      <text x={x + 80} y="136" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        10 Strings × 18 Modules
                      </text>
                      <text x={x + 80} y="150" textAnchor="middle" fill="#fef08a" fontSize="8">
                        Voc_stc = 925 V | Vmp = 766 V
                      </text>
                      <text x={x + 80} y="164" textAnchor="middle" fill="#94a3b8" fontSize="8">
                        DC Cables: 1500V PV1-F 4mm²
                      </text>

                      {/* DC Line to Inverter */}
                      <line x1={x + 80} y1="180" x2={x + 80} y2="230" stroke="#eab308" strokeWidth="2.5" />
                      <text x={x + 85} y="208" fill="#fde047" fontSize="8">
                        10 MPPT Inputs
                      </text>

                      {/* Huawei 100kW String Inverter */}
                      <rect
                        x={x}
                        y="230"
                        width="160"
                        height="95"
                        rx="8"
                        fill="url(#inv-grad)"
                        stroke="#3b82f6"
                        strokeWidth="1.5"
                      />
                      <rect x={x + 10} y="238" width="140" height="18" rx="3" fill="#2563eb" />
                      <text x={x + 80} y="251" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                        INV #{idx + 1}: HUAWEI 100kW
                      </text>
                      <text x={x + 80} y="270" textAnchor="middle" fill="#93c5fd" fontSize="9">
                        SUN2000-100KTL-M2
                      </text>
                      <text x={x + 80} y="286" textAnchor="middle" fill="#60a5fa" fontSize="9" fontWeight="bold">
                        100 kW @ 400V 3-Phase
                      </text>
                      <text x={x + 80} y="302" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                        I_ac = 144.3 A | η = 98.8%
                      </text>
                      <text x={x + 80} y="316" textAnchor="middle" fill="#94a3b8" fontSize="8">
                        SPD Type II AC/DC Built-in
                      </text>

                      {/* Inverter AC Feeder Cable */}
                      <line x1={x + 80} y1="325" x2={x + 80} y2="390" stroke="#3b82f6" strokeWidth="2.5" />
                      <text x={x + 85} y="365" fill="#93c5fd" fontSize="8">
                        CVT 100 mm²
                      </text>

                      {/* Branch MCCB */}
                      <rect x={x + 68} y="390" width="24" height="24" rx="3" fill="#1e293b" stroke="#3b82f6" strokeWidth="1" />
                      <text x={x + 80} y="405" textAnchor="middle" fill="#60a5fa" fontSize="8" fontWeight="bold">
                        175A
                      </text>

                      {/* Down into Low Voltage Combiner Board */}
                      <line x1={x + 80} y1="414" x2={x + 80} y2="460" stroke="#3b82f6" strokeWidth="2.5" />
                    </g>
                  );
                })}

                {/* ============================================================ */}
                {/* 2. Low-Voltage AC Combiner Board (400V 3P4W) */}
                {/* ============================================================ */}
                <line x1="120" y1="460" x2="980" y2="460" stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" />
                <rect x="420" y="448" width="260" height="24" rx="4" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1" />
                <text x="550" y="464" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  400V AC COMBINER BOARD (800A BUSBAR)
                </text>

                {/* Main 400V ACB Breaker */}
                <line x1="550" y1="472" x2="550" y2="515" stroke="#3b82f6" strokeWidth="4" />
                <g onClick={() => setSelectedNode('acb')} className="cursor-pointer">
                  <rect x="525" y="515" width="50" height="34" rx="4" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
                  <text x="550" y="531" textAnchor="middle" fill="#60a5fa" fontSize="10" fontWeight="bold">
                    ACB
                  </text>
                  <text x="550" y="543" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                    400V 1000A
                  </text>
                </g>

                {/* Line to Step-Up Transformer with Cable Annotation */}
                <line x1="550" y1="549" x2="550" y2="595" stroke="#3b82f6" strokeWidth="4" />
                <text x="560" y="575" fill="#93c5fd" fontSize="9">
                  600V CVT 250 mm² × 2 runs / phase (L = 30m, ΔV = 0.65%)
                </text>

                {/* ============================================================ */}
                {/* 3. Step-up Transformer (Hitachi 500 kVA, 400V / 6600V) */}
                {/* ============================================================ */}
                <g onClick={() => setSelectedNode('transformer')} className="cursor-pointer">
                  <circle cx="550" cy="610" r="18" fill="none" stroke="#3b82f6" strokeWidth="3" />
                  <circle cx="550" cy="628" r="18" fill="none" stroke="#ef4444" strokeWidth="3" />

                  {/* Specification Box */}
                  <rect x="585" y="600" width="280" height="48" rx="6" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1" />
                  <text x="595" y="616" fill="#ffffff" fontSize="10" fontWeight="bold">
                    HITACHI STEP-UP TRANSFORMER: 500 kVA
                  </text>
                  <text x="595" y="630" fill="#c7d2fe" fontSize="9">
                    Primary: 400 V (Delta) | Secondary: 6.6 kV (Wye Dyn11)
                  </text>
                  <text x="595" y="642" fill="#94a3b8" fontSize="8">
                    Impedance: %Z = 4.5% | Oil-immersed Outdoor Type
                  </text>
                </g>

                {/* MV 6.6kV Line */}
                <line x1="550" y1="646" x2="550" y2="685" stroke="#ef4444" strokeWidth="4" />
                <text x="560" y="670" fill="#fca5a5" fontSize="9">
                  6.6kV CVT 38 mm² (I_rated = 43.7 A, L = 60m, ΔV = 0.12%)
                </text>

                {/* ============================================================ */}
                {/* 4. 6.6kV High Voltage Switchgear (VCB) & Grid Interconnection */}
                {/* ============================================================ */}
                <g onClick={() => setSelectedNode('vcb')} className="cursor-pointer">
                  <rect x="525" y="685" width="50" height="34" rx="4" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                  <text x="550" y="701" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="bold">
                    VCB
                  </text>
                  <text x="550" y="713" textAnchor="middle" fill="#cbd5e1" fontSize="8">
                    7.2kV 630A
                  </text>

                  {/* Protection Relay Callout */}
                  <rect x="360" y="685" width="150" height="34" rx="4" fill="#3f1414" stroke="#f87171" strokeWidth="1" />
                  <text x="435" y="700" textAnchor="middle" fill="#fecaca" fontSize="9" fontWeight="bold">
                    PROTECTION: 51 / 51N / DGR
                  </text>
                  <text x="435" y="712" textAnchor="middle" fill="#fca5a5" fontSize="8">
                    Directional Ground Relay
                  </text>
                  <line x1="510" y1="702" x2="525" y2="702" stroke="#f87171" strokeWidth="1" strokeDasharray="3,3" />
                </g>

                {/* Final Connection to Grid */}
                <line x1="550" y1="719" x2="550" y2="750" stroke="#ef4444" strokeWidth="4" />
                <polygon points="550,765 542,750 558,750" fill="#ef4444" />

                {/* Utility Grid Badge */}
                <rect x="420" y="760" width="260" height="24" rx="4" fill="#dc2626" />
                <text x="550" y="776" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  TEPCO 6.6 kV 3-PHASE UTILITY DISTRIBUTION GRID
                </text>
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* 3. Detailed Component Specification Inspection Panel */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2 mb-3">
          <ShieldCheck className="w-4 h-4 text-[#2563eb]" />
          <span>Electrical Engineering Standards &amp; Equipment Rating Specifications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Box 1: Voltage Levels & Cable Sizing */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Voltage Drop &amp; Cable Criteria</span>
            </div>
            <ul className="text-slate-600 space-y-1 font-mono text-[11px]">
              <li>* DC String: &lt; 1.0% (JIS C 3605)</li>
              <li>* AC Low-Voltage Feeder: &lt; 1.5%</li>
              <li>* High-Voltage (6.6 kV): &lt; 0.5%</li>
              <li>* Maximum short-circuit temperature: 250°C (XLPE)</li>
            </ul>
          </div>

          {/* Box 2: Protection & Safety */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Protective Device Coordination</span>
            </div>
            <ul className="text-slate-600 space-y-1 font-mono text-[11px]">
              <li>* VCB: 7.2kV 630A / 12.5kA (TEPCO Approved)</li>
              <li>* DGR: Directional Ground Relay for 6.6kV</li>
              <li>* Overvoltage / Undervoltage (OVR / UVR)</li>
              <li>* Fast Frequency Response (FFR for BESS)</li>
            </ul>
          </div>

          {/* Box 3: Grid Code Compliance */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center space-x-1.5">
              <Boxes className="w-4 h-4 text-indigo-600" />
              <span>Grid Connection &amp; Metering</span>
            </div>
            <ul className="text-slate-600 space-y-1 font-mono text-[11px]">
              <li>* Point of Common Coupling (PCC): 6.6 kV Incoming Cubicle</li>
              <li>* Power Factor Control: cos phi 0.95 to 1.0</li>
              <li>* THD: &lt; 5.0% harmonic distortion (IEEE 519)</li>
              <li>* Bi-directional 30-min interval metering</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
