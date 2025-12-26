// src/pages/inventory/ProductsPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaBoxes, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Badge, Modal, Input, Textarea, Select, ConfirmModal } from "../../components/common";
import inventoryService from "../../services/inventoryService";

export default function ProductsPage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("");
    const [formData, setFormData] = useState({ name: "", sku: "", description: "", category_id: "", unit: "pcs", cost_price: "", selling_price: "", current_stock: "", min_stock_level: "", location: "" });
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, catRes] = await Promise.all([inventoryService.getProducts(), inventoryService.getCategories()]);
            setProducts(prodRes.data || []);
            setCategories(catRes.data || []);
        } catch (err) { toast.error("Failed to fetch products"); }
        finally { setLoading(false); }
    };

    const filteredProducts = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase());
        const matchCat = !filterCategory || p.category_id?.toString() === filterCategory;
        return matchSearch && matchCat;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name) return toast.error("Name required");
        setSaving(true);
        try {
            if (selectedProduct) {
                await inventoryService.updateProduct(selectedProduct.id, formData);
                toast.success("Product updated");
            } else {
                await inventoryService.createProduct(formData);
                toast.success("Product created");
            }
            setShowModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        try {
            await inventoryService.deleteProduct(selectedProduct.id);
            toast.success("Deleted");
            setShowDeleteModal(false);
            fetchData();
        } catch (err) { toast.error("Failed"); }
    };

    const openModal = (product = null) => {
        setSelectedProduct(product);
        setFormData(product ? { ...product } : { name: "", sku: "", description: "", category_id: "", unit: "pcs", cost_price: "", selling_price: "", current_stock: "", min_stock_level: "", location: "" });
        setShowModal(true);
    };

    const columns = [
        {
            key: "name", label: "Product", render: (_, r) => (
                <div><p className="font-medium">{r.name}</p><p className="text-xs theme-text-muted">{r.sku || "No SKU"}</p></div>
            )
        },
        { key: "category_name", label: "Category", render: v => v || "-" },
        {
            key: "current_stock", label: "Stock", render: (v, r) => (
                <div className="flex items-center gap-2">
                    <span className={v <= r.min_stock_level ? "text-red-500 font-bold" : ""}>{v} {r.unit}</span>
                    {v <= r.min_stock_level && <FaExclamationTriangle className="text-red-500" />}
                </div>
            )
        },
        { key: "cost_price", label: "Cost", render: v => `₹${parseFloat(v || 0).toFixed(2)}` },
        { key: "selling_price", label: "Price", render: v => `₹${parseFloat(v || 0).toFixed(2)}` },
        { key: "is_active", label: "Status", render: v => <Badge variant={v ? "success" : "danger"}>{v ? "Active" : "Inactive"}</Badge> },
        {
            key: "actions", label: "", sortable: false, render: (_, r) => (
                <div className="flex gap-1">
                    <button onClick={() => openModal(r)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"><FaEdit /></button>
                    <button onClick={() => { setSelectedProduct(r); setShowDeleteModal(true); }} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-red-500"><FaTrash /></button>
                </div>
            )
        },
    ];

    const lowStockCount = products.filter(p => p.current_stock <= p.min_stock_level).length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold theme-text-primary">Products</h1><p className="theme-text-muted">Manage your inventory</p></div>
                <Button icon={<FaPlus />} onClick={() => openModal()}>Add Product</Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card padding="md" hover><p className="text-sm theme-text-muted">Total Products</p><p className="text-2xl font-bold">{products.length}</p></Card>
                <Card padding="md" hover><p className="text-sm theme-text-muted">Categories</p><p className="text-2xl font-bold text-blue-500">{categories.length}</p></Card>
                <Card padding="md" hover><p className="text-sm theme-text-muted">Low Stock</p><p className="text-2xl font-bold text-red-500">{lowStockCount}</p></Card>
                <Card padding="md" hover><p className="text-sm theme-text-muted">Total Value</p><p className="text-2xl font-bold text-green-500">₹{products.reduce((s, p) => s + (p.current_stock * p.cost_price), 0).toFixed(0)}</p></Card>
            </div>
            <Card padding="md">
                <div className="flex gap-4">
                    <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} icon={<FaSearch />} className="flex-1" />
                    <Select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} options={categories.map(c => ({ value: c.id.toString(), label: c.name }))} placeholder="All Categories" className="w-48" />
                </div>
            </Card>
            <Card padding="none"><Table columns={columns} data={filteredProducts} loading={loading} /></Card>
            <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={selectedProduct ? "Edit Product" : "Add Product"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                        <Input label="SKU" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                        <Select label="Category" value={formData.category_id} onChange={e => setFormData({ ...formData, category_id: e.target.value })} options={categories.map(c => ({ value: c.id, label: c.name }))} />
                        <Input label="Unit" value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} placeholder="pcs, kg, ltr" />
                        <Input label="Cost Price" type="number" value={formData.cost_price} onChange={e => setFormData({ ...formData, cost_price: e.target.value })} />
                        <Input label="Selling Price" type="number" value={formData.selling_price} onChange={e => setFormData({ ...formData, selling_price: e.target.value })} />
                        <Input label="Current Stock" type="number" value={formData.current_stock} onChange={e => setFormData({ ...formData, current_stock: e.target.value })} />
                        <Input label="Min Stock Level" type="number" value={formData.min_stock_level} onChange={e => setFormData({ ...formData, min_stock_level: e.target.value })} />
                    </div>
                    <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                    <Textarea label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button><Button type="submit" loading={saving}>{selectedProduct ? "Update" : "Create"}</Button></div>
                </form>
            </Modal>
            <ConfirmModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onConfirm={handleDelete} title="Delete Product" message={`Delete "${selectedProduct?.name}"?`} variant="danger" />
        </div>
    );
}
