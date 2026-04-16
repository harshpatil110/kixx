import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function ChatbotWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'bot', content: "Welcome to KIXX, How may I assist you today?" }
    ]);
    const [input, setInput] = useState('');
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Append user message
        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simple dummy bot response
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'bot', 
                content: "Thank you for reaching out. A KIXX specialist will review your inquiry shortly. Feel free to browse our FAQ for immediate answers." 
            }]);
        }, 800);
    };

    return (
        <div className="fixed bottom-8 right-8 z-[1000] font-sans">
            {/* Chat Window Panel */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 h-[480px] bg-white border border-stone-200 shadow-2xl flex flex-col rounded-md overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    
                    {/* Header */}
                    <div className="bg-stone-900 text-white px-5 py-4 flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-400 leading-none mb-1">KIXX Support</p>
                            <p className="text-sm font-black tracking-tight uppercase leading-none">AI ARCHIVE ASSISTANT</p>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-stone-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div 
                        className="flex-grow p-5 space-y-4 overflow-y-auto bg-[#FBFBFA]"
                        ref={scrollRef}
                    >
                        {messages.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div 
                                    className={`max-w-[85%] px-4 py-3 text-sm font-medium leading-relaxed
                                        ${msg.role === 'user' 
                                            ? 'bg-stone-900 text-white rounded-l-lg rounded-tr-lg ml-auto' 
                                            : 'bg-white border border-stone-200 text-stone-900 rounded-r-lg rounded-tl-lg shadow-sm'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <form 
                        onSubmit={handleSend}
                        className="p-4 border-t border-stone-200 bg-white flex items-center gap-2"
                    >
                        <input 
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type an inquiry..."
                            className="flex-grow bg-stone-50 border border-stone-200 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-900 transition-colors rounded-sm text-stone-900 placeholder:text-stone-300"
                        />
                        <button 
                            type="submit"
                            className="bg-stone-900 text-white p-2.5 rounded-sm hover:bg-[#800000] transition-colors flex-shrink-0"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            )}

            {/* Floating Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 z-50
                    ${isOpen ? 'bg-[#800000] text-white rotate-90' : 'bg-stone-900 text-white'}`}
            >
                {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
            </button>
        </div>
    );
}
