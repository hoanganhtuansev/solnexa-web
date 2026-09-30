import React, { useState } from 'react';
import { X, Save, Building, MapPin, Zap } from 'lucide-react';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    id: string;
    name: string;
    type: string;
    capacityDisplay: string;
    voltageDisplay: string;
    location: string;
    pvCapacityKwp?: number;
    acCapacityKw?: number;
    notes?: string[];
  };
  onSave: (updated: any) => void;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  onSave
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(project.name);
  const [location, setLocation] = useState(project.location);
  const [pvCapacityKwp, setPvCapacityKwp] = useState(project.pvCapacityKwp || 1200);
  const [acCapacityKw, setAcCapacityKw] = useState(project.acCapacityKw || 1000);
  const [voltageDisplay, setVoltageDisplay] = useState(project.voltageDisplay);
  const [notesStr, setNotesStr] = useState(
    project.notes ? project.notes.join('\n') : '1. Check roof load capacity\n2. Confirm grid connection point\n3. Consider BESS for self-consumption (future)'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...project,
      name,
      location,
      pvCapacityKwp: Number(pvCapacityKwp),
      acCapacityKw: Number(acCapacityKw),
      capacityDisplay: `${(Number(pvCapacityKwp) / 1000).toFixed(1)} MWp`,
      voltageDisplay,
      notes: notesStr.split('\n').filter(Boolean)
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Building className="w-4 h-4 text-[#2563eb]" />
            <h3 className="font-bold text-slate-900 text-sm">Edit Project Specifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
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
              <label className="block text-slate-700 font-semibold mb-1">PV Capacity (kWp)</label>
              <input
                type="number"
                value={pvCapacityKwp}
                onChange={e => setPvCapacityKwp(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">AC Capacity (kW)</label>
              <input
                type="number"
                value={acCapacityKw}
                onChange={e => setAcCapacityKw(Number(e.target.value))}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Grid Voltage</label>
              <input
                type="text"
                value={voltageDisplay}
                onChange={e => setVoltageDisplay(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500"
              />
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

          <div>
            <label className="block text-slate-700 font-semibold mb-1">Engineering Notes (1 per line)</label>
            <textarea
              rows={3}
              value={notesStr}
              onChange={e => setNotesStr(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-900 focus:outline-none focus:border-blue-500 font-mono text-[11px]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#2563eb] hover:bg-blue-700 text-white font-semibold transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
