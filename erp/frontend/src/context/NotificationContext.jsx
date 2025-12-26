import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../api/axiosClient";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch notifications from backend
    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            // Simulate notifications from different sources
            const [dashboardAlerts] = await Promise.all([
                api.get("/api/dashboard/alerts").catch(() => ({ data: {} })),
            ]);

            const alerts = [];

            // Add overdue invoices as notifications
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

            // Add high risk projects as notifications
            if (dashboardAlerts.data?.highRiskProjects?.length) {
                dashboardAlerts.data.highRiskProjects.forEach((proj) => {
                    alerts.push({
                        id: `risk-${proj.project_id}`,
                        type: "error",
                        title: "High Risk Project",
                        message: `Project #${proj.project_id} has ${proj.risk_level} risk (Score: ${proj.risk_score})`,
                        time: new Date().toISOString(),
                        read: false,
                        link: "/projects",
                    });
                });
            }

            // Add some sample notifications if no alerts
            if (alerts.length === 0) {
                alerts.push({
                    id: "welcome-1",
                    type: "info",
                    title: "Welcome!",
                    message: "Welcome to Devopod ERP. Get started by exploring the dashboard.",
                    time: new Date().toISOString(),
                    read: false,
                    link: "/",
                });
            }

            setNotifications(alerts);
            setUnreadCount(alerts.filter((n) => !n.read).length);
        } catch (err) {
            console.error("Failed to fetch notifications:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Mark a notification as read
    const markAsRead = (notificationId) => {
        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, read: true } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    // Mark all as read
    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    // Clear all notifications
    const clearAll = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    // Add a new notification
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
        // Only fetch once on mount, then set up interval
        const timer = setTimeout(() => {
            fetchNotifications();
        }, 1000); // Delay initial fetch by 1 second
        
        // Refresh notifications every 60 seconds (increased from 30)
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
