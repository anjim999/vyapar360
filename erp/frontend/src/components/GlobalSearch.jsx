import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaTimes, FaSpinner } from "react-icons/fa";
import { useSearch } from "../context/SearchContext";

export default function GlobalSearch() {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const {
        searchQuery,
        setSearchQuery,
        searchResults,
        isSearching,
        showResults,
        setShowResults,
        search,
        clearSearch,
    } = useSearch();

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery) {
                search(searchQuery);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, search]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [setShowResults]);

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    useEffect(() => {
        function handleKeyDown(e) {
            if ((e.ctrlKey || e.metaKey) && e.key === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
            if (e.key === "Escape") {
                clearSearch();
                inputRef.current?.blur();
            }
        }
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [clearSearch]);

    const handleResultClick = (result) => {
        navigate(result.link);
        clearSearch();
        inputRef.current?.blur();
    };

    const getTypeLabel = (type) => {
        const labels = {
            project: "Project",
            invoice: "Invoice",
            customer: "Customer",
            vendor: "Vendor",
            account: "Account",
        };
        return labels[type] || type;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Search Input */}
            <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${isFocused
                        ? "theme-border-medium ring-2 ring-blue-500/30"
                        : "theme-border-light"
                    } theme-bg-tertiary`}
            >
                <FaSearch className="w-4 h-4 theme-text-muted" />
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Search... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                        setIsFocused(true);
                        if (searchQuery) setShowResults(true);
                    }}
                    onBlur={() => setIsFocused(false)}
                    className="bg-transparent outline-none text-sm theme-text-primary placeholder:theme-text-muted w-32 sm:w-48 md:w-64"
                />
                {isSearching ? (
                    <FaSpinner className="w-4 h-4 theme-text-muted animate-spin" />
                ) : searchQuery ? (
                    <button
                        onClick={clearSearch}
                        className="theme-text-muted hover:theme-text-primary"
                    >
                        <FaTimes className="w-4 h-4" />
                    </button>
                ) : null}
            </div>

            {/* Results Dropdown */}
            {showResults && (searchResults.length > 0 || searchQuery.length >= 2) && (
                <div className="absolute top-full left-0 right-0 mt-2 theme-bg-secondary rounded-xl theme-shadow-xl border theme-border-light z-50 overflow-hidden animate-fade-in-down">
                    {searchResults.length === 0 ? (
                        <div className="py-8 text-center theme-text-muted">
                            <FaSearch className="w-6 h-6 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No results found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full text-left px-4 py-3 border-b theme-border-light hover:theme-bg-tertiary transition-colors flex items-center gap-3"
                                >
                                    <span className="text-xl">{result.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium theme-text-primary truncate">
                                            {result.title}
                                        </p>
                                        <p className="text-xs theme-text-muted truncate">
                                            {result.subtitle}
                                        </p>
                                    </div>
                                    <span className="text-xs px-2 py-0.5 rounded-full theme-bg-tertiary theme-text-secondary">
                                        {getTypeLabel(result.type)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Footer hint */}
                    <div className="px-4 py-2 border-t theme-border-light theme-bg-tertiary text-xs theme-text-muted flex items-center justify-between">
                        <span>Press Enter to select</span>
                        <span>ESC to close</span>
                    </div>
                </div>
            )}
        </div>
    );
}
