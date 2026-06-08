import type { FC, ReactNode } from 'react';
import { useState, useCallback } from 'react';
import { useMarkdownProcessor } from '../hooks/useMarkdownProcessor';
import { useWordHover } from '../hooks/useWordHover';
import { DictionaryPopover } from './DictionaryPopover';
import { dictionaryService } from '../../services/DictionaryService';
import { toggleTaskInNote } from '../../core/utils/tasks';
import 'katex/dist/katex.min.css';

interface NoteReaderProps {
  content: string;
  onContentChange?: (content: string) => void;
  label?: string;
  className?: string;
  children?: ReactNode;
}

export const NoteReader: FC<NoteReaderProps> = ({ content, onContentChange, label, className = '' }) => {
  const [popoverPosition, setPopoverPosition] = useState<{ x: number; y: number } | null>(null);

  const fetchDefinition = useCallback(async (word: string) => {
    return await dictionaryService.fetchDefinition(word);
  }, []);

  const wordHover = useWordHover(fetchDefinition);

  const handleWordHover = useCallback((word: string) => {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.classList.contains('word-token')) {
      const rect = activeElement.getBoundingClientRect();
      setPopoverPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
      wordHover.handleMouseEnter(word, activeElement);
    } else {
      wordHover.handleMouseEnter(word, document.body);
    }
  }, [wordHover]);

  const handleWordLeave = useCallback(() => {
    wordHover.handleMouseLeave();
  }, [wordHover]);

  const closePopover = useCallback(() => {
    setPopoverPosition(null);
  }, []);

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
    <div className="w-full h-full min-h-[400px] p-4 bg-transparent text-gray-800 break-words overflow-y-auto max-w-full [&_span.word-token]:break-words [&_span.word-token]:overflow-hidden [&_span.word-token]:text-ellipsis">
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
};
