import type { TextareaHTMLAttributes } from 'react';
import { forwardRef, useEffect } from 'react';

interface NoteEditorProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  content?: string;
  onChange?: (content: string) => void;
  autoFocus?: boolean;
  label?: string;
  error?: string;
}

export const NoteEditor = forwardRef<HTMLTextAreaElement, NoteEditorProps>(
  ({ content, onChange, autoFocus = true, label, error, className = '', value, ...props }, ref) => {
    useEffect(() => {
      if (autoFocus && ref && 'current' in ref && ref.current) {
        ref.current.focus();
      }
    }, [autoFocus, ref]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
          ref={ref}
          value={value !== undefined ? value : content}
          onChange={handleChange}
          className={`w-full p-4 border rounded-lg text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[400px] ${error ? 'border-red-500' : 'border-gray-300'
            } ${className}`}
          placeholder="Начните писать здесь..."
          {...props}
        />
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    );
  },
);