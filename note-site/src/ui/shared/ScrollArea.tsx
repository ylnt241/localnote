import type { ReactNode } from 'react';

export function ScrollArea({ children, className = '' }: { children: ReactNode; className?: string }) {
    return (
        <div
            className={`overflow-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 ${className}`}
        >
            {children}
        </div>
    );
}