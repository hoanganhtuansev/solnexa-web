/**
 * SOLNEXA Review Service
 * Manages the Datasheet Review & Verification workflow.
 * Enforces rule: Only approved parameters and models enter the active engineering database.
 */

import { EquipmentModel, EquipmentSpecification, ReviewStatus } from '../../src/types';
import { db } from '../db/database';
import { specificationNormalizer } from './specificationNormalizer';

export class ReviewService {
  public getPendingEquipment(): EquipmentModel[] {
    const unapproved = db.getModels({ isApproved: false });
    if (unapproved.length > 0) return unapproved;
    // Fallback: return ingested models so engineers can always review, verify and annotate datasheets
    return db.getModels().slice(0, 8);
  }

  public getModelReviewDetails(modelId: string): {
    model: EquipmentModel;
    specifications: EquipmentSpecification[];
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    conflictsCount: number;
  } | null {
    const model = db.getModelById(modelId);
    if (!model) return null;

    const specs = db.getSpecificationsByModelId(modelId);
    const pendingCount = specs.filter(s => s.reviewStatus === 'PENDING').length;
    const approvedCount = specs.filter(s => s.reviewStatus === 'APPROVED').length;
    const rejectedCount = specs.filter(s => s.reviewStatus === 'REJECTED').length;
    const conflictsCount = specs.filter(s => s.hasConflict).length;

    return {
      model,
      specifications: specs,
      pendingCount,
      approvedCount,
      rejectedCount,
      conflictsCount
    };
  }

  public updateSpecification(
    specId: string,
    updates: {
      displayName?: string;
      rawValue?: string;
      rawUnit?: string;
      normalizedValue?: number | string;
      normalizedUnit?: string;
      reviewStatus?: ReviewStatus;
      notes?: string;
    }
  ): EquipmentSpecification | null {
    const specs = db.getSpecificationsByModelId(''); // search all
    // Fetch directly from db
    const existing = db.getModels().flatMap(m => m.specifications || []).find(s => s.id === specId);
    if (!existing) return null;

    if (updates.rawValue !== undefined || updates.rawUnit !== undefined) {
      const rawVal = updates.rawValue ?? existing.rawValue;
      const rawUnit = updates.rawUnit ?? existing.rawUnit;
      const norm = specificationNormalizer.normalize(existing.parameterName, rawVal, rawUnit);
      existing.rawValue = rawVal;
      existing.rawUnit = rawUnit;
      existing.normalizedValue = updates.normalizedValue ?? norm.normalizedValue;
      existing.normalizedUnit = updates.normalizedUnit ?? norm.normalizedUnit;
    }

    if (updates.displayName !== undefined) existing.displayName = updates.displayName;
    if (updates.reviewStatus !== undefined) existing.reviewStatus = updates.reviewStatus;
    if (updates.notes !== undefined) existing.notes = updates.notes;
    existing.hasConflict = false; // Resolved by user edit

    return db.upsertSpecification(existing);
  }

  public approveSpecification(specId: string): EquipmentSpecification | null {
    const spec = db.approveSpecification(specId);
    return spec || null;
  }

  public rejectSpecification(specId: string): EquipmentSpecification | null {
    const spec = db.rejectSpecification(specId);
    return spec || null;
  }

  public addMissingSpecification(
    modelId: string,
    paramData: {
      parameterName: string;
      displayName: string;
      rawValue: string;
      rawUnit: string;
      sourcePage?: number;
    }
  ): EquipmentSpecification {
    const model = db.getModelById(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    const norm = specificationNormalizer.normalize(paramData.parameterName, paramData.rawValue, paramData.rawUnit);
    const specId = `spec-${modelId}-man-${Date.now()}`;

    const newSpec: EquipmentSpecification = {
      id: specId,
      modelId,
      parameterName: paramData.parameterName,
      displayName: paramData.displayName || paramData.parameterName,
      rawValue: paramData.rawValue,
      rawUnit: paramData.rawUnit,
      normalizedValue: norm.normalizedValue,
      normalizedUnit: norm.normalizedUnit,
      sourceDocument: model.datasheetFilename || 'Manual Entry',
      sourcePage: paramData.sourcePage || 1,
      confidence: 1.0,
      extractionMethod: 'MANUAL_ENTRY',
      reviewStatus: 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return db.upsertSpecification(newSpec);
  }

  public approveAllAndCommit(
    modelId: string,
    modelMetadataUpdates?: {
      manufacturerName?: string;
      modelName?: string;
      categoryCode?: any;
      series?: string;
      description?: string;
    }
  ): EquipmentModel {
    const model = db.getModelById(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    // Approve all pending specifications for this model
    const specs = db.getSpecificationsByModelId(modelId);
    for (const spec of specs) {
      if (spec.reviewStatus === 'PENDING') {
        spec.reviewStatus = 'APPROVED';
        spec.hasConflict = false;
        db.upsertSpecification(spec);
      }
    }

    // Apply metadata changes if user edited header
    if (modelMetadataUpdates) {
      if (modelMetadataUpdates.manufacturerName) {
        const mfg = db.getOrCreateManufacturer(modelMetadataUpdates.manufacturerName);
        model.manufacturerId = mfg.id;
        model.manufacturerName = mfg.name;
      }
      if (modelMetadataUpdates.modelName) model.modelName = modelMetadataUpdates.modelName;
      if (modelMetadataUpdates.categoryCode) model.categoryCode = modelMetadataUpdates.categoryCode;
      if (modelMetadataUpdates.series !== undefined) model.series = modelMetadataUpdates.series;
      if (modelMetadataUpdates.description !== undefined) model.description = modelMetadataUpdates.description;
    }

    // Commit to database
    model.isApproved = true;
    model.revision = (model.revision || 1) + 1;
    model.updatedAt = new Date().toISOString();

    db.upsertModel(model);
    return model;
  }
}

export const reviewService = new ReviewService();
