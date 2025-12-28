// src/components/pricing/SuccessModal.jsx
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

export default function SuccessModal({ isOpen, planName, onClose }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleGoToDashboard = () => {
        onClose();
        navigate('/dashboard');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700/50 animate-scale-in">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center shadow-lg shadow-green-500/30 animate-bounce-once">
                            <FiCheck className="w-10 h-10 text-white stroke-[3]" />
                        </div>
                        {/* Sparkles */}
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-ping" />
                        <div className="absolute -bottom-1 -left-3 w-3 h-3 bg-purple-400 rounded-full animate-ping delay-150" />
                        <div className="absolute top-1/2 -right-4 w-2 h-2 bg-blue-400 rounded-full animate-ping delay-300" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    🎉 Upgrade Successful!
                </h2>

                {/* Plan Info */}
                <div className="bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/30 rounded-xl p-4 mb-6">
                    <p className="text-gray-300 text-center">
                        You're now on the
                    </p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-400 text-center capitalize">
                        {planName || 'Professional'} Plan
                    </p>
                </div>

                {/* Features unlocked */}
                <div className="space-y-2 mb-6">
                    <p className="text-gray-400 text-sm text-center">
                        All premium features are now unlocked for your team!
                    </p>
                    <p className="text-gray-500 text-xs text-center italic">
                        (Demo Mode - No actual payment processed)
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <button
                        onClick={handleGoToDashboard}
                        className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-medium rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25"
                    >
                        Go to Dashboard
                        <FiArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 bg-gray-700/50 hover:bg-gray-700 text-gray-300 font-medium rounded-xl transition-all"
                    >
                        Stay on Pricing Page
                    </button>
                </div>
            </div>

            {/* CSS Animation */}
            <style>{`
                @keyframes scale-in {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes bounce-once {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
                .animate-scale-in {
                    animation: scale-in 0.3s ease-out;
                }
                .animate-bounce-once {
                    animation: bounce-once 0.5s ease-out 0.3s;
                }
            `}</style>
        </div>
    );
}
