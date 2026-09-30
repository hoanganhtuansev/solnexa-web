/**
 * SOLNEXA AI Provider Manager
 * Manages active pipeline mode (Auto Hybrid, Strict Native, Force AI),
 * AI provider selection (Gemini, OpenAI, Claude, Local Ollama/LLM, Local Rule),
 * model configurations, and quality thresholds.
 */

import { IngestionPipelineMode, AIProviderId, IngestionSettings, LocalConnectionTestResult } from '../../../src/types';
import { AIProvider } from './aiProviderInterface';
import { geminiAIProvider } from './geminiAIProvider';
import { openAIProvider } from './openaiAIProvider';
import { claudeProvider } from './claudeAIProvider';
import { localAIProvider } from './localAIProvider';

class AIProviderManager {
  private pipelineMode: IngestionPipelineMode = 'AUTO_HYBRID';
  private activeProviderId: AIProviderId = 'gemini';

  private geminiModel = 'gemini-2.5-flash';
  private openaiModel = 'gpt-4o';
  private claudeModel = 'claude-3-5-sonnet-20241022';
  private localEndpoint = 'http://localhost:11434';
  private localModelName = 'llama3.2-vision:latest';

  private qualityThreshold = 0.70; // 70% native quality score to qualify as "Đọc tốt"
  private confidenceThreshold = 0.85; // 85% confidence to avoid Review Required

  public getSettings(): IngestionSettings {
    return {
      pipelineMode: this.pipelineMode,
      activeProvider: this.activeProviderId,
      geminiModel: this.geminiModel,
      openaiModel: this.openaiModel,
      claudeModel: this.claudeModel,
      localEndpoint: this.localEndpoint,
      localModelName: this.localModelName,
      qualityThreshold: this.qualityThreshold,
      confidenceThreshold: this.confidenceThreshold,
      apiKeysConfigured: {
        gemini: geminiAIProvider.isConfigured(),
        openai: openAIProvider.isConfigured(),
        claude: claudeProvider.isConfigured()
      }
    };
  }

  public updateSettings(updates: Partial<IngestionSettings> & {
    openaiApiKey?: string;
    claudeApiKey?: string;
  }): IngestionSettings {
    if (updates.pipelineMode) {
      this.pipelineMode = updates.pipelineMode;
    }
    if (updates.activeProvider) {
      this.activeProviderId = updates.activeProvider;
    }
    if (updates.geminiModel) {
      this.geminiModel = updates.geminiModel;
      geminiAIProvider.setModel(updates.geminiModel);
    }
    if (updates.openaiModel) {
      this.openaiModel = updates.openaiModel;
      openAIProvider.setModel(updates.openaiModel);
    }
    if (updates.claudeModel) {
      this.claudeModel = updates.claudeModel;
      claudeProvider.setModel(updates.claudeModel);
    }
    if (updates.localEndpoint) {
      this.localEndpoint = updates.localEndpoint.trim();
      localAIProvider.setEndpoint(this.localEndpoint);
    }
    if (updates.localModelName) {
      this.localModelName = updates.localModelName.trim();
      localAIProvider.setModel(this.localModelName);
    }
    if (typeof updates.qualityThreshold === 'number') {
      this.qualityThreshold = Math.max(0.4, Math.min(0.95, updates.qualityThreshold));
    }
    if (typeof updates.confidenceThreshold === 'number') {
      this.confidenceThreshold = Math.max(0.5, Math.min(0.99, updates.confidenceThreshold));
    }

    if (updates.openaiApiKey) {
      openAIProvider.setApiKey(updates.openaiApiKey);
    }
    if (updates.claudeApiKey) {
      claudeProvider.setApiKey(updates.claudeApiKey);
    }

    return this.getSettings();
  }

  public getPipelineMode(): IngestionPipelineMode {
    return this.pipelineMode;
  }

  public getQualityThreshold(): number {
    return this.qualityThreshold;
  }

  public getConfidenceThreshold(): number {
    return this.confidenceThreshold;
  }

  public getActiveProviderId(): AIProviderId {
    return this.activeProviderId;
  }

  public getActiveProviderName(): string {
    switch (this.activeProviderId) {
      case 'gemini':
        return `Google Gemini (${this.geminiModel})`;
      case 'openai':
        return `OpenAI (${this.openaiModel})`;
      case 'claude':
        return `Anthropic Claude (${this.claudeModel})`;
      case 'local_ollama':
        return `Local Máy tính (${this.localModelName})`;
      case 'local_rule':
      default:
        return 'Local Rule Engine (Offline)';
    }
  }

  public getProvider(): AIProvider {
    switch (this.activeProviderId) {
      case 'gemini':
        if (geminiAIProvider.isConfigured()) return geminiAIProvider;
        console.warn('Gemini not configured, falling back to local');
        return localAIProvider;
      case 'openai':
        if (openAIProvider.isConfigured()) return openAIProvider;
        console.warn('OpenAI not configured, falling back to local');
        return localAIProvider;
      case 'claude':
        if (claudeProvider.isConfigured()) return claudeProvider;
        console.warn('Claude not configured, falling back to local');
        return localAIProvider;
      case 'local_ollama':
      case 'local_rule':
      default:
        return localAIProvider;
    }
  }

  public async testLocalConnection(endpoint?: string): Promise<LocalConnectionTestResult> {
    return localAIProvider.testConnection(endpoint || this.localEndpoint);
  }

  public getAvailableProviders(): Array<{ id: AIProviderId; name: string; isConfigured: boolean; description: string }> {
    return [
      {
        id: 'gemini',
        name: `Google Gemini (${this.geminiModel})`,
        isConfigured: geminiAIProvider.isConfigured(),
        description: 'Tốc độ siêu nhanh, tối ưu bóc tách datasheet đa trang và biểu đồ kỹ thuật'
      },
      {
        id: 'local_ollama',
        name: `Local Máy tính (${this.localModelName})`,
        isConfigured: true,
        description: 'Chạy trực tiếp trên máy cục bộ qua Ollama hoặc LM Studio (bảo mật dữ liệu 100%)'
      },
      {
        id: 'openai',
        name: `OpenAI (${this.openaiModel})`,
        isConfigured: openAIProvider.isConfigured(),
        description: 'Mô hình GPT-4o / GPT-4o-mini với độ chính xác cao cho văn bản phức tạp'
      },
      {
        id: 'claude',
        name: `Anthropic Claude (${this.claudeModel})`,
        isConfigured: claudeProvider.isConfigured(),
        description: 'Claude 3.5 Sonnet tối ưu cho phân tích cấu trúc tài liệu và bảng biểu phức tạp'
      },
      {
        id: 'local_rule',
        name: 'Local Engineering Rule Engine',
        isConfigured: true,
        description: 'Bộ luật Heuristic & bảng tra toán học tích hợp sẵn, hoàn toàn Offline, không tốn tài nguyên'
      }
    ];
  }
}

export const aiProviderManager = new AIProviderManager();
