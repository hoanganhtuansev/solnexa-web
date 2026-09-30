/**
 * SOLNEXA OpenAI AI Provider
 * Integrates OpenAI GPT-4o / GPT-4o-mini for engineering datasheet extraction.
 */

import { EquipmentCategoryCode } from '../../../src/types';
import { AIProvider, AIIdentityResult, AIExtractedSpec } from './aiProviderInterface';

export class OpenAIProvider implements AIProvider {
  public readonly name = 'OpenAI';
  public readonly supportedModels = ['gpt-4o', 'gpt-4o-mini'];
  private selectedModel = 'gpt-4o';
  private customApiKey = '';

  public setModel(model: string) {
    if (this.supportedModels.includes(model)) {
      this.selectedModel = model;
    }
  }

  public getModel(): string {
    return this.selectedModel;
  }

  public setApiKey(key: string) {
    this.customApiKey = key;
  }

  public isConfigured(): boolean {
    const key = this.customApiKey || process.env.OPENAI_API_KEY;
    return Boolean(key && key.trim() !== '');
  }

  private getApiKey(): string {
    const key = this.customApiKey || process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    return key;
  }

  private async callChatCompletions(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error ${response.status}: ${errorText}`);
      }

      const data: any = await response.json();
      return data.choices?.[0]?.message?.content || '{}';
    } finally {
      clearTimeout(timeout);
    }
  }

  public async classifyEquipment(text: string): Promise<EquipmentCategoryCode> {
    if (!this.isConfigured()) return 'OTHER';
    try {
      const system = 'You are an electrical engineer. Output JSON with key "category" from: PV_MODULE, PCS_INVERTER, BESS, BATTERY, TRANSFORMER, ACB, MCCB, VCB, CABLE, COMBINER_BOX, OTHER.';
      const raw = await this.callChatCompletions(system, text.substring(0, 2000));
      const parsed = JSON.parse(raw);
      return parsed.category || 'OTHER';
    } catch (e) {
      console.warn('OpenAI classification fallback:', e);
      return 'OTHER';
    }
  }

  public async extractEquipmentIdentity(documentText: string, filename: string): Promise<AIIdentityResult> {
    const system = 'You are an expert renewable electrical engineer. Extract equipment identity strictly as JSON: { "manufacturer": string, "model": string, "category": string, "series": string, "description": string, "confidence": number }';
    const user = `Filename: ${filename}\nDocument snippet:\n${documentText.substring(0, 4000)}`;
    const raw = await this.callChatCompletions(system, user);
    const parsed = JSON.parse(raw);
    return {
      manufacturer: parsed.manufacturer || 'Unknown',
      model: parsed.model || filename.replace('.pdf', ''),
      category: (parsed.category as EquipmentCategoryCode) || 'OTHER',
      series: parsed.series || '',
      description: parsed.description || '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.9
    };
  }

  public async extractSpecifications(
    pageText: string,
    pageNumber: number,
    category: EquipmentCategoryCode,
    modelContext?: string
  ): Promise<AIExtractedSpec[]> {
    const system = `You are a precision electrical specification parser for ${category}.
Extract all technical parameters from the datasheet page as JSON with a top-level key "specifications":
[
  {
    "parameterName": "normalized_snake_case_key",
    "displayName": "Clean Engineering Label",
    "rawValue": "Original text value with unit",
    "rawUnit": "V, A, kW, %, mm2, etc.",
    "normalizedValue": number_or_string,
    "normalizedUnit": "standard unit",
    "confidence": 0.0 to 1.0,
    "notes": "STC, NOCT, IEC standard, etc."
  }
]`;
    const user = `Model: ${modelContext || 'Unknown'}\nPage: ${pageNumber}\nContent:\n${pageText}`;
    const raw = await this.callChatCompletions(system, user);
    const parsed = JSON.parse(raw);
    const specs = Array.isArray(parsed.specifications) ? parsed.specifications : [];
    return specs.map((s: any) => ({
      parameterName: String(s.parameterName || '').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      displayName: String(s.displayName || s.parameterName),
      rawValue: String(s.rawValue || ''),
      rawUnit: String(s.rawUnit || ''),
      normalizedValue: s.normalizedValue ?? s.rawValue,
      normalizedUnit: String(s.normalizedUnit || s.rawUnit || ''),
      sourcePage: pageNumber,
      confidence: typeof s.confidence === 'number' ? s.confidence : 0.92,
      notes: s.notes ? String(s.notes) : 'OpenAI extraction'
    }));
  }
}

export const openAIProvider = new OpenAIProvider();
