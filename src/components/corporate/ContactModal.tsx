import React, { useState } from 'react';
import { Mail, Phone, Building2, Send, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { modalBackdropVariants, modalCardVariants } from '../../utils/motionConfig';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: string;
}

export const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'technical_consulting'
}) => {
  const [formData, setFormData] = useState({
    type: defaultType,
    company: '',
    department: '',
    name: '',
    email: '',
    phone: '',
    interest: 'solar_and_bess',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('お名前、メールアドレス、お問い合わせ内容は必須項目です。');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await res.json();
      }

      if (!res.ok || !data) {
        throw new Error(data?.error || data?.message || 'サーバーが一時的に応答していません。数秒後に再度お試しください。');
      }

      setSubmitResult(data);
    } catch (err: any) {
      setErrorMessage(err.message || '送信中にエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans"
          onClick={onClose}
        >
          <motion.div 
            variants={modalCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

        {submitResult ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              お問い合わせを受け付けました
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              {submitResult.message}
            </p>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md inline-block text-xs font-mono text-slate-700">
              受付番号: <span className="font-bold text-[#003366]">{submitResult.inquiryId}</span>
            </div>
            <div className="pt-4">
              <button
                onClick={() => {
                  setSubmitResult(null);
                  onClose();
                }}
                className="px-6 py-2.5 bg-[#003366] text-white text-xs font-bold rounded-md hover:bg-[#002244]"
              >
                閉じる
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-xl font-bold text-slate-900">
                お問い合わせ・見積・資料請求
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                太陽光発電・系統用蓄電池の技術相談、機器見積もり、カタログ請求を承ります。
              </p>
            </div>

            {/* Direct Contact Card */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-[#002b49]">
                  <Phone className="w-3.5 h-3.5 text-[#f97316]" />
                  <span>
                    お電話:{' '}
                    <a href="tel:07089821052" className="hover:underline font-mono text-amber-700">
                      070-8982-1052
                    </a>{' '}
                    （平日 9:00〜18:00）
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-[#0284c7]" />
                  <a href="mailto:hoanganhtuan.solnexa@gmail.com" className="font-mono hover:underline">
                    hoanganhtuan.solnexa@gmail.com
                  </a>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                本社: 〒116-0002 東京都荒川区荒川5-6-7 302号
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  お問い合わせ種別 <span className="text-rose-600">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366] font-semibold text-slate-900"
                >
                  <option value="design_quotation">⚡【特化】太陽光・系統用蓄電池の基本設計・単線結線図(SLD)・見積作成依頼 (Báo giá thiết kế)</option>
                  <option value="technical_consulting">太陽光・蓄電池の設計・技術相談</option>
                  <option value="bess_project">特別高圧・系統用蓄電所の導入検討</option>
                  <option value="solar_epc">産業用太陽光・自家消費PPAの計画相談</option>
                  <option value="equipment_quotation">モジュール・PCS・蓄電コンテナの機器見積もり</option>
                  <option value="catalog_request">技術ハンドブック・カタログ資料請求</option>
                  <option value="partnership">EPC・アライアンス協業について</option>
                </select>
              </div>

              {formData.type === 'design_quotation' && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg space-y-1.5 animate-in fade-in duration-150">
                  <div className="flex items-center gap-1.5 font-bold text-[#b51420]">
                    <span>⚡ 太陽光・BESS設計・概算見積もり専門窓口</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    特別高圧（66kV/22kV）受変電設計、系統連系協議事前シミュレーション、単線結線図（SLD）作成、JIS C 3605ケーブル電圧降下計算、および液冷式蓄電コンテナの最適容量算定を承ります。下記フォームに計画概要をご記入ください。
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">貴社名 / 法人名</label>
                  <input
                    type="text"
                    placeholder="例: 株式会社エナジー開発"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">部署・役職</label>
                  <input
                    type="text"
                    placeholder="例: 再生可能エネルギー推進室"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    お名前 <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="例: 山田 太郎"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    placeholder="例: 03-1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  メールアドレス <span className="text-rose-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="例: t.yamada@energy-dev.co.jp"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  お問い合わせ内容・計画規模・対象エリア <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="例: 東北エリアにおいて出力20MWの系統用蓄電池案件を検討しております。消防法適合コンテナの仕様および連系スキッドの見積もりをお願いします。"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md focus:outline-hidden focus:border-[#003366]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-md hover:bg-slate-200"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-md flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>送信中...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>送信する</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
