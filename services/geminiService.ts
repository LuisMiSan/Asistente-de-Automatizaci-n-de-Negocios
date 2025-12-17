
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Usando modelos Gemini 3 según las directrices más recientes
const planGenerationModel = 'gemini-3-pro-preview';
const chatModel = 'gemini-3-flash-preview';

let chat: Chat | null = null;

export const generateAutomationPlan = async (businessDescription: string): Promise<{ planText: string, sources: GroundingSource[] }> => {
    const prompt = `
Eres un experto consultor en automatización de clase mundial. Analiza esta descripción: "${businessDescription}"

Genera un plan detallado siguiendo estrictamente esta estructura de encabezados markdown:

### 1. Análisis de Procesos Manuales
[Contenido]

### 2. Diseño de Flujos de Agentes
[Contenido]

### 3. Stack Tecnológico Recomendado
[Contenido]

### 4. Implementación Paso a Paso
[Contenido]

### 5. ROI Estimado
[Contenido]

Sé extremadamente profesional y utiliza Google Search para recomendar herramientas actuales.
`;

    try {
        const response = await ai.models.generateContent({
            model: planGenerationModel,
            contents: prompt,
            config: {
                thinkingConfig: { thinkingBudget: 32768 },
                tools: [{ googleSearch: {} }],
            },
        });

        const planText = response.text || "";
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Fuente de información'
            }))
            .filter((source: GroundingSource) => source.uri);
        
        return { planText, sources };
    } catch (error) {
        console.error("Gemini API Error (generateAutomationPlan):", error);
        throw new Error("Error al conectar con la IA de Gemini.");
    }
};

export const chatWithBot = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    try {
        if (!chat) {
            chat = ai.chats.create({
                model: chatModel,
                config: {
                    systemInstruction: 'Eres un asistente experto en automatización de procesos empresariales. Responde de forma concisa y profesional.',
                },
                history: history.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                })),
            });
        }

        const response = await chat.sendMessage({ message: newMessage });
        return response.text || "No pude generar una respuesta.";
    } catch (error) {
        console.error("Gemini API Error (chatWithBot):", error);
        chat = null; // Reiniciar sesión en caso de error
        throw new Error("Error en la comunicación del chat.");
    }
};
