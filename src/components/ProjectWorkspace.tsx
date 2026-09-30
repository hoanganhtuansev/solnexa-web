import React, { useState, useEffect, useMemo } from 'react';
import {
  Save,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Activity,
  ArrowRight,
  ChevronRight,
  Printer,
  Download,
  FileSpreadsheet,
  Edit2,
  Sliders,
  MoreHorizontal,
  Search,
  ExternalLink,
  ShieldCheck,
  Building,
  RefreshCw,
  Cpu,
  Layers,
  MapPin,
  Clock,
  Boxes,
  Network,
  Plus,
  Trash2,
  BatteryCharging,
  LineChart,
  Settings
} from 'lucide-react';
import { ProjectSubView } from './Sidebar';
import {
  PvModuleGraphic,
  InverterGraphic,
  TransformerGraphic,
  AerialSolarRooftopGraphic
} from './solarAssets';
import { calculateCableVoltageDrop, evaluateStringDesign } from '../utils/engineeringMath';
import { DatasheetModal } from './DatasheetModal';
import { EngineeringReportModal } from './EngineeringReportModal';
import { EditProjectModal } from './EditProjectModal';
import { SingleLineDiagram } from './SingleLineDiagram';
import { YieldSimulationTab } from './YieldSimulationTab';
import { BessStorageView } from './BessStorageView';
import { PcsEquipmentView } from './PcsEquipmentView';
import { TransformerGridView } from './TransformerGridView';
import { APP_IMAGES } from '../assets/images';

interface ProjectWorkspaceProps {
  projectId: string;
  subView?: ProjectSubView;
  onSelectSubView?: (view: ProjectSubView) => void;
  onBack: () => void;
  onOpenLibrary: () => void;
  onOpenDatasheets: () => void;
}

export const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({
  projectId,
  subView = 'overview',
  onSelectSubView,
  onBack,
  onOpenLibrary,
  onOpenDatasheets
}) => {
  const [project, setProject] = useState<any>({
    id: 'proj-chiba-solar',
    name: 'Chiba Factory Solar',
    type: 'Solar PV',
    status: 'In Design',
    capacityDisplay: '1.2 MWp',
    voltageDisplay: '400 V / 6.6 kV',
    location: 'Chiba, Japan',
    pvCapacityKwp: 1200,
    acCapacityKw: 1000,
    dcAcRatio: 1.25,
    estimatedCostJpy: 120000000,
    completionPercent: 60,
    notes: [
      '1. Check roof load capacity',
      '2. Confirm grid connection point',
      '3. Consider BESS for self-consumption (future)'
    ]
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isDatasheetOpen, setIsDatasheetOpen] = useState(false);
  const [activeDatasheetEquip, setActiveDatasheetEquip] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);

  // Screen 3: PV Module Selection state
  const [selectedManufacturer, setSelectedManufacturer] = useState<string[]>(['Trina']);
  const [powerRange, setPowerRange] = useState<number>(550);
  const [selectedCellType, setSelectedCellType] = useState<string>('ALL');
  const [pvSearchQuery, setPvSearchQuery] = useState<string>('');
  const [selectedModule, setSelectedModule] = useState<any>({
    id: 'trina-580',
    manufacturer: 'Trina',
    model: 'TSM-580NE19R',
    power: 580,
    voc: 51.42,
    isc: 14.42,
    vmp: 43.12,
    imp: 13.45,
    eff: 22.5,
    cellType: 'N-type',
    unitPriceJpy: 16500
  });

  // Screen 4: Cable calculation state
  const [cableTab, setCableTab] = useState<'dc' | 'ac-inv' | 'ac-trans'>('dc');
  const [calcCurrent, setCalcCurrent] = useState<number>(24.5);
  const [calcLength, setCalcLength] = useState<number>(120);
  const [calcVoltage, setCalcVoltage] = useState<number>(1000);
  const [calcMethod, setCalcMethod] = useState<string>('Cable tray');
  const [calcTemp, setCalcTemp] = useState<number>(30);
  const [calcMaxDrop, setCalcMaxDrop] = useState<number>(1.5);

  // Screen 5: BOQ / Quotation subtab state
  const [commercialTab, setCommercialTab] = useState<'boq' | 'quotation'>(
    subView === 'boq' ? 'boq' : 'quotation'
  );
  const [marginPercent, setMarginPercent] = useState<number>(15);

  // String design state
  const [stringModulesCount, setStringModulesCount] = useState<number>(19);
  const [stringMinTemp, setStringMinTemp] = useState<number>(-10);
  const [stringMaxTemp, setStringMaxTemp] = useState<number>(70);

  const isBess = project?.type === 'BESS' || String(project?.name || '').toLowerCase().includes('bess');

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  useEffect(() => {
    if (subView === 'boq') setCommercialTab('boq');
    if (subView === 'quotation') setCommercialTab('quotation');
  }, [subView]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    } finally {
      setLoading(false);
    }
  };

  // Persistent Save to Database
  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProject = {
        ...project,
        pvModule: {
          manufacturer: selectedModule.manufacturer,
          model: selectedModule.model,
          power: selectedModule.power,
          qty: totalModules
        },
        quotation: {
          ...quotationCosts,
          marginPercentage: marginPercent,
          sellingPrice
        }
      };

      await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProject)
      });

      setProject(updatedProject);
      setSaveSuccess(true);
      showToast('Project specifications saved and verified successfully.');
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  // Switch cable presets when switching subtabs
  const handleCableTabChange = (tab: 'dc' | 'ac-inv' | 'ac-trans') => {
    setCableTab(tab);
    if (tab === 'dc') {
      setCalcCurrent(24.5);
      setCalcLength(120);
      setCalcVoltage(1000);
      setCalcMaxDrop(1.5);
    } else if (tab === 'ac-inv') {
      setCalcCurrent(72.2);
      setCalcLength(45);
      setCalcVoltage(400);
      setCalcMaxDrop(1.0);
    } else {
      setCalcCurrent(87.5);
      setCalcLength(60);
      setCalcVoltage(6600);
      setCalcMaxDrop(1.0);
    }
  };

  // Real Mathematical Voltage Drop Calculation
  const cableCalcResult = useMemo(() => {
    const systemType = cableTab === 'dc' ? 'DC' : 'AC_3PHASE';
    return calculateCableVoltageDrop({
      currentA: calcCurrent,
      lengthM: calcLength,
      voltageV: calcVoltage,
      systemType,
      installationMethod: calcMethod,
      ambientTempC: calcTemp,
      maxVoltageDropPercent: calcMaxDrop,
      powerFactor: 0.95
    });
  }, [calcCurrent, calcLength, calcVoltage, calcMethod, calcTemp, calcMaxDrop, cableTab]);

  // Export Cable Calculation Report as CSV
  const handleExportCableCalc = () => {
    const rows = [
      ['SOLNEXA Engineering - Cable & Voltage Drop Verification Report'],
      ['Project', project.name],
      ['Subsystem', cableTab.toUpperCase()],
      ['Current (A)', calcCurrent],
      ['Length (m)', calcLength],
      ['System Voltage (V)', calcVoltage],
      ['Installation Method', calcMethod],
      ['Ambient Temp (°C)', calcTemp],
      ['Max Allowed Drop (%)', calcMaxDrop],
      [],
      ['Recommended Cable', `CVT ${cableCalcResult.recommendedSizeMm2} mm²`],
      ['Voltage Drop (%)', cableCalcResult.voltageDropPercent],
      ['Voltage Drop (V)', cableCalcResult.voltageDropV],
      ['Ampacity (A)', cableCalcResult.ampacityA],
      ['Margin (x)', cableCalcResult.margin],
      ['Status', cableCalcResult.status],
      [],
      ['Size (mm²)', 'Voltage Drop (%)', 'Ampacity (A)', 'Status']
    ];

    cableCalcResult.comparison.forEach(c => {
      rows.push([`${c.sizeMm2} mm²`, `${c.voltageDropPercent}%`, `${c.deratedAmpacityA} A`, c.status]);
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Cable_Voltage_Drop_${project.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Calculation report exported successfully.');
  };

  // PV Module Catalog Database
  const pvModuleCatalog = [
    {
      id: 'trina-580',
      manufacturer: 'Trina',
      model: 'TSM-580NE19R',
      power: 580,
      voc: 51.42,
      isc: 14.42,
      vmp: 43.12,
      imp: 13.45,
      eff: 22.5,
      cellType: 'N-type',
      unitPriceJpy: 16500
    },
    {
      id: 'jinko-585',
      manufacturer: 'Jinko',
      model: 'JKM585N-72HL4-BDV',
      power: 585,
      voc: 52.10,
      isc: 14.40,
      vmp: 43.45,
      imp: 13.46,
      eff: 22.6,
      cellType: 'N-type',
      unitPriceJpy: 16800
    },
    {
      id: 'longi-585',
      manufacturer: 'LONGi',
      model: 'LR5-72HTH-585M',
      power: 585,
      voc: 52.30,
      isc: 14.38,
      vmp: 43.60,
      imp: 13.42,
      eff: 22.6,
      cellType: 'N-type',
      unitPriceJpy: 16750
    },
    {
      id: 'cs-585',
      manufacturer: 'Canadian Solar',
      model: 'CS7N-585MB-AG',
      power: 585,
      voc: 51.20,
      isc: 14.58,
      vmp: 42.40,
      imp: 13.80,
      eff: 22.6,
      cellType: 'N-type',
      unitPriceJpy: 16500
    },
    {
      id: 'ja-580',
      manufacturer: 'JA Solar',
      model: 'JAM72D40-580/GB',
      power: 580,
      voc: 52.00,
      isc: 14.22,
      vmp: 43.20,
      imp: 13.43,
      eff: 22.5,
      cellType: 'N-type',
      unitPriceJpy: 16400
    }
  ];

  // Dynamic Filtering of PV Modules
  const filteredModules = useMemo(() => {
    return pvModuleCatalog.filter(mod => {
      const matchMfg =
        selectedManufacturer.length === 0 || selectedManufacturer.includes(mod.manufacturer);
      const matchPower = mod.power >= powerRange - 20;
      const matchCell = selectedCellType === 'ALL' || mod.cellType === selectedCellType;
      const matchSearch =
        !pvSearchQuery ||
        mod.manufacturer.toLowerCase().includes(pvSearchQuery.toLowerCase()) ||
        mod.model.toLowerCase().includes(pvSearchQuery.toLowerCase());

      return matchMfg && matchPower && matchCell && matchSearch;
    });
  }, [selectedManufacturer, powerRange, selectedCellType, pvSearchQuery]);

  // Derived PV System Quantities
  const targetPvW = (project.pvCapacityKwp || 1200) * 1000;
  const totalModules = Math.round(targetPvW / selectedModule.power);
  const totalStrings = Math.ceil(totalModules / stringModulesCount);

  // Dynamic BOQ Items synchronized with selected module
  const boqItems = useMemo(() => {
    const pvModuleTotal = totalModules * selectedModule.unitPriceJpy;
    return [
      {
        no: 1,
        item: 'PV Module',
        manufacturer: selectedModule.manufacturer,
        model: selectedModule.model,
        qty: totalModules.toLocaleString(),
        rawQty: totalModules,
        unit: 'pcs',
        unitPriceNum: selectedModule.unitPriceJpy,
        unitPrice: `¥ ${selectedModule.unitPriceJpy.toLocaleString()}`,
        total: `¥ ${pvModuleTotal.toLocaleString()}`,
        totalNum: pvModuleTotal
      },
      {
        no: 2,
        item: 'PCS',
        manufacturer: 'Huawei',
        model: 'SUN2000-50KTL',
        qty: '20',
        rawQty: 20,
        unit: 'pcs',
        unitPriceNum: 1200000,
        unitPrice: '¥ 1,200,000',
        total: '¥ 24,000,000',
        totalNum: 24000000
      },
      {
        no: 3,
        item: 'Transformer',
        manufacturer: 'Hitachi',
        model: '1000 kVA',
        qty: '1',
        rawQty: 1,
        unit: 'set',
        unitPriceNum: 8500000,
        unitPrice: '¥ 8,500,000',
        total: '¥ 8,500,000',
        totalNum: 8500000
      },
      {
        no: 4,
        item: 'AC Combiner',
        manufacturer: 'Custom',
        model: 'ACB-400V-500A',
        qty: '5',
        rawQty: 5,
        unit: 'sets',
        unitPriceNum: 1200000,
        unitPrice: '¥ 1,200,000',
        total: '¥ 6,000,000',
        totalNum: 6000000
      },
      {
        no: 5,
        item: 'DC Cable / PV',
        manufacturer: 'Sumitomo',
        model: `CVT ${cableCalcResult.recommendedSizeMm2} mm²`,
        qty: '12,500',
        rawQty: 12500,
        unit: 'm',
        unitPriceNum: 1250,
        unitPrice: '¥ 1,250',
        total: '¥ 15,625,000',
        totalNum: 15625000
      }
    ];
  }, [totalModules, selectedModule, cableCalcResult.recommendedSizeMm2]);

  // Quotation Costs Calculation
  const materialCost = useMemo(() => {
    return boqItems.reduce((sum, item) => sum + item.totalNum, 0);
  }, [boqItems]);

  const quotationCosts = useMemo(() => {
    const labor = Math.round(materialCost * 0.22);
    const engineering = 3000000;
    const other = Math.round(materialCost * 0.06);
    const subtotal = materialCost + labor + engineering + other;
    return {
      materialCost,
      laborCost: labor,
      engineeringCost: engineering,
      otherCost: other,
      subtotal
    };
  }, [materialCost]);

  const marginAmount = Math.round((quotationCosts.subtotal * marginPercent) / 100);
  const sellingPrice = quotationCosts.subtotal + marginAmount;

  // Donut Percentages
  const equipmentPercent = Math.round((quotationCosts.materialCost / quotationCosts.subtotal) * 100);
  const laborPercent = Math.round((quotationCosts.laborCost / quotationCosts.subtotal) * 100);
  const engineeringPercent = Math.round((quotationCosts.engineeringCost / quotationCosts.subtotal) * 100);
  const otherPercent = Math.max(1, 100 - equipmentPercent - laborPercent - engineeringPercent);

  // String Design Calculation
  const stringEvaluation = useMemo(() => {
    return evaluateStringDesign({
      vocStcV: selectedModule.voc,
      vmpStcV: selectedModule.vmp,
      tempCoeffVocPercent: -0.26,
      tempCoeffVmpPercent: -0.30,
      minAmbientTempC: stringMinTemp,
      maxAmbientTempC: stringMaxTemp,
      inverterMaxVoltageV: 1100,
      inverterMpptMinV: 200,
      inverterMpptMaxV: 1000,
      modulesPerString: stringModulesCount
    });
  }, [selectedModule, stringModulesCount, stringMinTemp, stringMaxTemp]);

  // Handle Module Selection
  const handleSelectModule = (mod: any) => {
    setSelectedModule(mod);
    showToast(`Selected ${mod.manufacturer} ${mod.model}. System configuration & BOQ updated.`);
  };

  // Export BOQ & Quotation to Excel (CSV format)
  const handleExportBoqExcel = () => {
    const rows = [
      ['SOLNEXA Engineering - Bill of Quantities & Commercial Quotation'],
      ['Project Name', project.name],
      ['Location', project.location],
      ['Capacity', project.capacityDisplay],
      ['Date', new Date().toLocaleDateString('ja-JP')],
      [],
      ['No.', 'Item', 'Manufacturer', 'Model', 'Quantity', 'Unit', 'Unit Price (JPY)', 'Total Price (JPY)']
    ];

    boqItems.forEach(item => {
      rows.push([
        item.no.toString(),
        item.item,
        item.manufacturer,
        item.model,
        item.qty,
        item.unit,
        item.unitPriceNum.toString(),
        item.totalNum.toString()
      ]);
    });

    rows.push([]);
    rows.push(['Cost Breakdown']);
    rows.push(['Material Cost', quotationCosts.materialCost.toString()]);
    rows.push(['Labor Cost', quotationCosts.laborCost.toString()]);
    rows.push(['Engineering Cost', quotationCosts.engineeringCost.toString()]);
    rows.push(['Other Cost', quotationCosts.otherCost.toString()]);
    rows.push(['Subtotal', quotationCosts.subtotal.toString()]);
    rows.push(['Margin (%)', `${marginPercent}%`]);
    rows.push(['Margin Amount (JPY)', marginAmount.toString()]);
    rows.push(['Selling Price (JPY)', sellingPrice.toString()]);

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BOQ_Quotation_${project.name.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('BOQ & Quotation spreadsheet exported successfully.');
  };

  return (
    <div className="space-y-5 pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Title Bar (Present on Screens 2, 3, 4, 5) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          {/* Facility Image Thumbnail */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shadow-xs border border-slate-200 shrink-0 bg-slate-900 relative group">
            <img
              src={isBess ? APP_IMAGES.bessContainer : APP_IMAGES.solarFacility}
              alt={project.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <span>{project.name}</span>
                <button
                  onClick={() => setIsEditProjectOpen(true)}
                  className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-slate-100"
                  title="Edit Project Name & Properties"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </h1>

              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {project.type === 'BESS' ? 'BESS Storage' : 'Solar PV'}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {project.status || 'In Design'}
              </span>
            </div>

            <p className="text-xs text-slate-500 mt-1 font-mono flex items-center space-x-2">
              <MapPin className="w-3 h-3 text-slate-400 inline" />
              <span>{project.location || 'Japan'}</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{project.capacityDisplay}</span>
              <span>•</span>
              <span>{project.voltageDisplay}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Save, BOQ CSV Export, Generate Report, Edit */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs cursor-pointer active:scale-98"
            title="Save Project Specifications"
          >
            {saving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-500" />
            ) : saveSuccess ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Save className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{saveSuccess ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleExportBoqExcel}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-all shadow-xs cursor-pointer active:scale-98"
            title="Export BOQ & Cost Quotation as CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export BOQ</span>
          </button>

          <button
            onClick={() => setIsReportOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/20 cursor-pointer active:scale-98"
            title="Generate Engineering Compliance Report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Report</span>
          </button>

          <button
            onClick={() => setIsEditProjectOpen(true)}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Project Properties"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SCREEN 2 - PROJECT WORKSPACE TỔNG QUAN DỰ ÁN */}
      {/* ========================================================================= */}
      {subView === 'overview' && (
        <div className="space-y-5">
          {/* 5 KPI Metric Cards (Screen 2) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* KPI 1: PV or BESS Capacity */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                isBess ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-500'
              }`}>
                {isBess ? (
                  <BatteryCharging className="w-5 h-5 stroke-[2]" />
                ) : (
                  <Zap className="w-5 h-5 fill-amber-400 stroke-amber-500" />
                )}
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {isBess
                    ? '8.13 MWh'
                    : project.pvCapacityKwp
                    ? `${project.pvCapacityKwp.toLocaleString()} kWp`
                    : project.capacityDisplay}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {isBess ? 'Battery Storage' : 'PV Capacity'}
                </p>
              </div>
            </div>

            {/* KPI 2: AC Capacity */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center shrink-0">
                <Activity className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {isBess
                    ? '2,000 kW'
                    : project.acCapacityKw
                    ? `${project.acCapacityKw.toLocaleString()} kW`
                    : '500 kW'}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {isBess ? 'PCS AC Output' : 'AC Capacity'}
                </p>
              </div>
            </div>

            {/* KPI 3: DC/AC Ratio or C-Rate */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {isBess ? '0.25 C (4h)' : project.dcAcRatio || 1.25}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {isBess ? 'C-Rate / Duration' : 'DC/AC Ratio'}
                </p>
              </div>
            </div>

            {/* KPI 4: Estimated Cost */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 text-lg font-bold">
                ¥
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {isBess
                    ? '224,500,000'
                    : sellingPrice
                    ? sellingPrice.toLocaleString()
                    : '68,500,000'}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">Estimated Cost</p>
              </div>
            </div>

            {/* Completion (60% Circular progress ring) */}
            <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-xs flex items-center space-x-3.5 col-span-2 sm:col-span-1">
              <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#2563eb]"
                    strokeDasharray={`${project.completionPercent || 60}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="absolute text-[10px] font-extrabold text-slate-800">
                  {project.completionPercent || 60}%
                </span>
              </div>
              <div>
                <div className="text-xl font-extrabold text-slate-900 tracking-tight leading-none">
                  {project.completionPercent || 60}%
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">Completion</p>
              </div>
            </div>
          </div>

          {/* System Configuration Diagram (Screen 2) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                System Configuration
              </h2>
              <button
                onClick={() => onSelectSubView?.('pv-array')}
                className="text-xs font-semibold text-[#2563eb] hover:text-blue-700 flex items-center space-x-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Configuration</span>
              </button>
            </div>

            {/* 5-Node Flowchart */}
            <div className="grid grid-cols-1 md:grid-cols-9 gap-3 items-center py-3 overflow-x-auto">
              {/* 1. PV Modules or BESS Containers */}
              <div
                onClick={() => onSelectSubView?.(isBess ? 'bess-storage' : 'pv-array')}
                className="md:col-span-2 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
              >
                <div className="text-xs font-semibold text-slate-500">
                  {isBess ? 'BESS Storage' : 'PV Modules'}
                </div>
                <div className="w-14 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {isBess ? (
                    <div className="w-12 h-14 bg-indigo-50 border-2 border-indigo-400 rounded-md flex flex-col items-center justify-center p-1 space-y-1">
                      <BatteryCharging className="w-6 h-6 text-indigo-600" />
                      <span className="text-[9px] font-bold text-indigo-700">4x Cntr</span>
                    </div>
                  ) : (
                    <PvModuleGraphic className="w-12 h-16" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {isBess ? 'Huawei LUNA2000' : selectedModule.manufacturer}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {isBess ? '2.0MWH-2H1' : selectedModule.model}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isBess ? '2,032 kWh × 4 units' : `${selectedModule.power} W × ${totalModules.toLocaleString()} pcs`}
                  </div>
                </div>
              </div>

              {/* Arrow 1 */}
              <div className="hidden md:flex justify-center text-slate-300">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* 2. Strings or DC Bus */}
              <div
                onClick={() => onSelectSubView?.(isBess ? 'cable-voltage-drop' : 'string-design')}
                className="md:col-span-1 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
              >
                <div className="text-xs font-semibold text-slate-500">
                  {isBess ? 'DC Bus' : 'Strings'}
                </div>
                <div className="w-14 h-16 flex items-center justify-center text-[#2563eb]">
                  {isBess ? (
                    <div className="flex flex-col items-center justify-center space-y-1">
                      <div className="w-8 h-2 bg-amber-400 rounded-xs" />
                      <div className="w-8 h-2 bg-blue-500 rounded-xs" />
                      <div className="w-8 h-2 bg-emerald-500 rounded-xs" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 p-1 bg-white rounded border border-slate-200">
                      <div className="w-2.5 h-4 bg-blue-500 rounded-xs" />
                      <div className="w-2.5 h-4 bg-blue-500 rounded-xs" />
                      <div className="w-2.5 h-4 bg-blue-500 rounded-xs" />
                      <div className="w-2.5 h-4 bg-blue-500 rounded-xs" />
                      <div className="w-2.5 h-4 bg-blue-500 rounded-xs" />
                      <div className="w-2.5 h-4 bg-blue-500 rounded-xs" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">
                    {isBess ? '1,200 V DC' : `${stringModulesCount} modules`}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {isBess ? '4x Feeders' : `× ${totalStrings} strings`}
                  </div>
                </div>
              </div>

              {/* Arrow 2 */}
              <div className="hidden md:flex justify-center text-slate-300">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* 3. PCS / Inverter */}
              <div
                onClick={() => onSelectSubView?.('pcs')}
                className="md:col-span-2 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
              >
                <div className="text-xs font-semibold text-slate-500">
                  {isBess ? 'PCS Converter' : 'Solar Inverter'}
                </div>
                <div className="w-14 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <InverterGraphic className="w-16 h-12" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Huawei</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {isBess ? 'Smart String PCS' : 'SUN2000-100KTL'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isBess ? '2,000 kW (690V AC)' : '100 kW × 5 units'}
                  </div>
                </div>
              </div>

              {/* Arrow 3 */}
              <div className="hidden md:flex justify-center text-slate-300">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* 4. Transformer */}
              <div
                onClick={() => onSelectSubView?.('transformer')}
                className="md:col-span-1 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
              >
                <div className="text-xs font-semibold text-slate-500">Transformer</div>
                <div className="w-14 h-16 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <TransformerGraphic className="w-14 h-14" />
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">Hitachi</div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {isBess ? '2,500 kVA' : '500 kVA'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {isBess ? '6.6 kV / 690 V' : '6.6 kV / 400 V'}
                  </div>
                </div>
              </div>

              {/* Arrow 4 */}
              <div className="hidden md:flex justify-center text-slate-300">
                <ArrowRight className="w-5 h-5 text-slate-400" />
              </div>

              {/* 5. Grid */}
              <div
                onClick={() => onSelectSubView?.('grid')}
                className="md:col-span-1 bg-slate-50/70 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-300 rounded-xl p-3.5 text-center flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all group"
              >
                <div className="text-xs font-semibold text-slate-500">Grid</div>
                <div className="w-14 h-16 flex items-center justify-center text-slate-700">
                  <svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-current stroke-2">
                    <line x1="12" y1="2" x2="6" y2="22" />
                    <line x1="12" y1="2" x2="18" y2="22" />
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <line x1="7" y1="17" x2="17" y2="17" />
                    <line x1="6" y1="22" x2="18" y2="22" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-xs text-slate-900">6.6 kV</div>
                  <div className="text-[11px] text-slate-400">To Utility</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom 2 Cards: Project Information (Left) & Notes (Right) (Screen 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Project Information */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  Project Information
                </h2>
                <button
                  onClick={() => setIsEditProjectOpen(true)}
                  className="text-xs font-semibold text-[#2563eb] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Information list */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Project Name</span>
                    <span className="font-bold text-slate-800">{project.name}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Project Type</span>
                    <span className="font-semibold text-slate-800">{project.type} (On-grid)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Location</span>
                    <span className="text-slate-800">{project.location}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Total PV Capacity</span>
                    <span className="font-bold text-slate-800">
                      {project.pvCapacityKwp ? `${project.pvCapacityKwp.toLocaleString()} kWp` : project.capacityDisplay}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">AC Capacity</span>
                    <span className="text-slate-800">
                      {project.acCapacityKw ? `${project.acCapacityKw.toLocaleString()} kW` : '1,000 kW'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Grid Voltage</span>
                    <span className="text-slate-800">{project.voltageDisplay}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Design Standard</span>
                    <span className="font-mono text-slate-800">{project.designStandard || 'JIS, IEC'}</span>
                  </div>
                </div>

                {/* Right Aerial Photo Graphic */}
                <div className="h-44 rounded-lg overflow-hidden border border-slate-200 relative bg-slate-800">
                  <AerialSolarRooftopGraphic className="w-full h-full object-cover" />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">Notes</h2>
                <button
                  onClick={() => setIsEditProjectOpen(true)}
                  className="text-xs font-semibold text-[#2563eb] hover:underline"
                >
                  Edit
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-slate-700">
                {(project.notes || [
                  '1. Check roof load capacity',
                  '2. Confirm grid connection point',
                  '3. Consider BESS for self-consumption (future)'
                ]).map((note: string, idx: number) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start space-x-2">
                    <span className="font-bold text-slate-500">{idx + 1}.</span>
                    <span>{note.replace(/^\d+\.\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SCREEN 3 - CHỌN THIẾT BỊ - PV MODULE (PV Array) */}
      {/* ========================================================================= */}
      {subView === 'pv-array' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  PV Module Selection
                </h2>
                <p className="text-xs text-slate-500">
                  Select solar modules from verified manufacturer datasheets. System capacity &amp; string sizing update automatically.
                </p>
              </div>
              {/* Search PV modules */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pvSearchQuery}
                  onChange={e => setPvSearchQuery(e.target.value)}
                  placeholder="Search PV modules..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Left Filter Sidebar (Screen 3) */}
              <div className="space-y-5 pr-2 border-r border-slate-100">
                {/* Manufacturer Checkboxes */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">Manufacturer</label>
                  {['Trina', 'Jinko', 'LONGi', 'Canadian Solar', 'JA Solar'].map(mfg => (
                    <label
                      key={mfg}
                      className="flex items-center space-x-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedManufacturer.includes(mfg)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedManufacturer([...selectedManufacturer, mfg]);
                          } else {
                            setSelectedManufacturer(selectedManufacturer.filter(m => m !== mfg));
                          }
                        }}
                        className="rounded border-slate-300 text-[#2563eb] focus:ring-blue-500"
                      />
                      <span>{mfg}</span>
                    </label>
                  ))}
                </div>

                {/* Power Range (W) Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800">Min Power (W)</span>
                    <span className="font-mono text-slate-500">{powerRange} W</span>
                  </div>
                  <input
                    type="range"
                    min="400"
                    max="650"
                    step="5"
                    value={powerRange}
                    onChange={e => setPowerRange(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>400 W</span>
                    <span>650 W</span>
                  </div>
                </div>

                {/* Cell Type */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-800 block">Cell Type</label>
                  {['ALL', 'N-type', 'P-type'].map(type => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="cellType"
                        checked={selectedCellType === type}
                        onChange={() => setSelectedCellType(type)}
                        className="border-slate-300 text-[#2563eb] focus:ring-blue-500"
                      />
                      <span>{type === 'ALL' ? 'All Types' : type}</span>
                    </label>
                  ))}
                </div>

                {/* Reset button */}
                <button
                  onClick={() => {
                    setSelectedManufacturer(['Trina', 'Jinko', 'LONGi', 'Canadian Solar', 'JA Solar']);
                    setPowerRange(500);
                    setSelectedCellType('ALL');
                    setPvSearchQuery('');
                  }}
                  className="w-full py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Main Table (Screen 3) */}
              <div className="md:col-span-3 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-medium pb-2">
                        <th className="py-2.5 px-3">Manufacturer</th>
                        <th className="py-2.5 px-3">Power</th>
                        <th className="py-2.5 px-3">Voc (V)</th>
                        <th className="py-2.5 px-3">Isc (A)</th>
                        <th className="py-2.5 px-3">Eff. (%)</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredModules.map(mod => {
                        const isSelected = selectedModule.id === mod.id;
                        return (
                          <tr key={mod.id} className="hover:bg-slate-50/70 transition-colors">
                            {/* Manufacturer & Model Info */}
                            <td className="py-3 px-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-9 h-11 bg-slate-900 rounded p-0.5 shrink-0 flex items-center justify-center">
                                  <PvModuleGraphic className="w-7 h-9" />
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900">{mod.manufacturer}</div>
                                  <div className="text-[11px] font-mono text-slate-500">
                                    {mod.model}
                                  </div>
                                  <button
                                    onClick={() => {
                                      setActiveDatasheetEquip(mod);
                                      setIsDatasheetOpen(true);
                                    }}
                                    className="text-[10px] text-[#2563eb] hover:underline flex items-center space-x-0.5 mt-0.5"
                                  >
                                    <FileText className="w-2.5 h-2.5" />
                                    <span>Datasheet</span>
                                  </button>
                                </div>
                              </div>
                            </td>

                            {/* Power */}
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {mod.power} W
                            </td>

                            {/* Voc */}
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {mod.voc.toFixed(2)}
                            </td>

                            {/* Isc */}
                            <td className="py-3 px-3 font-mono text-slate-600">
                              {mod.isc.toFixed(2)}
                            </td>

                            {/* Eff. */}
                            <td className="py-3 px-3 font-semibold text-slate-800">
                              {mod.eff}%
                            </td>

                            {/* Select Button */}
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleSelectModule(mod)}
                                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isSelected
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-[#2563eb] hover:bg-blue-700 text-white'
                                }`}
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Selected Module Summary Pill */}
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563eb]" />
                    <span className="text-slate-700">
                      Active PV Module: <strong className="text-slate-900">{selectedModule.manufacturer} {selectedModule.model} ({selectedModule.power}W)</strong>
                    </span>
                  </div>
                  <span className="font-mono text-blue-800 font-bold">
                    {totalModules.toLocaleString()} modules needed for {project.pvCapacityKwp} kWp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: SCREEN 4 - TÍNH TOÁN - SỤT ÁP & CHỌN DÂY (Cable & Voltage Drop) */}
      {/* ========================================================================= */}
      {subView === 'cable-voltage-drop' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            {/* Header with Export button */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  Cable &amp; Voltage Drop Calculation
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time IEC 60364-5-52 &amp; JIS C 3605 compliance engine with ambient derating
                </p>
              </div>
              <button
                onClick={handleExportCableCalc}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export</span>
              </button>
            </div>

            {/* Sub-tabs: DC Cable (PV), AC Cable (Inverter), AC Cable (Transformer) */}
            <div className="flex items-center space-x-2">
              {[
                { id: 'dc', label: 'DC Cable (PV)' },
                { id: 'ac-inv', label: 'AC Cable (Inverter)' },
                { id: 'ac-trans', label: 'AC Cable (Transformer)' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleCableTabChange(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    cableTab === tab.id
                      ? 'bg-[#2563eb] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* 2-Column Split: Input Parameters (Left) vs Calculation Results & Comparison (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
              {/* Left: Input Parameters (5 cols) */}
              <div className="md:col-span-5 space-y-3.5 pr-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Input Parameters
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Current (A)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={calcCurrent}
                      onChange={e => setCalcCurrent(Math.max(0.1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Length (m)</label>
                    <input
                      type="number"
                      min="1"
                      value={calcLength}
                      onChange={e => setCalcLength(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      System Voltage (V)
                    </label>
                    <input
                      type="number"
                      min="12"
                      value={calcVoltage}
                      onChange={e => setCalcVoltage(Math.max(12, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Installation Method
                    </label>
                    <select
                      value={calcMethod}
                      onChange={e => setCalcMethod(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Cable tray">Cable tray (Perforated)</option>
                      <option value="Conduit in ground">In conduit in ground</option>
                      <option value="Direct buried">Direct buried</option>
                      <option value="Free air">Free air</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Ambient Temperature (°C)
                    </label>
                    <input
                      type="number"
                      value={calcTemp}
                      onChange={e => setCalcTemp(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">
                      Max. Voltage Drop (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={calcMaxDrop}
                      onChange={e => setCalcMaxDrop(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Results & Comparison Table (7 cols) */}
              <div className="md:col-span-7 space-y-4">
                {/* Calculation Results Card (Screen 4) */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Calculation Results</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        cableCalcResult.status === 'OK'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {cableCalcResult.status}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Recommended Cable</div>
                    <div className="text-xl font-black text-slate-900 tracking-tight font-mono">
                      CVT {cableCalcResult.recommendedSizeMm2} mm²
                    </div>
                  </div>

                  {/* 4 Metric Boxes */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400 block">Voltage Drop</span>
                      <span className="font-extrabold text-slate-900 text-sm font-mono">
                        {cableCalcResult.voltageDropPercent}%
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400 block">Voltage Drop (V)</span>
                      <span className="font-extrabold text-slate-900 text-sm font-mono">
                        {cableCalcResult.voltageDropV} V
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400 block">Ampacity</span>
                      <span className="font-extrabold text-slate-900 text-sm font-mono">
                        {cableCalcResult.ampacityA} A
                      </span>
                    </div>

                    <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-center">
                      <span className="text-[11px] text-slate-400 block">Margin</span>
                      <span
                        className={`font-extrabold text-sm font-mono ${
                          cableCalcResult.margin >= 1.25 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {cableCalcResult.margin} ×
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparison Table (Screen 4) */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2.5">
                  <div className="text-xs font-bold text-slate-900">Size Comparison Matrix</div>

                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-medium pb-1.5">
                        <th className="py-1.5">Size</th>
                        <th className="py-1.5">Voltage Drop</th>
                        <th className="py-1.5">Ampacity</th>
                        <th className="py-1.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {cableCalcResult.comparison.map(comp => {
                        const isChosen = comp.sizeMm2 === cableCalcResult.recommendedSizeMm2;
                        return (
                          <tr key={comp.sizeMm2} className={isChosen ? 'bg-blue-50/60 font-bold' : ''}>
                            <td className="py-2 font-medium text-slate-800">{comp.sizeMm2} mm²</td>
                            <td className="py-2 text-slate-600">{comp.voltageDropPercent}%</td>
                            <td className="py-2 text-slate-600">{comp.deratedAmpacityA} A</td>
                            <td className="py-2 text-right">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  comp.status === 'OK'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-700'
                                }`}
                              >
                                {comp.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: SCREEN 5 - BOQ & BÁO GIÁ (Quotation / BOQ) */}
      {/* ========================================================================= */}
      {(subView === 'quotation' || subView === 'boq') && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-4">
            {/* Header with BOQ/Quotation subtabs and Export buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Quotation &amp; BOQ</h2>
                <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                  <button
                    onClick={() => setCommercialTab('boq')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      commercialTab === 'boq'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    BOQ
                  </button>
                  <button
                    onClick={() => setCommercialTab('quotation')}
                    className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                      commercialTab === 'quotation'
                        ? 'bg-[#2563eb] text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    Quotation
                  </button>
                </div>
              </div>

              {/* Export Buttons: Export Excel, Export PDF */}
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={handleExportBoqExcel}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Excel</span>
                </button>
                <button
                  onClick={() => setIsReportOpen(true)}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-rose-600" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>

            {/* Top 2 Cards: Cost Summary (Left) & Cost Breakdown Donut Chart (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Cost Summary (Screen 5) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4 space-y-2.5 text-xs">
                <div className="text-xs font-bold text-slate-900">Cost Summary</div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Material Cost</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ¥ {quotationCosts.materialCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Labor Cost</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ¥ {quotationCosts.laborCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Engineering Cost</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ¥ {quotationCosts.engineeringCost.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Other Cost</span>
                    <span className="font-mono font-semibold text-slate-900">
                      ¥ {quotationCosts.otherCost.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between py-1.5 border-t border-slate-200 font-bold text-slate-900">
                    <span>Subtotal</span>
                    <span className="font-mono">¥ {quotationCosts.subtotal.toLocaleString()}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-600">Margin</span>
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        min="0"
                        max="50"
                        value={marginPercent}
                        onChange={e => setMarginPercent(Math.max(0, Number(e.target.value)))}
                        className="w-14 px-2 py-0.5 rounded border border-slate-300 text-right font-mono"
                      />
                      <span className="text-slate-500 font-mono">%</span>
                    </div>
                  </div>

                  {/* Selling Price Highlighted Box */}
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-between mt-2">
                    <span className="font-bold text-amber-900">Selling Price</span>
                    <span className="text-lg font-black text-amber-600 font-mono">
                      ¥ {sellingPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost Breakdown Donut Chart (Screen 5) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 flex flex-col items-center justify-center space-y-3">
                <div className="w-full text-xs font-bold text-slate-900 text-left">
                  Cost Breakdown
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full py-2">
                  {/* Donut SVG */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                    <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        strokeWidth="5"
                        stroke="#2563eb"
                        strokeDasharray={`${equipmentPercent}, 100`}
                        strokeDashoffset="0"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeWidth="5"
                        stroke="#06b6d4"
                        strokeDasharray={`${laborPercent}, 100`}
                        strokeDashoffset={`-${equipmentPercent}`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeWidth="5"
                        stroke="#f97316"
                        strokeDasharray={`${engineeringPercent}, 100`}
                        strokeDashoffset={`-${equipmentPercent + laborPercent}`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeWidth="5"
                        stroke="#94a3b8"
                        strokeDasharray={`${otherPercent}, 100`}
                        strokeDashoffset={`-${equipmentPercent + laborPercent + engineeringPercent}`}
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute text-center">
                      <span className="text-xs text-slate-400 font-mono block">Subtotal</span>
                      <span className="text-sm font-black text-slate-900 font-mono">
                        ¥ {(quotationCosts.subtotal / 1000000).toFixed(0)}M
                      </span>
                    </div>
                  </div>

                  {/* Donut Legend */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-xs bg-[#2563eb]" />
                      <span className="text-slate-600">Equipment</span>
                      <span className="font-bold text-slate-900 font-mono">{equipmentPercent}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-xs bg-[#06b6d4]" />
                      <span className="text-slate-600">Labor</span>
                      <span className="font-bold text-slate-900 font-mono">{laborPercent}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-xs bg-[#f97316]" />
                      <span className="text-slate-600">Engineering</span>
                      <span className="font-bold text-slate-900 font-mono">{engineeringPercent}%</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-3 h-3 rounded-xs bg-[#94a3b8]" />
                      <span className="text-slate-600">Other</span>
                      <span className="font-bold text-slate-900 font-mono">{otherPercent}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Equipment List (BOQ) Table (Screen 5) */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-900">Equipment List (BOQ)</div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-medium">
                      <th className="py-2.5 px-3 w-10">No.</th>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3">Manufacturer</th>
                      <th className="py-2.5 px-3">Model</th>
                      <th className="py-2.5 px-3 text-right">Quantity</th>
                      <th className="py-2.5 px-3 text-center">Unit</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right font-bold">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {boqItems.map(item => (
                      <tr key={item.no} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-2.5 px-3 text-slate-400">{item.no}</td>
                        <td className="py-2.5 px-3 font-sans font-semibold text-slate-900">{item.item}</td>
                        <td className="py-2.5 px-3 font-sans text-slate-600">{item.manufacturer}</td>
                        <td className="py-2.5 px-3 text-slate-700">{item.model}</td>
                        <td className="py-2.5 px-3 text-right font-semibold text-slate-800">
                          {item.qty}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-500 font-sans">{item.unit}</td>
                        <td className="py-2.5 px-3 text-right text-slate-600">
                          {item.unitPrice}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          {item.total}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: STRING DESIGN (Interactive Engineering Sizing) */}
      {/* ========================================================================= */}
      {subView === 'string-design' && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                PV String Sizing &amp; Inverter MPPT Compatibility Check
              </h2>
              <p className="text-xs text-slate-500">
                JIS C 8955 / IEC 62548 maximum open-circuit voltage at low temperatures and minimum operating MPPT voltage at high temperatures
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Left parameters */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-900 uppercase tracking-wider">String Parameters</h3>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-700 font-semibold">Modules per String</span>
                  <span className="font-mono font-bold text-[#2563eb]">{stringModulesCount} modules</span>
                </div>
                <input
                  type="range"
                  min="14"
                  max="24"
                  value={stringModulesCount}
                  onChange={e => setStringModulesCount(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#2563eb]"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                  <span>Min: 14</span>
                  <span>Max: 24</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Min Winter Temp (°C)</label>
                  <input
                    type="number"
                    value={stringMinTemp}
                    onChange={e => setStringMinTemp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Max Summer Temp (°C)</label>
                  <input
                    type="number"
                    value={stringMaxTemp}
                    onChange={e => setStringMaxTemp(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Selected Module:</span>
                  <span className="font-bold text-slate-800">{selectedModule.model} ({selectedModule.voc}V Voc)</span>
                </div>
                <div className="flex justify-between">
                  <span>Inverter Max DC Voltage:</span>
                  <span className="font-mono text-slate-800">1,100 V</span>
                </div>
                <div className="flex justify-between">
                  <span>Inverter MPPT Range:</span>
                  <span className="font-mono text-slate-800">200 V – 1,000 V</span>
                </div>
              </div>
            </div>

            {/* Right verification results */}
            <div className="space-y-4 p-4 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 uppercase tracking-wider">MPPT Compliance Check</h3>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    stringEvaluation.isCompliant
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {stringEvaluation.isCompliant ? 'VERIFIED COMPLIANT' : 'NON-COMPLIANT'}
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Max Voc @ {stringMinTemp}°C Cold</span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {stringEvaluation.stringVocMax} V
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      stringEvaluation.isVocUnderInverterMax
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {stringEvaluation.isVocUnderInverterMax ? 'PASS (< 1100V)' : 'OVERVOLTAGE'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Min Vmp @ {stringMaxTemp}°C Hot</span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {stringEvaluation.stringVmpMin} V
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      stringEvaluation.isVmpAboveMpptMin
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {stringEvaluation.isVmpAboveMpptMin ? 'PASS (> 200V)' : 'UNDERVOLTAGE'}
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block">Max Vmp @ {stringMinTemp}°C Cold</span>
                    <span className="font-mono text-base font-black text-slate-900">
                      {stringEvaluation.stringVmpMax} V
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      stringEvaluation.isVmpBelowMpptMax
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {stringEvaluation.isVmpBelowMpptMax ? 'PASS (< 1000V)' : 'ABOVE MPPT'}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-slate-700 text-xs">
                Recommended range for {selectedModule.model}: <strong>{stringEvaluation.minAllowedModules} to {stringEvaluation.maxAllowedModules} modules per string</strong>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* BESS STORAGE VIEW (4x Huawei containers) */}
      {/* ========================================================================= */}
      {subView === 'bess-storage' && (
        <BessStorageView
          project={project}
          onUpdateProject={setProject}
          onOpenDatasheetModal={() => {
            setActiveDatasheetEquip({
              manufacturer: 'Huawei',
              model: 'LUNA2000-2.0MWH-2H1',
              category: 'BESS',
              power: 2000,
              capacityKwh: 2032,
              voltage: 1500
            });
            setIsDatasheetOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* INVERTER & PCS SUBSYSTEM VIEW */}
      {/* ========================================================================= */}
      {subView === 'pcs' && (
        <PcsEquipmentView
          project={project}
          onOpenDatasheet={(equip) => {
            setActiveDatasheetEquip(equip);
            setIsDatasheetOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* TRANSFORMER SUBSYSTEM VIEW */}
      {/* ========================================================================= */}
      {subView === 'transformer' && (
        <TransformerGridView
          project={project}
          mode="transformer"
          onOpenDatasheet={(equip) => {
            setActiveDatasheetEquip(equip);
            setIsDatasheetOpen(true);
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* GRID INTERCONNECTION SUBSYSTEM VIEW */}
      {/* ========================================================================= */}
      {subView === 'grid' && (
        <TransformerGridView
          project={project}
          mode="grid"
        />
      )}

      {/* ========================================================================= */}
      {/* SIMULATION & DISPATCH / YIELD VIEW */}
      {/* ========================================================================= */}
      {subView === 'simulation' && (
        <YieldSimulationTab project={project} />
      )}

      {/* ========================================================================= */}
      {/* INTERACTIVE SINGLE LINE DIAGRAM (SLD / SCHEMATIC) */}
      {/* ========================================================================= */}
      {subView === 'schematic' && (
        <SingleLineDiagram
          project={project}
          onExportSvg={() => showToast('Single Line Diagram (SLD) exported successfully as SVG/CAD.')}
        />
      )}

      {/* ========================================================================= */}
      {/* PROTECTION COORDINATION & SIZING VIEW */}
      {/* ========================================================================= */}
      {(subView === 'equipment-sizing' || subView === 'protection') && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {subView === 'protection' ? 'Protection Coordination & Short-Circuit Analysis' : 'Electrical Equipment & Switchgear Sizing'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calculation standard: IEC 60909 (Short-Circuit Currents) &amp; JESC E2001 (High-Voltage Interconnection)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              Pass Coordination Verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">3-Phase Symmetrical Fault (Ik")</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {isBess ? '18.4 kA' : '11.8 kA'}
              </div>
              <p className="text-[11px] text-slate-500">
                At 6.6 kV bus. Breaker rating ({isBess ? '20.0 kA' : '12.5 kA'}) provides safe margin &gt; 8%.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Peak Making Current (Ip)</div>
              <div className="text-2xl font-extrabold text-slate-900 font-mono">
                {isBess ? '46.9 kA' : '30.1 kA'}
              </div>
              <p className="text-[11px] text-slate-500">
                &kappa; = 1.8 factor based on system X/R ratio of 14.2 at substation point.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900">Clearing Time Coordination</div>
              <div className="text-2xl font-extrabold text-emerald-600 font-mono">
                &Delta;t = 0.25 s
              </div>
              <p className="text-[11px] text-slate-500">
                Main VCB trips in 0.15s, upstream TEPCO utility recloser backup set to 0.40s.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROJECT DOCUMENTS & CAD / PDF FILES */}
      {/* ========================================================================= */}
      {(subView === 'files' || subView === 'reports') && (
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2563eb] flex items-center justify-center">
                <FileText className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Engineering Deliverables &amp; Design Package
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Export complete engineering package including single line diagrams, bill of materials, and reports
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsReportOpen(true)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-[#2563eb] text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Generate Full Engineering Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/30 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Single Line Diagram</span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">DXF / SVG</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                High-resolution vector schematic with standard electrical symbology.
              </p>
              <button
                onClick={() => onSelectSubView?.('schematic')}
                className="text-[#2563eb] font-semibold text-xs flex items-center space-x-1 pt-1"
              >
                <span>View Schematic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/30 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Cable Schedule</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">XLSX</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Full sizing schedule with voltage drop and current carrying capacity.
              </p>
              <button
                onClick={handleExportCableCalc}
                className="text-emerald-700 font-semibold text-xs flex items-center space-x-1 pt-1"
              >
                <span>Download Schedule</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/30 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Bill of Quantities</span>
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">CSV</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Itemized procurement equipment &amp; EPC balance of plant costs.
              </p>
              <button
                onClick={handleExportBoqExcel}
                className="text-amber-800 font-semibold text-xs flex items-center space-x-1 pt-1"
              >
                <span>Export BOQ CSV</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-blue-300 bg-slate-50/50 hover:bg-blue-50/30 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Yield &amp; Dispatch Simulation</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-mono">PDF</span>
              </div>
              <p className="text-slate-500 text-[11px]">
                Comprehensive 12-month generation forecast &amp; 25-year degradation curve.
              </p>
              <button
                onClick={() => onSelectSubView?.('simulation')}
                className="text-indigo-700 font-semibold text-xs flex items-center space-x-1 pt-1"
              >
                <span>View Simulation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROJECT SETTINGS & PARAMETERS (Screen subView: 'project-settings') */}
      {/* ========================================================================= */}
      {subView === 'project-settings' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Settings className="w-5 h-5 stroke-[2]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Project Technical Settings &amp; Grid Parameters
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cấu hình thông số kỹ thuật dự án: đấu nối lưới điện lực Nhật Bản, hệ số an toàn và tỷ lệ DC/AC.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditProjectOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center space-x-1.5 shadow-2xs"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa Thuộc tính Dự án</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Đơn vị Điện lực Đấu nối</span>
              <div className="text-sm font-bold text-slate-900">TEPCO Power Grid (東京電力)</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Đấu nối trung thế 6.6kV tại trạm ngắt liên lạc Chiba. Tần số 50Hz tiêu chuẩn miền Đông Nhật Bản.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tỷ lệ Quá tải DC/AC (Overpaneling)</span>
              <div className="text-sm font-bold text-slate-900 font-mono">
                {project.dcAcRatio ? `${project.dcAcRatio.toFixed(2)}x` : '1.20x'} (500 kWp / 400 kW)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tối ưu hóa sản lượng điện phát vào giờ sáng sớm và chiều tà, hạn chế clipping biến tần dưới 1.5%.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tiêu chuẩn An toàn &amp; Bảo vệ</span>
              <div className="text-sm font-bold text-slate-900">JIS C 8955 &amp; METI Guideline</div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Rơ le bảo vệ quá dòng (OCR), rơ le điện áp (OVR/UVR), rơ le tần số (OFR/UFR) và bảo vệ chống đảo lưới.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/30 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center space-x-2 text-xs text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Dự án đang sử dụng thư viện cáp Kyokuto và ống luồn ISIJP đồng bộ toàn hệ thống.</span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              {saving ? 'Đang lưu...' : 'Lưu Xác nhận Cấu hình'}
            </button>
          </div>
        </div>
      )}

      {/* Datasheet Modal */}
      <DatasheetModal
        isOpen={isDatasheetOpen}
        onClose={() => setIsDatasheetOpen(false)}
        equipment={activeDatasheetEquip || selectedModule}
      />

      {/* Engineering Report Modal */}
      <EngineeringReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        project={{
          name: project.name,
          type: project.type,
          capacityDisplay: project.capacityDisplay,
          voltageDisplay: project.voltageDisplay,
          location: project.location,
          pvCapacityKwp: project.pvCapacityKwp,
          acCapacityKw: project.acCapacityKw,
          dcAcRatio: project.dcAcRatio,
          pvModule: {
            manufacturer: selectedModule.manufacturer,
            model: selectedModule.model,
            power: selectedModule.power,
            qty: totalModules
          },
          inverter: {
            manufacturer: 'Huawei',
            model: 'SUN2000-50KTL',
            power: 50,
            qty: 20
          },
          transformer: {
            manufacturer: 'Hitachi Energy',
            rating: '1000 kVA',
            voltage: '6.6 kV / 400 V'
          },
          cable: {
            size: `CVT ${cableCalcResult.recommendedSizeMm2} mm²`,
            voltageDropPercent: cableCalcResult.voltageDropPercent
          },
          quotation: {
            sellingPrice,
            subtotal: quotationCosts.subtotal,
            marginPercentage: marginPercent
          }
        }}
      />

      {/* Edit Project Properties Modal */}
      <EditProjectModal
        isOpen={isEditProjectOpen}
        onClose={() => setIsEditProjectOpen(false)}
        project={project}
        onSave={updated => {
          setProject(updated);
          showToast('Project specifications updated.');
        }}
      />
    </div>
  );
};
