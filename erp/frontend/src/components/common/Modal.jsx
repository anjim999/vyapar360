// src/components/common/Modal.jsx
// Reusable Modal component

import { useEffect } from "react";
import { FaTimes } from "react-icons/fa";

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = "md",
    footer,
    closeOnOverlayClick = true,
    showCloseButton = true,
    className = "",
}) {
    const sizes = {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
        full: "max-w-full mx-4",
    };

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
                onClick={closeOnOverlayClick ? onClose : undefined}
            />

            {/* Modal */}
            <div
                className={`
          relative w-full ${sizes[size]} theme-bg-secondary rounded-2xl theme-shadow-xl
          animate-scale-in ${className}
        `}
            >
                {/* Header */}
                {(title || showCloseButton) && (
                    <div className="flex items-center justify-between p-4 sm:p-5 border-b theme-border-light">
                        {title && (
                            <h2 className="text-lg sm:text-xl font-semibold theme-text-primary">
                                {title}
                            </h2>
                        )}
                        {showCloseButton && (
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:theme-bg-tertiary transition-colors theme-text-muted hover:theme-text-primary"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}

                {/* Content */}
                <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div className="flex items-center justify-end gap-3 p-4 sm:p-5 border-t theme-border-light">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger", // danger, warning, info
    loading = false,
}) {
    const variants = {
        danger: {
            icon: "🗑️",
            buttonClass: "bg-red-500 hover:bg-red-600",
        },
        warning: {
            icon: "⚠️",
            buttonClass: "bg-amber-500 hover:bg-amber-600",
        },
        info: {
            icon: "ℹ️",
            buttonClass: "bg-blue-500 hover:bg-blue-600",
        },
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
            <div className="text-center py-4">
                <div className="text-5xl mb-4">{variants[variant].icon}</div>
                <h3 className="text-xl font-semibold theme-text-primary mb-2">{title}</h3>
                <p className="theme-text-secondary mb-6">{message}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg theme-bg-tertiary theme-text-primary hover:opacity-80 transition-opacity"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white ${variants[variant].buttonClass} transition-colors disabled:opacity-50`}
                    >
                        {loading ? "Loading..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default Modal;
