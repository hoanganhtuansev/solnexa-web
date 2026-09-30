import React from 'react';
import { APP_IMAGES } from '../assets/images';

export { APP_IMAGES };

// Crisp vector illustration of a High-Efficiency Monocrystalline Bifacial PV Module
export const PvModuleGraphic: React.FC<{ className?: string }> = ({ className = 'w-16 h-20' }) => (
  <svg viewBox="0 0 120 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="4" width="112" height="152" rx="4" fill="#0f172a" stroke="#94a3b8" strokeWidth="3" />
    <rect x="8" y="8" width="104" height="144" rx="2" fill="#1e293b" />
    {/* Solar Wafer Cell Grid (6x12 cells with busbars) */}
    {Array.from({ length: 6 }).map((_, row) =>
      Array.from({ length: 3 }).map((_, col) => (
        <g key={`${row}-${col}`}>
          <rect
            x={12 + col * 33}
            y={12 + row * 23}
            width="30"
            height="20"
            rx="1"
            fill="#091833"
            stroke="#1e3a8a"
            strokeWidth="0.8"
          />
          {/* Micro-busbars */}
          <line x1={12 + col * 33 + 7} y1={12 + row * 23} x2={12 + col * 33 + 7} y2={12 + row * 23 + 20} stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.7" />
          <line x1={12 + col * 33 + 15} y1={12 + row * 23} x2={12 + col * 33 + 15} y2={12 + row * 23 + 20} stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.7" />
          <line x1={12 + col * 33 + 23} y1={12 + row * 23} x2={12 + col * 33 + 23} y2={12 + row * 23 + 20} stroke="#60a5fa" strokeWidth="0.5" strokeOpacity="0.7" />
        </g>
      ))
    )}
    {/* Glass sheen reflection */}
    <path d="M12 12 L108 80 L108 92 L12 24 Z" fill="white" fillOpacity="0.06" />
    {/* Silver Anodized Frame Edge Highlights */}
    <rect x="4" y="4" width="112" height="152" rx="4" stroke="url(#frame-gradient)" strokeWidth="2" fill="none" />
    <defs>
      <linearGradient id="frame-gradient" x1="0" y1="0" x2="120" y2="160" gradientUnits="userSpaceOnUse">
        <stop stopColor="#cbd5e1" />
        <stop offset="0.5" stopColor="#64748b" />
        <stop offset="1" stopColor="#e2e8f0" />
      </linearGradient>
    </defs>
  </svg>
);

// Crisp vector illustration of Huawei SUN2000 String Inverter / PCS
export const InverterGraphic: React.FC<{ className?: string }> = ({ className = 'w-20 h-16' }) => (
  <svg viewBox="0 0 160 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Main Inverter Chassis (White industrial enclosure) */}
    <rect x="10" y="10" width="140" height="96" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
    {/* Top Heat Sink Ribs */}
    <rect x="16" y="14" width="128" height="14" rx="2" fill="#334155" />
    {Array.from({ length: 18 }).map((_, i) => (
      <line key={i} x1={20 + i * 7} y1={14} x2={20 + i * 7} y2={28} stroke="#64748b" strokeWidth="1" />
    ))}
    {/* Front Panel Bevel */}
    <rect x="18" y="34" width="124" height="66" rx="3" fill="#ffffff" stroke="#e2e8f0" />
    {/* Huawei Red Brand Logo Accent & LED Indicator Ring */}
    <circle cx="80" cy="58" r="14" fill="#0f172a" />
    <circle cx="80" cy="58" r="11" stroke="#22c55e" strokeWidth="2" strokeDasharray="50 15" />
    <circle cx="80" cy="58" r="5" fill="#38bdf8" />
    {/* Model Text Plate */}
    <rect x="45" y="80" width="70" height="12" rx="2" fill="#f1f5f9" />
    <text x="80" y="89" fill="#475569" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
      HUAWEI SUN2000
    </text>
    {/* Bottom DC Switch / Cable Gland ports */}
    <rect x="25" y="106" width="16" height="8" rx="2" fill="#475569" />
    <rect x="50" y="106" width="16" height="8" rx="2" fill="#475569" />
    <rect x="94" y="106" width="16" height="8" rx="2" fill="#475569" />
    <rect x="119" y="106" width="16" height="8" rx="2" fill="#1e293b" />
  </svg>
);

// Crisp vector illustration of Hitachi Medium Voltage Step-up Transformer
export const TransformerGraphic: React.FC<{ className?: string }> = ({ className = 'w-20 h-20' }) => (
  <svg viewBox="0 0 160 160" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Conservator tank on top */}
    <rect x="42" y="12" width="76" height="18" rx="9" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
    <line x1="80" y1="30" x2="80" y2="44" stroke="#475569" strokeWidth="4" />
    {/* High Voltage Bushings (3 porcelain insulators) */}
    {[-26, 0, 26].map((offset, i) => (
      <g key={i} transform={`translate(${80 + offset}, 34)`}>
        <polygon points="-5,10 5,10 3,0 -3,0" fill="#991b1b" stroke="#450a0a" strokeWidth="0.8" />
        <ellipse cx="0" cy="3" rx="6" ry="2" fill="#b91c1c" />
        <ellipse cx="0" cy="7" rx="7" ry="2.5" fill="#b91c1c" />
        <line x1="0" y1="0" x2="0" y2="-8" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="0" cy="-9" r="2.5" fill="#e2e8f0" />
      </g>
    ))}
    {/* Main Transformer Steel Tank */}
    <rect x="24" y="44" width="112" height="92" rx="4" fill="#475569" stroke="#1e293b" strokeWidth="2" />
    {/* External Radiator Cooling Fins (left and right) */}
    {Array.from({ length: 9 }).map((_, i) => (
      <rect key={i} x={30 + i * 11} y="54" width="8" height="72" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="0.8" />
    ))}
    {/* Rating Plate & Oil Level Gauge */}
    <rect x="65" y="74" width="30" height="24" rx="2" fill="#e2e8f0" stroke="#94a3b8" />
    <text x="80" y="84" fill="#0f172a" fontSize="6" fontWeight="bold" textAnchor="middle">
      HITACHI
    </text>
    <text x="80" y="92" fill="#0f172a" fontSize="5" textAnchor="middle">
      1000 kVA
    </text>
    {/* Base Skid Beams */}
    <rect x="18" y="136" width="124" height="12" rx="2" fill="#1e293b" />
  </svg>
);

// Crisp vector illustration of Aerial View Rooftop Solar Installation
export const AerialSolarRooftopGraphic: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg viewBox="0 0 320 200" className={className} fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
    {/* Industrial Factory Ground & Surrounding Asphalt */}
    <rect width="320" height="200" fill="#334155" />
    <path d="M0 160 L320 130 L320 200 L0 200 Z" fill="#1e293b" />
    {/* Surrounding green landscape / trees */}
    <rect x="0" y="0" width="80" height="200" fill="#14532d" fillOpacity="0.8" />
    <circle cx="30" cy="40" r="18" fill="#166534" />
    <circle cx="50" cy="70" r="14" fill="#15803d" />
    <circle cx="25" cy="110" r="22" fill="#14532d" />
    <circle cx="45" cy="155" r="16" fill="#166534" />
    {/* Factory Building Roof (Perspective White/Silver corrugated roof) */}
    <polygon points="70,25 295,20 310,165 85,175" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
    {/* Rooftop Solar Array Rows (Deep Navy Blue PV modules) */}
    {Array.from({ length: 7 }).map((_, row) => {
      const yOffset = 38 + row * 18;
      const xStart = 88 + row * 2;
      const width = 195 - row * 3;
      return (
        <g key={row}>
          <polygon
            points={`${xStart},${yOffset} ${xStart + width},${yOffset - 3} ${xStart + width + 3},${yOffset + 12} ${xStart + 3},${yOffset + 15}`}
            fill="#0f172a"
            stroke="#2563eb"
            strokeWidth="0.8"
          />
          {/* Subtle panel division lines */}
          {Array.from({ length: 8 }).map((_, col) => {
            const pX = xStart + (col + 1) * (width / 9);
            return (
              <line
                key={col}
                x1={pX}
                y1={yOffset}
                x2={pX + 2}
                y2={yOffset + 14}
                stroke="#60a5fa"
                strokeWidth="0.5"
                strokeOpacity="0.7"
              />
            );
          })}
        </g>
      );
    })}
    {/* Rooftop Inverter Station Skid */}
    <rect x="235" y="145" width="45" height="18" rx="2" fill="#f8fafc" stroke="#475569" strokeWidth="1" />
    <text x="257" y="157" fill="#0f172a" fontSize="6" fontWeight="bold" textAnchor="middle">
      PCS SKID
    </text>
    {/* Sun Glint */}
    <polygon points="120,40 180,35 150,110 90,115" fill="white" fillOpacity="0.08" />
  </svg>
);
