// src/pages/dashboard/components/QuickLink.jsx
import { Link } from "react-router-dom";

export function QuickLink({ to, icon, label, size = "md" }) {
    const sizeClasses = {
        sm: "p-3",
        md: "p-4",
    };

    return (
        <Link
            to={to}
            className={`${sizeClasses[size]} rounded-xl theme-bg-tertiary hover:theme-bg-secondary border theme-border-light hover:shadow-md transition-all flex flex-col items-center gap-2 group`}
        >
            <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
            <span className="text-xs font-medium theme-text-primary text-center">{label}</span>
        </Link>
    );
}

export default QuickLink;
