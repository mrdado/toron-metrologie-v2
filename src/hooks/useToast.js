import { useState, useCallback } from 'react';

export const useToast = () => {
    const [toast, setToast] = useState(null);

    const showToast = useCallback((type, message, options = {}) => {
        setToast({
            type,
            message,
            ...options
        });
    }, []);

    const hideToast = useCallback(() => {
        setToast(null);
    }, []);

    return {
        toast,
        showToast,
        hideToast,
        showSuccess: (message, options) => showToast('success', message, options),
        showError: (message, options) => showToast('error', message, options),
        showWarning: (message, options) => showToast('warning', message, options),
        showInfo: (message, options) => showToast('info', message, options)
    };
};
