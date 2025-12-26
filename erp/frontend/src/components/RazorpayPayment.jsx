// src/components/RazorpayPayment.jsx - Razorpay Payment Integration
import { useState } from 'react';
import { FaCreditCard, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import api from '../api/axiosClient';
import { Button } from './common';

export default function RazorpayPayment({
    amount,
    description = 'Payment',
    onSuccess,
    onFailure,
    buttonText = 'Pay Now',
    className = ''
}) {
    const [loading, setLoading] = useState(false);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            if (window.Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setLoading(true);

        try {
            // Load Razorpay script
            const loaded = await loadRazorpayScript();
            if (!loaded) {
                toast.error('Failed to load payment gateway');
                setLoading(false);
                return;
            }

            // Create order
            const orderRes = await api.post('/api/payments/create-order', {
                amount,
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: { description }
            });

            const { id: orderId, key } = orderRes.data.data;

            // Configure Razorpay options
            const options = {
                key,
                amount: amount * 100, // In paise
                currency: 'INR',
                name: 'Vyapar360',
                description,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        // Verify payment
                        await api.post('/api/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        toast.success('Payment successful!');
                        onSuccess?.(response);
                    } catch (err) {
                        toast.error('Payment verification failed');
                        onFailure?.(err);
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#667eea'
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (err) {
            toast.error('Failed to initiate payment');
            onFailure?.(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePayment}
            loading={loading}
            icon={<FaCreditCard />}
            className={className}
        >
            {buttonText} (₹{amount})
        </Button>
    );
}

// Payment Status Badge
export function PaymentStatus({ status }) {
    const statusConfig = {
        created: { color: 'bg-yellow-100 text-yellow-800', icon: <FaCreditCard /> },
        paid: { color: 'bg-green-100 text-green-800', icon: <FaCheck /> },
        failed: { color: 'bg-red-100 text-red-800', icon: <FaTimes /> }
    };

    const config = statusConfig[status] || statusConfig.created;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}

// Payment History
export function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useState(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const res = await api.get('/api/payments/history');
            setPayments(res.data.data || []);
        } catch (err) {
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>;
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold theme-text-primary">Payment History</h3>
            {payments.length === 0 ? (
                <p className="theme-text-muted">No payments yet</p>
            ) : (
                <div className="space-y-2">
                    {payments.map(payment => (
                        <div key={payment.id} className="flex items-center justify-between p-3 theme-bg-tertiary rounded-lg">
                            <div>
                                <p className="font-medium theme-text-primary">₹{payment.amount}</p>
                                <p className="text-sm theme-text-muted">{new Date(payment.created_at).toLocaleDateString()}</p>
                            </div>
                            <PaymentStatus status={payment.status} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
