import { useState } from "react";
import { FaPaperPlane, FaEdit, FaTrash, FaUser, FaClock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function ProjectComments({
    projectId,
    comments: initialComments = [],
    onAddComment,
    onEditComment,
    onDeleteComment,
}) {
    const { auth } = useAuth();
    const [comments, setComments] = useState(initialComments);
    const [newComment, setNewComment] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editText, setEditText] = useState("");
    const [loading, setLoading] = useState(false);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setLoading(true);
        try {
            const comment = {
                id: `comment-${Date.now()}`,
                projectId,
                text: newComment.trim(),
                author: auth?.user?.name || "User",
                authorId: auth?.user?.id,
                createdAt: new Date().toISOString(),
            };

            // Add to local state
            setComments((prev) => [comment, ...prev]);
            setNewComment("");

            // Call parent handler if provided
            onAddComment?.(comment);
        } catch (err) {
            console.error("Failed to add comment:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (comment) => {
        setEditingId(comment.id);
        setEditText(comment.text);
    };

    const handleSaveEdit = async (commentId) => {
        if (!editText.trim()) return;

        try {
            setComments((prev) =>
                prev.map((c) =>
                    c.id === commentId
                        ? { ...c, text: editText.trim(), editedAt: new Date().toISOString() }
                        : c
                )
            );
            setEditingId(null);
            setEditText("");
            onEditComment?.(commentId, editText.trim());
        } catch (err) {
            console.error("Failed to edit comment:", err);
        }
    };

    const handleDelete = async (commentId) => {
        if (!confirm("Delete this comment?")) return;

        try {
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            onDeleteComment?.(commentId);
        } catch (err) {
            console.error("Failed to delete comment:", err);
        }
    };

    const getInitials = (name) => {
        return name
            ?.split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";
    };

    return (
        <div className="theme-bg-secondary rounded-xl theme-shadow-md p-4 border theme-border-light">
            <h3 className="font-semibold theme-text-primary mb-4 flex items-center gap-2">
                💬 Comments
                {comments.length > 0 && (
                    <span className="px-2 py-0.5 text-xs rounded-full theme-bg-tertiary theme-text-secondary">
                        {comments.length}
                    </span>
                )}
            </h3>

            {/* New Comment Form */}
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {getInitials(auth?.user?.name)}
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            rows={2}
                            className="w-full px-3 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!newComment.trim() || loading}
                                className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <FaPaperPlane className="w-3 h-3" />
                                Post
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {comments.length === 0 ? (
                    <div className="py-8 text-center theme-text-muted">
                        <p className="text-3xl mb-2">💬</p>
                        <p className="text-sm">No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.id}
                            className="flex gap-3 animate-fade-in-up group"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                {getInitials(comment.author)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium theme-text-primary">
                                        {comment.author}
                                    </span>
                                    <span className="text-xs theme-text-muted flex items-center gap-1">
                                        <FaClock className="w-3 h-3" />
                                        {formatTime(comment.createdAt)}
                                        {comment.editedAt && " (edited)"}
                                    </span>
                                </div>

                                {editingId === comment.id ? (
                                    <div>
                                        <textarea
                                            value={editText}
                                            onChange={(e) => setEditText(e.target.value)}
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-lg border theme-border-light theme-bg-tertiary theme-text-primary text-sm resize-none"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button
                                                onClick={() => handleSaveEdit(comment.id)}
                                                className="px-3 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={() => setEditingId(null)}
                                                className="px-3 py-1 text-xs rounded theme-bg-tertiary theme-text-secondary hover:opacity-80"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm theme-text-secondary whitespace-pre-wrap">
                                        {comment.text}
                                    </p>
                                )}

                                {/* Actions */}
                                {auth?.user?.id === comment.authorId && editingId !== comment.id && (
                                    <div className="flex gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(comment)}
                                            className="text-xs theme-text-muted hover:theme-text-accent flex items-center gap-1"
                                        >
                                            <FaEdit className="w-3 h-3" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(comment.id)}
                                            className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                                        >
                                            <FaTrash className="w-3 h-3" />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
