import React from 'react';
import { ArrowRight, ExternalLink, ChevronRight, Cpu, BatteryCharging, Sun, Building2, BookOpen, Layers, ShieldCheck, FileSpreadsheet } from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';

export interface MegaMenuCategory {
  id: string;
  label: string;
  enLabel: string;
  description: string;
  image: string;
  links: {
    title: string;
    sub: string;
    action: () => void;
    badge?: string;
  }[];
}

interface MegaMenuProps {
  category: MegaMenuCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
}

export const MegaMenu: React.FC<MegaMenuProps> = ({
  category,
  isOpen,
  onClose,
  onOpenEngineeringTools,
  onOpenContact
}) => {
  if (!isOpen || !category) return null;

  return (
    <div 
      className="absolute top-full left-0 w-full bg-white border-b border-slate-200 shadow-2xl z-40 transition-all duration-200 animate-in fade-in slide-in-from-top-2"
      onMouseLeave={onClose}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Category Overview & Architectural Photo */}
          <div className="lg:col-span-4 pr-6 lg:border-r lg:border-slate-200 space-y-4">
            <div>
              <span className="text-[11px] font-bold text-[#d81a28] uppercase tracking-wider">
                {category.enLabel}
              </span>
              <h3 className="text-xl font-extrabold text-[#002b49] tracking-tight mt-0.5">
                {category.label}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2">
                {category.description}
              </p>
            </div>

            <div className="relative rounded-xl overflow-hidden aspect-16/9 border border-slate-200 shadow-xs group">
              <img 
                src={category.image} 
                alt={category.label} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#002b49]/80 via-transparent to-transparent flex items-end p-3.5">
                <span className="text-[11px] font-bold text-white flex items-center gap-1.5">
                  <span>詳細ソリューションを見る</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sub-services and Links */}
          <div className="lg:col-span-8 pl-0 lg:pl-4">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              主要サービス・技術区分 (Key Services &amp; Technical Capabilities)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {category.links.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    link.action();
                    onClose();
                  }}
                  className="p-4 rounded-xl border border-slate-200 hover:border-[#002b49] hover:bg-slate-50/80 text-left transition-all group flex items-start justify-between cursor-pointer"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#002b49] transition-colors">
                        {link.title}
                      </span>
                      {link.badge && (
                        <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-[#d81a28]">
                          {link.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {link.sub}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#d81a28] group-hover:translate-x-1 transition-all shrink-0 mt-0.5" />
                </button>
              ))}
            </div>

            {/* Quick Action Footer in MegaMenu */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>JIS C 8955 / 消防法告示第2号 / 電気事業法第48条 完全準拠設計</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    onOpenEngineeringTools();
                    onClose();
                  }}
                  className="font-bold text-[#002b49] hover:text-[#d81a28] flex items-center gap-1 transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  <span>クラウド設計ツールを起動</span>
                </button>
                <span className="text-slate-300">|</span>
                <button
                  onClick={() => {
                    onOpenContact();
                    onClose();
                  }}
                  className="font-bold text-[#d81a28] hover:underline"
                >
                  エンジニアに相談する →
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
