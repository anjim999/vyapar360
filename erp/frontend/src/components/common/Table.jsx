// src/components/common/Table.jsx
// Reusable Table component with sorting, pagination, and loading states

import { useState } from "react";
import { FaSort, FaSortUp, FaSortDown, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export function Table({
    columns,
    data = [],
    loading = false,
    emptyMessage = "No data available",
    sortable = true,
    pagination = true,
    pageSize = 10,
    onRowClick,
    className = "",
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
    const [currentPage, setCurrentPage] = useState(1);

    // Sorting logic
    const handleSort = (key) => {
        if (!sortable) return;

        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        } else if (sortConfig.key === key && sortConfig.direction === "desc") {
            direction = null;
        }
        setSortConfig({ key: direction ? key : null, direction });
    };

    const sortedData = [...data].sort((a, b) => {
        if (!sortConfig.key) return 0;

        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    });

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = pagination
        ? sortedData.slice(startIndex, startIndex + pageSize)
        : sortedData;

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return <FaSort className="w-3 h-3 opacity-40" />;
        if (sortConfig.direction === "asc") return <FaSortUp className="w-3 h-3" />;
        if (sortConfig.direction === "desc") return <FaSortDown className="w-3 h-3" />;
        return <FaSort className="w-3 h-3 opacity-40" />;
    };

    return (
        <div className={`w-full ${className}`}>
            <div className="overflow-x-auto rounded-xl border theme-border-light">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="theme-bg-tertiary border-b theme-border-light">
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`
                    px-4 py-3 text-left font-semibold theme-text-secondary
                    ${sortable && col.sortable !== false ? "cursor-pointer hover:theme-bg-primary transition-colors select-none" : ""}
                    ${col.className || ""}
                  `}
                                    style={{ width: col.width }}
                                    onClick={() => col.sortable !== false && handleSort(col.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{col.label}</span>
                                        {sortable && col.sortable !== false && getSortIcon(col.key)}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="theme-bg-secondary">
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="border-b theme-border-light animate-pulse">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-3">
                                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-4 py-8 text-center theme-text-muted"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <tr
                                    key={row.id || rowIndex}
                                    className={`
                    border-b theme-border-light last:border-b-0
                    ${onRowClick ? "cursor-pointer hover:theme-bg-tertiary" : ""}
                    transition-colors
                  `}
                                    onClick={() => onRowClick && onRowClick(row)}
                                >
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={`px-4 py-3 theme-text-primary ${col.cellClassName || ""}`}
                                        >
                                            {col.render ? col.render(row[col.key], row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                    <p className="text-sm theme-text-muted">
                        Showing {startIndex + 1} to {Math.min(startIndex + pageSize, sortedData.length)} of {sortedData.length} entries
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg theme-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed hover:theme-bg-primary transition-colors"
                        >
                            <FaChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`
                      w-8 h-8 rounded-lg text-sm font-medium transition-colors
                      ${currentPage === pageNum
                                                ? "bg-blue-500 text-white"
                                                : "theme-bg-tertiary theme-text-primary hover:theme-bg-primary"
                                            }
                    `}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg theme-bg-tertiary disabled:opacity-50 disabled:cursor-not-allowed hover:theme-bg-primary transition-colors"
                        >
                            <FaChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Table;
