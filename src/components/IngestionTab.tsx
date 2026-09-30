import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Sparkles,
  ExternalLink,
  Cpu,
  RefreshCw,
  Sliders,
  ShieldAlert,
  ArrowDown,
  HardDrive
} from 'lucide-react';
import { motion } from 'motion/react';
import { IngestionResult, IngestionSettings } from '../types';

interface IngestionTabProps {
  onIngestionComplete: (result: IngestionResult) => void;
  onNavigateToReview: (modelId: string) => void;
  onOpenSettings?: () => void;
}

export const IngestionTab: React.FC<IngestionTabProps> = ({
  onIngestionComplete,
  onNavigateToReview,
  onOpenSettings
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [currentFileName, setCurrentFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<IngestionResult | null>(null);
  const [settings, setSettings] = useState<IngestionSettings | null>(null);
  const [activeProviderName, setActiveProviderName] = useState<string>('Google Gemini');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef<number>(0);

  // Fetch current settings for display
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        if (data.activeProviderName) {
          setActiveProviderName(data.activeProviderName);
        }
      }
    } catch (e) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // Prevent browser default behavior for drag and drop across the entire window
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
    };

    window.addEventListener('dragover', handleWindowDragOver);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  const handleFileUpload = async (file: File) => {
    const isPdf =
      file &&
      (file.name.toLowerCase().endsWith('.pdf') ||
        file.type === 'application/pdf' ||
        file.type === 'application/x-pdf');

    if (!isPdf) {
      setErrorMsg('Vui lòng chọn hoặc kéo thả tệp PDF định dạng chuẩn (.pdf).');
      return;
    }

    if (file.size > 30 * 1024 * 1024) {
      setErrorMsg('Dung lượng tệp vượt quá 30MB. Vui lòng nén bớt hoặc chọn tệp nhỏ hơn.');
      return;
    }

    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentFileName(file.name);
    setProcessingStep('Đang chạy Native Parser trích xuất văn bản & bảng biểu...');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/datasheets/upload', {
        method: 'POST',
        body: formData
      });

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (
        responseText.trim().startsWith('<') ||
        (!contentType.includes('application/json') && !responseText.trim().startsWith('{'))
      ) {
        throw new Error(
          `Máy chủ phản hồi trang lỗi HTML (Mã HTTP ${response.status}). Vui lòng thử lại.`
        );
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Không thể giải mã phản hồi JSON từ máy chủ (Mã HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Lỗi máy chủ HTTP ${response.status}`);
      }

      const result: IngestionResult = data;
      setLastResult(result);
      onIngestionComplete(result);
      fetchSettings(); // Refresh settings state
    } catch (err: any) {
      console.error('Ingestion failed:', err);
      setErrorMsg(`Xử lý tệp PDF thất bại: ${err.message || 'Lỗi đọc tệp'}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSampleLoad = async (sampleId: string) => {
    setErrorMsg(null);
    setIsProcessing(true);
    setCurrentFileName(`Sample: ${sampleId}`);
    setProcessingStep(`Nạp tệp datasheet mẫu [${sampleId}]...`);

    try {
      const response = await fetch(`/api/datasheets/sample/${sampleId}`, {
        method: 'POST'
      });

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (
        responseText.trim().startsWith('<') ||
        (!contentType.includes('application/json') && !responseText.trim().startsWith('{'))
      ) {
        throw new Error(
          `Máy chủ phản hồi trang lỗi HTML (Mã HTTP ${response.status}). Vui lòng thử lại.`
        );
      }

      let data: any;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error(
          `Không thể giải mã phản hồi JSON từ máy chủ (Mã HTTP ${response.status}).`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || `Lỗi máy chủ HTTP ${response.status}`);
      }

      const result: IngestionResult = data;
      setLastResult(result);
      onIngestionComplete(result);
      fetchSettings();
    } catch (err: any) {
      setErrorMsg(`Không thể tải mẫu: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 3-Tier Decision Pipeline Architecture Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-700 font-mono text-[10px] uppercase tracking-wider font-semibold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200/60">
                MULTI-TIER DECISION PIPELINE
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-500">
                {settings?.pipelineMode === 'STRICT_NATIVE'
                  ? 'Native Engine (100% Offline)'
                  : settings?.pipelineMode === 'FORCE_AI'
                  ? 'Always AI Verification'
                  : 'Auto Hybrid Pipeline'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1.5">
              Datasheet Ingestion &amp; Specification Parser
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Upload original manufacturer equipment datasheets. The engine parses technical parameters, electrical ratings, and dimensions with verifiable lineage.
            </p>
          </div>

          {onOpenSettings && (
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onOpenSettings}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center space-x-2 shadow-2xs transition-colors cursor-pointer active:scale-98"
              >
                <Sliders className="w-4 h-4 text-slate-500" />
                <span>Pipeline Settings</span>
              </button>
            </div>
          )}
        </div>

        {/* Visual Workflow Steps */}
        <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 flex flex-col justify-between">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                1
              </span>
              <span className="text-xs font-semibold text-slate-900">Native Parser</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Extracts text, electrical tables, and standard unit regex.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/60 flex flex-col justify-between">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                2
              </span>
              <span className="text-xs font-semibold text-emerald-950">High Confidence</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-tight">
              Direct verification without token cost.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200/60 flex flex-col justify-between">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                3
              </span>
              <span className="text-xs font-semibold text-blue-950">AI Multimodal</span>
            </div>
            <p className="text-[11px] text-blue-800 leading-tight">
              Disambiguates complex diagrams and tables.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 flex flex-col justify-between">
            <div className="flex items-center space-x-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold font-mono flex items-center justify-center">
                4
              </span>
              <span className="text-xs font-semibold text-amber-950">Human Review</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-tight">
              Flags low-confidence values for engineer approval.
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload Dropzone & Sample Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div
            id="pdf-upload-dropzone"
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragCounter.current += 1;
              setIsDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'copy';
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragCounter.current -= 1;
              if (dragCounter.current <= 0) {
                setIsDragging(false);
                dragCounter.current = 0;
              }
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              dragCounter.current = 0;
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => {
              if (!isProcessing) {
                fileInputRef.current?.click();
              }
            }}
            className={`relative rounded-3xl p-10 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[340px] select-none ${
              isDragging
                ? 'border-2 border-amber-500 bg-amber-50/70 scale-[1.01] shadow-xl shadow-amber-500/10'
                : 'border-2 border-dashed border-slate-300 hover:border-amber-500/70 bg-white/70 hover:bg-white/90 shadow-sm'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            {isProcessing ? (
              <div className="space-y-4 py-6 pointer-events-none">
                <div className="w-14 h-14 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto shadow-md shadow-amber-500/10" />
                <div>
                  <p className="text-slate-900 font-bold text-sm sm:text-base">{processingStep}</p>
                  <p className="text-slate-500 text-xs font-mono mt-1">
                    Đang phân tích thông số kỹ thuật ({currentFileName})...
                  </p>
                </div>
              </div>
            ) : (
              <div className="pointer-events-none flex flex-col items-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform shadow-md ${
                    isDragging
                      ? 'bg-amber-500 text-white scale-110 shadow-amber-500/30'
                      : 'bg-gradient-to-tr from-amber-50 to-amber-100 border border-amber-200 text-amber-600'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 stroke-[2.2]" />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  {isDragging ? 'Thả tệp PDF vào đây ngay' : 'Kéo thả tệp PDF datasheet hoặc bấm để chọn tệp'}
                </h3>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 max-w-md leading-relaxed">
                  Tương thích mọi tài liệu kỹ thuật: Solar PV Panel, Inverter biến tần, BESS lưu trữ, Máy biến áp, Thiết bị đóng cắt...
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 font-medium">
                    PDF 1.3 - 2.0
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200/80 font-medium">
                    Tối đa 30MB
                  </span>
                  <span className="text-slate-300">•</span>
                  <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                    Active: {activeProviderName}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-3 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Lỗi xử lý: </span>
                {errorMsg}
              </div>
            </div>
          )}

          {/* Structured Ingestion Result Card */}
          {lastResult && !isProcessing && (
            <div className="mt-4 p-5 rounded-3xl bg-white/95 border border-slate-200/90 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900">
                      {lastResult.equipment.manufacturerName} {lastResult.equipment.modelName}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                      {lastResult.equipment.categoryCode}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Tệp: {lastResult.datasheet.originalFilename} • Đã trích xuất {lastResult.specifications.length} thông số
                  </p>
                </div>

                {/* Pipeline Outcome Status Pill */}
                <div>
                  {lastResult.pipelineStatus === 'NATIVE_SUCCESS' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đọc tốt ➔ Không gọi AI (0 Token)</span>
                    </span>
                  ) : lastResult.pipelineStatus === 'AI_FALLBACK' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đọc khó ➔ Đã gọi AI đối chiếu ({lastResult.extractionRun.parserUsed})</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-rose-50 text-rose-800 border border-rose-300 text-xs font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                      <span>Không chắc chắn ➔ Review Required</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Review Reasons / Explanations */}
              {lastResult.reviewReasons && lastResult.reviewReasons.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
                  <span className="font-bold block text-amber-900">
                    Lý do yêu cầu kỹ sư xác thực (Review Reasons):
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800">
                    {lastResult.reviewReasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-500 font-mono">
                  Độ tự tin: {Math.round((lastResult.extractionRun.nativeQualityScore || 0.85) * 100)}%
                </div>
                <button
                  onClick={() => onNavigateToReview(lastResult.equipment.id)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <span>Chuyển tới Bàn kiểm duyệt (Review Workbench)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pre-configured Manufacturer Samples */}
        <div className="space-y-4">
          <div className="liquid-glass-panel rounded-3xl p-5 shadow-sm">
            <div className="flex items-center space-x-2 mb-3">
              <Zap className="w-4 h-4 text-amber-600" />
              <h3 className="text-xs font-mono font-bold uppercase text-slate-800 tracking-wider">
                Thử nhanh với mẫu PDF chuẩn
              </h3>
            </div>
            <p className="text-slate-600 text-xs mb-4 leading-relaxed">
              Nhấp thử ngay các tệp datasheet tiêu chuẩn để kiểm nghiệm cơ chế tự động phân nhánh Native / AI / Review:
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => handleSampleLoad('huawei-sun2000')}
                disabled={isProcessing}
                className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 transition-all group disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Huawei SUN2000-50KTL
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-semibold">
                    Inverter
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  50kW String Inverter, 4 MPPTs, 1100V DC
                </p>
              </button>

              <button
                onClick={() => handleSampleLoad('trina-vertex-s')}
                disabled={isProcessing}
                className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 transition-all group disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    Trina Vertex S+ 440W
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
                    PV Module
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Dual-Glass TOPCon, Voc 52.2V, 22.0% Eff
                </p>
              </button>

              <button
                onClick={() => handleSampleLoad('catl-enerone')}
                disabled={isProcessing}
                className="w-full text-left p-3.5 rounded-2xl bg-white hover:bg-amber-50/50 border border-slate-200/80 hover:border-amber-300 transition-all group disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                    CATL EnerOne BESS
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                    BESS Cabinet
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  372.7 kWh Liquid Cooling, LFP, 1500V DC
                </p>
              </button>
            </div>
          </div>

          <div className="liquid-glass-subtle rounded-3xl p-4 text-[11px] text-slate-600 font-mono space-y-2 border border-slate-200/70">
            <span className="text-slate-900 font-bold block uppercase text-[10px]">
              Đảm bảo 100% tuân thủ kỹ thuật:
            </span>
            <div className="flex items-start space-x-2">
              <span className="text-amber-600 font-bold">1.</span>
              <span>Lưu trữ PDF gốc & gán băm SHA-256 đối soát.</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-amber-600 font-bold">2.</span>
              <span>Trích xuất bảng và đơn vị kỹ thuật chuẩn hóa (STC/NMOT).</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-amber-600 font-bold">3.</span>
              <span>Chuyển sang bàn Review để Kỹ sư xác thực & lưu vào CSDL.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
