import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useTheme } from "../context/ThemeContext";

// Color palette
const COLORS = {
    primary: "#3b82f6",
    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
    purple: "#8b5cf6",
    cyan: "#06b6d4",
    pink: "#ec4899",
};

const PIE_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6"];

// Custom Tooltip Component
function CustomTooltip({ active, payload, label, isDark }) {
    if (!active || !payload || !payload.length) return null;

    return (
        <div
            className={`px-3 py-2 rounded-lg shadow-lg border ${isDark
                    ? "bg-slate-800 border-slate-700 text-white"
                    : "bg-white border-gray-200 text-gray-900"
                }`}
        >
            <p className="text-xs font-medium mb-1">{label}</p>
            {payload.map((entry, idx) => (
                <p key={idx} className="text-xs" style={{ color: entry.color }}>
                    {entry.name}: ₹{entry.value?.toLocaleString()}
                </p>
            ))}
        </div>
    );
}

// Revenue Chart (Area Chart)
export function RevenueChart({ data }) {
    const { isDark } = useTheme();

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                        name="Revenue"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// Cash Flow Chart (Bar Chart)
export function CashFlowChart({ data }) {
    const { isDark } = useTheme();

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend
                        wrapperStyle={{ fontSize: 12 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    <Bar
                        dataKey="income"
                        fill={COLORS.success}
                        name="Income"
                        radius={[4, 4, 0, 0]}
                    />
                    <Bar
                        dataKey="expense"
                        fill={COLORS.danger}
                        name="Expense"
                        radius={[4, 4, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

// Project Progress Chart (Stacked Area)
export function ProjectProgressChart({ data }) {
    const { isDark } = useTheme();

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.cyan} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={COLORS.cyan} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="week"
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip />
                    <Legend
                        wrapperStyle={{ fontSize: 12 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    <Area
                        type="monotone"
                        dataKey="planned"
                        stroke={COLORS.cyan}
                        fill="url(#plannedGradient)"
                        name="Planned"
                    />
                    <Area
                        type="monotone"
                        dataKey="actual"
                        stroke={COLORS.purple}
                        fill="url(#actualGradient)"
                        name="Actual"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}

// Expense Distribution Pie Chart
export function ExpenseDistributionChart({ data }) {
    const { isDark } = useTheme();

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        label={({ name, percent }) =>
                            `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `₹${value?.toLocaleString()}`}
                        contentStyle={{
                            backgroundColor: isDark ? "#1e293b" : "#fff",
                            border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
                            borderRadius: "8px",
                            fontSize: "12px",
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

// Line Comparison Chart
export function ComparisonLineChart({ data, lines }) {
    const { isDark } = useTheme();

    return (
        <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDark ? "#334155" : "#e2e8f0"}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                    <Legend
                        wrapperStyle={{ fontSize: 12 }}
                        iconType="circle"
                        iconSize={8}
                    />
                    {lines.map((line, idx) => (
                        <Line
                            key={line.key}
                            type="monotone"
                            dataKey={line.key}
                            stroke={Object.values(COLORS)[idx % Object.values(COLORS).length]}
                            strokeWidth={2}
                            dot={{ r: 3 }}
                            name={line.name}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
