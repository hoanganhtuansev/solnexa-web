/**
 * SOLNEXA Web - Core Domain Types & Data Models
 */

export type ActiveTab =
  | 'dashboard'
  | 'quick-engineering'
  | 'projects'
  | 'workspace'
  | 'library'
  | 'datasheets'
  | 'review'
  | 'cables'
  | 'price-book'
  | 'tools'
  | 'settings'
  | 'ingest'
  | 'calculators'
  | 'boq';

export type EquipmentCategoryCode =
  | 'PV_MODULE'
  | 'PCS_INVERTER'
  | 'BESS'
  | 'BATTERY'
  | 'TRANSFORMER'
  | 'QB_CUBICLE'
  | 'MCCB'
  | 'ACB'
  | 'VCB'
  | 'FUSE'
  | 'CABLE'
  | 'COMBINER_BOX'
  | 'DISTRIBUTION_BOARD'
  | 'OTHER';

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ExtractionMethod = 'NATIVE_REGEX' | 'NATIVE_TABLE' | 'AI_GEMINI' | 'AI_MULTIMODAL' | 'MANUAL_ENTRY' | 'MERGED';

export interface Manufacturer {
  id: string;
  name: string;
  country?: string;
  website?: string;
  notes?: string;
  equipmentCount?: number;
  createdAt: string;
}

export interface EquipmentCategory {
  code: EquipmentCategoryCode;
  name: string;
  description: string;
  iconName: string;
  standardParameters: string[];
}

export interface Datasheet {
  id: string;
  originalFilename: string;
  storagePath: string;
  fileSize: number;
  mimeType: string;
  pageCount: number;
  uploadDate: string;
  sha256?: string;
}

export interface EquipmentSpecification {
  id: string;
  modelId: string;
  parameterName: string;
  displayName: string;
  rawValue: string;
  rawUnit: string;
  normalizedValue: number | string;
  normalizedUnit: string;
  sourceDocument: string;
  sourcePage: number;
  confidence: number;
  extractionMethod: ExtractionMethod;
  reviewStatus: ReviewStatus;
  notes?: string;
  hasConflict?: boolean;
  alternativeValues?: Array<{
    value: string;
    unit: string;
    method: string;
    confidence: number;
    page: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface SourceReference {
  id: string;
  modelId: string;
  pageNumber: number;
  snippetText: string;
  parameterName?: string;
}

export interface EquipmentModel {
  id: string;
  manufacturerId: string;
  manufacturerName: string;
  categoryCode: EquipmentCategoryCode;
  modelName: string;
  series?: string;
  description?: string;
  datasheetId?: string;
  datasheetFilename?: string;
  isApproved: boolean;
  specificationsCount?: number;
  specifications?: EquipmentSpecification[];
  sourceReferences?: SourceReference[];
  createdAt: string;
  updatedAt: string;
  revision: number;
}

export interface ExtractionDiagnostics {
  pageCount: number;
  pageTextLengths: { page: number; charLength: number; wordCount: number }[];
  nativeQualityScore: number;
  parserUsed: string;
  aiFallbackUsed: boolean;
  pagesSentToAi: number[];
  aiProvider: string;
  extractedParametersCount: number;
  rejectedFieldsCount: number;
  mergeConflictsCount: number;
  processingTimeMs: number;
  pipelineMode?: IngestionPipelineMode;
  isNativeSufficient?: boolean;
  aiBypassed?: boolean;
  nativeEvaluationReasons?: string[];
  reviewReasons?: string[];
  warnings: string[];
  errors: string[];
}

export interface ExtractionRun {
  id: string;
  datasheetId: string;
  modelId?: string;
  parserUsed: string;
  nativeQualityScore: number;
  aiFallbackUsed: boolean;
  pagesSentToAi: number[];
  extractedCount: number;
  rejectedCount: number;
  conflictsCount: number;
  processingTimeMs: number;
  diagnostics: ExtractionDiagnostics;
  createdAt: string;
}

export type IngestionPipelineMode = 'AUTO_HYBRID' | 'STRICT_NATIVE' | 'FORCE_AI';
export type AIProviderId = 'gemini' | 'openai' | 'claude' | 'local_ollama' | 'local_rule';

export interface IngestionSettings {
  pipelineMode: IngestionPipelineMode;
  activeProvider: AIProviderId;
  geminiModel: string;
  openaiModel: string;
  claudeModel: string;
  localEndpoint: string;
  localModelName: string;
  qualityThreshold: number; // e.g. 0.70
  confidenceThreshold: number; // e.g. 0.85
  apiKeysConfigured: {
    gemini: boolean;
    openai: boolean;
    claude: boolean;
  };
}

export interface LocalConnectionTestResult {
  success: boolean;
  endpoint: string;
  latencyMs?: number;
  detectedModels?: string[];
  message: string;
}

export interface IngestionResult {
  datasheet: Datasheet;
  equipment: EquipmentModel;
  specifications: EquipmentSpecification[];
  extractionRun: ExtractionRun;
  requiresReview: boolean;
  reviewReasons?: string[];
  isNativeSufficient?: boolean;
  aiBypassed?: boolean;
  pipelineStatus?: 'NATIVE_SUCCESS' | 'AI_FALLBACK' | 'REVIEW_REQUIRED';
}

export interface DashboardStats {
  totalEquipmentCount: number;
  approvedEquipmentCount: number;
  pendingVerificationCount: number;
  rejectedCount: number;
  totalDatasheetsCount: number;
  manufacturersCount: number;
  categoriesCount: number;
}

// Calculations & Engineering Module Types
export interface VoltageDropInput {
  systemType: '3_PHASE' | '1_PHASE';
  voltage: number; // Volts (e.g. 400V, 690V, 230V)
  current: number; // Amperes
  powerFactor: number; // e.g. 0.95
  cableLength: number; // meters
  conductorMaterial: 'COPPER' | 'ALUMINUM';
  crossSectionMm2: number; // mm²
  operatingTemp: number; // °C (e.g. 70°C or 90°C)
  reactancePerKm?: number; // Ω/km (default ~0.08)
}

export interface VoltageDropOutput {
  voltageDropVolts: number;
  voltageDropPercentage: number;
  endVoltageVolts: number;
  cableResistancePerKm: number;
  powerLossKw: number;
  isCompliant: boolean; // < 3% or < 5% standard
  standardLimitPercent: number;
}

export interface CableSelectionInput {
  loadCurrent: number; // A
  systemVoltage: number; // V
  systemType: '3_PHASE' | '1_PHASE';
  runLengthMeters: number;
  installationMethod: 'AIR' | 'UNDERGROUND' | 'TRAY' | 'CONDUIT';
  ambientTempC: number;
  numberOfCircuits: number;
  maxVoltageDropPercent: number; // e.g. 3.0%
}

export interface CableSelectionOutput {
  recommendedSizeMm2: number;
  baseAmpacity: number;
  tempDeratingFactor: number;
  groupingDeratingFactor: number;
  effectiveAmpacity: number;
  calculatedVoltageDropPercent: number;
  isCompliant: boolean;
  alternativeSizes: Array<{
    sizeMm2: number;
    effectiveAmpacity: number;
    vDropPercent: number;
    suitable: boolean;
  }>;
}

export interface PVStringDesignInput {
  pvModuleModelId?: string;
  pcsInverterModelId?: string;
  pvVocSTC: number; // V
  pvVmpSTC: number; // V
  pvIscSTC: number; // A
  pvImpSTC: number; // A
  pvTempCoeffVoc: number; // %/°C (e.g. -0.28)
  pvTempCoeffPmax?: number; // %/°C
  inverterMaxDcVoltage: number; // V (e.g. 1100V or 1500V)
  inverterMpptMinVoltage: number; // V (e.g. 200V or 500V)
  inverterMpptMaxVoltage: number; // V (e.g. 1000V or 1300V)
  inverterMaxIscPerMppt: number; // A
  inverterMpptCount: number;
  inverterInputsPerMppt: number;
  minAmbientTempC: number; // e.g. -10°C
  maxAmbientTempC: number; // e.g. 40°C
  maxModuleTempC: number; // e.g. 70°C
}

export interface PVStringDesignOutput {
  vocAtMinTemp: number;
  vmpAtMaxTemp: number;
  maxModulesPerString: number;
  minModulesPerString: number;
  recommendedModulesPerString: number;
  maxStringsPerMppt: number;
  totalStringVocMax: number;
  totalStringVmpMin: number;
  totalStringVmpMax: number;
  isVoltageSafe: boolean;
  isMpptCompliant: boolean;
  warnings: string[];
}

export interface BOQItem {
  id: string;
  itemNumber: number;
  equipmentId?: string;
  category: EquipmentCategoryCode | 'CABLE' | 'SWITCHGEAR' | 'LABOR' | 'ENGINEERING';
  itemName: string;
  manufacturer: string;
  model: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
}

export interface QuotationSummary {
  materialCost: number;
  laborCost: number;
  engineeringCost: number;
  otherCost: number;
  subtotal: number;
  marginPercentage: number;
  marginAmount: number;
  taxPercentage: number;
  taxAmount: number;
  grandTotal: number;
  sellingPrice: number;
}

export type ProjectType = 'SOLAR_PV' | 'BESS' | 'HYBRID';
export type ProjectStatus = 'PRELIMINARY' | 'IN_DESIGN' | 'QUOTATION' | 'COMPLETED';

export interface SolarSystemConfig {
  siteConditions: {
    ambientTempMinC: number;
    ambientTempMaxC: number;
    solarIrradiancePeakW: number;
    installationType: 'ROOFTOP' | 'GROUND_MOUNT' | 'CARPORT' | 'FLOATING';
    tiltAngleDeg: number;
    azimuthDeg: number;
  };
  pvModule: {
    modelId: string;
    manufacturer: string;
    modelName: string;
    ratedPowerW: number;
    voc: number;
    isc: number;
    vmp: number;
    imp: number;
    efficiency: number;
    quantity: number;
    cellType?: string;
    datasheetFilename?: string;
  };
  strings: {
    modulesPerString: number;
    totalStrings: number;
    stringsPerMppt: number;
    totalCombiners?: number;
  };
  inverter: {
    modelId: string;
    manufacturer: string;
    modelName: string;
    ratedAcPowerKw: number;
    quantity: number;
    maxDcVoltage: number;
    nominalAcVoltage: number;
    mpptCount: number;
    efficiency: number;
  };
  transformer: {
    modelId?: string;
    manufacturer: string;
    modelName: string;
    ratedPowerKva: number;
    primaryVoltageKv: number;
    secondaryVoltageV: number;
    quantity: number;
    impedancePercent: number;
  };
  grid: {
    voltageKv: number;
    frequencyHz: number;
    connectionType: 'INTERCONNECTION_HV' | 'LV_DIRECT' | 'MICROGRID';
  };
  cables: {
    dcCablePv: {
      type: string;
      sizeMm2: number;
      lengthM: number;
      currentA: number;
      voltageDropPercent: number;
      voltageDropVolts: number;
      status: 'OK' | 'NG';
    };
    acCableInverter: {
      type: string;
      sizeMm2: number;
      lengthM: number;
      currentA: number;
      voltageDropPercent: number;
      voltageDropVolts: number;
      status: 'OK' | 'NG';
    };
    acCableTransformer: {
      type: string;
      sizeMm2: number;
      lengthM: number;
      currentA: number;
      voltageDropPercent: number;
      voltageDropVolts: number;
      status: 'OK' | 'NG';
    };
  };
}

export interface BessSystemConfig {
  requiredPowerMw: number;
  requiredEnergyMwh: number;
  durationHours: number;
  cRate: number;
  enclosureCount?: number;
  usableCapacityMwh?: number;
  depthOfDischargePercent?: number;
  roundTripEfficiency?: number;
  battery: {
    modelId: string;
    manufacturer: string;
    modelName: string;
    capacityKwh: number;
    nominalVoltageV: number;
    chemistry: string;
    cycleLife: number;
    quantity: number;
    rackCount: number;
    datasheetFilename?: string;
  };
  pcs: {
    modelId: string;
    manufacturer: string;
    modelName: string;
    ratedPowerKw: number;
    quantity: number;
    dcVoltageMinV: number;
    dcVoltageMaxV: number;
    acVoltageV: number;
    efficiency: number;
  };
  transformer: {
    modelId?: string;
    manufacturer: string;
    modelName: string;
    ratedPowerKva: number;
    primaryVoltageKv: number;
    secondaryVoltageV: number;
    quantity: number;
  };
  grid: {
    voltageKv: number;
    frequencyHz: number;
    connectionType: 'SUBSTATION_MV' | 'SUBSTATION_HV';
  };
  cables: {
    dcCableBattery: {
      type: string;
      sizeMm2: number;
      lengthM: number;
      currentA: number;
      voltageDropPercent: number;
      status: 'OK' | 'NG';
    };
    acCablePcs: {
      type: string;
      sizeMm2: number;
      lengthM: number;
      currentA: number;
      voltageDropPercent: number;
      status: 'OK' | 'NG';
    };
    acCableTransformer: {
      type: string;
      sizeMm2: number;
      lengthM: number;
      currentA: number;
      voltageDropPercent: number;
      status: 'OK' | 'NG';
    };
  };
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  location: string;
  designStandard: 'JIS' | 'IEC' | 'NEC';
  capacityDisplay: string;
  voltageDisplay: string;
  completionPercent: number;
  estimatedCostJpy: number;
  totalPvCapacityKwp?: number;
  totalAcCapacityKw?: number;
  dcAcRatio?: number;
  storageCapacityMwh?: number;
  storagePowerMw?: number;
  solarConfig?: SolarSystemConfig;
  bessConfig?: BessSystemConfig;
  notes: string[];
  boqItems: BOQItem[];
  quotation: QuotationSummary;
  createdAt: string;
  updatedAt: string;
}

export interface CableSpecificationItem {
  id: string;
  code: string;
  name: string;
  material: 'COPPER' | 'ALUMINUM';
  insulation: 'XLPE' | 'PVC' | 'RUBBER';
  ratedVoltage: string;
  sizeMm2: number;
  ampacityAirA: number;
  ampacityGroundA: number;
  resistance20COhmKm: number;
  outerDiameterMm: number;
  weightKgKm: number;
  standard: string;
}

export interface PriceBookItem {
  id: string;
  category: 'PV_MODULE' | 'PCS_INVERTER' | 'BESS' | 'TRANSFORMER' | 'CABLE' | 'SWITCHGEAR' | 'LABOR' | 'ENGINEERING' | 'BOP';
  itemName: string;
  manufacturer?: string;
  modelOrSpec: string;
  unit: string;
  unitPriceJpy: number;
  leadTimeWeeks: number;
  supplier: string;
  lastUpdated: string;
}
