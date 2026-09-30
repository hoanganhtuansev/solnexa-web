/**
 * SOLNEXA Native Specification Parser
 * Uses deterministic electrical engineering regex patterns, keywords, and table parsing.
 * Never invents values. Attaches source page and confidence.
 */

import { EquipmentCategoryCode, EquipmentSpecification } from '../../src/types';
import { ExtractedPageText } from './pdfTextExtractor';

export interface NativeParsedIdentity {
  manufacturer: string;
  model: string;
  category: EquipmentCategoryCode;
  series?: string;
  description?: string;
  sourcePage: number;
  confidence: number;
}

export interface NativeParsedResult {
  identity: NativeParsedIdentity;
  specifications: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>>;
  sourceSnippets: Array<{ pageNumber: number; snippetText: string; parameterName?: string }>;
}

export class NativeSpecificationParser {
  // Known manufacturer names for fuzzy detection across datasheets
  private readonly KNOWN_MANUFACTURERS = [
    'Huawei', 'Sungrow', 'TMEIC', 'CATL', 'BYD', 'Trina', 'Trina Solar', 'Jinko', 'Jinko Solar',
    'LONGi', 'LONGi Solar', 'Omron', 'Mitsubishi', 'Mitsubishi Electric', 'Fuji Electric',
    'Schneider', 'Schneider Electric', 'LS Electric', 'SMA', 'ABB', 'Fimer', 'GoodWe',
    'Solis', 'Ginlong', 'Growatt', 'Delta', 'Hitachi', 'Siemens', 'Eaton', 'Socomec',
    'Riello', 'Tesla', 'LG Energy Solution', 'Panasonic', 'Kyocera', 'Sharp', 'Canadian Solar',
    'JA Solar', 'Risen', 'Talesun', 'Chint', 'Astronergy', 'GCL'
  ];

  public parse(pages: ExtractedPageText[], filename: string): NativeParsedResult {
    const fullText = pages.map(p => p.text).join('\n');

    // 1. Identify Manufacturer
    const identity = this.detectIdentity(pages, filename);

    // 2. Extract Specifications based on Category & Universal Electrical Patterns
    const specifications: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>> = [];
    const sourceSnippets: Array<{ pageNumber: number; snippetText: string; parameterName?: string }> = [];

    // Parse each page for engineering specifications
    for (const page of pages) {
      const pageSpecs = this.extractSpecsFromPage(page, filename, identity.category);
      for (const spec of pageSpecs.specs) {
        // Prevent duplicate parameters from same extraction method unless higher confidence
        const existingIdx = specifications.findIndex(s => s.parameterName === spec.parameterName);
        if (existingIdx >= 0) {
          if (spec.confidence > specifications[existingIdx].confidence) {
            specifications[existingIdx] = spec;
          }
        } else {
          specifications.push(spec);
        }
      }
      sourceSnippets.push(...pageSpecs.snippets);
    }

    return {
      identity,
      specifications,
      sourceSnippets
    };
  }

  private detectIdentity(pages: ExtractedPageText[], filename: string): NativeParsedIdentity {
    const firstPage = pages[0]?.text || '';
    const secondPage = pages[1]?.text || '';
    const topText = (firstPage + '\n' + secondPage).substring(0, 3000);
    const combinedFilename = filename.replace(/[_-]/g, ' ');

    // --- Manufacturer Detection ---
    let detectedMfg = '';
    let mfgConfidence = 0.5;

    for (const mfg of this.KNOWN_MANUFACTURERS) {
      const regex = new RegExp(`\\b${mfg}\\b`, 'i');
      if (regex.test(combinedFilename)) {
        detectedMfg = mfg;
        mfgConfidence = 0.95;
        break;
      }
      if (regex.test(topText)) {
        detectedMfg = mfg;
        mfgConfidence = 0.90;
        break;
      }
    }

    // Solar industry trademark fallbacks (e.g. SUN2000 is always Huawei, SG is Sungrow, etc.)
    if (!detectedMfg || detectedMfg === 'Unknown Manufacturer') {
      if (/SUN2000|FusionSolar|H\s*U\s*A\s*W\s*E\s*I|solar\.huawei/i.test(topText) || /SUN2000|Huawei/i.test(combinedFilename)) {
        detectedMfg = 'Huawei';
        mfgConfidence = 0.98;
      } else if (/\bSG[0-9.]+[A-Z0-9-]*\b|iSolarCloud/i.test(topText) || /Sungrow/i.test(combinedFilename)) {
        detectedMfg = 'Sungrow';
        mfgConfidence = 0.98;
      } else if (/\bTSM-[0-9A-Z]/i.test(topText) || /Trina/i.test(combinedFilename)) {
        detectedMfg = 'Trina Solar';
        mfgConfidence = 0.95;
      } else if (/\bJKM[0-9A-Z]/i.test(topText) || /Jinko/i.test(combinedFilename)) {
        detectedMfg = 'Jinko Solar';
        mfgConfidence = 0.95;
      } else if (/\bLR[0-9]-[0-9A-Z]/i.test(topText) || /LONGi/i.test(combinedFilename)) {
        detectedMfg = 'LONGi Solar';
        mfgConfidence = 0.95;
      }
    }

    if (!detectedMfg) {
      // Look for copyright or trademark (e.g. "© 2024 XXXX Technologies Co., Ltd.")
      const copyMatch = topText.match(/©\s*(?:20\d{2})?\s*([A-Za-z0-9\s&.,]+?)(?:Co\.|Inc\.|Ltd|Corporation|GmbH)/i);
      if (copyMatch && copyMatch[1].trim().length > 2 && copyMatch[1].trim().length < 40) {
        detectedMfg = copyMatch[1].trim();
        mfgConfidence = 0.75;
      } else {
        detectedMfg = 'Unknown Manufacturer';
        mfgConfidence = 0.3;
      }
    }

    // Standardize brand naming
    if (/huawei/i.test(detectedMfg)) detectedMfg = 'Huawei';
    else if (/sungrow/i.test(detectedMfg)) detectedMfg = 'Sungrow';
    else if (/tmeic/i.test(detectedMfg)) detectedMfg = 'TMEIC';
    else if (/catl/i.test(detectedMfg)) detectedMfg = 'CATL';
    else if (/byd/i.test(detectedMfg)) detectedMfg = 'BYD';
    else if (/trina/i.test(detectedMfg)) detectedMfg = 'Trina Solar';
    else if (/jinko/i.test(detectedMfg)) detectedMfg = 'Jinko Solar';
    else if (/longi/i.test(detectedMfg)) detectedMfg = 'LONGi Solar';
    else if (/schneider/i.test(detectedMfg)) detectedMfg = 'Schneider Electric';
    else if (/mitsubishi/i.test(detectedMfg)) detectedMfg = 'Mitsubishi Electric';
    else if (/fuji/i.test(detectedMfg)) detectedMfg = 'Fuji Electric';
    else if (/ls\s*electric/i.test(detectedMfg)) detectedMfg = 'LS Electric';

    // --- Equipment Category Classification ---
    let category: EquipmentCategoryCode = 'OTHER';
    let catConfidence = 0.6;

    const lowerCombined = (combinedFilename + ' ' + topText).toLowerCase();

    if (/pv\s*module|solar\s*module|solar\s*panel|photovoltaic\s*module|monocrystalline|topcon|heterojunction|bifacial/i.test(lowerCombined)) {
      category = 'PV_MODULE';
      catConfidence = 0.95;
    } else if (/inverter|pcs\b|power\s*conversion\s*system|string\s*inverter|central\s*inverter|mppt|パワーコンディショナ|パワコン|ハイブリッド/i.test(lowerCombined)) {
      category = 'PCS_INVERTER';
      catConfidence = 0.95;
    } else if (/bess|battery\s*energy\s*storage|energy\s*storage\s*system|liquid\s*cooling\s*bess|containerized\s*storage/i.test(lowerCombined)) {
      category = 'BESS';
      catConfidence = 0.95;
    } else if (/battery\s*pack|battery\s*module|battery\s*rack|lfp\s*cell|lithium\s*iron\s*phosphate/i.test(lowerCombined)) {
      category = 'BATTERY';
      catConfidence = 0.90;
    } else if (/transformer|step-up\s*transformer|oil-immersed|pad-mounted/i.test(lowerCombined)) {
      category = 'TRANSFORMER';
      catConfidence = 0.92;
    } else if (/air\s*circuit\s*breaker|\bacb\b|masterpact/i.test(lowerCombined)) {
      category = 'ACB';
      catConfidence = 0.92;
    } else if (/molded\s*case|\bmccb\b/i.test(lowerCombined)) {
      category = 'MCCB';
      catConfidence = 0.92;
    } else if (/vacuum\s*circuit\s*breaker|\bvcb\b/i.test(lowerCombined)) {
      category = 'VCB';
      catConfidence = 0.92;
    } else if (/combiner\s*box|string\s*combiner/i.test(lowerCombined)) {
      category = 'COMBINER_BOX';
      catConfidence = 0.90;
    } else if (/solar\s*cable|dc\s*cable|pv\s*cable|h1z2z2/i.test(lowerCombined)) {
      category = 'CABLE';
      catConfidence = 0.93;
    } else if (/cubicle|switchgear|gis\s*cubicle|ring\s*main\s*unit/i.test(lowerCombined)) {
      category = 'QB_CUBICLE';
      catConfidence = 0.88;
    } else if (/fuse|gpv\s*fuse/i.test(lowerCombined)) {
      category = 'FUSE';
      catConfidence = 0.88;
    } else if (/distribution\s*board|switchboard|\bacdb\b/i.test(lowerCombined)) {
      category = 'DISTRIBUTION_BOARD';
      catConfidence = 0.88;
    }

    // --- Model Name Extraction ---
    let modelName = '';
    let series = '';

    // Strip internal storage ID prefixes like ds-123456-abc_
    const cleanFilename = filename.replace(/^ds-\d+-[a-z0-9]+[_-]/i, '');

    // 1. First priority: Explicit model labels in text (Multilingual: EN, JA, VI, ZH, DE)
    const explicitModelKeywords = [
      /(?:項目|型式|型番|機種名|モデル)\s*[:：\t\-]?\s*([A-Z0-9]{2,12}(?:[-/.][A-Z0-9.]+){1,5})/i,
      /(?:Model(?:\s*Name|\s*No\.?|\s*Number)?|Item\s*No\.?|Part\s*Number|Type)\s*[:：\t\-]?\s*([A-Z0-9]{2,12}(?:[-/.][A-Z0-9.]+){1,5})/i,
      /(?:Mã\s*sản\s*phẩm|Model\s*thiết\s*bị|Ký\s*hiệu\s*mã)\s*[:：\t\-]?\s*([A-Z0-9]{2,12}(?:[-/.][A-Z0-9.]+){1,5})/i,
      /(?:型号|产品型号|规格型号)\s*[:：\t\-]?\s*([A-Z0-9]{2,12}(?:[-/.][A-Z0-9.]+){1,5})/i,
      /\b(SUN2000-[A-Z0-9.-]+)\b/i,
      /\b(SG[0-9.]+[A-Z0-9.-]+)\b/i,
      /\b(TSM-[A-Z0-9.-]+)\b/i,
      /\b(JKM[A-Z0-9.-]+)\b/i,
      /\b(LR[0-9]-[A-Z0-9.-]+)\b/i,
      /\b(Ener[A-Za-z0-9.-]+)\b/i,
      /\b(MTZ[0-9]\s*[A-Z0-9.-]+)\b/i
    ];

    for (const pattern of explicitModelKeywords) {
      const m = topText.match(pattern);
      if (m && m[1] && m[1].trim().length >= 3 && !m[1].startsWith('ds-')) {
        modelName = m[1].trim();
        break;
      }
    }

    // 2. Second priority: Check clean filename for model tokens
    if (!modelName) {
      const fileModelMatch = cleanFilename.match(/\b([A-Z0-9]{2,10}(?:-[A-Z0-9.]+){1,4})\b/i);
      if (fileModelMatch && !fileModelMatch[1].startsWith('ds-')) {
        modelName = fileModelMatch[1];
      }
    }

    // 3. Third priority: General alphanumeric code search in top text
    if (!modelName) {
      const genMatch = topText.match(/\b([A-Z]{2,6}-[0-9]{2,5}[A-Z0-9.-]*)\b/);
      if (genMatch && !genMatch[1].startsWith('ds-')) {
        modelName = genMatch[1];
      } else {
        modelName = cleanFilename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
      }
    }

    // Series detection
    const seriesMatch = topText.match(/\b([A-Z][a-zA-Z0-9+\s]{2,20}(?:Series|Vertex|Tiger|Hi-MO|MasterPact|FusionSolar))\b/i);
    if (seriesMatch) {
      series = seriesMatch[1].trim();
    }

    return {
      manufacturer: detectedMfg,
      model: modelName,
      category,
      series,
      description: `${detectedMfg} ${modelName} - ${category.replace(/_/g, ' ')}`,
      sourcePage: 1,
      confidence: Math.min(mfgConfidence, catConfidence)
    };
  }

  private extractSpecsFromPage(
    page: ExtractedPageText,
    filename: string,
    category: EquipmentCategoryCode
  ): {
    specs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>>;
    snippets: Array<{ pageNumber: number; snippetText: string; parameterName?: string }>;
  } {
    const text = page.text;
    const pageNum = page.pageNumber;
    const specs: Array<Omit<EquipmentSpecification, 'id' | 'modelId' | 'createdAt' | 'updatedAt'>> = [];
    const snippets: Array<{ pageNumber: number; snippetText: string; parameterName?: string }> = [];

    // Helper to test patterns and add specification
    const searchParam = (
      paramName: string,
      displayName: string,
      patterns: RegExp[],
      rawUnitDefault: string,
      normalizedUnit: string,
      valueConverter?: (rawVal: string, rawUnit?: string) => number | string
    ) => {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          const rawVal = match[1].trim();
          const rawUnit = (match[2] || rawUnitDefault || '').trim();

          let normalizedVal: number | string = rawVal;
          if (valueConverter) {
            normalizedVal = valueConverter(rawVal, rawUnit);
          } else {
            const num = parseFloat(rawVal.replace(/,/g, ''));
            if (!isNaN(num)) {
              normalizedVal = num;
            }
          }

          specs.push({
            parameterName: paramName,
            displayName: displayName,
            rawValue: match[0].trim().length < 60 ? match[0].trim() : `${rawVal} ${rawUnit}`,
            rawUnit: rawUnit,
            normalizedValue: normalizedVal,
            normalizedUnit: normalizedUnit,
            sourceDocument: filename,
            sourcePage: pageNum,
            confidence: 0.95,
            extractionMethod: page.hasTables ? 'NATIVE_TABLE' : 'NATIVE_REGEX',
            reviewStatus: 'PENDING'
          });

          snippets.push({
            pageNumber: pageNum,
            snippetText: match[0],
            parameterName: paramName
          });
          break;
        }
      }
    };

    // --- Universal Electrical & Mechanical Parameters (Multilingual: EN, JA, VI, ZH, DE) ---
    searchParam('max_efficiency', 'Max Efficiency', [
      /(?:Max\.?\s*Efficiency|Maximum\s*Efficiency|Peak\s*Efficiency|最大変換効率|最大効率|Hiệu\s*suất\s*(?:cực\s*đại|tối\s*đa)|最大(?:转换)?效率|Maximaler\s*Wirkungsgrad)\s*[:：\t\-]?\s*([0-9.]+)\s*(%)/i,
      /([0-9.]+)\s*%\s*(?:Max\.?\s*Efficiency|Peak\s*Efficiency|最大変換効率|Hiệu\s*suất\s*cực\s*đại)/i
    ], '%', '%', val => parseFloat(val));

    searchParam('european_efficiency', 'European / Regional Efficiency', [
      /(?:European\s*Efficiency|Euro\s*Efficiency|Euro\.?\s*Eff\.?|JIS効率|JIS\s*Efficiency|Hiệu\s*suất\s*Châu\s*Âu|欧洲效率|Euro-Wirkungsgrad)\s*[:：\t\-]?\s*([0-9.]+)\s*(%)/i
    ], '%', '%', val => parseFloat(val));

    searchParam('max_dc_voltage', 'Max DC Input Voltage', [
      /(?:Max\.?\s*(?:DC)?\s*Input\s*Voltage|Max\.?\s*DC\s*Voltage|Maximum\s*DC\s*Voltage|最大入力電圧|最高入力電圧|Điện\s*áp\s*(?:DC|đầu\s*vào)\s*cực\s*đại|最大(?:直流)?输入电压|Max\.?\s*Eingangsspannung)\s*[:：\t\-]?\s*([0-9,]+)\s*(V|kV|Vac|Vdc)?/i,
      /(?:Max\.?\s*System\s*Voltage|Điện\s*áp\s*hệ\s*thống\s*tối\s*đa)\s*[:：\t\-]?\s*([0-9,]+)\s*(V|kV)?/i
    ], 'V', 'V', (val, unit) => {
      const num = parseFloat(val.replace(/,/g, ''));
      return (/kV/i.test(unit || '') || /kV/i.test(text)) && num < 10 ? num * 1000 : num;
    });

    searchParam('mppt_voltage_range_min', 'MPPT Operating Voltage (Min)', [
      /(?:MPPT\s*(?:Operating)?\s*Voltage\s*Range|Operating\s*Voltage\s*Range|MPPT電圧範囲|MPPT動作電圧範囲|Dải\s*điện\s*áp\s*MPPT|MPPT工作电压范围)\s*[:：\t\-]?\s*([0-9]+)\s*[-~–～]\s*[0-9]+\s*(V)/i,
      /(?:Full\s*Power\s*MPPT\s*Range)\s*[:：\t\-]?\s*([0-9]+)\s*[-~–～]\s*[0-9]+\s*(V)/i
    ], 'V', 'V', val => parseFloat(val));

    searchParam('mppt_voltage_range_max', 'MPPT Operating Voltage (Max)', [
      /(?:MPPT\s*(?:Operating)?\s*Voltage\s*Range|Operating\s*Voltage\s*Range|MPPT電圧範囲|MPPT動作電圧範囲|Dải\s*điện\s*áp\s*MPPT|MPPT工作电压范围)\s*[:：\t\-]?\s*[0-9]+\s*[-~–～]\s*([0-9]+)\s*(V)/i,
      /(?:Full\s*Power\s*MPPT\s*Range)\s*[:：\t\-]?\s*[0-9]+\s*[-~–～]\s*([0-9]+)\s*(V)/i
    ], 'V', 'V', val => parseFloat(val));

    searchParam('startup_voltage', 'Startup Voltage', [
      /(?:Startup\s*Voltage|Start\s*Voltage|Start-up\s*Voltage|起動電圧|Điện\s*áp\s*khởi\s*động|启动电压|Startspannung)\s*[:：\t\-]?\s*([0-9,]+)\s*(V)/i
    ], 'V', 'V', val => parseFloat(val.replace(/,/g, '')));

    searchParam('nominal_dc_voltage', 'Nominal DC Input Voltage', [
      /(?:Nominal\s*(?:DC)?\s*Input\s*Voltage|Rated\s*Input\s*Voltage|定格入力電圧|Điện\s*áp\s*(?:DC\s*)?định\s*mức|额定输入电压|Nenneingangsspannung)\s*[:：\t\-]?\s*([0-9,]+)\s*(V)/i
    ], 'V', 'V', val => parseFloat(val.replace(/,/g, '')));

    searchParam('mppt_tracker_count', 'Number of MPPTs', [
      /(?:Number\s*of\s*(?:MPPTs?|Trackers?)|MPPT\s*Trackers?|MPPT回路数|MPPT数|Số\s*(?:lượng\s*)?MPPT|MPPT路数|Anzahl\s*der\s*MPPT)\s*[:：\t\-]?\s*([0-9]+)/i,
      /(?:No\.?\s*of\s*MPPTs?)\s*[:：\t\-]?\s*([0-9]+)/i
    ], '', 'trackers', val => parseInt(val, 10));

    searchParam('max_input_strings', 'Max Number of Inputs', [
      /(?:Max\.?\s*Number\s*of\s*Inputs|Max\s*Input\s*Circuits|Number\s*of\s*Input\s*Strings|最大入力回路数|最大ストリング数|Số\s*chuỗi\s*đầu\s*vào\s*tối\s*đa|最大输入路数)\s*[:：\t\-]?\s*([0-9]+)/i
    ], '', 'inputs', val => parseInt(val, 10));

    searchParam('max_input_current_per_mppt', 'Max Input Current per MPPT', [
      /(?:Max\.?\s*Input\s*Current\s*(?:per\s*MPPT)?|Max\.?\s*DC\s*Current\s*per\s*MPPT|最大入力電流(?:[（(](?:各MPPT|MPPT回路毎|各回路)[)）])?|Dòng\s*đầu\s*vào\s*cực\s*đại(?:\s*mỗi\s*MPPT)?|每路MPPT最大输入电流)\s*[:：\t\-]?\s*([0-9.]+)\s*(A)/i,
      /(?:Max\.?\s*Current\s*per\s*MPPT)\s*[:：\t\-]?\s*([0-9.]+)\s*(A)/i
    ], 'A', 'A', val => parseFloat(val));

    searchParam('max_short_circuit_current_per_mppt', 'Max Short-Circuit Current per MPPT', [
      /(?:Max\.?\s*Short-Circuit\s*Current\s*(?:per\s*MPPT)?|最大短絡電流(?:[（(](?:各MPPT|MPPT回路毎|各回路)[)）])?|Dòng\s*ngắn\s*mạch\s*cực\s*đại|每路MPPT最大短路电流)\s*[:：\t\-]?\s*([0-9.]+)\s*(A)/i
    ], 'A', 'A', val => parseFloat(val));

    searchParam('rated_ac_power', 'Rated AC Active Power', [
      /(?:Rated\s*(?:AC)?\s*(?:Active)?\s*Power|Nominal\s*AC\s*Power|Rated\s*Output\s*Power|定格出力|定格交流出力|Công\s*suất\s*(?:AC\s*)?định\s*mức|额定(?:交流)?输出功率|Nennleistung)\s*[:：\t\-]?\s*([0-9,.]+)\s*(W|kW|MW)/i,
      /(?:Nominal\s*Power\s*\(Pn\))\s*[:：\t\-]?\s*([0-9,.]+)\s*(W|kW|MW)/i
    ], 'kW', 'kW', (val, unit) => {
      const num = parseFloat(val.replace(/,/g, ''));
      if (unit && /^W$/i.test(unit)) {
        return Math.round((num / 1000) * 100) / 100;
      }
      if (unit && /^MW$/i.test(unit)) {
        return num * 1000;
      }
      if (num >= 1000 && !/k/i.test(unit || '')) {
        return Math.round((num / 1000) * 100) / 100;
      }
      return num;
    });

    searchParam('max_ac_apparent_power', 'Max AC Apparent Power', [
      /(?:Max\.?\s*(?:AC)?\s*Apparent\s*Power|Maximum\s*Apparent\s*Power|最大皮相電力|Công\s*suất\s*biểu\s*kiến\s*cực\s*đại|最大视在功率)\s*[:：\t\-]?\s*([0-9,.]+)\s*(VA|kVA|MVA)/i
    ], 'kVA', 'kVA', (val, unit) => {
      const num = parseFloat(val.replace(/,/g, ''));
      if (unit && /^VA$/i.test(unit)) {
        return Math.round((num / 1000) * 100) / 100;
      }
      if (unit && /^MVA$/i.test(unit)) {
        return num * 1000;
      }
      if (num >= 1000 && !/k/i.test(unit || '')) {
        return Math.round((num / 1000) * 100) / 100;
      }
      return num;
    });

    searchParam('nominal_ac_voltage', 'Nominal AC Voltage', [
      /(?:Nominal\s*(?:AC)?\s*Grid\s*Voltage|Rated\s*AC\s*Voltage|Nominal\s*AC\s*Voltage|定格出力電圧|定格交流電圧|Điện\s*áp\s*AC\s*định\s*mức|额定交流输出电压)\s*[:：\t\-]?\s*([0-9/]+)\s*(V|Vac)/i,
      /(?:Rated\s*Operational\s*Voltage\s*\(?Ue\)?)\s*[:：\t\-]?\s*([0-9]+)\s*(V|Vac)/i
    ], 'Vac', 'Vac', val => parseFloat(val));

    searchParam('rated_frequency', 'Rated Frequency', [
      /(?:Rated\s*(?:Grid)?\s*Frequency|Grid\s*Frequency|定格出力周波数|定格周波数|Tần\s*số\s*định\s*mức|额定输出频率)\s*[:：\t\-]?\s*([0-9/\s]+)\s*(Hz)/i
    ], 'Hz', 'Hz', val => val.trim());

    searchParam('nominal_ac_current', 'Rated AC Output Current', [
      /(?:Rated\s*(?:AC)?\s*Output\s*Current|Nominal\s*AC\s*Current|定格出力電流|定格交流電流|Dòng\s*(?:điện\s*)?AC\s*định\s*mức|额定交流输出电流)\s*[:：\t\-]?\s*([0-9,.]+)\s*(A)/i
    ], 'A', 'A', val => parseFloat(val.replace(/,/g, '')));

    searchParam('power_factor', 'Power Factor (Cos phi)', [
      /(?:Rated\s*Power\s*Factor|Power\s*Factor|定格力率|力率設定範囲|Hệ\s*số\s*công\s*suất|功率因数)\s*[:：\t\-]?\s*([0-9.]+)\s*(?:以上)?/i
    ], '', '', val => parseFloat(val));

    searchParam('thdi', 'Total Harmonic Distortion (THDi)', [
      /(?:THDi|THD|Harmonic\s*Distortion|出力電流歪み率|全高調波歪率|Tổng\s*méo\s*hài|总谐波失真)\s*[:：\t\-]?\s*([<>]?\s*[0-9.]+)\s*(%)/i
    ], '%', '%', val => parseFloat(val.replace(/[<>~]/g, '')));

    searchParam('ip_rating', 'Ingress Protection', [
      /(?:Protection\s*(?:Degree|Rating|Class)|IP\s*Rating|Ingress\s*Protection|防水防塵保護等級(?:（JIS）)?|保護等級|Cấp\s*bảo\s*vệ|防护等级)\s*[:：\t\-]?\s*(IP\s*[0-9]{2})/i,
      /\b(IP65|IP66|IP67|IP68|IP54|IP55|IP20)\b/i
    ], '', '', val => val.replace(/\s+/g, '').toUpperCase());

    searchParam('weight', 'Weight', [
      /(?:Weight|Net\s*Weight|質量|重量|Khối\s*lượng|Trọng\s*lượng|Gewicht)\s*[:：\t\-]?\s*([0-9.]+)\s*(kg|lbs)/i
    ], 'kg', 'kg', val => parseFloat(val));

    searchParam('dimensions', 'Dimensions (W x H x D)', [
      /(?:Dimensions\s*\(W\s*[x×]\s*H\s*[x×]\s*D\)|Dimensions|寸法（幅×高さ×奥行）|寸法|Kích\s*thước|尺寸)\s*[:：\t\-]?\s*([0-9,\s]+[x×*]\s*[0-9,\s]+[x×*]\s*[0-9,\s]+)\s*(mm|cm|m)?/i
    ], 'mm', 'mm', val => val.trim().replace(/\s+/g, ' '));

    searchParam('cooling_method', 'Cooling Method', [
      /(?:Cooling\s*(?:Method|Type)|冷却方式|Phương\s*pháp\s*làm\s*mát|冷却方式)\s*[:：\t\-]?\s*([^\n\r\t]{2,30})/i
    ], '', '', val => val.trim());

    searchParam('operating_temperature_range', 'Operating Temperature Range', [
      /(?:Operating\s*Temperature\s*Range|Ambient\s*Temperature|使用環境温度|動作温度範囲|Dải\s*nhiệt\s*độ\s*hoạt\s*động|工作温度范围)\s*[:：\t\-]?\s*([-+0-9\s°C~～–-]+)/i
    ], '°C', '°C', val => val.trim());

    searchParam('night_power_consumption', 'Nighttime Standby Power', [
      /(?:Nighttime\s*Power\s*Consumption|Night\s*Power|夜間待機電力|待機電力|Công\s*suất\s*tiêu\s*thụ\s*ban\s*đêm|夜间自耗电)\s*[:：\t\-]?\s*([<>]?\s*[0-9.]+)\s*(W)/i
    ], 'W', 'W', val => parseFloat(val.replace(/[<>~]/g, '')));

    searchParam('ac_phases', 'AC Grid Phases', [
      /(?:相数|Phases?|Grid\s*Connection|Số\s*pha)\s*[:：\t\-]?\s*([^\n\r\t]{2,25})/i
    ], '', '', val => val.trim());

    // --- PV Module Specific Parameters ---
    if (category === 'PV_MODULE' || text.toLowerCase().includes('pmax') || text.toLowerCase().includes('voc')) {
      searchParam('rated_power_pmax', 'Rated Power Pmax (STC)', [
        /(?:Peak\s*Power|Maximum\s*Power|Rated\s*Power|Pmax)\s*\(?STC\)?\s*[:：\-]?\s*([0-9.]+)\s*(W|Wp)/i,
        /Pmax\s*[:：\-]?\s*([0-9.]+)\s*(W|Wp)/i
      ], 'W', 'W', val => parseFloat(val));

      searchParam('open_circuit_voltage_voc', 'Open Circuit Voltage Voc', [
        /(?:Open\s*Circuit\s*Voltage|Voc)\s*\(?STC\)?\s*[:：\-]?\s*([0-9.]+)\s*(V)/i,
        /Voc\s*[:：\-]?\s*([0-9.]+)\s*(V)/i
      ], 'V', 'V', val => parseFloat(val));

      searchParam('short_circuit_current_isc', 'Short Circuit Current Isc', [
        /(?:Short\s*Circuit\s*Current|Isc)\s*\(?STC\)?\s*[:：\-]?\s*([0-9.]+)\s*(A)/i,
        /Isc\s*[:：\-]?\s*([0-9.]+)\s*(A)/i
      ], 'A', 'A', val => parseFloat(val));

      searchParam('max_power_voltage_vmp', 'Max Power Voltage Vmp', [
        /(?:Voltage\s*at\s*Pmax|Max\s*Power\s*Voltage|Vmp|Vmpp)\s*\(?STC\)?\s*[:：\-]?\s*([0-9.]+)\s*(V)/i,
        /Vmp\s*[:：\-]?\s*([0-9.]+)\s*(V)/i
      ], 'V', 'V', val => parseFloat(val));

      searchParam('max_power_current_imp', 'Max Power Current Imp', [
        /(?:Current\s*at\s*Pmax|Max\s*Power\s*Current|Imp|Impp)\s*\(?STC\)?\s*[:：\-]?\s*([0-9.]+)\s*(A)/i,
        /Imp\s*[:：\-]?\s*([0-9.]+)\s*(A)/i
      ], 'A', 'A', val => parseFloat(val));

      searchParam('module_efficiency', 'Module Efficiency', [
        /(?:Module\s*Efficiency|Efficiency\s*\(?STC\)?)\s*[:：\-]?\s*([0-9.]+)\s*(%)/i
      ], '%', '%', val => parseFloat(val));

      searchParam('temp_coefficient_voc', 'Temperature Coefficient of Voc', [
        /(?:Temp(?:erature)?\s*Coeff(?:icient)?\s*of\s*Voc|β_Voc|βVoc)\s*[:：\-]?\s*([-+]?[0-9.]+)\s*(%\/°C|%\/K)/i
      ], '%/°C', '%/°C', val => parseFloat(val));

      searchParam('temp_coefficient_pmax', 'Temperature Coefficient of Pmax', [
        /(?:Temp(?:erature)?\s*Coeff(?:icient)?\s*of\s*Pmax|γ_Pmp|γPmax)\s*[:：\-]?\s*([-+]?[0-9.]+)\s*(%\/°C|%\/K)/i
      ], '%/°C', '%/°C', val => parseFloat(val));

      searchParam('temp_coefficient_isc', 'Temperature Coefficient of Isc', [
        /(?:Temp(?:erature)?\s*Coeff(?:icient)?\s*of\s*Isc|α_Isc|αIsc)\s*[:：\-]?\s*([-+]?[0-9.]+)\s*(%\/°C|%\/K)/i
      ], '%/°C', '%/°C', val => parseFloat(val));

      searchParam('max_series_fuse_rating', 'Max Series Fuse Rating', [
        /(?:Max(?:imum)?\s*Series\s*Fuse\s*Rating)\s*[:：\-]?\s*([0-9]+)\s*(A)/i
      ], 'A', 'A', val => parseFloat(val));
    }

    // --- BESS & Battery Specific Parameters ---
    if (category === 'BESS' || category === 'BATTERY' || text.toLowerCase().includes('kwh') || text.toLowerCase().includes('cell chemistry')) {
      searchParam('nominal_energy_capacity', 'Nominal Energy Capacity', [
        /(?:Nominal\s*(?:Energy)?\s*Capacity|Rated\s*Capacity|Energy\s*Capacity)\s*[:：\-]?\s*([0-9,.]+)\s*(kWh|MWh|Ah)/i
      ], 'kWh', 'kWh', val => parseFloat(val.replace(/,/g, '')));

      searchParam('dc_voltage_range_min', 'DC Voltage Range (Min)', [
        /(?:DC\s*Voltage\s*Range|Operating\s*Voltage\s*Range)\s*[:：\-]?\s*([0-9]+)\s*[-~–]\s*[0-9]+\s*(V)/i
      ], 'V', 'V', val => parseFloat(val));

      searchParam('dc_voltage_range_max', 'DC Voltage Range (Max)', [
        /(?:DC\s*Voltage\s*Range|Operating\s*Voltage\s*Range)\s*[:：\-]?\s*[0-9]+\s*[-~–]\s*([0-9]+)\s*(V)/i
      ], 'V', 'V', val => parseFloat(val));

      searchParam('cycle_life', 'Cycle Life', [
        /(?:Cycle\s*Life|Cycles)\s*[:：\-]?\s*([0-9,]+)\s*(cycles)?/i
      ], 'cycles', 'cycles', val => parseInt(val.replace(/,/g, ''), 10));

      searchParam('cooling_system', 'Cooling System', [
        /(?:Cooling\s*(?:System|Type|Method)|Thermal\s*Management)\s*[:：\-]?\s*([A-Za-z\s]+cooling)/i
      ], '', '', val => val.trim());
    }

    // --- Breaker Specific Parameters (ACB / MCCB / VCB) ---
    if (category === 'ACB' || category === 'MCCB' || category === 'VCB') {
      searchParam('rated_current_in', 'Rated Current (In)', [
        /(?:Rated\s*Current\s*\(?In\)?|Nominal\s*Current)\s*[:：\-]?\s*([0-9]+)\s*(A)/i
      ], 'A', 'A', val => parseFloat(val));

      searchParam('breaking_capacity_icu_ka', 'Breaking Capacity (Icu)', [
        /(?:Ultimate\s*Breaking\s*Capacity|Breaking\s*Capacity\s*\(?Icu\)?)\s*[:：\-]?\s*([0-9.]+)\s*(kA)/i
      ], 'kA', 'kA', val => parseFloat(val));

      searchParam('rated_short_time_current_icw', 'Short-time Withstand Current (Icw)', [
        /(?:Short-time\s*Withstand\s*Current|Icw)\s*\(?1s\)?\s*[:：\-]?\s*([0-9.]+)\s*(kA)/i
      ], 'kA', 'kA', val => parseFloat(val));

      searchParam('poles_count', 'Poles Count', [
        /(?:Number\s*of\s*Poles|Poles?)\s*[:：\-]?\s*([0-9])P?/i
      ], 'poles', 'poles', val => parseInt(val, 10));
    }

    // --- Transformer Specific Parameters ---
    if (category === 'TRANSFORMER') {
      searchParam('rated_power_kva', 'Rated Power', [
        /(?:Rated\s*Power|Nominal\s*Power)\s*[:：\-]?\s*([0-9,]+)\s*(kVA|MVA)/i
      ], 'kVA', 'kVA', val => parseFloat(val.replace(/,/g, '')));

      searchParam('impedance_uk_percent', 'Short-circuit Impedance (Uk)', [
        /(?:Short-circuit\s*Impedance|Impedance\s*\(?Uk\)?)\s*[:：\-]?\s*([0-9.]+)\s*(%)/i
      ], '%', '%', val => parseFloat(val));
    }

    // --- Generic Tabular & Key-Value Row Parser ---
    // Parses any structured tabular lines: "Label \t Value [Unit]" or "Label : Value"
    const CANONICAL_LABEL_MAP: Record<string, { key: string; displayName: string }> = {
      // Japanese
      '最大入力電圧': { key: 'max_dc_voltage', displayName: 'Max DC Input Voltage' },
      '最高入力電圧': { key: 'max_dc_voltage', displayName: 'Max DC Input Voltage' },
      '起動電圧': { key: 'startup_voltage', displayName: 'Startup Voltage' },
      '定格入力電圧': { key: 'nominal_dc_voltage', displayName: 'Nominal DC Input Voltage' },
      'mppt回路数': { key: 'mppt_tracker_count', displayName: 'Number of MPPTs' },
      'mppt数': { key: 'mppt_tracker_count', displayName: 'Number of MPPTs' },
      '最大入力回路数': { key: 'max_input_strings', displayName: 'Max Number of Inputs' },
      '最大ストリング数': { key: 'max_input_strings', displayName: 'Max Number of Inputs' },
      '最大入力電流': { key: 'max_input_current_per_mppt', displayName: 'Max Input Current per MPPT' },
      '最大入力電流（各mppt）': { key: 'max_input_current_per_mppt', displayName: 'Max Input Current per MPPT' },
      '最大入力電流（mppt回路毎）': { key: 'max_input_current_per_mppt', displayName: 'Max Input Current per MPPT' },
      '最大短絡電流': { key: 'max_short_circuit_current_per_mppt', displayName: 'Max Short-Circuit Current per MPPT' },
      '最大短絡電流（各mppt）': { key: 'max_short_circuit_current_per_mppt', displayName: 'Max Short-Circuit Current per MPPT' },
      '最大短絡電流（mppt回路毎）': { key: 'max_short_circuit_current_per_mppt', displayName: 'Max Short-Circuit Current per MPPT' },
      '定格出力': { key: 'rated_ac_power', displayName: 'Rated AC Active Power' },
      '定格交流出力': { key: 'rated_ac_power', displayName: 'Rated AC Active Power' },
      '最大皮相電力': { key: 'max_ac_apparent_power', displayName: 'Max AC Apparent Power' },
      '定格出力電圧': { key: 'nominal_ac_voltage', displayName: 'Nominal AC Voltage' },
      '定格交流電圧': { key: 'nominal_ac_voltage', displayName: 'Nominal AC Voltage' },
      '定格出力周波数': { key: 'rated_frequency', displayName: 'Rated Frequency' },
      '定格周波数': { key: 'rated_frequency', displayName: 'Rated Frequency' },
      '定格出力電流': { key: 'nominal_ac_current', displayName: 'Rated AC Output Current' },
      '定格交流電流': { key: 'nominal_ac_current', displayName: 'Rated AC Output Current' },
      '定格力率': { key: 'power_factor', displayName: 'Power Factor' },
      '力率設定範囲': { key: 'power_factor', displayName: 'Power Factor Range' },
      '最大変換効率': { key: 'max_efficiency', displayName: 'Max Efficiency' },
      '最大効率': { key: 'max_efficiency', displayName: 'Max Efficiency' },
      'jis効率': { key: 'european_efficiency', displayName: 'European / Regional Efficiency' },
      '欧州効率': { key: 'european_efficiency', displayName: 'European / Regional Efficiency' },
      '使用環境温度': { key: 'operating_temperature_range', displayName: 'Operating Temperature Range' },
      '動作温度範囲': { key: 'operating_temperature_range', displayName: 'Operating Temperature Range' },
      '寸法（幅×高さ×奥行）': { key: 'dimensions', displayName: 'Dimensions (W x H x D)' },
      '寸法': { key: 'dimensions', displayName: 'Dimensions (W x H x D)' },
      '質量': { key: 'weight', displayName: 'Weight' },
      '重量': { key: 'weight', displayName: 'Weight' },
      '冷却方式': { key: 'cooling_method', displayName: 'Cooling Method' },
      '防水防塵保護等級（jis）': { key: 'ip_rating', displayName: 'Ingress Protection' },
      '防水防塵保護等級': { key: 'ip_rating', displayName: 'Ingress Protection' },
      '保護等級': { key: 'ip_rating', displayName: 'Ingress Protection' },
      '夜間待機電力': { key: 'night_power_consumption', displayName: 'Nighttime Standby Power' },
      '相数': { key: 'ac_phases', displayName: 'AC Grid Phases' },
      '配電方式/配線方式': { key: 'ac_phases', displayName: 'AC Grid Phases / Wiring' },
      '配電方式': { key: 'ac_phases', displayName: 'AC Grid Phases / Wiring' },
      'mppt電圧範囲': { key: 'mppt_voltage_range', displayName: 'MPPT Operating Voltage Range' },
      '出力電流歪み率': { key: 'thdi', displayName: 'Total Harmonic Distortion (THDi)' },
      'afci保護': { key: 'afci_protection', displayName: 'Arc Fault Circuit Interrupter (AFCI)' },
      '連系保護': { key: 'grid_protection', displayName: 'Grid Monitoring / Protection' },
      '直流逆接続入力防止': { key: 'dc_reverse_polarity_protection', displayName: 'DC Reverse Polarity Protection' },
      '直流サージ保護': { key: 'dc_surge_protection', displayName: 'DC Surge Protection' },
      '交流サージ保護': { key: 'ac_surge_protection', displayName: 'AC Surge Protection' },
      '直流側絶縁抵抗検出': { key: 'dc_insulation_resistance_detection', displayName: 'DC Insulation Resistance Detection' },
      '交流側漏洩電流検出': { key: 'ac_leakage_current_detection', displayName: 'Residual Current Monitoring' },
      '単独運転検出能動方式': { key: 'anti_islanding_active', displayName: 'Active Anti-Islanding Protection' },
      '単独運転検出受動方式': { key: 'anti_islanding_passive', displayName: 'Passive Anti-Islanding Protection' },
      '設置標高（海抜）': { key: 'max_altitude', displayName: 'Max Operating Altitude' },
      '設置湿度（結露なし）': { key: 'relative_humidity_range', displayName: 'Relative Humidity Range' },

      // Vietnamese
      'điện áp dc cực đại': { key: 'max_dc_voltage', displayName: 'Max DC Input Voltage' },
      'điện áp đầu vào cực đại': { key: 'max_dc_voltage', displayName: 'Max DC Input Voltage' },
      'điện áp khởi động': { key: 'startup_voltage', displayName: 'Startup Voltage' },
      'điện áp dc định mức': { key: 'nominal_dc_voltage', displayName: 'Nominal DC Input Voltage' },
      'số mppt': { key: 'mppt_tracker_count', displayName: 'Number of MPPTs' },
      'số lượng mppt': { key: 'mppt_tracker_count', displayName: 'Number of MPPTs' },
      'số chuỗi đầu vào': { key: 'max_input_strings', displayName: 'Max Number of Inputs' },
      'số chuỗi đầu vào tối đa': { key: 'max_input_strings', displayName: 'Max Number of Inputs' },
      'dòng điện vào cực đại': { key: 'max_input_current_per_mppt', displayName: 'Max Input Current per MPPT' },
      'dòng ngắn mạch cực đại': { key: 'max_short_circuit_current_per_mppt', displayName: 'Max Short-Circuit Current per MPPT' },
      'công suất ac định mức': { key: 'rated_ac_power', displayName: 'Rated AC Active Power' },
      'công suất định mức': { key: 'rated_ac_power', displayName: 'Rated AC Active Power' },
      'công suất biểu kiến cực đại': { key: 'max_ac_apparent_power', displayName: 'Max AC Apparent Power' },
      'điện áp ac định mức': { key: 'nominal_ac_voltage', displayName: 'Nominal AC Voltage' },
      'tần số định mức': { key: 'rated_frequency', displayName: 'Rated Frequency' },
      'dòng ac định mức': { key: 'nominal_ac_current', displayName: 'Rated AC Output Current' },
      'hệ số công suất': { key: 'power_factor', displayName: 'Power Factor' },
      'hiệu suất cực đại': { key: 'max_efficiency', displayName: 'Max Efficiency' },
      'hiệu suất euro': { key: 'european_efficiency', displayName: 'European Efficiency' },
      'nhiệt độ làm việc': { key: 'operating_temperature_range', displayName: 'Operating Temperature Range' },
      'kích thước': { key: 'dimensions', displayName: 'Dimensions (W x H x D)' },
      'trọng lượng': { key: 'weight', displayName: 'Weight' },
      'khối lượng': { key: 'weight', displayName: 'Weight' },
      'phương pháp làm mát': { key: 'cooling_method', displayName: 'Cooling Method' },
      'cấp bảo vệ': { key: 'ip_rating', displayName: 'Ingress Protection' },
      'tiêu chuẩn bảo vệ': { key: 'ip_rating', displayName: 'Ingress Protection' },
      'công suất tiêu thụ ban đêm': { key: 'night_power_consumption', displayName: 'Nighttime Standby Power' },
      'số pha': { key: 'ac_phases', displayName: 'AC Grid Phases' },
      'dải điện áp mppt': { key: 'mppt_voltage_range', displayName: 'MPPT Operating Voltage Range' },
      'độ méo sóng hài': { key: 'thdi', displayName: 'Total Harmonic Distortion (THDi)' }
    };

    const lines = text.split(/[\r\n]+/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.length < 4 || line.length > 250) continue;

      // Skip obvious section headers or decorative lines
      if (/^(?:技術仕様|仕様|仕様書|入力\s*（DC）|出力\s*（AC）|保護|一般仕様|表示・インターフェイス|その他|Technical\s*Specifications?|DC\s*Input|AC\s*Output|General\s*Data|Features|Safety)\s*$/i.test(line)) {
        continue;
      }
      if (/^[-=_*]{3,}$/.test(line)) continue;

      // Match delimiter: tab \t, 2+ spaces, or colon : or ：
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim()).filter(Boolean);
      } else if (/[:：]/.test(line)) {
        const colonIdx = line.search(/[:：]/);
        parts = [line.substring(0, colonIdx).trim(), line.substring(colonIdx + 1).trim()];
      } else if (/\s{2,}/.test(line)) {
        parts = line.split(/\s{2,}/).map(p => p.trim()).filter(Boolean);
      } else {
        // Try finding a matching canonical label prefix or single space delimiter
        for (const canonicalKey of Object.keys(CANONICAL_LABEL_MAP)) {
          if (line.toLowerCase().startsWith(canonicalKey)) {
            const rest = line.substring(canonicalKey.length).trim().replace(/^[:：\-]/, '').trim();
            if (rest.length > 0) {
              parts = [line.substring(0, canonicalKey.length), rest];
              break;
            }
          }
        }
        if (parts.length < 2) {
          const spaceIdx = line.indexOf(' ');
          if (spaceIdx > 1) {
            const candidateLabel = line.substring(0, spaceIdx).trim();
            const candidateVal = line.substring(spaceIdx + 1).trim();
            if (candidateLabel.length <= 40 && candidateVal.length > 0) {
              parts = [candidateLabel, candidateVal];
            }
          }
        }
      }

      if (parts.length >= 2) {
        const label = parts[0];
        const valStr = parts.slice(1).join(' ').trim();

        // Validate label and valStr
        if (label.length >= 2 && label.length <= 50 && valStr.length >= 1 && valStr.length <= 150) {
          const lowerLabel = label.toLowerCase().trim();
          const canonicalMapping = CANONICAL_LABEL_MAP[lowerLabel] || CANONICAL_LABEL_MAP[lowerLabel.replace(/\s+/g, '')];

          let paramKey = '';
          let displayLabel = label;

          if (canonicalMapping) {
            paramKey = canonicalMapping.key;
            displayLabel = canonicalMapping.displayName;
          } else {
            paramKey = label
              .toLowerCase()
              .replace(/[()（）[\]/]/g, ' ')
              .trim()
              .replace(/[^a-z0-9\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\u00C0-\u1EF9]/g, '_')
              .replace(/_+/g, '_')
              .substring(0, 40);
          }

          const alreadyCaptured = specs.some(s => 
            s.parameterName === paramKey ||
            s.displayName.toLowerCase() === displayLabel.toLowerCase() ||
            s.displayName.toLowerCase() === label.toLowerCase()
          );

          if (!alreadyCaptured && paramKey.length >= 2) {
            // Determine unit and normalized value
            let unit = '';
            let normVal: number | string = valStr;

            const unitMatch = valStr.match(/\b(V|Vac|Vdc|kV|A|mA|kA|W|kW|MW|VA|kVA|MVA|Wh|kWh|MWh|Hz|%|kg|g|lbs|mm|cm|m|°C|℃|K|bar|IP\d{2})\b/i);
            if (unitMatch) {
              unit = unitMatch[1];
            }

            const numMatch = valStr.match(/^([<>]?\s*[-+]?[0-9,.]+)\s*(?:[A-Za-z%°℃/]+)?$/);
            if (numMatch) {
              const cleaned = numMatch[1].replace(/[<>,]/g, '').trim();
              const parsedNum = parseFloat(cleaned);
              if (!isNaN(parsedNum)) {
                normVal = parsedNum;
              }
            }

            specs.push({
              parameterName: paramKey,
              displayName: displayLabel,
              rawValue: valStr,
              rawUnit: unit,
              normalizedValue: normVal,
              normalizedUnit: unit,
              sourceDocument: filename,
              sourcePage: pageNum,
              confidence: 0.90,
              extractionMethod: page.hasTables ? 'NATIVE_TABLE' : 'NATIVE_REGEX',
              reviewStatus: 'PENDING'
            });

            snippets.push({
              pageNumber: pageNum,
              snippetText: line,
              parameterName: paramKey
            });
          }
        }
      }
    }

    return { specs, snippets };
  }
}

export const nativeSpecificationParser = new NativeSpecificationParser();
