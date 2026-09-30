/**
 * SOLNEXA Gemini AI Provider
 * Integrates @google/genai TypeScript SDK using gemini-3.8-flash.
 * Strictly follows server-side standards, lazy initialization, and telemetry headers.
 */

import { GoogleGenAI } from '@google/genai';
import { EquipmentCategoryCode } from '../../../src/types';
import { AIProvider, AIIdentityResult, AIExtractedSpec } from './aiProviderInterface';

export class GeminiAIProvider implements AIProvider {
  public readonly name = 'Gemini';
  public readonly supportedModels = ['gemini-3.8-flash'];
  private selectedModel = 'gemini-3.8-flash';
  private aiClient: GoogleGenAI | null = null;

  public setModel(model: string) {
    if (this.supportedModels.includes(model)) {
      this.selectedModel = model;
    }
  }

  public getModel(): string {
    return this.selectedModel;
  }

  public isConfigured(): boolean {
    return Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  }

  private getClient(): GoogleGenAI {
    if (!this.aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured in server environment');
      }
      this.aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
    }
    return this.aiClient;
  }

  private async generateWithRetry(prompt: string): Promise<string> {
    const client = this.getClient();
    const modelsToTry = [this.selectedModel, 'gemini-3.8-flash'];
    let lastError: any = null;

    for (const model of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await client.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: 'application/json'
            }
          });
          if (response.text) {
            return response.text.trim();
          }
        } catch (err: any) {
          lastError = err;
          console.warn(`[Gemini Provider] Model ${model} attempt ${attempt} failed:`, err.message || err.status);
          const status = err.status || err.code;
          if (status === 503 || status === 429 || err.message?.includes('demand') || err.message?.includes('UNAVAILABLE')) {
            await new Promise(res => setTimeout(res, 800 * attempt));
            continue;
          }
          break;
        }
      }
    }
    throw lastError || new Error('Gemini models unavailable');
  }

  public async classifyEquipment(text: string): Promise<EquipmentCategoryCode> {
    if (!this.isConfigured()) {
      return 'OTHER';
    }

    try {
      const prompt = `You are a solar PV and electrical engineering expert. Classify the following datasheet text into exactly ONE of these categories:
PV_MODULE, PCS_INVERTER, BESS, BATTERY, TRANSFORMER, QB_CUBICLE, MCCB, ACB, VCB, FUSE, CABLE, COMBINER_BOX, DISTRIBUTION_BOARD, OTHER.

Return ONLY JSON format:
{ "category": "CATEGORY_CODE" }

Text snippet:
${text.substring(0, 2000)}`;

      const responseText = await this.generateWithRetry(prompt);
      const parsed = JSON.parse(responseText || '{}');
      if (parsed.category) {
        return parsed.category as EquipmentCategoryCode;
      }
    } catch (err) {
      console.warn('Gemini classifyEquipment fallback:', err);
    }
    return 'OTHER';
  }

  public async extractEquipmentIdentity(documentText: string, filename: string): Promise<AIIdentityResult> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API key is not configured.');
    }

    const prompt = `You are an electrical engineering datasheet parser for SOLNEXA. Analyze this document text and filename to identify the manufacturer, exact model number, series name, equipment category, and short technical description.

RULES:
1. Never invent or hallucinate data. If unknown, state "Unknown".
2. Category must be one of: PV_MODULE, PCS_INVERTER, BESS, BATTERY, TRANSFORMER, QB_CUBICLE, MCCB, ACB, VCB, FUSE, CABLE, COMBINER_BOX, DISTRIBUTION_BOARD, OTHER.
3. Model should be the specific part number or model series (e.g. SUN2000-50KTL-NHM3, SG49.5CX, TSM-440NEG9R.28, EnerOne).

Filename: ${filename}
Document text excerpt:
${documentText.substring(0, 3500)}

Return JSON adhering strictly to:
{
  "manufacturer": "string",
  "model": "string",
  "category": "string",
  "series": "string",
  "description": "string",
  "confidence": 0.95
}`;

    try {
      const responseText = await this.generateWithRetry(prompt);
      const parsed = JSON.parse(responseText || '{}');
      return {
        manufacturer: parsed.manufacturer || 'Unknown',
        model: parsed.model || filename.replace(/\.pdf$/i, ''),
        category: (parsed.category as EquipmentCategoryCode) || 'OTHER',
        series: parsed.series || '',
        description: parsed.description || '',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9
      };
    } catch (err) {
      console.error('Error parsing Gemini identity output:', err);
      throw err;
    }
  }

  public async extractSpecifications(
    pageText: string,
    pageNumber: number,
    category: EquipmentCategoryCode,
    modelContext?: string
  ): Promise<AIExtractedSpec[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const prompt = `You are an expert electrical systems data extractor. Extract all technical engineering specifications from this datasheet page.
Target Equipment Category: ${category}
${modelContext ? `Model context: ${modelContext}` : ''}

CRITICAL RULES:
1. NEVER INVENT OR ESTIMATE NUMBERS. If a parameter is not explicitly on this page, do NOT return it.
2. Extract the exact raw string and raw unit found on the page.
3. Normalize the value into a clean standard number or string with normalized SI unit (e.g., V, kW, A, %, kVA, kWh, cycles, kg, mm²).
4. Provide a confidence between 0.70 and 0.99 for each field based on clarity.
5. Identify the standard engineering parameter name using snake_case (e.g. max_dc_voltage, rated_ac_power, max_efficiency, mppt_voltage_range_min, mppt_voltage_range_max, open_circuit_voltage_voc, short_circuit_current_isc, nominal_energy_capacity).

Page Number: ${pageNumber}
Page Text:
${pageText}

Return a JSON array of objects with this schema:
[
  {
    "parameterName": "max_dc_voltage",
    "displayName": "Max DC Input Voltage",
    "rawValue": "1100",
    "rawUnit": "V",
    "normalizedValue": 1100,
    "normalizedUnit": "V",
    "confidence": 0.98,
    "notes": "Table 1 DC Input"
  }
]`;

    try {
      const responseText = await this.generateWithRetry(prompt);
      const parsed = JSON.parse(responseText || '[]');
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          parameterName: item.parameterName || 'custom_param',
          displayName: item.displayName || item.parameterName,
          rawValue: String(item.rawValue || ''),
          rawUnit: String(item.rawUnit || ''),
          normalizedValue: item.normalizedValue ?? item.rawValue,
          normalizedUnit: String(item.normalizedUnit || item.rawUnit || ''),
          sourcePage: pageNumber,
          confidence: typeof item.confidence === 'number' ? item.confidence : 0.92,
          notes: item.notes
        }));
      }
      return [];
    } catch (err) {
      console.error('Error in Gemini spec extraction:', err);
      return [];
    }
  }

  public async analyzePageImage(
    imageBase64: string,
    mimeType: string,
    pageNumber: number,
    category: EquipmentCategoryCode
  ): Promise<AIExtractedSpec[]> {
    if (!this.isConfigured()) {
      return [];
    }

    const client = this.getClient();
    const imagePart = {
      inlineData: {
        mimeType: mimeType || 'image/png',
        data: imageBase64
      }
    };
    const textPart = {
      text: `Extract technical electrical specifications table from this rendered datasheet page image for category ${category}.
Return JSON array of:
[
  {
    "parameterName": "snake_case_name",
    "displayName": "Display Name",
    "rawValue": "1100",
    "rawUnit": "V",
    "normalizedValue": 1100,
    "normalizedUnit": "V",
    "confidence": 0.95
  }
]
Do not fabricate missing values.`
    };

    const response = await client.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: 'application/json'
      }
    });

    try {
      const parsed = JSON.parse(response.text?.trim() || '[]');
      if (Array.isArray(parsed)) {
        return parsed.map(item => ({
          parameterName: item.parameterName,
          displayName: item.displayName,
          rawValue: String(item.rawValue),
          rawUnit: String(item.rawUnit || ''),
          normalizedValue: item.normalizedValue ?? item.rawValue,
          normalizedUnit: String(item.normalizedUnit || ''),
          sourcePage: pageNumber,
          confidence: item.confidence || 0.9
        }));
      }
    } catch (e) {
      console.warn('Multimodal page extraction error:', e);
    }
    return [];
  }
}

export const geminiAIProvider = new GeminiAIProvider();
