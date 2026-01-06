// src/pages/dashboard/HRDashboard.jsx
import { FaUsers, FaClock } from "react-icons/fa";
import { FaCalendarCheck, FaUserClock } from "react-icons/fa";
import { Card } from "../../components/common";
import { StatCard, QuickLink } from "./components";

export function HRDashboard({ data, userName }) {
    const summary = data?.summary || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">👥 HR Dashboard</h1>
                    <p className="theme-text-muted text-sm">Welcome back, {userName}! Manage your team effectively</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Employees"
                    value={summary.totalEmployees || 0}
                    icon={<FaUsers />}
                    iconBg="blue"
                    trend={5}
                />
                <StatCard
                    label="Present Today"
                    value={summary.presentToday || 0}
                    icon={<FaCalendarCheck />}
                    iconBg="green"
                />
                <StatCard
                    label="On Leave"
                    value={summary.onLeave || 0}
                    icon={<FaUserClock />}
                    iconBg="amber"
                />
                <StatCard
                    label="Pending Leaves"
                    value={summary.pendingLeaves || 0}
                    icon={<FaClock />}
                    iconBg="red"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card title="📋 Recent HR Activity" padding="md">
                    <div className="space-y-3">
                        {[
                            { text: "New employee John joined", time: "2 hours ago", icon: "👤" },
                            { text: "Leave approved for Sarah", time: "4 hours ago", icon: "✅" },
                            { text: "Attendance marked for 45 employees", time: "Today 9:00 AM", icon: "📝" },
                            { text: "Department 'Engineering' updated", time: "Yesterday", icon: "🏢" },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg theme-bg-tertiary">
                                <span className="text-xl">{item.icon}</span>
                                <div className="flex-1">
                                    <p className="text-sm theme-text-primary">{item.text}</p>
                                    <p className="text-xs theme-text-muted">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="⚡ Quick Actions" padding="md">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickLink to="/hr/employees" icon="👥" label="Employees" size="sm" />
                        <QuickLink to="/hr/attendance" icon="📋" label="Attendance" size="sm" />
                        <QuickLink to="/hr/leaves" icon="🗓️" label="Leaves" size="sm" />
                        <QuickLink to="/hr/departments" icon="🏢" label="Departments" size="sm" />
                        <QuickLink to="/hr/holidays" icon="🎉" label="Holidays" size="sm" />
                        <QuickLink to="/teams" icon="💬" label="Team Chat" size="sm" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default HRDashboard;
