import React, { useState, useEffect } from 'react';
import { CableSpecificationItem } from '../types';
import { Zap, Search, ShieldCheck, Filter, ArrowUpDown } from 'lucide-react';

export const CableLibraryTab: React.FC = () => {
  const [cables, setCables] = useState<CableSpecificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [voltageFilter, setVoltageFilter] = useState('ALL');

  useEffect(() => {
    fetchCables();
  }, []);

  const fetchCables = async () => {
    try {
      const res = await fetch('/api/cables');
      if (res.ok) {
        const data = await res.json();
        setCables(data);
      }
    } catch (err) {
      console.error('Failed to load cables:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCables = cables.filter(c => {
    if (voltageFilter === '600V' && !c.ratedVoltage.includes('600V')) return false;
    if (voltageFilter === '6.6kV' && !c.ratedVoltage.includes('6.6kV')) return false;
    if (voltageFilter === '1500V' && !c.ratedVoltage.includes('1500V')) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.material.toLowerCase().includes(q) ||
        c.standard.toLowerCase().includes(q) ||
        c.sizeMm2.toString().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
              <Zap className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Cable Specifications Library</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Standard conductor specifications, ampacity ratings, AC/DC resistance, and reactance according to JIS C 3605 and IEC 60502.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by cable type, size, standard..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-slate-50/50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1.5 text-xs bg-slate-100/80 p-1 rounded-xl">
          {['ALL', '600V', '6.6kV', '1500V'].map(v => (
            <button
              key={v}
              onClick={() => setVoltageFilter(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                voltageFilter === v
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {v === 'ALL' ? 'All Voltages' : v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[11px]">
              <tr>
                <th className="px-4 py-3">Cable Type</th>
                <th className="px-3 py-3">Voltage</th>
                <th className="px-3 py-3">Size (mm²)</th>
                <th className="px-3 py-3">Conductor</th>
                <th className="px-3 py-3">In Air (A)</th>
                <th className="px-3 py-3">In Ground (A)</th>
                <th className="px-3 py-3">R at 20°C (Ω/km)</th>
                <th className="px-3 py-3">X at 50Hz (Ω/km)</th>
                <th className="px-4 py-3">Standard</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {filteredCables.map(cable => (
                <tr key={cable.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 font-sans font-bold text-slate-900">
                    {cable.name || cable.code}
                  </td>
                  <td className="px-3 py-3 text-slate-600 font-sans">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {cable.ratedVoltage}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-bold text-blue-700">
                    {cable.sizeMm2} mm²
                  </td>
                  <td className="px-3 py-3 font-sans text-slate-600">
                    {cable.material} ({cable.insulation})
                  </td>
                  <td className="px-3 py-3 font-semibold text-slate-800">
                    {cable.ampacityAirA} A
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {cable.ampacityGroundA} A
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    {cable.resistance20COhmKm}
                  </td>
                  <td className="px-3 py-3 text-slate-700">
                    0.08
                  </td>
                  <td className="px-4 py-3 font-sans text-slate-500 text-[11px]">
                    {cable.standard}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
