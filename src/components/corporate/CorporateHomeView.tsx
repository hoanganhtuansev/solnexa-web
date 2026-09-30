import React from 'react';
import {
  ArrowRight,
  BatteryCharging,
  Calculator,
  Cable,
  CircuitBoard,
  Construction,
  Cpu,
  FileText,
  MessageSquareText,
  Sun,
  Workflow
} from 'lucide-react';
import { APP_IMAGES } from '../solarAssets';
import { CorporateTab } from './CorporateHeader';

interface CorporateHomeViewProps {
  onNavigateTab: (tab: CorporateTab) => void;
  onOpenEngineeringTools: () => void;
  onOpenContact: () => void;
  onOpenCompanyProfile?: () => void;
  onOpenLogin: () => void;
  onAskAiPrompt: (promptText: string) => void;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  currentUser?: any;
}

const businessItems = [
  {
    no: '01',
    en: 'DESIGN',
    ja: '設計',
    description: '太陽光・BESSの配置設計、電気設計、単線結線図、配線計画、施工図まで。',
    image: APP_IMAGES.solarFrontierDaylight,
    icon: CircuitBoard
  },
  {
    no: '02',
    en: 'CONSTRUCTION SUPPORT',
    ja: '施工支援',
    description: '設計変更、施工図、機器配置、現場条件の確認など、実務に沿った技術支援。',
    image: APP_IMAGES.cleanBessFacility,
    icon: Construction
  },
  {
    no: '03',
    en: 'SIMULATION',
    ja: 'シミュレーション',
    description: '発電量、ストリング、電圧降下、BESS容量など、設計判断に必要な検討を可視化。',
    image: APP_IMAGES.rooftopSolarDaylight,
    icon: Workflow
  }
] as const;

const toolItems = [
  {
    title: 'PV・ストリング設計',
    text: '直並列数、Voc、MPPT範囲、過積載率を確認。',
    icon: Sun
  },
  {
    title: 'BESSサイジング',
    text: '容量、出力、C-rate、DODをプロジェクト条件から検討。',
    icon: BatteryCharging
  },
  {
    title: 'ケーブル・電圧降下',
    text: '許容電流と電圧降下を同じ画面で確認。',
    icon: Cable
  },
  {
    title: 'BOQ・設計計算',
    text: '主要機器・工事項目の検討と設計計算を一元化。',
    icon: Calculator
  }
] as const;

export const CorporateHomeView: React.FC<CorporateHomeViewProps> = ({
  onNavigateTab,
  onOpenEngineeringTools,
  onOpenContact,
  onOpenCompanyProfile,
  onAskAiPrompt
}) => {
  return (
    <div className="bg-white text-slate-900">
      <section className="relative -mx-4 -mt-8 min-h-[78vh] overflow-hidden sm:-mx-6 lg:-mx-8">
        <img
          src={APP_IMAGES.cleanWhiteSubstation}
          alt="太陽光発電・BESSエンジニアリング"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/15" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-[1440px] items-center px-6 py-20 sm:px-10 lg:px-16">
          <div className="max-w-3xl">
            <p className="mb-6 text-xs font-semibold tracking-[0.22em] text-[#d81a28]">
              SOLAR / BESS ENGINEERING
            </p>
            <h1 className="text-[clamp(2.7rem,6vw,6.7rem)] font-semibold leading-[1.03] tracking-[-0.045em] text-[#002b49]">
              太陽光・BESSを、
              <br />
              技術で支える。
            </h1>
            <p className="mt-7 max-w-2xl text-base font-normal leading-[1.9] text-slate-600 sm:text-lg">
              設計、施工支援、シミュレーション。
              <br className="hidden sm:block" />
              プロジェクトに必要な技術を、シンプルに、正確に。
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onNavigateTab('solutions')}
                className="inline-flex items-center gap-2 bg-[#002b49] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#001d32]"
              >
                事業内容を見る
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onOpenEngineeringTools}
                className="inline-flex items-center gap-2 border border-slate-300 bg-white/80 px-6 py-3.5 text-sm font-semibold text-slate-900 backdrop-blur transition-colors hover:border-slate-500"
              >
                TOOLSを使う
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 items-center gap-3 text-[11px] font-medium tracking-[0.2em] text-slate-500 md:flex">
          <span>SCROLL</span>
          <span className="h-px w-16 bg-slate-400" />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-1 py-24 sm:py-32 lg:py-36">
        <div className="mb-16 grid gap-6 lg:grid-cols-[0.7fr_1.3fr] lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#d81a28]">BUSINESS</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#002b49] sm:text-5xl">
              3つの技術領域
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-[1.9] text-slate-600 sm:text-base">
            多くを並べるのではなく、SOLNEXAが実務で提供する技術を3つに整理しました。
          </p>
        </div>

        <div className="space-y-24 sm:space-y-32">
          {businessItems.map((item, index) => {
            const Icon = item.icon;
            const reverse = index % 2 === 1;
            return (
              <article
                key={item.en}
                className="grid min-h-[58vh] items-center gap-10 lg:grid-cols-2 lg:gap-20"
              >
                <div className={reverse ? 'lg:order-2' : ''}>
                  <div className="overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.ja}
                      className="aspect-[4/3] w-full object-cover transition-transform duration-700 hover:scale-[1.02]"
                    />
                  </div>
                </div>
                <div className={reverse ? 'lg:order-1' : ''}>
                  <div className="flex items-center gap-4 text-[#d81a28]">
                    <span className="text-xs font-semibold tracking-[0.2em]">{item.no}</span>
                    <span className="h-px w-12 bg-[#d81a28]" />
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="mt-8 text-sm font-semibold tracking-[0.18em] text-slate-500">
                    {item.en}
                  </p>
                  <h3 className="mt-3 text-4xl font-semibold tracking-[-0.035em] text-[#002b49] sm:text-5xl">
                    {item.ja}
                  </h3>
                  <p className="mt-7 max-w-xl text-base leading-[1.95] text-slate-600">
                    {item.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('solutions')}
                    className="mt-9 inline-flex items-center gap-2 text-sm font-semibold text-[#002b49]"
                  >
                    詳しく見る
                    <ArrowRight className="h-4 w-4 text-[#d81a28]" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="-mx-4 bg-[#f4f7f9] px-4 py-24 sm:-mx-6 sm:px-6 sm:py-32 lg:-mx-8 lg:px-8 lg:py-36">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-[#d81a28]">SOLNEXA TOOLS</p>
              <h2 className="mt-4 text-5xl font-semibold tracking-[-0.045em] text-[#002b49] sm:text-6xl lg:text-7xl">
                設計を、
                <br />
                もっと速く。
              </h2>
            </div>
            <div className="max-w-2xl">
              <p className="text-base leading-[1.95] text-slate-600">
                SOLNEXAの特徴は、設計サービスだけではありません。
                実務で使う計算・確認作業をブラウザ上でまとめるエンジニアリングツールを開発しています。
              </p>
              <button
                type="button"
                onClick={onOpenEngineeringTools}
                className="mt-8 inline-flex items-center gap-2 bg-[#002b49] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#001d32]"
              >
                すべてのTOOLSを見る
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mt-16 grid border-y border-slate-300 md:grid-cols-2">
            {toolItems.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.title}
                  type="button"
                  onClick={onOpenEngineeringTools}
                  className={[
                    'group flex min-h-[210px] flex-col items-start justify-between p-7 text-left transition-colors hover:bg-white sm:p-9',
                    index % 2 === 0 ? 'md:border-r md:border-slate-300' : '',
                    index < 2 ? 'border-b border-slate-300' : ''
                  ].join(' ')}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon className="h-6 w-6 text-[#002b49]" />
                    <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#d81a28]" />
                  </div>
                  <div className="mt-10">
                    <h3 className="text-xl font-semibold text-[#002b49]">{tool.title}</h3>
                    <p className="mt-3 text-sm leading-[1.8] text-slate-600">{tool.text}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 py-24 sm:py-32 lg:grid-cols-2 lg:items-center lg:gap-20 lg:py-36">
        <div className="overflow-hidden bg-slate-100">
          <img
            src={APP_IMAGES.smartEmsDaylight}
            alt="SOLNEXA AI 技術相談"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-[#d81a28]">AI TECHNICAL CONSULT</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#002b49] sm:text-5xl">
            技術相談を、
            <br />
            もっと身近に。
          </h2>
          <p className="mt-7 max-w-xl text-base leading-[1.95] text-slate-600">
            太陽光・BESSの基本的な技術相談をAIで。必要に応じて、設計・見積の相談へつなげます。
          </p>
          <button
            type="button"
            onClick={() => onAskAiPrompt('太陽光・BESSの設計について相談したいです。')}
            className="mt-9 inline-flex items-center gap-2 border-b border-[#002b49] pb-1 text-sm font-semibold text-[#002b49]"
          >
            <MessageSquareText className="h-4 w-4" />
            AIに相談する
            <ArrowRight className="h-4 w-4 text-[#d81a28]" />
          </button>
        </div>
      </section>

      <section className="-mx-4 bg-[#002b49] px-4 py-24 text-white sm:-mx-6 sm:px-6 sm:py-32 lg:-mx-8 lg:px-8">
        <div className="mx-auto max-w-[1440px]">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <p className="text-xs font-semibold tracking-[0.22em] text-sky-200">WORKS</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                実績・プロジェクト
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-[1.9] text-slate-300 sm:text-base">
              系統用蓄電池、産業用太陽光、受変電設備・CAD設計支援など、公開可能な案件から順次掲載します。
            </p>
          </div>

          <div className="mt-14 divide-y divide-white/20 border-y border-white/20">
            {['系統用蓄電池 BESS', '産業用太陽光発電', '受変電・CAD設計支援'].map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigateTab('projects')}
                className="group flex w-full items-center justify-between py-6 text-left"
              >
                <div className="flex items-center gap-6">
                  <span className="text-xs text-slate-400">0{index + 1}</span>
                  <span className="text-lg font-medium sm:text-xl">{label}</span>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-white" />
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] py-24 sm:py-32">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#d81a28]">NEWS</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#002b49]">新着情報</h2>
            <div className="mt-10 border-y border-slate-200">
              <button
                type="button"
                onClick={() => onNavigateTab('news')}
                className="group flex w-full items-center justify-between py-6 text-left"
              >
                <div>
                  <p className="text-xs font-medium tracking-[0.12em] text-slate-400">LATEST</p>
                  <p className="mt-2 text-sm leading-[1.8] text-slate-700">
                    SOLNEXAの最新情報・技術情報はこちらからご覧いただけます。
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-[#d81a28]" />
              </button>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#d81a28]">COMPANY</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#002b49]">会社情報</h2>
            <p className="mt-7 max-w-xl text-base leading-[1.95] text-slate-600">
              太陽光発電・系統用蓄電池の設計と技術支援を軸に、エンジニアリングとデジタルツールを組み合わせたサービスを提供します。
            </p>
            <button
              type="button"
              onClick={() => onOpenCompanyProfile?.()}
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#002b49]"
            >
              会社情報を見る
              <ArrowRight className="h-4 w-4 text-[#d81a28]" />
            </button>
          </div>
        </div>
      </section>

      <section className="-mx-4 border-t border-slate-200 bg-[#f8fafc] px-4 py-24 sm:-mx-6 sm:px-6 sm:py-28 lg:-mx-8 lg:px-8">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#d81a28]">CONTACT</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.035em] text-[#002b49] sm:text-5xl">
              設計・技術相談、
              <br />
              お見積りはこちら。
            </h2>
          </div>
          <button
            type="button"
            onClick={onOpenContact}
            className="inline-flex w-fit items-center gap-3 bg-[#d81a28] px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#b81420]"
          >
            <FileText className="h-4 w-4" />
            お問い合わせ・見積依頼
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
