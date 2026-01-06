// src/pages/dashboard/components/QuickActionCard.jsx
import { Link } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";

export function QuickActionCard({ icon, title, description, link, buttonText, gradient }) {
    return (
        <div className="theme-bg-secondary rounded-xl p-6 border theme-border-light hover:shadow-lg transition-all group">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="font-semibold theme-text-primary mb-2">{title}</h3>
            <p className="text-sm theme-text-muted mb-4">{description}</p>
            <Link
                to={link}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${gradient} text-white text-sm font-medium hover:opacity-90 transition-opacity`}
            >
                {buttonText}
                <FaArrowUp className="w-3 h-3 rotate-45" />
            </Link>
        </div>
    );
}

export default QuickActionCard;
