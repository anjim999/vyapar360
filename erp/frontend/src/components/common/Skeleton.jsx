// src/components/common/Skeleton.jsx - Loading Skeleton Components
import React from 'react';

// Base Skeleton with shimmer animation
export function Skeleton({ className = '', width, height, rounded = 'md', animate = true }) {
    const roundedClasses = {
        none: '',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        full: 'rounded-full',
    };

    return (
        <div
            className={`bg-gray-200 dark:bg-gray-700 ${roundedClasses[rounded]} ${animate ? 'animate-pulse' : ''} ${className}`}
            style={{ width, height }}
        />
    );
}

// Text Line Skeleton
export function SkeletonText({ lines = 1, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    height="1rem"
                    className={i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'}
                />
            ))}
        </div>
    );
}

// Avatar Skeleton
export function SkeletonAvatar({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return <Skeleton className={`${sizes[size]} ${className}`} rounded="full" />;
}

// Card Skeleton
export function SkeletonCard({ className = '' }) {
    return (
        <div className={`theme-bg-secondary rounded-xl p-5 ${className}`}>
            <div className="flex items-center gap-4 mb-4">
                <SkeletonAvatar size="lg" />
                <div className="flex-1">
                    <Skeleton height="1.25rem" className="w-3/4 mb-2" />
                    <Skeleton height="0.875rem" className="w-1/2" />
                </div>
            </div>
            <SkeletonText lines={3} />
        </div>
    );
}

// Table Row Skeleton
export function SkeletonTableRow({ columns = 5, className = '' }) {
    return (
        <tr className={className}>
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <Skeleton height="1rem" className={i === 0 ? 'w-32' : 'w-20'} />
                </td>
            ))}
        </tr>
    );
}

// Table Skeleton
export function SkeletonTable({ rows = 5, columns = 5, className = '' }) {
    return (
        <div className={`overflow-hidden rounded-xl border theme-border-light ${className}`}>
            <table className="w-full">
                <thead className="theme-bg-tertiary">
                    <tr>
                        {Array.from({ length: columns }).map((_, i) => (
                            <th key={i} className="px-4 py-3 text-left">
                                <Skeleton height="0.75rem" className="w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y theme-border-light">
                    {Array.from({ length: rows }).map((_, i) => (
                        <SkeletonTableRow key={i} columns={columns} />
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Stat Card Skeleton
export function SkeletonStatCard({ className = '' }) {
    return (
        <div className={`theme-bg-secondary rounded-xl p-5 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <Skeleton height="0.75rem" className="w-20 mb-2" />
                    <Skeleton height="2rem" className="w-16" />
                </div>
                <Skeleton className="w-12 h-12" rounded="xl" />
            </div>
        </div>
    );
}

// Dashboard Skeleton
export function SkeletonDashboard() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonStatCard key={i} />
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="theme-bg-secondary rounded-xl p-5">
                    <Skeleton height="1.25rem" className="w-40 mb-4" />
                    <Skeleton height="250px" className="w-full" rounded="lg" />
                </div>
                <div className="theme-bg-secondary rounded-xl p-5">
                    <Skeleton height="1.25rem" className="w-40 mb-4" />
                    <Skeleton height="250px" className="w-full" rounded="lg" />
                </div>
            </div>

            {/* Table */}
            <div className="theme-bg-secondary rounded-xl p-5">
                <Skeleton height="1.25rem" className="w-40 mb-4" />
                <SkeletonTable rows={5} columns={5} />
            </div>
        </div>
    );
}

// List Skeleton
export function SkeletonList({ items = 5, className = '' }) {
    return (
        <div className={`space-y-3 ${className}`}>
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3 theme-bg-tertiary rounded-lg">
                    <SkeletonAvatar />
                    <div className="flex-1">
                        <Skeleton height="1rem" className="w-3/4 mb-1" />
                        <Skeleton height="0.75rem" className="w-1/2" />
                    </div>
                    <Skeleton height="1.5rem" className="w-16" rounded="full" />
                </div>
            ))}
        </div>
    );
}

// Form Skeleton
export function SkeletonForm({ fields = 4, className = '' }) {
    return (
        <div className={`space-y-4 ${className}`}>
            {Array.from({ length: fields }).map((_, i) => (
                <div key={i}>
                    <Skeleton height="0.875rem" className="w-24 mb-2" />
                    <Skeleton height="2.5rem" className="w-full" rounded="lg" />
                </div>
            ))}
            <div className="pt-4">
                <Skeleton height="2.5rem" className="w-32" rounded="lg" />
            </div>
        </div>
    );
}

export default {
    Skeleton,
    SkeletonText,
    SkeletonAvatar,
    SkeletonCard,
    SkeletonTableRow,
    SkeletonTable,
    SkeletonStatCard,
    SkeletonDashboard,
    SkeletonList,
    SkeletonForm,
};
