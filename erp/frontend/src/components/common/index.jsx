// src/components/common/index.js
// Export all common components

export { Button } from "./Button";
export { Input, Textarea, Select } from "./Input";
export { Card, StatCard } from "./Card";
export { Modal, ConfirmModal } from "./Modal";
export { Table } from "./Table";
export { HelpButton } from "./HelpButton";
export {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonCard,
    SkeletonTable,
    SkeletonStatCard,
    SkeletonDashboard,
    SkeletonList,
    SkeletonForm
} from "./Skeleton";
export { FileUpload, AvatarUpload } from "./FileUpload";

// Loader component
export function Loader({ size = "md", className = "" }) {
    const sizes = {
        sm: "w-4 h-4",
        md: "w-8 h-8",
        lg: "w-12 h-12",
    };

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div
                className={`${sizes[size]} border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
            />
        </div>
    );
}

// Badge component
export function Badge({
    children,
    variant = "default",
    size = "md",
    className = "",
}) {
    const variants = {
        default: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
        primary: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
        success: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
        danger: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
        warning: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300",
        info: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-xs",
        lg: "px-3 py-1.5 text-sm",
    };

    return (
        <span
            className={`
        inline-flex items-center font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
        >
            {children}
        </span>
    );
}

// Avatar component
export function Avatar({ name, src, size = "md", className = "" }) {
    const sizes = {
        sm: "w-8 h-8 text-xs",
        md: "w-10 h-10 text-sm",
        lg: "w-14 h-14 text-lg",
        xl: "w-20 h-20 text-2xl",
    };

    const getInitials = (name) => {
        if (!name) return "?";
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={`${sizes[size]} rounded-full object-cover ${className}`}
            />
        );
    }

    return (
        <div
            className={`
        ${sizes[size]} rounded-full flex items-center justify-center
        bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold
        ${className}
      `}
        >
            {getInitials(name)}
        </div>
    );
}

// Empty state component
export function EmptyState({
    icon,
    title,
    description,
    action,
    className = "",
}) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
            {icon && (
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4 text-3xl">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold theme-text-primary mb-1">{title}</h3>
            {description && (
                <p className="text-sm theme-text-muted mb-4 text-center max-w-md">
                    {description}
                </p>
            )}
            {action}
        </div>
    );
}

// Coming Soon Badge
export function ComingSoonBadge({ className = "" }) {
    return (
        <span
            className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full
        bg-gradient-to-r from-purple-500 to-pink-500 text-white
        animate-pulse ${className}
      `}
        >
            ✨ Coming Soon
        </span>
    );
}

// Premium Feature Badge
export function PremiumBadge({ className = "" }) {
    return (
        <span
            className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full
        bg-gradient-to-r from-amber-400 to-orange-500 text-white
        ${className}
      `}
        >
            👑 Premium
        </span>
    );
}
