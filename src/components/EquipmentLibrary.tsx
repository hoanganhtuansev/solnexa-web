import React, { useState, useEffect } from 'react';
import {
  Database,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles,
  Zap,
  Cpu,
  FileText
} from 'lucide-react';
import { EquipmentModel, EquipmentSpecification, EquipmentCategoryCode } from '../types';

interface EquipmentLibraryProps {
  onSelectForCalculation?: (model: EquipmentModel) => void;
}

export const EquipmentLibrary: React.FC<EquipmentLibraryProps> = ({
  onSelectForCalculation
}) => {
  const [models, setModels] = useState<EquipmentModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<EquipmentModel | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedManufacturer, setSelectedManufacturer] = useState<string>('ALL');
  const [approvalFilter, setApprovalFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchEquipment = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/equipment');
      const data: EquipmentModel[] = await res.json();
      setModels(data);
      if (data.length > 0 && !selectedModel) {
        setSelectedModel(data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch equipment models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const categories: EquipmentCategoryCode[] = [
    'PV_MODULE',
    'PCS_INVERTER',
    'BESS',
    'BATTERY',
    'TRANSFORMER',
    'QB_CUBICLE',
    'MCCB',
    'ACB',
    'VCB',
    'FUSE',
    'CABLE',
    'COMBINER_BOX',
    'DISTRIBUTION_BOARD',
    'OTHER'
  ];

  const manufacturers = Array.from(new Set(models.map(m => m.manufacturerName))).sort();

  // Filtered list
  const filteredModels = models.filter(m => {
    const matchesSearch =
      m.modelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.manufacturerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || m.categoryCode === selectedCategory;
    const matchesMfg = selectedManufacturer === 'ALL' || m.manufacturerName === selectedManufacturer;
    const matchesApproval =
      approvalFilter === 'ALL' ||
      (approvalFilter === 'APPROVED' ? m.isApproved : !m.isApproved);

    return matchesSearch && matchesCategory && matchesMfg && matchesApproval;
  });

  const exportToJson = (model: EquipmentModel) => {
    const dataStr = JSON.stringify(model, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${model.manufacturerName}_${model.modelName}_specs.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-700 font-mono text-[11px] uppercase tracking-wider font-semibold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                VERIFIED EQUIPMENT DATABASE
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">
                Structured Specifications Catalog
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Equipment Specifications Library
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Verified electrical and mechanical specifications for PV Modules, Inverters/PCS, BESS Storage, Transformers, and Protection Switchgear.
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-emerald-700 font-semibold shadow-2xs">
              {models.filter(m => m.isApproved).length} Verified Models
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap gap-3 items-center justify-between">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="equipment-search-input"
            type="text"
            placeholder="Search by model name, manufacturer, specification..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50/50 focus:bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Filter */}
          <select
            id="filter-category-select"
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Manufacturer Filter */}
          <select
            id="filter-mfg-select"
            value={selectedManufacturer}
            onChange={e => setSelectedManufacturer(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Manufacturers</option>
            {manufacturers.map(mfg => (
              <option key={mfg} value={mfg}>
                {mfg}
              </option>
            ))}
          </select>

          {/* Verification Status */}
          <select
            id="filter-status-select"
            value={approvalFilter}
            onChange={e => setApprovalFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            <option value="ALL">All Status</option>
            <option value="APPROVED">Verified Only</option>
            <option value="PENDING">Pending Review</option>
          </select>
        </div>
      </div>

      {/* Grid: Left Models List + Right Specs Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Model List */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Found {filteredModels.length} Models
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredModels.map(model => {
              const isSelected = selectedModel?.id === model.id;
              return (
                <div
                  key={model.id}
                  onClick={() => setSelectedModel(model)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-blue-50/70 border-2 border-blue-500 shadow-2xs'
                      : 'bg-white border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {model.categoryCode}
                    </span>
                    {model.isApproved ? (
                      <span className="flex items-center space-x-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2">{model.modelName}</h3>
                  <p className="text-xs text-slate-500 font-medium">{model.manufacturerName}</p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{model.specifications?.length || 0} Specs</span>
                    <span>v{model.revision || 1}</span>
                  </div>
                </div>
              );
            })}

            {filteredModels.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-4 text-xs text-slate-500">
                No equipment models match your filter.
              </div>
            )}
          </div>
        </div>

        {/* Right 2 Columns: Detailed Specifications Table */}
        <div className="lg:col-span-2">
          {selectedModel ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                      {selectedModel.categoryCode}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ID: {selectedModel.id}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
                    {selectedModel.manufacturerName} {selectedModel.modelName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {selectedModel.description || `${selectedModel.manufacturerName} ${selectedModel.modelName}`}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => exportToJson(selectedModel)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer active:scale-98"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* Datasheet Reference Metadata */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                <div className="flex items-center space-x-2 text-slate-700">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Datasheet: {selectedModel.datasheetFilename || 'Standard Database Seed'}</span>
                </div>
                <span className="text-slate-500">Updated: {new Date(selectedModel.updatedAt).toLocaleDateString()}</span>
              </div>

              {/* Specifications Table */}
              <div>
                <h3 className="text-xs uppercase font-bold text-slate-900 tracking-wider mb-3">
                  Standard Specifications ({selectedModel.specifications?.length || 0})
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-200/80 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 text-[10px] uppercase font-mono tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3.5">Parameter</th>
                        <th className="py-3 px-3.5">Standard Value</th>
                        <th className="py-3 px-3.5">SI Unit</th>
                        <th className="py-3 px-3.5">Status</th>
                        <th className="py-3 px-3.5">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700 font-mono bg-white">
                      {(selectedModel.specifications || []).map(spec => (
                        <tr key={spec.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-3.5 font-sans">
                            <span className="font-semibold text-slate-900">{spec.displayName}</span>
                            <span className="block text-[10px] font-mono text-slate-400">{spec.parameterName}</span>
                          </td>
                          <td className="py-3 px-3.5 font-bold text-blue-700">
                            {String(spec.normalizedValue)}
                          </td>
                          <td className="py-3 px-3.5 text-slate-500">{spec.normalizedUnit || '-'}</td>
                          <td className="py-3 px-3.5">
                            {spec.reviewStatus === 'APPROVED' ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold">Verified</span>
                            ) : (
                              <span className="text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold">Pending</span>
                            )}
                          </td>
                          <td className="py-3 px-3.5 text-[10px] text-slate-500">
                            Page {spec.sourcePage} ({Math.round(spec.confidence * 100)}%)
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 p-4 text-xs text-slate-500 shadow-2xs">
              Select an equipment model from the left list to view standard specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
