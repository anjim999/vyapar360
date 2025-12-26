// src/pages/admin/CompanyRequestsPage.jsx
import { useState, useEffect } from "react";
import { FaBuilding, FaCheck, FaTimes, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Table, Badge, Button, Modal, Textarea, Select, Loader } from "../../components/common";
import companyRequestService from "../../services/companyRequestService";

export default function CompanyRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [approvalResult, setApprovalResult] = useState(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => { fetchData(); }, [filterStatus]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await companyRequestService.getAllRequests(filterStatus);
            setRequests(res.data || []);
        } catch (err) { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };

    const handleApprove = async () => {
        setProcessing(true);
        try {
            const res = await companyRequestService.approveRequest(selectedRequest.id, {
                admin_notes: adminNotes
            });
            toast.success("Company approved!");
            setShowApproveModal(false);
            setApprovalResult(res.data);
            setShowSuccessModal(true);
            fetchData();
        } catch (err) { toast.error(err.response?.data?.error || "Failed"); }
        finally { setProcessing(false); setAdminNotes(""); }
    };

    const handleReject = async () => {
        if (!adminNotes.trim()) return toast.error("Please provide a reason for rejection");
        setProcessing(true);
        try {
            await companyRequestService.rejectRequest(selectedRequest.id, { admin_notes: adminNotes });
            toast.success("Request rejected");
            setShowRejectModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setProcessing(false); setAdminNotes(""); }
    };

    const statusColors = { pending: "warning", approved: "success", rejected: "danger" };

    const columns = [
        {
            key: "company_name", label: "Company", render: (v, r) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white">
                        <FaBuilding />
                    </div>
                    <div><p className="font-medium">{v}</p><p className="text-xs theme-text-muted">{r.industry}</p></div>
                </div>
            )
        },
        {
            key: "user_name", label: "Requested By", render: (v, r) => (
                <div><p className="font-medium">{v}</p><p className="text-xs theme-text-muted">{r.user_email}</p></div>
            )
        },
        { key: "email", label: "Business Email" },
        { key: "city", label: "Location", render: (v, r) => v ? `${v}, ${r.state}` : "-" },
        { key: "status", label: "Status", render: v => <Badge variant={statusColors[v]}>{v?.toUpperCase()}</Badge> },
        { key: "created_at", label: "Date", render: v => new Date(v).toLocaleDateString() },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => r.status === 'pending' ? (
                <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedRequest(r); setShowApproveModal(true); }} className="text-green-500">
                        <FaCheck />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => { setSelectedRequest(r); setShowRejectModal(true); }} className="text-red-500">
                        <FaTimes />
                    </Button>
                </div>
            ) : <span className="text-xs theme-text-muted">Processed</span>
        }
    ];

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        approved: requests.filter(r => r.status === 'approved').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold theme-text-primary">Company Requests</h1>
                <p className="theme-text-muted">Review and approve company registration requests</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card padding="md" hover><p className="text-sm theme-text-muted">Total</p><p className="text-2xl font-bold">{stats.total}</p></Card>
                <Card padding="md" hover className="border-l-4 border-amber-500"><p className="text-sm theme-text-muted">Pending</p><p className="text-2xl font-bold text-amber-500">{stats.pending}</p></Card>
                <Card padding="md" hover className="border-l-4 border-green-500"><p className="text-sm theme-text-muted">Approved</p><p className="text-2xl font-bold text-green-500">{stats.approved}</p></Card>
                <Card padding="md" hover className="border-l-4 border-red-500"><p className="text-sm theme-text-muted">Rejected</p><p className="text-2xl font-bold text-red-500">{stats.rejected}</p></Card>
            </div>

            <Card padding="md">
                <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                    options={[{ value: "pending", label: "Pending" }, { value: "approved", label: "Approved" }, { value: "rejected", label: "Rejected" }]}
                    placeholder="All Status" className="w-40" />
            </Card>

            <Card padding="none">
                <Table columns={columns} data={requests} loading={loading} emptyMessage="No requests found" />
            </Card>

            {/* Approve Modal */}
            <Modal isOpen={showApproveModal} onClose={() => setShowApproveModal(false)} title="Approve Company Request" size="md">
                <div className="space-y-4">
                    <div className="p-4 rounded-lg theme-bg-tertiary">
                        <h3 className="font-semibold">{selectedRequest?.company_name}</h3>
                        <p className="text-sm theme-text-muted">{selectedRequest?.industry}</p>
                        <p className="text-sm theme-text-muted mt-2">Requested by: {selectedRequest?.user_name} ({selectedRequest?.user_email})</p>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
                        ℹ️ Approving this request will:
                        <ul className="list-disc ml-5 mt-1">
                            <li>Create the company "{selectedRequest?.company_name}"</li>
                            <li>Change user's role from "user" → "company_admin"</li>
                            <li>User can login with their existing password</li>
                        </ul>
                    </div>

                    <Textarea label="Admin Notes (optional)" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Notes for the user..." rows={3} />
                    <div className="flex justify-end gap-3 pt-4 border-t theme-border-light">
                        <Button variant="ghost" onClick={() => setShowApproveModal(false)}>Cancel</Button>
                        <Button onClick={handleApprove} loading={processing} className="bg-green-500 hover:bg-green-600">Approve & Create Company</Button>
                    </div>
                </div>
            </Modal>

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Request" size="md">
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <p className="text-sm text-red-700 dark:text-red-300">You are about to reject this request:</p>
                        <p className="font-semibold mt-1">{selectedRequest?.company_name}</p>
                    </div>
                    <Textarea label="Reason for Rejection *" value={adminNotes} onChange={e => setAdminNotes(e.target.value)} placeholder="Please explain why this request is being rejected..." rows={4} required />
                    <div className="flex justify-end gap-3 pt-4 border-t theme-border-light">
                        <Button variant="ghost" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleReject} loading={processing}>Reject Request</Button>
                    </div>
                </div>
            </Modal>

            {/* Success Modal */}
            <Modal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} title="✅ Company Approved!" size="md">
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-green-700 dark:text-green-300 font-medium mb-3">
                            Company created successfully!
                        </p>
                        <div className="space-y-2 text-sm bg-white dark:bg-gray-900 p-3 rounded border">
                            <p><span className="text-gray-500">Company:</span> <strong>{approvalResult?.company?.name}</strong></p>
                            <p><span className="text-gray-500">User:</span> <strong>{approvalResult?.user?.name}</strong></p>
                            <p><span className="text-gray-500">Email:</span> <strong>{approvalResult?.user?.email}</strong></p>
                            <p><span className="text-gray-500">New Role:</span> <Badge variant="success">{approvalResult?.user?.newRole}</Badge></p>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 mt-3">
                            ✓ The user can now login with their existing password and will have company_admin access.
                        </p>
                    </div>
                    <div className="flex justify-end">
                        <Button onClick={() => setShowSuccessModal(false)}>Done</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
