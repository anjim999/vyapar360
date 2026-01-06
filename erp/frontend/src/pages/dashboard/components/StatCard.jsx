// src/pages/dashboard/components/StatCard.jsx
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

export function StatCard({ label, value, icon, iconBg = "blue", prefix = "", trend }) {
    const bgColors = {
        blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
        green: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
        red: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
        purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
        amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
    };

    return (
        <div className="theme-bg-secondary rounded-xl p-4 border theme-border-light hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs theme-text-muted uppercase tracking-wide mb-1">{label}</p>
                    <p className="text-2xl font-bold theme-text-primary">
                        {prefix}{typeof value === "number" ? value.toLocaleString() : value}
                    </p>
                    {trend !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className={`flex items-center text-xs font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
                                {trend >= 0 ? <FaArrowUp className="w-2 h-2 mr-0.5" /> : <FaArrowDown className="w-2 h-2 mr-0.5" />}
                                {Math.abs(trend)}%
                            </span>
                            <span className="text-xs theme-text-muted">vs last month</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColors[iconBg]}`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

export default StatCard;
