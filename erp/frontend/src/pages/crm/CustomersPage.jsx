// src/pages/crm/CustomersPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUser, FaEnvelope, FaPhone, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Badge, Modal, Input, Textarea, ConfirmModal, StatCard } from "../../components/common";
import api from "../../api/axiosClient";

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [search, setSearch] = useState("");
    const [formData, setFormData] = useState({ name: "", email: "", phone: "", company_name: "", address: "", notes: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/crm/customers");
            setCustomers(res.data.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const filteredCustomers = customers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.company_name?.toLowerCase().includes(search.toLowerCase())
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email) return toast.error("Name and email required");
        setSaving(true);
        try {
            if (selectedCustomer) {
                await api.put(`/api/crm/customers/${selectedCustomer.id}`, formData);
                toast.success("Updated");
            } else {
                await api.post("/api/crm/customers", formData);
                toast.success("Created");
            }
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await api.delete(`/api/crm/customers/${selectedCustomer.id}`);
            toast.success("Deleted");
            setShowDeleteModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const openModal = (customer = null) => {
        setSelectedCustomer(customer);
        setFormData(customer ? { ...customer } : { name: "", email: "", phone: "", company_name: "", address: "", notes: "" });
        setShowModal(true);
    };

    const columns = [
        {
            key: "name", label: "Customer", render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">{r.name?.charAt(0)}</div>
                    <div><p className="font-medium">{r.name}</p><p className="text-xs theme-text-muted">{r.company_name || "Individual"}</p></div>
                </div>
            )
        },
        {
            key: "email", label: "Contact", render: (_, r) => (
                <div className="text-sm"><p className="flex items-center gap-1"><FaEnvelope className="w-3 h-3" />{r.email}</p>{r.phone && <p className="theme-text-muted flex items-center gap-1"><FaPhone className="w-3 h-3" />{r.phone}</p>}</div>
            )
        },
        { key: "total_orders", label: "Orders", render: v => v || 0 },
        { key: "total_spent", label: "Total Spent", render: v => `₹${parseFloat(v || 0).toLocaleString()}` },
        { key: "is_active", label: "Status", render: v => <Badge variant={v !== false ? "success" : "danger"}>{v !== false ? "Active" : "Inactive"}</Badge> },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <div className="flex gap-1">
                    <button onClick={() => openModal(r)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><FaEdit /></button>
                    <button onClick={() => { setSelectedCustomer(r); setShowDeleteModal(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500"><FaTrash /></button>
                </div>
            )
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold theme-text-primary">Customers</h1><p className="theme-text-muted">Manage your customer database</p></div>
                <Button icon={<FaPlus />} onClick={() => openModal()}>Add Customer</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Customers" value={customers.length} icon={<FaUser />} iconBg="blue" />
                <StatCard title="Active" value={customers.filter(c => c.is_active !== false).length} iconBg="green" />
                <StatCard title="Total Revenue" value={`₹${customers.reduce((s, c) => s + parseFloat(c.total_spent || 0), 0).toLocaleString()}`} iconBg="purple" />
            </div>
            <Card padding="md">
                <Input placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} icon={<FaSearch />} />
            </Card>
            <Card padding="none"><Table columns={columns} data={filteredCustomers} loading={loading} emptyMessage="No customers yet" /></Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedCustomer ? "Edit Customer" : "Add Customer"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="Company" value={formData.company_name} onChange={e => setFormData({ ...formData, company_name: e.target.value })} />
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                    </div>
                    <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                    <Textarea label="Notes" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>{selectedCustomer ? "Update" : "Create"}</Button></div>
                </form>
            </Modal>
            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Customer" message={`Delete "${selectedCustomer?.name}"?`} variant="danger" />
        </div>
    );
}
