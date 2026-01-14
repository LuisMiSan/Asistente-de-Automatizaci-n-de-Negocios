
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Header } from './components/Header';
import { BusinessInput } from './components/BusinessInput';
import { AutomationPlan } from './components/AutomationPlan';
import { AdminPanel } from './components/AdminPanel';
import { ChatBot } from './components/ChatBot';
import { generateAutomationPlan } from './services/geminiService';
import type { Plan, GroundingSource, SavedPlan, PlanSection } from './types';

const STORAGE_KEY = 'automation_hub_database_v2';

const App: React.FC = () => {
    const [automationPlan, setAutomationPlan] = useState<Plan | null>(null);
    const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isAdminOpen, setIsAdminOpen] = useState<boolean>(true);
    const [history, setHistory] = useState<SavedPlan[]>([]);
    const [currentDescription, setCurrentDescription] = useState<string>('');
    const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

    const sectionsRefs = {
        input: useRef<HTMLDivElement>(null),
        analysis: useRef<HTMLDivElement>(null),
        flows: useRef<HTMLDivElement>(null),
        stack: useRef<HTMLDivElement>(null),
        implementation: useRef<HTMLDivElement>(null),
        roi: useRef<HTMLDivElement>(null),
        sources: useRef<HTMLDivElement>(null),
    };

    // Cargar historial al iniciar
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                setHistory(JSON.parse(saved));
            } catch (e) {
                console.error("Error loading database", e);
            }
        }
    }, []);

    const saveToStorage = (newHistory: SavedPlan[]) => {
        try {
            setHistory(newHistory);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
        } catch (e) {
            console.error("Error saving to localStorage", e);
            alert("Error al guardar en el almacenamiento local (posiblemente lleno).");
        }
    };

    const scrollToSection = (sectionId: keyof typeof sectionsRefs) => {
        sectionsRefs[sectionId].current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const handleNewAudit = () => {
        setAutomationPlan(null);
        setGroundingSources([]);
        setCurrentDescription('');
        setCurrentProjectId(null); // Reset ID to create new
        scrollToSection('input');
    };

    const loadFromHistory = (savedPlan: SavedPlan) => {
        setAutomationPlan(savedPlan.plan);
        setGroundingSources(savedPlan.sources);
        setCurrentDescription(savedPlan.businessDescription);
        setCurrentProjectId(savedPlan.id); // Set active ID
        setTimeout(() => scrollToSection('analysis'), 100);
    };

    const handleDeleteProject = (id: string) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este proyecto de la base de datos?')) {
            const updatedHistory = history.filter(item => item.id !== id);
            saveToStorage(updatedHistory);
            if (currentProjectId === id) {
                handleNewAudit();
            }
        }
    };

    const handleSaveProject = () => {
        if (!automationPlan) return;

        if (currentProjectId) {
            // ACTUALIZAR PROYECTO EXISTENTE
            const updatedHistory = history.map(p => {
                if (p.id === currentProjectId) {
                    return {
                        ...p,
                        timestamp: Date.now(),
                        businessDescription: currentDescription,
                        plan: automationPlan,
                        sources: groundingSources
                    };
                }
                return p;
            });
            saveToStorage(updatedHistory);
            alert("Proyecto actualizado correctamente en la Base de Datos.");
        } else {
            // GUARDAR NUEVO PROYECTO
            let name = prompt("Asigna un nombre para guardar este proyecto:", "Nueva Auditoría");
            if (name === null) return; // User cancelled
            if (!name.trim()) name = "Sin Nombre";

            const newId = Date.now().toString();
            const savedItem: SavedPlan = {
                id: newId,
                name: name,
                timestamp: Date.now(),
                businessDescription: currentDescription,
                plan: automationPlan,
                sources: groundingSources
            };

            const updatedHistory = [savedItem, ...history];
            saveToStorage(updatedHistory);
            setCurrentProjectId(newId); // Switch to active mode
            alert("Proyecto nuevo guardado exitosamente.");
        }
    };

    const handleUpdatePlanSection = (sectionKey: keyof Plan, newContent: string) => {
        if (!automationPlan) return;
        setAutomationPlan({
            ...automationPlan,
            [sectionKey]: {
                ...automationPlan[sectionKey],
                content: newContent
            }
        });
    };

    const handleImportProject = (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result as string;
                const importedPlan = JSON.parse(content) as SavedPlan;
                
                if (!importedPlan.plan || !importedPlan.id) {
                    throw new Error("Formato de archivo inválido");
                }

                // Generar nuevo ID para evitar colisiones al importar
                importedPlan.id = Date.now().toString() + Math.random().toString().slice(2, 5);
                importedPlan.name = importedPlan.name + " (Importado)";

                const updatedHistory = [importedPlan, ...history];
                saveToStorage(updatedHistory);
                loadFromHistory(importedPlan);
                alert("Proyecto importado correctamente.");
            } catch (err) {
                console.error("Error importing file:", err);
                alert("Error al importar el archivo.");
            }
        };
        reader.readAsText(file);
    };

    const handleGeneratePlan = useCallback(async (businessDescription: string) => {
        if (!businessDescription.trim()) {
            setError("Por favor, describe tu negocio.");
            return;
        }
        setIsLoading(true);
        setError(null);
        // No borramos currentProjectId aquí para permitir "regenerar" sobre el mismo proyecto si se desea,
        // pero lo más limpio es tratar una generación como un borrador hasta que se guarda.
        // Mantenemos el ID si existe, asumiendo que el usuario quiere actualizar la versión actual.
        
        setAutomationPlan(null);
        setGroundingSources([]);
        setCurrentDescription(businessDescription);

        try {
            const result = await generateAutomationPlan(businessDescription);
            
            const sections = result.planText.split(/### \d+\.\s+.*?\n/);
            const contentSections = sections.filter(s => s.trim().length > 0);

            const newPlan: Plan = {
                analysis: { title: '1. Análisis de Procesos Manuales', content: contentSections[0] || '' },
                flows: { title: '2. Diseño de Flujos de Agentes', content: contentSections[1] || '' },
                stack: { title: '3. Stack Tecnológico Recomendado', content: contentSections[2] || '' },
                implementation: { title: '4. Implementación Paso a Paso', content: contentSections[3] || '' },
                roi: { title: '5. ROI Estimado', content: contentSections[4] || '' },
            };

            setAutomationPlan(newPlan);
            setGroundingSources(result.sources);
            
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
                    history={history}
                    onLoadPlan={loadFromHistory}
                    onNewAudit={handleNewAudit}
                    onImportProject={handleImportProject}
                    onDeleteProject={handleDeleteProject}
                    currentProjectId={currentProjectId}
                />
                
                <main className="flex-1 overflow-y-auto bg-gray-900/30 p-4 md:p-8 space-y-12 pb-32 custom-scrollbar">
                    <div ref={sectionsRefs.input}>
                        <BusinessInput 
                            onGenerate={handleGeneratePlan} 
                            isLoading={isLoading} 
                            initialValue={currentDescription}
                        />
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
                        onSaveProject={handleSaveProject}
                        currentProjectId={currentProjectId}
                        onUpdateSection={handleUpdatePlanSection}
                    />
                </main>
            </div>
            
            <ChatBot />
        </div>
    );
};

export default App;
