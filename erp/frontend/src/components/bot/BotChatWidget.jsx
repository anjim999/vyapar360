// src/components/bot/BotChatWidget.jsx - AI Bot Floating Chat Widget
import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaLightbulb } from 'react-icons/fa';
import api from '../../api/axiosClient';

export default function BotChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: 'bot',
            content: "👋 Hi! I'm Vyapar360 Assistant. How can I help you today?",
            suggestions: ["Show sales summary", "Today's attendance", "What can you do?"]
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    const sendMessage = async (text = input) => {
        if (!text.trim() || loading) return;

        const userMessage = text.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const res = await api.post('/api/bot/chat', {
                message: userMessage,
                context: { currentPage: window.location.pathname }
            });

            let botResponse = res.data.response;

            // Append data insight if available
            if (res.data.dataInsight) {
                botResponse += `\n\n📊 **Live Data:**\n${res.data.dataInsight}`;
            }

            setMessages(prev => [...prev, {
                role: 'bot',
                content: botResponse,
                suggestions: res.data.suggestions || []
            }]);
        } catch (error) {
            console.error('Bot error:', error);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: "Sorry, I couldn't process that request. Please try again."
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-50 transition-all duration-300 ${isOpen
                        ? 'bg-red-500 hover:bg-red-600 rotate-90'
                        : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 animate-pulse'
                    }`}
            >
                {isOpen ? (
                    <FaTimes className="text-white text-xl" />
                ) : (
                    <FaRobot className="text-white text-2xl" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-96 h-[500px] theme-bg-secondary rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border theme-border-light animate-scale-in">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <FaRobot className="text-white text-lg" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-white font-semibold">Vyapar360 Assistant</h3>
                            <p className="text-white/70 text-xs">AI-powered help</p>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white p-1"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, i) => (
                            <div key={i}>
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                                            : 'theme-bg-tertiary theme-text-primary rounded-bl-sm'
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>

                                {/* Suggestions */}
                                {msg.role === 'bot' && msg.suggestions?.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 ml-2">
                                        {msg.suggestions.map((s, j) => (
                                            <button
                                                key={j}
                                                onClick={() => handleSuggestionClick(s)}
                                                className="text-xs px-3 py-1.5 rounded-full border theme-border-light theme-text-secondary hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 transition-colors flex items-center gap-1"
                                            >
                                                <FaLightbulb className="text-yellow-500 w-3 h-3" />
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="theme-bg-tertiary rounded-2xl px-4 py-3 rounded-bl-sm">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t theme-border-light">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask me anything..."
                                className="flex-1 px-4 py-2 rounded-full theme-bg-tertiary theme-text-primary border theme-border-light focus:border-blue-500 focus:outline-none text-sm"
                                disabled={loading}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
                            >
                                <FaPaperPlane className="text-sm" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
