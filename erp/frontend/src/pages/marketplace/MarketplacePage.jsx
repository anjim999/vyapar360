// src/pages/marketplace/MarketplacePage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaStar, FaMapMarkerAlt, FaBuilding, FaHeart, FaFilter, FaCheckCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Input, Select, Badge, Loader } from "../../components/common";
import companyService from "../../services/companyService";
import marketplaceService from "../../services/marketplaceService";
import { useAuth } from "../../context/AuthContext";
import { INDUSTRIES } from "../../constants";

export default function MarketplacePage() {
    const { auth } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savedIds, setSavedIds] = useState([]);
    const [search, setSearch] = useState("");
    const [industry, setIndustry] = useState("");
    const [city, setCity] = useState("");
    const [cities, setCities] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

    useEffect(() => { fetchData(); }, [search, industry, city, pagination.page]);
    useEffect(() => { fetchCities(); fetchSaved(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await companyService.getPublicCompanies({ search, industry, city, page: pagination.page, limit: 12 });
            setCompanies(res.data?.companies || []);
            setPagination(res.data?.pagination || { page: 1, totalPages: 1 });
        } catch (err) { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };

    const fetchCities = async () => {
        try {
            const res = await companyService.getCities();
            setCities(res.data || []);
        } catch (err) { }
    };

    const fetchSaved = async () => {
        if (!auth?.token) return;
        try {
            const res = await marketplaceService.getSavedCompanies();
            setSavedIds((res.data || []).map(c => c.id));
        } catch (err) { }
    };

    const toggleSave = async (id) => {
        if (!auth?.token) return toast.error("Please login");
        try {
            if (savedIds.includes(id)) {
                await marketplaceService.unsaveCompany(id);
                setSavedIds(savedIds.filter(s => s !== id));
                toast.success("Removed from saved");
            } else {
                await marketplaceService.saveCompany(id);
                setSavedIds([...savedIds, id]);
                toast.success("Saved!");
            }
        } catch (err) { toast.error("Failed"); }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center py-8">
                <h1 className="text-3xl sm:text-4xl font-bold theme-text-primary mb-2">Find the Right Business</h1>
                <p className="theme-text-muted text-lg">Browse companies and services across India</p>
            </div>

            {/* Search & Filters */}
            <Card padding="md" variant="gradient">
                <div className="flex flex-col sm:flex-row gap-4">
                    <Input placeholder="Search companies..." value={search} onChange={e => setSearch(e.target.value)} icon={<FaSearch />} className="flex-1" />
                    <Select value={industry} onChange={e => setIndustry(e.target.value)} options={INDUSTRIES} placeholder="All Industries" className="sm:w-48" />
                    <Select value={city} onChange={e => setCity(e.target.value)} options={cities.map(c => ({ value: c.city, label: `${c.city} (${c.count})` }))} placeholder="All Cities" className="sm:w-48" />
                </div>
            </Card>

            {/* Results */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader size="lg" /></div>
            ) : companies.length === 0 ? (
                <Card padding="lg" className="text-center">
                    <div className="text-6xl mb-4">🏢</div>
                    <h3 className="text-xl font-semibold theme-text-primary mb-2">No Companies Found</h3>
                    <p className="theme-text-muted">Try adjusting your filters</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {companies.map(company => (
                        <Card key={company.id} hover className="group overflow-hidden">
                            {/* Header with gradient */}
                            <div className="h-20 bg-gradient-to-r from-blue-500 to-purple-600 -m-5 mb-4 relative">
                                {company.is_verified && (
                                    <Badge variant="success" className="absolute top-2 right-2"><FaCheckCircle className="mr-1" /> Verified</Badge>
                                )}
                            </div>
                            {/* Logo */}
                            <div className="relative -mt-10 mb-3">
                                <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-2xl border-2 border-white dark:border-gray-700">
                                    {company.logo ? <img src={company.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : <FaBuilding className="text-gray-400" />}
                                </div>
                            </div>
                            {/* Content */}
                            <Link to={`/marketplace/${company.slug}`}>
                                <h3 className="font-semibold theme-text-primary text-lg group-hover:text-blue-500 transition-colors">{company.name}</h3>
                            </Link>
                            <p className="text-sm theme-text-muted mb-2">{company.industry}</p>
                            {company.city && (
                                <p className="text-sm theme-text-muted flex items-center gap-1 mb-3">
                                    <FaMapMarkerAlt className="w-3 h-3" /> {company.city}{company.state ? `, ${company.state}` : ""}
                                </p>
                            )}
                            {/* Rating & Actions */}
                            <div className="flex items-center justify-between pt-3 border-t theme-border-light">
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-amber-400" />
                                    <span className="font-medium">{company.rating ? Number(company.rating).toFixed(1) : "N/A"}</span>
                                    <span className="text-sm theme-text-muted">({company.review_count || 0})</span>
                                </div>
                                <button onClick={(e) => { e.preventDefault(); toggleSave(company.id); }} className={`p-2 rounded-full transition-colors ${savedIds.includes(company.id) ? "text-red-500 bg-red-50 dark:bg-red-900/30" : "theme-text-muted hover:text-red-500"}`}>
                                    <FaHeart className={savedIds.includes(company.id) ? "fill-current" : ""} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                        <button key={i} onClick={() => setPagination(p => ({ ...p, page: i + 1 }))} className={`w-10 h-10 rounded-lg font-medium ${pagination.page === i + 1 ? "bg-blue-500 text-white" : "theme-bg-secondary theme-text-primary"}`}>
                            {i + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
