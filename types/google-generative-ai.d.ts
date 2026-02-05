declare module '@google/generative-ai' {
  export class GoogleGenerativeAI {
    constructor(apiKey: string);
    getGenerativeModel(config: { model: string }): GenerativeModel;
  }

  export interface GenerativeModel {
    generateContent(prompt: string): Promise<GenerateContentResult>;
    startChat(config?: ChatConfig): ChatSession;
  }

  export interface ChatConfig {
    history?: Array<{ role: string; parts: Array<{ text: string }> }>;
    generationConfig?: GenerationConfig;
  }

  export interface GenerationConfig {
    maxOutputTokens?: number;
    temperature?: number;
    topP?: number;
    topK?: number;
  }

  export interface ChatSession {
    sendMessage(message: string): Promise<GenerateContentResult>;
  }

  export interface GenerateContentResult {
    response: {
      text(): string;
    };
  }
}
