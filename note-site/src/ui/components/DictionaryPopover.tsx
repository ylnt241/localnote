import { useEffect, useRef } from 'react';
import { DefinitionData } from '../hooks/useWordHover';

interface DictionaryPopoverProps {
  isVisible: boolean;
  isLoading: boolean;
  definitionData: DefinitionData | null;
  error: string | null;
  targetPosition: { x: number; y: number } | null;
  onClose: () => void;
}

export function DictionaryPopover({
  isVisible,
  isLoading,
  definitionData,
  error,
  targetPosition,
  onClose
}: DictionaryPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, onClose]);

  if (!isVisible || !targetPosition) {
    return null;
  }

  const popoverStyle = {
    position: 'fixed' as const,
    left: `${targetPosition.x}px`,
    top: `${targetPosition.y - 10}px`, // Position slightly above the word
    transform: 'translate(-50%, -100%)',
    zIndex: 1000
  };

  return (
    <div
      ref={popoverRef}
      className="w-80 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 animate-in fade-in slide-in-from-top-2 duration-200"
      style={popoverStyle}
      onMouseLeave={onClose}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <div className="relative w-6 h-6">
            <div className="absolute inset-0 border-2 border-slate-200 dark:border-slate-600 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
        </div>
      ) : error ? (
        <div className="text-sm text-slate-500 dark:text-slate-400 py-2">
          {error}
        </div>
      ) : definitionData ? (
        <div className="space-y-2">
          <div className="flex items-baseline gap-2">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {definitionData.word}
            </h3>
            {definitionData.phonetic && (
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {definitionData.phonetic}
              </span>
            )}
          </div>
          
          {definitionData.partOfSpeech && (
            <p className="text-sm italic text-slate-600 dark:text-slate-300">
              {definitionData.partOfSpeech}
            </p>
          )}
          
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {definitionData.definition}
          </p>
        </div>
      ) : null}
      
      {/* Arrow pointing down */}
      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white dark:bg-slate-800 border-r border-b border-slate-200 dark:border-slate-700 rotate-45"></div>
    </div>
  );
}