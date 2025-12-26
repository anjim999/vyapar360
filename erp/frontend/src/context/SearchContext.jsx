import { createContext, useContext, useState, useCallback } from "react";
import api from "../api/axiosClient";

const SearchContext = createContext(null);

export function SearchProvider({ children }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Global search function
    const search = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        setShowResults(true);

        try {
            const results = [];
            const lowerQuery = query.toLowerCase();

            // Search projects
            try {
                const projectsRes = await api.get("/api/projects");
                const projects = projectsRes.data || [];
                projects
                    .filter((p) => p.name?.toLowerCase().includes(lowerQuery))
                    .slice(0, 3)
                    .forEach((p) => {
                        results.push({
                            id: `project-${p.id}`,
                            type: "project",
                            icon: "📁",
                            title: p.name,
                            subtitle: `Budget: ₹${p.budget} | Status: ${p.status}`,
                            link: `/projects/${p.id}`,
                        });
                    });
            } catch (e) {
                console.error("Project search error:", e);
            }

            // Search invoices
            try {
                const invoicesRes = await api.get("/api/finance/invoices");
                const invoices = invoicesRes.data || [];
                invoices
                    .filter((inv) => inv.invoice_number?.toLowerCase().includes(lowerQuery))
                    .slice(0, 3)
                    .forEach((inv) => {
                        results.push({
                            id: `invoice-${inv.id}`,
                            type: "invoice",
                            icon: "📄",
                            title: inv.invoice_number,
                            subtitle: `Amount: ₹${inv.amount_base} | ${inv.status}`,
                            link: "/finance/invoices",
                        });
                    });
            } catch (e) {
                console.error("Invoice search error:", e);
            }

            // Search customers
            try {
                const customersRes = await api.get("/api/finance/customers");
                const customers = customersRes.data || [];
                customers
                    .filter((c) => c.name?.toLowerCase().includes(lowerQuery))
                    .slice(0, 3)
                    .forEach((c) => {
                        results.push({
                            id: `customer-${c.id}`,
                            type: "customer",
                            icon: "👤",
                            title: c.name,
                            subtitle: c.email || "No email",
                            link: "/finance/customers",
                        });
                    });
            } catch (e) {
                console.error("Customer search error:", e);
            }

            // Search vendors
            try {
                const vendorsRes = await api.get("/api/finance/vendors");
                const vendors = vendorsRes.data || [];
                vendors
                    .filter((v) => v.name?.toLowerCase().includes(lowerQuery))
                    .slice(0, 3)
                    .forEach((v) => {
                        results.push({
                            id: `vendor-${v.id}`,
                            type: "vendor",
                            icon: "🏢",
                            title: v.name,
                            subtitle: v.email || "No email",
                            link: "/finance/vendors",
                        });
                    });
            } catch (e) {
                console.error("Vendor search error:", e);
            }

            // Search accounts
            try {
                const accountsRes = await api.get("/api/finance/accounts");
                const accounts = accountsRes.data || [];
                accounts
                    .filter(
                        (a) =>
                            a.name?.toLowerCase().includes(lowerQuery) ||
                            a.code?.toLowerCase().includes(lowerQuery)
                    )
                    .slice(0, 3)
                    .forEach((a) => {
                        results.push({
                            id: `account-${a.id}`,
                            type: "account",
                            icon: "💰",
                            title: `${a.code} - ${a.name}`,
                            subtitle: `Type: ${a.type}`,
                            link: "/finance/accounts",
                        });
                    });
            } catch (e) {
                console.error("Account search error:", e);
            }

            setSearchResults(results);
        } catch (err) {
            console.error("Global search error:", err);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clearSearch = () => {
        setSearchQuery("");
        setSearchResults([]);
        setShowResults(false);
    };

    return (
        <SearchContext.Provider
            value={{
                searchQuery,
                setSearchQuery,
                searchResults,
                isSearching,
                showResults,
                setShowResults,
                search,
                clearSearch,
            }}
        >
            {children}
        </SearchContext.Provider>
    );
}

export function useSearch() {
    const context = useContext(SearchContext);
    if (!context) {
        throw new Error("useSearch must be used within a SearchProvider");
    }
    return context;
}
