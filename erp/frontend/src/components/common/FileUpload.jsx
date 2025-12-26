// src/components/common/FileUpload.jsx - File Upload Component
import { useState, useRef } from "react";
import { FaCloudUploadAlt, FaFile, FaTimes, FaCheck, FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";

export function FileUpload({
    onUpload,
    accept = "*",
    maxSize = 10, // MB
    multiple = false,
    label = "Upload File",
    hint = "",
    className = "",
}) {
    const [uploading, setUploading] = useState(false);
    const [files, setFiles] = useState([]);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const handleFiles = async (fileList) => {
        const selectedFiles = Array.from(fileList);

        // Validate file size
        const oversized = selectedFiles.filter(f => f.size > maxSize * 1024 * 1024);
        if (oversized.length > 0) {
            toast.error(`File(s) exceed ${maxSize}MB limit`);
            return;
        }

        setFiles(selectedFiles.map(f => ({ file: f, status: 'pending' })));
        setUploading(true);

        try {
            for (let i = 0; i < selectedFiles.length; i++) {
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'uploading' } : f
                ));

                const formData = new FormData();
                formData.append(multiple ? 'documents' : 'document', selectedFiles[i]);

                if (onUpload) {
                    await onUpload(formData, selectedFiles[i]);
                }

                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'success' } : f
                ));
            }
            toast.success(`File${selectedFiles.length > 1 ? 's' : ''} uploaded successfully`);
        } catch (error) {
            toast.error("Upload failed");
            setFiles(prev => prev.map(f =>
                f.status === 'uploading' ? { ...f, status: 'error' } : f
            ));
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium theme-text-primary mb-2">
                    {label}
                </label>
            )}

            {/* Drop Zone */}
            <div
                className={`
          relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
          transition-all duration-200
          ${dragActive
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                    }
        `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                />

                <FaCloudUploadAlt className={`w-12 h-12 mx-auto mb-3 ${dragActive ? "text-blue-500" : "text-gray-400"}`} />

                <p className="theme-text-primary font-medium">
                    {dragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-sm theme-text-muted mt-1">
                    or <span className="text-blue-500 hover:underline">browse</span>
                </p>
                {hint && <p className="text-xs theme-text-muted mt-2">{hint}</p>}
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 rounded-lg theme-bg-tertiary"
                        >
                            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <FaFile className="text-blue-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium theme-text-primary truncate">
                                    {item.file.name}
                                </p>
                                <p className="text-xs theme-text-muted">
                                    {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.status === 'uploading' && (
                                    <FaSpinner className="w-5 h-5 text-blue-500 animate-spin" />
                                )}
                                {item.status === 'success' && (
                                    <FaCheck className="w-5 h-5 text-green-500" />
                                )}
                                {item.status === 'error' && (
                                    <span className="text-xs text-red-500">Failed</span>
                                )}
                                {item.status !== 'uploading' && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                                    >
                                        <FaTimes className="w-4 h-4 theme-text-muted" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// Avatar Upload Component
export function AvatarUpload({ currentAvatar, onUpload, size = "lg" }) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(currentAvatar);
    const inputRef = useRef(null);

    const sizes = {
        md: "w-20 h-20",
        lg: "w-28 h-28",
        xl: "w-36 h-36",
    };

    const handleChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);

        // Upload
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            if (onUpload) {
                await onUpload(formData);
            }
            toast.success("Avatar updated");
        } catch (error) {
            toast.error("Failed to update avatar");
            setPreview(currentAvatar);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative inline-block">
            <div
                className={`
          ${sizes[size]} rounded-full overflow-hidden cursor-pointer
          bg-gradient-to-br from-blue-500 to-purple-600
          flex items-center justify-center text-white text-2xl font-bold
          ring-4 ring-white dark:ring-gray-800 shadow-lg
        `}
                onClick={() => inputRef.current?.click()}
            >
                {preview ? (
                    <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <FaCloudUploadAlt className="w-8 h-8" />
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full">
                        <FaSpinner className="w-8 h-8 text-white animate-spin" />
                    </div>
                )}
            </div>

            <button
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                onClick={() => inputRef.current?.click()}
            >
                <FaCloudUploadAlt className="w-4 h-4" />
            </button>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="hidden"
            />
        </div>
    );
}

export default { FileUpload, AvatarUpload };
