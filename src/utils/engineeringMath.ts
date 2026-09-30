/**
 * SOLNEXA Engineering Calculations Utility
 * Standardized IEC 60364-5-52 & JIS C 3605 Electrical Calculations
 */

export interface CableCalculationInput {
  currentA: number;
  lengthM: number;
  voltageV: number;
  systemType: 'DC' | 'AC_3PHASE' | 'AC_1PHASE';
  installationMethod: string;
  ambientTempC: number;
  maxVoltageDropPercent: number;
  powerFactor?: number;
}

export interface CableSizeEvaluation {
  sizeMm2: number;
  resistanceOhmPerKm: number;
  baseAmpacityA: number;
  deratedAmpacityA: number;
  voltageDropV: number;
  voltageDropPercent: number;
  margin: number;
  isDropOk: boolean;
  isAmpacityOk: boolean;
  status: 'OK' | 'NG';
}

export interface CableCalculationResult {
  recommendedSizeMm2: number;
  voltageDropPercent: number;
  voltageDropV: number;
  ampacityA: number;
  margin: number;
  status: 'OK' | 'NG';
  comparison: CableSizeEvaluation[];
}

// Copper conductor resistance at 20°C (Ω/km) per IEC 60228
const COPPER_RESISTANCE_20C: Record<number, number> = {
  4: 4.61,
  6: 3.08,
  10: 1.83,
  14: 1.30,
  16: 1.15,
  22: 0.825,
  25: 0.727,
  35: 0.524,
  38: 0.485,
  50: 0.387,
  60: 0.310,
  70: 0.268,
  95: 0.193,
  100: 0.185,
  120: 0.153,
  150: 0.124,
  185: 0.0991,
  200: 0.092,
  240: 0.0754,
  250: 0.072,
  300: 0.0601,
  400: 0.0470
};

// Base ampacity in air (XLPE 90°C) per IEC 60364-5-52 / JIS C 3605
const BASE_AMPACITY_XLPE: Record<number, number> = {
  4: 42,
  6: 54,
  10: 75,
  14: 95,
  16: 100,
  22: 125,
  25: 127,
  35: 158,
  38: 170,
  50: 192,
  60: 215,
  70: 246,
  95: 298,
  100: 310,
  120: 346,
  150: 399,
  185: 456,
  200: 480,
  240: 538,
  250: 550,
  300: 621,
  400: 741
};

// Standard evaluation cable sizes
const CANDIDATE_SIZES = [14, 22, 38, 60, 100, 150];

export function calculateCableVoltageDrop(input: CableCalculationInput): CableCalculationResult {
  const {
    currentA,
    lengthM,
    voltageV,
    systemType,
    installationMethod,
    ambientTempC,
    maxVoltageDropPercent,
    powerFactor = 0.95
  } = input;

  // Temperature correction factor for XLPE 90°C:
  // kt = sqrt((90 - Tamb) / (90 - 30))
  const tempDiff = Math.max(0, 90 - ambientTempC);
  const kt = Math.sqrt(tempDiff / 60);

  // Installation method correction factor (km)
  let km = 1.0;
  if (installationMethod === 'In conduit in ground') km = 0.85;
  else if (installationMethod === 'Direct buried') km = 0.90;
  else if (installationMethod === 'Free air') km = 1.05;
  else km = 1.0; // Cable tray

  const totalDerating = kt * km;

  const comparison: CableSizeEvaluation[] = CANDIDATE_SIZES.map(size => {
    const r20 = COPPER_RESISTANCE_20C[size] || (17.5 / size);
    // Operating temperature: assume conductor operates at ~65°C under load
    const rT = r20 * (1 + 0.00393 * (ambientTempC + 25 - 20)); // Ω/km
    const lengthKm = lengthM / 1000;

    let deltaV = 0;
    if (systemType === 'DC') {
      // 2 * I * L * R
      deltaV = 2 * currentA * lengthKm * rT;
    } else if (systemType === 'AC_3PHASE') {
      // sqrt(3) * I * L * (R*cosPhi + X*sinPhi)
      const x = 0.08; // typical reactance Ω/km
      const sinPhi = Math.sqrt(1 - Math.min(1, powerFactor * powerFactor));
      deltaV = Math.sqrt(3) * currentA * lengthKm * (rT * powerFactor + x * sinPhi);
    } else {
      // 1-phase AC
      deltaV = 2 * currentA * lengthKm * rT * powerFactor;
    }

    const dropPercent = (deltaV / Math.max(1, voltageV)) * 100;
    const baseAmp = BASE_AMPACITY_XLPE[size] || (size * 4);
    const deratedAmp = Math.round(baseAmp * totalDerating);
    const margin = currentA > 0 ? parseFloat((deratedAmp / currentA).toFixed(1)) : 10;

    const isDropOk = dropPercent <= maxVoltageDropPercent;
    const isAmpacityOk = deratedAmp >= currentA;
    const status = isDropOk && isAmpacityOk ? 'OK' : 'NG';

    return {
      sizeMm2: size,
      resistanceOhmPerKm: parseFloat(rT.toFixed(4)),
      baseAmpacityA: baseAmp,
      deratedAmpacityA: deratedAmp,
      voltageDropV: parseFloat(deltaV.toFixed(2)),
      voltageDropPercent: parseFloat(dropPercent.toFixed(2)),
      margin,
      isDropOk,
      isAmpacityOk,
      status
    };
  });

  // Find first size that is OK
  const optimal = comparison.find(c => c.status === 'OK') || comparison[comparison.length - 1];

  return {
    recommendedSizeMm2: optimal.sizeMm2,
    voltageDropPercent: optimal.voltageDropPercent,
    voltageDropV: optimal.voltageDropV,
    ampacityA: optimal.deratedAmpacityA,
    margin: optimal.margin,
    status: optimal.status,
    comparison
  };
}

/**
 * String Design Calculation
 */
export interface StringDesignInput {
  vocStcV: number;
  vmpStcV: number;
  tempCoeffVocPercent: number; // e.g. -0.26
  tempCoeffVmpPercent: number; // e.g. -0.30
  minAmbientTempC: number; // e.g. -10
  maxAmbientTempC: number; // e.g. 70
  inverterMaxVoltageV: number; // e.g. 1100
  inverterMpptMinV: number; // e.g. 200
  inverterMpptMaxV: number; // e.g. 1000
  modulesPerString: number;
}

export function evaluateStringDesign(input: StringDesignInput) {
  const {
    vocStcV,
    vmpStcV,
    tempCoeffVocPercent,
    tempCoeffVmpPercent,
    minAmbientTempC,
    maxAmbientTempC,
    inverterMaxVoltageV,
    inverterMpptMinV,
    inverterMpptMaxV,
    modulesPerString
  } = input;

  // Max Voc at cold temperature: Voc_max = Voc * (1 + beta * (Tmin - 25))
  const vocColdFactor = 1 + (tempCoeffVocPercent / 100) * (minAmbientTempC - 25);
  const singleVocCold = vocStcV * vocColdFactor;
  const stringVocMax = singleVocCold * modulesPerString;

  // Min Vmp at hot temperature: Vmp_min = Vmp * (1 + gamma * (Tmax - 25))
  const vmpHotFactor = 1 + (tempCoeffVmpPercent / 100) * (maxAmbientTempC - 25);
  const singleVmpHot = vmpStcV * vmpHotFactor;
  const stringVmpMin = singleVmpHot * modulesPerString;

  // Max Vmp at cold temperature:
  const singleVmpCold = vmpStcV * vocColdFactor;
  const stringVmpMax = singleVmpCold * modulesPerString;

  const isVocUnderInverterMax = stringVocMax <= inverterMaxVoltageV;
  const isVmpAboveMpptMin = stringVmpMin >= inverterMpptMinV;
  const isVmpBelowMpptMax = stringVmpMax <= inverterMpptMaxV;

  const isCompliant = isVocUnderInverterMax && isVmpAboveMpptMin && isVmpBelowMpptMax;

  return {
    stringVocMax: parseFloat(stringVocMax.toFixed(1)),
    stringVmpMin: parseFloat(stringVmpMin.toFixed(1)),
    stringVmpMax: parseFloat(stringVmpMax.toFixed(1)),
    isVocUnderInverterMax,
    isVmpAboveMpptMin,
    isVmpBelowMpptMax,
    isCompliant,
    maxAllowedModules: Math.floor(inverterMaxVoltageV / singleVocCold),
    minAllowedModules: Math.ceil(inverterMpptMinV / singleVmpHot)
  };
}
