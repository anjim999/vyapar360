// src/pages/hr/LeavesPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaCalendarAlt, FaCheck, FaTimes, FaClock } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Badge, Modal, Input, Textarea, Select, StatCard } from "../../components/common";
import hrService from "../../services/hrService";
import { useAuth } from "../../context/AuthContext";
import { ROLES } from "../../constants";

export default function LeavesPage() {
    const { auth } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState("");
    const [formData, setFormData] = useState({ leave_type_id: "", start_date: "", end_date: "", reason: "" });
    const [saving, setSaving] = useState(false);

    const userRole = auth?.user?.role || ROLES.EMPLOYEE;
    const isHR = [ROLES.COMPANY_ADMIN, ROLES.HR_MANAGER].includes(userRole);

    useEffect(() => { fetchData(); }, [filterStatus]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = filterStatus ? { status: filterStatus } : {};
            const [leavesRes, typesRes] = await Promise.all([hrService.getLeaves(params), hrService.getLeaveTypes()]);
            setLeaves(leavesRes.data || []);
            setLeaveTypes(typesRes.data || []);
        } catch (err) { toast.error("Failed to fetch leaves"); }
        finally { setLoading(false); }
    };

    const handleApplyLeave = async (e) => {
        e.preventDefault();
        if (!formData.leave_type_id || !formData.start_date || !formData.end_date) return toast.error("Fill all fields");
        setSaving(true);
        try {
            await hrService.applyLeave(formData);
            toast.success("Leave request submitted");
            setShowApplyModal(false);
            fetchData();
        } catch (err) { toast.error("Failed to submit"); }
        finally { setSaving(false); }
    };

    const handleLeaveAction = async (id, status) => {
        try {
            await hrService.updateLeaveStatus(id, status);
            toast.success(`Leave ${status}`);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const statusColors = { pending: "warning", approved: "success", rejected: "danger" };
    const stats = { pending: leaves.filter(l => l.status === "pending").length, approved: leaves.filter(l => l.status === "approved").length };

    const columns = [
        ...(isHR ? [{ key: "employee_name", label: "Employee" }] : []),
        { key: "leave_type_name", label: "Type" },
        { key: "start_date", label: "From", render: v => new Date(v).toLocaleDateString() },
        { key: "end_date", label: "To", render: v => new Date(v).toLocaleDateString() },
        { key: "days", label: "Days" },
        { key: "status", label: "Status", render: v => <Badge variant={statusColors[v]}>{v?.toUpperCase()}</Badge> },
        ...(isHR ? [{
            key: "actions", label: "Actions", sortable: false, render: (_, r) => r.status === "pending" && (
                <div className="flex gap-2">
                    <button onClick={() => handleLeaveAction(r.id, "approved")} className="p-2 text-green-500"><FaCheck /></button>
                    <button onClick={() => handleLeaveAction(r.id, "rejected")} className="p-2 text-red-500"><FaTimes /></button>
                </div>
            )
        }] : []),
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold theme-text-primary">Leave Management</h1>
                <Button icon={<FaPlus />} onClick={() => setShowApplyModal(true)}>Apply Leave</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total" value={leaves.length} icon={<FaCalendarAlt />} iconBg="blue" />
                <StatCard title="Pending" value={stats.pending} icon={<FaClock />} iconBg="yellow" />
                <StatCard title="Approved" value={stats.approved} icon={<FaCheck />} iconBg="green" />
            </div>
            <Card padding="none"><Table columns={columns} data={leaves} loading={loading} /></Card>
            <Modal isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} title="Apply Leave">
                <form onSubmit={handleApplyLeave} className="space-y-4">
                    <Select label="Type" name="leave_type_id" value={formData.leave_type_id} onChange={e => setFormData({ ...formData, leave_type_id: e.target.value })} options={leaveTypes.map(t => ({ value: t.id, label: t.name }))} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="From" type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} required />
                        <Input label="To" type="date" value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} required />
                    </div>
                    <Textarea label="Reason" value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} />
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowApplyModal(false)}>Cancel</Button><Button type="submit" loading={saving}>Submit</Button></div>
                </form>
            </Modal>
        </div>
    );
}
