/**
 * SOLNEXA - Local Authority Official Snow Rule Inspector Modal
 * 自治体公式垂直積雪量・建築基準法施行細則ビューア
 * 100% Offline Standalone - Local Rules Database
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  ExternalLink,
  Copy,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { OfficialSnowCheckResult, SiteLocationInfo } from '../../server/snowEngine/types';

interface OfficialRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  officialCheck: OfficialSnowCheckResult;
  site: SiteLocationInfo;
}

export const OfficialRuleModal: React.FC<OfficialRuleModalProps> = ({
  isOpen,
  onClose,
  officialCheck,
  site
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `【特定行政庁 垂直積雪量公式規定】
所轄自治体: ${officialCheck.authority}
規定名称: ${officialCheck.ruleName}
指定積雪量: ${officialCheck.snowDepthCm !== null ? `${officialCheck.snowDepthCm} cm` : '未指定（告示1455号計算値を適用）'}
検証ステータス: ${officialCheck.status}
施行日/改訂: ${officialCheck.effectiveDate || '—'}
照合検証日: ${officialCheck.verifiedDate || '—'}
公式出典: ${officialCheck.sourceTitle}
出典URL: ${officialCheck.sourceUrl}

【計画地】
所在地: ${site.addressLine}
標高: ${site.elevationM} m

解説:
${officialCheck.explanation}

※ SOLNEXA 自治体細則データベース（100%オフライン照合済）`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800 font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#002B49] text-white p-4 sm:p-5 flex items-start justify-between gap-3 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-300 uppercase bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                OFFICIAL AUTHORITY BYLAWS
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                officialCheck.status === 'VERIFIED'
                  ? 'bg-emerald-400 text-slate-950'
                  : 'bg-amber-400 text-slate-950'
              }`}>
                {officialCheck.status}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold tracking-tight text-white">
              特定行政庁 垂直積雪量公式規定
            </h2>
            <p className="text-[11px] text-slate-300">
              建築基準法施行令第86条第2項ただし書に基づく自治体細則・告示
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar text-xs">
          
          {/* Main Verified Badge & Snow Depth */}
          <div className="p-4 rounded-xl border-2 border-emerald-500/50 bg-emerald-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                公式指定垂直積雪量
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-mono font-black text-slate-900">
                  {officialCheck.snowDepthCm !== null ? officialCheck.snowDepthCm : '—'}
                </span>
                <span className="text-base font-bold text-slate-600 font-mono">cm</span>
              </div>
              <p className="text-[11px] text-slate-600">
                所在地: {site.addressLine}（現地標高 {site.elevationM} m）
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <div className="text-[10px] text-slate-500 font-mono">所轄特定行政庁</div>
              <div className="text-sm font-bold text-slate-900">{officialCheck.authority}</div>
              <div className="text-[10px] text-emerald-700 font-mono font-semibold">
                {officialCheck.isMunicipalityLevel ? '市区町村指定細則' : '都道府県細則適用'}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">適用規定・法令条文</span>
              <strong className="text-xs text-slate-900 block">{officialCheck.ruleName}</strong>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">施行・改訂 / 検証日</span>
              <div className="text-xs text-slate-800 font-mono">
                施行: {officialCheck.effectiveDate || '現行細則'}<br />
                検証: {officialCheck.verifiedDate || '2026年'}
              </div>
            </div>
          </div>

          {/* Explanation Text */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>規定内容および設計適用の解説</span>
            </h4>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-slate-700 leading-relaxed">
              {officialCheck.explanation}
            </div>
          </div>

          {/* Source Link */}
          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200 space-y-2">
            <span className="text-[11px] font-bold text-blue-900 block">
              自治体公式ポータル・公開資料
            </span>
            <p className="text-[11px] text-slate-600">
              {officialCheck.sourceTitle}
            </p>
            <div className="pt-1">
              <a
                href={officialCheck.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-700 hover:text-blue-900 font-mono font-semibold hover:underline"
              >
                <span>{officialCheck.sourceUrl}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>オフライン細則DBより抽出</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'コピー完了' : '規定をコピー'}</span>
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
