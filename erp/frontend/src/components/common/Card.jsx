// src/components/common/Card.jsx
// Reusable Card component with variants

export function Card({
    children,
    title,
    subtitle,
    icon,
    action,
    footer,
    variant = "default",
    padding = "md",
    hover = false,
    className = "",
    onClick,
    ...props
}) {
    const variants = {
        default: "theme-bg-secondary theme-shadow-md border theme-border-light",
        elevated: "theme-bg-secondary theme-shadow-lg border theme-border-light",
        outlined: "bg-transparent border-2 theme-border",
        gradient: "bg-gradient-to-br from-blue-500/10 to-purple-500/10 border theme-border-light backdrop-blur-sm",
        glass: "bg-white/10 dark:bg-gray-900/20 backdrop-blur-lg border border-white/20",
    };

    const paddings = {
        none: "",
        sm: "p-3",
        md: "p-4 sm:p-5",
        lg: "p-5 sm:p-6",
    };

    return (
        <div
            className={`
        rounded-xl transition-all duration-200
        ${variants[variant]}
        ${hover ? "hover:theme-shadow-lg hover:-translate-y-0.5 cursor-pointer" : ""}
        ${className}
      `}
            onClick={onClick}
            {...props}
        >
            {(title || action) && (
                <div className={`flex items-center justify-between gap-4 ${paddings[padding]} pb-0`}>
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                {icon}
                            </div>
                        )}
                        <div>
                            {title && (
                                <h3 className="font-semibold theme-text-primary">{title}</h3>
                            )}
                            {subtitle && (
                                <p className="text-sm theme-text-muted">{subtitle}</p>
                            )}
                        </div>
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className={paddings[padding]}>{children}</div>
            {footer && (
                <div className={`${paddings[padding]} pt-0 border-t theme-border-light mt-2`}>
                    {footer}
                </div>
            )}
        </div>
    );
}

export function StatCard({
    title,
    value,
    change,
    changeType = "neutral", // positive, negative, neutral
    icon,
    iconBg = "blue",
    loading = false,
    className = "",
}) {
    const iconBgColors = {
        blue: "from-blue-500 to-blue-600",
        green: "from-green-500 to-emerald-600",
        red: "from-red-500 to-rose-600",
        yellow: "from-amber-400 to-orange-500",
        purple: "from-purple-500 to-indigo-600",
        pink: "from-pink-500 to-rose-500",
    };

    const changeColors = {
        positive: "text-green-600 dark:text-green-400",
        negative: "text-red-600 dark:text-red-400",
        neutral: "theme-text-muted",
    };

    return (
        <Card className={`${className}`} hover>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="text-sm theme-text-muted mb-1">{title}</p>
                    {loading ? (
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    ) : (
                        <p className="text-2xl sm:text-3xl font-bold theme-text-primary">
                            {value}
                        </p>
                    )}
                    {change && (
                        <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
                            {changeType === "positive" && "↑ "}
                            {changeType === "negative" && "↓ "}
                            {change}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${iconBgColors[iconBg]} flex items-center justify-center text-white shadow-lg`}>
                        {icon}
                    </div>
                )}
            </div>
        </Card>
    );
}

export default Card;
