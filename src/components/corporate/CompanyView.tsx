import React, { useState, useEffect } from 'react';
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
  ExternalLink,
  CheckCircle2,
  Zap,
  ArrowRight,
  Calculator,
  Compass,
  Briefcase,
  Layers,
  ChevronRight
} from 'lucide-react';
import { SolnexaLogo } from './SolnexaLogo';
import { APP_IMAGES } from '../solarAssets';

export type CompanySubTab = 'overview' | 'message' | 'qualifications' | 'access';

interface CompanyViewProps {
  initialTab?: CompanySubTab;
  onOpenContact?: () => void;
  onOpenDesignQuotation?: () => void;
  onNavigateTab?: (tab: any, subTab?: string) => void;
}

export const CompanyView: React.FC<CompanyViewProps> = ({
  initialTab = 'overview',
  onOpenContact,
  onOpenDesignQuotation,
  onNavigateTab
}) => {
  const [activeTab, setActiveTab] = useState<CompanySubTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  return (
    <div className="w-full space-y-10 sm:space-y-12">
      {/* 1. Header Banner - Clean Architectural Daylight Style */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200/90 shadow-lg min-h-[220px] sm:min-h-[260px] flex items-center bg-[#002B49] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <img 
            src={APP_IMAGES.headerBanner} 
            alt="SOLNEXA Headquarters and Engineering Infrastructure" 
            className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
          />
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to right, rgba(0, 43, 73, 0.96) 0%, rgba(0, 43, 73, 0.88) 55%, rgba(0, 43, 73, 0.60) 100%)'
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl p-6 sm:p-10 lg:p-12 space-y-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <button 
              onClick={() => onNavigateTab && onNavigateTab('home')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              ホーム
            </button>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-amber-300 font-semibold">企業情報</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
            <span className="text-white">会社概要・企業データ</span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#d81a28] rounded-xs" />
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest font-mono">
              CORPORATE PROFILE
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
              特別高圧・高圧工学設計ファーム
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white jp-heading">
            <span className="jp-chunk">株式会社ソルネクサ</span>
            <span className="text-lg sm:text-2xl font-normal text-slate-300 block sm:inline sm:ml-3 font-mono">
              (SOLNEXA Japan Co., Ltd.)
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal max-w-2xl pt-1">
            日本の再生可能エネルギーインフラを支える、特別高圧・高圧分野の電気工学総合エンジニアリングファーム。太陽光発電および系統用蓄電池の基本計画から系統連系協議、実務ツールの開発までを一貫して提供します。
          </p>
        </div>
      </div>

      {/* 2. Navigation Tabs (Overview, Message, Qualifications, Access) */}
      <div className="border-b border-slate-200 bg-white rounded-xl shadow-2xs p-1.5 flex flex-wrap items-center gap-2">
        {[
          { id: 'overview', label: '会社概要・基本データ', icon: Building2 },
          { id: 'message', label: '代表メッセージ・理念', icon: Users },
          { id: 'qualifications', label: '技術者体制・許認可', icon: ShieldCheck },
          { id: 'access', label: '所在地・アクセス', icon: MapPin },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as CompanySubTab)}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#002B49] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#002B49] hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      
      {/* TAB 1: 会社概要・基本データ */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 sm:p-8 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#002B49] tracking-tight">
                  会社基本情報
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  特別高圧太陽光・系統用蓄電池（BESS）の総合エンジニアリング企業
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>法人登記済・電気工事業登録済</span>
              </div>
            </div>

            <div className="divide-y divide-slate-200 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>会社名</span>
                </div>
                <div className="sm:col-span-8 font-semibold text-[#002B49] mt-1 sm:mt-0">
                  株式会社ソルネクサ（英文表記: SOLNEXA Japan Co., Ltd.）
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>代表者</span>
                </div>
                <div className="sm:col-span-8 text-slate-900 mt-1 sm:mt-0 font-medium">
                  代表取締役 / 最高技術責任者 (CTO)　<strong className="text-[#002B49] font-bold">Hoàng Anh Tuấn</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>設立</span>
                </div>
                <div className="sm:col-span-8 text-slate-800 mt-1 sm:mt-0">
                  2024年4月（創業 2021年）
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-slate-400" />
                  <span>資本金</span>
                </div>
                <div className="sm:col-span-8 text-slate-800 mt-1 sm:mt-0 font-mono font-semibold">
                  5,000万円
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>本社所在地</span>
                </div>
                <div className="sm:col-span-8 text-slate-800 mt-1 sm:mt-0 space-y-1">
                  <p className="font-semibold text-[#002B49]">〒116-0002 東京都荒川区荒川5-6-7 302号</p>
                  <p className="text-xs text-slate-500">
                    京成線「新三河島駅」徒歩4分 ｜ JR山手線・常磐線「三河島駅」徒歩8分 ｜ 東京メトロ千代田線「町屋駅」徒歩9分
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>連絡先</span>
                </div>
                <div className="sm:col-span-8 text-slate-800 mt-1 sm:mt-0 space-y-1.5">
                  <p className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">代表電話:</span>
                    <a href="tel:07089821052" className="text-[#002B49] font-mono font-bold hover:underline">
                      070-8982-1052
                    </a>
                    <span className="text-xs text-slate-500">（平日 9:00〜18:00）</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">E-mail:</span>
                    <span className="font-mono text-slate-700">hoanganhtuan.solnexa@gmail.com</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-start gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400 mt-0.5" />
                  <span>事業内容</span>
                </div>
                <div className="sm:col-span-8 text-slate-700 mt-1 sm:mt-0">
                  <ul className="space-y-2.5 list-disc pl-4 text-slate-700 leading-relaxed">
                    <li>特別高圧・高圧 系統用大型蓄電システム（BESS）の基本設計、機器選定、調達支援</li>
                    <li>産業用メガソーラーおよび自家消費型コーポレートPPAの電気工学設計・単線結線図CAD作図</li>
                    <li>一般送配電事業者（全国10電力会社）との系統連系協議、保護継電器整定（OCR/DGR/87T）、系統解析</li>
                    <li>経済産業省・産業保安監督部への電気事業法第48条に基づく工事計画届出書類の作成・認可支援</li>
                    <li>総務省消防庁告示第2号に基づく屋外蓄電池保有空地3m離隔基準・自治体事前協議の設計支援</li>
                    <li>実務エンジニア向け計算ツール（SOLNEXA TOOLS）の開発・クラウド提供</li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-slate-400" />
                  <span>主要取引先</span>
                </div>
                <div className="sm:col-span-8 text-slate-700 mt-1 sm:mt-0 leading-relaxed">
                  大手インフラ投資ファンド、国内外エネルギー総合事業者、再エネ専門EPC各社、電気保安法人、国内外電機メーカー
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-12 p-4 sm:p-6 hover:bg-slate-50/50 transition-colors">
                <div className="sm:col-span-4 font-bold text-slate-600 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-slate-400" />
                  <span>取引銀行</span>
                </div>
                <div className="sm:col-span-8 text-slate-700 mt-1 sm:mt-0">
                  三菱UFJ銀行、三井住友銀行
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 代表メッセージ・理念 */}
      {activeTab === 'message' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Philosophy Card */}
          <div className="bg-gradient-to-br from-[#001c30] via-[#002B49] to-[#001726] text-white rounded-2xl p-8 sm:p-12 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d81a28]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 space-y-4 max-w-3xl">
              <span className="text-xs font-mono tracking-widest text-amber-300 font-bold uppercase">
                CORPORATE PHILOSOPHY ｜ 企業理念
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
                SMARTER ENERGY. BRIGHTER TOMORROW.
              </h2>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed pt-2">
                SOL (太陽) ＋ NEXT (未来) ＋ A (行動・創生)。<br />
                確かな工学設計とデータ技術で、日本のエネルギーインフラの自立と脱炭素化を加速させます。
              </p>
            </div>
          </div>

          {/* CEO Message */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-8 sm:p-12 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 pb-6">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#002B49] flex items-center justify-center font-bold text-lg border border-blue-100">
                HT
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#002B49]">
                  代表挨拶 ｜ 現場と工学理論の融合
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  代表取締役 / 最高技術責任者 (CTO)　Hoàng Anh Tuấn
                </p>
              </div>
            </div>

            <div className="space-y-5 text-xs sm:text-sm text-slate-700 leading-[2] font-normal">
              <p>
                再生可能エネルギーが日本の主力電源へと進化を遂げる現代、太陽光発電所および系統用蓄電池（BESS）の現場は、かつてない技術的・法規的転換期を迎えています。
              </p>
              <p>
                一般送配電事業者との連系協議におけるノンファーム接続対応、総務省消防庁告示第2号に基づく屋外蓄電設備の保有空地3m離隔、経済産業省への電気事業法第48条工事計画届出、そしてFIP制度下のインバランス対策――。これらの課題は、机上の理論だけでも、現場の勘だけでも解決できません。
              </p>
              <p>
                私たちソルネクサは、第一線の電気主任技術者および系統解析エンジニアが結集した実務型エンジニアリングファームです。私たちは、日本の厳格な安全規格（JIS、IEC、内線規程、消防法）を愚直に遵守しつつ、独自のクラウド設計ツール（SOLNEXA TOOLS）を内製開発することで、設計のスピードと安全性を両立させました。
              </p>
              <p className="pt-2 font-medium text-slate-900">
                「正しい工学設計が、20年・30年先の人々と地球の安心を支える」という信念のもと、誠意と技術をもってお客様のプロジェクトに伴走してまいります。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 技術者体制・許認可 */}
      {activeTab === 'qualifications' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center border border-blue-100">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-base font-bold text-[#002B49]">第一種電気工事士</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                特別高圧・高圧受変電設備、キュービクル、配線工事における国家資格保持者が常駐。現場の施工基準に即した確実な図面を作成します。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center border border-blue-100">
                <Award className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-[#002B49]">認定電気工事従事者</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                産業用自家用電気工作物（最大電力500kW未満）の電気工事実務に対応。工場・倉庫PPAや自家消費設備の安全設計を担保します。
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center border border-blue-100">
                <Zap className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-base font-bold text-[#002B49]">系統解析スペシャリスト</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                短絡比（SCR）、電圧変動率、保護協調（87T, 51, 64OV, 67R）の精密算定を実施。電力会社との連系協議を最短でクリアします。
              </p>
            </div>
          </div>

          {/* Compliance Standards */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-5">
            <h3 className="text-lg font-bold text-[#002B49]">
              設計・実務における準拠規格・法規
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#002B49] block">JIS C 3605 準拠</span>
                <span className="text-slate-600 text-xs">
                  配線用ケーブル許容電流算定、基底温度補正、多条敷設低減係数、2%以内低圧電圧降下設計
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#002B49] block">JIS C 8955:2017 準拠</span>
                <span className="text-slate-600 text-xs">
                  太陽電池アレイ支持物設計標準、基準風速Vo対応耐風圧架台力学構造計算、積雪荷重検証
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#002B49] block">総務省消防庁 告示第2号 適合</span>
                <span className="text-slate-600 text-xs">
                  屋外蓄電池設備保有空地3m基準、全域ガス自動消火システム（FK-5-1-12/エアロゾル）設計
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-[#002B49] block">電気事業法 第48条 適合</span>
                <span className="text-slate-600 text-xs">
                  産業保安監督部への工事計画届出書類の作成、技術基準適合確認届出、主任技術者選任届出支援
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: 所在地・アクセス */}
      {activeTab === 'access' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Address Details */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#002B49] flex items-center justify-center border border-blue-100">
                  <MapPin className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#002B49]">
                    東京本社 (Tokyo Headquarters)
                  </h3>
                  <p className="text-xs text-slate-500">
                    株式会社ソルネクサ 本社オフィス
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-[#002B49]">所在地:</p>
                  <p className="text-slate-800 font-medium">〒116-0002 東京都荒川区荒川5-6-7 302号</p>
                </div>

                <div className="space-y-2">
                  <p className="font-bold text-slate-700">交通アクセス:</p>
                  <ul className="space-y-2 text-slate-600 list-disc pl-4 leading-relaxed">
                    <li><strong className="text-slate-800">京成線「新三河島駅」</strong> 徒歩4分</li>
                    <li><strong className="text-slate-800">JR山手線・常磐線「三河島駅」</strong> 徒歩8分</li>
                    <li><strong className="text-slate-800">東京メトロ千代田線「町屋駅」</strong> 徒歩9分</li>
                  </ul>
                </div>

                <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5 text-xs text-slate-700">
                  <p className="font-bold text-[#002B49]">営業時間・来社案内:</p>
                  <p>平日 9:00〜18:00（土日祝日除く）</p>
                  <p className="text-slate-500">※ 技術相談・設計打ち合わせでのご来社の際は、事前に担当者までご連絡いただけますようお願い申し上げます。</p>
                </div>
              </div>
            </div>

            {/* Map Presentation Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-full min-h-[360px]">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>周辺地図 ｜ 東京都荒川区荒川5-6-7</span>
                </span>
                <a 
                  href="https://maps.google.com/?q=東京都荒川区荒川5-6-7" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-xs text-[#002B49] hover:text-[#d81a28] font-bold flex items-center gap-1"
                >
                  <span>Google Mapsで開く</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="flex-1 bg-slate-100 relative min-h-[300px]">
                <iframe
                  title="SOLNEXA Headquarters Location"
                  className="w-full h-full border-0 absolute inset-0"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3238.455242738781!2d139.778847!3d35.739665!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188dd1c73f3c3d%3A0x6b9d3db3b97b000!2z44CSMTE2LTAwMDIg5p2x5Lqs6YO96I2S5bed5Yy66I2S5bed77yV5LiB55uu77yW4oiS77yX!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bottom Action Banner: Free Design Quotation / General Consultation */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5 text-center md:text-left">
          <span className="text-xs font-bold text-[#d81a28] uppercase font-mono tracking-wider">
            CONTACT &amp; ESTIMATE
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-[#002B49]">
            案件のご相談・設計見積のご依頼
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            特別高圧・高圧受変電、系統用蓄電池の基本計画から連系協議まで、専門エンジニアが迅速に対応します。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {onOpenDesignQuotation && (
            <button
              onClick={onOpenDesignQuotation}
              className="px-6 py-3 bg-[#d81a28] hover:bg-[#b91522] active:scale-98 text-white text-xs sm:text-sm font-semibold rounded-md shadow-xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-amber-200" />
              <span>無料 設計見積を作成する</span>
            </button>
          )}

          {onOpenContact && (
            <button
              onClick={onOpenContact}
              className="px-6 py-3 bg-white hover:bg-slate-100 active:scale-98 border border-slate-300 text-[#002B49] text-xs sm:text-sm font-semibold rounded-md shadow-2xs transition-all cursor-pointer flex items-center gap-2"
            >
              <Mail className="w-4 h-4 text-slate-500" />
              <span>お問い合わせ・技術相談</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
