import React, { useState, useEffect } from 'react';
import { Edit2, Check, X } from 'lucide-react';

interface InlineEditableTextProps {
  value: string;
  onSave: (newVal: string) => void;
  isEditMode: boolean;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div';
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  label?: string;
}

export const InlineEditableText: React.FC<InlineEditableTextProps> = ({
  value,
  onSave,
  isEditMode,
  as: Component = 'span',
  className = '',
  multiline = false,
  placeholder = 'Nhấp để chỉnh sửa nội dung...',
  label
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const handleSave = (e?: React.FormEvent) => {
    e?.stopPropagation();
    onSave(draft);
    setIsEditing(false);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDraft(value);
    setIsEditing(false);
  };

  if (!isEditMode) {
    return <Component className={className}>{value || placeholder}</Component>;
  }

  if (isEditing) {
    return (
      <div 
        onClick={(e) => e.stopPropagation()} 
        className="relative z-30 inline-block w-full max-w-full my-1 p-2 bg-white rounded-lg shadow-xl border-2 border-[#d81a28] animate-in fade-in duration-150"
      >
        {label && (
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {label}
          </div>
        )}
        {multiline ? (
          <textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full p-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28] font-sans"
            placeholder={placeholder}
          />
        ) : (
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="w-full p-2 text-xs sm:text-sm text-slate-900 bg-slate-50 border border-slate-300 rounded focus:outline-hidden focus:border-[#d81a28] font-sans"
            placeholder={placeholder}
          />
        )}
        <div className="flex items-center justify-end gap-1.5 mt-2">
          <button
            type="button"
            onClick={handleCancel}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Hủy</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 text-[11px] font-bold text-white bg-[#d81a28] hover:bg-[#b51420] rounded flex items-center gap-1 shadow-xs cursor-pointer"
          >
            <Check className="w-3 h-3" />
            <span>Lưu thay đổi</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <Component
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      title="Nhấp chuột để chỉnh sửa trực tiếp"
      className={`${className} group/editable relative cursor-pointer outline-dashed outline-1 outline-amber-400/70 hover:outline-2 hover:outline-[#d81a28] hover:bg-amber-400/10 rounded px-1 transition-all inline-block`}
    >
      {value || <span className="opacity-50 italic">{placeholder}</span>}
      <span className="hidden group-hover/editable:inline-flex items-center gap-0.5 ml-1.5 px-1 py-0.2 bg-[#d81a28] text-white text-[9px] font-bold rounded shadow-xs align-middle">
        <Edit2 className="w-2.5 h-2.5" />
        <span>Sửa</span>
      </span>
    </Component>
  );
};
