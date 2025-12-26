// src/pages/marketplace/MyRequestsPage.jsx
import { useState, useEffect } from "react";
import { FaEnvelope, FaBuilding, FaClock, FaCheckCircle, FaTimesCircle, FaEye } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Badge, Modal, EmptyState, Loader } from "../../components/common";
import marketplaceService from "../../services/marketplaceService";

export default function MyRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await marketplaceService.getContactRequests();
            setRequests(res.data || []);
        } catch (err) { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };

    const statusConfig = {
        pending: { color: "warning", icon: <FaClock />, label: "Pending" },
        viewed: { color: "info", icon: <FaEye />, label: "Viewed" },
        replied: { color: "primary", icon: <FaEnvelope />, label: "Replied" },
        accepted: { color: "success", icon: <FaCheckCircle />, label: "Accepted" },
        rejected: { color: "danger", icon: <FaTimesCircle />, label: "Rejected" },
        closed: { color: "default", icon: <FaCheckCircle />, label: "Closed" },
    };

    if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold theme-text-primary">My Requests</h1>
                <p className="theme-text-muted">Track your contact requests to companies</p>
            </div>

            {requests.length === 0 ? (
                <Card padding="lg">
                    <EmptyState
                        icon="📬"
                        title="No Requests Yet"
                        description="Contact companies from the marketplace to get started"
                    />
                </Card>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <Card key={req.id} padding="md" hover onClick={() => setSelectedRequest(req)} className="cursor-pointer">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                                        {req.company_logo ? <img src={req.company_logo} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <FaBuilding className="text-blue-500" />}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold theme-text-primary">{req.company_name}</h3>
                                        <p className="text-sm theme-text-muted">{req.company_industry}</p>
                                        <p className="mt-1 font-medium">{req.subject}</p>
                                        <p className="text-sm theme-text-muted mt-1 line-clamp-1">{req.message}</p>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <Badge variant={statusConfig[req.status]?.color}>
                                        {statusConfig[req.status]?.icon}
                                        <span className="ml-1">{statusConfig[req.status]?.label}</span>
                                    </Badge>
                                    <p className="text-xs theme-text-muted mt-2">
                                        {new Date(req.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            {req.reply_message && (
                                <div className="mt-4 p-3 rounded-lg theme-bg-tertiary border-l-4 border-blue-500">
                                    <p className="text-xs theme-text-muted mb-1">Company Reply:</p>
                                    <p className="text-sm theme-text-secondary">{req.reply_message}</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}

            {/* Request Detail Modal */}
            <Modal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} title="Request Details" size="lg">
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-4 border-b theme-border-light">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl">
                                <FaBuilding className="text-blue-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold theme-text-primary">{selectedRequest.company_name}</h3>
                                <Badge variant={statusConfig[selectedRequest.status]?.color}>{statusConfig[selectedRequest.status]?.label}</Badge>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm theme-text-muted">Subject</p>
                            <p className="font-medium theme-text-primary">{selectedRequest.subject}</p>
                        </div>
                        <div>
                            <p className="text-sm theme-text-muted">Your Message</p>
                            <p className="theme-text-secondary whitespace-pre-line">{selectedRequest.message}</p>
                        </div>
                        {selectedRequest.budget_range && (
                            <div className="grid grid-cols-2 gap-4">
                                <div><p className="text-sm theme-text-muted">Budget</p><p>{selectedRequest.budget_range}</p></div>
                                <div><p className="text-sm theme-text-muted">Urgency</p><p className="capitalize">{selectedRequest.urgency}</p></div>
                            </div>
                        )}
                        {selectedRequest.reply_message && (
                            <div className="p-4 rounded-lg theme-bg-tertiary">
                                <p className="text-sm theme-text-muted mb-2">Company Reply ({new Date(selectedRequest.replied_at).toLocaleDateString()})</p>
                                <p className="theme-text-primary">{selectedRequest.reply_message}</p>
                            </div>
                        )}
                        <div className="text-sm theme-text-muted">
                            Sent on {new Date(selectedRequest.created_at).toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
