// src/pages/RequestCompanyPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Card, Button, Input, Textarea, Select } from "../components/common";
import companyRequestService from "../services/companyRequestService";
import { INDUSTRIES } from "../constants";
import { useAuth } from "../context/AuthContext";

export default function RequestCompanyPage() {
    const navigate = useNavigate();
    const { auth } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        company_name: "", industry: "", description: "", email: auth?.user?.email || "",
        phone: "", website: "", address: "", city: "", state: "", country: "India",
        pincode: "", gstin: ""
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.company_name || !formData.industry || !formData.email) {
            return toast.error("Company name, industry and email are required");
        }
        setLoading(true);
        try {
            await companyRequestService.submitRequest(formData);
            toast.success("Request submitted successfully!");
            setSubmitted(true);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    const states = ["Andhra Pradesh", "Karnataka", "Tamil Nadu", "Maharashtra", "Delhi", "Gujarat", "Rajasthan", "Uttar Pradesh", "West Bengal", "Kerala", "Telangana", "Other"];

    if (submitted) {
        return (
            <div className="min-h-screen theme-bg-primary flex items-center justify-center py-12 px-4">
                <Card padding="lg" className="max-w-md text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-4xl mx-auto mb-4">
                        ✅
                    </div>
                    <h2 className="text-2xl font-bold theme-text-primary mb-2">Request Submitted!</h2>
                    <p className="theme-text-muted mb-6">
                        Your company registration request has been submitted successfully.
                        Our admin team will review your request and send you the credentials via email once approved.
                    </p>
                    <div className="space-y-3">
                        <Button onClick={() => navigate("/dashboard")} className="w-full">Go to Dashboard</Button>
                        <Button variant="ghost" onClick={() => navigate("/my-company-requests")} className="w-full">View My Requests</Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen theme-bg-primary py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold theme-text-primary">Register Your Company</h1>
                    <p className="theme-text-muted mt-2">Submit your details for review by our admin team</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center gap-4 mb-8">
                    {[1, 2, 3].map(s => (
                        <div key={s} className={`flex items-center gap-2 ${step >= s ? "text-blue-500" : "theme-text-muted"}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step >= s ? "bg-blue-500 text-white" : "theme-bg-secondary"}`}>{s}</div>
                            <span className="hidden sm:inline text-sm">{s === 1 ? "Basic Info" : s === 2 ? "Contact" : "Address"}</span>
                        </div>
                    ))}
                </div>

                <Card padding="lg">
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="space-y-4">
                                <Input label="Company Name *" name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Your Company Name" required />
                                <Select label="Industry *" name="industry" value={formData.industry} onChange={handleChange} options={INDUSTRIES} required />
                                <Textarea label="About Company" name="description" value={formData.description} onChange={handleChange} placeholder="Tell us about your company, services, and expertise..." rows={4} />
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <Input label="Business Email *" name="email" type="email" value={formData.email} onChange={handleChange} required />
                                <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                                <Input label="Website" name="website" value={formData.website} onChange={handleChange} placeholder="https://yourcompany.com" />
                                <Input label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="22AAAAA0000A1Z5" />
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">
                                <Textarea label="Address" name="address" value={formData.address} onChange={handleChange} placeholder="Street address" rows={2} />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="City" name="city" value={formData.city} onChange={handleChange} />
                                    <Select label="State" name="state" value={formData.state} onChange={handleChange} options={states.map(s => ({ value: s, label: s }))} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
                                    <Input label="Country" name="country" value={formData.country} onChange={handleChange} disabled />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between mt-8 pt-4 border-t theme-border-light">
                            {step > 1 ? (
                                <Button variant="ghost" type="button" onClick={() => setStep(s => s - 1)}>Back</Button>
                            ) : <div />}
                            {step < 3 ? (
                                <Button type="button" onClick={() => setStep(s => s + 1)}>Next</Button>
                            ) : (
                                <Button type="submit" loading={loading}>Submit Request</Button>
                            )}
                        </div>
                    </form>
                </Card>

                <p className="text-center text-sm theme-text-muted mt-6">
                    ⏰ Requests are typically reviewed within 24-48 hours
                </p>
            </div>
        </div>
    );
}
