// src/components/teams/TeamsNotificationToast.jsx
// In-app toast notification for Teams messages (like Microsoft Teams)
import { useEffect, useState } from "react";
import { FaComments, FaTimes, FaReply, FaExpand } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTeamsNotification } from "../../context/TeamsNotificationContext";

export default function TeamsNotificationToast() {
    const navigate = useNavigate();
    const {
        lastMessage,
        dismissToast,
        openFloatingChat
    } = useTeamsNotification();

    const [show, setShow] = useState(false);
    const [messageData, setMessageData] = useState(null);

    useEffect(() => {
        if (lastMessage && Date.now() - lastMessage.timestamp < 1000) {
            setMessageData(lastMessage);
            setShow(true);

            // Auto hide after 6 seconds
            const timer = setTimeout(() => {
                setShow(false);
                setTimeout(() => {
                    dismissToast();
                }, 300);
            }, 6000);

            return () => clearTimeout(timer);
        }
    }, [lastMessage, dismissToast]);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => {
            dismissToast();
        }, 300);
    };

    const handleReply = () => {
        openFloatingChat({
            type: messageData?.type,
            senderId: messageData?.message?.sender_id,
            senderName: messageData?.message?.sender_name,
            senderAvatar: messageData?.message?.sender_avatar,
            channelId: messageData?.channelId,
        });
        handleClose();
    };

    const handleExpand = () => {
        navigate("/teams");
        handleClose();
    };

    if (!messageData) return null;

    const { message } = messageData;
    const senderName = message?.sender_name || "Someone";
    const content = message?.content || "Sent an attachment";
    const avatar = message?.sender_avatar;

    return (
        <div
            className={`
                fixed top-20 right-4 z-[9999] w-80 max-w-[calc(100vw-2rem)]
                transform transition-all duration-300 ease-out
                ${show ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
        >
            <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-black/20">
                    <div className="flex items-center gap-2">
                        <FaComments className="text-white/80" />
                        <span className="text-white/90 text-sm font-medium">Teams Chat</span>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/60 hover:text-white transition-colors p-1"
                    >
                        <FaTimes size={14} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-4 py-3">
                    <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            {avatar ? (
                                <img
                                    src={avatar}
                                    alt={senderName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                                    {senderName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        {/* Message */}
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold text-sm truncate">
                                {senderName}
                            </p>
                            <p className="text-white/80 text-sm line-clamp-2 mt-0.5">
                                {content.length > 80 ? content.substring(0, 80) + "..." : content}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex border-t border-white/20">
                    <button
                        onClick={handleReply}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                   text-white/90 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        <FaReply size={12} />
                        <span>Reply</span>
                    </button>
                    <div className="w-px bg-white/20" />
                    <button
                        onClick={handleExpand}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 
                                   text-white/90 hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        <FaExpand size={12} />
                        <span>Open Teams</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
