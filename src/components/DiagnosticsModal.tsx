import React, { useState, useEffect } from 'react';
import {
  Activity,
  X,
  CheckCircle2,
  AlertCircle,
  Clock,
  Cpu,
  Layers,
  FileText,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import { ExtractionRun } from '../types';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({
  isOpen,
  onClose
}) => {
  const [runs, setRuns] = useState<ExtractionRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ExtractionRun | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/diagnostics/runs');
      const data: ExtractionRun[] = await res.json();
      setRuns(data);
      if (data.length > 0) {
        setSelectedRun(data[0]);
      }
    } catch (err) {
      console.error('Failed to load diagnostics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRuns();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] shadow-xl flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Extraction Diagnostics &amp; Engine Logs</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 font-semibold">
                  Live Log
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Native text coverage, AI fallback ratio, execution latency, and SHA-256 hash checks
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={fetchRuns}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {runs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Chưa có phiên trích xuất nào được ghi nhận. Tải lên tệp PDF datasheet để tạo báo cáo chẩn đoán.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Runs List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">Các phiên nạp gần đây</span>
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 font-mono text-xs">
                  {runs.map(run => {
                    const isSelected = selectedRun?.id === run.id;
                    return (
                      <div
                        key={run.id}
                        onClick={() => setSelectedRun(run)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-cyan-50/80 border-cyan-400 shadow-sm'
                            : 'bg-white border-slate-200/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Mã: {run.id.slice(-8)}</span>
                          <span className="text-cyan-700 font-bold">{run.processingTimeMs} ms</span>
                        </div>
                        <p className="text-slate-900 font-bold truncate mt-1 text-xs">{run.modelId}</p>
                        <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-1">
                          <span>{run.extractedCount} thông số</span>
                          <span>•</span>
                          <span className={run.aiFallbackUsed ? 'text-amber-700 font-medium' : 'text-emerald-700 font-medium'}>
                            {run.aiFallbackUsed ? 'AI Fallback' : 'Native (0 AI)'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Run Diagnostic View */}
              <div className="md:col-span-2 space-y-4 font-mono text-xs">
                {selectedRun && (
                  <>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Chất lượng văn bản thuần</span>
                        <p className="text-xl font-black text-slate-900 mt-0.5">
                          {Math.round(selectedRun.nativeQualityScore * 100)}%
                        </p>
                      </div>

                      <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Chế độ giải mã</span>
                        <p className="text-xs font-bold text-cyan-800 mt-1 truncate">
                          {selectedRun.parserUsed}
                        </p>
                      </div>

                      <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">Bỏ qua AI (Tokens 0)</span>
                        <p className={`text-base font-black mt-0.5 ${selectedRun.diagnostics?.aiBypassed ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {selectedRun.diagnostics?.aiBypassed ? 'CÓ (ĐỌC TỐT)' : 'KHÔNG (GỌI AI)'}
                        </p>
                      </div>
                    </div>

                    {/* Pipeline Decisions & Evaluation Reasons */}
                    {selectedRun.diagnostics?.nativeEvaluationReasons && selectedRun.diagnostics.nativeEvaluationReasons.length > 0 && (
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-2xl text-emerald-950 space-y-1">
                        <span className="text-[10px] uppercase font-bold block text-emerald-900">
                          Kết quả Đánh giá Tầng 1 (Native Parser):
                        </span>
                        <ul className="space-y-1 text-[11px] text-emerald-800">
                          {selectedRun.diagnostics.nativeEvaluationReasons.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Review Reasons if applicable */}
                    {selectedRun.diagnostics?.reviewReasons && selectedRun.diagnostics.reviewReasons.length > 0 && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200/90 rounded-2xl text-rose-950 space-y-1">
                        <span className="text-[10px] uppercase font-bold block text-rose-900 flex items-center space-x-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Lý do kích hoạt Review Required (Tầng 3):</span>
                        </span>
                        <ul className="space-y-1 text-[11px] text-rose-800">
                          {selectedRun.diagnostics.reviewReasons.map((r, i) => (
                            <li key={i}>• {r}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Detailed Page Char Lengths */}
                    {selectedRun.diagnostics?.pageTextLengths && (
                      <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-bold block mb-2">
                          Mật độ ký tự từng trang PDF (Character Density)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {selectedRun.diagnostics.pageTextLengths.map(p => (
                            <div key={p.page} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                              <span className="text-slate-500">Trang {p.page}:</span>
                              <p className="text-slate-900 font-bold">{p.charLength} ký tự</p>
                              <span className="text-[10px] text-slate-500">{p.wordCount} từ</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* System Audit Details */}
                    <div className="p-3.5 bg-white border border-slate-200/80 rounded-2xl space-y-1.5 text-[11px] shadow-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Chế độ Đường ống:</span>
                        <span className="text-slate-800 font-bold">{selectedRun.diagnostics?.pipelineMode || 'AUTO_HYBRID'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Nhà cung cấp AI:</span>
                        <span className="text-emerald-700 font-bold">{selectedRun.diagnostics?.aiProvider || 'Gemini'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Số điểm xung đột:</span>
                        <span className={selectedRun.conflictsCount > 0 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                          {selectedRun.conflictsCount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-medium">Thời gian thực thi:</span>
                        <span className="text-slate-600">{new Date(selectedRun.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
