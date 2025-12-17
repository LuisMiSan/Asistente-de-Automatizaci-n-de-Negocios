
import React from 'react';
import { 
    LayoutIcon, 
    AnalysisIcon, 
    FlowIcon, 
    StackIcon, 
    RocketIcon, 
    StatsIcon, 
    SearchIcon 
} from './icons';

interface AdminPanelProps {
    isOpen: boolean;
    onNavigate: (sectionId: any) => void;
    hasPlan: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ isOpen, onNavigate, hasPlan }) => {
    const navItems = [
        { id: 'input', label: 'Describe tu Negocio', icon: <LayoutIcon /> },
        { id: 'analysis', label: 'Análisis de Procesos', icon: <AnalysisIcon /> },
        { id: 'flows', label: 'Diseño de Flujos', icon: <FlowIcon /> },
        { id: 'stack', label: 'Stack Tecnológico', icon: <StackIcon /> },
        { id: 'implementation', label: 'Implementación', icon: <RocketIcon /> },
        { id: 'roi', label: 'ROI Estimado', icon: <StatsIcon /> },
        { id: 'sources', label: 'Fuentes de Datos', icon: <SearchIcon /> },
    ];

    return (
        <aside 
            className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out flex-shrink-0 z-20 overflow-hidden ${
                isOpen ? 'w-64' : 'w-0'
            }`}
        >
            <div className="w-64 p-6 flex flex-col h-full">
                <div className="mb-8">
                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Navegación del Plan</h2>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 transition-all group"
                            >
                                <span className="text-gray-500 group-hover:text-cyan-400 transition-colors">
                                    {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="text-xs text-gray-500 mb-2">Estado del Plan</div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${hasPlan ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="text-xs font-medium">{hasPlan ? 'Completado' : 'Esperando Entrada'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
