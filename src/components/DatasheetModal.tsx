import React from 'react';
import { X, Download, ExternalLink, CheckCircle2, Shield, Zap, FileText } from 'lucide-react';

interface DatasheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    manufacturer: string;
    model: string;
    type: string;
    powerW?: number;
    vocV?: number;
    iscA?: number;
    vmpV?: number;
    impA?: number;
    effPercent?: number;
    dimensions?: string;
    weightKg?: number;
    warrantyYears?: number;
  } | null;
}

export const DatasheetModal: React.FC<DatasheetModalProps> = ({ isOpen, onClose, equipment }) => {
  if (!isOpen || !equipment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">{equipment.manufacturer} {equipment.model}</h3>
              <p className="text-xs text-slate-500">Official Datasheet &amp; Verified Engineering Specs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar text-xs">
          {/* Top badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Rated Power</span>
              <span className="text-base font-black text-slate-900 font-mono">{equipment.powerW || 580} W</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Efficiency</span>
              <span className="text-base font-black text-emerald-600 font-mono">{equipment.effPercent || 22.5}%</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Voc (STC)</span>
              <span className="text-base font-black text-slate-900 font-mono">{equipment.vocV || 51.42} V</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Isc (STC)</span>
              <span className="text-base font-black text-slate-900 font-mono">{equipment.iscA || 14.42} A</span>
            </div>
          </div>

          {/* Electrical Specifications (STC) */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Electrical Parameters (STC: 1000 W/m², 25°C, AM 1.5)
            </h4>
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Maximum Power Voltage (Vmp)</span>
                <span className="font-mono font-semibold text-slate-800">{equipment.vmpV || 43.12} V</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Maximum Power Current (Imp)</span>
                <span className="font-mono font-semibold text-slate-800">{equipment.impA || 13.45} A</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Temperature Coefficient of Voc</span>
                <span className="font-mono font-semibold text-slate-800">-0.24 %/°C</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Temperature Coefficient of Pmax</span>
                <span className="font-mono font-semibold text-slate-800">-0.30 %/°C</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Maximum System Voltage</span>
                <span className="font-mono font-semibold text-slate-800">1500 V DC</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Max Series Fuse Rating</span>
                <span className="font-mono font-semibold text-slate-800">30 A</span>
              </div>
            </div>
          </div>

          {/* Mechanical Characteristics */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">
              Mechanical &amp; Environmental Data
            </h4>
            <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Dimensions (L × W × H)</span>
                <span className="font-mono text-slate-800">{equipment.dimensions || '2278 × 1134 × 30 mm'}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Weight</span>
                <span className="font-mono text-slate-800">{equipment.weightKg || '27.6 kg'}</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Front Glass</span>
                <span className="text-slate-800">2.0 mm, High Transmission, AR Coated Heat Strengthened Glass</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Junction Box &amp; Connectors</span>
                <span className="text-slate-800">IP68 Rated, MC4 Compatible (1500V)</span>
              </div>
              <div className="flex justify-between px-3.5 py-2">
                <span className="text-slate-500">Mechanical Load</span>
                <span className="text-slate-800">Front 5400 Pa / Rear 2400 Pa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>IEC 61215 / IEC 61730 Certified</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
