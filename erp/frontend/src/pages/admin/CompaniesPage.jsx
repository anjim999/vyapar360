// src/pages/admin/CompaniesPage.jsx
import { useState, useEffect } from "react";
import { FaSearch, FaBuilding, FaCheck, FaTimes, FaEye, FaBan, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Table, Badge, Input, Select, StatCard, Modal, Button } from "../../components/common";
import api from "../../api/axiosClient";

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [selectedCompany, setSelectedCompany] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/admin/companies");
            setCompanies(res.data.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const filtered = companies.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) &&
        (!filterStatus || (filterStatus === "verified" ? c.is_verified : !c.is_verified))
    );

    const handleVerify = async (id, verified) => {
        try {
            await api.put(`/api/admin/companies/${id}/verify`, { is_verified: verified });
            toast.success(verified ? "Verified" : "Unverified");
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const handleToggleActive = async (id, active) => {
        try {
            await api.put(`/api/admin/companies/${id}/status`, { is_active: active });
            toast.success(active ? "Activated" : "Deactivated");
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const columns = [
        {
            key: "name", label: "Company", render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"><FaBuilding className="text-blue-500" /></div>
                    <div><p className="font-medium">{r.name}</p><p className="text-xs theme-text-muted">{r.industry}</p></div>
                </div>
            )
        },
        { key: "email", label: "Email" },
        { key: "city", label: "Location", render: (v, r) => v ? `${v}, ${r.state}` : "-" },
        { key: "employee_count", label: "Employees", render: v => v || 0 },
        { key: "is_verified", label: "Verified", render: v => v ? <Badge variant="success"><FaCheck className="mr-1" />Yes</Badge> : <Badge variant="default">No</Badge> },
        { key: "is_active", label: "Status", render: v => <Badge variant={v !== false ? "success" : "danger"}>{v !== false ? "Active" : "Inactive"}</Badge> },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <div className="flex gap-1">
                    <button onClick={() => setSelectedCompany(r)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded" title="View"><FaEye /></button>
                    <button onClick={() => handleVerify(r.id, !r.is_verified)} className={`p-2 rounded ${r.is_verified ? "text-amber-500" : "text-green-500"}`} title={r.is_verified ? "Unverify" : "Verify"}>{r.is_verified ? <FaTimes /> : <FaCheck />}</button>
                    <button onClick={() => handleToggleActive(r.id, r.is_active === false)} className={`p-2 rounded ${r.is_active !== false ? "text-red-500" : "text-green-500"}`} title={r.is_active !== false ? "Deactivate" : "Activate"}><FaBan /></button>
                </div>
            )
        },
    ];

    const stats = { total: companies.length, verified: companies.filter(c => c.is_verified).length, active: companies.filter(c => c.is_active !== false).length };

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold theme-text-primary">All Companies</h1><p className="theme-text-muted">Platform-wide company management</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Companies" value={stats.total} icon={<FaBuilding />} iconBg="blue" />
                <StatCard title="Verified" value={stats.verified} icon={<FaCheck />} iconBg="green" />
                <StatCard title="Active" value={stats.active} iconBg="purple" />
            </div>
            <Card padding="md">
                <div className="flex gap-4">
                    <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} icon={<FaSearch />} className="flex-1" />
                    <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} options={[{ value: "verified", label: "Verified" }, { value: "unverified", label: "Unverified" }]} placeholder="All" className="w-40" />
                </div>
            </Card>
            <Card padding="none"><Table columns={columns} data={filtered} loading={loading} /></Card>
            <Modal isOpen={!!selectedCompany} onClose={() => setSelectedCompany(null)} title="Company Details" size="lg">
                {selectedCompany && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-2xl"><FaBuilding className="text-blue-500" /></div>
                            <div><h3 className="text-xl font-bold">{selectedCompany.name}</h3><p className="theme-text-muted">{selectedCompany.industry}</p></div></div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div><p className="theme-text-muted">Email</p><p>{selectedCompany.email}</p></div>
                            <div><p className="theme-text-muted">Phone</p><p>{selectedCompany.phone || "-"}</p></div>
                            <div><p className="theme-text-muted">Location</p><p>{selectedCompany.city}, {selectedCompany.state}</p></div>
                            <div><p className="theme-text-muted">Website</p><p>{selectedCompany.website || "-"}</p></div>
                            <div><p className="theme-text-muted">GSTIN</p><p>{selectedCompany.gstin || "-"}</p></div>
                            <div><p className="theme-text-muted">Rating</p><p className="flex items-center gap-1"><FaStar className="text-amber-400" />{selectedCompany.rating?.toFixed(1) || "N/A"}</p></div>
                        </div>
                        {selectedCompany.description && <div><p className="theme-text-muted text-sm">About</p><p className="theme-text-secondary">{selectedCompany.description}</p></div>}
                    </div>
                )}
            </Modal>
        </div>
    );
}
