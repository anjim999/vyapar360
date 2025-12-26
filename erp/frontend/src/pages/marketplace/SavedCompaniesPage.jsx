// src/pages/marketplace/SavedCompaniesPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaHeart, FaBuilding, FaStar, FaMapMarkerAlt, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Button, Badge, EmptyState, Loader, ConfirmModal } from "../../components/common";
import marketplaceService from "../../services/marketplaceService";

export default function SavedCompaniesPage() {
    const [savedCompanies, setSavedCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [toRemove, setToRemove] = useState(null);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await marketplaceService.getSavedCompanies();
            setSavedCompanies(res.data || []);
        } catch (err) { toast.error("Failed to load"); }
        finally { setLoading(false); }
    };

    const handleRemove = async () => {
        try {
            await marketplaceService.unsaveCompany(toRemove.id);
            setSavedCompanies(savedCompanies.filter(c => c.id !== toRemove.id));
            toast.success("Removed from saved");
            setToRemove(null);
        } catch (err) { toast.error("Failed"); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <FaHeart className="text-red-500 text-2xl" />
                <div>
                    <h1 className="text-2xl font-bold theme-text-primary">Saved Companies</h1>
                    <p className="theme-text-muted">{savedCompanies.length} companies saved</p>
                </div>
            </div>

            {savedCompanies.length === 0 ? (
                <Card padding="lg">
                    <EmptyState
                        icon="❤️"
                        title="No Saved Companies"
                        description="Browse the marketplace and save companies you're interested in"
                        action={<Link to="/marketplace"><Button>Browse Marketplace</Button></Link>}
                    />
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedCompanies.map(company => (
                        <Card key={company.id} hover className="group overflow-hidden">
                            <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600 -m-5 mb-4" />
                            <div className="relative -mt-8 mb-3">
                                <div className="w-14 h-14 rounded-xl bg-white dark:bg-gray-800 shadow-lg flex items-center justify-center text-xl border-2 border-white dark:border-gray-700">
                                    {company.logo ? <img src={company.logo} alt="" className="w-full h-full rounded-lg object-cover" /> : <FaBuilding className="text-gray-400" />}
                                </div>
                            </div>
                            <Link to={`/marketplace/${company.slug}`}>
                                <h3 className="font-semibold theme-text-primary group-hover:text-blue-500 transition-colors">{company.name}</h3>
                            </Link>
                            <p className="text-sm theme-text-muted">{company.industry}</p>
                            {company.city && (
                                <p className="text-sm theme-text-muted flex items-center gap-1 mt-1">
                                    <FaMapMarkerAlt className="w-3 h-3" /> {company.city}
                                </p>
                            )}
                            <div className="flex items-center justify-between pt-3 mt-3 border-t theme-border-light">
                                <div className="flex items-center gap-1">
                                    <FaStar className="text-amber-400" />
                                    <span>{company.rating?.toFixed(1) || "N/A"}</span>
                                </div>
                                <button onClick={() => setToRemove(company)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmModal
                isOpen={!!toRemove}
                onClose={() => setToRemove(null)}
                onConfirm={handleRemove}
                title="Remove from Saved"
                message={`Remove "${toRemove?.name}" from your saved companies?`}
                confirmText="Remove"
                variant="danger"
            />
        </div>
    );
}
