import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({ 
    type = 'success', 
    message, 
    onClose, 
    duration = 3000,
    autoClose = true 
}) => {
    useEffect(() => {
        if (autoClose && duration) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [autoClose, duration, onClose]);

    const config = {
        success: {
            icon: CheckCircle,
            bgClass: 'bg-green-50',
            borderClass: 'border-green-200',
            iconClass: 'text-green-600',
            textClass: 'text-green-800'
        },
        error: {
            icon: XCircle,
            bgClass: 'bg-red-50',
            borderClass: 'border-red-200',
            iconClass: 'text-red-600',
            textClass: 'text-red-800'
        },
        warning: {
            icon: AlertCircle,
            bgClass: 'bg-orange-50',
            borderClass: 'border-orange-200',
            iconClass: 'text-orange-600',
            textClass: 'text-orange-800'
        },
        info: {
            icon: Info,
            bgClass: 'bg-blue-50',
            borderClass: 'border-blue-200',
            iconClass: 'text-blue-600',
            textClass: 'text-blue-800'
        }
    };

    const current = config[type] || config.info;
    const Icon = current.icon;

    return (
        <div 
            className={`fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-up ${current.bgClass} ${current.borderClass} border-l-4 p-4 rounded-lg shadow-lg`}
            role="alert"
        >
            <div className="flex items-start gap-3">
                <Icon className={`${current.iconClass} flex-shrink-0`} size={20} />
                <p className={`flex-1 text-sm font-medium ${current.textClass}`}>
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default Toast;
