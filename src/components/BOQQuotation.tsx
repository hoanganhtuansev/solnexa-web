import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Layers,
  Zap,
  Printer,
  Building,
  ShieldCheck
} from 'lucide-react';
import { EquipmentModel } from '../types';
import { APP_IMAGES } from '../assets/images';

interface BOQItem {
  id: string;
  category: string;
  description: string;
  modelCode: string;
  quantity: number;
  unit: string;
  unitMaterialPrice: number;
  unitLaborPrice: number;
}

export const BOQQuotation: React.FC = () => {
  const [approvedModels, setApprovedModels] = useState<EquipmentModel[]>([]);
  const [currency, setCurrency] = useState<'JPY' | 'USD' | 'VND'>('JPY');

  // Currency multiplier relative to JPY
  const currencyRates: Record<'JPY' | 'USD' | 'VND', { symbol: string; rate: number }> = {
    JPY: { symbol: '¥', rate: 1 },
    USD: { symbol: '$', rate: 1 / 155 },
    VND: { symbol: '₫', rate: 164 }
  };

  const currentRate = currencyRates[currency];

  const [items, setItems] = useState<BOQItem[]>([
    {
      id: 'boq-1',
      category: 'PV_MODULE',
      description: 'Trina Vertex N 580W TOPCon Dual-Glass Solar Module',
      modelCode: 'TSM-580NE19R',
      quantity: 1724,
      unit: 'pcs',
      unitMaterialPrice: 16500,
      unitLaborPrice: 2200
    },
    {
      id: 'boq-2',
      category: 'PCS_INVERTER',
      description: 'Sungrow SG500HV 500kW Central Inverter Station',
      modelCode: 'SG500HV',
      quantity: 2,
      unit: 'sets',
      unitMaterialPrice: 4800000,
      unitLaborPrice: 450000
    },
    {
      id: 'boq-3',
      category: 'TRANSFORMER',
      description: 'Hitachi 1,250 kVA 400V / 6.6 kV Step-Up Transformer',
      modelCode: 'HT-TR-1250KVA-6.6KV',
      quantity: 1,
      unit: 'set',
      unitMaterialPrice: 9500000,
      unitLaborPrice: 850000
    },
    {
      id: 'boq-4',
      category: 'CABLE',
      description: 'Sumitomo CV 6.6kV 3C × 240mm² MV Underground Cable',
      modelCode: 'CV-6.6KV-3C-240',
      quantity: 450,
      unit: 'm',
      unitMaterialPrice: 8200,
      unitLaborPrice: 1800
    },
    {
      id: 'boq-5',
      category: 'MOUNTING',
      description: 'Hot-Dip Galvanized Ground Mounting Rack Structure (ZAM Steel)',
      modelCode: 'G-RACK-AL-4P',
      quantity: 1724,
      unit: 'sets',
      unitMaterialPrice: 4200,
      unitLaborPrice: 1600
    }
  ]);

  const [marginPercent, setMarginPercent] = useState<number>(15);
  const [engineeringFeeJpy, setEngineeringFeeJpy] = useState<number>(3500000);

  useEffect(() => {
    fetch('/api/equipment?isApproved=true')
      .then(res => res.json())
      .then(data => setApprovedModels(data))
      .catch(err => console.error(err));
  }, []);

  const handleAddCustomItem = () => {
    const newItem: BOQItem = {
      id: `boq-${Date.now()}`,
      category: 'ELECTRICAL_BOS',
      description: 'DC Combiner & Surge Protection Box',
      modelCode: 'SPD-DC-1500V',
      quantity: 10,
      unit: 'sets',
      unitMaterialPrice: 85000,
      unitLaborPrice: 15000
    };
    setItems([...items, newItem]);
  };

  const handleAddItemFromDb = (model: EquipmentModel) => {
    const newItem: BOQItem = {
      id: `boq-${Date.now()}`,
      category: model.categoryCode,
      description: `${model.manufacturerName} ${model.modelName}`,
      modelCode: model.modelName,
      quantity: 1,
      unit: model.categoryCode === 'CABLE' ? 'm' : 'pcs',
      unitMaterialPrice: 15000,
      unitLaborPrice: 3000
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof BOQItem, value: any) => {
    setItems(items.map(i => (i.id === id ? { ...i, [field]: value } : i)));
  };

  // Calculations in JPY base
  const totalMaterialJpy = items.reduce((acc, i) => acc + i.quantity * i.unitMaterialPrice, 0);
  const totalLaborJpy = items.reduce((acc, i) => acc + i.quantity * i.unitLaborPrice, 0);
  const subtotalJpy = totalMaterialJpy + totalLaborJpy + engineeringFeeJpy;
  const marginAmountJpy = (subtotalJpy * marginPercent) / 100;
  const grandTotalJpy = subtotalJpy + marginAmountJpy;

  const formatCurrency = (amountJpy: number) => {
    const converted = amountJpy * currentRate.rate;
    if (currency === 'JPY') {
      return `${currentRate.symbol} ${Math.round(converted).toLocaleString()}`;
    } else if (currency === 'USD') {
      return `${currentRate.symbol} ${Math.round(converted).toLocaleString()}`;
    } else {
      return `${currentRate.symbol} ${Math.round(converted).toLocaleString()}`;
    }
  };

  const exportCsv = () => {
    let csv = `Category,Description,Model,Quantity,Unit,Unit Material (${currency}),Unit Labor (${currency}),Total Material (${currency}),Total Labor (${currency}),Line Total (${currency})\n`;
    items.forEach(i => {
      const matUnit = (i.unitMaterialPrice * currentRate.rate).toFixed(2);
      const labUnit = (i.unitLaborPrice * currentRate.rate).toFixed(2);
      const matTot = (i.quantity * i.unitMaterialPrice * currentRate.rate).toFixed(2);
      const labTot = (i.quantity * i.unitLaborPrice * currentRate.rate).toFixed(2);
      const lineTot = (parseFloat(matTot) + parseFloat(labTot)).toFixed(2);
      csv += `"${i.category}","${i.description}","${i.modelCode}",${i.quantity},"${i.unit}",${matUnit},${labUnit},${matTot},${labTot},${lineTot}\n`;
    });
    csv += `\nSubtotal Material,,,,,${(totalMaterialJpy * currentRate.rate).toFixed(2)}\n`;
    csv += `Subtotal Labor,,,,,${(totalLaborJpy * currentRate.rate).toFixed(2)}\n`;
    csv += `Engineering & Interconnection Fee,,,,,${(engineeringFeeJpy * currentRate.rate).toFixed(2)}\n`;
    csv += `Gross Margin (${marginPercent}%),,,,,${(marginAmountJpy * currentRate.rate).toFixed(2)}\n`;
    csv += `Grand Total Commercial Quotation,,,,,${(grandTotalJpy * currentRate.rate).toFixed(2)}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOLNEXA_Commercial_Quotation_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-700 font-mono text-[11px] uppercase tracking-wider font-semibold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                EPC COMMERCIAL QUOTATION
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">
                概算見積 &amp; 機器数量積算 (BOQ)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Bill of Quantities &amp; Commercial Proposal
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Real-time engineering BOQ linking approved equipment specifications, installation labor rates, commercial markup, and exportable quotations.
            </p>
          </div>

          {/* Action buttons & Currency selector */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Currency Toggle */}
            <div className="bg-slate-100/80 border border-slate-200/80 rounded-xl p-1 flex items-center space-x-1 text-xs font-semibold text-slate-600">
              {(['JPY', 'USD', 'VND'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    currency === c ? 'bg-white text-slate-900 shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-xs flex items-center space-x-1.5 border border-slate-200 transition-colors shadow-2xs cursor-pointer active:scale-98"
              title="Print or Export PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={exportCsv}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-2xs transition-colors cursor-pointer active:scale-98"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase text-slate-500 font-semibold block">Equipment / Material (機器材料費)</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-2">{formatCurrency(totalMaterialJpy)}</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1">{(totalMaterialJpy / grandTotalJpy * 100).toFixed(1)}% of total</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase text-slate-500 font-semibold block">EPC Installation Labor (施工労務費)</span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-2">{formatCurrency(totalLaborJpy)}</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1">{(totalLaborJpy / grandTotalJpy * 100).toFixed(1)}% of total</span>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase text-slate-500 font-semibold block">Gross Margin (粗利 {marginPercent}%)</span>
          <p className="text-xl font-bold font-mono text-blue-700 mt-2">{formatCurrency(marginAmountJpy)}</p>
          <span className="text-[10px] text-blue-600/80 font-mono mt-1">Commercial Margin</span>
        </div>
        <div className="p-4 bg-slate-900 text-white rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] uppercase text-slate-300 font-semibold block">Grand Total Quotation (見積合計)</span>
          <p className="text-2xl font-bold font-mono text-white mt-2">{formatCurrency(grandTotalJpy)}</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1">Excl. Consumption Tax</span>
        </div>
      </div>

      {/* 3. Interactive BOQ Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Bill of Quantities ({items.length} line items)
            </h3>
            <span className="text-xs text-slate-400">/ 積算内訳書</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAddCustomItem}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-blue-600" />
              <span>+ Add Custom Item</span>
            </button>

            <select
              onChange={e => {
                const model = approvedModels.find(m => m.id === e.target.value);
                if (model) handleAddItemFromDb(model);
                e.target.value = '';
              }}
              className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:border-blue-500 shadow-2xs"
              defaultValue=""
            >
              <option value="" disabled>Add from Equipment Library...</option>
              {approvedModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.manufacturerName} {m.modelName} ({m.categoryCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5">Item Description (品名・仕様)</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5 text-right">Quantity</th>
                <th className="py-3 px-3.5">Unit</th>
                <th className="py-3 px-3.5 text-right">Unit Material ({currency})</th>
                <th className="py-3 px-3.5 text-right">Unit Labor ({currency})</th>
                <th className="py-3 px-3.5 text-right">Line Total ({currency})</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {items.map(item => {
                const lineTotalJpy = item.quantity * (item.unitMaterialPrice + item.unitLaborPrice);
                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                        className="w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-hidden text-slate-900 font-bold"
                      />
                      <span className="block text-[10px] font-mono text-slate-400 mt-0.5">{item.modelCode}</span>
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold border border-slate-200">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right">
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 text-right shadow-2xs font-mono font-bold"
                      />
                    </td>
                    <td className="py-3 px-3.5 text-slate-500">{item.unit}</td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      <input
                        type="number"
                        step="1"
                        value={Math.round(item.unitMaterialPrice * currentRate.rate)}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateItem(item.id, 'unitMaterialPrice', Math.round(val / currentRate.rate));
                        }}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 text-right shadow-2xs"
                      />
                    </td>
                    <td className="py-3 px-3.5 text-right font-mono">
                      <input
                        type="number"
                        step="1"
                        value={Math.round(item.unitLaborPrice * currentRate.rate)}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          handleUpdateItem(item.id, 'unitLaborPrice', Math.round(val / currentRate.rate));
                        }}
                        className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 text-right shadow-2xs"
                      />
                    </td>
                    <td className="py-3 px-3.5 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(lineTotalJpy)}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Commercial Adjustments Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-slate-600 font-semibold">Engineering &amp; Permitting ({currency}):</label>
              <input
                type="number"
                value={Math.round(engineeringFeeJpy * currentRate.rate)}
                onChange={e => {
                  const val = parseFloat(e.target.value) || 0;
                  setEngineeringFeeJpy(Math.round(val / currentRate.rate));
                }}
                className="w-32 bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-900 text-right shadow-2xs font-mono font-semibold"
              />
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-slate-600 font-semibold">Target Margin (%):</label>
              <input
                type="range"
                min={0}
                max={35}
                value={marginPercent}
                onChange={e => setMarginPercent(parseFloat(e.target.value) || 0)}
                className="w-24 accent-blue-600"
              />
              <span className="font-bold text-blue-600 font-mono min-w-8">{marginPercent}%</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-slate-500 mr-2">Commercial Proposal Total:</span>
            <span className="text-xl font-black text-slate-900">{formatCurrency(grandTotalJpy)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

