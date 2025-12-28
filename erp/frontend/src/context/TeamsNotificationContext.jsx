// src/context/TeamsNotificationContext.jsx
// Global context for Teams chat notifications - works across all pages
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { TEAMS_SOCKET_URL } from "../config/env";

const TeamsNotificationContext = createContext(null);

// Notification sound (base64 encoded short beep)
const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQUqn+fxvo5PHiyQ4/LRWTQZP4rn/5JtNhc+guz/lGkyFD9+8P+Xayki";

export function TeamsNotificationProvider({ children }) {
    const { auth } = useAuth();
    const location = useLocation();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState(null);
    const [showFloatingChat, setShowFloatingChat] = useState(false);
    const [floatingChatData, setFloatingChatData] = useState(null);
    const [notificationPermission, setNotificationPermission] = useState("default");
    const [soundEnabled, setSoundEnabled] = useState(true);
    const socketRef = useRef(null);
    const audioRef = useRef(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio(NOTIFICATION_SOUND);
        audioRef.current.volume = 0.5;
    }, []);

    // Request notification permission on mount
    useEffect(() => {
        if ("Notification" in window) {
            setNotificationPermission(Notification.permission);
            if (Notification.permission === "default") {
                Notification.requestPermission().then((permission) => {
                    setNotificationPermission(permission);
                });
            }
        }
    }, []);

    // Play notification sound
    const playSound = useCallback(() => {
        if (soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {
                // Ignore autoplay errors
            });
        }
    }, [soundEnabled]);

    // Show desktop notification
    const showDesktopNotification = useCallback((title, body, data) => {
        if (notificationPermission === "granted" && document.hidden) {
            const notification = new Notification(title, {
                body: body,
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                tag: `teams-${data?.senderId || Date.now()}`,
                requireInteraction: false,
                silent: true, // We play our own sound
            });

            notification.onclick = () => {
                window.focus();
                // Open floating chat with this conversation
                setFloatingChatData(data);
                setShowFloatingChat(true);
                notification.close();
            };

            // Auto close after 5 seconds
            setTimeout(() => notification.close(), 5000);
        }
    }, [notificationPermission]);

    // Handle incoming channel message
    const handleChannelMessage = useCallback((data) => {
        const { channelId, message } = data;

        // Don't notify for own messages
        if (message.sender_id === auth?.user?.id) return;

        // Don't notify or increment if on Teams page (handled by page UI)
        if (location.pathname.startsWith("/teams")) return;

        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Store last message for toast
        setLastMessage({
            type: "channel",
            channelId,
            message,
            timestamp: Date.now(),
        });

        // Play sound
        playSound();

        // Show desktop notification
        showDesktopNotification(
            message.sender_name || "New Message",
            message.content?.substring(0, 100) || "Sent an attachment",
            {
                type: "channel",
                channelId,
                senderId: message.sender_id,
                senderName: message.sender_name,
                senderAvatar: message.sender_avatar,
            }
        );
    }, [auth?.user?.id, location.pathname, playSound, showDesktopNotification]);

    // Handle incoming direct message
    const handleDirectMessage = useCallback((message) => {
        // Don't notify for own messages
        if (message.sender_id === auth?.user?.id) return;

        // Don't notify or increment if on Teams page (handled by page UI)
        if (location.pathname.startsWith("/teams")) return;

        // Increment unread count
        setUnreadCount((prev) => prev + 1);

        // Store last message for toast
        setLastMessage({
            type: "direct",
            message,
            timestamp: Date.now(),
        });

        // Play sound
        playSound();

        // Show desktop notification
        showDesktopNotification(
            message.sender_name || "New Message",
            message.content?.substring(0, 100) || "Sent an attachment",
            {
                type: "direct",
                senderId: message.sender_id,
                senderName: message.sender_name,
                senderAvatar: message.sender_avatar,
            }
        );
    }, [auth?.user?.id, location.pathname, playSound, showDesktopNotification]);

    // Connect to Teams socket
    useEffect(() => {
        if (!auth?.token || !TEAMS_SOCKET_URL) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Avoid duplicate connections
        if (socketRef.current?.connected) {
            return;
        }

        try {
            console.log("[TeamsNotification] Connecting to:", TEAMS_SOCKET_URL);

            const socket = io(TEAMS_SOCKET_URL, {
                auth: { token: auth.token },
                transports: ["polling", "websocket"],
                reconnection: true,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                timeout: 15000,
            });

            socketRef.current = socket;

            socket.on("connect", () => {
                console.log("✅ [TeamsNotification] Socket connected");
                setIsConnected(true);
            });

            socket.on("disconnect", () => {
                console.log("❌ [TeamsNotification] Socket disconnected");
                setIsConnected(false);
            });

            socket.on("connect_error", (error) => {
                console.warn("[TeamsNotification] Connection error:", error.message);
                setIsConnected(false);
            });

            // Listen for channel messages
            socket.on("channel:message", handleChannelMessage);

            // Listen for direct messages
            socket.on("direct:message", handleDirectMessage);

            return () => {
                socket.off("channel:message", handleChannelMessage);
                socket.off("direct:message", handleDirectMessage);
                socket.disconnect();
            };
        } catch (err) {
            console.error("[TeamsNotification] Socket init error:", err);
        }
    }, [auth?.token, handleChannelMessage, handleDirectMessage]);

    // Clear unread count (call when opening Teams page)
    const clearUnreadCount = useCallback(() => {
        setUnreadCount(0);
    }, []);

    // Dismiss last message toast
    const dismissToast = useCallback(() => {
        setLastMessage(null);
    }, []);

    // Open floating chat
    const openFloatingChat = useCallback((data) => {
        setFloatingChatData(data);
        setShowFloatingChat(true);
    }, []);

    // Close floating chat
    const closeFloatingChat = useCallback(() => {
        setShowFloatingChat(false);
        setFloatingChatData(null);
    }, []);

    // Toggle sound
    const toggleSound = useCallback(() => {
        setSoundEnabled((prev) => !prev);
    }, []);

    // Request notification permission
    const requestPermission = useCallback(async () => {
        if ("Notification" in window && Notification.permission === "default") {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            return permission;
        }
        return notificationPermission;
    }, [notificationPermission]);

    return (
        <TeamsNotificationContext.Provider
            value={{
                // State
                unreadCount,
                isConnected,
                lastMessage,
                showFloatingChat,
                floatingChatData,
                notificationPermission,
                soundEnabled,
                // Actions
                clearUnreadCount,
                dismissToast,
                openFloatingChat,
                closeFloatingChat,
                toggleSound,
                requestPermission,
                setUnreadCount,
            }}
        >
            {children}
        </TeamsNotificationContext.Provider>
    );
}

export function useTeamsNotification() {
    const context = useContext(TeamsNotificationContext);
    // Return default values if context is not available (component used outside provider)
    if (!context) {
        return {
            unreadCount: 0,
            isConnected: false,
            lastMessage: null,
            showFloatingChat: false,
            floatingChatData: null,
            notificationPermission: "default",
            soundEnabled: true,
            clearUnreadCount: () => { },
            dismissToast: () => { },
            openFloatingChat: () => { },
            closeFloatingChat: () => { },
            toggleSound: () => { },
            requestPermission: async () => "default",
            setUnreadCount: () => { },
        };
    }
    return context;
}

export default TeamsNotificationContext;
