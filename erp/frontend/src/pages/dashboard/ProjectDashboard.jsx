// src/pages/dashboard/ProjectDashboard.jsx
import { FaClock, FaProjectDiagram, FaTasks, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";
import { Card } from "../../components/common";
import { StatCard, QuickLink } from "./components";

export function ProjectDashboard({ data, userName }) {
    const summary = data?.summary || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">📊 Projects Dashboard</h1>
                    <p className="theme-text-muted text-sm">Welcome back, {userName}! Track your projects</p>
                </div>
                <div className="flex items-center gap-2 text-sm theme-text-muted">
                    <FaClock className="w-4 h-4" />
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Active Projects"
                    value={summary.activeProjects || 0}
                    icon={<FaProjectDiagram />}
                    iconBg="blue"
                />
                <StatCard
                    label="Tasks In Progress"
                    value={summary.tasksInProgress || 0}
                    icon={<FaTasks />}
                    iconBg="amber"
                />
                <StatCard
                    label="Completed Tasks"
                    value={summary.completedTasks || 0}
                    icon={<FaCheckCircle />}
                    iconBg="green"
                />
                <StatCard
                    label="Overdue Tasks"
                    value={summary.overdueTasks || 0}
                    icon={<FaExclamationTriangle />}
                    iconBg="red"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Projects */}
                <Card title="📋 Recent Projects" padding="md">
                    <div className="space-y-3">
                        {[
                            { name: "Website Redesign", status: "In Progress", progress: 65 },
                            { name: "Mobile App v2.0", status: "In Progress", progress: 40 },
                            { name: "API Integration", status: "Review", progress: 90 },
                            { name: "Database Migration", status: "Planning", progress: 10 },
                        ].map((project, i) => (
                            <div key={i} className="p-3 rounded-lg theme-bg-tertiary">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium theme-text-primary">{project.name}</span>
                                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                        {project.status}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                                <span className="text-xs theme-text-muted">{project.progress}% complete</span>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Quick Actions */}
                <Card title="⚡ Quick Actions" padding="md">
                    <div className="grid grid-cols-2 gap-3">
                        <QuickLink to="/projects" icon="📊" label="All Projects" size="sm" />
                        <QuickLink to="/projects/tasks" icon="✅" label="Tasks" size="sm" />
                        <QuickLink to="/projects/time-logs" icon="⏱️" label="Time Logs" size="sm" />
                        <QuickLink to="/teams" icon="💬" label="Team Chat" size="sm" />
                    </div>
                </Card>
            </div>
        </div>
    );
}

export default ProjectDashboard;
