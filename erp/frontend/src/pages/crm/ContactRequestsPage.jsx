// src/pages/crm/ContactRequestsPage.jsx
import { useState, useEffect } from "react";
import { FaEnvelope, FaReply, FaCheck, FaTimes, FaEye, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Table, Badge, Modal, Button, Textarea, Select, StatCard } from "../../components/common";
import marketplaceService from "../../services/marketplaceService";

export default function ContactRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [replyMessage, setReplyMessage] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => { fetchData(); }, [filterStatus]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = filterStatus ? { status: filterStatus, type: "received" } : { type: "received" };
            const res = await marketplaceService.getContactRequests(params);
            setRequests(res.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const handleReply = async () => {
        if (!replyMessage.trim()) return toast.error("Enter a message");
        setSending(true);
        try {
            await marketplaceService.replyToRequest(selectedRequest.id, { message: replyMessage });
            toast.success("Reply sent!");
            setShowReplyModal(false);
            setReplyMessage("");
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSending(false); }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await marketplaceService.updateRequestStatus(id, status);
            toast.success(`Request ${status}`);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const openReplyModal = (req) => {
        setSelectedRequest(req);
        setReplyMessage("");
        setShowReplyModal(true);
    };

    const statusConfig = {
        pending: { color: "warning", label: "Pending" },
        viewed: { color: "info", label: "Viewed" },
        replied: { color: "primary", label: "Replied" },
        accepted: { color: "success", label: "Accepted" },
        rejected: { color: "danger", label: "Rejected" },
        closed: { color: "default", label: "Closed" },
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === "pending").length,
        replied: requests.filter(r => r.status === "replied").length,
    };

    const columns = [
        {
            key: "customer_name", label: "From", render: (_, r) => (
                <div><p className="font-medium">{r.customer_name}</p><p className="text-xs theme-text-muted">{r.customer_email}</p></div>
            )
        },
        { key: "subject", label: "Subject" },
        { key: "budget_range", label: "Budget", render: v => v || "-" },
        {
            key: "urgency", label: "Urgency", render: v => (
                <Badge variant={v === "high" ? "danger" : v === "normal" ? "warning" : "default"}>{v?.toUpperCase()}</Badge>
            )
        },
        { key: "status", label: "Status", render: v => <Badge variant={statusConfig[v]?.color}>{statusConfig[v]?.label}</Badge> },
        { key: "created_at", label: "Date", render: v => new Date(v).toLocaleDateString() },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <div className="flex gap-1">
                    <button onClick={() => openReplyModal(r)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-500 rounded" title="Reply"><FaReply /></button>
                    {r.status === "pending" && (
                        <>
                            <button onClick={() => handleUpdateStatus(r.id, "accepted")} className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-500 rounded" title="Accept"><FaCheck /></button>
                            <button onClick={() => handleUpdateStatus(r.id, "rejected")} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded" title="Reject"><FaTimes /></button>
                        </>
                    )}
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold theme-text-primary">Contact Requests</h1>
                <p className="theme-text-muted">Inquiries from potential customers</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Requests" value={stats.total} icon={<FaEnvelope />} iconBg="blue" />
                <StatCard title="Pending" value={stats.pending} icon={<FaClock />} iconBg="yellow" />
                <StatCard title="Replied" value={stats.replied} icon={<FaReply />} iconBg="green" />
            </div>
            <Card padding="md">
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={Object.entries(statusConfig).map(([k, v]) => ({ value: k, label: v.label }))} placeholder="All Status" className="w-40" />
            </Card>
            <Card padding="none"><Table columns={columns} data={requests} loading={loading} emptyMessage="No requests yet" /></Card>

            {/* Reply Modal */}
            <Modal isOpen={showReplyModal} onClose={() => setShowReplyModal(false)} title="Reply to Request" size="lg">
                {selectedRequest && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg theme-bg-tertiary">
                            <p className="text-sm theme-text-muted">From: {selectedRequest.customer_name}</p>
                            <p className="font-medium theme-text-primary mt-1">{selectedRequest.subject}</p>
                            <p className="text-sm theme-text-secondary mt-2">{selectedRequest.message}</p>
                        </div>
                        <Textarea label="Your Reply" value={replyMessage} onChange={e => setReplyMessage(e.target.value)} placeholder="Type your response..." rows={4} />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowReplyModal(false)}>Cancel</Button>
                            <Button onClick={handleReply} loading={sending} icon={<FaReply />}>Send Reply</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
