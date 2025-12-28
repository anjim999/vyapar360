import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axiosClient";
import useSocket from "../hooks/useSocket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { subscribe, lastNotification, notificationCount } = useSocket();

    // Fetch notifications from backend
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch real notifications from database
            const [notifResponse, dashboardAlerts] = await Promise.all([
                api.get("/api/notifications").catch(() => ({ data: { data: [], meta: { unread_count: 0 } } })),
                api.get("/api/dashboard/alerts").catch(() => ({ data: {} })),
            ]);

            const realNotifications = (notifResponse.data?.data || []).map(n => ({
                id: n.id,
                type: n.type || 'info',
                title: n.title,
                message: n.message,
                time: n.created_at,
                read: n.is_read,
                link: n.link,
            }));

            const alerts = [];

            // Add overdue invoices as alerts
            if (dashboardAlerts.data?.overdueInvoices?.length) {
                dashboardAlerts.data.overdueInvoices.forEach((inv) => {
                    alerts.push({
                        id: `inv-${inv.id}`,
                        type: "warning",
                        title: "Overdue Invoice",
                        message: `Invoice ${inv.invoice_number} is overdue (₹${inv.amount_base})`,
                        time: new Date().toISOString(),
                        read: false,
                        link: "/finance/invoices",
                    });
                });
            }

            // Add high risk projects as alerts
            if (dashboardAlerts.data?.highRiskProjects?.length) {
                dashboardAlerts.data.highRiskProjects.forEach((proj) => {
                    alerts.push({
                        id: `risk-${proj.project_id}`,
                        type: "error",
                        title: "High Risk Project",
                        message: `Project #${proj.project_id} has ${proj.risk_level} risk`,
                        time: new Date().toISOString(),
                        read: false,
                        link: "/projects",
                    });
                });
            }

            // Combine real notifications with alerts
            const allNotifications = [...realNotifications, ...alerts];

            // Add welcome message if empty
            if (allNotifications.length === 0) {
                allNotifications.push({
                    id: "welcome-1",
                    type: "info",
                    title: "Welcome!",
                    message: "Welcome to Vyapar360. Get started by exploring the dashboard.",
                    time: new Date().toISOString(),
                    read: false,
                    link: "/",
                });
            }

            setNotifications(allNotifications);
            setUnreadCount(notifResponse.data?.meta?.unread_count || allNotifications.filter((n) => !n.read).length);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle real-time notification from socket
    useEffect(() => {
        if (lastNotification) {
            const newNotif = {
                id: lastNotification.id,
                type: lastNotification.type || 'info',
                title: lastNotification.title,
                message: lastNotification.message,
                time: lastNotification.created_at || new Date().toISOString(),
                read: false,
                link: lastNotification.link,
            };
            setNotifications(prev => [newNotif, ...prev]);
        }
    }, [lastNotification]);

    // Sync count from socket
    useEffect(() => {
        if (notificationCount !== undefined) {
            setUnreadCount(notificationCount);
        }
    }, [notificationCount]);

    // Mark a notification as read
    const markAsRead = async (notificationId) => {
        try {
            // Update in backend if it's a real notification
            if (typeof notificationId === 'number') {
                await api.put(`/api/notifications/${notificationId}/read`);
            }
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark notification as read:", err);
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await api.put("/api/notifications/all/read");
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read:", err);
        }
    };

    // Clear all notifications
    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Add a new notification (local)
    const addNotification = (notification) => {
        const newNotification = {
            id: `notif-${Date.now()}`,
            time: new Date().toISOString(),
            read: false,
            ...notification,
        };
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);
    };

    useEffect(() => {
        // Delay initial fetch by 1 second
        const timer = setTimeout(() => {
            fetchNotifications();
        }, 1000);

        // Refresh notifications every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                markAsRead,
                markAllAsRead,
                clearAll,
                addNotification,
                refresh: fetchNotifications,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
