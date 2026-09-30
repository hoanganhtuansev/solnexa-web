/**
 * SOLNEXA AI Provider Abstraction Interface
 * Vendor-neutral abstraction for engineering extraction.
 */

import { EquipmentCategoryCode } from '../../../src/types';

export interface AIIdentityResult {
  manufacturer: string;
  model: string;
  category: EquipmentCategoryCode;
  series?: string;
  description?: string;
  confidence: number;
}

export interface AIExtractedSpec {
  parameterName: string;
  displayName: string;
  rawValue: string;
  rawUnit: string;
  normalizedValue: number | string;
  normalizedUnit: string;
  sourcePage: number;
  confidence: number;
  notes?: string;
}

export interface AIAnalysisResult {
  provider: string;
  model: string;
  identity: AIIdentityResult;
  specifications: AIExtractedSpec[];
  processingTimeMs: number;
  rawResponse?: string;
  warning?: string;
}

export interface AIProvider {
  readonly name: string;
  readonly supportedModels: string[];

  isConfigured(): boolean;

  classifyEquipment(text: string): Promise<EquipmentCategoryCode>;

  extractEquipmentIdentity(documentText: string, filename: string): Promise<AIIdentityResult>;

  extractSpecifications(
    pageText: string,
    pageNumber: number,
    category: EquipmentCategoryCode,
    modelContext?: string
  ): Promise<AIExtractedSpec[]>;

  analyzePageImage?(
    imageBase64: string,
    mimeType: string,
    pageNumber: number,
    category: EquipmentCategoryCode
  ): Promise<AIExtractedSpec[]>;
}
