import type { FC } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface SafeProcessorProps {
  text: string;
  onWordHover: (word: string) => void;
  onWordLeave: () => void;
  className?: string;
}

const renderSafeMath = (formula: string, displayMode: boolean): string => {
  const sanitizedFormula = DOMPurify.sanitize(formula, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  try {
    const html = katex.renderToString(sanitizedFormula, { displayMode, throwOnError: true });
    return DOMPurify.sanitize(html);
  } catch {
    return displayMode
      ? '<div class="katex-error text-red-500 my-4">[Неверное математическое выражение]</div>'
      : '<span class="katex-error text-red-500">[Ошибка в формуле]</span>';
  }
}

export const SafeTextProcessor: FC<SafeProcessorProps> = ({ text, onWordHover, onWordLeave, className = '' }) => {
  const regex = /(\$\$[\s\S]+?\$\$|\$.+?\$)/g;
  const parts = text.split(regex);

  return (
    <div className={`text-sm text-gray-700 ${className}`}>
      {parts.map((part, index) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const formula = part.slice(2, -2).trim();
          const html = renderSafeMath(formula, true);
          return <div key={index} dangerouslySetInnerHTML={{ __html: html }} className="my-4" />;
        }
        
        if (part.startsWith('$') && part.endsWith('$')) {
          const formula = part.slice(1, -1).trim();
          const html = renderSafeMath(formula, false);
          return <span key={index} dangerouslySetInnerHTML={{ __html: html }} />;
        }

        return (
          <span key={index}>
            {part.split(/(\s+)/).map((subPart, subIndex) => {
              if (/^\s+$/.test(subPart)) return subPart;
              
              const cleanWord = subPart.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, "");
              
              if (!cleanWord) return subPart;

              return (
                <span
                  key={subIndex}
                  className="word-token hover:bg-blue-50 rounded-sm cursor-pointer transition-colors text-gray-700"
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).focus();
                    onWordHover(cleanWord);
                  }}
                  onMouseLeave={onWordLeave}
                >
                  {subPart}
                </span>
              );
            })}
          </span>
        );
      })}
    </div>
  );
};