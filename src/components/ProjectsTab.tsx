import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Grid,
  List as ListIcon,
  Sun,
  BatteryCharging,
  MapPin,
  Calendar,
  ArrowRight,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  X,
  Copy
} from 'lucide-react';
import { Project } from '../types';
import { APP_IMAGES } from '../assets/images';

interface ProjectsTabProps {
  onOpenProject: (projectId: string) => void;
  onNewProjectModal?: boolean;
}

export const ProjectsTab: React.FC<ProjectsTabProps> = ({
  onOpenProject
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New Project Form State
  const [newType, setNewType] = useState<'SOLAR_PV' | 'BESS'>('SOLAR_PV');
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newCapacity, setNewCapacity] = useState('1200');
  const [newVoltage, setNewVoltage] = useState('6.6 kV / 400 V');
  const [newStandard, setNewStandard] = useState<'JIS' | 'IEC'>('JIS');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const capacityNum = parseFloat(newCapacity) || 1000;
    const projectPayload: Partial<Project> = {
      name: newName.trim(),
      type: newType,
      status: 'IN_DESIGN',
      location: newLocation.trim() || 'Japan',
      voltageDisplay: newVoltage,
      capacityDisplay: newType === 'SOLAR_PV' ? `${(capacityNum / 1000).toFixed(2)} MWp` : `${(capacityNum / 1000).toFixed(1)} MW / ${(capacityNum * 2 / 1000).toFixed(1)} MWh`,
      completionPercent: 20,
      designStandard: newStandard,
      totalPvCapacityKwp: newType === 'SOLAR_PV' ? capacityNum : undefined,
      totalAcCapacityKw: newType === 'SOLAR_PV' ? Math.round(capacityNum * 0.85) : capacityNum,
      storagePowerMw: newType === 'BESS' ? capacityNum / 1000 : undefined,
      storageCapacityMwh: newType === 'BESS' ? (capacityNum * 2) / 1000 : undefined,
      estimatedCostJpy: newType === 'SOLAR_PV' ? capacityNum * 110000 : capacityNum * 220000
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload)
      });
      if (res.ok) {
        const savedProject = await res.json();
        setIsCreateModalOpen(false);
        // Reset form
        setNewName('');
        setNewLocation('');
        await fetchProjects();
        // Immediately open the newly created project in the workspace
        onOpenProject(savedProject.id);
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleCloneProject = async (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const clonedPayload: Partial<Project> = {
      ...proj,
      id: `proj-${Date.now()}`,
      name: `${proj.name} (Copy)`,
      status: 'IN_DESIGN',
      completionPercent: Math.max(15, proj.completionPercent - 10)
    };

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clonedPayload)
      });
      if (res.ok) {
        const saved = await res.json();
        setProjects(prev => [saved, ...prev]);
        onOpenProject(saved.id);
      }
    } catch (err) {
      console.error('Failed to clone project:', err);
    }
  };

  // Filter projects
  const filteredProjects = projects.filter(p => {
    // Filter pill logic
    if (activeFilter === 'SOLAR_PV' && p.type !== 'SOLAR_PV') return false;
    if (activeFilter === 'BESS' && p.type !== 'BESS') return false;
    if (activeFilter === 'IN_DESIGN' && p.status !== 'IN_DESIGN') return false;
    if (activeFilter === 'PRELIMINARY' && p.status !== 'PRELIMINARY') return false;
    if (activeFilter === 'QUOTATION' && p.status !== 'QUOTATION') return false;
    if (activeFilter === 'COMPLETED' && p.status !== 'COMPLETED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchLoc = p.location.toLowerCase().includes(q);
        const matchNotes = (p.notes?.join(' ') || '').toLowerCase().includes(q);
        return matchName || matchLoc || matchNotes;
      }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'IN_DESIGN':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5" />
            In Design
          </span>
        );
      case 'PRELIMINARY':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Preliminary
          </span>
        );
      case 'QUOTATION':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            Quotation
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & New Project CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Project Portfolio</h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Manage Solar PV and BESS engineering designs, calculation baselines, and commercial deliverables.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-all shrink-0 cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Ribbon & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs space-y-3.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by project name, location, or equipment..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800 placeholder:text-slate-400 bg-slate-50/50 focus:bg-white transition-colors"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1.5 self-end md:self-auto bg-slate-100/80 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: 'ALL', label: `All (${projects.length})` },
            { id: 'SOLAR_PV', label: `Solar PV (${projects.filter(p => p.type === 'SOLAR_PV').length})` },
            { id: 'BESS', label: `BESS (${projects.filter(p => p.type === 'BESS').length})` },
            { id: 'IN_DESIGN', label: `In Design (${projects.filter(p => p.status === 'IN_DESIGN').length})` },
            { id: 'PRELIMINARY', label: `Preliminary (${projects.filter(p => p.status === 'PRELIMINARY').length})` },
            { id: 'QUOTATION', label: `Quotation (${projects.filter(p => p.status === 'QUOTATION').length})` },
            { id: 'COMPLETED', label: `Completed (${projects.filter(p => p.status === 'COMPLETED').length})` }
          ].map(filterItem => (
            <button
              key={filterItem.id}
              onClick={() => setActiveFilter(filterItem.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === filterItem.id
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {filterItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map(proj => (
            <div
              key={proj.id}
              onClick={() => onOpenProject(proj.id)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-400 transition-all overflow-hidden cursor-pointer flex flex-col justify-between group"
            >
              {/* Card Image Banner */}
              <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                <img
                  src={proj.type === 'BESS' ? APP_IMAGES.bessContainer : APP_IMAGES.solarFacility}
                  alt={proj.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-black/20" />
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center space-x-1 ${
                    proj.type === 'SOLAR_PV'
                      ? 'bg-amber-400 text-slate-950 shadow-2xs'
                      : 'bg-blue-600 text-white shadow-2xs'
                  }`}>
                    {proj.type === 'SOLAR_PV' ? (
                      <>
                        <Sun className="w-3 h-3" />
                        <span>Solar PV</span>
                      </>
                    ) : (
                      <>
                        <BatteryCharging className="w-3 h-3" />
                        <span>BESS</span>
                      </>
                    )}
                  </span>
                  <span className="text-[10px]">{getStatusBadge(proj.status)}</span>
                </div>
                <div className="absolute bottom-2 left-3 right-3 flex items-baseline justify-between text-white">
                  <span className="font-semibold text-xs truncate max-w-[65%] drop-shadow-xs">{proj.location}</span>
                  <span className="font-mono text-xs font-bold text-blue-200">{proj.capacityDisplay}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                    {proj.name}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs border border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Grid Voltage</span>
                      <span className="font-semibold text-slate-800 truncate block">{proj.voltageDisplay || '6.6 kV'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Standard</span>
                      <span className="font-semibold text-slate-800">{proj.designStandard || 'JIS C 8955'}</span>
                    </div>
                  </div>

                  {proj.notes && proj.notes.length > 0 && (
                    <p className="text-xs text-slate-600 line-clamp-1 bg-blue-50/50 p-2 rounded-lg border border-blue-100/60 font-mono text-[11px]">
                      {proj.notes[0]}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Design Progress</span>
                    <span className="font-bold text-blue-600">{proj.completionPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all"
                      style={{ width: `${proj.completionPercent}%` }}
                    />
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs font-mono font-semibold text-slate-600">
                      {proj.estimatedCostJpy ? `¥ ${proj.estimatedCostJpy.toLocaleString('ja-JP')}` : 'Estimating...'}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={(e) => handleCloneProject(proj, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Duplicate / Clone Project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteProject(proj.id, e)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700 flex items-center space-x-0.5 pl-1">
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 text-slate-500 text-xs font-semibold border-b border-slate-200/80 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3">Project Name</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Progress</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map(proj => (
                  <tr
                    key={proj.id}
                    onClick={() => onOpenProject(proj.id)}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      {proj.name}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        proj.type === 'SOLAR_PV' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        {proj.type === 'SOLAR_PV' ? 'Solar PV' : 'BESS'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-800">
                      {proj.capacityDisplay}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {proj.location}
                    </td>
                    <td className="px-4 py-3.5">
                      {getStatusBadge(proj.status)}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-700">
                      {proj.completionPercent}%
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">
                      {proj.estimatedCostJpy ? `¥ ${proj.estimatedCostJpy.toLocaleString('ja-JP')}` : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleCloneProject(proj, e)}
                          className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 transition-colors"
                          title="Clone Project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition-colors"
                          title="Delete Project"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                  <Plus className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">Create New Engineering Project</h2>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 pt-4">
              {/* Type Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Project Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewType('SOLAR_PV')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                      newType === 'SOLAR_PV'
                        ? 'border-blue-600 bg-blue-50/70 text-slate-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Sun className={`w-5 h-5 ${newType === 'SOLAR_PV' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs block">Solar PV Project</span>
                      <span className="text-[10px] text-slate-500">Rooftop &amp; Ground mount</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewType('BESS')}
                    className={`p-3 rounded-xl border text-left flex items-center space-x-2.5 transition-all cursor-pointer ${
                      newType === 'BESS'
                        ? 'border-blue-600 bg-blue-50/70 text-slate-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <BatteryCharging className={`w-5 h-5 ${newType === 'BESS' ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div>
                      <span className="font-bold text-xs block">BESS Project</span>
                      <span className="text-[10px] text-slate-500">Commercial &amp; Grid-scale</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g., Aichi Distribution Center Solar PV"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Location
                </label>
                <input
                  type="text"
                  value={newLocation}
                  onChange={e => setNewLocation(e.target.value)}
                  placeholder="e.g., Nagoya, Aichi Prefecture, Japan"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Grid & Capacity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {newType === 'SOLAR_PV' ? 'Capacity (kWp)' : 'Power (kW)'}
                  </label>
                  <input
                    type="number"
                    value={newCapacity}
                    onChange={e => setNewCapacity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Design Standard
                  </label>
                  <select
                    value={newStandard}
                    onChange={e => setNewStandard(e.target.value as 'JIS' | 'IEC')}
                    className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  >
                    <option value="JIS">JIS (Japan Industrial Standard)</option>
                    <option value="IEC">IEC 60364 International</option>
                  </select>
                </div>
              </div>

              {/* Grid Voltage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grid Interconnection Voltage
                </label>
                <input
                  type="text"
                  value={newVoltage}
                  onChange={e => setNewVoltage(e.target.value)}
                  placeholder="e.g., 6.6 kV / 400 V or 200 V Low Voltage"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="pt-4 flex items-center justify-end space-x-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-semibold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-2xs transition-colors cursor-pointer active:scale-98"
                >
                  Create &amp; Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
