// src/hooks/useApi.js
// Custom hook for API calls with loading and error states

import { useState, useCallback } from "react";
import { toast } from "react-toastify";

export function useApi(apiFunction, options = {}) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const {
        onSuccess,
        onError,
        successMessage,
        errorMessage = "Something went wrong",
        showToast = true
    } = options;

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFunction(...args);
            setData(result.data || result);
            if (showToast && successMessage) toast.success(successMessage);
            if (onSuccess) onSuccess(result);
            return result;
        } catch (err) {
            const message = err.response?.data?.error || errorMessage;
            setError(message);
            if (showToast) toast.error(message);
            if (onError) onError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction, onSuccess, onError, successMessage, errorMessage, showToast]);

    const reset = useCallback(() => {
        setData(null);
        setLoading(false);
        setError(null);
    }, []);

    return { data, loading, error, execute, reset };
}

export default useApi;
