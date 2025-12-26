// src/pages/inventory/StockPage.jsx
import { useState, useEffect } from "react";
import { FaPlus, FaMinus, FaHistory, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Button, Card, Table, Modal, Input, Select, Textarea, Badge, StatCard } from "../../components/common";
import inventoryService from "../../services/inventoryService";

export default function StockPage() {
    const [products, setProducts] = useState([]);
    const [movements, setMovements] = useState([]);
    const [lowStockAlerts, setLowStockAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdjustModal, setShowAdjustModal] = useState(false);
    const [adjustData, setAdjustData] = useState({ product_id: "", type: "in", quantity: "", notes: "" });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState("alerts");

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [prodRes, movRes, alertRes] = await Promise.all([
                inventoryService.getProducts(),
                inventoryService.getStockMovements(),
                inventoryService.getLowStockAlerts()
            ]);
            setProducts(prodRes.data || []);
            setMovements(movRes.data || []);
            setLowStockAlerts(alertRes.data || []);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    const handleAdjust = async (e) => {
        e.preventDefault();
        if (!adjustData.product_id || !adjustData.quantity) return toast.error("Fill required fields");
        setSaving(true);
        try {
            await inventoryService.adjustStock({
                ...adjustData,
                quantity: parseFloat(adjustData.quantity)
            });
            toast.success("Stock adjusted");
            setShowAdjustModal(false);
            setAdjustData({ product_id: "", type: "in", quantity: "", notes: "" });
            fetchData();
        } catch (err) { toast.error("Failed"); }
        finally { setSaving(false); }
    };

    const alertColumns = [
        { key: "name", label: "Product" },
        { key: "current_stock", label: "Current", render: v => <span className="text-red-500 font-bold">{v}</span> },
        { key: "min_stock_level", label: "Min Required" },
        { key: "category_name", label: "Category", render: v => v || "-" },
        {
            key: "action", label: "", render: (_, r) => (
                <Button size="sm" onClick={() => { setAdjustData({ product_id: r.id, type: "in", quantity: "", notes: "" }); setShowAdjustModal(true); }}>
                    <FaPlus className="mr-1" /> Add Stock
                </Button>
            )
        },
    ];

    const movementColumns = [
        { key: "created_at", label: "Date", render: v => new Date(v).toLocaleDateString() },
        { key: "product_name", label: "Product" },
        { key: "type", label: "Type", render: v => <Badge variant={v === "in" ? "success" : "danger"}>{v === "in" ? "Stock In" : "Stock Out"}</Badge> },
        { key: "quantity", label: "Qty", render: (v, r) => <span className={r.type === "in" ? "text-green-500" : "text-red-500"}>{r.type === "in" ? "+" : "-"}{v}</span> },
        { key: "reference_type", label: "Reference", render: v => v || "-" },
        { key: "created_by_name", label: "By", render: v => v || "-" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div><h1 className="text-2xl font-bold theme-text-primary">Stock Management</h1><p className="theme-text-muted">Track and adjust inventory</p></div>
                <div className="flex gap-2">
                    <Button variant="success" icon={<FaPlus />} onClick={() => { setAdjustData({ ...adjustData, type: "in" }); setShowAdjustModal(true); }}>Stock In</Button>
                    <Button variant="danger" icon={<FaMinus />} onClick={() => { setAdjustData({ ...adjustData, type: "out" }); setShowAdjustModal(true); }}>Stock Out</Button>
                </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Products" value={products.length} iconBg="blue" />
                <StatCard title="Low Stock Alerts" value={lowStockAlerts.length} icon={<FaExclamationTriangle />} iconBg="red" />
                <StatCard title="Stock In Today" value={movements.filter(m => m.type === "in" && new Date(m.created_at).toDateString() === new Date().toDateString()).length} iconBg="green" />
                <StatCard title="Stock Out Today" value={movements.filter(m => m.type === "out" && new Date(m.created_at).toDateString() === new Date().toDateString()).length} iconBg="yellow" />
            </div>
            <Card padding="md">
                <div className="flex gap-4 border-b theme-border-light pb-4">
                    <button onClick={() => setActiveTab("alerts")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "alerts" ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "theme-text-muted"}`}>
                        <FaExclamationTriangle className="inline mr-2" />Low Stock ({lowStockAlerts.length})
                    </button>
                    <button onClick={() => setActiveTab("history")} className={`px-4 py-2 rounded-lg font-medium ${activeTab === "history" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" : "theme-text-muted"}`}>
                        <FaHistory className="inline mr-2" />Movement History
                    </button>
                </div>
                <div className="mt-4">
                    {activeTab === "alerts" ? (
                        <Table columns={alertColumns} data={lowStockAlerts} loading={loading} emptyMessage="No low stock alerts 🎉" />
                    ) : (
                        <Table columns={movementColumns} data={movements} loading={loading} emptyMessage="No movements" />
                    )}
                </div>
            </Card>
            <Modal isOpen={showAdjustModal} onClose={() => setShowAdjustModal(false)} title={adjustData.type === "in" ? "Stock In" : "Stock Out"}>
                <form onSubmit={handleAdjust} className="space-y-4">
                    <Select label="Product" value={adjustData.product_id} onChange={e => setAdjustData({ ...adjustData, product_id: e.target.value })} options={products.map(p => ({ value: p.id, label: `${p.name} (${p.current_stock} ${p.unit})` }))} required />
                    <Select label="Type" value={adjustData.type} onChange={e => setAdjustData({ ...adjustData, type: e.target.value })} options={[{ value: "in", label: "Stock In" }, { value: "out", label: "Stock Out" }]} />
                    <Input label="Quantity" type="number" value={adjustData.quantity} onChange={e => setAdjustData({ ...adjustData, quantity: e.target.value })} required />
                    <Textarea label="Notes" value={adjustData.notes} onChange={e => setAdjustData({ ...adjustData, notes: e.target.value })} rows={2} />
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowAdjustModal(false)}>Cancel</Button><Button type="submit" variant={adjustData.type === "in" ? "success" : "danger"} loading={saving}>{adjustData.type === "in" ? "Add Stock" : "Remove Stock"}</Button></div>
                </form>
            </Modal>
        </div>
    );
}
