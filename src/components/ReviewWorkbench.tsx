import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  AlertTriangle,
  Plus,
  ArrowRight,
  Database,
  FileText,
  Search,
  CheckCheck,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Save,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  EquipmentModel,
  EquipmentSpecification,
  ReviewStatus,
  EquipmentCategoryCode
} from '../types';

interface ReviewWorkbenchProps {
  initialModelId?: string;
  onCommittedToLibrary: (modelId: string) => void;
}

export const ReviewWorkbench: React.FC<ReviewWorkbenchProps> = ({
  initialModelId,
  onCommittedToLibrary
}) => {
  const [pendingModels, setPendingModels] = useState<EquipmentModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId || '');
  const [currentModel, setCurrentModel] = useState<EquipmentModel | null>(null);
  const [specifications, setSpecifications] = useState<EquipmentSpecification[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);

  // Edit Modal State
  const [editingSpec, setEditingSpec] = useState<EquipmentSpecification | null>(null);
  const [editVal, setEditVal] = useState<string>('');
  const [editUnit, setEditUnit] = useState<string>('');
  const [editDisplayName, setEditDisplayName] = useState<string>('');

  // Add Specification Form State
  const [isAddingSpec, setIsAddingSpec] = useState(false);
  const [newParamName, setNewParamName] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRawVal, setNewRawVal] = useState('');
  const [newRawUnit, setNewRawUnit] = useState('');
  const [newPageNum, setNewPageNum] = useState(1);

  // Load Pending Models
  const fetchPending = async () => {
    try {
      const res = await fetch('/api/equipment?reviewStatus=PENDING');
      if (res.ok) {
        const data: EquipmentModel[] = await res.json();
        setPendingModels(data);
        if (data.length > 0 && !selectedModelId) {
          setSelectedModelId(data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load pending models:', err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  // When selectedModelId changes or initialModelId changes
  useEffect(() => {
    if (initialModelId) {
      setSelectedModelId(initialModelId);
    }
  }, [initialModelId]);

  useEffect(() => {
    if (!selectedModelId) return;

    setLoading(true);
    fetch(`/api/equipment/${selectedModelId}`)
      .then(res => res.json())
      .then(data => {
        setCurrentModel(data.equipment);
        setSpecifications(data.specifications || []);
        if (data.specifications && data.specifications.length > 0) {
          setSelectedSpecId(data.specifications[0].id);
        }
      })
      .catch(err => console.error('Failed to load model details:', err))
      .finally(() => setLoading(false));
  }, [selectedModelId]);

  const handleApproveSpec = async (specId: string) => {
    try {
      const res = await fetch(`/api/specifications/${specId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus: 'APPROVED' })
      });
      if (res.ok) {
        setSpecifications(prev =>
          prev.map(s => (s.id === specId ? { ...s, reviewStatus: 'APPROVED' as ReviewStatus } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectSpec = async (specId: string) => {
    try {
      const res = await fetch(`/api/specifications/${specId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewStatus: 'REJECTED' })
      });
      if (res.ok) {
        setSpecifications(prev =>
          prev.map(s => (s.id === specId ? { ...s, reviewStatus: 'REJECTED' as ReviewStatus } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingSpec) return;
    try {
      const res = await fetch(`/api/specifications/${editingSpec.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: editDisplayName,
          rawValue: editVal,
          rawUnit: editUnit,
          reviewStatus: 'APPROVED'
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setSpecifications(prev => prev.map(s => (s.id === editingSpec.id ? updated : s)));
        setEditingSpec(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSpecification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentModel) return;

    try {
      const res = await fetch(`/api/equipment/${currentModel.id}/specifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parameterName: newParamName,
          displayName: newDisplayName || newParamName,
          rawValue: newRawVal,
          rawUnit: newRawUnit,
          sourcePage: newPageNum,
          extractionMethod: 'MANUAL_ENTRY',
          confidence: 1.0,
          reviewStatus: 'APPROVED'
        })
      });

      if (res.ok) {
        const created = await res.json();
        setSpecifications(prev => [...prev, created]);
        setIsAddingSpec(false);
        setNewParamName('');
        setNewDisplayName('');
        setNewRawVal('');
        setNewRawUnit('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCommitAll = async () => {
    if (!selectedModelId) return;

    try {
      const res = await fetch(`/api/equipment/${selectedModelId}/commit`, {
        method: 'POST'
      });

      if (res.ok) {
        onCommittedToLibrary(selectedModelId);
      }
    } catch (e) {
      console.error('Commit failed:', e);
    }
  };

  const selectedSpec = specifications.find(s => s.id === selectedSpecId);
  const pendingCount = specifications.filter(s => s.reviewStatus === 'PENDING').length;
  const approvedCount = specifications.filter(s => s.reviewStatus === 'APPROVED').length;
  const rejectedCount = specifications.filter(s => s.reviewStatus === 'REJECTED').length;
  const conflictCount = specifications.filter(s => s.hasConflict).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Pending Models Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Datasheet Verification Queue</h2>
            <p className="text-[11px] text-slate-500">
              {pendingModels.length} datasheets pending engineer verification &amp; approval
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-500 font-medium">Select Model:</label>
          <select
            id="pending-models-select"
            value={selectedModelId}
            onChange={e => setSelectedModelId(e.target.value)}
            className="bg-white text-slate-900 text-xs border border-slate-200 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
          >
            {pendingModels.map(m => (
              <option key={m.id} value={m.id}>
                {m.manufacturerName} — {m.modelName} ({m.categoryCode})
              </option>
            ))}
            {pendingModels.length === 0 && (
              <option value="">No pending models in verification queue</option>
            )}
          </select>
        </div>
      </div>

      {!currentModel ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 p-8 shadow-2xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Queue is Clear</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            All ingested equipment models have been approved and committed to the Equipment Library.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Card: Equipment Identity & Commit Control */}
          <div className="liquid-glass-panel rounded-3xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 font-mono text-[10px] font-bold border border-amber-200">
                    STATUS: PENDING VERIFICATION
                  </span>
                  <span className="text-xs text-slate-500 font-mono truncate max-w-xs">
                    Datasheet: {currentModel.datasheetFilename}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                  {currentModel.manufacturerName} {currentModel.modelName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  Danh mục: <span className="text-slate-800 font-bold">{currentModel.categoryCode}</span> • Bản sửa đổi: v{currentModel.revision || 1}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2.5">
                <button
                  id="add-spec-modal-btn"
                  onClick={() => setIsAddingSpec(true)}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>Thêm thông số</span>
                </button>

                <button
                  id="commit-to-db-btn"
                  onClick={handleCommitAll}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Database className="w-4 h-4" />
                  <span>Phê duyệt & Lưu vào CSDL</span>
                </button>
              </div>
            </div>

            {/* Metrics Breakdown Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              <div className="p-3 bg-white/70 border border-slate-200/80 rounded-2xl">
                <span className="text-[10px] font-mono uppercase text-slate-500">Tổng trích xuất</span>
                <p className="text-base font-black text-slate-900 mt-0.5 font-mono">{specifications.length}</p>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
                <span className="text-[10px] font-mono uppercase text-emerald-700 font-bold">Đã duyệt</span>
                <p className="text-base font-black text-emerald-700 mt-0.5 font-mono">{approvedCount}</p>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                <span className="text-[10px] font-mono uppercase text-amber-700 font-bold">Chờ kiểm tra</span>
                <p className="text-base font-black text-amber-700 mt-0.5 font-mono">{pendingCount}</p>
              </div>
              <div className="p-3 bg-rose-50/60 border border-rose-200/80 rounded-2xl">
                <span className="text-[10px] font-mono uppercase text-rose-700 font-bold">Bất đồng / Xung đột</span>
                <p className="text-base font-black text-rose-700 mt-0.5 font-mono">{conflictCount}</p>
              </div>
            </div>
          </div>

          {/* Workbench Grid: Left Specs Table + Right Traceability Inspector */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Specifications Table */}
            <div className="lg:col-span-2 liquid-glass-panel rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200/80 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                    Danh sách thông số ({specifications.length})
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Bấm vào từng hàng để kiểm tra trang tài liệu PDF nguồn và độ tin cậy
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/90 text-slate-600 text-[10px] uppercase font-mono tracking-wider sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-3.5">Trạng thái</th>
                      <th className="py-3 px-3.5">Tên thông số</th>
                      <th className="py-3 px-3.5">Giá trị gốc</th>
                      <th className="py-3 px-3.5">Chuẩn hóa (SI)</th>
                      <th className="py-3 px-3.5">Độ tin cậy</th>
                      <th className="py-3 px-3.5">Trang</th>
                      <th className="py-3 px-3.5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white/60">
                    {specifications.map(spec => {
                      const isSelected = selectedSpecId === spec.id;
                      return (
                        <tr
                          key={spec.id}
                          onClick={() => setSelectedSpecId(spec.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-50/80 border-l-4 border-amber-500'
                              : 'hover:bg-slate-50/70'
                          }`}
                        >
                          <td className="py-3 px-3.5">
                            {spec.hasConflict ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                Conflict
                              </span>
                            ) : spec.reviewStatus === 'APPROVED' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Approved
                              </span>
                            ) : spec.reviewStatus === 'REJECTED' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                Rejected
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-3.5">
                            <p className="font-bold text-slate-900">{spec.displayName}</p>
                            <p className="text-[10px] font-mono text-slate-500">{spec.parameterName}</p>
                          </td>

                          <td className="py-3 px-3.5 font-mono text-slate-700 max-w-[140px] truncate">
                            {spec.rawValue}
                          </td>

                          <td className="py-3 px-3.5 font-mono font-bold text-amber-700">
                            {String(spec.normalizedValue)} {spec.normalizedUnit}
                          </td>

                          <td className="py-3 px-3.5 font-mono text-[11px]">
                            <span
                              className={
                                spec.confidence >= 0.9
                                  ? 'text-emerald-700 font-bold'
                                  : spec.confidence >= 0.75
                                  ? 'text-amber-700 font-bold'
                                  : 'text-rose-700 font-bold'
                              }
                            >
                              {Math.round(spec.confidence * 100)}%
                            </span>
                          </td>

                          <td className="py-3 px-3.5 font-mono text-[10px] text-slate-500">
                            Trang {spec.sourcePage}
                          </td>

                          <td className="py-3 px-3.5 text-right">
                            <div className="flex items-center justify-end space-x-1" onClick={e => e.stopPropagation()}>
                              <button
                                title="Phê duyệt thông số"
                                onClick={() => handleApproveSpec(spec.id)}
                                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                                  spec.reviewStatus === 'APPROVED' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-emerald-600'
                                }`}
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <button
                                title="Chỉnh sửa thông số"
                                onClick={() => {
                                  setEditingSpec(spec);
                                  setEditDisplayName(spec.displayName);
                                  setEditVal(spec.rawValue);
                                  setEditUnit(spec.rawUnit || '');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-slate-100 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                title="Từ chối thông số"
                                onClick={() => handleRejectSpec(spec.id)}
                                className={`p-1.5 rounded-lg hover:bg-slate-100 transition-colors ${
                                  spec.reviewStatus === 'REJECTED' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-rose-600'
                                }`}
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Col: Source Traceability & Document Reference Panel */}
            <div className="liquid-glass-panel rounded-3xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 pb-3 border-b border-slate-200/80">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase font-mono tracking-wider">
                    Đối chiếu nguồn tài liệu
                  </h3>
                </div>

                {selectedSpec ? (
                  <div className="mt-4 space-y-4 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Thông số đang chọn</span>
                      <h4 className="text-sm font-black text-slate-900 mt-0.5">{selectedSpec.displayName}</h4>
                      <p className="text-[11px] font-mono text-slate-500 mt-0.5">mã: {selectedSpec.parameterName}</p>
                    </div>

                    <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-2xl space-y-2">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Phương thức đọc:</span>
                        <span className="text-slate-900 font-mono font-semibold">{selectedSpec.extractionMethod}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Tệp nguồn:</span>
                        <span className="text-slate-800 font-mono truncate max-w-[160px]" title={selectedSpec.sourceDocument}>
                          {selectedSpec.sourceDocument}
                        </span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Trang PDF:</span>
                        <span className="text-amber-700 font-mono font-bold">Trang {selectedSpec.sourcePage}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Độ tin cậy:</span>
                        <span className="text-emerald-700 font-mono font-bold">
                          {Math.round(selectedSpec.confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Conflict Alert Box */}
                    {selectedSpec.hasConflict && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800">
                        <div className="flex items-center space-x-1.5 font-bold text-rose-800 text-xs">
                          <AlertTriangle className="w-4 h-4 text-rose-600" />
                          <span>Phát hiện bất đồng</span>
                        </div>
                        <p className="text-[11px] text-rose-700 mt-1">{selectedSpec.notes}</p>
                        {selectedSpec.alternativeValues && selectedSpec.alternativeValues.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className="text-[10px] uppercase font-mono text-slate-500">Giá trị thay thế:</span>
                            {selectedSpec.alternativeValues.map((alt, i) => (
                              <div key={i} className="flex justify-between text-[11px] font-mono bg-white p-1.5 rounded-lg border border-rose-200">
                                <span>{alt.value} {alt.unit} ({alt.method})</span>
                                <button
                                  onClick={() => {
                                    setEditingSpec(selectedSpec);
                                    setEditDisplayName(selectedSpec.displayName);
                                    setEditVal(alt.value);
                                    setEditUnit(alt.unit);
                                  }}
                                  className="text-amber-700 font-bold hover:underline text-[10px]"
                                >
                                  Dùng giá trị này
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Normalized vs Raw Comparison */}
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Chuẩn hóa đơn vị đo</span>
                      <div className="grid grid-cols-2 gap-2 text-center font-mono">
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-500">Văn bản gốc</span>
                          <p className="text-xs text-slate-900 font-bold mt-0.5 truncate">{selectedSpec.rawValue}</p>
                        </div>
                        <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                          <span className="text-[10px] text-amber-800">Chuẩn hóa SI</span>
                          <p className="text-xs text-amber-800 font-bold mt-0.5 truncate">
                            {String(selectedSpec.normalizedValue)} {selectedSpec.normalizedUnit}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 text-xs mt-4 italic">
                    Bấm chọn một thông số để xem chi tiết đối chiếu trang PDF nguồn.
                  </p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-200/80">
                <div className="p-3 bg-sky-50/80 rounded-2xl text-[11px] text-sky-900 font-mono border border-sky-100">
                  <div className="flex items-center space-x-1.5 font-bold mb-1">
                    <Shield className="w-3.5 h-3.5 text-sky-600" />
                    <span>Quy tắc bảo mật kỹ thuật</span>
                  </div>
                  <span>Chỉ các thông số đã được Kỹ sư xác nhận mới được phép nạp vào các mô-đun tính toán điện IEC.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Parameter Modal */}
      {editingSpec && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="liquid-glass-panel rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Chỉnh sửa thông số kỹ thuật</h3>
            <p className="text-xs text-slate-500">
              Thông số: <span className="font-mono text-amber-700 font-bold">{editingSpec.parameterName}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={e => setEditDisplayName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Giá trị gốc</label>
                <input
                  type="text"
                  value={editVal}
                  onChange={e => setEditVal(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Đơn vị đo</label>
                <input
                  type="text"
                  value={editUnit}
                  onChange={e => setEditUnit(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setEditingSpec(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>Lưu & Phê duyệt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Missing Spec Modal */}
      {isAddingSpec && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddSpecification} className="liquid-glass-panel rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900">Thêm thông số kỹ thuật mới</h3>
            <p className="text-xs text-slate-500">
              Bổ sung thủ công thông số quan trọng chưa nhận diện được từ datasheet.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Khóa tham số (snake_case)</label>
                <input
                  type="text"
                  placeholder="ví dụ: max_dc_voltage"
                  required
                  value={newParamName}
                  onChange={e => setNewParamName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tên hiển thị tiếng Việt / Anh</label>
                <input
                  type="text"
                  placeholder="ví dụ: Điện áp DC cực đại"
                  value={newDisplayName}
                  onChange={e => setNewDisplayName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Giá trị</label>
                  <input
                    type="text"
                    placeholder="1100"
                    required
                    value={newRawVal}
                    onChange={e => setNewRawVal(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Đơn vị</label>
                  <input
                    type="text"
                    placeholder="V"
                    value={newRawUnit}
                    onChange={e => setNewRawUnit(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Số trang trong PDF</label>
                <input
                  type="number"
                  min={1}
                  value={newPageNum}
                  onChange={e => setNewPageNum(parseInt(e.target.value, 10) || 1)}
                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-900 font-mono focus:outline-none focus:border-amber-500 shadow-sm"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingSpec(false)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm thông số</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
