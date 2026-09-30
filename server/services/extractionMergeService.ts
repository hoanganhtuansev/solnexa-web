/**
 * SOLNEXA Extraction Merge Service
 * Merges Native and AI extractions, detects parameter conflicts,
 * computes blended confidence scores, and prepares candidates for Review.
 */

import { EquipmentSpecification } from '../../src/types';
import { NativeParsedResult } from './nativeSpecificationParser';
import { AIExtractedSpec } from './ai/aiProviderInterface';
import { specificationNormalizer } from './specificationNormalizer';

export interface MergeResult {
  mergedSpecs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>>;
  conflictsCount: number;
  totalCandidates: number;
  warnings: string[];
}

export class ExtractionMergeService {
  public merge(
    nativeResult: NativeParsedResult,
    aiSpecs: AIExtractedSpec[],
    documentFilename: string
  ): MergeResult {
    const specMap: Map<
      string,
      Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>
    > = new Map();

    const warnings: string[] = [];
    let conflictsCount = 0;

    // 1. Ingest Native Specifications
    for (const nativeSpec of nativeResult.specifications) {
      const norm = specificationNormalizer.normalize(
        nativeSpec.parameterName,
        nativeSpec.rawValue,
        nativeSpec.rawUnit
      );

      specMap.set(nativeSpec.parameterName, {
        ...nativeSpec,
        normalizedValue: norm.normalizedValue,
        normalizedUnit: norm.normalizedUnit,
        reviewStatus: 'PENDING',
        alternativeValues: []
      });
    }

    // 2. Merge AI Specifications
    for (const aiSpec of aiSpecs) {
      const existing = specMap.get(aiSpec.parameterName);

      const norm = specificationNormalizer.normalize(
        aiSpec.parameterName,
        aiSpec.rawValue,
        aiSpec.rawUnit
      );

      if (!existing) {
        // AI found a parameter native parser missed!
        specMap.set(aiSpec.parameterName, {
          parameterName: aiSpec.parameterName,
          displayName: aiSpec.displayName,
          rawValue: aiSpec.rawValue,
          rawUnit: aiSpec.rawUnit,
          normalizedValue: norm.normalizedValue,
          normalizedUnit: norm.normalizedUnit,
          sourceDocument: documentFilename,
          sourcePage: aiSpec.sourcePage,
          confidence: aiSpec.confidence,
          extractionMethod: 'AI_GEMINI',
          reviewStatus: 'PENDING',
          notes: aiSpec.notes,
          alternativeValues: []
        });
      } else {
        // Both found the parameter! Compare values for conflicts or reinforcement
        const nativeValStr = String(existing.normalizedValue).trim().toLowerCase();
        const aiValStr = String(norm.normalizedValue).trim().toLowerCase();

        if (nativeValStr === aiValStr || Math.abs(Number(existing.normalizedValue) - Number(norm.normalizedValue)) < 0.01) {
          // Agreement! Boost confidence score
          existing.confidence = Math.min(0.99, Math.max(existing.confidence, aiSpec.confidence) + 0.04);
          existing.extractionMethod = 'MERGED';
          existing.notes = (existing.notes ? existing.notes + '; ' : '') + 'Verified by AI multimodal parser';
        } else {
          // Conflict detected!
          conflictsCount++;
          existing.hasConflict = true;
          existing.confidence = Math.min(existing.confidence, aiSpec.confidence) * 0.85; // Lower confidence as per safety rules
          existing.notes = `Discrepancy: Native parsed '${existing.rawValue}', AI parsed '${aiSpec.rawValue}'`;
          warnings.push(`Conflict on ${existing.displayName}: Native (${existing.rawValue}) vs AI (${aiSpec.rawValue})`);

          if (!existing.alternativeValues) {
            existing.alternativeValues = [];
          }
          existing.alternativeValues.push({
            value: aiSpec.rawValue,
            unit: aiSpec.rawUnit,
            method: 'AI_GEMINI',
            confidence: aiSpec.confidence,
            page: aiSpec.sourcePage
          });
        }
      }
    }

    const mergedSpecs = Array.from(specMap.values());

    return {
      mergedSpecs,
      conflictsCount,
      totalCandidates: mergedSpecs.length,
      warnings
    };
  }
}

export const extractionMergeService = new ExtractionMergeService();
