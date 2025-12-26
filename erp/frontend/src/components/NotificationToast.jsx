// src/components/NotificationToast.jsx - Real-time Notification Toast
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaUsers, FaFileInvoice } from 'react-icons/fa';

// Custom toast component for rich notifications
function NotificationContent({ notification, onClose }) {
    const navigate = useNavigate();

    const icons = {
        info: <FaInfoCircle className="text-blue-500" />,
        success: <FaCheckCircle className="text-green-500" />,
        warning: <FaExclamationTriangle className="text-amber-500" />,
        error: <FaExclamationTriangle className="text-red-500" />,
        leave: <FaUsers className="text-purple-500" />,
        invoice: <FaFileInvoice className="text-green-500" />,
        default: <FaBell className="text-blue-500" />,
    };

    const handleClick = () => {
        if (notification.action_url) {
            navigate(notification.action_url);
        }
        onClose();
    };

    return (
        <div
            className="flex items-start gap-3 cursor-pointer"
            onClick={handleClick}
        >
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                {icons[notification.type] || icons.default}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {notification.title}
                </p>
                <p className="text-gray-600 dark:text-gray-300 text-xs mt-0.5 line-clamp-2">
                    {notification.message}
                </p>
            </div>
        </div>
    );
}

// Hook to show real-time notification toasts
export function useNotificationToast() {
    const { lastNotification, subscribe } = useSocket();

    useEffect(() => {
        if (lastNotification) {
            showNotificationToast(lastNotification);
        }
    }, [lastNotification]);

    // Subscribe to specific notification types
    useEffect(() => {
        const unsubscribeLeave = subscribe('leave:update', (data) => {
            toast.info(`Leave request ${data.status}: ${data.employee_name}`, {
                icon: <FaUsers className="text-purple-500" />,
            });
        });

        const unsubscribeInvoice = subscribe('invoice:update', (data) => {
            toast.success(`Invoice ${data.invoice_number} ${data.status}`, {
                icon: <FaFileInvoice className="text-green-500" />,
            });
        });

        const unsubscribeLowStock = subscribe('inventory:low-stock', (data) => {
            toast.warning(`Low stock alert: ${data.name}`, {
                icon: <FaExclamationTriangle className="text-amber-500" />,
            });
        });

        return () => {
            unsubscribeLeave();
            unsubscribeInvoice();
            unsubscribeLowStock();
        };
    }, [subscribe]);
}

// Show notification toast
export function showNotificationToast(notification) {
    const toastId = `notification-${notification.id || Date.now()}`;

    toast(
        ({ closeToast }) => (
            <NotificationContent
                notification={notification}
                onClose={closeToast}
            />
        ),
        {
            toastId,
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            className: 'dark:bg-gray-800',
        }
    );
}

export default { useNotificationToast, showNotificationToast };
