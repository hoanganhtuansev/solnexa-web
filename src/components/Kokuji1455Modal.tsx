/**
 * SOLNEXA - Kokuji 1455 Official Statute & 40 Zones Inspector Modal
 * 建設省告示第1455号（建築基準法施行令第八十六条第三項）完全条文・別表40区域ビューア
 * 100% Offline Standalone - Zero External Network Dependency
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  FileText,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Info,
  Layers,
  Sliders,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { MLIT_SNOW_ZONES } from '../../server/snowEngine/snowZonesData';

interface Kokuji1455ModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeZoneId?: number;
  currentElevationM?: number;
  currentSeaRatioRs?: number;
  calculatedDepthCm?: number;
}

export const Kokuji1455Modal: React.FC<Kokuji1455ModalProps> = ({
  isOpen,
  onClose,
  activeZoneId = 24,
  currentElevationM,
  currentSeaRatioRs,
  calculatedDepthCm
}) => {
  const [activeTab, setActiveTab] = useState<'statute' | 'zones' | 'engineering' | 'citations'>('statute');
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);

  // Filter 40 zones by search query
  const filteredZones = useMemo(() => {
    if (!searchQuery.trim()) return MLIT_SNOW_ZONES;
    const q = searchQuery.toLowerCase().trim();
    return MLIT_SNOW_ZONES.filter(z => 
      z.zoneId.toString().includes(q) ||
      z.zoneName.toLowerCase().includes(q) ||
      z.description.toLowerCase().includes(q) ||
      z.prefectures.some(p => p.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  const activeZone = useMemo(() => {
    return MLIT_SNOW_ZONES.find(z => z.zoneId === activeZoneId) || MLIT_SNOW_ZONES[23];
  }, [activeZoneId]);

  if (!isOpen) return null;

  const handleCopyStatute = () => {
    const text = `【平成12年5月31日 建設省告示第1455号（建築基準法施行令第86条第3項）】
建築基準法施行令第八十六条第三項の規定に基づき、多雪区域及び垂直積雪量を定める件

第一 多雪区域の指定基準
積雪日数が三十日以上の区域又は垂直積雪量が百センチメートル以上の区域その他特定行政庁が定める基準による。

第二 垂直積雪量の算定式
d = α × ls + β × rs + γ
・d: 垂直積雪量（単位 メートル）
・α: 標高係数（別表に定める数値）
・ls: 敷地の標高（単位 メートル）
・β: 海率係数（別表に定める数値）
・rs: 敷地を中心とする半径R（キロメートル）の円内における海面の占める面積の割合（海率）
・γ: 基準定数（別表に定める数値）
・R: 海率算定対象半径（単位 キロメートル）

【現在計画地 適用区域】
${activeZone.zoneName}
・α = ${activeZone.alpha}
・β = ${activeZone.beta}
・γ = ${activeZone.gamma}
・R = ${activeZone.radiusKm} km
対象地域: ${activeZone.description}

※ SOLNEXA 100% オフライン法令データベースより出力`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 bg-blue-500/20 text-blue-300 rounded-lg">
                <FileText className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                100% OFFLINE STATUTORY DATABASE
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded">
                告示原文・条文 完全収録
              </span>
            </div>
            
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>平成12年建設省告示第1455号</span>
              <span className="text-xs sm:text-sm font-normal text-slate-300 hidden sm:inline">
                （建築基準法施行令第86条第3項）
              </span>
            </h2>
            <p className="text-[11px] text-slate-300">
              建築基準法施行令第八十六条第三項の規定に基づき、多雪区域及び垂直積雪量を定める件
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyStatute}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="条文とパラメータをクリップボードにコピー"
            >
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? 'コピー完了' : '条文コピー'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="閉じる"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 bg-slate-50 border-b border-slate-200 overflow-x-auto custom-scrollbar shrink-0">
          <button
            onClick={() => setActiveTab('statute')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'statute'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>告示公式条文（第二 算定式）</span>
          </button>

          <button
            onClick={() => setActiveTab('zones')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'zones'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>別表：全国40区域パラメータ一覧</span>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded-full font-bold">
              40
            </span>
          </button>

          <button
            onClick={() => setActiveTab('engineering')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'engineering'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>BESS設計・法規適用マニュアル</span>
          </button>

          <button
            onClick={() => setActiveTab('citations')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'citations'
                ? 'border-blue-600 text-blue-700 font-bold bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>法令典拠・公式リンク</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          
          {/* TAB 1: 告示条文・公式原文 */}
          {activeTab === 'statute' && (
            <div className="space-y-6">
              {/* Active Zone Callout Card */}
              {activeZone && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 font-mono flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                      現在計画地に適用される告示区域: 【第{activeZone.zoneId}区域】
                    </span>
                    <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded font-mono font-bold">
                      ACTIVE APPLIED
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeZone.zoneName}
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2 bg-white/90 rounded border border-blue-200">
                      <span className="text-[10px] text-slate-400 block">標高係数 α</span>
                      <strong className="text-slate-900 font-bold">{activeZone.alpha}</strong>
                    </div>
                    <div className="p-2 bg-white/90 rounded border border-blue-200">
                      <span className="text-[10px] text-slate-400 block">海率係数 β</span>
                      <strong className="text-slate-900 font-bold">{activeZone.beta}</strong>
                    </div>
                    <div className="p-2 bg-white/90 rounded border border-blue-200">
                      <span className="text-[10px] text-slate-400 block">基準定数 γ</span>
                      <strong className="text-slate-900 font-bold">{activeZone.gamma}</strong>
                    </div>
                    <div className="p-2 bg-white/90 rounded border border-blue-200">
                      <span className="text-[10px] text-slate-400 block">対象半径 R</span>
                      <strong className="text-slate-900 font-bold">{activeZone.radiusKm} km</strong>
                    </div>
                  </div>
                  {currentElevationM !== undefined && (
                    <div className="text-xs text-blue-950 font-mono bg-white/80 p-2 rounded border border-blue-200 flex flex-wrap items-center justify-between gap-1">
                      <span>現地算定式: d = {activeZone.alpha} × {currentElevationM} + ({activeZone.beta}) × {currentSeaRatioRs ?? 0} + {activeZone.gamma}</span>
                      <span className="font-bold text-blue-700 text-sm">
                        = {calculatedDepthCm} cm
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Statutory Formal Text */}
              <div className="space-y-4 text-xs leading-relaxed text-slate-700 bg-slate-50 p-5 rounded-xl border border-slate-200 font-serif">
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-[11px] text-slate-500 font-mono">
                    建設省告示第千四百五十五号
                  </p>
                  <h3 className="text-base font-bold text-slate-900 font-sans mt-0.5">
                    建築基準法施行令第八十六条第三項の規定に基づき、多雪区域及び垂直積雪量を定める件
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    （平成十二年五月三十一日 建設省告示第千四百五十五号／最終改正 令和三年 国土交通省告示第九百二十号）
                  </p>
                </div>

                <div className="space-y-3">
                  <p>
                    建築基準法施行令（昭和二十五年政令第三百三十八号）第八十六条第三項の規定に基づき、多雪区域及び垂直積雪量を次のように定める。
                  </p>

                  <div className="space-y-1 pl-4 border-l-2 border-slate-300">
                    <h4 className="font-bold text-slate-900 font-sans">
                      第一　多雪区域の指定基準
                    </h4>
                    <p>
                      建築基準法施行令第八十六条第二項ただし書の規定に基づき特定行政庁が定める多雪区域の指定基準は、次の各号のいずれかに該当する区域とする。
                    </p>
                    <p className="pl-3">
                      一　積雪日数の平年値が三十日以上の区域<br />
                      二　垂直積雪量の平年値が百センチメートル以上の区域<br />
                      三　前二号に掲げる区域のほか、特定行政庁が気象官署の過去の積雪の記録等に基づき定める区域
                    </p>
                  </div>

                  <div className="space-y-1 pl-4 border-l-2 border-blue-500">
                    <h4 className="font-bold text-blue-900 font-sans">
                      第二　垂直積雪量の算定式
                    </h4>
                    <p>
                      建築基準法施行令第八十六条第三項の規定による垂直積雪量は、次の式によって算定した数値（単位 メートル）とする。
                    </p>
                    
                    <div className="p-3 bg-white rounded-lg border border-blue-200 my-2 text-center font-mono font-bold text-sm text-blue-950 shadow-2xs">
                      ｄ ＝ α × ｌｓ ＋ β × ｒｓ ＋ γ
                    </div>

                    <p className="space-y-1 pl-2">
                      <span>この式において、ｄ、α、ｌｓ、β、ｒｓ、γ 及び Ｒ は、それぞれ次の数値を表すものとする。</span><br />
                      <span className="font-bold">ｄ</span>　垂直積雪量（単位 メートル）<br />
                      <span className="font-bold">α</span>　別表に掲げる区域の区分に応じた同表の「α」の項に定める数値（標高係数）<br />
                      <span className="font-bold">ｌｓ</span>　敷地の標高（単位 メートル）<br />
                      <span className="font-bold">β</span>　別表に掲げる区域の区分に応じた同表の「β」の項に定める数値（海率係数）<br />
                      <span className="font-bold">ｒｓ</span>　敷地を中心とする半径 Ｒ（単位 キロメートル）の円内における海面の占める面積の割合（海率）<br />
                      <span className="font-bold">γ</span>　別表に掲げる区域の区分に応じた同表の「γ」の項に定める数値（基準定数）<br />
                      <span className="font-bold">Ｒ</span>　別表に掲げる区域の区分に応じた同表の「Ｒ」の項に定める数値（単位 キロメートル）
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 別表40区域一覧表 */}
          {activeTab === 'zones' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="都道府県、区域番号（例: 24）、または市町村名で検索..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <span>表示件数: {filteredZones.length} / 40 区域</span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-blue-600 hover:underline font-semibold"
                    >
                      クリア
                    </button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="rounded-xl border border-slate-200 overflow-x-auto shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <th className="py-2.5 px-3 whitespace-nowrap">区域</th>
                      <th className="py-2.5 px-3">対象地域・都道府県・代表都市</th>
                      <th className="py-2.5 px-2.5 font-mono text-center whitespace-nowrap">α (標高)</th>
                      <th className="py-2.5 px-2.5 font-mono text-center whitespace-nowrap">β (海率)</th>
                      <th className="py-2.5 px-2.5 font-mono text-center whitespace-nowrap">γ (定数)</th>
                      <th className="py-2.5 px-2.5 font-mono text-center whitespace-nowrap">R (km)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredZones.map((z) => {
                      const isCurrent = z.zoneId === activeZoneId;
                      return (
                        <tr 
                          key={z.zoneId}
                          className={`transition-colors ${
                            isCurrent
                              ? 'bg-blue-50/80 font-semibold'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                              isCurrent 
                                ? 'bg-blue-600 text-white shadow-2xs' 
                                : 'bg-slate-200 text-slate-800'
                            }`}>
                              第{z.zoneId}区域
                              {isCurrent && <span className="text-[9px] font-sans">適用中</span>}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{z.zoneName}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{z.description}</div>
                          </td>
                          <td className="py-2.5 px-2.5 font-mono text-center text-slate-800">{z.alpha}</td>
                          <td className="py-2.5 px-2.5 font-mono text-center text-slate-800">{z.beta}</td>
                          <td className="py-2.5 px-2.5 font-mono text-center text-slate-800">{z.gamma}</td>
                          <td className="py-2.5 px-2.5 font-mono text-center text-blue-900 font-bold">{z.radiusKm}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: 技術解説 & BESS設計適用 */}
          {activeTab === 'engineering' && (
            <div className="space-y-4 text-xs leading-relaxed text-slate-700">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-amber-950">
                <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>実務エンジニアが知っておくべき「公式値」と「告示1455号」の優先順位</span>
                </div>
                <p>
                  建築基準法において、垂直積雪量は次のような<strong>法的ヒエラルキー（優先順位）</strong>を持っています：
                </p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>
                    <strong>特定行政庁（都道府県・市区町村）の建築基準法施行細則：</strong><br />
                    令第86条第2項ただし書の規定に基づき、自治体が規則で数値を指定している場合、<strong>その数値が法的に絶対優先</strong>されます。
                  </li>
                  <li>
                    <strong>告示第1455号の自動計算値：</strong><br />
                    自治体が規則で数値を指定していない区域において、全国一律に適用される「基準計算値」です。
                  </li>
                  <li>
                    <strong>安全設計の原則（GOVERNING PRINCIPLE）：</strong><br />
                    太陽光架台やBESS基礎の構造安全性を担保するため、一般送配電事業者および構造審査機関は「公式値」と「告示計算値」のうち<strong>大きい方の数値（安全側）を採用</strong>することを強く推奨しています。
                  </li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>積雪荷重への変換式（令第86条第2項）</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    垂直積雪量 d (cm) から、設計用積雪荷重 S (N/m²) を求める計算式：
                  </p>
                  <div className="p-2 bg-white rounded border border-slate-200 font-mono text-center font-bold text-slate-800">
                    S ＝ d × 20 （多雪区域は d × 30）
                  </div>
                  <p className="text-[10px] text-slate-500">
                    ※ 積雪量1cmごとに 20 N/m²（多雪区域では 30 N/m²）を乗じます。
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>BESSコンテナ配置と消防法保有空地</span>
                  </h4>
                  <p className="text-[11px] text-slate-600">
                    消防法第17条および告示第2号による3m保有空地内に雪を押し出さないよう、あらかじめ敷地内に排雪・融雪スペースを確保する必要があります。
                  </p>
                  <p className="text-[10px] text-slate-500">
                    屋根からの落雪が隣接蓄電池コンテナや受変電盤に直撃しない離隔レイアウトが求められます。
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 法令典拠・公式リンク */}
          {activeTab === 'citations' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-600">
                本ツールに収録されているすべての計算式および40区域パラメータは、以下の公的法令資料に基づき100%忠実に照合されています：
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('statute')}
                  className="p-3.5 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200 rounded-xl transition-all space-y-1 block text-left group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-blue-700 font-bold">
                    <span>【完全オフライン収録】告示原文条文</span>
                    <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-slate-900 font-bold">平成12年建設省告示第1455号 全文</p>
                  <p className="text-[11px] text-slate-600">外部通信不要・アプリ内に完全収録。第一・第二算定式・別表40区域を即座に閲覧。</p>
                </button>

                <a
                  href="https://laws.e-gov.go.jp/law/325CO0000000338#Mp-At_86"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all space-y-1 block group"
                >
                  <div className="flex items-center justify-between text-blue-700 font-bold">
                    <span>e-Gov 法令検索（デジタル庁）</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-slate-800 font-semibold">建築基準法施行令 第86条（積雪荷重）</p>
                  <p className="text-[11px] text-slate-500">国が運用する公式法令ポータル。第3項告示委任規定をオンライン確認可能。</p>
                </a>

                <a
                  href="https://www.mlit.go.jp/jutakukentiku/build/jutakukentiku_house_tk_000009.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all space-y-1 block group"
                >
                  <div className="flex items-center justify-between text-blue-700 font-bold">
                    <span>国土交通省 公式ポータル</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-slate-800 font-semibold">建築基準法関連 告示・技術基準情報</p>
                  <p className="text-[11px] text-slate-500">国土交通省住宅局建築指導課が公表する公式技術的助言・基準ライブラリ。</p>
                </a>

                <a
                  href="https://maps.gsi.go.jp/development/elevation_api.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all space-y-1 block group"
                >
                  <div className="flex items-center justify-between text-blue-700 font-bold">
                    <span>国土地理院 標高API</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-slate-800 font-semibold">基盤地図情報数値標高モデル (DEM)</p>
                  <p className="text-[11px] text-slate-500">航空レーザー測量に基づく5m/10mメッシュ標高。</p>
                </a>

                <a
                  href="https://www.jma.go.jp/bosai/#pattern=default&area_type=japan&area_code=010000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all space-y-1 block group sm:col-span-2"
                >
                  <div className="flex items-center justify-between text-blue-700 font-bold">
                    <span>気象庁 AMeDAS地域気象観測網</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-slate-800 font-semibold">毎正時実況観測 &amp; 平年値統計（全国1,300観測所）</p>
                  <p className="text-[11px] text-slate-500">気象庁公式データによる気温・風速・積雪計設置所情報。</p>
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>SOLNEXA Standalone Engineering Engine（オフライン完全自立稼働）</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyStatute}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'コピーしました！' : '条文をコピー'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#002B49] hover:bg-[#001D33] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              閉じる
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
