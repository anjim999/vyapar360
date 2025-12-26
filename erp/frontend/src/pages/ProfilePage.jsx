import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { FaUserCircle, FaCamera, FaSave, FaKey, FaSpinner } from "react-icons/fa";
import api from "../api/axiosClient";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ProfilePage() {
    const { auth, login } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [showPasswordForm, setShowPasswordForm] = useState(false);

    const [formData, setFormData] = useState({
        name: auth?.user?.name || "",
        email: auth?.user?.email || "",
        phone: auth?.user?.phone || "",
        company: auth?.user?.company || "",
        address: auth?.user?.address || "",
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Simulated API call - replace with actual endpoint
            // const res = await api.put("/api/users/profile", formData);
            // login({ ...auth, user: res.data });

            toast.success("Profile updated successfully!", { autoClose: 2000 });
            setIsEditing(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords don't match!");
            return;
        }
        if (passwordData.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }
        setLoading(true);
        try {
            // Simulated API call
            // await api.post("/api/users/change-password", passwordData);

            toast.success("Password changed successfully!", { autoClose: 2000 });
            setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            setShowPasswordForm(false);
        } catch (err) {
            toast.error(err?.response?.data?.message || "Failed to change password");
        } finally {
            setLoading(false);
        }
    };

    const getInitials = () => {
        const name = auth?.user?.name || "User";
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen theme-bg-primary pt-20 pb-10 px-4">
            <ToastContainer />
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold theme-text-primary mb-6">My Profile</h1>

                {/* Profile Header Card */}
                <div className="theme-bg-secondary rounded-2xl theme-shadow-lg p-6 border theme-border-light mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                                {getInitials()}
                            </div>
                            <button className="absolute bottom-0 right-0 w-9 h-9 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                                <FaCamera className="w-4 h-4" />
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="text-center sm:text-left flex-1">
                            <h2 className="text-xl font-bold theme-text-primary">
                                {auth?.user?.name || "User"}
                            </h2>
                            <p className="text-sm theme-text-muted">{auth?.user?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500 to-indigo-500 text-white capitalize">
                                {auth?.user?.role || "user"}
                            </span>
                        </div>

                        {/* Edit Button */}
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isEditing
                                    ? "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                }`}
                        >
                            {isEditing ? "Cancel" : "Edit Profile"}
                        </button>
                    </div>
                </div>

                {/* Profile Details Form */}
                <div className="theme-bg-secondary rounded-2xl theme-shadow-lg p-6 border theme-border-light mb-6">
                    <h3 className="text-lg font-semibold theme-text-primary mb-4">
                        Personal Information
                    </h3>

                    <form onSubmit={handleSaveProfile}>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={true}
                                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter phone number"
                                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm disabled:opacity-60"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">
                                    Company
                                </label>
                                <input
                                    type="text"
                                    name="company"
                                    value={formData.company}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter company name"
                                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm disabled:opacity-60"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium theme-text-secondary mb-1">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Enter your address"
                                    rows={2}
                                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm disabled:opacity-60 resize-none"
                                />
                            </div>
                        </div>

                        {isEditing && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <FaSpinner className="animate-spin w-4 h-4" />
                                ) : (
                                    <FaSave className="w-4 h-4" />
                                )}
                                Save Changes
                            </button>
                        )}
                    </form>
                </div>

                {/* Change Password Section */}
                <div className="theme-bg-secondary rounded-2xl theme-shadow-lg p-6 border theme-border-light">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold theme-text-primary">
                            Password & Security
                        </h3>
                        <button
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                            className="text-sm theme-text-accent hover:underline flex items-center gap-2"
                        >
                            <FaKey className="w-4 h-4" />
                            Change Password
                        </button>
                    </div>

                    {showPasswordForm && (
                        <form onSubmit={handleChangePassword} className="space-y-4 animate-fade-in-down">
                            <div>
                                <label className="block text-sm font-medium theme-text-secondary mb-1">
                                    Current Password
                                </label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={passwordData.currentPassword}
                                    onChange={handlePasswordChange}
                                    required
                                    className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm"
                                />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium theme-text-secondary mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={passwordData.confirmPassword}
                                        onChange={handlePasswordChange}
                                        required
                                        className="w-full px-4 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-60"
                            >
                                {loading ? (
                                    <FaSpinner className="animate-spin w-4 h-4" />
                                ) : (
                                    <FaKey className="w-4 h-4" />
                                )}
                                Update Password
                            </button>
                        </form>
                    )}

                    {!showPasswordForm && (
                        <p className="text-sm theme-text-muted">
                            Keep your account secure by using a strong, unique password.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
