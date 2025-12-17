
import React from 'react';
import { BotIcon, SettingsIcon } from './icons';

interface HeaderProps {
    onToggleAdmin: () => void;
    isAdminOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onToggleAdmin, isAdminOpen }) => {
    return (
        <header className="bg-gray-900 border-b border-gray-800 h-16 flex items-center px-4 md:px-8 justify-between sticky top-0 z-30 backdrop-blur-xl bg-opacity-80">
            <div className="flex items-center gap-3">
                <div className="bg-cyan-600/20 p-2 rounded-lg">
                    <BotIcon className="w-6 h-6 text-cyan-400" />
                </div>
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Automation Intelligence <span className="hidden sm:inline">Hub</span>
                </h1>
            </div>
            
            <button 
                onClick={onToggleAdmin}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all border ${
                    isAdminOpen 
                    ? 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400' 
                    : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
            >
                <SettingsIcon className="w-5 h-5" />
                <span className="font-medium">Admin Panel</span>
            </button>
        </header>
    );
};
