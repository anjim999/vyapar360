// src/components/common/Input.jsx
// Reusable Input component with icons and validation

import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    error,
    helperText,
    icon,
    iconPosition = "left",
    disabled = false,
    required = false,
    className = "",
    inputClassName = "",
    ...props
}) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium theme-text-secondary mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && iconPosition === "left" && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-muted">
                        {icon}
                    </div>
                )}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`
            w-full px-4 py-2.5 rounded-lg border transition-all duration-200
            theme-bg-secondary theme-text-primary
            ${error
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : "theme-border focus:border-blue-500 focus:ring-blue-500"
                        }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:opacity-50 disabled:cursor-not-allowed
            placeholder:theme-text-muted
            ${icon && iconPosition === "left" ? "pl-10" : ""}
            ${isPassword || (icon && iconPosition === "right") ? "pr-10" : ""}
            ${inputClassName}
          `}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted hover:theme-text-primary transition-colors"
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
                {icon && iconPosition === "right" && !isPassword && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-muted">
                        {icon}
                    </div>
                )}
            </div>
            {(error || helperText) && (
                <p className={`mt-1.5 text-sm ${error ? "text-red-500" : "theme-text-muted"}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

export function Textarea({
    label,
    name,
    value,
    onChange,
    placeholder,
    error,
    helperText,
    disabled = false,
    required = false,
    rows = 4,
    className = "",
    ...props
}) {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium theme-text-secondary mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                rows={rows}
                className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          theme-bg-secondary theme-text-primary resize-none
          ${error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "theme-border focus:border-blue-500 focus:ring-blue-500"
                    }
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
          placeholder:theme-text-muted
        `}
                {...props}
            />
            {(error || helperText) && (
                <p className={`mt-1.5 text-sm ${error ? "text-red-500" : "theme-text-muted"}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

export function Select({
    label,
    name,
    value,
    onChange,
    options = [],
    placeholder = "Select an option",
    error,
    helperText,
    disabled = false,
    required = false,
    className = "",
    ...props
}) {
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className="block text-sm font-medium theme-text-secondary mb-1.5">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className={`
          w-full px-4 py-2.5 rounded-lg border transition-all duration-200
          theme-bg-secondary theme-text-primary
          ${error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "theme-border focus:border-blue-500 focus:ring-blue-500"
                    }
          focus:outline-none focus:ring-2 focus:ring-opacity-50
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
                {...props}
            >
                <option value="" className="theme-text-muted">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {(error || helperText) && (
                <p className={`mt-1.5 text-sm ${error ? "text-red-500" : "theme-text-muted"}`}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
}

export default Input;
