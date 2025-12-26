// src/pages/MyCompanyRequestsPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBuilding, FaClock, FaCheckCircle, FaTimesCircle, FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Badge, Button, Loader } from "../components/common";
import companyRequestService from "../services/companyRequestService";

export default function MyCompanyRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await companyRequestService.getMyRequests();
            setRequests(res.data || []);
        } catch (err) { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };

    const statusConfig = {
        pending: { color: "warning", icon: <FaClock />, text: "Under Review" },
        approved: { color: "success", icon: <FaCheckCircle />, text: "Approved" },
        rejected: { color: "danger", icon: <FaTimesCircle />, text: "Rejected" },
    };

    if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">My Company Requests</h1>
                    <p className="theme-text-muted">Track your company registration requests</p>
                </div>
                <Link to="/request-company">
                    <Button icon={<FaPlus />}>New Request</Button>
                </Link>
            </div>

            {requests.length === 0 ? (
                <Card padding="lg" className="text-center">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-4xl mx-auto mb-4">
                        🏢
                    </div>
                    <h3 className="text-lg font-semibold theme-text-primary">No Requests Yet</h3>
                    <p className="theme-text-muted mb-4">You haven't submitted any company registration requests</p>
                    <Link to="/request-company">
                        <Button icon={<FaPlus />}>Register Your Company</Button>
                    </Link>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map((req) => (
                        <Card key={req.id} padding="md" hover>
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                                        <FaBuilding />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold theme-text-primary">{req.company_name}</h3>
                                        <p className="text-sm theme-text-muted">{req.industry}</p>
                                        <p className="text-xs theme-text-muted mt-1">
                                            Submitted: {new Date(req.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant={statusConfig[req.status]?.color}>
                                        <span className="flex items-center gap-1">
                                            {statusConfig[req.status]?.icon}
                                            {statusConfig[req.status]?.text}
                                        </span>
                                    </Badge>
                                    {req.processed_at && (
                                        <p className="text-xs theme-text-muted mt-2">
                                            Processed: {new Date(req.processed_at).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {req.admin_notes && (
                                <div className={`mt-4 p-3 rounded-lg ${req.status === 'rejected' ? 'bg-red-50 dark:bg-red-900/20' : 'bg-green-50 dark:bg-green-900/20'}`}>
                                    <p className="text-sm font-medium">Admin Notes:</p>
                                    <p className="text-sm theme-text-muted">{req.admin_notes}</p>
                                </div>
                            )}

                            {req.status === 'approved' && (
                                <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                                    <p className="text-sm text-green-700 dark:text-green-300">
                                        ✅ Your company has been created! Check your email for login credentials.
                                    </p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
