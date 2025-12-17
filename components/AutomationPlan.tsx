import React from 'react';
import type { Plan, GroundingSource } from '../types';
import { LoadingSpinner } from './LoadingSpinner';
import { CheckCircleIcon, CodeBracketIcon, ArrowPathIcon, ChartBarIcon, CurrencyDollarIcon, LinkIcon, DocumentArrowDownIcon } from './icons';
import { jsPDF } from 'jspdf';

interface AutomationPlanProps {
    plan: Plan | null;
    sources: GroundingSource[];
    isLoading: boolean;
}

const Section: React.FC<{ title: string; content: string; icon: React.ReactNode }> = ({ title, content, icon }) => {
    if (!content) return null;
    return (
        <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4 flex items-center text-cyan-300">
                {icon}
                {title}
            </h3>
            <div className="prose prose-invert prose-p:text-gray-300 prose-ul:text-gray-300 prose-li:marker:text-cyan-400">
                {content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('- ') || paragraph.startsWith('* ')) {
                        return <li key={index} className="ml-4 list-disc">{paragraph.substring(2)}</li>;
                    }
                    if (/^\d+\./.test(paragraph)) {
                         return <li key={index} className="ml-4 list-decimal">{paragraph.substring(paragraph.indexOf('.')+1)}</li>;
                    }
                    return <p key={index}>{paragraph}</p>;
                })}
            </div>
        </div>
    );
};

export const AutomationPlan: React.FC<AutomationPlanProps> = ({ plan, sources, isLoading }) => {
    const handleExportPDF = () => {
        if (!plan) return;

        const doc = new jsPDF();
        let y = 20;
        const leftMargin = 20;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const maxLineWidth = pageWidth - (leftMargin * 2);

        // Helper to check page break
        const checkPageBreak = (heightNeeded: number) => {
            if (y + heightNeeded > pageHeight - 20) {
                doc.addPage();
                y = 20;
            }
        };

        // Title
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0); // Black for print
        doc.text("Plan de Automatización de Negocios", leftMargin, y);
        y += 15;

        const sections = [plan.analysis, plan.flows, plan.stack, plan.implementation, plan.roi];

        sections.forEach(section => {
            if (!section.title || !section.content) return;

            checkPageBreak(30);

            // Section Title
            doc.setFontSize(16);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 100, 160); // Dark Cyan
            doc.text(section.title, leftMargin, y);
            y += 10;

            // Content
            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(20, 20, 20); // Dark Gray

            // Split text to lines
            const lines = doc.splitTextToSize(section.content, maxLineWidth);
            
            lines.forEach((line: string) => {
                checkPageBreak(7);
                doc.text(line, leftMargin, y);
                y += 6;
            });
            y += 10; // Spacing after section
        });

        // Sources
        if (sources.length > 0) {
            checkPageBreak(40);
            doc.setFontSize(14);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 100, 160);
            doc.text("Fuentes de Información", leftMargin, y);
            y += 10;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(0, 0, 255); // Blue for links

            sources.forEach(src => {
                const text = src.title || src.uri;
                const linkLines = doc.splitTextToSize(text, maxLineWidth);
                
                linkLines.forEach((line: string) => {
                    checkPageBreak(7);
                    doc.textWithLink(line, leftMargin, y, { url: src.uri });
                    y += 6;
                });
                y += 4;
            });
        }

        doc.save("plan_automatizacion.pdf");
    };

    if (isLoading) {
        return (
            <div className="mt-8 flex flex-col items-center justify-center bg-gray-800 p-8 rounded-xl border border-gray-700 min-h-[300px]">
                <LoadingSpinner />
                <p className="mt-4 text-lg font-semibold text-gray-300">Analizando tu negocio y generando el plan...</p>
                <p className="text-gray-400">El modo de pensamiento de Gemini Pro está trabajando en tu consulta compleja.</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="mt-8 text-center text-gray-500 bg-gray-800/30 p-8 rounded-xl border border-dashed border-gray-700">
                <p>El plan de automatización aparecerá aquí una vez generado.</p>
            </div>
        );
    }
    
    const icons = [
        <CheckCircleIcon className="w-6 h-6 mr-3" />,
        <ArrowPathIcon className="w-6 h-6 mr-3" />,
        <CodeBracketIcon className="w-6 h-6 mr-3" />,
        <ChartBarIcon className="w-6 h-6 mr-3" />,
        <CurrencyDollarIcon className="w-6 h-6 mr-3" />,
    ];

    const planSections = [plan.analysis, plan.flows, plan.stack, plan.implementation, plan.roi];

    return (
        <div className="mt-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-center md:text-left mb-4 md:mb-0">Tu Plan de Automatización</h2>
                <button 
                    onClick={handleExportPDF}
                    className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors border border-gray-600 shadow-sm"
                >
                    <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                    Exportar a PDF
                </button>
            </div>
            
            {planSections.map((section, index) => (
                section.title && section.content && <Section key={index} title={section.title} content={section.content} icon={icons[index]} />
            ))}
            {sources.length > 0 && (
                 <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-xl font-semibold mb-4 flex items-center text-cyan-300">
                        <LinkIcon className="w-6 h-6 mr-3" />
                        Fuentes de Información (Google Search Grounding)
                    </h3>
                    <ul className="space-y-2">
                        {sources.map((source, index) => (
                            <li key={index}>
                                <a 
                                    href={source.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-cyan-400 hover:text-cyan-300 hover:underline break-all"
                                >
                                    {source.title || source.uri}
                                </a>
                            </li>
                        ))}
                    </ul>
                 </div>
            )}
        </div>
    );
};