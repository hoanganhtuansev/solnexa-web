/**
 * SOLNEXA BESS Snow & Weather Checker Types
 * Standards: 国土交通省 平成12年建設省告示第1455号 / 建築基準法施行令第86条 / 気象庁 AMeDAS
 */

export interface SnowZoneDefinition {
  zoneId: number;
  zoneName: string;
  alpha: number; // 標高係数
  beta: number;  // 海率係数
  gamma: number; // 基準定数
  radiusKm: number; // 海率算定対象半径 R (km)
  prefectures: string[]; // 対象都道府県
  description: string;
}

export interface LocalSnowRule {
  id: string;
  authority: string;
  prefecture: string;
  municipality?: string;
  ruleType: 'fixedValue' | 'formula' | 'elevationBands' | 'customZone';
  fixedValueCm?: number;
  formulaDescription?: string;
  baseDepthCm?: number;
  elevationBands?: {
    minElevM: number;
    maxElevM?: number;
    depthCm: number;
    factorPer100m?: number;
  }[];
  parameters?: Record<string, any>;
  sourceTitle: string;
  sourceUrl: string;
  effectiveDate: string;
  verifiedDate: string;
  status: 'VERIFIED' | 'NOT_VERIFIED';
  notes?: string;
}

export interface SiteLocationInfo {
  query: string;
  prefecture: string;
  municipality: string;
  addressLine: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  elevationSource: string;
  elevationSourceUrl: string;
}

export interface OfficialSnowCheckResult {
  status: 'VERIFIED' | 'NOT_VERIFIED';
  snowDepthCm: number | null;
  ruleName: string;
  authority: string;
  sourceTitle: string;
  sourceUrl: string;
  effectiveDate?: string;
  verifiedDate?: string;
  explanation: string;
  isMunicipalityLevel: boolean;
}

export interface Mlit1455CalculationResult {
  zoneId: number;
  zoneName: string;
  elevationLs: number;
  seaRatioRs: number;
  alpha: number;
  beta: number;
  gamma: number;
  radiusR: number;
  formula: string;
  calculatedDepthM: number;
  calculatedDepthCm: number;
  sourceTitle: string;
  sourceUrl: string;
  calculationBreakdown: {
    elevationTerm: number;
    seaRatioTerm: number;
    baseTerm: number;
  };
}

export interface SnowComparisonResult {
  officialDepthCm: number | null;
  calculatedDepthCm: number;
  differenceCm: number | null;
  governingDesignValueCm: number;
  safetyMarginPct?: number;
  recommendation: string;
  legalStatusNote: string;
}

export interface AmedasStation {
  id: string;
  name: string;
  kana: string;
  prefecture: string;
  lat: number;
  lon: number;
  elevationM: number;
  hasSnowSensor: boolean;
  distanceKm?: number;
}

export interface CurrentWeatherObservation {
  station: AmedasStation;
  observedAt: string;
  tempC: number | null;
  humidityPct: number | null;
  windSpeedMs: number | null;
  windDirection: string | null;
  pressureHpa: number | null;
  precipitation1hMm: number | null;
  precipitation24hMm: number | null;
}

export interface SnowObservation {
  station: AmedasStation;
  hasSnowSensor: boolean;
  observedAt: string;
  snowDepthCm: number | null; // null if sensor absent
  snowfall24hCm: number | null; // null if sensor absent
  snowDataStatus: 'OBSERVED' | 'NO_SENSOR' | 'NO_DATA';
}

export interface DailyForecast {
  date: string;
  weatherText: string;
  weatherIcon: string;
  tempMaxC: number | null;
  tempMinC: number | null;
  popPct: number | null; // 降水確率
  windDirection?: string;
  windSpeedMs?: number;
  snowExpected?: boolean;
}

export interface WinterSeasonalConditions {
  historicalMaxSnowDepthCm: number;
  historicalMaxDate?: string;
  normalLowestTempC: number;
  normalSnowDaysPerYear: number;
  snowPeriodMonths: string;
  prevailingWinterWind: string;
  climateRegionClassification: string;
}

export interface BessSiteNote {
  id: string;
  severity: 'DANGER' | 'WARNING' | 'CAUTION' | 'INFO';
  category: 'FREEZE' | 'SNOWDRIFT' | 'ELEVATION' | 'DISTANCE' | 'DRAINAGE' | 'WIND';
  title: string;
  description: string;
  mitigation: string;
}

export interface OfficialSourceCitation {
  id: string;
  category: string;
  name: string;
  authority: string;
  url: string;
  description: string;
}

export interface SnowWeatherCheckerResponse {
  site: SiteLocationInfo;
  officialCheck: OfficialSnowCheckResult;
  autoCalculation: Mlit1455CalculationResult;
  comparison: SnowComparisonResult;
  currentWeather: CurrentWeatherObservation;
  snowObservation: SnowObservation;
  forecast: DailyForecast[];
  seasonalConditions: WinterSeasonalConditions;
  bessSiteNotes: BessSiteNote[];
  sources: OfficialSourceCitation[];
  timestamp: string;
  engineMode?: 'ONLINE' | 'OFFLINE';
  isLiveOnline?: boolean;
}
