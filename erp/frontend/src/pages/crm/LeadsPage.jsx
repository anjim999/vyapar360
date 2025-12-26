// src/pages/crm/LeadsPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaPhone, FaEnvelope } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Badge, Modal, Input, Select, Textarea, ConfirmModal } from "../../components/common";
import crmService from "../../services/crmService";

export default function LeadsPage() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", company_name: "", source: "", notes: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, [filterStatus]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const params = filterStatus ? { status: filterStatus } : {};
            const res = await crmService.getLeads(params);
            setLeads(res.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const filteredLeads = leads.filter(l =>
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.company_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error("Name required");
        setSaving(true);
        try {
            if (selectedLead) {
                await crmService.updateLead(selectedLead.id, formData);
                toast.success("Updated");
            } else {
                await crmService.createLead(formData);
                toast.success("Created");
            }
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await crmService.deleteLead(selectedLead.id);
            toast.success("Deleted");
            setShowDeleteModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const openModal = (lead = null) => {
        setSelectedLead(lead);
        setFormData(lead ? { ...lead } : { name: "", email: "", phone: "", company_name: "", source: "", notes: "" });
        setShowModal(true);
    };

    const statusColors = { new: "primary", contacted: "info", qualified: "warning", proposal: "purple", won: "success", lost: "danger" };
    const sourceOptions = [
        { value: "website", label: "Website" },
        { value: "referral", label: "Referral" },
        { value: "social_media", label: "Social Media" },
        { value: "cold_call", label: "Cold Call" },
        { value: "event", label: "Event" },
        { value: "other", label: "Other" },
    ];
    const statusOptions = [
        { value: "new", label: "New" },
        { value: "contacted", label: "Contacted" },
        { value: "qualified", label: "Qualified" },
        { value: "proposal", label: "Proposal" },
        { value: "won", label: "Won" },
        { value: "lost", label: "Lost" },
    ];

    const columns = [
        {
            key: "name", label: "Lead", render: (_, r) => (
                <div><p className="font-medium">{r.name}</p><p className="text-xs theme-text-muted">{r.company_name || "No company"}</p></div>
            )
        },
        {
            key: "email", label: "Contact", render: (_, r) => (
                <div className="text-sm"><p>{r.email}</p>{r.phone && <p className="theme-text-muted">{r.phone}</p>}</div>
            )
        },
        { key: "source", label: "Source", render: v => v || "-" },
        { key: "status", label: "Status", render: v => <Badge variant={statusColors[v] || "default"}>{v?.toUpperCase()}</Badge> },
        { key: "assigned_to_name", label: "Assigned To", render: v => v || "-" },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <div className="flex gap-1">
                    <button onClick={() => openModal(r)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><FaEdit /></button>
                    <button onClick={() => { setSelectedLead(r); setShowDeleteModal(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500"><FaTrash /></button>
                </div>
            )
        },
    ];

    const stats = { total: leads.length, new: leads.filter(l => l.status === "new").length, won: leads.filter(l => l.status === "won").length };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold theme-text-primary">Leads</h1><p className="theme-text-muted">Manage sales leads</p></div>
                <Button icon={<FaPlus />} onClick={() => openModal()}>Add Lead</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card padding="md" hover><p className="text-sm theme-text-muted">Total Leads</p><p className="text-2xl font-bold">{stats.total}</p></Card>
                <Card padding="md" hover><p className="text-sm theme-text-muted">New</p><p className="text-2xl font-bold text-blue-500">{stats.new}</p></Card>
                <Card padding="md" hover><p className="text-sm theme-text-muted">Won</p><p className="text-2xl font-bold text-green-500">{stats.won}</p></Card>
                <Card padding="md" hover><p className="text-sm theme-text-muted">Conversion</p><p className="text-2xl font-bold text-purple-500">{stats.total ? ((stats.won / stats.total) * 100).toFixed(0) : 0}%</p></Card>
            </div>
            <Card padding="md">
                <div className="flex gap-4">
                    <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} icon={<FaSearch />} className="flex-1" />
                    <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={statusOptions} placeholder="All Status" className="w-40" />
                </div>
            </Card>
            <Card padding="none"><Table columns={columns} data={filteredLeads} loading={loading} /></Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedLead ? "Edit Lead" : "Add Lead"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="Company" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        <Select label="Source" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} options={sourceOptions} />
                        {selectedLead && <Select label="Status" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} options={statusOptions} />}
                    </div>
                    <Textarea label="Notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={3} />
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>{selectedLead ? "Update" : "Create"}</Button></div>
                </form>
            </Modal>
            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Lead" message={`Delete "${selectedLead?.name}"?`} variant="danger" />
        </div>
    );
}
