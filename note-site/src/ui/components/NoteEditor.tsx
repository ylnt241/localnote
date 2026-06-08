import type { TextareaHTMLAttributes } from 'react';
import { forwardRef, useEffect } from 'react';

interface NoteEditorProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
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
      <textarea
        ref={ref}
        value={value !== undefined ? value : content}
        onChange={handleChange}
        className="w-full h-full min-h-[400px] p-4 font-mono text-sm resize-none border-0 focus:outline-none bg-transparent text-gray-800 placeholder-gray-500 whitespace-pre-wrap break-words overflow-hidden max-w-full [&_span.word-token]:break-words [&_span.word-token]:overflow-hidden [&_span.word-token]:text-ellipsis"
        placeholder="Начните писать здесь..."
        {...props}
      />
    );
  },
);

