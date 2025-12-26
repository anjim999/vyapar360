import { useState } from "react";
import { FaTrash, FaEdit, FaDownload, FaCheck, FaTimes } from "react-icons/fa";

export default function BulkActions({
    selectedIds = [],
    onDelete,
    onExport,
    onEdit,
    onClearSelection,
    customActions = [],
}) {
    const [showConfirm, setShowConfirm] = useState(false);
    const count = selectedIds.length;

    if (count === 0) return null;

    const handleDelete = () => {
        setShowConfirm(true);
    };

    const confirmDelete = () => {
        onDelete?.(selectedIds);
        setShowConfirm(false);
    };

    return (
        <div className="animate-slide-in-left fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
            <div className="theme-bg-secondary rounded-xl theme-shadow-xl border theme-border-light px-4 py-3 flex items-center gap-4">
                {/* Selection Count */}
                <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                        {count}
                    </span>
                    <span className="text-sm theme-text-secondary">
                        item{count !== 1 ? "s" : ""} selected
                    </span>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-gray-300 dark:bg-gray-600" />

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {/* Export */}
                    {onExport && (
                        <button
                            onClick={() => onExport(selectedIds)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
                        >
                            <FaDownload className="w-3 h-3" />
                            Export
                        </button>
                    )}

                    {/* Edit */}
                    {onEdit && (
                        <button
                            onClick={() => onEdit(selectedIds)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                        >
                            <FaEdit className="w-3 h-3" />
                            Edit
                        </button>
                    )}

                    {/* Custom Actions */}
                    {customActions.map((action, idx) => (
                        <button
                            key={idx}
                            onClick={() => action.onClick(selectedIds)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${action.className || "bg-indigo-500 text-white hover:bg-indigo-600"
                                }`}
                        >
                            {action.icon}
                            {action.label}
                        </button>
                    ))}

                    {/* Delete */}
                    {onDelete && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                        >
                            <FaTrash className="w-3 h-3" />
                            Delete
                        </button>
                    )}

                    {/* Clear Selection */}
                    <button
                        onClick={onClearSelection}
                        className="p-2 rounded-lg hover:theme-bg-tertiary transition-colors"
                        title="Clear selection"
                    >
                        <FaTimes className="w-4 h-4 theme-text-muted" />
                    </button>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="theme-bg-secondary rounded-xl theme-shadow-xl p-6 max-w-sm w-full mx-4 animate-scale-in">
                        <h3 className="text-lg font-semibold theme-text-primary mb-2">
                            Confirm Delete
                        </h3>
                        <p className="text-sm theme-text-secondary mb-4">
                            Are you sure you want to delete {count} item{count !== 1 ? "s" : ""}?
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-2 rounded-lg text-sm font-medium theme-bg-tertiary theme-text-secondary hover:opacity-80 transition-opacity"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Checkbox component for bulk selection
export function SelectCheckbox({ checked, onChange, indeterminate = false }) {
    return (
        <label className="relative inline-flex items-center cursor-pointer">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="sr-only peer"
            />
            <div
                className={`
          w-5 h-5 rounded border-2 transition-colors flex items-center justify-center
          ${checked || indeterminate
                        ? "bg-blue-600 border-blue-600"
                        : "theme-border-medium theme-bg-tertiary peer-hover:border-blue-400"
                    }
        `}
            >
                {checked && <FaCheck className="w-3 h-3 text-white" />}
                {indeterminate && !checked && (
                    <div className="w-2.5 h-0.5 bg-white rounded" />
                )}
            </div>
        </label>
    );
}
