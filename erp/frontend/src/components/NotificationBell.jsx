// src/components/NotificationBell.jsx - Notification Bell with Dropdown
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBell, FaCheck, FaCheckDouble, FaTimes, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useSocket } from '../hooks/useSocket';
import api from '../api/axiosClient';

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const { notificationCount, setNotificationCount, markAllRead } = useSocket();
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load notification count on mount
    useEffect(() => {
        fetchNotificationCount();
    }, []);

    // Fetch notifications when dropdown opens
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotificationCount = async () => {
        try {
            const res = await api.get('/api/notifications?limit=1');
            const unread = (res.data?.data || []).filter(n => !n.is_read).length;
            const total = res.data?.meta?.unread_count || 0;
            setNotificationCount(total || unread);
        } catch (error) {
            console.error('Failed to fetch notification count:', error);
        }
    };

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/notifications?limit=10');
            setNotifications(res.data?.data || []);
            const unread = (res.data?.data || []).filter(n => !n.is_read).length;
            setNotificationCount(unread);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
            setNotificationCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            markAllRead();
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const past = new Date(date);
        const diff = Math.floor((now - past) / 1000);

        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
        return past.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };

    const getNotificationIcon = (type) => {
        const icons = {
            info: '📢',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            leave: '📅',
            invoice: '💰',
            employee: '👤',
            project: '📊',
        };
        return icons[type] || '🔔';
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg theme-text-primary hover:theme-bg-tertiary transition-colors"
            >
                <FaBell className="w-5 h-5" />
                {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 theme-bg-secondary rounded-xl shadow-xl border theme-border-light overflow-hidden z-50">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b theme-border-light">
                        <h3 className="font-semibold theme-text-primary">Notifications</h3>
                        <div className="flex items-center gap-2">
                            {notifications.some(n => !n.is_read) && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1"
                                >
                                    <FaCheckDouble className="w-3 h-3" />
                                    Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 hover:theme-bg-tertiary rounded"
                            >
                                <FaTimes className="w-4 h-4 theme-text-muted" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                                <p className="theme-text-muted text-sm mt-2">Loading...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <span className="text-4xl">🔔</span>
                                <p className="theme-text-muted text-sm mt-2">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b theme-border-light hover:theme-bg-tertiary transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                        }`}
                                >
                                    <div className="flex gap-3">
                                        <span className="text-xl flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''} theme-text-primary`}>
                                                    {notification.title}
                                                </p>
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-1 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-500 flex-shrink-0"
                                                        title="Mark as read"
                                                    >
                                                        <FaCheck className="w-3 h-3" />
                                                    </button>
                                                )}
                                            </div>
                                            <p className="text-xs theme-text-muted mt-0.5 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs theme-text-muted">
                                                    {getTimeAgo(notification.created_at)}
                                                </span>
                                                {notification.action_url && (
                                                    <Link
                                                        to={notification.action_url}
                                                        onClick={() => setIsOpen(false)}
                                                        className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                                                    >
                                                        View <FaExternalLinkAlt className="w-2 h-2" />
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t theme-border-light text-center">
                            <Link
                                to="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-blue-500 hover:underline"
                            >
                                View all notifications
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
