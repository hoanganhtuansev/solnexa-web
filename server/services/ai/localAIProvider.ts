/**
 * SOLNEXA Local Machine AI Provider
 * Connects to local LLMs running on the engineer's machine (Ollama, LM Studio, LocalAI, vLLM)
 * and includes a 100% offline fallback heuristic rule engine if local HTTP daemon is not running.
 */

import { EquipmentCategoryCode, LocalConnectionTestResult } from '../../../src/types';
import { AIProvider, AIIdentityResult, AIExtractedSpec } from './aiProviderInterface';

export class LocalMachineAIProvider implements AIProvider {
  public readonly name = 'Local Machine AI (Ollama / Local LLM)';
  public readonly supportedModels = [
    'llama3.2-vision:latest',
    'llama3.2:latest',
    'qwen2.5:7b',
    'qwen2.5-coder:7b',
    'mistral:7b',
    'deepseek-r1:8b',
    'phi3:mini',
    'custom'
  ];

  private endpoint = 'http://localhost:11434';
  private selectedModel = 'llama3.2-vision:latest';

  public setEndpoint(url: string) {
    if (url && url.trim()) {
      this.endpoint = url.trim().replace(/\/+$/, '');
    }
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public setModel(model: string) {
    if (model && model.trim()) {
      this.selectedModel = model.trim();
    }
  }

  public getModel(): string {
    return this.selectedModel;
  }

  public isConfigured(): boolean {
    return true; // Always usable (falls back to local rules if offline)
  }

  /**
   * Test connection to user's local machine daemon (Ollama / LM Studio / LocalAI)
   */
  public async testConnection(targetEndpoint?: string): Promise<LocalConnectionTestResult> {
    const url = (targetEndpoint || this.endpoint).replace(/\/+$/, '');
    const startTime = Date.now();

    // 1. Try Ollama native endpoint (/api/tags)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${url}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data: any = await res.json();
        const models = Array.isArray(data.models)
          ? data.models.map((m: any) => m.name || m.model).filter(Boolean)
          : [];
        return {
          success: true,
          endpoint: url,
          latencyMs: Date.now() - startTime,
          detectedModels: models,
          message: `Kết nối thành công tới Ollama tại ${url}. Tìm thấy ${models.length} mô hình cục bộ.`
        };
      }
    } catch (err) {
      // Continue to try OpenAI-compatible endpoint
    }

    // 2. Try OpenAI-compatible endpoint (/v1/models) for LM Studio, LocalAI, vLLM
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${url}/v1/models`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data: any = await res.json();
        const models = Array.isArray(data.data)
          ? data.data.map((m: any) => m.id).filter(Boolean)
          : [];
        return {
          success: true,
          endpoint: url,
          latencyMs: Date.now() - startTime,
          detectedModels: models,
          message: `Kết nối thành công tới Local OpenAI API (LM Studio / vLLM) tại ${url}. Tìm thấy ${models.length} mô hình.`
        };
      }
    } catch (err: any) {
      return {
        success: false,
        endpoint: url,
        latencyMs: Date.now() - startTime,
        message: `Không thể kết nối tới máy chủ Local tại ${url}. Vui lòng kiểm tra Ollama hoặc LM Studio đã chạy chưa (ví dụ: 'ollama serve'). Hệ thống sẽ tự động dùng Bộ suy luận Heuristic nội bộ.`
      };
    }

    return {
      success: false,
      endpoint: url,
      message: `Máy chủ local tại ${url} không phản hồi danh sách mô hình.`
    };
  }

  /**
   * Internal helper to query local LLM
   */
  private async queryLocalLLM(systemPrompt: string, userPrompt: string): Promise<string | null> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    // Try OpenAI-compatible format first (/v1/chat/completions)
    try {
      const res = await fetch(`${this.endpoint}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.selectedModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1
        }),
        signal: controller.signal
      });

      if (res.ok) {
        const data: any = await res.json();
        return data.choices?.[0]?.message?.content || null;
      }
    } catch (e) {
      // Fall through to try Ollama native endpoint
    } finally {
      clearTimeout(timeout);
    }

    // Try Ollama native endpoint (/api/generate)
    try {
      const controller2 = new AbortController();
      const timeout2 = setTimeout(() => controller2.abort(), 20000);

      const res = await fetch(`${this.endpoint}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.selectedModel,
          system: systemPrompt,
          prompt: userPrompt,
          stream: false,
          format: 'json'
        }),
        signal: controller2.signal
      });
      clearTimeout(timeout2);

      if (res.ok) {
        const data: any = await res.json();
        return data.response || null;
      }
    } catch (e) {
      // Local server offline or failed
    }

    return null;
  }

  public async classifyEquipment(text: string): Promise<EquipmentCategoryCode> {
    // 1. Try Local LLM
    const system = 'You are an electrical engineering classifier. Output JSON: {"category": "CODE"} from: PV_MODULE, PCS_INVERTER, BESS, BATTERY, TRANSFORMER, ACB, MCCB, VCB, CABLE, COMBINER_BOX, OTHER.';
    const llmRes = await this.queryLocalLLM(system, text.substring(0, 2000));
    if (llmRes) {
      try {
        const match = llmRes.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : llmRes);
        if (parsed.category) return parsed.category as EquipmentCategoryCode;
      } catch (e) {
        // Fallback to heuristic
      }
    }

    // 2. Built-in Heuristic Fallback
    const lower = text.toLowerCase();
    if (/pv\s*module|solar\s*module|bifacial|topcon/i.test(lower)) return 'PV_MODULE';
    if (/inverter|pcs\b|string\s*inverter|mppt/i.test(lower)) return 'PCS_INVERTER';
    if (/bess|battery\s*energy\s*storage|liquid\s*cooling/i.test(lower)) return 'BESS';
    if (/battery\s*rack|battery\s*module/i.test(lower)) return 'BATTERY';
    if (/transformer|pad-mounted/i.test(lower)) return 'TRANSFORMER';
    if (/air\s*circuit\s*breaker|\bacb\b/i.test(lower)) return 'ACB';
    if (/mccb\b|molded\s*case/i.test(lower)) return 'MCCB';
    if (/vcb\b|vacuum\s*circuit/i.test(lower)) return 'VCB';
    if (/cable|h1z2z2/i.test(lower)) return 'CABLE';
    if (/combiner\s*box/i.test(lower)) return 'COMBINER_BOX';
    return 'OTHER';
  }

  public async extractEquipmentIdentity(documentText: string, filename: string): Promise<AIIdentityResult> {
    // 1. Try Local LLM
    const system = 'Extract equipment identity JSON: { "manufacturer": string, "model": string, "category": string, "series": string, "description": string, "confidence": number }';
    const user = `Filename: ${filename}\nText:\n${documentText.substring(0, 3500)}`;
    const llmRes = await this.queryLocalLLM(system, user);
    if (llmRes) {
      try {
        const match = llmRes.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : llmRes);
        if (parsed.manufacturer && parsed.model) {
          return {
            manufacturer: parsed.manufacturer,
            model: parsed.model,
            category: (parsed.category as EquipmentCategoryCode) || 'OTHER',
            series: parsed.series || '',
            description: parsed.description || '',
            confidence: 0.88
          };
        }
      } catch (e) {
        // Fallback
      }
    }

    // 2. Built-in Local Heuristic
    let mfg = 'Unknown';
    if (/huawei/i.test(documentText) || /huawei/i.test(filename)) mfg = 'Huawei';
    else if (/sungrow/i.test(documentText) || /sungrow/i.test(filename)) mfg = 'Sungrow';
    else if (/tmeic/i.test(documentText) || /tmeic/i.test(filename)) mfg = 'TMEIC';
    else if (/catl/i.test(documentText) || /catl/i.test(filename)) mfg = 'CATL';
    else if (/byd/i.test(documentText) || /byd/i.test(filename)) mfg = 'BYD';
    else if (/trina/i.test(documentText) || /trina/i.test(filename)) mfg = 'Trina Solar';
    else if (/jinko/i.test(documentText) || /jinko/i.test(filename)) mfg = 'Jinko Solar';
    else if (/longi/i.test(documentText) || /longi/i.test(filename)) mfg = 'LONGi Solar';

    const category = await this.classifyEquipment(documentText + ' ' + filename);
    let model = filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
    const codeMatch = documentText.match(/\b([A-Z0-9]{2,10}(?:-[A-Z0-9.]+){1,3})\b/);
    if (codeMatch) {
      model = codeMatch[1];
    }

    return {
      manufacturer: mfg,
      model,
      category,
      series: '',
      description: `${mfg} ${model} (${category.replace(/_/g, ' ')})`,
      confidence: 0.85
    };
  }

  public async extractSpecifications(
    pageText: string,
    pageNumber: number,
    category: EquipmentCategoryCode,
    modelContext?: string
  ): Promise<AIExtractedSpec[]> {
    // 1. Try Local LLM
    const system = `Extract engineering specifications for ${category} as JSON:
{
  "specifications": [
    {
      "parameterName": "snake_case_key",
      "displayName": "Label",
      "rawValue": "1100 V",
      "rawUnit": "V",
      "normalizedValue": 1100,
      "normalizedUnit": "V",
      "confidence": 0.88,
      "notes": "Local LLM"
    }
  ]
}`;
    const user = `Model: ${modelContext || 'Unknown'}\nPage: ${pageNumber}\nText:\n${pageText}`;
    const llmRes = await this.queryLocalLLM(system, user);
    if (llmRes) {
      try {
        const match = llmRes.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(match ? match[0] : llmRes);
        if (Array.isArray(parsed.specifications) && parsed.specifications.length > 0) {
          return parsed.specifications.map((s: any) => ({
            parameterName: String(s.parameterName || '').toLowerCase().replace(/[^a-z0-9_]/g, '_'),
            displayName: String(s.displayName || s.parameterName),
            rawValue: String(s.rawValue || ''),
            rawUnit: String(s.rawUnit || ''),
            normalizedValue: s.normalizedValue ?? s.rawValue,
            normalizedUnit: String(s.normalizedUnit || s.rawUnit || ''),
            sourcePage: pageNumber,
            confidence: typeof s.confidence === 'number' ? s.confidence : 0.88,
            notes: s.notes ? String(s.notes) : `Local model (${this.selectedModel})`
          }));
        }
      } catch (e) {
        // Fallback
      }
    }

    // 2. Built-in Local Heuristic extraction
    const specs: AIExtractedSpec[] = [];
    const lines = pageText.split('\n');
    for (const line of lines) {
      const m = line.match(/^\s*([A-Za-z0-9\s()./_-]{3,40}?)\s*[:：\-]\s*([<>]?\s*[0-9,.]+)\s*([A-Za-z%°/²Ω]{1,10})?\b/);
      if (m) {
        const paramLabel = m[1].trim();
        const rawVal = m[2].trim();
        const rawUnit = (m[3] || '').trim();
        const paramKey = paramLabel.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').substring(0, 35);
        const num = parseFloat(rawVal.replace(/[<>,]/g, ''));

        specs.push({
          parameterName: paramKey,
          displayName: paramLabel,
          rawValue: `${rawVal} ${rawUnit}`.trim(),
          rawUnit: rawUnit,
          normalizedValue: isNaN(num) ? rawVal : num,
          normalizedUnit: rawUnit,
          sourcePage: pageNumber,
          confidence: 0.84,
          notes: 'Local Heuristic Engine (Offline)'
        });
      }
    }
    return specs;
  }
}

export const localAIProvider = new LocalMachineAIProvider();
