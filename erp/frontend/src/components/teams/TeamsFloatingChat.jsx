// src/components/teams/TeamsFloatingChat.jsx
// Floating chat window for quick replies from notifications
import { useState, useEffect, useRef, useCallback } from "react";
import { FaTimes, FaExpand, FaPaperPlane, FaSmile, FaPaperclip, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTeamsNotification } from "../../context/TeamsNotificationContext";
import { useAuth } from "../../context/AuthContext";
import teamsService from "../../services/teamsService";

export default function TeamsFloatingChat() {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const { showFloatingChat, floatingChatData, closeFloatingChat } = useTeamsNotification();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Fetch messages when chat opens
    useEffect(() => {
        if (showFloatingChat && floatingChatData) {
            fetchMessages();
        }
    }, [showFloatingChat, floatingChatData]);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (showFloatingChat) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [showFloatingChat]);

    const fetchMessages = async () => {
        if (!floatingChatData) return;

        setLoading(true);
        try {
            if (floatingChatData.type === "direct") {
                const response = await teamsService.getDirectMessages(floatingChatData.senderId, { limit: 20 });
                setMessages(response.data?.data || []);
            } else if (floatingChatData.type === "channel") {
                const response = await teamsService.getChannelMessages(floatingChatData.teamId, floatingChatData.channelId, { limit: 20 });
                setMessages(response.data?.data || []);
            }
        } catch (error) {
            console.error("Failed to fetch messages:", error);
            setMessages([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        try {
            if (floatingChatData.type === "direct") {
                await teamsService.sendDirectMessage(floatingChatData.senderId, { content: newMessage });
            } else if (floatingChatData.type === "channel") {
                await teamsService.sendChannelMessage(floatingChatData.teamId, floatingChatData.channelId, { content: newMessage });
            }

            // Add message to local state immediately
            setMessages(prev => [...prev, {
                id: Date.now(),
                content: newMessage,
                sender_id: auth?.user?.id,
                sender_name: auth?.user?.name || "You",
                created_at: new Date().toISOString(),
            }]);

            setNewMessage("");
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleExpand = () => {
        navigate("/teams");
        closeFloatingChat();
    };

    if (!showFloatingChat) return null;

    const chatTitle = floatingChatData?.senderName || "Chat";

    return (
        <div className="fixed bottom-4 right-4 z-[9998] w-96 max-w-[calc(100vw-2rem)] animate-slideUp">
            <div className="theme-bg-secondary rounded-xl shadow-2xl overflow-hidden border theme-border-light flex flex-col h-[500px]">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="flex items-center gap-3">
                        {floatingChatData?.senderAvatar ? (
                            <img
                                src={floatingChatData.senderAvatar}
                                alt={chatTitle}
                                className="w-8 h-8 rounded-full object-cover border-2 border-white/30"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                                {chatTitle.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="text-white font-semibold text-sm">{chatTitle}</p>
                            <p className="text-white/70 text-xs">
                                {floatingChatData?.type === "channel" ? "Channel" : "Direct Message"}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExpand}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Open in Teams"
                        >
                            <FaExpand size={14} />
                        </button>
                        <button
                            onClick={closeFloatingChat}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            title="Close"
                        >
                            <FaTimes size={14} />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 theme-bg-primary">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <FaSpinner className="animate-spin text-2xl text-gray-400" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <p className="theme-text-muted text-sm">No messages yet</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isOwn = msg.sender_id === auth?.user?.id;
                            return (
                                <div
                                    key={msg.id}
                                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                                >
                                    <div
                                        className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${isOwn
                                            ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white"
                                            : "theme-bg-secondary theme-text-primary"
                                            }`}
                                    >
                                        {!isOwn && (
                                            <p className="text-xs font-semibold mb-1 text-indigo-400">
                                                {msg.sender_name}
                                            </p>
                                        )}
                                        <p className="break-words">{msg.content}</p>
                                        <p className={`text-[10px] mt-1 ${isOwn ? "text-white/60" : "theme-text-muted"}`}>
                                            {new Date(msg.created_at).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-3 theme-bg-secondary border-t theme-border-light">
                    <div className="flex items-center gap-2">
                        <button className="p-2 theme-text-muted hover:theme-text-primary rounded-lg transition-colors">
                            <FaPaperclip size={16} />
                        </button>
                        <input
                            ref={inputRef}
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-1 px-3 py-2 rounded-lg theme-bg-primary theme-text-primary 
                                       border theme-border-light focus:border-indigo-500 focus:outline-none text-sm"
                        />
                        <button className="p-2 theme-text-muted hover:theme-text-primary rounded-lg transition-colors">
                            <FaSmile size={16} />
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim() || sending}
                            className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white 
                                       rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {sending ? <FaSpinner className="animate-spin" size={16} /> : <FaPaperPlane size={16} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
