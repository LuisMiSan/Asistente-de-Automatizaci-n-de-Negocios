
import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { chatWithBot } from '../services/geminiService';
import { ChatBubbleIcon, CloseIcon, SendIcon, BotIcon } from './icons';
import { LoadingSpinner } from './LoadingSpinner';

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', content: '¡Hola! Soy tu asistente de IA. ¿Cómo puedo ayudarte hoy?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const botResponse = await chatWithBot(messages, input);
            const modelMessage: ChatMessage = { role: 'model', content: botResponse };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', content: 'Lo siento, ocurrió un error. Por favor intenta de nuevo.' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    }


    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-16 h-16 rounded-full bg-cyan-600 text-white shadow-lg hover:bg-cyan-500 transition-all transform hover:scale-110 flex items-center justify-center z-50 ${isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'}`}
                aria-label="Abrir chat"
            >
                <ChatBubbleIcon className="w-8 h-8" />
            </button>

            <div className={`fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-sm h-[70vh] max-h-[600px] bg-gray-800 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 border border-gray-700 ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
                <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/70 backdrop-blur-sm rounded-t-2xl">
                    <h3 className="font-bold text-lg">Asistente IA</h3>
                    <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                           {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white" /></div>}
                           <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === 'user' ? 'bg-cyan-700 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
                                <p className="text-sm">{msg.content}</p>
                           </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-end gap-2 justify-start">
                             <div className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0"><BotIcon className="w-5 h-5 text-white" /></div>
                             <div className="max-w-[80%] rounded-2xl px-4 py-2 bg-gray-700 text-gray-200 rounded-bl-none">
                                <LoadingSpinner />
                             </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                
                <footer className="p-4 border-t border-gray-700">
                    <div className="flex items-center bg-gray-900 rounded-full">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 bg-transparent px-4 py-2 text-white placeholder-gray-500 focus:outline-none"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-2 text-cyan-400 hover:text-cyan-300 disabled:text-gray-600 disabled:cursor-not-allowed m-1">
                            <SendIcon className="w-6 h-6"/>
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
};
