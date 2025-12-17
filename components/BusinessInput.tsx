
import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon, LayoutIcon } from './icons';

interface BusinessInputProps {
    onGenerate: (description: string) => void;
    isLoading: boolean;
}

export const BusinessInput: React.FC<BusinessInputProps> = ({ onGenerate, isLoading }) => {
    const [description, setDescription] = useState<string>('Ejemplo: Una empresa de reformas de viviendas que gestiona proyectos desde el presupuesto inicial hasta la entrega final. Los procesos manuales incluyen la captación de clientes, la creación de presupuestos, la planificación de proyectos, la comunicación con los clientes y la facturación.');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(description);
    };

    return (
        <section className="bg-gray-800/40 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden backdrop-blur-sm">
            <div className="border-b border-gray-800 px-6 py-4 bg-gray-800/20">
                <h3 className="text-lg font-bold flex items-center gap-3 text-white">
                    <span className="text-cyan-500 bg-cyan-500/10 p-2 rounded-lg"><LayoutIcon className="w-5 h-5" /></span>
                    Describe tu Negocio
                </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8">
                <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    Nuestra IA analizará tu modelo operativo para identificar ineficiencias y diseñar una infraestructura de agentes autónomos a medida.
                </p>
                <textarea
                    id="business-description"
                    className="w-full h-44 bg-gray-950/50 border border-gray-800 rounded-xl p-5 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 transition-all duration-300 resize-none text-gray-200 placeholder-gray-600 outline-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe los procesos críticos de tu empresa..."
                    disabled={isLoading}
                />
                <div className="mt-6 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group flex items-center justify-center px-8 py-3.5 bg-cyan-600 text-white font-bold rounded-xl hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-gray-700 border border-cyan-500/50 transition-all duration-300 shadow-[0_0_20px_rgba(8,145,178,0.2)] hover:shadow-[0_0_25px_rgba(8,145,178,0.4)]"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                <span className="animate-pulse">Analizando...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                                Generar Arquitectura
                            </>
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
};
