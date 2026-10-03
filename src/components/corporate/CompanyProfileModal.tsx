import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  ShieldCheck, 
  Award, 
  Users, 
  Calendar, 
  Coins, 
  FileText, 
  X, 
  ExternalLink,
  CheckCircle2,
  Zap,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { SolnexaLogo } from './SolnexaLogo';
import { 
  modalBackdropVariants, 
  modalCardVariants,
  reducedModalBackdropVariants,
  reducedModalCardVariants 
} from '../../utils/motionConfig';

interface CompanyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenContact?: () => void;
  onOpenDesignQuotation?: () => void;
}

export const CompanyProfileModal: React.FC<CompanyProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenContact,
  onOpenDesignQuotation
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'message' | 'qualifications' | 'access'>('overview');
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          variants={shouldReduceMotion ? reducedModalBackdropVariants : modalBackdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs font-sans"
          onClick={onClose}
        >
          <motion.div 
            variants={shouldReduceMotion ? reducedModalCardVariants : modalCardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="bg-[#002b49] text-white p-5 sm:p-6 flex items-center justify-between border-b border-blue-900 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest text-amber-300 uppercase font-bold">
                  CORPORATE PROFILE
                </span>
                <span className="text-slate-400 text-xs">|</span>
                <span className="text-xs text-slate-300">会社概要・企業情報</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight mt-0.5">
                株式会社ソルネクサ (SOLNEXA Japan Co., Ltd.)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/90 px-4 sm:px-6 overflow-x-auto shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#d81a28] text-[#002b49] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            会社概要・基本データ
          </button>
          <button
            onClick={() => setActiveTab('message')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'message'
                ? 'border-[#d81a28] text-[#002b49] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            代表メッセージ・理念
          </button>
          <button
            onClick={() => setActiveTab('qualifications')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'qualifications'
                ? 'border-[#d81a28] text-[#002b49] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            技術者体制・許認可
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`py-3 px-3 sm:px-4 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'access'
                ? 'border-[#d81a28] text-[#002b49] bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            所在地・アクセス
          </button>
        </div>

        {/* Tab Content (Scrollable) */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-700">
          
          {/* TAB 1: 会社概要 (Overview Table) */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#002b49]">企業基本情報</h3>
                  <p className="text-xs text-slate-500">特別高圧太陽光・系統用蓄電池（BESS）の総合エンジニアリング企業</p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>法人登記・電気工事業登録済</span>
                </div>
              </div>

              {/* Japanese Standard Corporate Specification Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs divide-y divide-slate-200 text-xs sm:text-sm">
                
                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>会社名</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 font-semibold bg-white">
                    株式会社ソルネクサ（英文表記: SOLNEXA Japan Co., Ltd.）
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <Users className="w-4 h-4 text-slate-400" />
                    <span>代表者</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white">
                    <span className="font-bold text-[#002b49]">代表取締役 / 最高技術責任者 (CTO)</span>
                    <span className="ml-2 font-bold">Hoàng Anh Tuấn</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>設立</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white">
                    2024年4月（創業 2021年）
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <Coins className="w-4 h-4 text-slate-400" />
                    <span>資本金</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 font-semibold bg-white">
                    5,000万円
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>本社所在地</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white">
                    〒116-0002 東京都荒川区荒川5-6-7 302号
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>連絡先</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white space-y-1">
                    <p>TEL: <a href="tel:07089821052" className="text-[#002b49] font-bold font-mono hover:underline">070-8982-1052</a>（代表・平日 9:00〜18:00）</p>
                    <p>E-mail: <a href="mailto:hoanganhtuan.solnexa@gmail.com" className="text-blue-600 underline font-mono">hoanganhtuan.solnexa@gmail.com</a></p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>事業内容</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white space-y-2">
                    <ul className="space-y-1.5 list-disc list-inside text-xs sm:text-[13px] text-slate-700 leading-relaxed">
                      <li>特別高圧・高圧 系統用大型蓄電システム（BESS）の基本設計、機器選定、調達支援</li>
                      <li>産業用メガソーラーおよび自家消費型コーポレートPPAの電気工学設計・単線結線図CAD作図</li>
                      <li>一般送配電事業者（全国10電力会社）との系統連系協議、保護継電器整定（OCR/DGR）、系統解析</li>
                      <li>経済産業省・産業保安監督部への電気事業法第48条に基づく工事計画届出書類の作成・認可支援</li>
                      <li>総務省消防庁告示第2号に基づく屋外蓄電池保有空地3m離隔基準・自治体事前協議の支援</li>
                      <li>再エネ特化型クラウドCAD＆電気計算プラットフォーム（SOLNEXA Engineering Suite）の開発・提供</li>
                    </ul>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <ShieldCheck className="w-4 h-4 text-slate-400" />
                    <span>許認可・登録</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white">
                    電気工事業登録・建設業許可（電気工事業、機械器具設置工事業）
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <Award className="w-4 h-4 text-slate-400" />
                    <span>加盟団体</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white">
                    一般社団法人 太陽光発電協会 (JPEA) 会員 ｜ 一般社団法人 日本蓄電池工業会 賛助会員
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 bg-slate-50/60">
                  <div className="sm:col-span-4 p-3.5 font-bold text-slate-700 flex items-center gap-2 bg-slate-100/70">
                    <Coins className="w-4 h-4 text-slate-400" />
                    <span>主要取引銀行</span>
                  </div>
                  <div className="sm:col-span-8 p-3.5 text-slate-900 bg-white">
                    三井住友銀行 ｜ 三菱UFJ銀行 ｜ みずほ銀行
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: 代表メッセージ・理念 (Message) */}
          {activeTab === 'message' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#d81a28] font-bold">
                  CORPORATE PHILOSOPHY
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-[#002b49] leading-tight">
                  SMARTER ENERGY. BRIGHTER TOMORROW.
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold">
                  再生可能エネルギーの主力電源化を、揺るぎない電気工学の力で実現する。
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  日本のエネルギー構造は現在、FIT制度からFIP制度への移行、電力系統の容量制約、出力制御（カーテイルメント）の頻発、そして系統用蓄電池（BESS）の普及加速という歴史的な転換期を迎えています。
                </p>
                <p>
                  この大変革期において、事業者に最も求められているのは、単なる設備機器の販売ではなく、<strong>「電力系統に確実に連系でき、消防法・電気事業法を厳格にクリアし、20年間にわたり安全・高効率に稼働し続ける確かな工学設計」</strong>です。
                </p>
                <p>
                  株式会社ソルネクサ（SOLNEXA）は、特別高圧66kVから高圧・低圧に至る受変電設備、保護継電器整定、そしてメガワット級の蓄電システムに精通した第一線エンジニアが集結し、お客様のプロジェクトを初期構想から系統連系承諾まで一貫支援してまいります。
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-end justify-between">
                <div>
                  <p className="text-xs text-slate-500">株式会社ソルネクサ</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">代表取締役 / 最高技術責任者 (CTO)</p>
                </div>
                <div className="text-right">
                  <span className="font-serif text-lg sm:text-xl font-black tracking-wider text-[#002b49]">
                    Hoàng Anh Tuấn
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 技術者体制・許認可 (Qualifications) */}
          {activeTab === 'qualifications' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <h3 className="text-base font-bold text-[#002b49] border-b border-slate-200 pb-2">
                エンジニア体制 &amp; 保有資格
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">電気主任技術者</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    第一種・第二種電気主任技術者が在籍。特別高圧66kV受電設備、特別高圧変電所、大規模系統用蓄電所の保安規程策定・届出に対応。
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">電気工事施工管理技士</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    1級電気工事施工管理技士が在籍。受変電設備据付、長距離高圧自営線工事、地中配線工事の施工監理を統括。
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-500" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">系統解析・保護協調エンジニア</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    一般送配電事業者との事前協議、保護継電器（OCR/DGR/OVR/UVR/RPR）整定計算、短絡・地絡事故解析に特化した技術チーム。
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">消防法・安全法規エキスパート</h4>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    総務省消防庁告示第2号の蓄電池保有空地3m基準、消火設備、消防本部との事前協議・現地立会審査を専門支援。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 所在地・アクセス (Access) */}
          {activeTab === 'access' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold text-[#002b49]">本社所在地 &amp; 交通案内</h3>
                <p className="text-xs text-slate-500">東京都荒川区本社オフィス</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-4 text-xs sm:text-sm">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-[#d81a28]" />
                      <span>東京本社</span>
                    </p>
                    <p className="text-slate-700">
                      〒116-0002 東京都荒川区荒川5-6-7 302号
                    </p>
                    <p className="text-slate-600 pt-1">
                      TEL: 070-8982-1052 ｜ E-mail: hoanganhtuan.solnexa@gmail.com
                    </p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold text-slate-900">最寄り駅からのアクセス:</h4>
                    <ul className="space-y-1 text-slate-600 list-disc list-inside">
                      <li>東京メトロ千代田線・京成電鉄<strong>「町屋駅」</strong>より徒歩6分</li>
                      <li>都電荒川線（東京さくらトラム）<strong>「荒川七丁目駅」</strong>より徒歩3分</li>
                      <li>都営バス「荒川五丁目」停留所すぐ</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-100 rounded-xl border border-slate-200 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
                  <MapPin className="w-8 h-8 text-[#002b49]" />
                  <p className="text-xs font-bold text-slate-800">
                    株式会社ソルネクサ 東京本社
                  </p>
                  <p className="text-[11px] text-slate-500">
                    ご来社での設計打ち合わせ・技術相談も随時承っております。（※事前予約制）
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      if (onOpenContact) onOpenContact();
                    }}
                    className="px-4 py-2 bg-[#002b49] hover:bg-[#001c30] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                  >
                    ご来社・オンライン相談を予約する
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Action Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-mono font-bold text-[#002b49]">SOLNEXA Japan</span>
            <span>·</span>
            <span>エンジニアリングパートナーシップ随時受付中</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                if (onOpenDesignQuotation) onOpenDesignQuotation();
                else if (onOpenContact) onOpenContact();
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#d81a28] to-[#e65100] text-white text-xs font-black rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer hover:brightness-105"
            >
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>設計見積・技術相談はこちら</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 cursor-pointer transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
