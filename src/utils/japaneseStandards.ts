/**
 * Japanese Electrical Engineering Standards Engine
 * Grounded on:
 * - Kyokuto Electric Wire & Cable (https://www.kyokuto-k.co.jp/voltagedrop.html)
 * - ISIJP Conduit & Piping Standards (http://www.isijp.com/haikan/gk-densenkan-a-0410.htm, gk-haikan-1, gk-haikan-2)
 * - 内線規程 (JEAC 8001 / 電気設備技術基準の解釈)
 * - JIS C 8305 (鋼製電線管), JIS C 8430 (硬質ビニル電線管), JIS C 8411 (合成樹脂製可とう電線管), JIS C 3653 (地中電線管・FEP)
 * - JIS C 3605 (600V CV/CVT), JIS C 3307 (IV)
 */

// =========================================================================
// PART 1: KYOKUTO VOLTAGE DROP CALCULATIONS (極東電線 電圧降下計算)
// =========================================================================

export type ElectricalSystemType =
  | 'DC_2W'     // 直流2線式
  | '1P_2W'     // 単相2線式
  | '1P_3W'     // 単相3線式 (中性線間 100V / 線間 200V)
  | '3P_3W'     // 三相3線式 (200V / 400V / 6.6kV)
  | '3P_4W_LINE' // 三相4線式 (線間電圧)
  | '3P_4W_PHASE'; // 三相4線式 (相電圧)

export type LineClassification =
  | 'TRUNK'         // 幹線 (内線規程: 原則2%以下、構内変圧器3%以下)
  | 'BRANCH'        // 分岐回路 (内線規程: 原則2%以下)
  | 'GENERAL_TOTAL'; // 引込口・変圧器から末端までの総延長

export interface KyokutoVoltageDropInput {
  systemType: ElectricalSystemType;
  voltageV: number;
  currentA: number;
  lengthM: number;
  cableSizeSq: number;
  conductorMaterial?: 'COPPER' | 'ALUMINUM';
  powerFactor?: number;      // cosθ, e.g. 0.95 (0.7 ~ 1.0)
  ambientTempC?: number;     // 周囲温度 (°C), standard 30°C
  operatingTempC?: number;   // 導体最高許容温度 / 運転温度 (CV: 90°C, IV: 60°C)
  lineType?: LineClassification;
  hasOnsiteTransformer?: boolean; // 構内変圧器がある場合 (3%許容)
}

export interface KyokutoVoltageDropResult {
  // Simplified calculation (Kyokuto 簡易式)
  simplifiedFormula: string;
  simplifiedDropV: number;
  simplifiedDropPercent: number;

  // Precision impedance calculation (Kyokuto 精密式 R*cosθ + X*sinθ)
  preciseFormula: string;
  preciseDropV: number;
  preciseDropPercent: number;
  resistanceOhmPerKm: number; // 運転温度補正後 R (Ω/km)
  reactanceOhmPerKm: number;  // X (Ω/km)
  impedanceZ: number;         // R*cosθ + X*sinθ (Ω/km)

  // Regulatory Compliance per 内線規程
  allowableLimitPercent: number;
  allowableLimitDesc: string;
  isCompliant: boolean;
  status: 'PASS' | 'REVIEW' | 'FAIL';
  evaluationRemarks: string;
}

// Conductor resistance at 20°C (Ω/km) - JIS C 3005 / IEC 60228 (Annealed Copper)
export const JIS_COPPER_RESISTANCE_20C: Record<number, number> = {
  1.6: 8.92, // 1.6mm solid wire
  2: 9.24,   // 2.0 sq stranded conductor (approx 5.65 for 2.0mm solid)
  2.6: 3.35, // 2.6mm solid wire
  3.5: 5.20,
  5.5: 3.33,
  8: 2.31,
  14: 1.30,
  22: 0.824,
  38: 0.479,
  60: 0.303,
  100: 0.180,
  150: 0.118,
  185: 0.096,
  200: 0.090,
  240: 0.0754,
  250: 0.071,
  300: 0.0601,
  400: 0.0470,
  500: 0.0359
};

// Typical Reactance X (Ω/km) for 600V CV / CVT in conduit/air (at 50/60Hz)
export const JIS_CABLE_REACTANCE: Record<number, number> = {
  2: 0.110,
  3.5: 0.105,
  5.5: 0.100,
  8: 0.098,
  14: 0.095,
  22: 0.092,
  38: 0.089,
  60: 0.086,
  100: 0.084,
  150: 0.082,
  185: 0.081,
  200: 0.081,
  240: 0.080,
  250: 0.079,
  300: 0.078,
  400: 0.076,
  500: 0.074
};

/**
 * Calculate Voltage Drop based on Kyokuto Standards & 内線規程
 */
export function calculateKyokutoVoltageDrop(input: KyokutoVoltageDropInput): KyokutoVoltageDropResult {
  const {
    systemType,
    voltageV,
    currentA,
    lengthM,
    cableSizeSq,
    conductorMaterial = 'COPPER',
    powerFactor = 0.95,
    ambientTempC = 30,
    operatingTempC = 75,
    lineType = 'TRUNK',
    hasOnsiteTransformer = true
  } = input;

  const L = lengthM;
  const I = currentA;
  const A = cableSizeSq;

  // 1. Kyokuto Constant K for Simplified Calculation:
  // 直流2線・単相2線: 35.6
  // 単相3線・三相4線(相電圧): 17.8
  // 三相3線・三相4線(線間): 30.8
  let kSimplified = 35.6;
  let kPrecise = 2.0;
  let simplifiedFormula = 'e = (35.6 × L × I) / (1000 × A)';
  let preciseFormula = 'e = 2 × I × L × (R·cosθ + X·sinθ) × 10⁻³';

  switch (systemType) {
    case 'DC_2W':
      kSimplified = 35.6;
      kPrecise = 2.0;
      simplifiedFormula = 'e = (35.6 × L × I) / (1000 × A)';
      preciseFormula = 'e = 2 × I × L × R × 10⁻³';
      break;
    case '1P_2W':
      kSimplified = 35.6;
      kPrecise = 2.0;
      simplifiedFormula = 'e = (35.6 × L × I) / (1000 × A)';
      preciseFormula = 'e = 2 × I × L × (R·cosθ + X·sinθ) × 10⁻³';
      break;
    case '1P_3W':
      kSimplified = 17.8;
      kPrecise = 1.0;
      simplifiedFormula = 'e\' = (17.8 × L × I) / (1000 × A)';
      preciseFormula = 'e\' = I × L × (R·cosθ + X·sinθ) × 10⁻³';
      break;
    case '3P_3W':
      kSimplified = 30.8;
      kPrecise = Math.sqrt(3);
      simplifiedFormula = 'e = (30.8 × L × I) / (1000 × A)';
      preciseFormula = 'e = √3 × I × L × (R·cosθ + X·sinθ) × 10⁻³';
      break;
    case '3P_4W_LINE':
      kSimplified = 30.8;
      kPrecise = Math.sqrt(3);
      simplifiedFormula = 'e = (30.8 × L × I) / (1000 × A)';
      preciseFormula = 'e = √3 × I × L × (R·cosθ + X·sinθ) × 10⁻³';
      break;
    case '3P_4W_PHASE':
      kSimplified = 17.8;
      kPrecise = 1.0;
      simplifiedFormula = 'e = (17.8 × L × I) / (1000 × A)';
      preciseFormula = 'e = I × L × (R·cosθ + X·sinθ) × 10⁻³';
      break;
  }

  // Simplified Calculation (e in Volts)
  const simplifiedDropV = A > 0 ? (kSimplified * L * I) / (1000 * A) : 0;
  const simplifiedDropPercent = voltageV > 0 ? (simplifiedDropV / voltageV) * 100 : 0;

  // 2. Precise Impedance Calculation
  // Conductor resistance at 20°C
  const r20Base = JIS_COPPER_RESISTANCE_20C[A] || (17.8 / A);
  const materialMult = conductorMaterial === 'ALUMINUM' ? 1.6 : 1.0;
  // Temperature correction to operating temperature: Rt = R20 * (234.5 + t) / (234.5 + 20)
  const rT = r20Base * materialMult * ((234.5 + operatingTempC) / (234.5 + 20));
  const x = JIS_CABLE_REACTANCE[A] || 0.085;

  const cosPhi = Math.min(1.0, Math.max(0, powerFactor));
  const sinPhi = Math.sqrt(Math.max(0, 1 - Math.pow(cosPhi, 2)));

  const impedanceZ = systemType === 'DC_2W' ? rT : (rT * cosPhi + x * sinPhi);
  const lengthKm = L / 1000;
  const preciseDropV = kPrecise * I * lengthKm * impedanceZ;
  const preciseDropPercent = voltageV > 0 ? (preciseDropV / voltageV) * 100 : 0;

  // 3. Evaluation per 内線規程 (JEAC 8001 第1315-1節・第1315-2節)
  let allowableLimitPercent = 2.0;
  let allowableLimitDesc = '内線規程 幹線基準: 2.0%以下';

  if (lineType === 'TRUNK') {
    if (hasOnsiteTransformer) {
      allowableLimitPercent = 3.0;
      allowableLimitDesc = '内線規程 構内変圧器受電幹線: 3.0%以下';
    } else {
      allowableLimitPercent = 2.0;
      allowableLimitDesc = '内線規程 一般幹線: 2.0%以下';
    }
  } else if (lineType === 'BRANCH') {
    allowableLimitPercent = 2.0;
    allowableLimitDesc = '内線規程 分岐回路: 2.0%以下';
  } else {
    // By length:
    if (L <= 60) {
      allowableLimitPercent = 3.0;
      allowableLimitDesc = '内線規程 総配線長60m以下: 3.0%以下';
    } else if (L <= 120) {
      allowableLimitPercent = 4.0;
      allowableLimitDesc = '内線規程 総配線長120m以下: 4.0%以下';
    } else if (L <= 200) {
      allowableLimitPercent = 5.0;
      allowableLimitDesc = '内線規程 総配線長200m以下: 5.0%以下';
    } else {
      allowableLimitPercent = 6.0;
      allowableLimitDesc = '内線規程 総配線長200m超: 6.0%以下';
    }
  }

  const evalPercent = preciseDropPercent > 0 ? preciseDropPercent : simplifiedDropPercent;
  let status: 'PASS' | 'REVIEW' | 'FAIL' = 'PASS';
  let evaluationRemarks = '合格 (基準値を満たしています)';

  if (evalPercent > allowableLimitPercent) {
    status = 'FAIL';
    evaluationRemarks = `不適合: 電圧降下率(${evalPercent.toFixed(2)}%)が許容限度(${allowableLimitPercent.toFixed(1)}%)を超過しています。電線サイズを太くするか条数を増やしてください。`;
  } else if (evalPercent >= allowableLimitPercent * 0.85) {
    status = 'REVIEW';
    evaluationRemarks = `要検討: 電圧降下率(${evalPercent.toFixed(2)}%)が許容限度(${allowableLimitPercent.toFixed(1)}%)に近接しています。負荷増加の余裕度を確認してください。`;
  }

  return {
    simplifiedFormula,
    simplifiedDropV: Number(simplifiedDropV.toFixed(2)),
    simplifiedDropPercent: Number(simplifiedDropPercent.toFixed(2)),
    preciseFormula,
    preciseDropV: Number(preciseDropV.toFixed(2)),
    preciseDropPercent: Number(preciseDropPercent.toFixed(2)),
    resistanceOhmPerKm: Number(rT.toFixed(4)),
    reactanceOhmPerKm: Number(x.toFixed(4)),
    impedanceZ: Number(impedanceZ.toFixed(4)),
    allowableLimitPercent,
    allowableLimitDesc,
    isCompliant: status !== 'FAIL',
    status,
    evaluationRemarks
  };
}


// =========================================================================
// PART 2: ISIJP CONDUIT SIZING & OCCUPANCY (isijp.com 電線管・配管選定)
// =========================================================================

export type ConduitFamily =
  | 'STEEL_THIN_C'    // 薄鋼電線管 (C管 / JIS C 8305)
  | 'STEEL_THREADLESS_E' // ねじなし電線管 (E管 / JIS C 8305)
  | 'STEEL_THICK_G'   // 厚鋼電線管 (G管 / JIS C 8305)
  | 'PVC_VE'          // 硬質ビニル電線管 (VE管 / JIS C 8430)
  | 'FLEXIBLE_PF_CD'  // 可とう電線管 (PF管・CD管 / JIS C 8411)
  | 'FEP_UNDERGROUND'; // 波付硬質合成樹脂管 (FEP管 / 地中埋設 / JIS C 3653)

export interface ConduitSpec {
  code: string;       // e.g. "C25", "E25", "G28", "VE22", "PF28", "FEP50"
  outerDiaMm: number; // 外径 (mm)
  innerDiaMm: number; // 内径 (mm)
  innerAreaMm2: number; // 内断面積 (mm²)
  maxArea32Mm2: number; // 32%許容断面積 (mm²) - 異なる太さ / 屈曲部
  maxArea48Mm2: number; // 48%許容断面積 (mm²) - 同一太さ直線
  remarks?: string;
}

// Complete JIS Conduit Master Database (Matching isijp.com gk-densenkan-a-0410.htm)
export const CONDUIT_SPECS_DATABASE: Record<ConduitFamily, ConduitSpec[]> = {
  STEEL_THIN_C: [
    { code: 'C19', outerDiaMm: 19.1, innerDiaMm: 15.9, innerAreaMm2: 198, maxArea32Mm2: 63, maxArea48Mm2: 95 },
    { code: 'C25', outerDiaMm: 25.4, innerDiaMm: 22.2, innerAreaMm2: 387, maxArea32Mm2: 123, maxArea48Mm2: 185 },
    { code: 'C31', outerDiaMm: 31.8, innerDiaMm: 28.6, innerAreaMm2: 642, maxArea32Mm2: 205, maxArea48Mm2: 308 },
    { code: 'C39', outerDiaMm: 38.1, innerDiaMm: 34.9, innerAreaMm2: 956, maxArea32Mm2: 305, maxArea48Mm2: 458 },
    { code: 'C51', outerDiaMm: 50.8, innerDiaMm: 47.6, innerAreaMm2: 1779, maxArea32Mm2: 569, maxArea48Mm2: 854 },
    { code: 'C63', outerDiaMm: 63.5, innerDiaMm: 59.9, innerAreaMm2: 2818, maxArea32Mm2: 901, maxArea48Mm2: 1352 },
    { code: 'C75', outerDiaMm: 76.2, innerDiaMm: 72.6, innerAreaMm2: 4139, maxArea32Mm2: 1324, maxArea48Mm2: 1986 }
  ],
  STEEL_THREADLESS_E: [
    { code: 'E19', outerDiaMm: 19.1, innerDiaMm: 16.7, innerAreaMm2: 219, maxArea32Mm2: 70, maxArea48Mm2: 105 },
    { code: 'E25', outerDiaMm: 25.4, innerDiaMm: 23.0, innerAreaMm2: 415, maxArea32Mm2: 132, maxArea48Mm2: 199 },
    { code: 'E31', outerDiaMm: 31.8, innerDiaMm: 29.4, innerAreaMm2: 678, maxArea32Mm2: 217, maxArea48Mm2: 325 },
    { code: 'E39', outerDiaMm: 38.1, innerDiaMm: 35.7, innerAreaMm2: 1001, maxArea32Mm2: 320, maxArea48Mm2: 480 },
    { code: 'E51', outerDiaMm: 50.8, innerDiaMm: 48.4, innerAreaMm2: 1839, maxArea32Mm2: 588, maxArea48Mm2: 882 },
    { code: 'E63', outerDiaMm: 63.5, innerDiaMm: 60.7, innerAreaMm2: 2893, maxArea32Mm2: 925, maxArea48Mm2: 1388 },
    { code: 'E75', outerDiaMm: 76.2, innerDiaMm: 73.4, innerAreaMm2: 4231, maxArea32Mm2: 1354, maxArea48Mm2: 2030 }
  ],
  STEEL_THICK_G: [
    { code: 'G16', outerDiaMm: 21.0, innerDiaMm: 16.4, innerAreaMm2: 211, maxArea32Mm2: 67, maxArea48Mm2: 101 },
    { code: 'G22', outerDiaMm: 26.5, innerDiaMm: 21.9, innerAreaMm2: 376, maxArea32Mm2: 120, maxArea48Mm2: 180 },
    { code: 'G28', outerDiaMm: 33.3, innerDiaMm: 28.3, innerAreaMm2: 629, maxArea32Mm2: 201, maxArea48Mm2: 301 },
    { code: 'G36', outerDiaMm: 41.9, innerDiaMm: 36.9, innerAreaMm2: 1069, maxArea32Mm2: 342, maxArea48Mm2: 513 },
    { code: 'G42', outerDiaMm: 47.8, innerDiaMm: 42.8, innerAreaMm2: 1438, maxArea32Mm2: 460, maxArea48Mm2: 690 },
    { code: 'G54', outerDiaMm: 59.6, innerDiaMm: 54.0, innerAreaMm2: 2290, maxArea32Mm2: 732, maxArea48Mm2: 1099 },
    { code: 'G70', outerDiaMm: 75.2, innerDiaMm: 69.6, innerAreaMm2: 3804, maxArea32Mm2: 1217, maxArea48Mm2: 1826 },
    { code: 'G82', outerDiaMm: 87.9, innerDiaMm: 81.5, innerAreaMm2: 5216, maxArea32Mm2: 1669, maxArea48Mm2: 2504 },
    { code: 'G92', outerDiaMm: 100.7, innerDiaMm: 93.7, innerAreaMm2: 6895, maxArea32Mm2: 2206, maxArea48Mm2: 3309 },
    { code: 'G104', outerDiaMm: 113.4, innerDiaMm: 106.4, innerAreaMm2: 8891, maxArea32Mm2: 2845, maxArea48Mm2: 4267 }
  ],
  PVC_VE: [
    { code: 'VE14', outerDiaMm: 18.0, innerDiaMm: 14.0, innerAreaMm2: 153, maxArea32Mm2: 49, maxArea48Mm2: 73 },
    { code: 'VE16', outerDiaMm: 22.0, innerDiaMm: 18.0, innerAreaMm2: 254, maxArea32Mm2: 81, maxArea48Mm2: 122 },
    { code: 'VE22', outerDiaMm: 26.0, innerDiaMm: 22.0, innerAreaMm2: 380, maxArea32Mm2: 121, maxArea48Mm2: 182 },
    { code: 'VE28', outerDiaMm: 34.0, innerDiaMm: 28.0, innerAreaMm2: 615, maxArea32Mm2: 197, maxArea48Mm2: 295 },
    { code: 'VE36', outerDiaMm: 42.0, innerDiaMm: 35.0, innerAreaMm2: 962, maxArea32Mm2: 308, maxArea48Mm2: 462 },
    { code: 'VE42', outerDiaMm: 48.0, innerDiaMm: 40.0, innerAreaMm2: 1256, maxArea32Mm2: 402, maxArea48Mm2: 603 },
    { code: 'VE54', outerDiaMm: 60.0, innerDiaMm: 51.0, innerAreaMm2: 2042, maxArea32Mm2: 653, maxArea48Mm2: 980 },
    { code: 'VE70', outerDiaMm: 76.0, innerDiaMm: 67.0, innerAreaMm2: 3525, maxArea32Mm2: 1128, maxArea48Mm2: 1692 },
    { code: 'VE82', outerDiaMm: 89.0, innerDiaMm: 77.0, innerAreaMm2: 4656, maxArea32Mm2: 1490, maxArea48Mm2: 2235 }
  ],
  FLEXIBLE_PF_CD: [
    { code: 'PF/CD 14', outerDiaMm: 19.0, innerDiaMm: 14.0, innerAreaMm2: 153, maxArea32Mm2: 49, maxArea48Mm2: 73 },
    { code: 'PF/CD 16', outerDiaMm: 23.0, innerDiaMm: 16.0, innerAreaMm2: 201, maxArea32Mm2: 64, maxArea48Mm2: 96 },
    { code: 'PF/CD 22', outerDiaMm: 30.5, innerDiaMm: 22.0, innerAreaMm2: 380, maxArea32Mm2: 121, maxArea48Mm2: 182 },
    { code: 'PF/CD 28', outerDiaMm: 36.5, innerDiaMm: 28.0, innerAreaMm2: 615, maxArea32Mm2: 197, maxArea48Mm2: 295 },
    { code: 'PF/CD 36', outerDiaMm: 45.5, innerDiaMm: 36.0, innerAreaMm2: 1017, maxArea32Mm2: 325, maxArea48Mm2: 488 },
    { code: 'PF/CD 42', outerDiaMm: 52.0, innerDiaMm: 42.0, innerAreaMm2: 1385, maxArea32Mm2: 443, maxArea48Mm2: 665 },
    { code: 'PF/CD 54', outerDiaMm: 64.0, innerDiaMm: 54.0, innerAreaMm2: 2290, maxArea32Mm2: 732, maxArea48Mm2: 1099 }
  ],
  FEP_UNDERGROUND: [
    { code: 'FEP-30', outerDiaMm: 39.0, innerDiaMm: 30.0, innerAreaMm2: 706, maxArea32Mm2: 226, maxArea48Mm2: 339, remarks: '地中埋設管 (小容量幹線)' },
    { code: 'FEP-40', outerDiaMm: 51.0, innerDiaMm: 40.0, innerAreaMm2: 1256, maxArea32Mm2: 402, maxArea48Mm2: 603, remarks: '太陽光DC幹線' },
    { code: 'FEP-50', outerDiaMm: 64.0, innerDiaMm: 50.0, innerAreaMm2: 1963, maxArea32Mm2: 628, maxArea48Mm2: 942, remarks: '低圧主幹・PV' },
    { code: 'FEP-65', outerDiaMm: 86.0, innerDiaMm: 65.0, innerAreaMm2: 3318, maxArea32Mm2: 1062, maxArea48Mm2: 1592, remarks: 'CVT100~150sq' },
    { code: 'FEP-80', outerDiaMm: 103.0, innerDiaMm: 80.0, innerAreaMm2: 5026, maxArea32Mm2: 1608, maxArea48Mm2: 2412, remarks: 'CVT200~250sq' },
    { code: 'FEP-100', outerDiaMm: 130.0, innerDiaMm: 100.0, innerAreaMm2: 7854, maxArea32Mm2: 2513, maxArea48Mm2: 3770, remarks: '高圧6.6kV CVT' },
    { code: 'FEP-125', outerDiaMm: 163.0, innerDiaMm: 125.0, innerAreaMm2: 12271, maxArea32Mm2: 3927, maxArea48Mm2: 5890, remarks: '大容量幹線' },
    { code: 'FEP-150', outerDiaMm: 194.0, innerDiaMm: 150.0, innerAreaMm2: 17671, maxArea32Mm2: 5655, maxArea48Mm2: 8482, remarks: '特別高圧・複合' },
    { code: 'FEP-200', outerDiaMm: 258.0, innerDiaMm: 200.0, innerAreaMm2: 31415, maxArea32Mm2: 10053, maxArea48Mm2: 15079, remarks: '特高・共同溝' }
  ]
};

// Cable Dimension Library (isijp.com gk-haikan-1-0410.htm & gk-haikan-2-0411.htm)
export interface CableDimensionSpec {
  cableType: 'IV' | 'HIV' | '600V_CV_1C' | '600V_CV_2C' | '600V_CV_3C' | '600V_CVT' | 'SOLAR_DC' | '6.6KV_CVT';
  label: string;
  sizeSq: string; // e.g. "5.5", "14", "22", "60", "100"
  outerDiaMm: number;
  sectionalAreaMm2: number; // π * d² / 4
}

export const CABLE_DIMENSIONS_LIBRARY: CableDimensionSpec[] = [
  // Solar PV DC Cable (PV-CC, H1Z2Z2-K)
  { cableType: 'SOLAR_DC', label: 'Solar PV DC Cable (H1Z2Z2-K / PV-CC)', sizeSq: '4 mm²', outerDiaMm: 5.6, sectionalAreaMm2: 24.6 },
  { cableType: 'SOLAR_DC', label: 'Solar PV DC Cable (H1Z2Z2-K / PV-CC)', sizeSq: '6 mm²', outerDiaMm: 6.2, sectionalAreaMm2: 30.2 },
  { cableType: 'SOLAR_DC', label: 'Solar PV DC Cable (H1Z2Z2-K / PV-CC)', sizeSq: '10 mm²', outerDiaMm: 7.4, sectionalAreaMm2: 43.0 },

  // IV (600Vビニル絶縁電線 - JIS C 3307)
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '1.6 mm', outerDiaMm: 3.2, sectionalAreaMm2: 8.04 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '2.0 mm', outerDiaMm: 3.6, sectionalAreaMm2: 10.17 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '2.6 mm', outerDiaMm: 4.2, sectionalAreaMm2: 13.85 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '2 sq', outerDiaMm: 3.4, sectionalAreaMm2: 9.07 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '3.5 sq', outerDiaMm: 4.0, sectionalAreaMm2: 12.56 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '5.5 sq', outerDiaMm: 5.0, sectionalAreaMm2: 19.63 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '8 sq', outerDiaMm: 6.0, sectionalAreaMm2: 28.27 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '14 sq', outerDiaMm: 7.6, sectionalAreaMm2: 45.36 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '22 sq', outerDiaMm: 9.2, sectionalAreaMm2: 66.47 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '38 sq', outerDiaMm: 11.5, sectionalAreaMm2: 103.8 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '60 sq', outerDiaMm: 14.0, sectionalAreaMm2: 153.9 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '100 sq', outerDiaMm: 17.5, sectionalAreaMm2: 240.5 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '150 sq', outerDiaMm: 21.0, sectionalAreaMm2: 346.3 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '200 sq', outerDiaMm: 24.0, sectionalAreaMm2: 452.3 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '250 sq', outerDiaMm: 27.0, sectionalAreaMm2: 572.5 },
  { cableType: 'IV', label: 'IV (600Vビニル絶縁電線)', sizeSq: '325 sq', outerDiaMm: 30.0, sectionalAreaMm2: 706.8 },

  // 600V CV 1C (単心 架橋ポリエチレン)
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '8 sq', outerDiaMm: 8.0, sectionalAreaMm2: 50.3 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '14 sq', outerDiaMm: 9.0, sectionalAreaMm2: 63.6 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '22 sq', outerDiaMm: 10.5, sectionalAreaMm2: 86.6 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '38 sq', outerDiaMm: 12.5, sectionalAreaMm2: 122.7 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '60 sq', outerDiaMm: 14.5, sectionalAreaMm2: 165.1 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '100 sq', outerDiaMm: 18.0, sectionalAreaMm2: 254.5 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '150 sq', outerDiaMm: 21.5, sectionalAreaMm2: 363.0 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '200 sq', outerDiaMm: 24.5, sectionalAreaMm2: 471.4 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '250 sq', outerDiaMm: 27.5, sectionalAreaMm2: 593.9 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '325 sq', outerDiaMm: 30.5, sectionalAreaMm2: 730.6 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '400 sq', outerDiaMm: 33.5, sectionalAreaMm2: 881.4 },
  { cableType: '600V_CV_1C', label: '600V CV 1C (単心架橋ポリエチレン)', sizeSq: '500 sq', outerDiaMm: 37.0, sectionalAreaMm2: 1075.2 },

  // 600V CVT (トリプレックス 3心撚り)
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '14 sq', outerDiaMm: 19.5, sectionalAreaMm2: 298.6 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '22 sq', outerDiaMm: 23.0, sectionalAreaMm2: 415.5 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '38 sq', outerDiaMm: 27.0, sectionalAreaMm2: 572.5 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '60 sq', outerDiaMm: 31.0, sectionalAreaMm2: 754.7 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '100 sq', outerDiaMm: 39.0, sectionalAreaMm2: 1194.5 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '150 sq', outerDiaMm: 46.0, sectionalAreaMm2: 1661.9 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '200 sq', outerDiaMm: 53.0, sectionalAreaMm2: 2206.1 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '250 sq', outerDiaMm: 59.0, sectionalAreaMm2: 2733.9 },
  { cableType: '600V_CVT', label: '600V CVT (3心トリプレックス)', sizeSq: '325 sq', outerDiaMm: 66.0, sectionalAreaMm2: 3421.1 },

  // 6.6kV CVT (高圧トリプレックスケーブル)
  { cableType: '6.6KV_CVT', label: '6.6kV CVT (高圧トリプレックス)', sizeSq: '38 sq', outerDiaMm: 41.0, sectionalAreaMm2: 1320.2 },
  { cableType: '6.6KV_CVT', label: '6.6kV CVT (高圧トリプレックス)', sizeSq: '60 sq', outerDiaMm: 45.0, sectionalAreaMm2: 1590.4 },
  { cableType: '6.6KV_CVT', label: '6.6kV CVT (高圧トリプレックス)', sizeSq: '100 sq', outerDiaMm: 51.0, sectionalAreaMm2: 2042.8 },
  { cableType: '6.6KV_CVT', label: '6.6kV CVT (高圧トリプレックス)', sizeSq: '150 sq', outerDiaMm: 57.0, sectionalAreaMm2: 2551.7 },
  { cableType: '6.6KV_CVT', label: '6.6kV CVT (高圧トリプレックス)', sizeSq: '200 sq', outerDiaMm: 64.0, sectionalAreaMm2: 3216.9 },
  { cableType: '6.6KV_CVT', label: '6.6kV CVT (高圧トリプレックス)', sizeSq: '250 sq', outerDiaMm: 70.0, sectionalAreaMm2: 3848.4 },
  { cableType: '6.6KV_CVT', label: '6.6kV CVT (高圧トリプレックス)', sizeSq: '325 sq', outerDiaMm: 76.0, sectionalAreaMm2: 4536.4 }
];

export interface ConduitEvaluationResult {
  conduit: ConduitSpec;
  occupancyPercent: number;
  limitPercent: number;
  isCompliant: boolean;
  status: 'PASS' | 'REVIEW' | 'FAIL';
  remainingAreaMm2: number;
}

export interface ConduitSizingCalculationOutput {
  totalCableCount: number;
  cableOuterDiaMm: number;
  singleCableAreaMm2: number;
  totalCableAreaMm2: number;
  occupancyLimitPercent: 32 | 48; // 32% (different sizes/curves) or 48% (identical straight)
  limitReason: string;
  recommendedConduit: ConduitSpec;
  actualOccupancyPercent: number;
  isRecommendedCompliant: boolean;
  bundlingCurrentReductionFactor: number; // 電流減少係数 per 内線規程
  comparisonList: ConduitEvaluationResult[];
}

/**
 * Conduit Sizing Engine adhering to isijp.com & 内線規程 (JEAC 8001)
 */
export function calculateConduitSizing(
  conduitFamily: ConduitFamily,
  cableOuterDiaMm: number,
  cableCount: number,
  condition: 'SAME_SIZE_STRAIGHT' | 'CURVED_OR_DIFFERENT_SIZES' = 'SAME_SIZE_STRAIGHT'
): ConduitSizingCalculationOutput {
  const singleCableAreaMm2 = Number(((Math.PI * Math.pow(cableOuterDiaMm, 2)) / 4).toFixed(1));
  const totalCableAreaMm2 = Number((singleCableAreaMm2 * cableCount).toFixed(1));

  // Occupancy Limit Rule per 内線規程 / isijp.com:
  // 同一太さ直線: 48%
  // 異なる太さまたは屈曲箇所を含む場合: 32%
  const occupancyLimitPercent = condition === 'SAME_SIZE_STRAIGHT' ? 48 : 32;
  const limitReason = condition === 'SAME_SIZE_STRAIGHT'
    ? '内線規程基準: 同一太さ直線部 (最大占有率 48%以下)'
    : '内線規程基準: 異なる太さ電線混在または屈曲箇所あり (最大占有率 32%以下)';

  // Bundling Current Reduction Factor (内線規程 電流減少係数)
  let bundlingCurrentReductionFactor = 1.0;
  if (cableCount <= 3) bundlingCurrentReductionFactor = 0.70;
  else if (cableCount === 4) bundlingCurrentReductionFactor = 0.63;
  else if (cableCount <= 6) bundlingCurrentReductionFactor = 0.56;
  else if (cableCount <= 8) bundlingCurrentReductionFactor = 0.52;
  else if (cableCount <= 10) bundlingCurrentReductionFactor = 0.49;
  else bundlingCurrentReductionFactor = 0.43;

  const specsList = CONDUIT_SPECS_DATABASE[conduitFamily] || CONDUIT_SPECS_DATABASE.STEEL_THIN_C;

  const comparisonList: ConduitEvaluationResult[] = specsList.map(conduit => {
    const occupancyPercent = Number(((totalCableAreaMm2 / conduit.innerAreaMm2) * 100).toFixed(1));
    const isCompliant = occupancyPercent <= occupancyLimitPercent;
    const allowedArea = (conduit.innerAreaMm2 * occupancyLimitPercent) / 100;
    const remainingAreaMm2 = Number((allowedArea - totalCableAreaMm2).toFixed(1));

    let status: 'PASS' | 'REVIEW' | 'FAIL' = 'PASS';
    if (!isCompliant) {
      status = 'FAIL';
    } else if (occupancyPercent >= occupancyLimitPercent * 0.88) {
      status = 'REVIEW';
    }

    return {
      conduit,
      occupancyPercent,
      limitPercent: occupancyLimitPercent,
      isCompliant,
      status,
      remainingAreaMm2
    };
  });

  // Find minimum compliant size
  const compliantCandidates = comparisonList.filter(c => c.isCompliant);
  const recommendedItem = compliantCandidates.length > 0 ? compliantCandidates[0] : comparisonList[comparisonList.length - 1];

  return {
    totalCableCount: cableCount,
    cableOuterDiaMm,
    singleCableAreaMm2,
    totalCableAreaMm2,
    occupancyLimitPercent,
    limitReason,
    recommendedConduit: recommendedItem.conduit,
    actualOccupancyPercent: recommendedItem.occupancyPercent,
    isRecommendedCompliant: recommendedItem.isCompliant,
    bundlingCurrentReductionFactor,
    comparisonList
  };
}

// =========================================================================
// PART 3: ADVANCED MULTI-CABLE CONDUIT SIZING (isijp.com gk-haikan-2-0411.htm)
// =========================================================================

export interface MultiCableItemInput {
  id: string;
  name: string;
  category: string;
  sizeSq: string;
  outerDiaMm: number;
  count: number;
}

export interface MultiCableItemOutput extends MultiCableItemInput {
  singleAreaMm2: number;
  subtotalAreaMm2: number;
  sharePercent: number;
}

export interface MultiCableConduitResult {
  cableList: MultiCableItemOutput[];
  totalCablesCount: number;
  totalCablesAreaMm2: number;
  occupancyLimitPercent: 32 | 48;
  limitReason: string;
  isMultiSize: boolean;
  pullBoxRequired: boolean;
  pullBoxReason: string;
  minConduitBendingRadiusMm: number;
  bundlingCurrentReductionFactor: number;
  recommendedConduit: ConduitSpec;
  actualOccupancyPercent: number;
  isRecommendedCompliant: boolean;
  comparisonList: ConduitEvaluationResult[];
}

export function calculateMultiCableConduitSizing(
  conduitFamily: ConduitFamily,
  cables: MultiCableItemInput[],
  hasBendsOrCurves: boolean = true,
  routeLengthM: number = 20,
  bendsCount90Deg: number = 1
): MultiCableConduitResult {
  let totalCablesCount = 0;
  let totalCablesAreaMm2 = 0;

  // Check if different cable outer diameters exist
  const distinctDiameters = new Set(cables.map(c => c.outerDiaMm));
  const isMultiSize = distinctDiameters.size > 1;

  // Determine limit: 32% if different sizes or curved/corners, 48% only if strictly same size straight
  const occupancyLimitPercent: 32 | 48 = (isMultiSize || hasBendsOrCurves || bendsCount90Deg > 0) ? 32 : 48;
  const limitReason = occupancyLimitPercent === 32
    ? (isMultiSize
        ? '内線規程 第3110節: 異なる外径の電線・ケーブル混在（最大占有率 32%以下）'
        : '内線規程 第3110節: 屈曲箇所あり/入線困難（最大占有率 32%以下）')
    : '内線規程 第3110節: 同一太さ直線管路（最大占有率 48%以下）';

  // Calculate each cable's area
  const cableOutputs: MultiCableItemOutput[] = cables.map(c => {
    const singleArea = Number(((Math.PI * Math.pow(c.outerDiaMm, 2)) / 4).toFixed(1));
    const subtotalArea = Number((singleArea * c.count).toFixed(1));
    totalCablesCount += c.count;
    totalCablesAreaMm2 += subtotalArea;
    return {
      ...c,
      singleAreaMm2: singleArea,
      subtotalAreaMm2: subtotalArea,
      sharePercent: 0 // populated below
    };
  });

  totalCablesAreaMm2 = Number(totalCablesAreaMm2.toFixed(1));

  // Compute share percentages
  cableOutputs.forEach(c => {
    c.sharePercent = totalCablesAreaMm2 > 0 ? Number(((c.subtotalAreaMm2 / totalCablesAreaMm2) * 100).toFixed(1)) : 0;
  });

  // Pull Box requirement per isijp.com gk-haikan-2 & 内線規程
  // 配管長30m超、または90°曲がりが3箇所を超える場合
  const isLengthOver30 = routeLengthM > 30;
  const isBendsOver3 = bendsCount90Deg >= 3;
  const pullBoxRequired = isLengthOver30 || isBendsOver3;
  let pullBoxReason = '不要: 直線長30m以内かつ曲がり3箇所以内です';
  if (isLengthOver30 && isBendsOver3) {
    pullBoxReason = `要設置: 直線長(${routeLengthM}m > 30m) および 90°屈曲(${bendsCount90Deg}箇所 ≥ 3) の両方を超過。中間プルボックスを設置してください。`;
  } else if (isLengthOver30) {
    pullBoxReason = `要設置: 配管長(${routeLengthM}m)が30mを超過しています。入線張力低減のため中間プルボックスが必要です。`;
  } else if (isBendsOver3) {
    pullBoxReason = `要設置: 90°屈曲が${bendsCount90Deg}箇所あります（内線規程上限: 3箇所以内）。曲がり間にプルボックスを設けてください。`;
  }

  // Bundling reduction factor
  let bundlingCurrentReductionFactor = 1.0;
  if (totalCablesCount <= 3) bundlingCurrentReductionFactor = 0.70;
  else if (totalCablesCount === 4) bundlingCurrentReductionFactor = 0.63;
  else if (totalCablesCount <= 6) bundlingCurrentReductionFactor = 0.56;
  else if (totalCablesCount <= 8) bundlingCurrentReductionFactor = 0.52;
  else if (totalCablesCount <= 10) bundlingCurrentReductionFactor = 0.49;
  else bundlingCurrentReductionFactor = 0.43;

  const specsList = CONDUIT_SPECS_DATABASE[conduitFamily] || CONDUIT_SPECS_DATABASE.STEEL_THICK_G;

  const comparisonList: ConduitEvaluationResult[] = specsList.map(conduit => {
    const occupancyPercent = conduit.innerAreaMm2 > 0 ? Number(((totalCablesAreaMm2 / conduit.innerAreaMm2) * 100).toFixed(1)) : 0;
    const isCompliant = occupancyPercent <= occupancyLimitPercent;
    const allowedArea = (conduit.innerAreaMm2 * occupancyLimitPercent) / 100;
    const remainingAreaMm2 = Number((allowedArea - totalCablesAreaMm2).toFixed(1));

    let status: 'PASS' | 'REVIEW' | 'FAIL' = 'PASS';
    if (!isCompliant) {
      status = 'FAIL';
    } else if (occupancyPercent >= occupancyLimitPercent * 0.88) {
      status = 'REVIEW';
    }

    return {
      conduit,
      occupancyPercent,
      limitPercent: occupancyLimitPercent,
      isCompliant,
      status,
      remainingAreaMm2
    };
  });

  const compliantCandidates = comparisonList.filter(c => c.isCompliant);
  const recommendedItem = compliantCandidates.length > 0 ? compliantCandidates[0] : comparisonList[comparisonList.length - 1];

  // Minimum Bending Radius: 6 times the conduit inner diameter (内径の6倍以上)
  const minConduitBendingRadiusMm = Math.round(recommendedItem.conduit.innerDiaMm * 6);

  return {
    cableList: cableOutputs,
    totalCablesCount,
    totalCablesAreaMm2,
    occupancyLimitPercent,
    limitReason,
    isMultiSize,
    pullBoxRequired,
    pullBoxReason,
    minConduitBendingRadiusMm,
    bundlingCurrentReductionFactor,
    recommendedConduit: recommendedItem.conduit,
    actualOccupancyPercent: recommendedItem.occupancyPercent,
    isRecommendedCompliant: recommendedItem.isCompliant,
    comparisonList
  };
}

// =========================================================================
// PART 4: FULL JIS CABLE CANDIDATE COMPARISON & ECONOMIC ANALYSIS
// =========================================================================

export interface DetailedCableCandidateRow {
  sizeSq: number;
  sizeLabel: string;
  r20OhmPerKm: number;
  rTOhmPerKm: number;
  xOhmPerKm: number;
  baseAmpacityA: number;
  deratedAmpacityA: number;
  marginFactor: number;
  simplifiedDropV: number;
  simplifiedDropPercent: number;
  preciseDropV: number;
  preciseDropPercent: number;
  powerLossKw: number;
  annualLossKwh: number;
  annualLossJpy: number;
  lifetime20yLossJpy: number;
  status: 'PASS' | 'REVIEW' | 'FAIL';
  remarks: string;
}

export interface FullJisComparisonOutput {
  candidates: DetailedCableCandidateRow[];
  recommendedCandidate: DetailedCableCandidateRow;
  targetAllowableDropPercent: number;
  minimumRequiredSizeSq: number;
  economicTariffJpyPerKwh: number;
  annualOperatingHours: number;
}

const ALL_JIS_EVALUATION_SIZES = [2, 3.5, 5.5, 8, 14, 22, 38, 60, 100, 150, 200, 250, 300, 400, 500];

// Standard base ampacities in air / conduit for 600V CV / CVT per JIS C 3605
const JIS_CV_BASE_AMPACITY: Record<number, number> = {
  2: 27,
  3.5: 37,
  5.5: 49,
  8: 61,
  14: 88,
  22: 115,
  38: 162,
  60: 217,
  100: 298,
  150: 383,
  200: 456,
  250: 524,
  300: 588,
  400: 692,
  500: 792
};

export function evaluateAllJisCableCandidates(
  input: KyokutoVoltageDropInput,
  annualHours: number = 1600, // standard solar PV generation hours or 8760 continuous
  tariffJpyPerKwh: number = 16 // e.g. FIT/FIP solar price in Japan
): FullJisComparisonOutput {
  const {
    systemType,
    voltageV,
    currentA,
    lengthM,
    conductorMaterial = 'COPPER',
    powerFactor = 0.95,
    ambientTempC = 30,
    operatingTempC = 75,
    lineType = 'TRUNK',
    hasOnsiteTransformer = true
  } = input;

  const L = lengthM;
  const I = currentA;

  // Constant for Kyokuto simplified
  let kSimplified = 35.6;
  let kPrecise = 2.0;
  if (systemType === '3P_3W' || systemType === '3P_4W_LINE') {
    kSimplified = 30.8;
    kPrecise = Math.sqrt(3);
  } else if (systemType === '1P_3W' || systemType === '3P_4W_PHASE') {
    kSimplified = 17.8;
    kPrecise = 1.0;
  }

  // Allowable limit
  let allowableLimitPercent = 2.0;
  if (lineType === 'TRUNK') {
    allowableLimitPercent = hasOnsiteTransformer ? 3.0 : 2.0;
  } else if (lineType === 'BRANCH') {
    allowableLimitPercent = 2.0;
  } else {
    if (L <= 60) allowableLimitPercent = 3.0;
    else if (L <= 120) allowableLimitPercent = 4.0;
    else if (L <= 200) allowableLimitPercent = 5.0;
    else allowableLimitPercent = 6.0;
  }

  // Calculate required nominal cross-section A_req from Kyokuto simplified formula:
  // e_allow = (voltageV * allowableLimitPercent) / 100
  // e = (k * L * I) / (1000 * A)  =>  A_req = (k * L * I) / (1000 * e_allow)
  const allowedDropV = (voltageV * allowableLimitPercent) / 100;
  const minRequiredA = allowedDropV > 0 ? (kSimplified * L * I) / (1000 * allowedDropV) : 0;

  const cosPhi = Math.min(1.0, Math.max(0, powerFactor));
  const sinPhi = Math.sqrt(Math.max(0, 1 - Math.pow(cosPhi, 2)));
  const lengthKm = L / 1000;
  const materialMult = conductorMaterial === 'ALUMINUM' ? 1.6 : 1.0;

  // Derating factor for ambient temp
  const kt = Math.sqrt(Math.max(0.1, (90 - ambientTempC) / 60));

  const candidates: DetailedCableCandidateRow[] = ALL_JIS_EVALUATION_SIZES.map(size => {
    const r20 = (JIS_COPPER_RESISTANCE_20C[size] || (17.8 / size)) * materialMult;
    const rT = r20 * ((234.5 + operatingTempC) / (234.5 + 20));
    const x = JIS_CABLE_REACTANCE[size] || 0.085;

    // Simplified drop
    const simV = (kSimplified * L * I) / (1000 * size);
    const simPercent = (simV / voltageV) * 100;

    // Precise drop
    const impedance = systemType === 'DC_2W' ? rT : (rT * cosPhi + x * sinPhi);
    const precV = kPrecise * I * lengthKm * impedance;
    const precPercent = (precV / voltageV) * 100;

    // Power Loss:
    // 3P: 3 * I^2 * R * L * 10^-3 (W)
    // 1P or DC: 2 * I^2 * R * L * 10^-3 (W)
    const phases = (systemType === '3P_3W' || systemType === '3P_4W_LINE' || systemType === '3P_4W_PHASE') ? 3 : 2;
    const powerLossWatts = phases * Math.pow(I, 2) * (rT / 1000) * L;
    const powerLossKw = powerLossWatts / 1000;

    // Economic loss
    const annualLossKwh = Math.round(powerLossKw * annualHours);
    const annualLossJpy = Math.round(annualLossKwh * tariffJpyPerKwh);
    const lifetime20yLossJpy = Math.round(annualLossJpy * 20);

    const baseAmp = JIS_CV_BASE_AMPACITY[size] || Math.round(size * 4);
    const deratedAmp = Math.round(baseAmp * kt);
    const marginFactor = I > 0 ? Number((deratedAmp / I).toFixed(2)) : 10;

    let status: 'PASS' | 'REVIEW' | 'FAIL' = 'PASS';
    let remarks = '基準適合';

    const testDrop = precPercent > 0 ? precPercent : simPercent;
    if (testDrop > allowableLimitPercent || deratedAmp < I) {
      status = 'FAIL';
      remarks = testDrop > allowableLimitPercent ? `電圧降下超過 (${testDrop.toFixed(2)}% > ${allowableLimitPercent}%)` : `許容電流不足 (${deratedAmp}A < ${I}A)`;
    } else if (testDrop >= allowableLimitPercent * 0.85) {
      status = 'REVIEW';
      remarks = `許容限度近接 (${testDrop.toFixed(2)}%)`;
    }

    return {
      sizeSq: size,
      sizeLabel: `${size} mm²`,
      r20OhmPerKm: Number(r20.toFixed(4)),
      rTOhmPerKm: Number(rT.toFixed(4)),
      xOhmPerKm: Number(x.toFixed(4)),
      baseAmpacityA: baseAmp,
      deratedAmpacityA: deratedAmp,
      marginFactor,
      simplifiedDropV: Number(simV.toFixed(2)),
      simplifiedDropPercent: Number(simPercent.toFixed(2)),
      preciseDropV: Number(precV.toFixed(2)),
      preciseDropPercent: Number(precPercent.toFixed(2)),
      powerLossKw: Number(powerLossKw.toFixed(2)),
      annualLossKwh,
      annualLossJpy,
      lifetime20yLossJpy,
      status,
      remarks
    };
  });

  const compliantList = candidates.filter(c => c.status === 'PASS');
  const recommendedCandidate = compliantList.length > 0 ? compliantList[0] : candidates[candidates.length - 1];

  return {
    candidates,
    recommendedCandidate,
    targetAllowableDropPercent: allowableLimitPercent,
    minimumRequiredSizeSq: Number(minRequiredA.toFixed(1)),
    economicTariffJpyPerKwh: tariffJpyPerKwh,
    annualOperatingHours: annualHours
  };
}
