import React from 'react';
import { 
  Palette, 
  Edit3, 
  Plus, 
  Save, 
  Check, 
  ShieldCheck, 
  Eye, 
  EyeOff,
  Sparkles,
  RotateCcw
} from 'lucide-react';

interface AdminEditFloatingBarProps {
  isAdmin: boolean;
  adminName: string;
  isInlineEditActive: boolean;
  onToggleInlineEdit: () => void;
  onOpenCustomizer: () => void;
  onQuickAddButton: () => void;
  onSaveConfig: () => void;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
}

export const AdminEditFloatingBar: React.FC<AdminEditFloatingBarProps> = ({
  isAdmin,
  adminName,
  isInlineEditActive,
  onToggleInlineEdit,
  onOpenCustomizer,
  onQuickAddButton,
  onSaveConfig,
  isSaving,
  hasUnsavedChanges
}) => {
  if (!isAdmin) return null;

  return (
    <aside 
      aria-label="Thanh công cụ quản trị trực tiếp"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 p-2 bg-[#001c30]/95 text-white rounded-2xl shadow-2xl border border-blue-500/40 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300 font-sans max-w-[95vw] overflow-x-auto"
    >
      {/* Admin Identity Badge */}
      <div className="flex items-center gap-2 pl-2 pr-3 py-1 bg-white/10 rounded-xl border border-white/10 shrink-0">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        <div className="flex flex-col text-left leading-tight">
          <span className="text-[10px] font-bold text-amber-300 font-mono flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            ADMIN LIVE CMS
          </span>
          <span className="text-[11px] font-extrabold text-white truncate max-w-[130px]">
            {adminName || 'Hoàng Anh Tuấn'}
          </span>
        </div>
      </div>

      {/* 1. Toggle Direct Inline Edit Mode */}
      <button
        onClick={onToggleInlineEdit}
        className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs ${
          isInlineEditActive
            ? 'bg-amber-400 text-slate-950 font-extrabold ring-2 ring-amber-300 shadow-md'
            : 'bg-white/10 hover:bg-white/20 text-slate-200'
        }`}
        title="Bật tính năng nhấp chuột sửa trực tiếp mọi dòng chữ trên màn hình"
      >
        <Edit3 className="w-3.5 h-3.5" />
        <span>{isInlineEditActive ? 'Chế độ Sửa trực tiếp: BẬT' : 'Sửa chữ trực tiếp'}</span>
      </button>

      {/* 2. Open Visual Customizer (Theme, Background, Font, Colors) */}
      <button
        onClick={onOpenCustomizer}
        className="px-3.5 py-2 bg-[#d81a28] hover:bg-[#b51420] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-md hover:scale-[1.02] active:scale-[0.98]"
        title="Mở bảng chọn ảnh nền sáng Solar Frontier, đổi màu sắc & font chữ"
      >
        <Palette className="w-3.5 h-3.5 text-amber-300" />
        <span>Đổi Ảnh Nền &amp; Giao Diện</span>
      </button>

      {/* 3. Quick Add CTA Button */}
      <button
        onClick={onQuickAddButton}
        className="px-3 py-2 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
        title="Thêm nút bấm mới vào Hero"
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Thêm nút CTA</span>
      </button>

      {/* 4. Save Changes to Server */}
      <button
        onClick={onSaveConfig}
        disabled={isSaving}
        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 disabled:opacity-50 ${
          hasUnsavedChanges
            ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-300 animate-pulse'
            : 'bg-white/15 hover:bg-white/25 text-white'
        }`}
        title="Lưu tất cả thay đổi lên máy chủ để áp dụng vĩnh viễn"
      >
        <Save className="w-3.5 h-3.5" />
        <span>{isSaving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
      </button>
    </aside>
  );
};
