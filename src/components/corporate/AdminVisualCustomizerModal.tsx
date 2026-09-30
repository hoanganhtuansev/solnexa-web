import React, { useState } from 'react';
import { 
  X, 
  Palette, 
  Image as ImageIcon, 
  Type, 
  MousePointerClick, 
  BarChart2, 
  Check, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Eye, 
  Sun, 
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Save,
  CheckCircle2,
  FileText,
  Layers
} from 'lucide-react';
import { SiteConfig, SiteButtonConfig } from '../../types/siteConfig';
import { BG_IMAGE_PRESETS, DEFAULT_SITE_CONFIG } from '../../utils/siteConfigDefaults';

interface AdminVisualCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SiteConfig;
  onChangeConfig: (newConfig: SiteConfig) => void;
  onSaveToServer: () => Promise<void>;
  onResetToDefault: () => void;
  onOpenArticleEditor?: (type: 'article' | 'news') => void;
}

export const AdminVisualCustomizerModal: React.FC<AdminVisualCustomizerModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  onSaveToServer,
  onResetToDefault,
  onOpenArticleEditor
}) => {
  const [activeTab, setActiveTab] = useState<'background' | 'typography' | 'buttons' | 'metrics' | 'articles'>('background');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const updateHero = (partial: Partial<SiteConfig['hero']>) => {
    onChangeConfig({
      ...config,
      hero: {
        ...config.hero,
        ...partial
      }
    });
  };

  const updateTheme = (partial: Partial<SiteConfig['theme']>) => {
    onChangeConfig({
      ...config,
      theme: {
        ...config.theme,
        ...partial
      }
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      await onSaveToServer();
      setSaveSuccessMsg('Đã lưu cấu hình trực tiếp vào máy chủ thành công!');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch {
      setSaveSuccessMsg('Lưu cục bộ hoàn tất (đã ghi nhớ trên trình duyệt).');
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Button management helpers
  const handleAddButton = () => {
    const newBtn: SiteButtonConfig = {
      id: `btn-${Date.now().toString(36)}`,
      label: 'Liên hệ tư vấn dự án',
      target: 'contact',
      style: 'primary-red',
      icon: 'arrow',
      visible: true
    };
    updateHero({
      buttons: [...config.hero.buttons, newBtn]
    });
  };

  const handleUpdateButton = (id: string, partial: Partial<SiteButtonConfig>) => {
    updateHero({
      buttons: config.hero.buttons.map(b => (b.id === id ? { ...b, ...partial } : b))
    });
  };

  const handleDeleteButton = (id: string) => {
    updateHero({
      buttons: config.hero.buttons.filter(b => b.id !== id)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200 font-sans">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#002b49] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-none">
                  Trình Tùy Biến Giao Diện Trực Quan (Admin Visual Studio)
                </h3>
                <span className="text-[10px] font-mono bg-red-600 px-1.5 py-0.5 rounded font-extrabold uppercase tracking-tight">
                  Live Editor
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-1">
                Tùy chỉnh ảnh nền sáng kiểu Solar Frontier, màu sắc, font chữ, thêm nút CTA &amp; văn bản
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3.5 py-1.5 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu & Xuất bản'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 shrink-0 overflow-x-auto">
          {[
            { id: 'background', label: '1. Ảnh Nền & Ánh Sáng (Hero Photo)', icon: ImageIcon },
            { id: 'typography', label: '2. Tiêu Đề, Màu Sắc & Font Chữ', icon: Type },
            { id: 'buttons', label: `3. Nút Kêu Gọi Hành Động (${config.hero.buttons.length})`, icon: MousePointerClick },
            { id: 'metrics', label: '4. Số Liệu Doanh Nghiệp (Metrics)', icon: BarChart2 },
            { id: 'articles', label: '5. Sửa Nội Dung Bài Viết & Tin Tức', icon: FileText },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-xs font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#d81a28] text-[#002b49] bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#d81a28]' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Notification Banner */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2 text-xs text-emerald-800 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: BACKGROUND & LIGHTING */}
          {activeTab === 'background' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Reference Style Guidance */}
              <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex items-start gap-3">
                <Sun className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <div className="text-xs text-sky-900 leading-relaxed">
                  <strong className="font-bold">Phong cách Solar Frontier (Sáng &amp; Kiến Trúc Tự Nhiên):</strong> Khác với các trang web tối màu nặng nề, Solar Frontier sử dụng ảnh chụp góc rộng cánh đồng pin mặt trời rực rỡ dưới nắng ban ngày, bầu trời trong xanh, chữ đậm sắc nét tương phản cao trên nền sáng nhẹ.
                </div>
              </div>

              {/* Preset Background Cards */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Chọn ảnh nền kiến trúc tươi sáng có sẵn:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {BG_IMAGE_PRESETS.map((preset) => {
                    const isSelected = config.hero.bgImage === preset.url;
                    return (
                      <div
                        key={preset.id}
                        onClick={() => {
                          updateHero({ 
                            bgImage: preset.url,
                            textColor: 'dark',
                            overlayType: 'light-clean'
                          });
                          updateTheme({ heroTheme: preset.recommendedTheme });
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 cursor-pointer transition-all hover:shadow-md ${
                          isSelected
                            ? 'border-[#d81a28] ring-2 ring-[#d81a28]/30 shadow-md'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="h-28 overflow-hidden bg-slate-100 relative">
                          <img
                            src={preset.url}
                            alt={preset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d81a28] text-white flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="absolute bottom-2 left-2 text-[10px] font-mono px-1.5 py-0.5 bg-black/60 text-white rounded backdrop-blur-xs">
                            {preset.category}
                          </span>
                        </div>
                        <div className="p-2.5 bg-white">
                          <p className="text-xs font-bold text-slate-900 truncate">{preset.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{preset.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Custom Image URL Input */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800">
                  Hoặc nhập đường dẫn ảnh nền tùy chỉnh (URL ảnh độ phân giải cao):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={config.hero.bgImage}
                    onChange={(e) => updateHero({ bgImage: e.target.value })}
                    className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28] font-mono"
                  />
                  <button
                    onClick={() => updateHero({ bgImage: DEFAULT_SITE_CONFIG.hero.bgImage })}
                    className="px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap cursor-pointer"
                  >
                    Về mặc định
                  </button>
                </div>
              </div>

              {/* Lighting Tone & Overlay Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Phong cách phủ màu nền (Overlay Tone):
                  </label>
                  <select
                    value={config.hero.overlayType}
                    onChange={(e) => updateHero({ overlayType: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28]"
                  >
                    <option value="light-clean">Sáng Tự Nhiên &amp; Trong Trẻo (Solar Frontier White)</option>
                    <option value="airy-gradient">Gradient Bầu Trời Xanh Nhẹ (Airy Sky Blue)</option>
                    <option value="subtle-glass">Phủ Kính Mờ Tối Giản (Subtle Light Glass)</option>
                    <option value="cinematic-dark">Nền Tối Điện Ảnh (Cinematic Navy Dark)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1.5">
                    Màu chữ chính trên ảnh nền (Text Contrast):
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => updateHero({ textColor: 'dark' })}
                      className={`p-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                        config.hero.textColor === 'dark'
                          ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>Chữ Đậm (Nền Sáng)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => updateHero({ textColor: 'light' })}
                      className={`p-2 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 cursor-pointer ${
                        config.hero.textColor === 'light'
                          ? 'bg-slate-900 text-white border-slate-900 ring-2 ring-slate-400'
                          : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>Chữ Trắng (Nền Tối)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Overlay Opacity & Brightness Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Độ mờ lớp phủ đọc chữ:</span>
                    <span className="font-mono font-bold text-[#d81a28]">
                      {Math.round(config.hero.overlayOpacity * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="0.6"
                    step="0.02"
                    value={config.hero.overlayOpacity}
                    onChange={(e) => updateHero({ overlayOpacity: parseFloat(e.target.value) })}
                    className="w-full accent-[#d81a28]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>0% (Sáng trong veo)</span>
                    <span>15% (Chuẩn Solar)</span>
                    <span>50% (Đậm hơn)</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Độ sáng ảnh nền (Brightness):</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {Math.round((config.hero.bgBrightness || 1.0) * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.35"
                    step="0.05"
                    value={config.hero.bgBrightness || 1.0}
                    onChange={(e) => updateHero({ bgBrightness: parseFloat(e.target.value) })}
                    className="w-full accent-emerald-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>80% (Dịu nhẹ)</span>
                    <span>105% (Nắng rực rỡ)</span>
                    <span>135% (Rất sáng)</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TYPOGRAPHY, COLORS & HEADINGS */}
          {activeTab === 'typography' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Primary Brand Accent Colors */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#d81a28]" />
                    <span>Màu sắc chủ đạo thương hiệu (Brand Accent Color):</span>
                  </label>
                  <span className="text-[11px] font-mono font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-300">
                    {config.theme.primaryAccent}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {[
                    { color: '#d81a28', name: 'Đỏ Năng Lượng', desc: 'Solar Red' },
                    { color: '#002b49', name: 'Xanh Navy Đậm', desc: 'Deep Navy' },
                    { color: '#f59e0b', name: 'Vàng Ánh Dương', desc: 'Solar Amber' },
                    { color: '#0284c7', name: 'Xanh Trời Ban Ngày', desc: 'Daylight Blue' },
                    { color: '#10b981', name: 'Xanh Tái Tạo', desc: 'Clean Emerald' },
                    { color: '#6366f1', name: 'Chàm Kỹ Thuật', desc: 'Tech Indigo' },
                  ].map(item => (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => updateTheme({ primaryAccent: item.color })}
                      className={`p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        config.theme.primaryAccent === item.color
                          ? 'border-slate-900 ring-2 ring-slate-900 bg-white shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="w-4 h-4 rounded-full shadow-xs shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-[10px] font-bold text-slate-900 truncate">{item.name}</span>
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Family & Typography Scale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Kiểu Font chữ toàn trang (Font Family):
                  </label>
                  <select
                    value={config.theme.fontFamily}
                    onChange={(e) => updateTheme({ fontFamily: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28]"
                  >
                    <option value="noto">Noto Sans JP (Chuẩn Kỹ Thuật &amp; Năng Lượng Nhật Bản)</option>
                    <option value="inter">Inter (Hiện Đại / Chuẩn Giao Diện Quốc Tế)</option>
                    <option value="zen">Zen Kaku Gothic (Tối Giản, Cực Kỳ Sắc Nét)</option>
                    <option value="jakarta">Plus Jakarta Sans (Đẳng Cấp Công Nghệ Cao)</option>
                    <option value="serif">Shippori Mincho / Serif (Phong Cách Tạp Chí Sang Trọng)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tỷ lệ cỡ chữ tiêu đề (Heading Size Scale):
                  </label>
                  <select
                    value={config.theme.fontSizeScale}
                    onChange={(e) => updateTheme({ fontSizeScale: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28]"
                  >
                    <option value="normal">Tiêu chuẩn (Standard Clean)</option>
                    <option value="large">Lớn (Editorial Large - Phong cách Solar Frontier)</option>
                    <option value="compact">Gọn gàng (Compact Engineering)</option>
                  </select>
                </div>
              </div>

              {/* Title Lines */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tiêu đề lớn Hero (3 Dòng tạo nhịp điệu mỹ thuật):
                </label>
                
                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">Dòng tiêu đề 1:</span>
                  <input
                    type="text"
                    value={config.hero.titleLine1}
                    onChange={(e) => updateHero({ titleLine1: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28] font-bold"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">Dòng tiêu đề 2 (Màu nhấn gradient):</span>
                  <input
                    type="text"
                    value={config.hero.titleLine2}
                    onChange={(e) => updateHero({ titleLine2: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28] font-bold text-[#d81a28]"
                  />
                </div>

                <div>
                  <span className="text-[11px] text-slate-500 block mb-0.5">Dòng tiêu đề 3 (Kết thúc câu):</span>
                  <input
                    type="text"
                    value={config.hero.titleLine3}
                    onChange={(e) => updateHero({ titleLine3: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28] font-bold"
                  />
                </div>
              </div>

              {/* Subtitle & Slogan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Phụ đề tiếng Nhật (Japanese Subtitle):
                  </label>
                  <input
                    type="text"
                    value={config.hero.jpSubtitle}
                    onChange={(e) => updateHero({ jpSubtitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Khẩu hiệu thương hiệu (Slogan):
                  </label>
                  <input
                    type="text"
                    value={config.hero.tagline}
                    onChange={(e) => updateHero({ tagline: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28] font-mono font-bold"
                  />
                </div>
              </div>

              {/* Description Body */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Đoạn văn mô tả doanh nghiệp (Hero Description):
                </label>
                <textarea
                  rows={3}
                  value={config.hero.description}
                  onChange={(e) => updateHero({ description: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28] leading-relaxed"
                />
              </div>

              {/* Accent Badge text */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nhãn thông tin tiêu chuẩn &amp; pháp lý (Eyebrow Badge):
                </label>
                <input
                  type="text"
                  value={config.hero.accentBadge}
                  onChange={(e) => updateHero({ accentBadge: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#d81a28]"
                />
              </div>

            </div>
          )}

          {/* TAB 3: CTA BUTTONS */}
          {activeTab === 'buttons' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Danh Sách Nút Kêu Gọi Hành Động (CTA Buttons)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Thêm, đổi tên, thay đổi màu sắc và trang chuyển tiếp của các nút bấm trên Hero
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddButton}
                  className="px-3 py-1.5 bg-[#002b49] hover:bg-[#001c30] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Thêm nút mới</span>
                </button>
              </div>

              <div className="space-y-3">
                {config.hero.buttons.map((btn, idx) => (
                  <div
                    key={btn.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#002b49] text-white text-[11px] font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-800">{btn.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={btn.visible}
                            onChange={(e) => handleUpdateButton(btn.id, { visible: e.target.checked })}
                            className="rounded text-[#d81a28]"
                          />
                          <span>Hiển thị</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleDeleteButton(btn.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Xóa nút"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Nội dung nhãn nút:
                        </label>
                        <input
                          type="text"
                          value={btn.label}
                          onChange={(e) => handleUpdateButton(btn.id, { label: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28] font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Màu sắc &amp; Kiểu dáng nút:
                        </label>
                        <select
                          value={btn.style}
                          onChange={(e) => handleUpdateButton(btn.id, { style: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28]"
                        >
                          <option value="primary-red">Đỏ Nổi Bật (#D81A28 Solar Red)</option>
                          <option value="deep-navy">Xanh Navy Đậm (#002B49 Deep Navy)</option>
                          <option value="accent-amber">Vàng Năng Lượng (#F59E0B Solar Amber)</option>
                          <option value="outline">Viền Tinh Tế (Outline Border)</option>
                          <option value="ghost">Nút Trong Suốt (Ghost Button)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Trang đích chuyển tiếp:
                        </label>
                        <select
                          value={btn.target}
                          onChange={(e) => handleUpdateButton(btn.id, { target: e.target.value as any })}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28]"
                        >
                          <option value="solutions">Giải pháp Doanh nghiệp (Solutions)</option>
                          <option value="tools">Bộ công cụ Thiết kế Kỹ thuật (PRO Tools)</option>
                          <option value="ai-advisor">AI Tư Vấn Kỹ Thuật (AI Advisor)</option>
                          <option value="knowledge">Thư viện Kiến thức (Knowledge)</option>
                          <option value="products">Danh mục Thiết bị (Products)</option>
                          <option value="projects">Dự án Đã Triển Khai (Projects)</option>
                          <option value="contact">Mở Hộp Thoại Báo Giá (Contact Modal)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: METRICS */}
          {activeTab === 'metrics' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Chỉnh Sửa 4 Cột Chỉ Số Uy Tín (Key Statistics)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Các con số định lượng thể hiện năng lực kỹ thuật và quy mô dự án đã hoàn thành
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.hero.metrics.map((m, idx) => (
                  <div key={m.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] font-mono text-slate-400 block">Chỉ số 0{idx + 1}</span>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tiêu đề chỉ số:</label>
                      <input
                        type="text"
                        value={m.label}
                        onChange={(e) => {
                          const updated = [...config.hero.metrics];
                          updated[idx] = { ...updated[idx], label: e.target.value };
                          updateHero({ metrics: updated });
                        }}
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28] font-bold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Giá trị số:</label>
                        <input
                          type="text"
                          value={m.value}
                          onChange={(e) => {
                            const updated = [...config.hero.metrics];
                            updated[idx] = { ...updated[idx], value: e.target.value };
                            updateHero({ metrics: updated });
                          }}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28] font-mono font-bold text-[#d81a28]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Đơn vị (Unit):</label>
                        <input
                          type="text"
                          value={m.unit}
                          onChange={(e) => {
                            const updated = [...config.hero.metrics];
                            updated[idx] = { ...updated[idx], unit: e.target.value };
                            updateHero({ metrics: updated });
                          }}
                          className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28] font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Chú thích chi tiết:</label>
                      <input
                        type="text"
                        value={m.sub}
                        onChange={(e) => {
                          const updated = [...config.hero.metrics];
                          updated[idx] = { ...updated[idx], sub: e.target.value };
                          updateHero({ metrics: updated });
                        }}
                        className="w-full px-2.5 py-1 text-[11px] bg-white border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ARTICLES & NEWS MANAGEMENT */}
          {activeTab === 'articles' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#d81a28]" />
                    <span>Quản Lý &amp; Chỉnh Sửa Bài Viết, Tin Tức (Articles &amp; News)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Thêm bài viết mới, chỉnh sửa nội dung thông cáo báo chí, chính sách pháp luật và nghiên cứu kỹ thuật
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-red-50 text-[#d81a28] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Bản Tin / Thông Cáo Báo Chí (News &amp; Announcements)</h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Đăng tải và chỉnh sửa các bài tin tức về chính sách JPEA, METI, dự án BESS mới, và thông cáo báo chí.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenArticleEditor?.('news');
                    }}
                    className="w-full py-2 bg-[#d81a28] hover:bg-[#b51420] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Viết bản tin / thông cáo mới</span>
                  </button>
                </div>

                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 hover:border-slate-300 shadow-xs">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#002b49] flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">Bài Viết Kỹ Thuật Chuyên Sâu (Technical Knowledge)</h5>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Biên tập các cẩm nang thiết kế điện, tiêu chuẩn JIS C 8955, phòng cháy chữa cháy BESS và tối ưu FIP.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenArticleEditor?.('article');
                    }}
                    className="w-full py-2 bg-[#002b49] hover:bg-[#001d32] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Viết bài nghiên cứu kỹ thuật</span>
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold">Mẹo chỉnh sửa nhanh trực tiếp:</strong> Bạn cũng có thể di chuột vào bất kỳ bài viết nào trong mục <strong>新着情報 (Tin tức)</strong> hoặc <strong>ピックアップ (Pick up)</strong> ngay trên giao diện chính và nhấp vào nút <strong>[✏️ Sửa bài viết]</strong> để sửa trực tiếp tiêu đề, tóm tắt và nội dung!
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onResetToDefault}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục chuẩn Solar Frontier gốc</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 text-xs font-bold text-white bg-[#d81a28] hover:bg-[#b51420] rounded-lg shadow-md flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Đang lưu...' : 'Lưu & Áp Dụng Ngay'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
