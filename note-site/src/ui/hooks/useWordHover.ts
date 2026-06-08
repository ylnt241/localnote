import { useState, useRef, useCallback } from 'react';

export interface DefinitionData {
  word: string;
  phonetic?: string;
  partOfSpeech?: string;
  definition: string;
}

export interface UseWordHoverResult {
  hoveredWord: string | null;
  isPoppedOpen: boolean;
  isLoading: boolean;
  definitionData: DefinitionData | null;
  error: string | null;
  handleMouseEnter: (word: string, element: HTMLElement) => void;
  handleMouseLeave: () => void;
}

const DEBOUNCE_DELAY = 450;

export function useWordHover(
  fetchDefinition: (word: string) => Promise<DefinitionData | null>
): UseWordHoverResult {
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [isPoppedOpen, setIsPoppedOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [definitionData, setDefinitionData] = useState<DefinitionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentWordRef = useRef<string | null>(null);

  const handleMouseEnter = useCallback((word: string, _element: HTMLElement) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    currentWordRef.current = word;
    setHoveredWord(word);
    setError(null);

    // Set up debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      // Only proceed if we're still hovering over the same word
      if (currentWordRef.current === word) {
        setIsLoading(true);
        setIsPoppedOpen(true);

        try {
          const data = await fetchDefinition(word);
          if (data) {
            setDefinitionData(data);
            setError(null);
          } else {
            setDefinitionData(null);
            setError('Definition not found');
          }
        } catch (err) {
          setDefinitionData(null);
          setError('Failed to fetch definition');
        } finally {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_DELAY);
  }, [fetchDefinition]);

  const handleMouseLeave = useCallback(() => {
    // Clear any pending timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    currentWordRef.current = null;
    
    // Don't immediately close the popover - let it fade out naturally
    // The component will handle this based on mouse position
  }, []);

  return {
    hoveredWord,
    isPoppedOpen,
    isLoading,
    definitionData,
    error,
    handleMouseEnter,
    handleMouseLeave
  };
}