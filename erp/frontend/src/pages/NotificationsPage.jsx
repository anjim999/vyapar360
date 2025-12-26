// src/pages/NotificationsPage.jsx - Full Notifications List
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckDouble, FaCheck, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { Card, Button } from '../components/common';
import api from '../api/axiosClient';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const params = filter === 'all' ? '' : `?filter=${filter}`;
            const res = await api.get(`/api/notifications${params}`);
            setNotifications(res.data?.data || []);
        } catch (error) {
            toast.error('Failed to load notifications');
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
            toast.success('Marked as read');
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this notification?')) return;
        try {
            await api.delete(`/api/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Deleted');
        } catch (error) {
            toast.error('Failed');
        }
    };

    const getNotificationIcon = (type) => {
        const icons = {
            info: '📢',
            success: '✅',
            warning: '⚠️',
            error: '❌',
            contact_request: '📧',
            leave: '📅',
            invoice: '💰',
            employee: '👤',
            project: '📊',
        };
        return icons[type] || '🔔';
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary flex items-center gap-2">
                        <FaBell className="text-blue-500" />
                        Notifications
                    </h1>
                    <p className="theme-text-muted">
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button
                        onClick={handleMarkAllAsRead}
                        variant="outline"
                        icon={<FaCheckDouble />}
                    >
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {['all', 'unread', 'read'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f
                                ? 'bg-blue-500 text-white'
                                : 'theme-bg-secondary theme-text-secondary hover:theme-bg-tertiary'
                            }`}
                    >
                        {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                ))}
            </div>

            {/* Notifications List */}
            <Card padding="none">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
                        <p className="theme-text-muted text-sm mt-2">Loading...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="p-8 text-center">
                        <span className="text-6xl">🔔</span>
                        <p className="theme-text-muted mt-4">No notifications to show</p>
                    </div>
                ) : (
                    <div className="divide-y theme-border-light">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:theme-bg-tertiary transition-colors ${!notification.is_read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                                    }`}
                            >
                                <div className="flex gap-4">
                                    {/* Icon */}
                                    <span className="text-3xl flex-shrink-0">
                                        {getNotificationIcon(notification.type)}
                                    </span>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex-1">
                                                <p className={`text-sm ${!notification.is_read ? 'font-semibold' : ''} theme-text-primary`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm theme-text-secondary mt-1">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs theme-text-muted mt-2">
                                                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {!notification.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notification.id)}
                                                        className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded text-green-500"
                                                        title="Mark as read"
                                                    >
                                                        <FaCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notification.id)}
                                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                                    title="Delete"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Link */}
                                        {notification.action_url && (
                                            <button
                                                onClick={() => navigate(notification.action_url)}
                                                className="mt-2 text-sm text-blue-500 hover:underline flex items-center gap-1"
                                            >
                                                View Details <FaExternalLinkAlt className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
