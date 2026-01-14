
import React, { useRef } from 'react';
import { 
    LayoutIcon, 
    AnalysisIcon, 
    FlowIcon, 
    StackIcon, 
    RocketIcon, 
    StatsIcon, 
    SearchIcon,
    SparklesIcon,
    HistoryIcon,
    UploadIcon,
    TrashIcon,
    DownloadIcon
} from './icons';
import type { SavedPlan } from '../types';

interface AdminPanelProps {
    isOpen: boolean;
    onNavigate: (sectionId: any) => void;
    hasPlan: boolean;
    history: SavedPlan[];
    onLoadPlan: (plan: SavedPlan) => void;
    onNewAudit: () => void;
    onImportProject: (file: File) => void;
    onDeleteProject: (id: string) => void;
    currentProjectId: string | null;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    isOpen, 
    onNavigate, 
    hasPlan, 
    history, 
    onLoadPlan, 
    onNewAudit,
    onImportProject,
    onDeleteProject,
    currentProjectId
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const navItems = [
        { id: 'input', label: 'Describe tu Negocio', icon: <LayoutIcon /> },
        { id: 'analysis', label: 'Análisis de Procesos', icon: <AnalysisIcon /> },
        { id: 'flows', label: 'Diseño de Flujos', icon: <FlowIcon /> },
        { id: 'stack', label: 'Stack Tecnológico', icon: <StackIcon /> },
        { id: 'implementation', label: 'Implementación', icon: <RocketIcon /> },
        { id: 'roi', label: 'ROI Estimado', icon: <StatsIcon /> },
        { id: 'sources', label: 'Fuentes de Datos', icon: <SearchIcon /> },
    ];

    const formatDate = (timestamp: number) => {
        return new Intl.DateTimeFormat('es-ES', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
        }).format(new Date(timestamp));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onImportProject(e.target.files[0]);
            e.target.value = '';
        }
    };

    const handleDownload = (e: React.MouseEvent, plan: SavedPlan) => {
        e.stopPropagation();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `${plan.name.replace(/\s+/g, '_')}_${plan.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <aside 
            className={`bg-gray-900 border-r border-gray-800 transition-all duration-300 ease-in-out flex-shrink-0 z-20 overflow-hidden flex flex-col ${
                isOpen ? 'w-64' : 'w-0'
            }`}
        >
            <div className="w-64 p-6 flex flex-col h-full overflow-hidden">
                <div className="mb-6">
                    <button
                        onClick={onNewAudit}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600/10 hover:bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-bold transition-all mb-6 group"
                    >
                        <SparklesIcon className="w-4 h-4 group-hover:rotate-12" />
                        Nueva Auditoría
                    </button>

                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Navegación</h2>
                    <nav className="space-y-1">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50 transition-all group"
                            >
                                <span className="text-gray-500 group-hover:text-cyan-400 transition-colors">
                                    {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
                                </span>
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col border-t border-gray-800 pt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <HistoryIcon className="w-3 h-3" />
                            Base de Datos
                        </h2>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-cyan-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
                            title="Importar Proyecto (JSON)"
                        >
                            <UploadIcon className="w-4 h-4" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".json" 
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                        {history.length > 0 ? (
                            history.map((item) => (
                                <div
                                    key={item.id}
                                    className={`w-full p-3 rounded-xl border transition-all group relative ${
                                        currentProjectId === item.id 
                                        ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.1)]' 
                                        : 'bg-gray-800/30 border-gray-800 hover:border-gray-700 hover:bg-gray-800/50'
                                    }`}
                                >
                                    <button 
                                        onClick={() => onLoadPlan(item)}
                                        className="text-left w-full"
                                    >
                                        <div className="text-[10px] text-gray-500 mb-1 font-mono uppercase tracking-tighter flex justify-between">
                                            <span>{formatDate(item.timestamp)}</span>
                                            {currentProjectId === item.id && <span className="text-cyan-400 font-bold">ACTIVO</span>}
                                        </div>
                                        <div className={`text-xs font-medium line-clamp-2 leading-relaxed transition-colors pr-8 ${
                                            currentProjectId === item.id ? 'text-cyan-300' : 'text-gray-300 group-hover:text-cyan-400'
                                        }`}>
                                            {item.name || item.businessDescription}
                                        </div>
                                    </button>
                                    
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDeleteProject(item.id); }}
                                            className="text-red-400 hover:text-red-300 p-1 hover:bg-red-900/30 rounded"
                                            title="Eliminar"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                         <button 
                                            onClick={(e) => handleDownload(e, item)}
                                            className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded"
                                            title="Descargar JSON"
                                        >
                                            <DownloadIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-[11px] text-gray-600 italic py-4 text-center border-2 border-dashed border-gray-800 rounded-xl">
                                Base de datos vacía
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6">
                    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
                        <div className="text-xs text-gray-500 mb-2">Estado del Plan</div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${hasPlan ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                            <span className="text-xs font-medium">{hasPlan ? (currentProjectId ? 'Guardado' : 'Borrador') : 'Inactivo'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};
