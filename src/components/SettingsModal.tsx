import React, { useState, useEffect } from 'react';
import {
  Sliders,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Cpu,
  Shield,
  Layers,
  Key,
  HardDrive,
  RefreshCw,
  Zap,
  Server,
  Terminal,
  Activity,
  ChevronRight,
  Info
} from 'lucide-react';
import { IngestionSettings, IngestionPipelineMode, AIProviderId, LocalConnectionTestResult } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProviderChanged: (providerSummary: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onProviderChanged
}) => {
  const [settings, setSettings] = useState<IngestionSettings>({
    pipelineMode: 'AUTO_HYBRID',
    activeProvider: 'gemini',
    geminiModel: 'gemini-2.5-flash',
    openaiModel: 'gpt-4o',
    claudeModel: 'claude-3-5-sonnet-20241022',
    localEndpoint: 'http://localhost:11434',
    localModelName: 'llama3.2-vision:latest',
    qualityThreshold: 0.70,
    confidenceThreshold: 0.85,
    apiKeysConfigured: {
      gemini: false,
      openai: false,
      claude: false
    }
  });

  const [activeTab, setActiveTab] = useState<'pipeline' | 'provider' | 'thresholds'>('pipeline');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Local connection test state
  const [testingLocal, setTestingLocal] = useState(false);
  const [localTestResult, setLocalTestResult] = useState<LocalConnectionTestResult | null>(null);

  // Load current settings from backend
  const loadSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setLocalTestResult(null);
    }
  }, [isOpen]);

  const handleSave = async (updatedFields?: Partial<IngestionSettings>) => {
    setSaving(true);
    setSaveMessage('');
    try {
      const payload = { ...settings, ...updatedFields };
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSaveSuccess(true);
        setSaveMessage('Đã lưu cài đặt đường ống Ingestion thành công!');
        onProviderChanged(data.activeProviderName || data.settings.activeProvider);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const errData = await res.json();
        setSaveMessage(`Lỗi: ${errData.error || 'Không thể lưu cài đặt'}`);
      }
    } catch (err: any) {
      console.error(err);
      setSaveMessage('Lỗi mạng khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const handleTestLocalConnection = async () => {
    setTestingLocal(true);
    setLocalTestResult(null);
    try {
      const res = await fetch('/api/settings/test-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: settings.localEndpoint })
      });
      const data: LocalConnectionTestResult = await res.json();
      setLocalTestResult(data);
      if (data.success && data.detectedModels && data.detectedModels.length > 0) {
        // Auto pick first model if current isn't in list
        if (!data.detectedModels.includes(settings.localModelName)) {
          setSettings(prev => ({ ...prev, localModelName: data.detectedModels![0] }));
        }
      }
    } catch (err: any) {
      setLocalTestResult({
        success: false,
        endpoint: settings.localEndpoint,
        message: 'Lỗi gửi yêu cầu kiểm tra tới máy chủ'
      });
    } finally {
      setTestingLocal(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Ingestion Pipeline &amp; AI Engine Settings</h3>
              <p className="text-xs text-slate-500">Configure Native Parser, Hybrid Fallback, and Local/Cloud Models</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-2 border-b border-slate-100 bg-slate-50/50 flex space-x-2 shrink-0">
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'pipeline'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Pipeline Mode</span>
          </button>
          <button
            onClick={() => setActiveTab('provider')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'provider'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>2. Model &amp; Local Provider</span>
          </button>
          <button
            onClick={() => setActiveTab('thresholds')}
            className={`pb-2.5 px-3 text-xs font-semibold transition-colors border-b-2 flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'thresholds'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. Review Thresholds</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">
          {/* TAB 1: PIPELINE MODES */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-xs text-amber-950 space-y-1.5">
                <div className="font-bold flex items-center space-x-1.5 text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Quy trình Xử lý Đa tầng Khuyên dùng:</span>
                </div>
                <p className="font-mono text-[11px] leading-relaxed text-amber-800">
                  Native parser trước ➔ Nếu đọc tốt: <strong>Không gọi AI</strong> (0 token, cực nhanh) ➔ Nếu khó: <strong>Gọi AI</strong> (Gemini/Claude/OpenAI/Local) ➔ Nếu vẫn không chắc: <strong>Gắn cờ Review Required</strong>.
                </p>
              </div>

              <div className="space-y-3">
                {/* Mode 1: AUTO_HYBRID */}
                <div
                  onClick={() => setSettings({ ...settings, pipelineMode: 'AUTO_HYBRID' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    settings.pipelineMode === 'AUTO_HYBRID'
                      ? 'bg-amber-50/90 border-amber-500 shadow-md shadow-amber-500/10'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          Tự động Đa tầng (Auto Hybrid Fallback)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                          Khuyên dùng
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Chạy <strong>Native Regex & Table Parser</strong> trước. Nếu phát hiện đủ thông số kỹ thuật cốt lõi và tài liệu rõ nét thì <strong>hoàn tất ngay, không gọi AI</strong> để tiết kiệm chi phí tối đa. Chỉ tự động kích hoạt AI khi tài liệu mờ, quét scan hoặc thiếu thông số.
                      </p>
                    </div>
                    <div className="pt-0.5 pl-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        settings.pipelineMode === 'AUTO_HYBRID' ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-300'
                      }`}>
                        {settings.pipelineMode === 'AUTO_HYBRID' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mode 2: STRICT_NATIVE */}
                <div
                  onClick={() => setSettings({ ...settings, pipelineMode: 'STRICT_NATIVE' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    settings.pipelineMode === 'STRICT_NATIVE'
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          Thuần Native 100% Offline (Strict Native)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          Bảo mật tuyệt đối
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Tuyệt đối <strong>không gửi bất kỳ dữ liệu nào ra mạng Internet</strong> và không gọi AI. Chỉ sử dụng bộ bóc tách Regex & Table nội bộ. Thích hợp cho môi trường quân sự, dự án bí mật hoặc khi máy trạm không có kết nối Internet.
                      </p>
                    </div>
                    <div className="pt-0.5 pl-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        settings.pipelineMode === 'STRICT_NATIVE' ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {settings.pipelineMode === 'STRICT_NATIVE' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mode 3: FORCE_AI */}
                <div
                  onClick={() => setSettings({ ...settings, pipelineMode: 'FORCE_AI' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    settings.pipelineMode === 'FORCE_AI'
                      ? 'bg-sky-50/90 border-sky-500 shadow-md shadow-sky-500/10'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-slate-900">
                          Luôn gọi AI Đối chiếu Chéo (Force AI Dual Audit)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-600 text-white">
                          Đối chiếu kép
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Chạy song song cả <strong>Native Parser</strong> lẫn <strong>Bộ máy AI</strong> cho mọi tệp datasheet tải lên nhằm kiểm tra chéo từng thông số điện áp, công suất, dải MPPT.
                      </p>
                    </div>
                    <div className="pt-0.5 pl-3">
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        settings.pipelineMode === 'FORCE_AI' ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300'
                      }`}>
                        {settings.pipelineMode === 'FORCE_AI' && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI PROVIDERS & LOCAL MACHINE */}
          {activeTab === 'provider' && (
            <div className="space-y-5">
              <p className="text-xs text-slate-600">
                Lựa chọn bộ máy AI dự phòng khi tài liệu phức tạp hoặc khi chế độ AI Fallback được kích hoạt:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. Google Gemini */}
                <div
                  onClick={() => setSettings({ ...settings, activeProvider: 'gemini' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    settings.activeProvider === 'gemini'
                      ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900">Google Gemini</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold">
                        Cloud AI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Phân tích thị giác đa phương thức (Multimodal), tối ưu tốc độ và chi phí cho datasheet.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">
                      CHỌN MÔ HÌNH:
                    </label>
                    <select
                      value={settings.geminiModel}
                      onChange={(e) => setSettings({ ...settings, geminiModel: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-amber-500 font-mono"
                    >
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (Nhanh & Chuẩn)</option>
                      <option value="gemini-2.5-pro">Gemini 2.5 Pro (Phân tích sâu)</option>
                    </select>
                  </div>
                </div>

                {/* 2. Local Máy tính (Ollama / LM Studio) */}
                <div
                  onClick={() => setSettings({ ...settings, activeProvider: 'local_ollama' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    settings.activeProvider === 'local_ollama'
                      ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900">Local Máy tính (Ollama / Local LLM)</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        Local Machine
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Chạy trực tiếp trên máy tính kỹ sư qua Ollama/LM Studio. Hoàn toàn nội bộ và bảo mật.
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-emerald-800 flex items-center space-x-1">
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>{settings.localModelName}</span>
                    </span>
                  </div>
                </div>

                {/* 3. OpenAI */}
                <div
                  onClick={() => setSettings({ ...settings, activeProvider: 'openai' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    settings.activeProvider === 'openai'
                      ? 'bg-purple-50/90 border-purple-500 ring-2 ring-purple-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900">OpenAI</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold">
                        Cloud AI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Độ chính xác ngữ nghĩa cao với họ mô hình GPT-4o / GPT-4o-mini.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">
                      CHỌN MÔ HÌNH:
                    </label>
                    <select
                      value={settings.openaiModel}
                      onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-purple-500 font-mono"
                    >
                      <option value="gpt-4o">OpenAI GPT-4o</option>
                      <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
                    </select>
                  </div>
                </div>

                {/* 4. Anthropic Claude */}
                <div
                  onClick={() => setSettings({ ...settings, activeProvider: 'claude' })}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    settings.activeProvider === 'claude'
                      ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-slate-900">Anthropic Claude</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold">
                        Cloud AI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">
                      Khả năng đọc hiểu tài liệu kỹ thuật phức tạp hàng đầu với Claude 3.5 Sonnet.
                    </p>
                  </div>
                  <div>
                    <label className="text-[10px] font-mono font-bold text-slate-500 block mb-1">
                      CHỌN MÔ HÌNH:
                    </label>
                    <select
                      value={settings.claudeModel}
                      onChange={(e) => setSettings({ ...settings, claudeModel: e.target.value })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                      <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dedicated Local Machine Settings Panel */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Server className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">
                      Cấu hình Kết nối Máy tính Cục bộ (Local Machine / Ollama)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Ollama / LM Studio / vLLM
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Endpoint URL Local:
                    </label>
                    <input
                      type="text"
                      value={settings.localEndpoint}
                      onChange={(e) => setSettings({ ...settings, localEndpoint: e.target.value })}
                      placeholder="http://localhost:11434"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Mặc định Ollama: http://localhost:11434 (hoặc http://127.0.0.1:1234/v1)
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">
                      Tên Mô hình Local (Model Name):
                    </label>
                    <input
                      type="text"
                      value={settings.localModelName}
                      onChange={(e) => setSettings({ ...settings, localModelName: e.target.value })}
                      placeholder="llama3.2-vision:latest"
                      className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Gợi ý: llama3.2-vision, qwen2.5:7b, mistral, deepseek-r1
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleTestLocalConnection}
                    disabled={testingLocal}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${testingLocal ? 'animate-spin' : ''}`} />
                    <span>{testingLocal ? 'Đang kiểm tra kết nối...' : 'Kiểm tra kết nối Local (Test)'}</span>
                  </button>

                  {localTestResult && (
                    <div className={`text-xs flex items-center space-x-1.5 ${
                      localTestResult.success ? 'text-emerald-700' : 'text-amber-700'
                    }`}>
                      {localTestResult.success ? (
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                      )}
                      <span className="text-[11px] font-medium">
                        {localTestResult.success
                          ? `Kết nối tốt (${localTestResult.latencyMs}ms)! ${localTestResult.detectedModels?.length || 0} models tìm thấy.`
                          : 'Chưa kết nối được. Vui lòng mở Ollama hoặc LM Studio.'}
                      </span>
                    </div>
                  )}
                </div>

                {localTestResult?.detectedModels && localTestResult.detectedModels.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-bold text-slate-500 block mb-1">
                      CÁC MÔ HÌNH CÓ SẴN TRÊN MÁY BẠN:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {localTestResult.detectedModels.map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setSettings({ ...settings, localModelName: m })}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-lg border transition-colors ${
                            settings.localModelName === m
                              ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THRESHOLDS & REVIEW REQUIRED */}
          {activeTab === 'thresholds' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 text-xs text-sky-950 space-y-1">
                <div className="font-bold flex items-center space-x-1.5 text-sky-900">
                  <Shield className="w-4 h-4 text-sky-600" />
                  <span>Cơ chế Xác thực Kỹ thuật Không Chắc ➔ Review Required</span>
                </div>
                <p className="text-[11px] text-sky-800 leading-relaxed font-mono">
                  Khi bất kỳ thông số nào có độ tự tin thấp hơn ngưỡng, hoặc phát hiện xung đột số liệu giữa Native và AI, hệ thống sẽ tự động chuyển trạng thái thiết bị sang <strong>Review Required</strong> kèm lý do cảnh báo chi tiết để kỹ sư thẩm tra.
                </p>
              </div>

              {/* Quality Threshold */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Ngưỡng Điểm "Đọc Tốt" của Native Parser (Bypass AI)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Nếu điểm chất lượng văn bản và mật độ bảng biểu đạt trên mức này, hệ thống sẽ bỏ qua AI.
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono px-2.5 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200">
                    {Math.round(settings.qualityThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={settings.qualityThreshold}
                  onChange={(e) => setSettings({ ...settings, qualityThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>50% (Dễ kích hoạt Đọc tốt)</span>
                  <span>70% (Khuyên dùng)</span>
                  <span>95% (Nghiêm ngặt)</span>
                </div>
              </div>

              {/* Confidence Threshold */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Ngưỡng Độ Tự Tin Tối Thiểu (Review Required Trigger)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Nếu độ tự tin của bất kỳ thông số nào thấp hơn ngưỡng này, thiết bị sẽ bị gắn cờ "Review Required".
                    </span>
                  </div>
                  <span className="text-sm font-bold font-mono px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200">
                    {Math.round(settings.confidenceThreshold * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.60"
                  max="0.95"
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={(e) => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>60% (Linh hoạt)</span>
                  <span>85% (Tiêu chuẩn kỹ thuật)</span>
                  <span>95% (Cực kỳ khắt khe)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200/80 bg-white/70 flex items-center justify-between shrink-0">
          <div>
            {saveSuccess ? (
              <span className="text-xs font-medium text-emerald-700 flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{saveMessage}</span>
              </span>
            ) : saveMessage ? (
              <span className="text-xs font-medium text-amber-700 flex items-center space-x-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>{saveMessage}</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400 font-mono">
                Đang dùng: {settings.pipelineMode} • {settings.activeProvider}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={() => handleSave()}
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{saving ? 'Đang lưu...' : 'Áp dụng cài đặt'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
