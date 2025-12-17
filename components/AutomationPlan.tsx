
import React from 'react';
import type { Plan, GroundingSource } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { 
    AnalysisIcon, 
    FlowIcon, 
    StackIcon, 
    RocketIcon, 
    StatsIcon, 
    SearchIcon,
    DocumentArrowDownIcon 
} from './icons';
import { jsPDF } from 'jspdf';

interface AutomationPlanProps {
    plan: Plan | null;
    sources: GroundingSource[];
    isLoading: boolean;
    refs: any;
}

const Card: React.FC<{ 
    title: string; 
    content: string; 
    icon: React.ReactNode; 
    isLoading: boolean;
    idRef: React.RefObject<HTMLDivElement | null>;
}> = ({ title, content, icon, isLoading, idRef }) => {
    return (
        <div ref={idRef} className="bg-gray-800/40 rounded-2xl border border-gray-800 shadow-xl overflow-hidden backdrop-blur-sm">
            <div className="border-b border-gray-800 px-6 py-4 flex items-center justify-between bg-gray-800/20">
                <h3 className="text-lg font-bold flex items-center gap-3 text-white">
                    <span className="text-cyan-500 bg-cyan-500/10 p-2 rounded-lg">{icon}</span>
                    {title}
                </h3>
                {isLoading && <LoadingSpinner />}
            </div>
            <div className="p-8">
                {content ? (
                    <div className="prose prose-invert max-w-none prose-p:text-gray-400 prose-p:leading-relaxed prose-li:text-gray-400 prose-strong:text-cyan-400">
                        {content.split('\n').map((paragraph, index) => {
                            if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                                return <li key={index} className="mb-2 list-none flex gap-2">
                                    <span className="text-cyan-600">•</span> {paragraph.substring(2)}
                                </li>;
                            }
                            if (/^\d+\./.test(paragraph)) {
                                 return <li key={index} className="mb-2 list-none flex gap-2">
                                    <span className="font-bold text-cyan-600">{paragraph.split('.')[0]}.</span> {paragraph.substring(paragraph.indexOf('.')+1)}
                                </li>;
                            }
                            return paragraph.trim() ? <p key={index} className="mb-4">{paragraph}</p> : null;
                        })}
                    </div>
                ) : (
                    <div className="py-12 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                        <p className="text-sm italic">Pendiente de generación...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export const AutomationPlan: React.FC<AutomationPlanProps> = ({ plan, sources, isLoading, refs }) => {
    const handleExportPDF = () => {
        if (!plan) return;
        const doc = new jsPDF();
        let y = 20;
        const leftMargin = 20;
        const pageWidth = doc.internal.pageSize.width;
        const maxLineWidth = pageWidth - (leftMargin * 2);

        doc.setFontSize(22);
        doc.text("Plan de Automatización de Negocios", leftMargin, y);
        y += 15;

        const sections = [plan.analysis, plan.flows, plan.stack, plan.implementation, plan.roi];
        sections.forEach(section => {
            if (!section.title || !section.content) return;
            doc.setFontSize(16);
            doc.setTextColor(0, 100, 160);
            doc.text(section.title, leftMargin, y);
            y += 10;
            doc.setFontSize(11);
            doc.setTextColor(20, 20, 20);
            const lines = doc.splitTextToSize(section.content, maxLineWidth);
            lines.forEach((line: string) => {
                if (y > 280) { doc.addPage(); y = 20; }
                doc.text(line, leftMargin, y);
                y += 6;
            });
            y += 10;
        });

        doc.save("plan_automatizacion.pdf");
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-900/50 p-6 rounded-2xl border border-gray-800 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Resultados de Auditoría</h2>
                    <p className="text-gray-500 text-sm">Visualización en tiempo real de tu estrategia de automatización.</p>
                </div>
                <button 
                    onClick={handleExportPDF}
                    disabled={!plan}
                    className="flex items-center px-5 py-2.5 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all border border-gray-700 shadow-lg text-sm font-semibold"
                >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2 text-cyan-400" />
                    Exportar Reporte
                </button>
            </div>
            
            <Card 
                idRef={refs.analysis}
                title="1. Análisis de Procesos Manuales" 
                content={plan?.analysis.content || ''} 
                icon={<AnalysisIcon />} 
                isLoading={isLoading && !plan}
            />
            
            <Card 
                idRef={refs.flows}
                title="2. Diseño de Flujos de Agentes" 
                content={plan?.flows.content || ''} 
                icon={<FlowIcon />} 
                isLoading={isLoading && !plan}
            />

            <Card 
                idRef={refs.stack}
                title="3. Stack Tecnológico Recomendado" 
                content={plan?.stack.content || ''} 
                icon={<StackIcon />} 
                isLoading={isLoading && !plan}
            />

            <Card 
                idRef={refs.implementation}
                title="4. Implementación Paso a Paso" 
                content={plan?.implementation.content || ''} 
                icon={<RocketIcon />} 
                isLoading={isLoading && !plan}
            />

            <Card 
                idRef={refs.roi}
                title="5. ROI Estimado" 
                content={plan?.roi.content || ''} 
                icon={<StatsIcon />} 
                isLoading={isLoading && !plan}
            />

            <div ref={refs.sources} className="bg-gray-800/40 rounded-2xl border border-gray-800 shadow-xl overflow-hidden backdrop-blur-sm">
                <div className="border-b border-gray-800 px-6 py-4 bg-gray-800/20">
                    <h3 className="text-lg font-bold flex items-center gap-3 text-white">
                        <span className="text-cyan-500 bg-cyan-500/10 p-2 rounded-lg"><SearchIcon /></span>
                        Fuentes de Información
                    </h3>
                </div>
                <div className="p-8">
                    {sources.length > 0 ? (
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sources.map((source, index) => (
                                <li key={index} className="flex">
                                    <a 
                                        href={source.uri} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="flex-1 p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-cyan-500/50 hover:bg-gray-800 transition-all group"
                                    >
                                        <p className="text-cyan-400 font-medium text-sm mb-1 group-hover:underline truncate">{source.title}</p>
                                        <p className="text-gray-500 text-xs truncate">{source.uri}</p>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-gray-600 border-2 border-dashed border-gray-800 rounded-xl">
                            <p className="text-sm italic">Esperando búsqueda externa...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
