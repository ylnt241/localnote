import { useState, useCallback } from 'react';
import { useMarkdownProcessor } from '../hooks/useMarkdownProcessor';
import { useWordHover } from '../hooks/useWordHover';
import { DictionaryPopover } from './DictionaryPopover';
import { dictionaryService } from '../services/DictionaryService';
import { toggleTaskInNote } from '@/core/utils/tasks';
import 'katex/dist/katex.min.css';

/**
 * Props for the NoteReader component.
 * - `content`: markdown source to render.
 * - `onContentChange` (optional): called when a task checkbox is toggled.
 */
interface NoteReaderProps {
  content: string;
  onContentChange?: (content: string) => void;
}

/**
 * Renders markdown with interactive word hover definitions and task toggling.
 * Mirrors the reference implementation from `code-reference/src/ui/components/NoteReader.tsx`.
 */
export function NoteReader({ content, onContentChange }: NoteReaderProps) {
  // Position for the dictionary pop‑over when a word is hovered.
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  // Fetch a definition from the dictionary service.
  const fetchDefinition = useCallback(async (word: string) => {
    return await dictionaryService.fetchDefinition(word);
  }, []);

  const wordHover = useWordHover(fetchDefinition);

  // When a word token is hovered, compute pop‑over coordinates.
  const handleWordHover = useCallback((word: string) => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.classList.contains('word-token')) {
      const rect = activeElement.getBoundingClientRect();
      setPopoverPosition({ x: rect.left + rect.width / 2, y: rect.top });
      wordHover.handleMouseEnter(word, activeElement);
    } else {
      wordHover.handleMouseEnter(word, document.body);
    }
  }, [wordHover]);

  const handleWordLeave = useCallback(() => {
    wordHover.handleMouseLeave();
  }, [wordHover]);

  const closePopover = useCallback(() => setPopoverPosition(null), []);

  // Toggle a task checkbox inside the markdown content.
  const handleToggleCheckbox = useCallback((lineIndex: number) => {
    if (!onContentChange) return;
    const newContent = toggleTaskInNote(content, lineIndex);
    if (newContent !== content) {
      onContentChange(newContent);
    }
  }, [content, onContentChange]);

  const processedContent = useMarkdownProcessor({
    markdown: content,
    onWordHover: handleWordHover,
    onWordLeave: handleWordLeave,
    onToggleCheckbox: onContentChange ? handleToggleCheckbox : undefined,
  });

  return (
    <div className="prose prose-slate max-w-none dark:prose-invert p-4 min-h-[400px] h-full relative">
      {processedContent}
      <DictionaryPopover
        isVisible={wordHover.isPoppedOpen}
        isLoading={wordHover.isLoading}
        definitionData={wordHover.definitionData}
        error={wordHover.error}
        targetPosition={popoverPosition}
        onClose={closePopover}
      />
    </div>
  );
}
