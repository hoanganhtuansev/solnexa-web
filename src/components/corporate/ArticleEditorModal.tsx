import React, { useState, useEffect } from 'react';
import { Edit3, Plus, X, Save, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export interface ArticleData {
  id: string;
  category: string;
  title: string;
  author: string;
  readTime: string;
  date?: string;
  summary?: string;
  content?: string;
  sections?: Array<{ heading: string; content: string }>;
  isHot?: boolean;
}

export interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (article: ArticleData) => void;
  targetType?: 'article' | 'news';
  initialData?: ArticleData | null;
  mode?: 'create' | 'edit';
}

export const ArticleEditorModal: React.FC<ArticleEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  targetType = 'article',
  initialData = null,
  mode = 'create'
}) => {
  const isEditing = mode === 'edit' || Boolean(initialData?.id);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isHot, setIsHot] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCategory(initialData.category || '');
      setTitle(initialData.title || '');
      setAuthor(initialData.author || '');
      setReadTime(initialData.readTime || '所要時間 約8分');
      setSummary(initialData.summary || '');
      setContent(initialData.content || '');
      setIsHot(Boolean(initialData.isHot));
    } else {
      setCategory(targetType === 'article' ? '設計実務ガイド' : '政策・法令');
      setTitle('');
      setAuthor('株式会社ソルネクサ 技術設計部');
      setReadTime('所要時間 約8分');
      setSummary('');
      setContent('');
      setIsHot(false);
    }
    setErrorMsg(null);
  }, [initialData, targetType, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('タイトルと内容は必須入力です。');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const endpoint = targetType === 'article' 
      ? (isEditing && initialData?.id ? `/api/articles/${initialData.id}` : '/api/articles')
      : (isEditing && initialData?.id ? `/api/news/${initialData.id}` : '/api/news');
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const payload = {
        category,
        title: title.trim(),
        author: author.trim(),
        readTime,
        summary: summary.trim(),
        content: content.trim(),
        isHot
      };

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '保存処理に失敗しました');
      }

      onSaveSuccess(data.article || data.news || payload);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || '記事保存中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative border border-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-800 rounded-lg">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                管理者専用 CMS エディタ
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {isEditing ? '記事・コンテンツの編集' : '新規コンテンツの作成・公開'}
              </h3>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 my-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                カテゴリ分類 <span className="text-rose-600">*</span>
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例: 設計実務ガイド / 政策・法令 / 系統連系技術"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                執筆者 / 担当部署
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="例: ソルネクサ 技術設計部"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              記事タイトル <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="記事の正確なタイトルを入力してください"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              概要・要約 (Summary)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="記事の要約を1〜2文で記述（一覧カードで表示されます）"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white leading-relaxed"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              本文・詳細解説コンテンツ <span className="text-rose-600">*</span>
            </label>
            <textarea
              rows={10}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="技術解説や通知の本文を詳細に記述してください。改行や項目箇条書きはそのまま反映されます。"
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:border-[#002b49] focus:bg-white font-mono text-xs leading-relaxed"
            />
          </div>

          {targetType === 'news' && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="isHotCheckbox"
                checked={isHot}
                onChange={(e) => setIsHot(e.target.checked)}
                className="w-4 h-4 text-[#E60012] rounded border-slate-300"
              />
              <label htmlFor="isHotCheckbox" className="text-slate-700 font-bold select-none cursor-pointer">
                「重要」バッジを付与する
              </label>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#E60012] hover:bg-[#c90010] active:scale-98 text-white font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>{isEditing ? '更新して公開する' : '新着記事として公開'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
