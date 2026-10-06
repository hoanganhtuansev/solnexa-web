/**
 * SOLNEXA - BESS Snow & Weather Checker
 * 積雪・気象条件チェック（告示第1455号 × 自治体公式値 × 気象庁AMeDAS）
 * Standards: 国土交通省告示第1455号 / 建築基準法施行令第86条 / 国土地理院DEM / 気象庁AMeDAS
 */

import React, { useState, useEffect } from 'react';
import {
  CloudSnow,
  Wind,
  Thermometer,
  Compass,
  Gauge,
  Droplets,
  MapPin,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  RefreshCw,
  Search,
  FileText,
  Sliders,
  Calendar,
  Layers,
  Sparkles,
  Printer,
  ChevronRight,
  TrendingDown,
  Navigation,
  BookOpen
} from 'lucide-react';
import { SnowWeatherCheckerResponse } from '../../server/snowEngine/types';
import { Kokuji1455Modal } from './Kokuji1455Modal';
import { OfficialRuleModal } from './OfficialRuleModal';

interface SnowWeatherCheckerProps {
  onOpenProject?: (projectId: string) => void;
  isLoggedIn?: boolean;
  onOpenLogin?: () => void;
}

export const SnowWeatherChecker: React.FC<SnowWeatherCheckerProps> = ({
  onOpenProject,
  isLoggedIn,
  onOpenLogin
}) => {
  const [searchInput, setSearchInput] = useState('34.444658, 135.745248');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SnowWeatherCheckerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isKokujiModalOpen, setIsKokujiModalOpen] = useState(false);
  const [isOfficialRuleModalOpen, setIsOfficialRuleModalOpen] = useState(false);

  // Preset Benchmark Locations
  const presetLocations = [
    { label: '奈良 (ベンチマーク)', value: '34.444658, 135.745248', desc: '標高101m / 近畿内陸' },
    { label: '埼玉 (美里町 標高74.6m)', value: '埼玉県児玉郡美里町', desc: '標高74.6m / 告示24区域' },
    { label: '埼玉 (さいたま市)', value: '埼玉県さいたま市大宮区', desc: '関東平野 / 告示24区域' },
    { label: '東京 (千代田区)', value: '東京都千代田区霞が関', desc: '首都圏沿岸 / 告示25区域' },
    { label: '大阪 (大阪市)', value: '大阪府大阪市中央区大手前', desc: '大阪湾岸 / 告示30区域' },
    { label: '札幌 (北海道)', value: '北海道札幌市中央区大通西', desc: '石狩多雪 / 140cm' },
    { label: '新潟 (長岡市)', value: '新潟県長岡市大手通', desc: '豪雪平野 / 200cm' },
    { label: '新潟 (湯沢町)', value: '新潟県南魚沼郡湯沢町大字湯沢', desc: '特別豪雪 / 270cm+' },
    { label: '長野 (白馬村)', value: '長野県北安曇郡白馬村大字北城', desc: '北アルプス山麓 / 220cm' },
    { label: '草津 (高標高 1200m)', value: '群馬県吾妻郡草津町大字草津', desc: '標高1,223m / 高地寒冷' }
  ];

  const fetchSnowWeatherData = async (queryStr: string, forceOffline?: boolean) => {
    setIsLoading(true);
    setError(null);
    const offlineFlag = forceOffline !== undefined ? forceOffline : isOfflineMode;
    try {
      const isCoords = queryStr.match(/^([0-9]+\.[0-9]+)\s*[,，\s]\s*([0-9]+\.[0-9]+)$/);
      let url = '/api/snow-weather/check?';
      if (isCoords) {
        url += `lat=${encodeURIComponent(isCoords[1])}&lon=${encodeURIComponent(isCoords[2])}`;
      } else {
        url += `address=${encodeURIComponent(queryStr)}`;
      }
      if (offlineFlag) {
        url += `&offline=true`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`サーバー応答エラー (${res.status}): 積雪・気象データの取得に失敗しました。`);
      }
      const json: SnowWeatherCheckerResponse = await res.json();
      setData(json);
    } catch (err: any) {
      console.error('Fetch snow weather error:', err);
      setError(err.message || 'データ取得中にエラーが発生しました。ネットワークを確認してください。');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch with benchmark location
    fetchSnowWeatherData('34.444658, 135.745248', false);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    fetchSnowWeatherData(searchInput, isOfflineMode);
  };

  const handleToggleMode = (newOfflineState: boolean) => {
    setIsOfflineMode(newOfflineState);
    fetchSnowWeatherData(searchInput, newOfflineState);
  };

  const handleCopyReport = () => {
    if (!data) return;
    const reportText = `SOLNEXA BESS Snow & Weather Condition Report
============================================================
■ 計画地情報
所在地: ${data.site.addressLine}
座標: 緯度 ${data.site.latitude}° / 経度 ${data.site.longitude}°
標高 ls: ${data.site.elevationM} m (${data.site.elevationSource})

■ 垂直積雪量 対照・評価
【公式値 CHECK】: ${data.officialCheck.snowDepthCm !== null ? `${data.officialCheck.snowDepthCm} cm` : '未登録（告示計算値を参考）'} [${data.officialCheck.status}]
適用規定: ${data.officialCheck.ruleName}
出典: ${data.officialCheck.sourceTitle} (${data.officialCheck.sourceUrl})

【告示1455号 自動計算】: ${data.autoCalculation.calculatedDepthCm} cm (${data.autoCalculation.calculatedDepthM} m)
区域: ${data.autoCalculation.zoneName}
計算パラメータ: 標高ls=${data.autoCalculation.elevationLs}m, 海率rs=${data.autoCalculation.seaRatioRs}, α=${data.autoCalculation.alpha}, β=${data.autoCalculation.beta}, γ=${data.autoCalculation.gamma}, R=${data.autoCalculation.radiusR}km
計算式: ${data.autoCalculation.formula}

【判定・推奨設計値】: ${data.comparison.governingDesignValueCm} cm
${data.comparison.recommendation}

■ 現地気象（気象庁 AMeDAS）
最寄り観測所: ${data.currentWeather.station.name} (${data.currentWeather.station.distanceKm} km, 標高 ${data.currentWeather.station.elevationM} m)
気温: ${data.currentWeather.tempC !== null ? `${data.currentWeather.tempC}℃` : 'データなし'} ｜ 風速: ${data.currentWeather.windSpeedMs !== null ? `${data.currentWeather.windSpeedMs}m/s` : 'データなし'} (${data.currentWeather.windDirection || '—'}) ｜ 気圧: ${data.currentWeather.pressureHpa || '—'} hPa
積雪観測所: ${data.snowObservation.station.name} (${data.snowObservation.station.distanceKm} km, ${data.snowObservation.hasSnowSensor ? '積雪計あり' : '積雪計なし'})
現在積雪深: ${data.snowObservation.snowDepthCm !== null ? `${data.snowObservation.snowDepthCm} cm` : 'データなし（積雪計非設置）'}

■ BESS設計上の留意事項
${data.bessSiteNotes.map(n => `・[${n.severity}] ${n.title}: ${n.description}`).join('\n')}
============================================================
※ 本データは気象・法規積雪条件の決定用です。部材応力計算等は別途構造計算が必要です。`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#002B49] via-[#003860] to-[#0f4c75] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200">
                <CloudSnow className="w-5 h-5 text-blue-300" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                HYBRID SNOW &amp; WEATHER ENGINE
              </span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              BESS Snow &amp; Weather Checker
              <span className="block sm:inline text-lg sm:text-xl font-medium text-slate-200 sm:ml-3">
                積雪・気象条件チェック
              </span>
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              日本国内のBESS（系統用蓄電所）および太陽光発電所設計に向け、建設省告示第1455号による自動計算値と特定行政庁公式規定値を瞬時に対照。
              国土地理院DEM標高・真性海率（$r_s$）および気象庁AMeDAS毎正時実測値から設計積雪荷重条件を算定します。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleCopyReport}
              disabled={!data}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 active:scale-98 text-white rounded-lg text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <FileText className="w-4 h-4 text-blue-200" />
              <span>{copied ? 'レポートをコピー完了！' : '計算書テキストをコピー'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>印刷 / PDF保存</span>
            </button>
          </div>
        </div>

        {/* Regulatory disclaimer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 text-[11px] text-slate-300">
          <Info className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            本ツールは現場の積雪・気象基礎条件（垂直積雪量・凍結・吹きだまりリスク）を判定するエンジニアリングツールです。架台部材応力や基礎強度の構造計算は行いません。
          </span>
        </div>
      </div>

      {/* Input Search & Benchmark Preset Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        {/* Engine Mode Toggle (Online AMeDAS / Offline Standalone) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              動作モード切替 (HYBRID ENGINE MODE)
            </span>
            <span className="text-[11px] text-slate-500">
              オフライン自立モード（通信ゼロ・100%ローカルDB）とオンライン連動（AMeDAS実況・GSI DEM）を切り替え可能
            </span>
          </div>

          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
            <button
              type="button"
              onClick={() => handleToggleMode(false)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                !isOfflineMode
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${!isOfflineMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
              <span>🛰️ ONLINE 連動</span>
              <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(AMeDAS &amp; GSI API)</span>
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode(true)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                isOfflineMode
                  ? 'bg-emerald-700 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOfflineMode ? 'bg-amber-300' : 'bg-slate-400'}`} />
              <span>💾 OFFLINE 完全自立</span>
              <span className="text-[10px] opacity-80 font-normal hidden sm:inline">(通信ゼロ・100%ローカル)</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            計画地住所 または 緯度・経度（Latitude, Longitude）を入力
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="例: 34.444658, 135.745248 または 埼玉県さいたま市大宮区 / 新潟県長岡市"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-[#002B49] focus:border-[#002B49] bg-slate-50/50 hover:bg-white transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#002B49] hover:bg-[#001D33] active:scale-98 text-white rounded-lg text-sm font-semibold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>解析計算中...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>条件解析を実行</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Quick Test Presets (Requested in Prompt) */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>検証用プリセット地点（ワンクリックで切り替え）:</span>
            <span className="text-[11px] text-slate-400">※ 全国の多雪・中雪・沿岸・高所条件を網羅</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {presetLocations.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSearchInput(p.value);
                  fetchSnowWeatherData(p.value);
                }}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                  searchInput === p.value
                    ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold shadow-2xs'
                    : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300'
                }`}
                title={`${p.label} - ${p.desc}`}
              >
                <span>{p.label}</span>
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({p.desc})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">データ解析エラー</p>
            <p className="text-xs text-rose-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Analysis Results Dashboard */}
      {data && (
        <div className="space-y-6">
          {/* 1. Site Information Header Bar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-bold uppercase text-slate-400 tracking-wider">
                PLANNING SITE METRICS ｜ 計画地情報
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{data.site.addressLine}</span>
                </h2>
                <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                  {data.site.prefecture} {data.site.municipality}
                </span>
                {data.engineMode === 'OFFLINE' ? (
                  <span className="text-xs font-mono bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                    <span>💾 OFFLINE 完全自立モード</span>
                    <span className="text-[10px] text-emerald-600 font-normal">（外部通信ゼロ）</span>
                  </span>
                ) : (
                  <span className="text-xs font-mono bg-blue-50 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1.5 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>🛰️ ONLINE リアルタイム連動</span>
                    <span className="text-[10px] text-blue-600 font-normal">（AMeDAS実況・GSI DEM）</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[10px]">座標 (WGS84)</span>
                <span className="font-bold text-slate-800">
                  {data.site.latitude.toFixed(6)}°N, {data.site.longitude.toFixed(6)}°E
                </span>
              </div>
              <div className="p-2 bg-blue-50/80 border border-blue-200 rounded-lg">
                <span className="text-blue-500 block text-[10px]">計画地標高 ls (GSI DEM)</span>
                <span className="font-bold text-blue-900 text-sm">
                  {data.site.elevationM} m
                </span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION B & C: SNOW ENGINE - OFFICIAL CHECK VS 告示1455号 CALC   */}
          {/* ============================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Box 1: 公式値 CHECK (5 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border-2 border-emerald-500/40 p-5 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg font-mono tracking-wider">
                OFFICIAL RULE CHECK
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    【公式値 CHECK】
                  </h3>
                </div>

                <div className="py-2 border-y border-slate-100">
                  <span className="text-xs text-slate-500 block">特定行政庁 指定垂直積雪量</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-mono font-black text-slate-900 tracking-tight">
                      {data.officialCheck.snowDepthCm !== null ? data.officialCheck.snowDepthCm : '—'}
                    </span>
                    <span className="text-lg font-bold text-slate-600 font-mono">cm</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">STATUS:</span>
                    <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
                      data.officialCheck.status === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {data.officialCheck.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">適用規定:</span>
                    <p className="font-semibold text-slate-800 leading-snug">
                      {data.officialCheck.ruleName}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-500 block">所轄特定行政庁:</span>
                    <p className="font-medium text-slate-700">
                      {data.officialCheck.authority}
                    </p>
                  </div>

                  <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 leading-relaxed">
                    {data.officialCheck.explanation}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOfficialRuleModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>公式資料・細則規定を開く（オフラインDB照合）</span>
                </button>
              </div>
            </div>

            {/* Box 2: 告示1455号 自動計算 (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-blue-500/40 p-5 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg font-mono tracking-wider">
                MLIT 1455 CALCULATION
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-blue-600" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    【告示1455号 自動計算】
                  </h3>
                </div>

                <div className="py-2 border-y border-slate-100">
                  <span className="text-xs text-slate-500 block">算定垂直積雪量 $d$</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl sm:text-5xl font-mono font-black text-blue-900 tracking-tight">
                      {data.autoCalculation.calculatedDepthCm}
                    </span>
                    <span className="text-lg font-bold text-blue-700 font-mono">cm</span>
                    <span className="text-xs text-slate-400 font-mono ml-2">
                      ({data.autoCalculation.calculatedDepthM} m)
                    </span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-500 block">算定区域:</span>
                    <p className="font-bold text-slate-900 font-mono">
                      {data.autoCalculation.zoneName}
                    </p>
                  </div>

                  {/* Mathematical Parameters Grid */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 bg-blue-50/50 rounded-lg border border-blue-100 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[9px]">標高 ls</span>
                      <span className="font-bold text-blue-950">{data.autoCalculation.elevationLs} m</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">海率 rs (真値)</span>
                      <span className="font-bold text-blue-950">{data.autoCalculation.seaRatioRs}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">対象半径 R</span>
                      <span className="font-bold text-blue-950">{data.autoCalculation.radiusR} km</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">標高係数 α</span>
                      <span className="font-bold text-slate-800">{data.autoCalculation.alpha}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">海率係数 β</span>
                      <span className="font-bold text-slate-800">{data.autoCalculation.beta}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px]">基準定数 γ</span>
                      <span className="font-bold text-slate-800">{data.autoCalculation.gamma}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">FORMULA (算定式):</span>
                    <code className="block bg-slate-900 text-amber-300 p-2 rounded text-[11px] font-mono overflow-x-auto mt-0.5">
                      d = α × ls + β × rs + γ = {data.autoCalculation.formula}
                    </code>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKokujiModalOpen(true)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>告示原文を開く（条文・40区域パラメータ完全解説）</span>
                </button>
              </div>
            </div>

            {/* Box 3: 比較 & 判定 (3 cols) */}
            <div className="lg:col-span-3 bg-gradient-to-b from-slate-900 to-[#002B49] rounded-2xl p-5 text-white shadow-md flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                  <span className="text-xs font-mono font-bold tracking-wider text-amber-400 uppercase">
                    COMPARISON ｜ 対照結果
                  </span>
                </div>

                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-300">公式値:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {data.comparison.officialDepthCm !== null ? `${data.comparison.officialDepthCm} cm` : '未登録'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/5">
                    <span className="text-slate-300">自動計算値:</span>
                    <span className="font-bold text-blue-300 text-sm">
                      {data.comparison.calculatedDepthCm} cm
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-white/10">
                    <span className="text-slate-300">乖離・差分:</span>
                    <span className="font-bold text-amber-300 text-sm">
                      {data.comparison.differenceCm !== null ? `${data.comparison.differenceCm} cm` : '—'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <span className="text-[10px] text-slate-300 uppercase tracking-widest block font-mono">
                    BESS設計 採用推奨値 (GOVERNING)
                  </span>
                  <div className="text-3xl font-black font-mono text-amber-400 mt-1">
                    {data.comparison.governingDesignValueCm}
                    <span className="text-sm font-normal text-white ml-1">cm</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/10">
                  {data.comparison.recommendation}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 text-[10px] text-slate-400 leading-normal">
                {data.comparison.legalStatusNote}
              </div>
            </div>

          </div>

          {/* ============================================================== */}
          {/* SECTION G & H: CURRENT WEATHER & SNOW OBSERVATION (AMeDAS)       */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <Gauge className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900">
                  気象庁 AMeDAS 現地実況観測（気象観測所 &amp; 積雪計設置観測所）
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                観測日時: {new Date(data.currentWeather.observedAt).toLocaleString('ja-JP')}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: Nearest Weather Station Overview */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">最寄り気象観測所</span>
                  <span className="text-[10px] font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                    {data.currentWeather.station.distanceKm} km
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {data.currentWeather.station.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    観測所標高: {data.currentWeather.station.elevationM} m（現地比 {data.site.elevationM - data.currentWeather.station.elevationM >= 0 ? '+' : ''}{(data.site.elevationM - data.currentWeather.station.elevationM).toFixed(0)}m）
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Thermometer className="w-4 h-4 text-rose-500" />
                    <span className="text-xs text-slate-600">現在気温</span>
                  </div>
                  <span className="text-lg font-black font-mono text-slate-900">
                    {data.currentWeather.tempC !== null ? `${data.currentWeather.tempC.toFixed(1)} ℃` : '—'}
                  </span>
                </div>
              </div>

              {/* Card 2: Wind & Pressure */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">風向・風速・気圧</span>
                  <Wind className="w-4 h-4 text-slate-400" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">風速・風向:</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {data.currentWeather.windSpeedMs !== null ? `${data.currentWeather.windSpeedMs} m/s` : '—'} 
                      <span className="text-xs font-normal text-slate-500 ml-1">({data.currentWeather.windDirection || '—'})</span>
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">現地気圧:</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {data.currentWeather.pressureHpa !== null ? `${data.currentWeather.pressureHpa} hPa` : '—'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">相対湿度:</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      {data.currentWeather.humidityPct !== null ? `${data.currentWeather.humidityPct} %` : '—'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  地上10m観測値（JIS C 8955耐風圧検討パラメータ）
                </div>
              </div>

              {/* Card 3: Precipitation 1h / 24h */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">降水量（雨・雪）</span>
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>

                <div className="space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">1時間降水量:</span>
                    <span className="text-sm font-bold font-mono text-blue-900">
                      {data.currentWeather.precipitation1hMm !== null ? `${data.currentWeather.precipitation1hMm} mm` : '0.0 mm'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-600">24時間降水量:</span>
                    <span className="text-sm font-bold font-mono text-blue-900">
                      {data.currentWeather.precipitation24hMm !== null ? `${data.currentWeather.precipitation24hMm} mm` : '0.0 mm'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500">
                  雨水排水計画およびトレンチ滞水確認用
                </div>
              </div>

              {/* Card 4: Separate Snow Sensor Station (Strict Requirement H) */}
              <div className={`p-4 rounded-xl border space-y-3 ${
                data.snowObservation.hasSnowSensor
                  ? 'bg-blue-50/60 border-blue-200'
                  : 'bg-amber-50/50 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    積雪計観測所（最寄り）
                  </span>
                  <span className="text-[10px] font-mono bg-white text-slate-700 px-1.5 py-0.5 rounded border border-slate-200 font-bold">
                    {data.snowObservation.station.distanceKm} km
                  </span>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {data.snowObservation.station.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">
                    標高: {data.snowObservation.station.elevationM} m ｜ 
                    <span className={data.snowObservation.hasSnowSensor ? 'text-blue-700 font-bold ml-1' : 'text-amber-700 font-bold ml-1'}>
                      {data.snowObservation.hasSnowSensor ? '積雪深計設置' : '積雪深計なし'}
                    </span>
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 space-y-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-700 font-medium">現在積雪深:</span>
                    {data.snowObservation.hasSnowSensor && data.snowObservation.snowDepthCm !== null ? (
                      <span className="text-lg font-black font-mono text-blue-950">
                        {data.snowObservation.snowDepthCm} cm
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                        データなし（積雪計非設置）
                      </span>
                    )}
                  </div>
                  {data.snowObservation.hasSnowSensor && (
                    <div className="flex items-baseline justify-between text-[11px]">
                      <span className="text-slate-500">24時間降雪量:</span>
                      <span className="font-bold font-mono text-slate-800">
                        {data.snowObservation.snowfall24hCm !== null ? `${data.snowObservation.snowfall24hCm} cm` : '0 cm'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION I: 7-DAY WEATHER FORECAST GRID                          */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  週間天気予報（7-Day Weather &amp; Snow Forecast）
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                気象庁数値予報モデル連動
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {data.forecast.map((f, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border text-center space-y-1.5 transition-all ${
                    f.snowExpected 
                      ? 'bg-blue-50/80 border-blue-300 shadow-2xs' 
                      : 'bg-slate-50/50 border-slate-200/80'
                  }`}
                >
                  <div className="text-[11px] font-mono text-slate-500 font-semibold">
                    {f.date.slice(5).replace('-', '/')}
                    {idx === 0 && <span className="ml-1 text-[9px] text-blue-600 font-bold">今日</span>}
                  </div>

                  <div className="text-xs font-bold text-slate-800 line-clamp-1 h-5">
                    {f.weatherText || '—'}
                  </div>

                  {f.snowExpected && (
                    <span className="inline-block text-[9px] font-bold bg-blue-600 text-white px-1.5 py-0.2 rounded-xs">
                      降雪警戒
                    </span>
                  )}

                  <div className="pt-1 border-t border-slate-200/60 text-xs font-mono">
                    <span className="text-rose-600 font-bold">
                      {f.tempMaxC !== null ? `${f.tempMaxC.toFixed(0)}°` : '—'}
                    </span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-blue-600 font-bold">
                      {f.tempMinC !== null ? `${f.tempMinC.toFixed(0)}°` : '—'}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-500 font-mono">
                    降水: {f.popPct !== null ? `${f.popPct}%` : '—'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION J: WINTER & SEASONAL CONDITIONS (平年値・歴史的極値)   */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                冬季・季節情報 ＆ 気候統計平年値（JMA Climate Normals）
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 block text-[11px]">過去観測最深積雪（歴史的極値）</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-slate-900">
                    {data.seasonalConditions.historicalMaxSnowDepthCm} cm
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {data.seasonalConditions.historicalMaxDate || ''}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  法規上の垂直積雪量を超える突発豪雪（南岸低気圧・JPCZ）リスクの把握に用います。
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 block text-[11px]">平年最低気温（極値評価用）</span>
                <div className="text-2xl font-black font-mono text-blue-900">
                  {data.seasonalConditions.normalLowestTempC.toFixed(1)} ℃
                </div>
                <p className="text-[10px] text-slate-500 pt-1">
                  BESSチラー液・PCSインバータの最低動作温度およびPVモジュールVoc最大電圧設計値。
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-slate-500 block text-[11px]">降雪期間 ＆ 年間降雪日数</span>
                <div className="text-sm font-bold text-slate-900 font-mono">
                  {data.seasonalConditions.snowPeriodMonths}
                </div>
                <div className="text-xs text-slate-600 font-mono pt-0.5">
                  年間平均降雪日数: 約 {data.seasonalConditions.normalSnowDaysPerYear} 日
                </div>
                <p className="text-[10px] text-slate-400">
                  冬期O&amp;M点検計画および除雪契約締結期間の目安。
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
              <span className="text-blue-900 font-medium">
                気候区分: <strong className="font-bold">{data.seasonalConditions.climateRegionClassification}</strong>
              </span>
              <span className="text-blue-700 font-mono">
                冬期卓越風向: {data.seasonalConditions.prevailingWinterWind}
              </span>
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION K: BESS SITE NOTES (Engineering Risk Analysis)          */}
          {/* ============================================================== */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                BESS・太陽光 計画地エンジニアリング留意事項（Site Engineering Notes）
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.bessSiteNotes.map((note) => (
                <div 
                  key={note.id} 
                  className={`p-4 rounded-xl border space-y-2 transition-all ${
                    note.severity === 'DANGER'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                      : note.severity === 'WARNING'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider ${
                      note.severity === 'DANGER'
                        ? 'bg-rose-600 text-white'
                        : note.severity === 'WARNING'
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-200 text-slate-800'
                    }`}>
                      {note.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono uppercase">
                      CAT: {note.category}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold leading-snug">
                    {note.title}
                  </h4>

                  <p className="text-xs opacity-90 leading-relaxed">
                    {note.description}
                  </p>

                  <div className="pt-2 border-t border-black/5 text-xs font-medium">
                    <span className="font-bold opacity-75">推奨対策: </span>
                    <span>{note.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* SECTION L: SOURCES & EVIDENCE TABLE (Strict Requirement L)     */}
          {/* ============================================================== */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold tracking-wide uppercase font-mono">
                  SOURCES / 出典 ＆ 公式根拠リンク（Evidence Citations）
                </h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                検証済み公式データ
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.sources.map((s) => (
                <div key={s.id} className="p-3.5 bg-white/5 rounded-xl border border-white/10 space-y-2 hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-amber-300 font-bold px-2 py-0.5 bg-white/10 rounded">
                      {s.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {s.authority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white leading-snug">
                    {s.name}
                  </h4>

                  <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                    {s.description}
                  </p>

                  <div className="pt-1">
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-mono transition-colors group"
                    >
                      <span className="truncate max-w-[280px]">{s.url}</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* 100% Offline Statutory Inspector Modal for Kokuji 1455 */}
      <Kokuji1455Modal
        isOpen={isKokujiModalOpen}
        onClose={() => setIsKokujiModalOpen(false)}
        activeZoneId={data?.autoCalculation.zoneId}
        currentElevationM={data?.site.elevationM}
        currentSeaRatioRs={data?.autoCalculation.seaRatioRs}
        calculatedDepthCm={data?.autoCalculation.calculatedDepthCm}
      />

      {/* 100% Offline Local Authority Rule Inspector Modal */}
      {data && (
        <OfficialRuleModal
          isOpen={isOfficialRuleModalOpen}
          onClose={() => setIsOfficialRuleModalOpen(false)}
          officialCheck={data.officialCheck}
          site={data.site}
        />
      )}
    </div>
  );
};
