/**
 * SOLNEXA Specification Normalizer
 * Normalizes electrical, mechanical, and thermal units into canonical engineering SI units.
 * Validates engineering sanity bounds.
 */

export interface NormalizedSpecOutput {
  normalizedValue: number | string;
  normalizedUnit: string;
  isSanityChecked: boolean;
  warning?: string;
}

export class SpecificationNormalizer {
  public normalize(parameterName: string, rawValue: string, rawUnit: string): NormalizedSpecOutput {
    const cleanUnit = (rawUnit || '').trim().replace(/[\[\]()]/g, '');
    const cleanVal = (rawValue || '').trim();

    // Special string/code parameters that should not be stripped to pure numbers
    if (parameterName.includes('ip_rating') || parameterName.includes('protection_degree')) {
      const ipMatch = cleanVal.match(/\b(IP\s*[0-9]{2})\b/i);
      return {
        normalizedValue: ipMatch ? ipMatch[1].replace(/\s+/g, '').toUpperCase() : cleanVal,
        normalizedUnit: '',
        isSanityChecked: true
      };
    }

    if (parameterName.includes('dimension') || parameterName.includes('cooling') || parameterName.includes('phase')) {
      return {
        normalizedValue: cleanVal,
        normalizedUnit: cleanUnit,
        isSanityChecked: true
      };
    }

    // Check if numeric or range (supports negative numbers like -25 ~ 60 °C, Japanese fullwidth tilde ～, etc.)
    const rangeMatch = cleanVal.match(/([-+]?[0-9.]+)\s*(?:[°℃C%]*)\s*[-~–～]\s*([-+]?[0-9.]+)/);
    if (rangeMatch && !parameterName.includes('_min') && !parameterName.includes('_max')) {
      const minVal = parseFloat(rangeMatch[1]);
      const maxVal = parseFloat(rangeMatch[2]);
      const detectedUnit = cleanUnit || (cleanVal.includes('℃') || cleanVal.includes('°C') ? '°C' : (cleanVal.includes('%') ? '%' : ''));
      return {
        normalizedValue: `${minVal} ~ ${maxVal}`,
        normalizedUnit: detectedUnit,
        isSanityChecked: true
      };
    }

    // Qualitative / Status / Description parameters (e.g. '対応', 'Yes', '単相2線/単相3線', '自然空冷', etc.)
    if (/^(?:対応|Yes|No|あり|なし|有|無|OK|Passed|Included|Optional|Standard|Type\s*I{1,3}|OV[、,].*|単相.*|三相.*)$/i.test(cleanVal) ||
        (cleanUnit === '' && cleanVal.replace(/[-+0-9.,\s]/g, '').length > 4 && !parameterName.includes('power') && !parameterName.includes('voltage') && !parameterName.includes('current'))) {
      return {
        normalizedValue: cleanVal,
        normalizedUnit: cleanUnit,
        isSanityChecked: true
      };
    }

    const numMatch = cleanVal.replace(/,/g, '').match(/[-+]?[0-9]*\.?[0-9]+/);
    const num = numMatch ? parseFloat(numMatch[0]) : NaN;

    // Unit Normalization Logic
    if (!isNaN(num)) {
      // 1. Voltage Normalization (Base unit: V)
      if (/^kv$/i.test(cleanUnit) || (cleanUnit === '' && parameterName.includes('voltage') && num < 10 && num > 0.1)) {
        return {
          normalizedValue: Math.round(num * 1000 * 100) / 100,
          normalizedUnit: 'V',
          isSanityChecked: true
        };
      }
      if (/^mv$/i.test(cleanUnit)) {
        return {
          normalizedValue: Math.round(num * 0.001 * 1000) / 1000,
          normalizedUnit: 'V',
          isSanityChecked: true
        };
      }
      if (/^v$/i.test(cleanUnit)) {
        return {
          normalizedValue: num,
          normalizedUnit: 'V',
          isSanityChecked: num <= 500000 && num >= 0
        };
      }

      // 2. Current Normalization (Base unit: A)
      if (/^ka$/i.test(cleanUnit)) {
        if (parameterName.includes('breaking_capacity') || parameterName.includes('short_circuit')) {
          // Breaker breaking capacity standard is kA
          return { normalizedValue: num, normalizedUnit: 'kA', isSanityChecked: true };
        }
        return { normalizedValue: num * 1000, normalizedUnit: 'A', isSanityChecked: true };
      }
      if (/^ma$/i.test(cleanUnit)) {
        return { normalizedValue: num / 1000, normalizedUnit: 'A', isSanityChecked: true };
      }
      if (/^a$/i.test(cleanUnit)) {
        return { normalizedValue: num, normalizedUnit: 'A', isSanityChecked: true };
      }

      // 3. Power Normalization (Base unit: kW for PCS/inverters/transformers, W for PV modules)
      if (parameterName.includes('pmax') || parameterName.includes('module')) {
        if (/^kw$/i.test(cleanUnit)) {
          return { normalizedValue: num * 1000, normalizedUnit: 'W', isSanityChecked: true };
        }
        if (/^w$/i.test(cleanUnit) || /^wp$/i.test(cleanUnit)) {
          return { normalizedValue: num, normalizedUnit: 'W', isSanityChecked: num > 0 && num < 1500 };
        }
      }

      if (/^mw$/i.test(cleanUnit)) {
        return { normalizedValue: num * 1000, normalizedUnit: 'kW', isSanityChecked: true };
      }
      if (/^kw$/i.test(cleanUnit)) {
        return { normalizedValue: num, normalizedUnit: 'kW', isSanityChecked: true };
      }
      if (/^mva$/i.test(cleanUnit)) {
        return { normalizedValue: num * 1000, normalizedUnit: 'kVA', isSanityChecked: true };
      }
      if (/^kva$/i.test(cleanUnit)) {
        return { normalizedValue: num, normalizedUnit: 'kVA', isSanityChecked: true };
      }

      // 4. Energy Normalization (Base unit: kWh)
      if (/^mwh$/i.test(cleanUnit)) {
        return { normalizedValue: num * 1000, normalizedUnit: 'kWh', isSanityChecked: true };
      }
      if (/^kwh$/i.test(cleanUnit)) {
        return { normalizedValue: num, normalizedUnit: 'kWh', isSanityChecked: true };
      }

      // 5. Efficiency & Percentages (Base unit: %)
      if (/^%$/i.test(cleanUnit) || parameterName.includes('efficiency') || parameterName.includes('thd')) {
        let eff = num;
        if (eff > 0 && eff <= 1.0 && parameterName.includes('efficiency')) {
          eff = eff * 100; // converted 0.985 -> 98.5%
        }
        return {
          normalizedValue: Math.round(eff * 100) / 100,
          normalizedUnit: '%',
          isSanityChecked: eff <= 100 && eff >= 0
        };
      }

      // 6. Temperature coefficients
      if (parameterName.includes('temp_coefficient') || parameterName.includes('coeff')) {
        return {
          normalizedValue: num,
          normalizedUnit: '%/°C',
          isSanityChecked: Math.abs(num) < 5
        };
      }

      // Default numeric
      return {
        normalizedValue: num,
        normalizedUnit: cleanUnit,
        isSanityChecked: true
      };
    }

    // Default string
    return {
      normalizedValue: cleanVal,
      normalizedUnit: cleanUnit,
      isSanityChecked: true
    };
  }
}

export const specificationNormalizer = new SpecificationNormalizer();
