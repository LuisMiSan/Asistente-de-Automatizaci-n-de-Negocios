
import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { BusinessInput } from './components/BusinessInput';
import { AutomationPlan } from './components/AutomationPlan';
import { AdminPanel } from './components/AdminPanel';
import { ChatBot } from './components/ChatBot';
import { generateAutomationPlan } from './services/geminiService';
import type { Plan, GroundingSource } from './types';

const App: React.FC = () => {
    const [automationPlan, setAutomationPlan] = useState<Plan | null>(null);
    const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdminOpen, setIsAdminOpen] = useState<boolean>(true);

    const sectionsRefs = {
        input: useRef<HTMLDivElement>(null),
        analysis: useRef<HTMLDivElement>(null),
        flows: useRef<HTMLDivElement>(null),
        stack: useRef<HTMLDivElement>(null),
        implementation: useRef<HTMLDivElement>(null),
        roi: useRef<HTMLDivElement>(null),
        sources: useRef<HTMLDivElement>(null),
    };

    const scrollToSection = (sectionId: keyof typeof sectionsRefs) => {
        sectionsRefs[sectionId].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

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
            
            // Regex robusta para separar secciones por encabezados de markdown
            const sections = result.planText.split(/### \d+\.\s+.*?\n/);
            // El primer elemento suele ser texto antes del primer encabezado, lo ignoramos o manejamos
            const contentSections = sections.filter(s => s.trim().length > 0);

            setAutomationPlan({
                analysis: { title: '1. Análisis de Procesos Manuales', content: contentSections[0] || '' },
                flows: { title: '2. Diseño de Flujos de Agentes', content: contentSections[1] || '' },
                stack: { title: '3. Stack Tecnológico Recomendado', content: contentSections[2] || '' },
                implementation: { title: '4. Implementación Paso a Paso', content: contentSections[3] || '' },
                roi: { title: '5. ROI Estimado', content: contentSections[4] || '' },
            });

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
        <div className="h-screen bg-gray-950 text-gray-100 font-sans flex flex-col overflow-hidden">
            <Header onToggleAdmin={() => setIsAdminOpen(!isAdminOpen)} isAdminOpen={isAdminOpen} />
            
            <div className="flex flex-1 overflow-hidden relative">
                <AdminPanel 
                    isOpen={isAdminOpen} 
                    onNavigate={scrollToSection} 
                    hasPlan={!!automationPlan}
                />
                
                <main className="flex-1 overflow-y-auto bg-gray-900/30 p-4 md:p-8 space-y-12 pb-32 custom-scrollbar">
                    <div ref={sectionsRefs.input}>
                        <BusinessInput onGenerate={handleGeneratePlan} isLoading={isLoading} />
                    </div>

                    {error && (
                        <div className="bg-red-900/30 border border-red-800 text-red-200 px-6 py-4 rounded-xl text-center backdrop-blur-md">
                            {error}
                        </div>
                    )}

                    <AutomationPlan 
                        plan={automationPlan}
                        sources={groundingSources}
                        isLoading={isLoading}
                        refs={sectionsRefs}
                    />
                </main>
            </div>
            
            <ChatBot />
        </div>
    );
};

export default App;
