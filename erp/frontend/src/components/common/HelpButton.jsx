// src/components/common/HelpButton.jsx
// Floating help button for customer support

import { useState } from "react";
import {
    FaHeadset,
    FaTimes,
    FaQuestionCircle,
    FaBook,
    FaEnvelope,
    FaPhone,
    FaWhatsapp,
    FaChevronRight
} from "react-icons/fa";
import Modal from "./Modal";
import { Button } from "./Button";
import { Input, Textarea, Select } from "./Input";
import { useAuth } from "../../context/AuthContext";
import api from "../../api/axiosClient";
import { toast } from "react-toastify";

export function HelpButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [showTicketForm, setShowTicketForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const { auth } = useAuth();

    const [ticketData, setTicketData] = useState({
        category: "",
        subject: "",
        message: "",
    });

    const handleChange = (e) => {
        setTicketData({ ...ticketData, [e.target.name]: e.target.value });
    };

    const handleSubmitTicket = async (e) => {
        e.preventDefault();
        if (!ticketData.category || !ticketData.subject || !ticketData.message) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            await api.post("/api/marketplace/support", ticketData);
            toast.success("Support ticket submitted! We'll get back to you soon.");
            setShowTicketForm(false);
            setTicketData({ category: "", subject: "", message: "" });
        } catch (err) {
            toast.error("Failed to submit ticket. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const helpOptions = [
        {
            icon: <FaQuestionCircle className="w-5 h-5" />,
            title: "FAQs",
            description: "Find answers to common questions",
            color: "from-blue-500 to-blue-600",
            action: () => window.open("/help/faq", "_blank"),
        },
        {
            icon: <FaBook className="w-5 h-5" />,
            title: "Documentation",
            description: "Read our detailed guides",
            color: "from-purple-500 to-purple-600",
            action: () => window.open("/help/docs", "_blank"),
        },
        {
            icon: <FaEnvelope className="w-5 h-5" />,
            title: "Submit Ticket",
            description: "Report an issue or ask a question",
            color: "from-green-500 to-emerald-600",
            action: () => setShowTicketForm(true),
        },
        {
            icon: <FaPhone className="w-5 h-5" />,
            title: "Call Us",
            description: "+91 1800-XXX-XXXX (9AM-6PM)",
            color: "from-amber-500 to-orange-500",
            action: () => window.open("tel:+911800XXXXXXX", "_self"),
        },
        {
            icon: <FaWhatsapp className="w-5 h-5" />,
            title: "WhatsApp",
            description: "Chat with us on WhatsApp",
            color: "from-green-400 to-green-600",
            action: () => window.open("https://wa.me/911234567890", "_blank"),
        },
    ];

    return (
        <>
            {/* Floating Help Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group hover:scale-105"
                title="Need help?"
            >
                <FaHeadset className="w-6 h-6 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </button>

            {/* Help Panel */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 animate-slide-in-up">
                    <div className="theme-bg-secondary rounded-2xl theme-shadow-xl border theme-border-light overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FaHeadset className="w-6 h-6" />
                                    <div>
                                        <h3 className="font-semibold">Need Help?</h3>
                                        <p className="text-sm opacity-90">We're here to assist you</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <FaTimes className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 max-h-80 overflow-y-auto">
                            {helpOptions.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={option.action}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:theme-bg-tertiary transition-colors mb-2 last:mb-0 group"
                                >
                                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center text-white`}>
                                        {option.icon}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-medium theme-text-primary">{option.title}</p>
                                        <p className="text-xs theme-text-muted">{option.description}</p>
                                    </div>
                                    <FaChevronRight className="w-4 h-4 theme-text-muted group-hover:translate-x-1 transition-transform" />
                                </button>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t theme-border-light theme-bg-tertiary">
                            <p className="text-xs theme-text-muted text-center">
                                Available Mon-Sat, 9:00 AM - 6:00 PM IST
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Support Ticket Modal */}
            <Modal
                isOpen={showTicketForm}
                onClose={() => setShowTicketForm(false)}
                title="Submit Support Ticket"
                size="md"
            >
                <form onSubmit={handleSubmitTicket} className="space-y-4">
                    <Select
                        label="Category"
                        name="category"
                        value={ticketData.category}
                        onChange={handleChange}
                        required
                        options={[
                            { value: "technical", label: "Technical Issue" },
                            { value: "billing", label: "Billing & Payments" },
                            { value: "account", label: "Account Related" },
                            { value: "feature", label: "Feature Request" },
                            { value: "other", label: "Other" },
                        ]}
                    />
                    <Input
                        label="Subject"
                        name="subject"
                        value={ticketData.subject}
                        onChange={handleChange}
                        placeholder="Brief description of your issue"
                        required
                    />
                    <Textarea
                        label="Message"
                        name="message"
                        value={ticketData.message}
                        onChange={handleChange}
                        placeholder="Please describe your issue in detail..."
                        rows={5}
                        required
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="ghost"
                            onClick={() => setShowTicketForm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            loading={loading}
                        >
                            Submit Ticket
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}

export default HelpButton;
