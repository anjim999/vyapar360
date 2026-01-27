// src/components/bot/BotChatWidget.jsx - AI Bot Floating Chat Widget
import { useState, useRef, useEffect, useCallback } from 'react';
import { FaRobot, FaTimes, FaPaperPlane, FaLightbulb, FaTrash } from 'react-icons/fa';
import api from '../../api/axiosClient';

/**
 * Simple markdown renderer for bot messages
 * Handles: **bold**, *italic*, `code`, bullet points, and line breaks
 */
function renderMarkdown(text) {
    if (!text) return null;

    // Split by lines to handle bullet points
    const lines = text.split('\n');

    return lines.map((line, lineIndex) => {
        // Check if line is a bullet point
        const bulletMatch = line.match(/^(\s*)([*-])\s+(.+)$/);
        const isBullet = bulletMatch !== null;
        const content = isBullet ? bulletMatch[3] : line;

        // Process inline formatting
        const formattedContent = processInlineFormatting(content);

        if (isBullet) {
            return (
                <div key={lineIndex} className="flex items-start gap-2 ml-2 my-0.5">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{formattedContent}</span>
                </div>
            );
        }

        // Empty line = spacing
        if (!line.trim()) {
            return <div key={lineIndex} className="h-2" />;
        }

        return (
            <div key={lineIndex}>
                {formattedContent}
            </div>
        );
    });
}

/**
 * Process inline markdown formatting
 */
function processInlineFormatting(text) {
    if (!text) return text;

    // Split text and process markdown patterns
    const parts = [];
    let remaining = text;
    let keyIndex = 0;

    while (remaining.length > 0) {
        // Bold: **text**
        const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
        // Italic: *text* (but not **)
        const italicMatch = remaining.match(/(?<!\*)\*([^*]+)\*(?!\*)/);
        // Code: `text`
        const codeMatch = remaining.match(/`([^`]+)`/);

        // Find earliest match
        let earliestMatch = null;
        let earliestIndex = remaining.length;
        let matchType = null;

        if (boldMatch && boldMatch.index < earliestIndex) {
            earliestMatch = boldMatch;
            earliestIndex = boldMatch.index;
            matchType = 'bold';
        }
        if (italicMatch && italicMatch.index < earliestIndex) {
            earliestMatch = italicMatch;
            earliestIndex = italicMatch.index;
            matchType = 'italic';
        }
        if (codeMatch && codeMatch.index < earliestIndex) {
            earliestMatch = codeMatch;
            earliestIndex = codeMatch.index;
            matchType = 'code';
        }

        if (!earliestMatch) {
            // No more matches, add remaining text
            parts.push(remaining);
            break;
        }

        // Add text before match
        if (earliestIndex > 0) {
            parts.push(remaining.slice(0, earliestIndex));
        }

        // Add formatted element
        const matchedText = earliestMatch[1];
        if (matchType === 'bold') {
            parts.push(<strong key={keyIndex++} className="font-semibold">{matchedText}</strong>);
        } else if (matchType === 'italic') {
            parts.push(<em key={keyIndex++}>{matchedText}</em>);
        } else if (matchType === 'code') {
            parts.push(
                <code key={keyIndex++} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs font-mono">
                    {matchedText}
                </code>
            );
        }

        // Continue with remaining text
        remaining = remaining.slice(earliestIndex + earliestMatch[0].length);
    }

    return parts.length > 0 ? parts : text;
}

export default function BotChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [hasMore, setHasMore] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const messagesEndRef = useRef(null);
    const messagesContainerRef = useRef(null);
    const inputRef = useRef(null);

    const defaultWelcome = {
        role: 'bot',
        content: "👋 Hi! I'm Vyapar360 Assistant. How can I help you today?",
        suggestions: ["Show sales summary", "Today's attendance", "What can you do?"]
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Load initial chat history when widget opens
    const loadHistory = useCallback(async () => {
        if (historyLoaded) return;

        setHistoryLoading(true);
        try {
            const res = await api.get('/api/bot/history?limit=50');
            if (res.data.success && res.data.history.length > 0) {
                const formattedHistory = res.data.history.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.dataInsight
                        ? `${msg.content}\n\n📊 **Live Data:**\n${msg.dataInsight}`
                        : msg.content,
                    suggestions: msg.suggestions || [],
                    timestamp: msg.timestamp
                }));
                setMessages(formattedHistory);
                setHasMore(res.data.hasMore || false);
            } else {
                // No history, show welcome message
                setMessages([defaultWelcome]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load history:', error);
            setMessages([defaultWelcome]);
            setHasMore(false);
        } finally {
            setHistoryLoading(false);
        }
        setHistoryLoaded(true);
    }, [historyLoaded]);

    // Load older messages on scroll up (infinite scroll)
    const loadOlderMessages = useCallback(async () => {
        if (loadingMore || !hasMore || messages.length === 0) return;

        // Get the oldest message timestamp
        const oldestMessage = messages.find(m => m.timestamp);
        if (!oldestMessage?.timestamp) return;

        setLoadingMore(true);
        const container = messagesContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;

        try {
            const res = await api.get(`/api/bot/history?limit=50&before=${oldestMessage.timestamp}`);
            if (res.data.success && res.data.history.length > 0) {
                const formattedHistory = res.data.history.map(msg => ({
                    id: msg.id,
                    role: msg.role,
                    content: msg.dataInsight
                        ? `${msg.content}\n\n📊 **Live Data:**\n${msg.dataInsight}`
                        : msg.content,
                    suggestions: msg.suggestions || [],
                    timestamp: msg.timestamp
                }));
                // Prepend older messages
                setMessages(prev => [...formattedHistory, ...prev]);
                setHasMore(res.data.hasMore || false);

                // Maintain scroll position after prepending
                requestAnimationFrame(() => {
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop = newScrollHeight - previousScrollHeight;
                    }
                });
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error('Failed to load older messages:', error);
        } finally {
            setLoadingMore(false);
        }
    }, [loadingMore, hasMore, messages]);

    // Handle scroll for infinite scroll up
    const handleScroll = useCallback((e) => {
        const { scrollTop } = e.target;
        // Trigger load when scrolled near top (within 50px)
        if (scrollTop < 50 && hasMore && !loadingMore) {
            loadOlderMessages();
        }
    }, [hasMore, loadingMore, loadOlderMessages]);

    // Clear history
    const clearHistory = async () => {
        try {
            await api.delete('/api/bot/history');
            setMessages([defaultWelcome]);
            setHasMore(false);
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }, [isOpen, loadHistory]);


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
                            onClick={clearHistory}
                            className="text-white/70 hover:text-white p-1 mr-1"
                            title="Clear chat history"
                        >
                            <FaTrash className="text-sm" />
                        </button>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/70 hover:text-white p-1"
                        >
                            <FaTimes />
                        </button>
                    </div>

                    {/* Messages */}
                    <div 
                        ref={messagesContainerRef}
                        onScroll={handleScroll}
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                    >
                        {/* Initial History Loading */}
                        {historyLoading && (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                                    <FaRobot className="text-white text-xl" />
                                </div>
                                <p className="text-sm theme-text-secondary">Loading chat history...</p>
                            </div>
                        )}

                        {/* Load More Indicator (at top for infinite scroll) */}
                        {!historyLoading && loadingMore && (
                            <div className="flex justify-center py-2">
                                <div className="flex gap-1 items-center text-xs theme-text-secondary">
                                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <span>Loading older messages...</span>
                                </div>
                            </div>
                        )}

                        {/* Has More Indicator */}
                        {!historyLoading && !loadingMore && hasMore && (
                            <div className="flex justify-center py-2">
                                <span className="text-xs theme-text-secondary">↑ Scroll up to load more</span>
                            </div>
                        )}

                        {!historyLoading && messages.map((msg, i) => (
                            <div key={msg.id || i}>
                                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${msg.role === 'user'
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-sm'
                                        : 'theme-bg-tertiary theme-text-primary rounded-bl-sm'
                                        }`}>
                                        <div className="text-sm">{renderMarkdown(msg.content)}</div>
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

                        {/* Typing/Loading indicator */}
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
