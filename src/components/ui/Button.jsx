import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
    children,
    variant = 'primary',
    className = '',
    isLoading = false,
    icon: Icon,
    ...props
}) => {
    const baseClass = 'btn';
    const variantClass = `btn-${variant}`;

    return (
        <button
            className={`${baseClass} ${variantClass} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={18} />}
            {!isLoading && Icon && <Icon size={18} />}
            {children}
        </button>
    );
};

export default Button;
