import type { ReactNode } from 'react';

interface ButtonProps {
    children?: ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
    className?: string;
}

export function Button({
    children,
    onClick,
    variant = 'primary',
    size = 'md',
    disabled = false,
    type = 'button',
    className = '',
}: ButtonProps) {
    const base = 'rounded font-medium transition-all duration-150 active:scale-95 cursor-pointer';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:border-blue-300 disabled:text-blue-300',
    };
    const sizes = {
        sm: 'px-3 py-1 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    };
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${variants[variant]} ${sizes[size]} ${disabled ? 'cursor-not-allowed' : ''} ${className}`}
        >
            {children}
        </button>
    );
}