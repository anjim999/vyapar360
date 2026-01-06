// src/pages/dashboard/UserDashboard.jsx
import { FaBuilding, FaUsers, FaFileInvoiceDollar } from "react-icons/fa";
import { Card } from "../../components/common";
import { QuickActionCard } from "./components";

export function UserDashboard() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold theme-text-primary">Welcome to Vyapar360</h1>
                <p className="theme-text-muted">Get started by registering your company or browsing the marketplace</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <QuickActionCard
                    icon={<FaBuilding className="text-blue-500" />}
                    title="Register Company"
                    description="Create your company profile and access all ERP features"
                    link="/request-company"
                    buttonText="Get Started"
                    gradient="from-blue-500 to-purple-600"
                />
                <QuickActionCard
                    icon={<FaUsers className="text-green-500" />}
                    title="Browse Marketplace"
                    description="Discover businesses and services across India"
                    link="/marketplace"
                    buttonText="Explore"
                    gradient="from-green-500 to-teal-600"
                />
                <QuickActionCard
                    icon={<FaFileInvoiceDollar className="text-amber-500" />}
                    title="My Requests"
                    description="Track your company registration requests"
                    link="/my-company-requests"
                    buttonText="View Status"
                    gradient="from-amber-500 to-orange-600"
                />
            </div>

            {/* Features Preview */}
            <Card title="🚀 What You Can Do" padding="lg" className="mt-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: "👥", label: "HR Management", desc: "Employees, Attendance, Payroll" },
                        { icon: "💰", label: "Finance", desc: "Invoices, Expenses, Reports" },
                        { icon: "📦", label: "Inventory", desc: "Stock, Products, Orders" },
                        { icon: "🤝", label: "CRM", desc: "Leads, Customers, Sales" },
                    ].map((feature, i) => (
                        <div key={i} className="text-center p-4 rounded-xl theme-bg-tertiary">
                            <span className="text-3xl">{feature.icon}</span>
                            <h4 className="font-medium theme-text-primary mt-2">{feature.label}</h4>
                            <p className="text-xs theme-text-muted mt-1">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

export default UserDashboard;
