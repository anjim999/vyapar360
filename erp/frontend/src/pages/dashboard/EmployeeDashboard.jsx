// src/pages/dashboard/EmployeeDashboard.jsx
import { FaClock, FaTasks, FaCheckCircle } from "react-icons/fa";
import { FaCalendarCheck, FaUserClock } from "react-icons/fa";
import { Card } from "../../components/common";
import { StatCard, QuickLink } from "./components";

export function EmployeeDashboard({ data, userName }) {
    const summary = data?.summary || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">🏠 My Dashboard</h1>
                    <p className="theme-text-muted text-sm">Welcome back, {userName}! Here's your overview</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="My Tasks"
                    value={summary.myTasks || 0}
                    icon={<FaTasks />}
                    iconBg="blue"
                />
                <StatCard
                    label="Tasks Completed"
                    value={summary.tasksCompleted || 0}
                    icon={<FaCheckCircle />}
                    iconBg="green"
                />
                <StatCard
                    label="Leave Balance"
                    value={summary.leaveBalance || 0}
                    icon={<FaCalendarCheck />}
                    iconBg="amber"
                />
                <StatCard
                    label="Attendance %"
                    value={summary.attendancePercent || 0}
                    icon={<FaUserClock />}
                    iconBg="purple"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* My Tasks */}
                <Card title="📋 My Pending Tasks" padding="md">
                    <div className="space-y-3">
                        {[
                            { name: "Complete project documentation", priority: "High", due: "Today" },
                            { name: "Review code changes", priority: "Medium", due: "Tomorrow" },
                            { name: "Update status report", priority: "Low", due: "This week" },
                        ].map((task, i) => (
                            <div key={i} className="flex justify-between items-center p-3 rounded-lg theme-bg-tertiary">
                                <div>
                                    <span className="font-medium theme-text-primary">{task.name}</span>
                                    <p className="text-xs theme-text-muted">Due: {task.due}</p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${task.priority === 'High' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                                        task.priority === 'Medium' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                            'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                    {task.priority}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="⚡ Quick Actions" padding="md">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickLink to="/projects/tasks" icon="✅" label="My Tasks" size="sm" />
                        <QuickLink to="/hr/attendance" icon="📋" label="Attendance" size="sm" />
                        <QuickLink to="/hr/leaves" icon="🗓️" label="Apply Leave" size="sm" />
                        <QuickLink to="/teams" icon="💬" label="Team Chat" size="sm" />
                        <QuickLink to="/profile" icon="👤" label="My Profile" size="sm" />
                        <QuickLink to="/notifications" icon="🔔" label="Notifications" size="sm" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default EmployeeDashboard;
