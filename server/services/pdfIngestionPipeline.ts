/**
 * SOLNEXA PDF Ingestion Pipeline Coordinator
 * Implements the 3-tier Decision Architecture:
 * 1. Native Parser first
 * 2. If good read (Đọc tốt) -> Bypass AI (0 API tokens, 0 network latency)
 * 3. If difficult (Khó) -> Fallback to Gemini / Claude / OpenAI / Local Machine LLM
 * 4. If still uncertain (Không chắc) -> Flag as Review Required with explicit reasoning
 */

import {
  Datasheet,
  EquipmentModel,
  EquipmentSpecification,
  ExtractionRun,
  ExtractionDiagnostics,
  IngestionResult
} from '../../src/types';
import { db } from '../db/database';
import { pdfStorageService } from './pdfStorageService';
import { pdfTextExtractor } from './pdfTextExtractor';
import { extractionQualityEvaluator } from './extractionQualityEvaluator';
import { nativeSpecificationParser } from './nativeSpecificationParser';
import { aiProviderManager } from './ai/aiProviderManager';
import { extractionMergeService } from './extractionMergeService';
import { AIExtractedSpec } from './ai/aiProviderInterface';

function getCriticalParamsForCategory(category: string): string[] {
  switch (category) {
    case 'PV_MODULE':
      return ['pmax_stc', 'voc_stc', 'vmp_stc', 'isc_stc'];
    case 'PCS_INVERTER':
      return ['max_dc_input_voltage', 'rated_ac_active_power', 'max_efficiency'];
    case 'BESS':
    case 'BATTERY':
      return ['battery_energy_capacity', 'nominal_voltage'];
    case 'TRANSFORMER':
      return ['rated_power_kva', 'primary_voltage'];
    case 'CABLE':
      return ['cross_section_mm2', 'current_carrying_capacity'];
    default:
      return ['rated_power', 'rated_voltage'];
  }
}

export class PdfIngestionPipeline {
  public async ingest(originalFilename: string, fileBuffer: Buffer): Promise<IngestionResult> {
    const startTime = Date.now();
    const warnings: string[] = [];
    const errors: string[] = [];
    const reviewReasons: string[] = [];

    // 0. Current settings
    const pipelineMode = aiProviderManager.getPipelineMode();
    const qualityThreshold = aiProviderManager.getQualityThreshold();
    const confidenceThreshold = aiProviderManager.getConfidenceThreshold();

    // 1. Store original PDF
    const datasheet = pdfStorageService.storePdf(originalFilename, fileBuffer);

    // 2. Extract Native Text per page
    const textExtraction = await pdfTextExtractor.extractText(fileBuffer);
    datasheet.pageCount = textExtraction.pageCount;
    db.addDatasheet(datasheet);

    // 3. TIER 1: Native specification parser runs FIRST
    const nativeResult = nativeSpecificationParser.parse(textExtraction.pages, originalFilename);

    // Check which critical parameters were extracted by Native Parser
    const criticalNeeded = getCriticalParamsForCategory(nativeResult.identity.category);
    const nativeFoundCritical = criticalNeeded.filter(paramName =>
      nativeResult.specifications.some(s => s.parameterName === paramName || s.parameterName.includes(paramName))
    );

    // 4. Evaluate extraction quality and decide if Native is sufficient
    const qualityEval = extractionQualityEvaluator.evaluate(textExtraction.pages, {
      pipelineMode,
      qualityThreshold,
      nativeSpecsCount: nativeResult.specifications.length,
      criticalParamsFound: nativeFoundCritical,
      totalCriticalNeeded: Math.min(3, criticalNeeded.length)
    });

    // 5. TIER 2: AI Fallback Decision
    // If Native read is good -> DO NOT call AI!
    let aiSpecs: AIExtractedSpec[] = [];
    let aiFallbackUsed = false;
    const pagesSentToAi: number[] = [];
    const aiBypassed = !qualityEval.needsAiFallback;

    const aiProvider = aiProviderManager.getProvider();
    const activeProviderName = aiProviderManager.getActiveProviderName();

    if (qualityEval.needsAiFallback && pipelineMode !== 'STRICT_NATIVE') {
      aiFallbackUsed = true;
      const targetPages = qualityEval.targetPagesForAi.length > 0
        ? qualityEval.targetPagesForAi
        : [1];

      for (const pageNum of targetPages) {
        const pageData = textExtraction.pages.find(p => p.pageNumber === pageNum);
        if (pageData) {
          pagesSentToAi.push(pageNum);
          try {
            const pageSpecs = await aiProvider.extractSpecifications(
              pageData.text,
              pageNum,
              nativeResult.identity.category,
              `${nativeResult.identity.manufacturer} ${nativeResult.identity.model}`
            );
            aiSpecs.push(...pageSpecs);
          } catch (err: any) {
            console.warn(`AI extraction failed on page ${pageNum}:`, err);
            warnings.push(`AI fallback failed on page ${pageNum}: ${err.message || err}`);
          }
        }
      }
    } else {
      warnings.push(...qualityEval.reasons);
    }

    // 6. Merge Native & AI extractions (or keep Native if AI was bypassed)
    const mergeResult = extractionMergeService.merge(nativeResult, aiSpecs, originalFilename);
    warnings.push(...mergeResult.warnings);

    // 7. Resolve Manufacturer
    const mfg = db.getOrCreateManufacturer(nativeResult.identity.manufacturer);

    // 8. TIER 3: "Nếu vẫn không chắc -> Review Required"
    // Evaluate uncertainty factors:
    let requiresReview = false;

    // A. Check for merge conflicts
    if (mergeResult.conflictsCount > 0) {
      requiresReview = true;
      reviewReasons.push(`Phát hiện ${mergeResult.conflictsCount} xung đột giá trị giữa Native Parser và AI (cần kỹ sư xác nhận)`);
    }

    // B. Check for low confidence parameters (< confidenceThreshold)
    const lowConfidenceSpecs = mergeResult.mergedSpecs.filter(s => s.confidence < confidenceThreshold);
    if (lowConfidenceSpecs.length > 0) {
      requiresReview = true;
      reviewReasons.push(`Có ${lowConfidenceSpecs.length} thông số có độ tự tin thấp (< ${Math.round(confidenceThreshold * 100)}%)`);
    }

    // C. Check if any critical parameters are still missing
    const missingCritical = criticalNeeded.filter(paramName =>
      !mergeResult.mergedSpecs.some(s => s.parameterName === paramName || s.parameterName.includes(paramName))
    );
    if (missingCritical.length > 0) {
      requiresReview = true;
      reviewReasons.push(`Thiếu thông số an toàn kỹ thuật cốt lõi: ${missingCritical.slice(0, 3).join(', ')}`);
    }

    // D. Check if identity is ambiguous
    if (nativeResult.identity.model.toLowerCase() === 'unknown' || nativeResult.identity.manufacturer.toLowerCase() === 'unknown') {
      requiresReview = true;
      reviewReasons.push('Chưa xác định chắc chắn Nhà sản xuất hoặc Mã Model thiết bị');
    }

    // Determine Pipeline Status
    let pipelineStatus: 'NATIVE_SUCCESS' | 'AI_FALLBACK' | 'REVIEW_REQUIRED';
    if (requiresReview) {
      pipelineStatus = 'REVIEW_REQUIRED';
    } else if (aiFallbackUsed) {
      pipelineStatus = 'AI_FALLBACK';
    } else {
      pipelineStatus = 'NATIVE_SUCCESS';
    }

    // 9. Create Equipment Model in PENDING review state
    const modelId = `eq-${mfg.id}-${Date.now()}`;
    const equipmentModel: EquipmentModel = {
      id: modelId,
      manufacturerId: mfg.id,
      manufacturerName: mfg.name,
      categoryCode: nativeResult.identity.category,
      modelName: nativeResult.identity.model,
      series: nativeResult.identity.series,
      description: nativeResult.identity.description,
      datasheetId: datasheet.id,
      datasheetFilename: datasheet.originalFilename,
      isApproved: false,
      revision: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.upsertModel(equipmentModel);

    // 10. Store candidate specifications with review status PENDING
    const storedSpecs: EquipmentSpecification[] = [];
    mergeResult.mergedSpecs.forEach((s, idx) => {
      const specId = `spec-${modelId}-${idx + 1}`;
      const fullSpec: EquipmentSpecification = {
        id: specId,
        modelId,
        ...s,
        reviewStatus: s.confidence < confidenceThreshold ? 'PENDING' : s.reviewStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.upsertSpecification(fullSpec);
      storedSpecs.push(fullSpec);
    });

    // 11. Store source references
    for (const ref of nativeResult.sourceSnippets) {
      db.addSourceReference({
        id: `ref-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        modelId,
        pageNumber: ref.pageNumber,
        snippetText: ref.snippetText,
        parameterName: ref.parameterName
      });
    }

    const processingTimeMs = Date.now() - startTime;

    // 12. Compile Extraction Diagnostics
    let parserUsedName = '';
    if (pipelineMode === 'STRICT_NATIVE') {
      parserUsedName = 'Thuần Native Regex & Table Parser (100% Offline)';
    } else if (!aiFallbackUsed) {
      parserUsedName = 'Native Parser (Đọc tốt - 0 AI Token)';
    } else {
      parserUsedName = `Hybrid (Native + ${activeProviderName})`;
    }

    const diagnostics: ExtractionDiagnostics = {
      pageCount: textExtraction.pageCount,
      pageTextLengths: textExtraction.pages.map(p => ({
        page: p.pageNumber,
        charLength: p.charLength,
        wordCount: p.wordCount
      })),
      nativeQualityScore: qualityEval.overallScore,
      parserUsed: parserUsedName,
      aiFallbackUsed,
      pagesSentToAi,
      aiProvider: aiFallbackUsed ? activeProviderName : 'Không sử dụng (Đã bỏ qua AI)',
      extractedParametersCount: storedSpecs.length,
      rejectedFieldsCount: 0,
      mergeConflictsCount: mergeResult.conflictsCount,
      processingTimeMs,
      pipelineMode,
      isNativeSufficient: qualityEval.isSufficient,
      aiBypassed,
      nativeEvaluationReasons: qualityEval.reasons,
      reviewReasons,
      warnings,
      errors
    };

    const extractionRun: ExtractionRun = {
      id: `run-${Date.now()}`,
      datasheetId: datasheet.id,
      modelId,
      parserUsed: diagnostics.parserUsed,
      nativeQualityScore: qualityEval.overallScore,
      aiFallbackUsed,
      pagesSentToAi,
      extractedCount: storedSpecs.length,
      rejectedCount: 0,
      conflictsCount: mergeResult.conflictsCount,
      processingTimeMs,
      diagnostics,
      createdAt: new Date().toISOString()
    };

    db.addExtractionRun(extractionRun);

    return {
      datasheet,
      equipment: equipmentModel,
      specifications: storedSpecs,
      extractionRun,
      requiresReview,
      reviewReasons,
      isNativeSufficient: qualityEval.isSufficient,
      aiBypassed,
      pipelineStatus
    };
  }
}

export const pdfIngestionPipeline = new PdfIngestionPipeline();
