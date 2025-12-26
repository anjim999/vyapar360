// src/components/Reviews.jsx - Reviews & Ratings Component
import { useState, useEffect } from 'react';
import { FaStar, FaUser, FaEdit, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import { formatDistanceToNow } from 'date-fns';

export function StarRating({ rating, onRate, readonly = false, size = 'md' }) {
    const [hovered, setHovered] = useState(0);
    const sizeClass = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => !readonly && onRate?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className={`${sizeClass} transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                    <FaStar
                        className={
                            star <= (hovered || rating)
                                ? 'text-yellow-400'
                                : 'text-gray-300 dark:text-gray-600'
                        }
                    />
                </button>
            ))}
        </div>
    );
}

export function ReviewsSummary({ companyId, summary }) {
    const [data, setData] = useState(summary || { averageRating: 0, totalReviews: 0 });

    return (
        <div className="flex items-center gap-3">
            <div className="text-3xl font-bold theme-text-primary">{data.averageRating.toFixed(1)}</div>
            <div>
                <StarRating rating={Math.round(data.averageRating)} readonly />
                <p className="text-sm theme-text-muted">{data.totalReviews} reviews</p>
            </div>
        </div>
    );
}

export function ReviewForm({ companyId, onSubmit, initialData }) {
    const [rating, setRating] = useState(initialData?.rating || 0);
    const [title, setTitle] = useState(initialData?.title || '');
    const [comment, setComment] = useState(initialData?.comment || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            return toast.error('Please select a rating');
        }

        setLoading(true);
        try {
            await api.post(`/api/reviews/company/${companyId}`, { rating, title, comment });
            toast.success('Review submitted successfully');
            onSubmit?.();
            setRating(0);
            setTitle('');
            setComment('');
        } catch (err) {
            toast.error('Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 theme-bg-tertiary rounded-xl">
            <h3 className="font-semibold theme-text-primary">Write a Review</h3>

            <div>
                <label className="block text-sm theme-text-secondary mb-1">Your Rating *</label>
                <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>

            <div>
                <label className="block text-sm theme-text-secondary mb-1">Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full px-4 py-2 rounded-lg theme-bg-secondary theme-text-primary border theme-border-light focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            <div>
                <label className="block text-sm theme-text-secondary mb-1">Your Review</label>
                <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this company"
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg theme-bg-secondary theme-text-primary border theme-border-light focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
            >
                {loading ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
}

export function ReviewsList({ companyId }) {
    const { auth } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [companyId]);

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/api/reviews/company/${companyId}`);
            setReviews(res.data.data || []);
            setSummary(res.data.summary || { averageRating: 0, totalReviews: 0 });
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId) => {
        if (!confirm('Are you sure you want to delete this review?')) return;

        try {
            await api.delete(`/api/reviews/${reviewId}`);
            toast.success('Review deleted');
            fetchReviews();
        } catch (err) {
            toast.error('Failed to delete review');
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse">
                        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center justify-between p-4 theme-bg-tertiary rounded-xl">
                <ReviewsSummary summary={summary} />
                <div className="flex gap-1">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const percent = summary.totalReviews > 0 ? (count / summary.totalReviews) * 100 : 0;
                        return (
                            <div key={star} className="flex items-center gap-2 text-sm">
                                <span className="theme-text-muted">{star}</span>
                                <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-yellow-400"
                                        style={{ width: `${percent}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Review Form */}
            {auth && <ReviewForm companyId={companyId} onSubmit={fetchReviews} />}

            {/* Reviews List */}
            <div className="space-y-4">
                {reviews.length === 0 ? (
                    <div className="text-center py-8 theme-text-muted">
                        No reviews yet. Be the first to review!
                    </div>
                ) : (
                    reviews.map(review => (
                        <div key={review.id} className="p-4 theme-bg-tertiary rounded-xl">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white">
                                        {review.reviewer_avatar ? (
                                            <img src={review.reviewer_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <FaUser />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium theme-text-primary">{review.reviewer_name}</p>
                                        <StarRating rating={review.rating} readonly size="sm" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm theme-text-muted">
                                        {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                                    </span>
                                    {auth?.user?.id === review.user_id && (
                                        <button onClick={() => handleDelete(review.id)} className="text-red-500 hover:text-red-600">
                                            <FaTrash className="text-sm" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {review.title && <h4 className="font-medium theme-text-primary mt-3">{review.title}</h4>}
                            {review.comment && <p className="theme-text-secondary mt-2">{review.comment}</p>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default ReviewsList;
