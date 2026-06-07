import { useState, useEffect, useRef } from 'react';

/**
 * Props for the NoteEditor component.
 * - `content`: current note content passed from parent.
 * - `onChange`: callback invoked with updated content (debounced).
 * - `autoFocus`: whether to focus the textarea on mount (default true).
 */
interface NoteEditorProps {
  content: string;
  onChange: (content: string) => void;
  autoFocus?: boolean;
}

/**
 * Simple textarea editor for notes.
 * Mirrors the implementation from `code-reference/src/ui/components/NoteEditor.tsx`.
 * Keeps a local copy of the text to allow debounced updates back to the parent.
 */
export function NoteEditor({ content, onChange, autoFocus = true }: NoteEditorProps) {
  // Local state mirrors the incoming prop so that typing is instant.
  const [localContent, setLocalContent] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update local state when the parent changes the content prop.
  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Auto‑focus on mount if requested.
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  };

  // Debounce changes back to the parent to avoid excessive renders.
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (localContent !== content) {
        onChange(localContent);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [localContent, content, onChange]);

  return (
    <textarea
      ref={textareaRef}
      value={localContent}
      onChange={handleChange}
      className="w-full h-full min-h-[400px] p-4 font-mono text-sm resize-none border-0 focus:outline-none bg-transparent text-slate-200 placeholder-slate-500"
      placeholder="Start typing your note here..."
    />
  );
}
