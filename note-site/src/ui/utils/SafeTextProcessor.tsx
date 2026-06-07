import type { FC } from 'react';
import { useCallback } from 'react';

interface TextTokenizerResult {
  text: string;
  isWord: boolean;
}

interface SafeTextProcessorProps {
  text: string;
  onWordHover: (word: string) => void;
  onWordLeave: () => void;
  className?: string;
}

/**
 * Токенизатор текста - разбивает текст на слова и не-слова
 */
export const textTokenizer = (text: string): TextTokenizerResult[] => {
  const tokens: TextTokenizerResult[] = [];
  
  // Разделяем текст по пробелам и обработке пунктуации
  const parts = text.split(/(\s+)/);
  
  for (const part of parts) {
    if (part === '') continue;
    
    // Если это пробелы, добавляем как есть
    if (/^\s+$/.test(part)) {
      tokens.push({ text: part, isWord: false });
      continue;
    }
    
    // Разделяем слова с пунктуацией
    const subParts = part.split(/([.,\/#!$%\^&\*;:{}=\-_`~()?"'])/);
    
    for (const subPart of subParts) {
      if (subPart === '') continue;
      
      // Определяем, является ли это словом (буквы и цифры)
      const isWord = /^[a-zA-Zа-яА-ЯёЁ0-9]+$/.test(subPart);
      tokens.push({ text: subPart, isWord });
    }
  }
  
  return tokens;
};

/**
 * Безопасная обработка текста - оборачивает слова в span с hover-обработчиками
 * Предотвращает XSS-атаки и предоставляет подсветку слов при наведении
 */
export const SafeTextProcessor: FC<SafeTextProcessorProps> = ({ 
  text, 
  onWordHover, 
  onWordLeave, 
  className = '' 
}) => {
  const handleMouseEnter = useCallback((word: string, event: React.MouseEvent<HTMLSpanElement>) => {
    const target = event.target as HTMLElement;
    target.focus();
    onWordHover(word);
  }, [onWordHover]);

  const handleMouseLeave = useCallback(() => {
    onWordLeave();
  }, [onWordLeave]);

  const tokens = textTokenizer(text);

  return (
    <span className={`text-sm text-gray-700 ${className}`}>
      {tokens.map((token, index) => {
        const key = `${token.text}-${index}`;
        
        if (token.isWord) {
          return (
            <span
              key={key}
              className="word-token hover:bg-blue-50 rounded-sm cursor-pointer transition-colors"
              onMouseEnter={(e) => handleMouseEnter(token.text, e)}
              onMouseLeave={handleMouseLeave}
            >
              {token.text}
            </span>
          );
        }
        
        // Для не-слов просто возвращаем текст
        return token.text;
      })}
    </span>
  );
};
