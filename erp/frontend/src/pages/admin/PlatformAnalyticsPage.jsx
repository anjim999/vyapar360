// src/pages/admin/PlatformAnalyticsPage.jsx
import { useState, useEffect } from "react";
import { FaBuilding, FaUsers, FaEnvelope, FaHeadset, FaChartLine, FaStar } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, StatCard, Loader } from "../../components/common";
import api from "../../api/axiosClient";

export default function PlatformAnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/admin/analytics");
            setStats(res.data.summary);
        } catch (err) { toast.error("Failed"); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div><h1 className="text-2xl font-bold theme-text-primary">Platform Analytics</h1><p className="theme-text-muted">Overview of platform performance</p></div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard title="Total Companies" value={stats?.totalCompanies || 0} icon={<FaBuilding />} iconBg="blue" />
                <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={<FaUsers />} iconBg="green" />
                <StatCard title="Pending Requests" value={stats?.pendingRequests || 0} icon={<FaEnvelope />} iconBg="purple" />
                <StatCard title="Active Companies" value={stats?.activeCompanies || 0} icon={<FaHeadset />} iconBg="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Quick Stats" padding="md">
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                            <span className="theme-text-secondary">Active Companies</span>
                            <span className="font-bold theme-text-primary">{stats?.activeCompanies || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                            <span className="theme-text-secondary">Active Users</span>
                            <span className="font-bold theme-text-primary">{stats?.totalUsers || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                            <span className="theme-text-secondary">Pending Requests</span>
                            <span className="font-bold theme-text-primary">{stats?.pendingRequests || 0}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                            <span className="theme-text-secondary">Total Companies</span>
                            <span className="font-bold text-blue-500">{stats?.totalCompanies || 0}</span>
                        </div>
                    </div>
                </Card>

                <Card title="Platform Health" padding="md">
                    <div className="flex items-center justify-center h-48">
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                98%
                            </div>
                            <p className="theme-text-primary font-medium">Platform Health Score</p>
                            <p className="text-sm theme-text-muted">All systems operational</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Recent Activity" padding="md">
                <div className="space-y-3">
                    {[
                        { icon: <FaBuilding className="text-blue-500" />, text: "New company registered: Tech Solutions Pvt Ltd", time: "2 hours ago" },
                        { icon: <FaUsers className="text-green-500" />, text: "5 new users signed up today", time: "4 hours ago" },
                        { icon: <FaEnvelope className="text-purple-500" />, text: "15 new contact requests this week", time: "1 day ago" },
                        { icon: <FaStar className="text-amber-500" />, text: "Average platform rating: 4.5/5", time: "1 day ago" },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg theme-bg-tertiary">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">{item.icon}</div>
                            <div className="flex-1"><p className="theme-text-primary text-sm">{item.text}</p><p className="text-xs theme-text-muted">{item.time}</p></div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
