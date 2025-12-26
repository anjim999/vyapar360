// src/pages/inventory/CategoriesPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaFolder } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Modal, Input, Textarea, ConfirmModal, EmptyState } from "../../components/common";
import inventoryService from "../../services/inventoryService";

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCat, setSelectedCat] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await inventoryService.getCategories();
            setCategories(res.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error("Name required");
        setSaving(true);
        try {
            if (selectedCat) {
                await inventoryService.updateCategory(selectedCat.id, formData);
                toast.success("Updated");
            } else {
                await inventoryService.createCategory(formData);
                toast.success("Created");
            }
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await inventoryService.deleteCategory(selectedCat.id);
            toast.success("Deleted");
            setShowDeleteModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const openModal = (cat = null) => {
        setSelectedCat(cat);
        setFormData(cat ? { name: cat.name, description: cat.description || "" } : { name: "", description: "" });
        setShowModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold theme-text-primary">Categories</h1><p className="theme-text-muted">Organize products</p></div>
                <Button icon={<FaPlus />} onClick={() => openModal()}>Add Category</Button>
            </div>
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <Card key={i} padding="md"><div className="animate-pulse h-20 bg-gray-200 dark:bg-gray-700 rounded" /></Card>)}
                </div>
            ) : categories.length === 0 ? (
                <Card><EmptyState icon="📁" title="No Categories" description="Create your first category" action={<Button onClick={() => openModal()}>Create</Button>} /></Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => (
                        <Card key={cat.id} padding="md" hover className="group">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center"><FaFolder className="text-blue-500" /></div>
                                    <div>
                                        <h3 className="font-semibold theme-text-primary">{cat.name}</h3>
                                        <p className="text-sm theme-text-muted">{cat.product_count || 0} products</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openModal(cat)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"><FaEdit className="text-sm" /></button>
                                    <button onClick={() => { setSelectedCat(cat); setShowDeleteModal(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-red-500"><FaTrash className="text-sm" /></button>
                                </div>
                            </div>
                            {cat.description && <p className="mt-2 text-sm theme-text-muted line-clamp-2">{cat.description}</p>}
                        </Card>
                    ))}
                </div>
            )}
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedCat ? "Edit Category" : "Add Category"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Textarea label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>{selectedCat ? "Update" : "Create"}</Button></div>
                </form>
            </Modal>
            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete" message={`Delete "${selectedCat?.name}"?`} variant="danger" />
        </div>
    );
}
