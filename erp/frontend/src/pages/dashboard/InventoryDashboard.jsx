// src/pages/dashboard/InventoryDashboard.jsx
import { FaClock, FaBoxes, FaWallet, FaExclamationTriangle, FaShoppingCart } from "react-icons/fa";
import { Card } from "../../components/common";
import { StatCard, QuickLink } from "./components";

export function InventoryDashboard({ data, userName }) {
    const summary = data?.summary || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">📦 Inventory Dashboard</h1>
                    <p className="theme-text-muted text-sm">Welcome back, {userName}! Manage your stock</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Products"
                    value={summary.totalProducts || 0}
                    icon={<FaBoxes />}
                    iconBg="blue"
                />
                <StatCard
                    label="Stock Value"
                    value={summary.stockValue || 0}
                    icon={<FaWallet />}
                    iconBg="green"
                    prefix="₹"
                />
                <StatCard
                    label="Low Stock Items"
                    value={summary.lowStockItems || 0}
                    icon={<FaExclamationTriangle />}
                    iconBg="amber"
                />
                <StatCard
                    label="Pending Orders"
                    value={summary.pendingOrders || 0}
                    icon={<FaShoppingCart />}
                    iconBg="purple"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <Card title="⚠️ Low Stock Alerts" padding="md">
                    <div className="space-y-3">
                        {[
                            { name: "Product A", stock: 5, minStock: 20 },
                            { name: "Product B", stock: 8, minStock: 15 },
                            { name: "Product C", stock: 3, minStock: 10 },
                        ].map((item, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                                <div>
                                    <span className="font-medium theme-text-primary">{item.name}</span>
                                    <p className="text-xs theme-text-muted">Min: {item.minStock} units</p>
                                </div>
                                <span className="text-red-500 font-bold">{item.stock} left</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="⚡ Quick Actions" padding="md">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickLink to="/inventory/products" icon="📦" label="Products" size="sm" />
                        <QuickLink to="/inventory/stock" icon="📊" label="Stock" size="sm" />
                        <QuickLink to="/inventory/purchase-orders" icon="🛒" label="Orders" size="sm" />
                        <QuickLink to="/inventory/categories" icon="📁" label="Categories" size="sm" />
                        <QuickLink to="/inventory/alerts" icon="⚠️" label="Alerts" size="sm" />
                        <QuickLink to="/teams" icon="💬" label="Team Chat" size="sm" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default InventoryDashboard;
