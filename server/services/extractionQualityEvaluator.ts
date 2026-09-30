/**
 * SOLNEXA Extraction Quality Evaluator
 * Evaluates native text extraction quality, checks core technical parameter completeness,
 * and determines whether Native parsing is sufficient (Bypassing AI) or requires AI Fallback.
 */

import { ExtractedPageText } from './pdfTextExtractor';
import { IngestionPipelineMode } from '../../src/types';

export interface QualityEvaluationResult {
  overallScore: number; // 0.0 to 1.0
  isSufficient: boolean;
  needsAiFallback: boolean;
  targetPagesForAi: number[];
  reasons: string[];
  pageScores: Array<{
    pageNumber: number;
    score: number;
    charLength: number;
    keywordDensity: number;
    recommendation: 'NATIVE' | 'AI_FALLBACK';
    reason: string;
  }>;
}

export class ExtractionQualityEvaluator {
  private readonly MIN_CHAR_THRESHOLD = 80;
  private readonly MIN_KEYWORD_DENSITY = 0.015;

  public evaluate(
    pages: ExtractedPageText[],
    options?: {
      pipelineMode?: IngestionPipelineMode;
      qualityThreshold?: number;
      nativeSpecsCount?: number;
      criticalParamsFound?: string[];
      totalCriticalNeeded?: number;
    }
  ): QualityEvaluationResult {
    const pipelineMode = options?.pipelineMode || 'AUTO_HYBRID';
    const qualityThreshold = options?.qualityThreshold ?? 0.70;
    const nativeSpecsCount = options?.nativeSpecsCount ?? 0;
    const criticalParamsFound = options?.criticalParamsFound ?? [];
    const totalCriticalNeeded = options?.totalCriticalNeeded ?? 3;

    const reasons: string[] = [];
    const targetPagesForAi: number[] = [];
    const pageScores: QualityEvaluationResult['pageScores'] = [];

    if (pages.length === 0) {
      return {
        overallScore: 0,
        isSufficient: false,
        needsAiFallback: pipelineMode !== 'STRICT_NATIVE',
        targetPagesForAi: [1],
        reasons: ['Tệp tài liệu không chứa trang hoặc không trích xuất được ký tự nào.'],
        pageScores: []
      };
    }

    // Strict Native Override
    if (pipelineMode === 'STRICT_NATIVE') {
      return {
        overallScore: 1.0,
        isSufficient: true,
        needsAiFallback: false,
        targetPagesForAi: [],
        reasons: ['Chế độ Thuần Native (Strict Native Offline) đang bật: Tuyệt đối không gọi AI API.'],
        pageScores: pages.map(p => ({
          pageNumber: p.pageNumber,
          score: 1.0,
          charLength: p.charLength,
          keywordDensity: p.electricalKeywordDensity,
          recommendation: 'NATIVE',
          reason: 'Bắt buộc dùng Native theo cài đặt'
        }))
      };
    }

    // Force AI Override
    if (pipelineMode === 'FORCE_AI') {
      return {
        overallScore: 0.5,
        isSufficient: false,
        needsAiFallback: true,
        targetPagesForAi: pages.map(p => p.pageNumber),
        reasons: ['Chế độ Luôn gọi AI đối chiếu (Force AI) được kích hoạt: Chạy phân tích AI toàn bộ trang.'],
        pageScores: pages.map(p => ({
          pageNumber: p.pageNumber,
          score: 0.5,
          charLength: p.charLength,
          keywordDensity: p.electricalKeywordDensity,
          recommendation: 'AI_FALLBACK',
          reason: 'Bắt buộc gọi AI đối chiếu'
        }))
      };
    }

    // AUTO_HYBRID Mode Evaluation
    let totalScoreSum = 0;

    for (const page of pages) {
      let pageScore = 0;
      let recommendation: 'NATIVE' | 'AI_FALLBACK' = 'NATIVE';
      let pageReason = '';

      // 1. Text length evaluation (scanned or image-only pages typically have < 80 characters)
      if (page.charLength < this.MIN_CHAR_THRESHOLD) {
        pageScore = 0.2;
        recommendation = 'AI_FALLBACK';
        pageReason = `Trang có ít ký tự (${page.charLength} ký tự), khả năng là trang scan hoặc hình ảnh.`;
        targetPagesForAi.push(page.pageNumber);
      } else {
        pageScore += 0.4;

        // 2. Keyword density evaluation (electrical engineering terms)
        if (page.electricalKeywordDensity >= this.MIN_KEYWORD_DENSITY) {
          pageScore += 0.4;
        } else {
          pageScore += 0.15;
          pageReason = 'Mật độ từ khóa kỹ thuật điện thấp.';
        }

        // 3. Table structure evaluation
        if (page.hasTables) {
          pageScore += 0.2;
          pageReason = 'Phát hiện cấu trúc bảng thông số kỹ thuật rõ ràng.';
        } else {
          pageScore += 0.1;
          pageReason = pageReason || 'Văn bản kỹ thuật thông thường.';
        }
      }

      const normalizedPageScore = Math.min(1.0, Math.max(0.0, pageScore));
      totalScoreSum += normalizedPageScore;

      pageScores.push({
        pageNumber: page.pageNumber,
        score: Math.round(normalizedPageScore * 100) / 100,
        charLength: page.charLength,
        keywordDensity: Math.round(page.electricalKeywordDensity * 1000) / 1000,
        recommendation,
        reason: pageReason
      });
    }

    const overallScore = Math.round((totalScoreSum / pages.length) * 100) / 100;

    // Decision Logic for "Nếu đọc tốt -> không gọi AI":
    // 1. Overall text quality score exceeds threshold (e.g. >= 0.70)
    // 2. Native parser found sufficient number of specifications (>= 4)
    // 3. At least the core critical parameters were found (e.g. Voc, Vmp, Pmax or Vmax, Iac, Prated)
    const hasEnoughCriticalParams = criticalParamsFound.length >= totalCriticalNeeded;
    const hasSolidSpecsCount = nativeSpecsCount >= 4;
    const hasGoodOverallScore = overallScore >= qualityThreshold;

    const isSufficient = hasGoodOverallScore && hasEnoughCriticalParams && hasSolidSpecsCount;
    const needsAiFallback = !isSufficient;

    if (!needsAiFallback) {
      reasons.push(
        `Đọc tốt (${Math.round(overallScore * 100)}%): Native Parser đã bóc tách chính xác ${nativeSpecsCount} thông số gồm đầy đủ ${criticalParamsFound.length} thông số cốt lõi. Hoàn thành ngay, không gọi AI.`
      );
    } else {
      if (!hasSolidSpecsCount || !hasEnoughCriticalParams) {
        reasons.push(
          `Đọc khó: Native Parser chỉ trích xuất được ${nativeSpecsCount} thông số (tìm thấy ${criticalParamsFound.length}/${totalCriticalNeeded} thông số cốt lõi). Kích hoạt AI Fallback để bổ sung.`
        );
      }
      if (overallScore < qualityThreshold) {
        reasons.push(
          `Chất lượng văn bản gốc thấp (${Math.round(overallScore * 100)}% < ngưỡng ${Math.round(qualityThreshold * 100)}%). Cần AI hỗ trợ đọc hiểu.`
        );
      }
      if (targetPagesForAi.length > 0) {
        reasons.push(`Trang [${targetPagesForAi.join(', ')}] chứa bảng phức tạp hoặc là trang quét ảnh.`);
      }
    }

    return {
      overallScore,
      isSufficient,
      needsAiFallback,
      targetPagesForAi: needsAiFallback && targetPagesForAi.length === 0 ? [1] : targetPagesForAi,
      reasons,
      pageScores
    };
  }
}

export const extractionQualityEvaluator = new ExtractionQualityEvaluator();
