import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { SendHorizontal, User, BrainCircuit } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const ChatInterface: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const allMessages = [...messages, userMessage];
            const response = await axios.post<{ response: string }>('http://localhost:8000/chat', {
                messages: userMessage.content,
                history: allMessages.map(msg => ({
                    role: msg.role,
                    content: msg.content
                }))
            });

            const botMessage: Message = {
                role: 'assistant',
                content: response.data.response
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (error: any) {
            console.error('Chat error:', error);
            const detail = error.response?.data?.detail || error.message || 'Unknown error';
            const errorMessage: Message = {
                role: 'assistant',
                content: `**Error**: ${detail}`
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex-1 h-screen flex flex-col bg-white dark:bg-[#191919] transition-colors duration-200">
            {/* Header */}
            <div className="h-12 border-b border-[#E9E9E7] dark:border-[#2F2F2F] flex items-center px-4 sticky top-0 bg-white/80 dark:bg-[#191919]/80 backdrop-blur-sm z-10 transition-colors duration-200">
                <div className="flex items-center gap-2 text-sm">
                    <span className="text-[#37352F] dark:text-[#D4D4D4]">Agent</span>
                    <span className="text-[#9B9A97]">/</span>
                    <span className="text-[#37352F] dark:text-[#D4D4D4] font-medium">Chat</span>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:px-32">
                <div className="max-w-3xl mx-auto space-y-8 pb-4">

                    {messages.length === 0 ? (
                        /* Introductory Empty State */
                        <div className="flex flex-col items-center justify-center mt-20 text-center opacity-50">
                            <BrainCircuit size={48} className="mb-4 text-gray-300 dark:text-[#444]" />
                            <h3 className="text-lg font-medium text-[#37352F] dark:text-[#D4D4D4]">How can I help you today?</h3>
                            <p className="text-sm text-[#9B9A97]">Check your calendar, add notes, or check the weather.</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className="flex gap-4 group">
                                <div className={`w-8 h-8 rounded flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-[#9B9A97]' : 'bg-transparent text-[#37352F] dark:text-[#D4D4D4]'}`}>
                                    {msg.role === 'user' ? <User size={16} className="text-white" /> : <BrainCircuit size={20} />}
                                </div>
                                <div className="flex-1 space-y-2 overflow-hidden">
                                    <div className="font-medium text-sm text-[#37352F] dark:text-[#D4D4D4]">
                                        {msg.role === 'user' ? 'You' : 'Agent'}
                                    </div>
                                    <div className="text-[#37352F] dark:text-[#D4D4D4] text-sm leading-6 prose prose-sm max-w-none dark:prose-invert">
                                        <ReactMarkdown>{typeof msg.content === 'string' ? msg.content : String(msg.content)}</ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}

                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 flex items-center justify-center">
                                <BrainCircuit size={20} className="text-[#37352F] dark:text-[#D4D4D4] animate-pulse" />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="font-medium text-sm text-[#37352F] dark:text-[#D4D4D4]">Agent</div>
                                <div className="flex items-center gap-1 h-6">
                                    <div className="w-2 h-2 bg-[#E9E9E7] dark:bg-[#333] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-[#E9E9E7] dark:bg-[#333] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-[#E9E9E7] dark:bg-[#333] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 md:px-32 pb-8">
                <div className="max-w-3xl mx-auto relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        placeholder="Type a message..."
                        className="w-full bg-white dark:bg-[#202020] border border-[#E9E9E7] dark:border-[#2F2F2F] rounded-lg px-4 py-3 pr-12 text-[#37352F] dark:text-[#D4D4D4] placeholder-[#9B9A97] focus:outline-none focus:ring-1 focus:ring-[#E9E9E7] dark:focus:ring-[#333] shadow-sm transition-shadow hover:shadow-md disabled:bg-[#F7F7F5] dark:disabled:bg-[#191919] disabled:cursor-not-allowed"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#9B9A97] hover:text-[#37352F] dark:hover:text-[#D4D4D4] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <SendHorizontal size={18} />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <span className="text-[10px] text-[#9B9A97]">AI can make mistakes. Please verify important information.</span>
                </div>
            </div>
        </div>
    );
};
