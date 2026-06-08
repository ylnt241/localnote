import { useMemo, useRef, useCallback } from 'react';
import React, { Children, isValidElement, ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import { SafeTextProcessor } from '../components/SafeTextProcessor';
import type { Components } from 'react-markdown';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import 'katex/dist/katex.min.css';

type PProps = ComponentPropsWithoutRef<NonNullable<Components['p']>>;
type LiProps = ComponentPropsWithoutRef<NonNullable<Components['li']>>;
type StrongProps = ComponentPropsWithoutRef<NonNullable<Components['strong']>>;
type EmProps = ComponentPropsWithoutRef<NonNullable<Components['em']>>;
type CodeProps = {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: ReactNode;
  [key: string]: any;
};

const customSchema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames || []), 'span', 'div', 'sup', 'sub', 'annotation', 'input'],
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] || []), 'className', 'style'],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ['className', /^katex(-math-mode)?(-block)?$/],
      ['className', /^word-token$/],
      ['style', /^.*$/],
    ],
    input: [
      ['type', 'checkbox'],
      ['checked', /^(true|false)$/],
      ['disabled', /^(true|false)$/],
    ],
    sup: [...(defaultSchema.attributes?.sup || []), ['className', /^katex(-math-mode)?$/]],
    sub: [...(defaultSchema.attributes?.sub || []), ['className', /^katex(-math-mode)?$/]],
    annotation: [
      ...(defaultSchema.attributes?.annotation || []),
      ['encoding', 'application/x-tex'],
    ],
    math: [
      ['display', /^(true|false)$/],
      ['xmlns', 'http://www.w3.org/1998/Math/MathML'],
    ],
    maction: [...(defaultSchema.attributes?.maction || []), ['actiontype', /^(toggle|status|tooltip|highlight)$/]],
    semantics: [...(defaultSchema.attributes?.semantics || [])],
  },
  protocols: {
    ...defaultSchema.protocols,
    href: [...(defaultSchema.protocols?.href || []), 'http', 'https', 'mailto'],
  },
};

interface MarkdownProcessorProps {
  markdown: string;
  onWordHover?: (word: string) => void;
  onWordLeave?: () => void;
  onToggleCheckbox?: (lineIndex: number) => void;
}

const findTaskLineIndex = (markdown: string, taskIndex: number): number => {
  const lines = markdown.split('\n');
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*[-*]\s+\[.\]/.test(lines[i])) {
      if (count === taskIndex) return i;
      count++;
    }
  }
  return -1;
}

export function useMarkdownProcessor({ markdown, onWordHover, onWordLeave, onToggleCheckbox }: MarkdownProcessorProps) {
  const taskCounterRef = useRef(0);

  const handleToggleCheckbox = useCallback((taskIndex: number) => {
    if (!onToggleCheckbox) return;
    const lineIndex = findTaskLineIndex(markdown, taskIndex);
    if (lineIndex >= 0) {
      onToggleCheckbox(lineIndex);
    }
  }, [markdown, onToggleCheckbox]);

  const components: Components = useMemo(() => {
    if (!onWordHover || !onWordLeave) {
      return onToggleCheckbox
        ? {
            li: ({ children }: LiProps) => {
              const taskIndex = taskCounterRef.current;
              const childrenArr = Children.toArray(children);
              const inputIndex = childrenArr.findIndex(
                (child) => isValidElement(child) && child.type === 'input',
              );

              if (inputIndex >= 0) {
                taskCounterRef.current += 1;
                const input = childrenArr[inputIndex] as ReactElement;
                const checked = input.props.checked === true || input.props.checked === 'true';
                return (
                  <li className="task-list-item flex items-center gap-1 my-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleCheckbox(taskIndex)}
                      className="h-4 w-4 rounded border-gray-300 bg-white checked:bg-blue-500 cursor-pointer flex-shrink-0 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="flex-1 min-w-0 text-gray-700 leading-relaxed">
                      {typeof children === 'string' ? (
                        <span className="text-sm text-gray-700">{children}</span>
                      ) : (
                        childrenArr.filter((_, i) => i !== inputIndex)
                      )}
                    </span>
                  </li>
                );
              }

              return <li>{children}</li>;
            },
          }
        : {};
    }

    const handleWordHoverFn = (word: string) => {
      onWordHover(word);
    };

    const handleWordLeaveFn = () => {
      onWordLeave();
    };

    return {
      p: ({ children }: PProps) => {
        const textContent = typeof children === 'string' ? children : 
          Children.map(children, child => typeof child === 'string' ? child : '').join('');
        
        return (
          <p className="leading-relaxed my-1 text-gray-700">
            <SafeTextProcessor onWordHover={handleWordHoverFn} onWordLeave={handleWordLeaveFn} text={textContent} />
          </p>
        );
      },

      li: ({ children }: LiProps) => {
        taskCounterRef.current += 1;
        const childrenArr = Children.toArray(children);
        const inputIndex = childrenArr.findIndex(
          (child) => isValidElement(child) && child.type === 'input',
        );

        if (inputIndex >= 0) {
          const input = childrenArr[inputIndex] as ReactElement;
          const checked = input.props.checked === true || input.props.checked === 'true';

          const remainingChildren = childrenArr.filter((_, i) => i !== inputIndex);

          const processedChildren = Children.map(remainingChildren, child => {
            if (typeof child === 'string') {
              return (
                <SafeTextProcessor onWordHover={handleWordHoverFn} onWordLeave={handleWordLeaveFn} text={child} />
              );
            }
            return child;
          });

           return (
             <li className="task-list-item flex items-center gap-1 my-2">
               <input
                 type="checkbox"
                 checked={checked}
                 onChange={() => handleToggleCheckbox(taskCounterRef.current - 1)}
                 className="h-4 w-4 rounded border-gray-300 bg-white checked:bg-blue-500 cursor-pointer flex-shrink-0 focus:ring-2 focus:ring-blue-500"
               />
               <span className="flex-1 min-w-0 text-gray-700 leading-relaxed">
                 {typeof processedChildren === 'string' ? (
                   <span className="text-sm text-gray-700">{processedChildren}</span>
                 ) : (
                   processedChildren
                 )}
               </span>
             </li>
           );
        }

        if (typeof children === 'string') {
          return (
            <li className="my-1 leading-relaxed text-gray-700">
              {children}
            </li>
          );
        }
        return (
          <li className="my-1 leading-relaxed text-gray-700">
            {children}
          </li>
        );
      },

      strong: ({ children }: StrongProps) => {
        const textContent = typeof children === 'string' ? children : 
          Children.map(children, child => typeof child === 'string' ? child : '').join('');
        
        return (
          <strong className="text-gray-800">
            <SafeTextProcessor onWordHover={handleWordHoverFn} onWordLeave={handleWordLeaveFn} text={textContent} />
          </strong>
        );
      },

      em: ({ children }: EmProps) => {
        const textContent = typeof children === 'string' ? children : 
          Children.map(children, child => typeof child === 'string' ? child : '').join('');
        
        return (
          <em className="text-gray-600">
            <SafeTextProcessor onWordHover={handleWordHoverFn} onWordLeave={handleWordLeaveFn} text={textContent} />
          </em>
        );
      },

      code: ({ inline, className, children, ...props }: CodeProps) => {
        const match = /language-(\w+)/.exec(className || '');
        return !inline && match ? (
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto border border-gray-200">
            <code className={className} {...props}>{children}</code>
          </pre>
        ) : (
          <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono text-sm text-gray-800" {...props}>
            {children}
          </code>
        );
      },
    };
  }, [onWordHover, onWordLeave, onToggleCheckbox]);

  return useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, customSchema]]}
        components={components}
      >
        {markdown}
      </ReactMarkdown>
    );
  }, [markdown, components]);
}