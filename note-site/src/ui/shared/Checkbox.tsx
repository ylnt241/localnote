import type { InputHTMLAttributes } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label?: string;
}

export function Checkbox({ label, checked, onChange, disabled, ...props }: CheckboxProps) {
    return (
        <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
                type="checkbox"
                checked={checked}
                onChange={onChange}
                disabled={disabled}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                {...props}
            />
            {label && <span className={`text-sm ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>{label}</span>}
        </label>
    );
}