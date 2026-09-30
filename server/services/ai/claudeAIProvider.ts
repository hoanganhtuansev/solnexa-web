/**
 * SOLNEXA Anthropic Claude AI Provider
 * Integrates Claude 3.5 Sonnet / Haiku for engineering datasheet extraction.
 */

import { EquipmentCategoryCode } from '../../../src/types';
import { AIProvider, AIIdentityResult, AIExtractedSpec } from './aiProviderInterface';

export class ClaudeProvider implements AIProvider {
  public readonly name = 'Anthropic Claude';
  public readonly supportedModels = ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'];
  private selectedModel = 'claude-3-5-sonnet-20241022';
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
    const key = this.customApiKey || process.env.ANTHROPIC_API_KEY;
    return Boolean(key && key.trim() !== '');
  }

  private getApiKey(): string {
    const key = this.customApiKey || process.env.ANTHROPIC_API_KEY;
    if (!key) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    return key;
  }

  private async callMessages(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = this.getApiKey();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.selectedModel,
          max_tokens: 4096,
          system: systemPrompt,
          messages: [
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1
        }),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic Claude API error ${response.status}: ${errorText}`);
      }

      const data: any = await response.json();
      const textBlock = data.content?.find((c: any) => c.type === 'text');
      return textBlock?.text || '{}';
    } finally {
      clearTimeout(timeout);
    }
  }

  public async classifyEquipment(text: string): Promise<EquipmentCategoryCode> {
    if (!this.isConfigured()) return 'OTHER';
    try {
      const system = 'You are an electrical engineering classifier. Output ONLY JSON object: {"category": "CATEGORY_CODE"} from: PV_MODULE, PCS_INVERTER, BESS, BATTERY, TRANSFORMER, ACB, MCCB, VCB, CABLE, COMBINER_BOX, OTHER.';
      const raw = await this.callMessages(system, text.substring(0, 2000));
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
      return parsed.category || 'OTHER';
    } catch (e) {
      console.warn('Claude classification fallback:', e);
      return 'OTHER';
    }
  }

  public async extractEquipmentIdentity(documentText: string, filename: string): Promise<AIIdentityResult> {
    const system = 'You are an engineering datasheet extractor. Return ONLY valid JSON: { "manufacturer": string, "model": string, "category": string, "series": string, "description": string, "confidence": number }';
    const user = `Filename: ${filename}\nText:\n${documentText.substring(0, 4000)}`;
    const raw = await this.callMessages(system, user);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    return {
      manufacturer: parsed.manufacturer || 'Unknown',
      model: parsed.model || filename.replace('.pdf', ''),
      category: (parsed.category as EquipmentCategoryCode) || 'OTHER',
      series: parsed.series || '',
      description: parsed.description || '',
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.92
    };
  }

  public async extractSpecifications(
    pageText: string,
    pageNumber: number,
    category: EquipmentCategoryCode,
    modelContext?: string
  ): Promise<AIExtractedSpec[]> {
    const system = `You are a precision electrical engineer extracting specifications for ${category}.
Return ONLY valid JSON with a "specifications" key containing an array:
{
  "specifications": [
    {
      "parameterName": "snake_case_key",
      "displayName": "Label",
      "rawValue": "Original text with unit",
      "rawUnit": "Unit",
      "normalizedValue": number_or_string,
      "normalizedUnit": "Unit",
      "confidence": 0.95,
      "notes": "Context"
    }
  ]
}`;
    const user = `Model: ${modelContext || 'Unknown'}\nPage: ${pageNumber}\nContent:\n${pageText}`;
    const raw = await this.callMessages(system, user);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    const specs = Array.isArray(parsed.specifications) ? parsed.specifications : [];
    return specs.map((s: any) => ({
      parameterName: String(s.parameterName || '').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
      displayName: String(s.displayName || s.parameterName),
      rawValue: String(s.rawValue || ''),
      rawUnit: String(s.rawUnit || ''),
      normalizedValue: s.normalizedValue ?? s.rawValue,
      normalizedUnit: String(s.normalizedUnit || s.rawUnit || ''),
      sourcePage: pageNumber,
      confidence: typeof s.confidence === 'number' ? s.confidence : 0.94,
      notes: s.notes ? String(s.notes) : 'Claude extraction'
    }));
  }
}

export const claudeProvider = new ClaudeProvider();
