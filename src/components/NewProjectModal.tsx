import React, { useState } from 'react';
import { X, Sun, BatteryCharging, ArrowRight, Building, MapPin, Zap } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType: 'SOLAR_PV' | 'BESS';
  onCreateProject: (projectData: any) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  defaultType,
  onCreateProject
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<'SOLAR_PV' | 'BESS'>(defaultType);
  const [name, setName] = useState(type === 'SOLAR_PV' ? 'Kobe Logistics Solar' : 'Yokohama Port BESS');
  const [location, setLocation] = useState('Hyogo, Japan');
  const [capacityMw, setCapacityMw] = useState<number>(type === 'SOLAR_PV' ? 1.5 : 2.0);
  const [storageMwh, setStorageMwh] = useState<number>(4.0);
  const [gridVoltage, setGridVoltage] = useState('6.6 kV');
  const [standard, setStandard] = useState<'JIS' | 'IEC'>('JIS');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `proj-${Date.now().toString(36)}`;
    const newProject = {
      id: newId,
      name,
      type,
      location,
      status: 'IN_DESIGN',
      designStandard: standard,
      capacityDisplay: type === 'SOLAR_PV' ? `${capacityMw} MWp` : `${capacityMw} MW / ${storageMwh} MWh`,
      voltageDisplay: gridVoltage,
      pvCapacityKwp: type === 'SOLAR_PV' ? capacityMw * 1000 : 0,
      acCapacityKw: capacityMw * 1000 * 0.85,
      dcAcRatio: 1.25,
      completionPercent: 15,
      estimatedCostJpy: type === 'SOLAR_PV' ? capacityMw * 100000000 : capacityMw * 140000000,
      notes: [
        '1. Preliminary grid connection inquiry submitted',
        '2. Topography and structural load verification required'
      ]
    };
    onCreateProject(newProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              type === 'SOLAR_PV' ? 'bg-blue-50 text-[#2563eb]' : 'bg-orange-50 text-[#ea580c]'
            }`}>
              {type === 'SOLAR_PV' ? <Sun className="w-4 h-4" /> : <BatteryCharging className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Create {type === 'SOLAR_PV' ? 'Solar PV' : 'BESS'} Project
              </h3>
              <p className="text-xs text-slate-500">Initialize design parameters and electrical sizing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('SOLAR_PV');
                setName('Kobe Logistics Solar');
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all ${
                type === 'SOLAR_PV' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-blue-600" />
              <span>Solar PV</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType('BESS');
                setName('Yokohama Port BESS');
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center space-x-1.5 transition-all ${
                type === 'BESS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BatteryCharging className="w-3.5 h-3.5 text-orange-600" />
              <span>BESS Storage</span>
            </button>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                {type === 'SOLAR_PV' ? 'PV Capacity (MWp)' : 'Power Rating (MW)'}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={capacityMw}
                onChange={e => setCapacityMw(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            {type === 'BESS' ? (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Storage Capacity (MWh)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={storageMwh}
                  onChange={e => setStorageMwh(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Design Standard</label>
                <select
                  value={standard}
                  onChange={e => setStandard(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                >
                  <option value="JIS">JIS (Japan)</option>
                  <option value="IEC">IEC (International)</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Interconnection Voltage</label>
              <select
                value={gridVoltage}
                onChange={e => setGridVoltage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 bg-white focus:outline-none focus:border-blue-500"
              >
                <option value="400 V / 6.6 kV">400 V / 6.6 kV (Medium Voltage)</option>
                <option value="6.6 kV">6.6 kV (TEPCO / Kansai)</option>
                <option value="22 kV">22 kV (High Voltage)</option>
                <option value="66 kV">66 kV (Extra High Voltage)</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Location</label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <span>Create Project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
