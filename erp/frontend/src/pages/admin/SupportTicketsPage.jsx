// src/pages/admin/SupportTicketsPage.jsx
import { useState, useEffect } from "react";
import { FaHeadset, FaReply, FaCheck, FaClock, FaFilter } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Table, Badge, Modal, Button, Textarea, Select, StatCard } from "../../components/common";
import api from "../../api/axiosClient";

export default function SupportTicketsPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [filterStatus, setFilterStatus] = useState("");
    const [response, setResponse] = useState("");
    const [sending, setSending] = useState(false);

    useEffect(() => { fetchData(); }, [filterStatus]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = filterStatus ? `?status=${filterStatus}` : "";
            const res = await api.get(`/api/admin/support${params}`);
            setTickets(res.data.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const handleRespond = async (status = "resolved") => {
        if (!response.trim() && status === "resolved") return toast.error("Enter response");
        setSending(true);
        try {
            await api.put(`/api/admin/support/${selectedTicket.id}`, { status, admin_response: response });
            toast.success("Updated");
            setSelectedTicket(null);
            setResponse("");
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSending(false); }
    };

    const statusColors = { open: "danger", in_progress: "warning", resolved: "success", closed: "default" };
    const categoryLabels = { technical: "Technical", billing: "Billing", account: "Account", feature: "Feature Request", other: "Other" };
    const stats = { total: tickets.length, open: tickets.filter(t => t.status === "open").length, resolved: tickets.filter(t => t.status === "resolved").length };

    const columns = [
        { key: "user_name", label: "User", render: (v, r) => <div><p className="font-medium">{v}</p><p className="text-xs theme-text-muted">{r.user_email}</p></div> },
        { key: "category", label: "Category", render: v => categoryLabels[v] || v },
        { key: "subject", label: "Subject" },
        { key: "status", label: "Status", render: v => <Badge variant={statusColors[v]}>{v?.replace("_", " ").toUpperCase()}</Badge> },
        { key: "created_at", label: "Date", render: v => new Date(v).toLocaleDateString() },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <Button size="sm" variant="ghost" onClick={() => { setSelectedTicket(r); setResponse(r.admin_response || ""); }}>View</Button>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold theme-text-primary">Support Tickets</h1><p className="theme-text-muted">Manage customer support requests</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Tickets" value={stats.total} icon={<FaHeadset />} iconBg="blue" />
                <StatCard title="Open" value={stats.open} icon={<FaClock />} iconBg="red" />
                <StatCard title="Resolved" value={stats.resolved} icon={<FaCheck />} iconBg="green" />
            </div>
            <Card padding="md">
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={[{ value: "open", label: "Open" }, { value: "in_progress", label: "In Progress" }, { value: "resolved", label: "Resolved" }, { value: "closed", label: "Closed" }]} placeholder="All Status" className="w-40" />
            </Card>
            <Card padding="none"><Table columns={columns} data={tickets} loading={loading} emptyMessage="No tickets" /></Card>

            <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} title="Ticket Details" size="lg">
                {selectedTicket && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div><p className="font-medium">{selectedTicket.user_name}</p><p className="text-sm theme-text-muted">{selectedTicket.user_email}</p></div>
                            <Badge variant={statusColors[selectedTicket.status]}>{selectedTicket.status?.replace("_", " ").toUpperCase()}</Badge>
                        </div>
                        <div className="p-4 rounded-lg theme-bg-tertiary">
                            <p className="text-sm theme-text-muted mb-1">Category: {categoryLabels[selectedTicket.category]}</p>
                            <p className="font-medium theme-text-primary">{selectedTicket.subject}</p>
                            <p className="text-sm theme-text-secondary mt-2 whitespace-pre-line">{selectedTicket.message}</p>
                        </div>
                        <Textarea label="Your Response" value={response} onChange={e => setResponse(e.target.value)} placeholder="Type your response..." rows={4} />
                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setSelectedTicket(null)}>Cancel</Button>
                            <Button variant="warning" onClick={() => handleRespond("in_progress")} loading={sending}>Mark In Progress</Button>
                            <Button onClick={() => handleRespond("resolved")} loading={sending} icon={<FaReply />}>Resolve</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
