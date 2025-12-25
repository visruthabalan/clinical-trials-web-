
import { GoogleGenAI, Type } from "@google/genai";
import { AgentInsight, AgentType, ClinicalData } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Generates deep insights using Thinking Mode for complex analysis
   */
  async getComplexInsight(prompt: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 }
      }
    });
    return response.text || "No insight generated.";
  }

  /**
   * Fast responses for chat using Flash Lite
   */
  async getQuickChatResponse(message: string): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: message,
    });
    return response.text || "I'm sorry, I couldn't process that.";
  }

  /**
   * Search grounding for recent clinical trials or news
   */
  async searchClinicalContext(query: string): Promise<{ text: string, sources: any[] }> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: query,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    return {
      text: response.text || "",
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }

  /**
   * Agent Logic: Analyze clinical data and return structured insights
   */
  async runAgentAnalysis(agentType: AgentType, data: ClinicalData): Promise<AgentInsight[]> {
    const prompt = `
      Act as a ${agentType}. Analyze this clinical trial data:
      ${JSON.stringify(data)}
      
      Identify 1-2 major findings, anomalies, or risks.
      Provide reasoning and a suggested action.
    `;

    const response = await this.ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
              suggestedAction: { type: Type.STRING },
              sourceData: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['title', 'description', 'severity', 'suggestedAction']
          }
        }
      }
    });

    try {
      const results = JSON.parse(response.text || "[]");
      return results.map((res: any, idx: number) => ({
        ...res,
        id: `${agentType}-${Date.now()}-${idx}`,
        agentName: agentType,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Failed to parse agent JSON", e);
      return [];
    }
  }
}

export const gemini = new GeminiService();
