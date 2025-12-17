
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage, GroundingSource } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const planGenerationModel = 'gemini-2.5-pro';
const chatModel = 'gemini-2.5-flash';

let chat: Chat | null = null;

export const generateAutomationPlan = async (businessDescription: string): Promise<{ planText: string, sources: GroundingSource[] }> => {
    const prompt = `
Eres un experto consultor en automatización de clase mundial. Tu tarea es analizar una descripción de negocio y crear un plan de automatización detallado y accionable.

Basado en la siguiente descripción de negocio, crea un plan de automatización completo.

### Descripción del negocio:
"${businessDescription}"

### El plan debe incluir los siguientes cinco puntos, usando exactamente estos encabezados en formato markdown ###:

### 1. Análisis de Procesos Manuales
Identifica los procesos clave que son repetitivos, propensos a errores o que consumen mucho tiempo y que son candidatos ideales para la automatización. Sé específico y da ejemplos concretos relacionados con el negocio.

### 2. Diseño de Flujos de Agentes
Propón flujos de trabajo automatizados (agentes) para los procesos identificados. Describe paso a paso cómo operarían estos agentes y cómo interactuarían entre sí o con los humanos.

### 3. Stack Tecnológico Recomendado
Sugiere un conjunto de herramientas y tecnologías (software, plataformas, APIs) para construir e implementar las automatizaciones. Justifica tus elecciones basándote en la escalabilidad, coste y facilidad de uso para el negocio descrito. Utiliza información actualizada de la web.

### 4. Implementación Paso a Paso
Proporciona una hoja de ruta clara para la implementación, dividida en fases o hitos (ej. Fase 1: Automatización de la comunicación con clientes, Fase 2: Optimización de la gestión de proyectos, etc.).

### 5. ROI Estimado
Ofrece un análisis del retorno de la inversión esperado. Considera ahorros de costos (horas de trabajo, reducción de errores), aumento de eficiencia, y otros beneficios cualitativos como la mejora en la satisfacción del cliente. Proporciona una estimación cuantitativa si es posible (ej. "ahorro de X horas/semana").

Utiliza información actualizada y precisa de la web para el stack tecnológico y las mejores prácticas de implementación. Sé claro, conciso y profesional.
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

        const planText = response.text;
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources: GroundingSource[] = groundingChunks
            .map((chunk: any) => ({
                uri: chunk.web?.uri || '',
                title: chunk.web?.title || 'Fuente sin título'
            }))
            .filter((source: GroundingSource) => source.uri);
        
        return { planText, sources };
    } catch (error) {
        console.error("Gemini API Error (generateAutomationPlan):", error);
        throw new Error("Failed to generate automation plan from Gemini API.");
    }
};


export const chatWithBot = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    if (!chat) {
        chat = ai.chats.create({
            model: chatModel,
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.content }]
            })),
        });
    }

    try {
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Gemini API Error (chatWithBot):", error);
        // Reset chat on error
        chat = null;
        throw new Error("Failed to get chat response from Gemini API.");
    }
};
