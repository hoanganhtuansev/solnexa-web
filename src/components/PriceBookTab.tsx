import React, { useState, useEffect } from 'react';
import { PriceBookItem } from '../types';
import { DollarSign, Search, Tag, Check, Edit2, Plus } from 'lucide-react';

export const PriceBookTab: React.FC = () => {
  const [items, setItems] = useState<PriceBookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchPriceBook();
  }, []);

  const fetchPriceBook = async () => {
    try {
      const res = await fetch('/api/price-book');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to load price book:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['ALL', 'PV_MODULE', 'INVERTER', 'BESS', 'TRANSFORMER', 'CABLE', 'STRUCTURE', 'LABOR'];

  const filteredItems = items.filter(item => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.itemName.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.modelOrSpec || '').toLowerCase().includes(q)
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
              <DollarSign className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Standard Price Book</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Reference unit pricing for Solar PV &amp; BESS equipment, cables, balance of system (BOS), and EPC labor.
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
            placeholder="Search price book by item name or spec..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 bg-slate-50/50 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar bg-slate-100/80 p-1 rounded-xl">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === c
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {c === 'ALL' ? 'All Items' : c.replace('_', ' ')}
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
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Item Name &amp; Description</th>
                <th className="px-4 py-3">Specification</th>
                <th className="px-3 py-3">Unit</th>
                <th className="px-4 py-3 text-right">Unit Price (¥ JPY)</th>
                <th className="px-4 py-3 text-right">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.itemName}
                  </td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                    {item.modelOrSpec || (item as any).specification || '—'}
                  </td>
                  <td className="px-3 py-3 text-slate-600">
                    {item.unit}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ¥ {(item.unitPriceJpy ?? (item as any).unitPriceYen ?? 0).toLocaleString('ja-JP')}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-400 font-mono text-[11px]">
                    {item.lastUpdated}
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
