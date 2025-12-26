// src/pages/hr/EmployeesPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaKey, FaBan, FaCheck, FaCopy, FaEnvelope, FaPhone, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Badge, Modal, Input, Select, StatCard, ConfirmModal } from "../../components/common";
import hrService from "../../services/hrService";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showCredentialsModal, setShowCredentialsModal] = useState(false);
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeactivateModal, setShowDeactivateModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [credentials, setCredentials] = useState(null);
    const [search, setSearch] = useState("");
    const [filterDept, setFilterDept] = useState("");
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "", email: "", password: "", role: "employee",
        department_id: "", phone: "", designation: "",
        date_of_joining: "", salary: ""
    });
    const [resetPassword, setResetPassword] = useState("");

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [empRes, deptRes] = await Promise.all([
                hrService.getEmployees(),
                hrService.getDepartments()
            ]);
            setEmployees(empRes.data || []);
            setDepartments(deptRes.data || []);
        } catch (err) { toast.error("Failed to load data"); }
        finally { setLoading(false); }
    };

    const filteredEmployees = employees.filter(e =>
        (e.name?.toLowerCase().includes(search.toLowerCase()) ||
            e.email?.toLowerCase().includes(search.toLowerCase())) &&
        (!filterDept || e.department_id == filterDept)
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.password) {
            return toast.error("Name, Email and Password are required");
        }
        if (formData.password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        setSaving(true);
        try {
            const res = await hrService.createEmployee(formData);
            toast.success("Employee account created!");
            setShowModal(false);
            // Show credentials modal
            setCredentials(res.credentials);
            setShowCredentialsModal(true);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to create");
        }
        finally { setSaving(false); }
    };

    const handleResetPassword = async () => {
        if (!resetPassword || resetPassword.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }
        setSaving(true);
        try {
            const res = await hrService.resetEmployeePassword(selectedEmployee.id, resetPassword);
            toast.success("Password reset!");
            setShowResetModal(false);
            setCredentials(res.credentials);
            setShowCredentialsModal(true);
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); setResetPassword(""); }
    };

    const handleDeactivate = async () => {
        try {
            await hrService.deactivateEmployee(selectedEmployee.id);
            toast.success("Employee deactivated");
            setShowDeactivateModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const copyCredentials = () => {
        const text = `Email: ${credentials?.email}\nPassword: ${credentials?.password}\nLogin: ${window.location.origin}/login`;
        navigator.clipboard.writeText(text);
        toast.success("Credentials copied!");
    };

    const openModal = (emp = null) => {
        setSelectedEmployee(emp);
        if (emp) {
            // Edit mode - would need different form
        } else {
            setFormData({
                name: "", email: "", password: "", role: "employee",
                department_id: "", phone: "", designation: "",
                date_of_joining: new Date().toISOString().split('T')[0], salary: ""
            });
        }
        setShowModal(true);
    };

    const roleOptions = [
        { value: "employee", label: "Employee" },
        { value: "hr_manager", label: "HR Manager" },
        { value: "finance_manager", label: "Finance Manager" },
        { value: "inventory_manager", label: "Inventory Manager" },
        { value: "sales_manager", label: "Sales Manager" },
        { value: "project_manager", label: "Project Manager" },
    ];

    const columns = [
        {
            key: "name", label: "Employee", render: (_, r) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                        {r.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-xs theme-text-muted">{r.employee_id}</p>
                    </div>
                </div>
            )
        },
        {
            key: "email", label: "Contact", render: (_, r) => (
                <div className="text-sm">
                    <p className="flex items-center gap-1"><FaEnvelope className="w-3 h-3 text-gray-400" />{r.email}</p>
                    {r.phone && <p className="theme-text-muted flex items-center gap-1"><FaPhone className="w-3 h-3" />{r.phone}</p>}
                </div>
            )
        },
        { key: "department_name", label: "Department", render: v => v || "-" },
        { key: "designation", label: "Designation", render: v => v || "-" },
        {
            key: "user_role", label: "Role", render: v => (
                <Badge variant={v === "hr_manager" ? "purple" : v === "finance_manager" ? "success" : "primary"}>
                    {v?.replace("_", " ").toUpperCase() || "EMPLOYEE"}
                </Badge>
            )
        },
        {
            key: "status", label: "Status", render: (v, r) => (
                <Badge variant={r.user_active !== false && v !== "inactive" ? "success" : "danger"}>
                    {r.user_active !== false && v !== "inactive" ? "Active" : "Inactive"}
                </Badge>
            )
        },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <div className="flex gap-1">
                    <button onClick={() => { setSelectedEmployee(r); setShowResetModal(true); }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-blue-500" title="Reset Password">
                        <FaKey className="w-4 h-4" />
                    </button>
                    <button onClick={() => { setSelectedEmployee(r); setShowDeactivateModal(true); }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500" title="Deactivate">
                        <FaBan className="w-4 h-4" />
                    </button>
                </div>
            )
        },
    ];

    const stats = {
        total: employees.length,
        active: employees.filter(e => e.status !== 'inactive' && e.user_active !== false).length,
        managers: employees.filter(e => e.user_role?.includes('manager')).length,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">Employees</h1>
                    <p className="theme-text-muted">Create and manage employee accounts</p>
                </div>
                <Button icon={<FaPlus />} onClick={() => openModal()}>Add Employee</Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Employees" value={stats.total} icon={<FaUserTie />} iconBg="blue" />
                <StatCard title="Active" value={stats.active} iconBg="green" />
                <StatCard title="Managers" value={stats.managers} iconBg="purple" />
                <StatCard title="Departments" value={departments.length} iconBg="amber" />
            </div>

            <Card padding="md">
                <div className="flex gap-4">
                    <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} icon={<FaSearch />} className="flex-1" />
                    <Select value={filterDept} onChange={e => setFilterDept(e.target.value)}
                        options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="All Departments" className="w-48" />
                </div>
            </Card>

            <Card padding="none">
                <Table columns={columns} data={filteredEmployees} loading={loading} emptyMessage="No employees found" />
            </Card>

            {/* Create Employee Modal */}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Employee Account" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm text-blue-700 dark:text-blue-300">
                        ℹ️ This will create a user account. Share the credentials with the employee so they can log in.
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Full Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required />
                        <Input label="Email *" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@company.com" required />
                        <Input label="Password *" type="text" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder="Min 6 characters" required />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                        <Select label="Role *" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} options={roleOptions} />
                        <Select label="Department" value={formData.department_id} onChange={e => setFormData({ ...formData, department_id: e.target.value })} options={departments.map(d => ({ value: d.id, label: d.name }))} placeholder="Select..." />
                        <Input label="Designation" value={formData.designation} onChange={e => setFormData({ ...formData, designation: e.target.value })} placeholder="Software Engineer" />
                        <Input label="Date of Joining" type="date" value={formData.date_of_joining} onChange={e => setFormData({ ...formData, date_of_joining: e.target.value })} />
                    </div>
                    <Input label="Salary (Monthly)" type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} placeholder="50000" />

                    <div className="flex justify-end gap-3 pt-4 border-t theme-border-light">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" loading={saving} icon={<FaCheck />}>Create Account</Button>
                    </div>
                </form>
            </Modal>

            {/* Credentials Modal */}
            <Modal isOpen={showCredentialsModal} onClose={() => setShowCredentialsModal(false)} title="✅ Account Created" size="md">
                <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <p className="text-green-700 dark:text-green-300 text-sm mb-3">
                            Share these credentials with the employee so they can log in:
                        </p>
                        <div className="space-y-2 font-mono text-sm bg-white dark:bg-gray-900 p-3 rounded border">
                            <p><span className="text-gray-500">Email:</span> <strong>{credentials?.email}</strong></p>
                            <p><span className="text-gray-500">Password:</span> <strong>{credentials?.password}</strong></p>
                            <p><span className="text-gray-500">Login URL:</span> {window.location.origin}/login</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowCredentialsModal(false)}>Close</Button>
                        <Button icon={<FaCopy />} onClick={copyCredentials}>Copy Credentials</Button>
                    </div>
                </div>
            </Modal>

            {/* Reset Password Modal */}
            <Modal isOpen={showResetModal} onClose={() => setShowResetModal(false)} title="Reset Password" size="sm">
                <div className="space-y-4">
                    <p className="text-sm theme-text-muted">Reset password for <strong>{selectedEmployee?.name}</strong></p>
                    <Input label="New Password" type="text" value={resetPassword} onChange={e => setResetPassword(e.target.value)} placeholder="Min 6 characters" />
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" onClick={() => setShowResetModal(false)}>Cancel</Button>
                        <Button onClick={handleResetPassword} loading={saving}>Reset Password</Button>
                    </div>
                </div>
            </Modal>

            {/* Deactivate Modal */}
            <ConfirmModal
                isOpen={showDeactivateModal}
                onClose={() => setShowDeactivateModal(false)}
                onConfirm={handleDeactivate}
                title="Deactivate Employee"
                message={`Deactivate "${selectedEmployee?.name}"? They will no longer be able to log in.`}
                confirmText="Deactivate"
                variant="danger"
            />
        </div>
    );
}
