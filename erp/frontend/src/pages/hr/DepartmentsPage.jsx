// src/pages/hr/DepartmentsPage.jsx
// Department management page

import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaUsers, FaBuilding } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Modal, Input, Textarea, Select, ConfirmModal, EmptyState, Badge } from "../../components/common";
import hrService from "../../services/hrService";

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        manager_id: "",
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, empRes] = await Promise.all([
                hrService.getDepartments(),
                hrService.getEmployees(),
            ]);
            setDepartments(deptRes.data || []);
            setEmployees(empRes.data || []);
        } catch (err) {
            toast.error("Failed to fetch departments");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (dept = null) => {
        if (dept) {
            setSelectedDept(dept);
            setFormData({
                name: dept.name,
                description: dept.description || "",
                manager_id: dept.manager_id || "",
            });
        } else {
            setSelectedDept(null);
            setFormData({ name: "", description: "", manager_id: "" });
        }
        setShowModal(true);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) {
            toast.error("Department name is required");
            return;
        }

        setSaving(true);
        try {
            if (selectedDept) {
                await hrService.updateDepartment(selectedDept.id, formData);
                toast.success("Department updated successfully");
            } else {
                await hrService.createDepartment(formData);
                toast.success("Department created successfully");
            }
            setShowModal(false);
            fetchData();
        } catch (err) {
            toast.error("Failed to save department");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await hrService.deleteDepartment(selectedDept.id);
            toast.success("Department deleted successfully");
            setShowDeleteModal(false);
            fetchData();
        } catch (err) {
            toast.error("Failed to delete department");
        }
    };

    const openDeleteModal = (dept) => {
        setSelectedDept(dept);
        setShowDeleteModal(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">Departments</h1>
                    <p className="theme-text-muted">Organize your team by departments</p>
                </div>
                <Button icon={<FaPlus />} onClick={() => handleOpenModal()}>
                    Add Department
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card padding="md" hover>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white">
                            <FaBuilding className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm theme-text-muted">Total Departments</p>
                            <p className="text-2xl font-bold theme-text-primary">{departments.length}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" hover>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white">
                            <FaUsers className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm theme-text-muted">Total Employees</p>
                            <p className="text-2xl font-bold theme-text-primary">{employees.length}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" hover>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                            <FaUsers className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm theme-text-muted">Avg per Dept</p>
                            <p className="text-2xl font-bold theme-text-primary">
                                {departments.length ? Math.round(employees.length / departments.length) : 0}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Departments Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} padding="md">
                            <div className="animate-pulse">
                                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : departments.length === 0 ? (
                <Card padding="lg">
                    <EmptyState
                        icon="🏢"
                        title="No Departments Yet"
                        description="Create your first department to organize your team"
                        action={
                            <Button icon={<FaPlus />} onClick={() => handleOpenModal()}>
                                Create Department
                            </Button>
                        }
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {departments.map((dept) => (
                        <Card key={dept.id} padding="md" hover className="group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <FaBuilding className="w-5 h-5" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleOpenModal(dept)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 theme-text-muted hover:text-blue-500 transition-colors"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => openDeleteModal(dept)}
                                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 theme-text-muted hover:text-red-500 transition-colors"
                                    >
                                        <FaTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold theme-text-primary mb-1">{dept.name}</h3>
                            {dept.description && (
                                <p className="text-sm theme-text-muted mb-3 line-clamp-2">{dept.description}</p>
                            )}
                            <div className="flex items-center justify-between pt-3 border-t theme-border-light">
                                <div className="flex items-center gap-2 text-sm theme-text-muted">
                                    <FaUsers className="w-4 h-4" />
                                    <span>{dept.employee_count || 0} employees</span>
                                </div>
                                {dept.manager_name && (
                                    <Badge variant="primary" size="sm">
                                        {dept.manager_name}
                                    </Badge>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={selectedDept ? "Edit Department" : "Add Department"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Department Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g., Engineering, Marketing"
                        required
                    />
                    <Textarea
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Brief description of the department"
                        rows={3}
                    />
                    <Select
                        label="Department Manager"
                        name="manager_id"
                        value={formData.manager_id}
                        onChange={handleChange}
                        options={employees.map((e) => ({ value: e.id, label: e.name }))}
                        placeholder="Select a manager (optional)"
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" onClick={() => setShowModal(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saving}>
                            {selectedDept ? "Save Changes" : "Create Department"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Department"
                message={`Are you sure you want to delete "${selectedDept?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
}
