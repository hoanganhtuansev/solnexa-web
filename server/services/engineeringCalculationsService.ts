/**
 * SOLNEXA Engineering Calculations Engine
 * Physics-based electrical calculations for:
 * 1. Voltage Drop Calculator (IEC 60364-5-52)
 * 2. Cable Sizing & Ampacity Derating
 * 3. PV String Design & MPPT Compatibility
 */

import {
  VoltageDropInput,
  VoltageDropOutput,
  CableSelectionInput,
  CableSelectionOutput,
  PVStringDesignInput,
  PVStringDesignOutput
} from '../../src/types';

// Standard Copper Conductor Resistance at 20°C (Ω/km) per IEC 60228 Class 2
const COPPER_RESISTANCE_20C: Record<number, number> = {
  1.5: 12.1,
  2.5: 7.41,
  4: 4.61,
  6: 3.08,
  10: 1.83,
  16: 1.15,
  25: 0.727,
  35: 0.524,
  50: 0.387,
  70: 0.268,
  95: 0.193,
  120: 0.153,
  150: 0.124,
  185: 0.0991,
  240: 0.0754,
  300: 0.0601,
  400: 0.0470,
  500: 0.0366
};

// Standard Aluminum Conductor Resistance at 20°C (Ω/km)
const ALUMINUM_RESISTANCE_20C: Record<number, number> = {
  16: 1.91,
  25: 1.20,
  35: 0.868,
  50: 0.641,
  70: 0.443,
  95: 0.320,
  120: 0.253,
  150: 0.206,
  185: 0.164,
  240: 0.125,
  300: 0.100,
  400: 0.0778,
  500: 0.0605
};

// Standard Base Ampacity in Air (XLPE 90°C) per IEC 60364-5-52 (Table B.52.12 Method E)
const BASE_AMPACITY_AIR_90C: Record<number, number> = {
  1.5: 23,
  2.5: 31,
  4: 42,
  6: 54,
  10: 75,
  16: 100,
  25: 127,
  35: 158,
  50: 192,
  70: 246,
  95: 298,
  120: 346,
  150: 399,
  185: 456,
  240: 538,
  300: 621,
  400: 741,
  500: 855
};

export class EngineeringCalculationsService {
  /**
   * 1. Voltage Drop Calculator
   */
  public calculateVoltageDrop(input: VoltageDropInput): VoltageDropOutput {
    const isCopper = input.conductorMaterial === 'COPPER';
    const resistanceTable = isCopper ? COPPER_RESISTANCE_20C : ALUMINUM_RESISTANCE_20C;
    const r20 = resistanceTable[input.crossSectionMm2] || (isCopper ? 18.1 / input.crossSectionMm2 : 29.4 / input.crossSectionMm2);

    // Temperature correction: R_T = R_20 * [1 + α * (T - 20)]
    // α_Cu = 0.00393, α_Al = 0.00403
    const alpha = isCopper ? 0.00393 : 0.00403;
    const rT = r20 * (1 + alpha * (input.operatingTemp - 20)); // Ω/km

    const x = input.reactancePerKm ?? 0.08; // Typical AC reactance Ω/km
    const cosPhi = Math.min(1.0, Math.max(0.1, input.powerFactor));
    const sinPhi = Math.sqrt(1 - cosPhi * cosPhi);

    const lengthKm = input.cableLength / 1000;
    const zEffective = (rT * cosPhi + x * sinPhi); // Ω/km

    let deltaV = 0;
    let powerLossKw = 0;

    if (input.systemType === '3_PHASE') {
      // ΔV = √3 * I * L * (R cosφ + X sinφ)
      deltaV = Math.sqrt(3) * input.current * lengthKm * zEffective;
      // 3-phase P_loss = 3 * I^2 * R * L / 1000
      powerLossKw = (3 * Math.pow(input.current, 2) * rT * lengthKm) / 1000;
    } else {
      // Single phase ΔV = 2 * I * L * (R cosφ + X sinφ)
      deltaV = 2 * input.current * lengthKm * zEffective;
      // 1-phase P_loss = 2 * I^2 * R * L / 1000
      powerLossKw = (2 * Math.pow(input.current, 2) * rT * lengthKm) / 1000;
    }

    const voltageDropPercentage = (deltaV / input.voltage) * 100;
    const endVoltageVolts = input.voltage - deltaV;
    const standardLimitPercent = 3.0; // IEC standard 3% for lighting/branch, 5% for utility

    return {
      voltageDropVolts: Math.round(deltaV * 100) / 100,
      voltageDropPercentage: Math.round(voltageDropPercentage * 100) / 100,
      endVoltageVolts: Math.round(endVoltageVolts * 100) / 100,
      cableResistancePerKm: Math.round(rT * 1000) / 1000,
      powerLossKw: Math.round(powerLossKw * 100) / 100,
      isCompliant: voltageDropPercentage <= standardLimitPercent,
      standardLimitPercent
    };
  }

  /**
   * 2. Cable Selection & Ampacity Engine
   */
  public selectCable(input: CableSelectionInput): CableSelectionOutput {
    // Temperature Derating Factor (kt) for 90°C XLPE cable with reference 30°C in air
    // kt = sqrt((90 - Tamb) / (90 - 30))
    const tamb = Math.min(80, Math.max(10, input.ambientTempC));
    const tempDerating = Math.round(Math.sqrt((90 - tamb) / 60) * 100) / 100;

    // Grouping Derating Factor (kg) per IEC 60364-5-52 Table B.52.17
    let groupDerating = 1.0;
    if (input.numberOfCircuits === 2) groupDerating = 0.88;
    else if (input.numberOfCircuits === 3) groupDerating = 0.82;
    else if (input.numberOfCircuits >= 4 && input.numberOfCircuits <= 6) groupDerating = 0.75;
    else if (input.numberOfCircuits > 6) groupDerating = 0.70;

    const availableSizes = [4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300, 400];
    const alternativeSizes: CableSelectionOutput['alternativeSizes'] = [];

    let recommendedSize = 4;
    let found = false;

    for (const size of availableSizes) {
      const baseAmp = BASE_AMPACITY_AIR_90C[size] || size * 2.5;
      const effectiveAmp = baseAmp * tempDerating * groupDerating;

      // Calculate voltage drop with this size
      const vDrop = this.calculateVoltageDrop({
        systemType: input.systemType,
        voltage: input.systemVoltage,
        current: input.loadCurrent,
        powerFactor: 0.95,
        cableLength: input.runLengthMeters,
        conductorMaterial: 'COPPER',
        crossSectionMm2: size,
        operatingTemp: 70
      });

      const isCurrentOk = effectiveAmp >= input.loadCurrent;
      const isVDropOk = vDrop.voltageDropPercentage <= input.maxVoltageDropPercent;
      const suitable = isCurrentOk && isVDropOk;

      alternativeSizes.push({
        sizeMm2: size,
        effectiveAmpacity: Math.round(effectiveAmp * 10) / 10,
        vDropPercent: vDrop.voltageDropPercentage,
        suitable
      });

      if (suitable && !found) {
        recommendedSize = size;
        found = true;
      }
    }

    if (!found) {
      recommendedSize = availableSizes[availableSizes.length - 1];
    }

    const recBase = BASE_AMPACITY_AIR_90C[recommendedSize] || 100;
    const recEffective = recBase * tempDerating * groupDerating;
    const recVDrop = this.calculateVoltageDrop({
      systemType: input.systemType,
      voltage: input.systemVoltage,
      current: input.loadCurrent,
      powerFactor: 0.95,
      cableLength: input.runLengthMeters,
      conductorMaterial: 'COPPER',
      crossSectionMm2: recommendedSize,
      operatingTemp: 70
    });

    return {
      recommendedSizeMm2: recommendedSize,
      baseAmpacity: recBase,
      tempDeratingFactor: tempDerating,
      groupingDeratingFactor: groupDerating,
      effectiveAmpacity: Math.round(recEffective * 10) / 10,
      calculatedVoltageDropPercent: recVDrop.voltageDropPercentage,
      isCompliant: recEffective >= input.loadCurrent && recVDrop.voltageDropPercentage <= input.maxVoltageDropPercent,
      alternativeSizes
    };
  }

  /**
   * 3. PV String Design & MPPT Matcher
   */
  public designPVString(input: PVStringDesignInput): PVStringDesignOutput {
    const warnings: string[] = [];

    // Voc increases at lowest temperature:
    // Voc_max = Voc_STC * [1 + (beta_Voc / 100) * (T_min - 25)]
    // Note beta_Voc is negative, so (T_min - 25) is negative -> product is positive
    const deltaTMin = input.minAmbientTempC - 25;
    const vocMinTemp = input.pvVocSTC * (1 + (input.pvTempCoeffVoc / 100) * deltaTMin);

    // Vmp decreases at highest module temperature:
    // Vmp_min = Vmp_STC * [1 + (beta_Vmp / 100) * (T_max - 25)]
    const deltaTMax = input.maxModuleTempC - 25;
    const vmpTempCoeff = input.pvTempCoeffPmax || input.pvTempCoeffVoc;
    const vmpMaxTemp = input.pvVmpSTC * (1 + (vmpTempCoeff / 100) * deltaTMax);

    // Max modules per string so that Voc_string <= Inverter Max DC Voltage
    const maxModules = Math.floor(input.inverterMaxDcVoltage / vocMinTemp);

    // Min modules per string so that Vmp_string >= Inverter MPPT Min Voltage at high temp
    const minModules = Math.ceil(input.inverterMpptMinVoltage / vmpMaxTemp);

    // Recommended modules per string (typical target ~80-85% of Max DC voltage at Vmp)
    let recommended = Math.floor((input.inverterMpptMaxVoltage * 0.9) / input.pvVmpSTC);
    if (recommended > maxModules) recommended = maxModules;
    if (recommended < minModules) recommended = minModules;

    // Strings per MPPT based on Isc limits
    const maxStringsPerMppt = Math.max(1, Math.floor(input.inverterMaxIscPerMppt / (input.pvIscSTC * 1.25)));

    const totalStringVocMax = Math.round(recommended * vocMinTemp * 10) / 10;
    const totalStringVmpMin = Math.round(recommended * vmpMaxTemp * 10) / 10;
    const totalStringVmpMax = Math.round(recommended * input.pvVmpSTC * 10) / 10;

    const isVoltageSafe = totalStringVocMax <= input.inverterMaxDcVoltage;
    const isMpptCompliant = totalStringVmpMin >= input.inverterMpptMinVoltage && totalStringVmpMax <= input.inverterMpptMaxVoltage;

    if (!isVoltageSafe) {
      warnings.push(`Warning: String Voc at ${input.minAmbientTempC}°C (${totalStringVocMax}V) exceeds Inverter Max DC Voltage (${input.inverterMaxDcVoltage}V)! Reduce modules per string.`);
    }
    if (totalStringVmpMin < input.inverterMpptMinVoltage) {
      warnings.push(`Warning: String Vmp at ${input.maxModuleTempC}°C (${totalStringVmpMin}V) drops below Inverter MPPT Min voltage (${input.inverterMpptMinVoltage}V).`);
    }

    return {
      vocAtMinTemp: Math.round(vocMinTemp * 100) / 100,
      vmpAtMaxTemp: Math.round(vmpMaxTemp * 100) / 100,
      maxModulesPerString: maxModules,
      minModulesPerString: minModules,
      recommendedModulesPerString: recommended,
      maxStringsPerMppt,
      totalStringVocMax,
      totalStringVmpMin,
      totalStringVmpMax,
      isVoltageSafe,
      isMpptCompliant,
      warnings
    };
  }
}

export const engineeringCalculationsService = new EngineeringCalculationsService();
