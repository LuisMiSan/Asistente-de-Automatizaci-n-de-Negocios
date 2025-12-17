
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { BusinessInput } from './components/BusinessInput';
import { AutomationPlan } from './components/AutomationPlan';
import { ChatBot } from './components/ChatBot';
import { generateAutomationPlan } from './services/geminiService';
import type { Plan, GroundingSource } from './types';

const App: React.FC = () => {
    const [automationPlan, setAutomationPlan] = useState<Plan | null>(null);
    const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = useCallback(async (businessDescription: string) => {
        if (!businessDescription.trim()) {
            setError("Por favor, describe tu negocio.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAutomationPlan(null);
        setGroundingSources([]);

        try {
            const result = await generateAutomationPlan(businessDescription);
            
            // Basic parsing of the response text into sections
            const sections = result.planText.split(/#{2,3}\s*\d+\.\s*/);
            const titles = result.planText.match(/#{2,3}\s*\d+\.\s*(.*?)\n/g) || [];

            if (sections.length > 5) {
                 setAutomationPlan({
                    analysis: { title: titles[0]?.replace(/#{2,3}\s*\d+\.\s*/, '').trim() || 'Análisis de Procesos Manuales', content: sections[1] },
                    flows: { title: titles[1]?.replace(/#{2,3}\s*\d+\.\s*/, '').trim() || 'Diseño de Flujos de Agentes', content: sections[2] },
                    stack: { title: titles[2]?.replace(/#{2,3}\s*\d+\.\s*/, '').trim() || 'Stack Tecnológico Recomendado', content: sections[3] },
                    implementation: { title: titles[3]?.replace(/#{2,3}\s*\d+\.\s*/, '').trim() || 'Implementación Paso a Paso', content: sections[4] },
                    roi: { title: titles[4]?.replace(/#{2,3}\s*\d+\.\s*/, '').trim() || 'ROI Estimado', content: sections[5] },
                });
            } else {
                // Fallback for unexpected format
                setAutomationPlan({
                    analysis: { title: 'Plan de Automatización', content: result.planText },
                    flows: { title: '', content: '' },
                    stack: { title: '', content: '' },
                    implementation: { title: '', content: '' },
                    roi: { title: '', content: '' },
                });
            }

            if (result.sources) {
                setGroundingSources(result.sources);
            }

        } catch (err) {
            console.error("Error generating plan:", err);
            setError("Hubo un error al generar el plan. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
            <Header />
            <main className="container mx-auto px-4 py-8">
                <BusinessInput onGenerate={handleGeneratePlan} isLoading={isLoading} />
                {error && (
                    <div className="mt-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                        {error}
                    </div>
                )}
                <AutomationPlan 
                    plan={automationPlan}
                    sources={groundingSources}
                    isLoading={isLoading} 
                />
            </main>
            <ChatBot />
        </div>
    );
};

export default App;
