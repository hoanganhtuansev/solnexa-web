import React, { useState, useEffect } from 'react';
import {
  Sliders,
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
  Info,
  Save,
  Globe,
  DollarSign,
  FileSpreadsheet,
  Database,
  Cable,
  Check,
  RotateCcw,
  ExternalLink,
  Code
} from 'lucide-react';
import { IngestionSettings, IngestionPipelineMode, AIProviderId, LocalConnectionTestResult, ActiveTab } from '../types';

interface SettingsTabProps {
  onNavigateToTab?: (tab: ActiveTab) => void;
  onOpenDiagnostics?: () => void;
  onProviderChanged?: (providerSummary: string) => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({
  onNavigateToTab,
  onOpenDiagnostics,
  onProviderChanged
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'standards' | 'ai-pipeline' | 'database' | 'localization'>('standards');

  // Ingestion & AI Engine settings
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
      gemini: true,
      openai: false,
      claude: false
    }
  });

  // Engineering Standards & Calculation Parameters
  const [engineeringConfig, setEngineeringConfig] = useState({
    standardCode: 'JIS_C_3605',
    internalWiringCode: '2022_REVISED',
    maxDcVoltageDrop: 1.5,
    maxAcVoltageDrop: 1.0,
    maxHvVoltageDrop: 1.0,
    ambientTempC: 30,
    powerFactor: 0.95,
    conduitSingleFill: 48,
    conduitMultiFill: 32,
    defaultMarginPercent: 15,
    primaryCurrency: 'JPY',
    jpyToUsdRate: 152.5,
    jpyToVndRate: 165.8
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Local connection test state
  const [testingLocal, setTestingLocal] = useState(false);
  const [localTestResult, setLocalTestResult] = useState<LocalConnectionTestResult | null>(null);

  // Load current settings from backend
  useEffect(() => {
    loadSettings();
    // Load local engineering config if saved in localStorage
    try {
      const savedEng = localStorage.getItem('solnexa_engineering_config');
      if (savedEng) {
        setEngineeringConfig(JSON.parse(savedEng));
      }
    } catch (e) {
      // ignore
    }
  }, []);

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

  const handleSaveAISettings = async (updatedFields?: Partial<IngestionSettings>) => {
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
        setSaveMessage('Đã cập nhật cài đặt AI & đường ống bóc tách thành công!');
        onProviderChanged?.(data.activeProviderName || data.settings.activeProvider);
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

  const handleSaveEngineeringConfig = () => {
    setSaving(true);
    try {
      localStorage.setItem('solnexa_engineering_config', JSON.stringify(engineeringConfig));
      setSaveSuccess(true);
      setSaveMessage('Đã lưu cấu hình tiêu chuẩn kỹ thuật & quy chuẩn JIS!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      setSaveMessage('Lỗi khi lưu vào bộ nhớ cục bộ');
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
              <Sliders className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  SOLNEXA Platform Config
                </span>
                <span className="text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-mono">v1.6.0 Pro</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
                System &amp; Engineering Settings
                <span className="text-sm font-normal text-slate-500 ml-2">システム設定</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Cấu hình tiêu chuẩn kỹ thuật JIS, giới hạn sụt áp, động cơ AI trích xuất thông số và tỷ giá thương mại.
              </p>
            </div>
          </div>

          {/* Quick status badge */}
          <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Engine Active: {settings.activeProvider.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-2 border-b border-slate-100 mt-6 pt-2 overflow-x-auto custom-scrollbar">
          <button
            onClick={() => setActiveSubTab('standards')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'standards'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Shield className="w-4 h-4" />
              <span>Tiêu chuẩn JIS &amp; Sụt áp (JIS基準)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('ai-pipeline')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'ai-pipeline'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Động cơ AI &amp; Bóc tách (AI設定)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('database')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'database'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Database className="w-4 h-4" />
              <span>Thư viện Cáp &amp; Ống luồn (ライブラリ)</span>
            </div>
          </button>

          <button
            onClick={() => setActiveSubTab('localization')}
            className={`pb-2.5 px-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'localization'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <DollarSign className="w-4 h-4" />
              <span>Tiền tệ &amp; Tỷ giá BOQ (通貨・単位)</span>
            </div>
          </button>
        </div>
      </div>

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{saveMessage || 'Đã lưu thiết lập thành công.'}</span>
        </div>
      )}

      {/* SUBTAB 1: ENGINEERING STANDARDS & LIMITS */}
      {activeSubTab === 'standards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span>Quy chuẩn Kỹ thuật Điện áp dụng (Japanese Electrical Codes)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Các tính toán sụt áp, độ đầy ống luồn và chọn cỡ cáp tuân thủ chặt chẽ tiêu chuẩn công nghiệp Nhật Bản.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">JIS C 3605</span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[10px] font-bold">Mặc định</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tiêu chuẩn cáp cách điện polyethylene liên kết chéo (XLPE/CV/CVT 600V &amp; 6600V). Cung cấp bảng điện trở dây dẫn và dòng điện cho phép (Kyokuto Cable Data).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">内線規程 (Internal Wiring Code 2022)</span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[10px] font-bold">Bắt buộc</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Quy định độ sụt áp tối đa đường dây nguồn và nhánh phụ, hệ số điền đầy ống luồn dây điện JIS C 8430 / 8435.
                </p>
              </div>
            </div>

            {/* Voltage Drop Threshold Settings */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                Giới hạn Sụt áp Cho phép Tối đa (% Voltage Drop Thresholds)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">DC String (PV → Inverter)</span>
                    <span className="font-mono font-bold text-blue-600">{engineeringConfig.maxDcVoltageDrop}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={engineeringConfig.maxDcVoltageDrop}
                    onChange={e => setEngineeringConfig({ ...engineeringConfig, maxDcVoltageDrop: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">Khuyến nghị JIS: ≤ 1.5% - 2.0%</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">AC Hạ thế (Inverter → Trạm biến áp)</span>
                    <span className="font-mono font-bold text-blue-600">{engineeringConfig.maxAcVoltageDrop}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={engineeringConfig.maxAcVoltageDrop}
                    onChange={e => setEngineeringConfig({ ...engineeringConfig, maxAcVoltageDrop: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">Khuyến nghị: ≤ 1.0% (400V/200V)</p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">AC Trung thế (6.6kV → Đấu nối lưới)</span>
                    <span className="font-mono font-bold text-blue-600">{engineeringConfig.maxHvVoltageDrop}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.2"
                    max="2.0"
                    step="0.1"
                    value={engineeringConfig.maxHvVoltageDrop}
                    onChange={e => setEngineeringConfig({ ...engineeringConfig, maxHvVoltageDrop: parseFloat(e.target.value) })}
                    className="w-full accent-blue-600"
                  />
                  <p className="text-[11px] text-slate-500">Tiêu chuẩn Điện lực: ≤ 1.0%</p>
                </div>
              </div>
            </div>

            {/* Environmental Derating & Conduit Fill */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nhiệt độ môi trường chuẩn (°C)
                </label>
                <select
                  value={engineeringConfig.ambientTempC}
                  onChange={e => setEngineeringConfig({ ...engineeringConfig, ambientTempC: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={25}>25°C (Tiêu chuẩn phòng Lab / IEC)</option>
                  <option value={30}>30°C (Tiêu chuẩn JIS chuẩn nội địa Nhật)</option>
                  <option value={40}>40°C (Mùa hè Nhật Bản / Ngoài trời trực tiếp)</option>
                  <option value={45}>45°C (Máng cáp kín trên mái tôn)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hệ số công suất cos φ (Power Factor)
                </label>
                <select
                  value={engineeringConfig.powerFactor}
                  onChange={e => setEngineeringConfig({ ...engineeringConfig, powerFactor: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0.95}>cos φ = 0.95 (Tiêu chuẩn tính sụt áp AC)</option>
                  <option value={0.90}>cos φ = 0.90 (Tải động cơ / Biến tần BESS)</option>
                  <option value={0.85}>cos φ = 0.85 (Tải cảm ứng nặng)</option>
                  <option value={1.0}>cos φ = 1.00 (Thuần trở / Hệ DC)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tỷ lệ điền đầy ống luồn tối đa (内線規程)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <span className="text-[10px] text-slate-500 block">≥ 3 sợi cáp</span>
                    <span className="font-mono font-bold text-xs text-blue-700">32%</span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <span className="text-[10px] text-slate-500 block">1 - 2 sợi cáp</span>
                    <span className="font-mono font-bold text-xs text-blue-700">48%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  setEngineeringConfig({
                    standardCode: 'JIS_C_3605',
                    internalWiringCode: '2022_REVISED',
                    maxDcVoltageDrop: 1.5,
                    maxAcVoltageDrop: 1.0,
                    maxHvVoltageDrop: 1.0,
                    ambientTempC: 30,
                    powerFactor: 0.95,
                    conduitSingleFill: 48,
                    conduitMultiFill: 32,
                    defaultMarginPercent: 15,
                    primaryCurrency: 'JPY',
                    jpyToUsdRate: 152.5,
                    jpyToVndRate: 165.8
                  });
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors flex items-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại mặc định</span>
              </button>

              <button
                onClick={handleSaveEngineeringConfig}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Đang lưu...' : 'Lưu Tiêu chuẩn Kỹ thuật'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: AI EXTRACTION ENGINE & INGESTION PIPELINE */}
      {activeSubTab === 'ai-pipeline' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Chế độ Đường ống Trích xuất Thông số (Ingestion Pipeline Mode)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lựa chọn phương thức bóc tách thông số kỹ thuật từ tệp PDF datasheet (Sungrow, Huawei, Trina, Hitachi).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {/* Option 1: AUTO_HYBRID */}
              <div
                onClick={() => setSettings({ ...settings, pipelineMode: 'AUTO_HYBRID' })}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  settings.pipelineMode === 'AUTO_HYBRID'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-xs text-slate-900">AUTO HYBRID</span>
                  </div>
                  {settings.pipelineMode === 'AUTO_HYBRID' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="mt-2 text-[10px] text-blue-700 font-semibold uppercase tracking-wider">
                  Khuyến nghị cho Solar PV &amp; BESS
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Kết hợp OCR cục bộ, bảng biểu chuẩn và tự động kích hoạt AI Vision khi gặp datasheet phức tạp. Tối ưu tốc độ và độ chính xác.
                </p>
              </div>

              {/* Option 2: FORCE_AI */}
              <div
                onClick={() => setSettings({ ...settings, pipelineMode: 'FORCE_AI' })}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  settings.pipelineMode === 'FORCE_AI'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-xs text-slate-900">FORCE AI (Deep Vision)</span>
                  </div>
                  {settings.pipelineMode === 'FORCE_AI' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="mt-2 text-[10px] text-indigo-700 font-semibold uppercase tracking-wider">
                  Trích xuất toàn diện
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Gửi toàn bộ tài liệu qua mô hình LLM Multimodal để phân tích sơ đồ đấu nối, bảng hiệu suất và đường đặc tính I-V.
                </p>
              </div>

              {/* Option 3: STRICT_NATIVE */}
              <div
                onClick={() => setSettings({ ...settings, pipelineMode: 'STRICT_NATIVE' })}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  settings.pipelineMode === 'STRICT_NATIVE'
                    ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900">STRICT NATIVE (Offline)</span>
                  </div>
                  {settings.pipelineMode === 'STRICT_NATIVE' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="mt-2 text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                  Bảo mật cấp Doanh nghiệp
                </div>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Không gửi dữ liệu ra bên ngoài. Chỉ sử dụng trình phân tích cục bộ Regex hoặc máy chủ Ollama on-premise.
                </p>
              </div>
            </div>

            {/* AI Provider Selection */}
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                Nhà cung cấp Mô hình AI Trích xuất (AI Engine Provider)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Gemini */}
                <div
                  onClick={() => setSettings({ ...settings, activeProvider: 'gemini' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    settings.activeProvider === 'gemini'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Google Gemini 2.5 Flash</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">
                      Tối ưu nhất
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cửa sổ ngữ cảnh 1M token, tốc độ xử lý bảng PDF dưới 1.2 giây.
                  </p>
                </div>

                {/* Claude */}
                <div
                  onClick={() => setSettings({ ...settings, activeProvider: 'claude' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    settings.activeProvider === 'claude'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">Anthropic Claude 3.5 Sonnet</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-700 font-bold rounded">
                      Chính xác cao
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Chuyên gia phân tích sơ đồ điện một sợi và chú thích kỹ thuật.
                  </p>
                </div>

                {/* OpenAI */}
                <div
                  onClick={() => setSettings({ ...settings, activeProvider: 'openai' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    settings.activeProvider === 'openai'
                      ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900">OpenAI GPT-4o</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-emerald-100 text-emerald-700 font-bold rounded">
                      Đa dụng
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Trích xuất tham số JSON có cấu trúc chuẩn xác theo schema.
                  </p>
                </div>
              </div>
            </div>

            {/* Threshold sliders */}
            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Ngưỡng Tin cậy Tối thiểu (Confidence Gate)</span>
                  <span className="font-mono font-bold text-blue-600">{Math.round(settings.confidenceThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={settings.confidenceThreshold}
                  onChange={e => setSettings({ ...settings, confidenceThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
                <p className="text-[11px] text-slate-500">
                  Thông số có độ tin cậy dưới ngưỡng này sẽ được đánh dấu vàng để kỹ sư kiểm tra thủ công.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800">Ngưỡng Đầy đủ Thiết bị (Completeness Gate)</span>
                  <span className="font-mono font-bold text-blue-600">{Math.round(settings.qualityThreshold * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="0.95"
                  step="0.05"
                  value={settings.qualityThreshold}
                  onChange={e => setSettings({ ...settings, qualityThreshold: parseFloat(e.target.value) })}
                  className="w-full accent-blue-600"
                />
                <p className="text-[11px] text-slate-500">
                  Tỷ lệ các trường bắt buộc (Voc, Isc, Pmax, Efficiency) phải được trích xuất thành công.
                </p>
              </div>
            </div>

            {/* Save AI settings action */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleSaveAISettings()}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Đang lưu...' : 'Lưu Cài đặt Đường ống AI'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: DATABASE & CABLE / CONDUIT LIBRARIES */}
      {activeSubTab === 'database' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Database className="w-4 h-4 text-blue-600" />
                <span>Cơ sở Dữ liệu Kỹ thuật đã Tích hợp (Preloaded Engineering Master)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Toàn bộ thông số cáp Kyokuto, ống luồn ISIJP và thư viện thiết bị đã được chuẩn hóa phục vụ tính toán tự động.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Cable className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Cáp Điện Kyokuto (極東電線)</div>
                  <div className="text-2xl font-bold font-mono text-blue-600 mt-1">28 Loại</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Cáp 600V CVT/CV, 6600V CVT, 1500V DC Solar cable. Tiết diện 3.5mm² đến 500mm².
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab?.('cables')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <span>Xem Bảng cáp Kyokuto</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Ống Luồn ISIJP (配管選定)</div>
                  <div className="text-2xl font-bold font-mono text-indigo-600 mt-1">42 Kích thước</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Ống thép mạ kẽm (E19-E75, G16-G104), ống nhựa cứng VE, ống gân FEP ngầm.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab?.('quick-engineering')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Mở Máy tính Ống luồn</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-xs">Thư viện Thiết bị (Equipment Library)</div>
                  <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">24 Thiết bị</div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Sungrow, Huawei, Trina Solar, LONGi, Hitachi Energy, TMEIC, ABB.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToTab?.('library')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 flex items-center space-x-1"
                >
                  <span>Mở Kho Thiết bị</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Diagnostics and sync */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                Cơ sở dữ liệu hoạt động ở chế độ in-memory siêu tốc kết hợp bộ đệm lưu trữ cục bộ.
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenDiagnostics}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1.5 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Chạy Chẩn đoán Hệ thống (Diagnostics)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 4: CURRENCY & BOQ LOCALIZATION */}
      {activeSubTab === 'localization' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-blue-600" />
                <span>Tiền tệ &amp; Tỷ giá Quy đổi BOQ (Commercial Pricing &amp; Currency)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Cấu hình tiền tệ hiển thị chính và tỷ giá chuyển đổi phục vụ dự toán báo giá thiết bị nhập khẩu.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Đơn vị tiền tệ chính (Primary Currency)
                </label>
                <select
                  value={engineeringConfig.primaryCurrency}
                  onChange={e => setEngineeringConfig({ ...engineeringConfig, primaryCurrency: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="JPY">¥ JPY - Đồng Yên Nhật (Tiêu chuẩn dự án Nhật)</option>
                  <option value="USD">$ USD - Đô la Mỹ (Mua sắm Module &amp; BESS Quốc tế)</option>
                  <option value="VND">₫ VND - Việt Nam Đồng (Nhân công &amp; Cáp nội địa)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Đơn vị này sẽ xuất hiện trên bảng báo giá và file xuất Excel BOQ.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Tỷ giá 1 USD = ? JPY
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={engineeringConfig.jpyToUsdRate}
                  onChange={e => setEngineeringConfig({ ...engineeringConfig, jpyToUsdRate: parseFloat(e.target.value) || 152 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500">
                  Áp dụng khi chuyển đổi giá Pin mặt trời &amp; Container BESS quốc tế sang Yên.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Tỷ giá 1 JPY = ? VND
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={engineeringConfig.jpyToVndRate}
                  onChange={e => setEngineeringConfig({ ...engineeringConfig, jpyToVndRate: parseFloat(e.target.value) || 165 })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500">
                  Áp dụng đối chiếu ngân sách thi công và nhân công kỹ thuật.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={handleSaveEngineeringConfig}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-xs flex items-center space-x-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Đang lưu...' : 'Lưu Cấu hình Tiền tệ'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
