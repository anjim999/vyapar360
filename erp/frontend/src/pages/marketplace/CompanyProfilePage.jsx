// src/pages/marketplace/CompanyProfilePage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FaStar, FaMapMarkerAlt, FaPhone, FaGlobe, FaEnvelope, FaBuilding, FaUsers, FaCalendar, FaCheckCircle, FaHeart, FaPaperPlane } from "react-icons/fa";
import { toast } from "react-toastify";
import { Card, Button, Badge, Modal, Input, Textarea, Select, Loader } from "../../components/common";
import companyService from "../../services/companyService";
import marketplaceService from "../../services/marketplaceService";
import { useAuth } from "../../context/AuthContext";
import { BUDGET_RANGES } from "../../constants";

export default function CompanyProfilePage() {
    const { slug } = useParams();
    const { auth } = useAuth();
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showContactModal, setShowContactModal] = useState(false);
    const [contactData, setContactData] = useState({ subject: "", message: "", service_type: "", budget_range: "", urgency: "normal" });
    const [sending, setSending] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => { fetchCompany(); }, [slug]);

    const fetchCompany = async () => {
        try {
            setLoading(true);
            const res = await companyService.getCompanyBySlug(slug);
            setCompany(res.data);
        } catch (err) { toast.error("Company not found"); }
        finally { setLoading(false); }
    };

    const handleContact = async (e) => {
        e.preventDefault();
        if (!auth?.token) return toast.error("Please login");
        if (!contactData.subject || !contactData.message) return toast.error("Fill required fields");
        setSending(true);
        try {
            await marketplaceService.sendContactRequest({ company_id: company.id, ...contactData });
            toast.success("Request sent!");
            setShowContactModal(false);
        } catch (err) { toast.error("Failed"); }
        finally { setSending(false); }
    };

    const toggleSave = async () => {
        if (!auth?.token) return toast.error("Please login");
        try {
            if (isSaved) {
                await marketplaceService.unsaveCompany(company.id);
                setIsSaved(false);
            } else {
                await marketplaceService.saveCompany(company.id);
                setIsSaved(true);
            }
            toast.success(isSaved ? "Removed" : "Saved!");
        } catch (err) { toast.error("Failed"); }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader size="lg" /></div>;
    if (!company) return <Card padding="lg" className="text-center"><h2>Company not found</h2><Link to="/marketplace" className="text-blue-500">Back to marketplace</Link></Card>;

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 -mx-5 -mt-5 mb-0" />
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 relative">
                    <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center border-4 border-white dark:border-gray-700 text-3xl">
                        {company.logo ? <img src={company.logo} alt="" className="w-full h-full rounded-xl object-cover" /> : <FaBuilding className="text-gray-400" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold theme-text-primary">{company.name}</h1>
                            {company.is_verified && <Badge variant="success"><FaCheckCircle className="mr-1" /> Verified</Badge>}
                        </div>
                        <p className="theme-text-muted">{company.industry}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="ghost" icon={<FaHeart className={isSaved ? "text-red-500" : ""} />} onClick={toggleSave}>{isSaved ? "Saved" : "Save"}</Button>
                        <Button icon={<FaPaperPlane />} onClick={() => setShowContactModal(true)}>Contact</Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <Card title="About">
                        <p className="theme-text-secondary whitespace-pre-line">{company.description || "No description provided."}</p>
                    </Card>

                    {/* Services */}
                    {company.services?.length > 0 && (
                        <Card title="Services">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {company.services.map(s => (
                                    <div key={s.id} className="p-4 rounded-xl border theme-border-light">
                                        <h4 className="font-medium theme-text-primary">{s.name}</h4>
                                        {s.description && <p className="text-sm theme-text-muted mt-1">{s.description}</p>}
                                        {s.price_range && <p className="text-sm text-blue-500 mt-2">{s.price_range}</p>}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Reviews */}
                    <Card title={`Reviews (${company.reviews?.length || 0})`}>
                        {!company.reviews?.length ? (
                            <p className="theme-text-muted">No reviews yet</p>
                        ) : (
                            <div className="space-y-4">
                                {company.reviews.map(r => (
                                    <div key={r.id} className="p-4 rounded-xl border theme-border-light">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">{r.reviewer_name}</span>
                                            <div className="flex items-center gap-1"><FaStar className="text-amber-400" /> {r.rating}</div>
                                        </div>
                                        {r.title && <p className="font-medium theme-text-primary">{r.title}</p>}
                                        <p className="text-sm theme-text-secondary">{r.review}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Info */}
                    <Card title="Quick Info">
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3"><FaStar className="text-amber-400" /><span>{(company.rating && typeof company.rating === 'number') ? company.rating.toFixed(1) : "N/A"} ({company.review_count || 0} reviews)</span></div>
                            {company.city && <div className="flex items-center gap-3"><FaMapMarkerAlt className="theme-text-muted" /><span>{company.city}, {company.state}</span></div>}
                            {company.employee_count && <div className="flex items-center gap-3"><FaUsers className="theme-text-muted" /><span>{company.employee_count} employees</span></div>}
                            {company.established_year && <div className="flex items-center gap-3"><FaCalendar className="theme-text-muted" /><span>Est. {company.established_year}</span></div>}
                        </div>
                    </Card>

                    {/* Contact Info */}
                    <Card title="Contact">
                        <div className="space-y-3 text-sm">
                            {company.phone && <a href={`tel:${company.phone}`} className="flex items-center gap-3 hover:text-blue-500"><FaPhone className="theme-text-muted" />{company.phone}</a>}
                            {company.email && <a href={`mailto:${company.email}`} className="flex items-center gap-3 hover:text-blue-500"><FaEnvelope className="theme-text-muted" />{company.email}</a>}
                            {company.website && <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-blue-500"><FaGlobe className="theme-text-muted" />{company.website}</a>}
                            {company.address && <p className="flex items-start gap-3"><FaMapMarkerAlt className="theme-text-muted mt-1" />{company.address}</p>}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Contact Modal */}
            <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title="Send Contact Request" size="lg">
                <form onSubmit={handleContact} className="space-y-4">
                    <Input label="Subject" value={contactData.subject} onChange={e => setContactData({ ...contactData, subject: e.target.value })} placeholder="What do you need?" required />
                    <Textarea label="Message" value={contactData.message} onChange={e => setContactData({ ...contactData, message: e.target.value })} placeholder="Describe your requirements..." rows={4} required />
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Budget Range" value={contactData.budget_range} onChange={e => setContactData({ ...contactData, budget_range: e.target.value })} options={BUDGET_RANGES} />
                        <Select label="Urgency" value={contactData.urgency} onChange={e => setContactData({ ...contactData, urgency: e.target.value })} options={[{ value: "low", label: "Low" }, { value: "normal", label: "Normal" }, { value: "high", label: "High" }]} />
                    </div>
                    <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setShowContactModal(false)}>Cancel</Button><Button type="submit" loading={sending}>Send Request</Button></div>
                </form>
            </Modal>
        </div>
    );
}
