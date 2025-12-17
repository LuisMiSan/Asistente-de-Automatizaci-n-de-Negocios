
import React, { useState } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { SparklesIcon } from './icons';

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
        <section className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
            <form onSubmit={handleSubmit}>
                <label htmlFor="business-description" className="block text-lg font-semibold mb-2 text-cyan-300">
                    Describe tu Negocio
                </label>
                <p className="text-gray-400 mb-4 text-sm">
                    Proporciona una descripción detallada de tu negocio y los procesos que te gustaría automatizar. Cuanto más detalle, mejor será el plan.
                </p>
                <textarea
                    id="business-description"
                    className="w-full h-40 bg-gray-900/50 border border-gray-600 rounded-lg p-4 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 resize-none text-gray-200"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ej. Una tienda de e-commerce que vende artesanías..."
                    disabled={isLoading}
                />
                <div className="mt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center px-6 py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-md"
                    >
                        {isLoading ? (
                            <>
                                <LoadingSpinner />
                                Generando...
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5 mr-2" />
                                Generar Plan de Automatización
                            </>
                        )}
                    </button>
                </div>
            </form>
        </section>
    );
};
