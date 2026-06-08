import { NoteEditor } from './NoteEditor';
import { NoteReader } from './NoteReader';
import { SaveStatusIndicator } from '../shared/SaveStatusIndicator';
import type { SaveStatus } from '../hooks/useNotes.ts';
import { useState, KeyboardEvent as ReactKeyboardEvent, useRef, useEffect } from 'react';
import { cn } from '../shared/utils';

interface MainPanelProps {
    content: string;
    title: string;
    onContentChange: (content: string) => void;
    onTitleChange: (title: string) => void;
    onSave: () => Promise<void>;
    onExportToAnki: () => void;
    saveStatus: SaveStatus;
    onAddTag?: (tag: string) => void;
    onRemoveTag?: (tag: string) => void;
    currentTags?: string[];
}

const colorOptions = [];

export function MainPanel({
    content,
    title,
    onContentChange,
    onTitleChange,
    onSave,
    onExportToAnki,
    saveStatus,
    onAddTag,
    onRemoveTag,
    currentTags = [],
}: MainPanelProps) {
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        // Remove color picker event listener
    }, []);

    const handleTagInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim() && onAddTag) {
            e.preventDefault();
            const normalizedTag = tagInput.trim().toLowerCase();
            if (!currentTags.includes(normalizedTag)) {
                onAddTag(normalizedTag);
                setTagInput('');
            }
        }
    };

    const handleRemoveTag = (tag: string) => {
        if (onRemoveTag) {
            onRemoveTag(tag);
        }
    };

    const getStatusImage = () => {
        switch (saveStatus) {
            case 'saved':
                return '../../../public/25.jpg';
            case 'saving':
                return '../../../public/24.jpg';
            default:
                return '../../../public/6.jpg';
        }
    };


    return (
        <div className="flex flex-col h-full border border-gray-200 rounded-xl shadow-sm overflow-hidden relative">

            {/* Фоновый слой с размытием */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url('/21.jpg')",
                    backgroundSize: "200px",
                    backgroundPosition: "center",
                    backgroundRepeat: "repeat",
                    filter: "blur(2px)"
                }}
            />

            {/* Контент поверх фона (без размытия) */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Header with Title and Actions */}
                <header className="border-b border-gray-200 bg-white/80 px-5 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between gap-4 mb-3">
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => onTitleChange(e.target.value)}
                            className="text-lg font-semibold bg-white/90 border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 text-gray-800 placeholder-gray-400"
                            placeholder="Note title..."
                        />

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="w-10 h-10 flex items-center justify-center">
                                <img
                                    src="../../../public/5.jpg"
                                    alt="cat"
                                    className="w-10 h-10"
                                />
                            </div>

                            <div className="h-5 w-px bg-gray-300" />

                            <button
                                onClick={onExportToAnki}
                                className="px-4 py-2 bg-white/90 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            >
                                <img src="../../../public/12.jpg" alt="Export" className="w-8 h-8 inline mr-1" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex-1 flex items-center gap-2">
                            <img src="../../../public/9.jpg" alt="Tag" className="w-6 h-6 text-gray-500" />
                            <div className="flex-1 flex items-center gap-2 flex-wrap">
                                {currentTags.map((tag) => (
                                    <div
                                        key={tag}
                                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100/90 border border-blue-300 rounded-md text-xs text-blue-700"
                                    >
                                        <span>#{tag}</span>
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="hover:text-blue-600 transition-colors"
                                        >
                                            <img src="../../../2.jpg" alt="Remove" className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <input
                                    type="text"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleTagInputKeyDown}
                                    placeholder="Add tag... (Enter)"
                                    className="px-2 py-0.5 bg-white/90 border border-gray-300 rounded-md text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-50 w-28"
                                />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Editor and Preview */}
                <main className="flex-1 flex overflow-hidden">
                    <div className="w-1/2 border-r border-gray-200 flex flex-col flex-shrink-0 min-w-0">
                        <div className="px-5 py-2.5 border-b border-gray-200 bg-white/80 text-xs font-medium text-gray-500 flex-shrink-0">
                            Editor
                        </div>
                        <div className="flex-1 overflow-auto flex-shrink-0 min-w-0 bg-white/70">
                            <NoteEditor content={content} onChange={onContentChange} />
                        </div>
                    </div>

                    <div className="w-1/2 flex flex-col flex-shrink-0 min-w-0">
                        <div className="px-5 py-2.5 border-b border-gray-200 bg-white/80 text-xs font-medium text-gray-500 flex-shrink-0">
                            Preview
                        </div>
                        <div className="flex-1 overflow-auto flex-shrink-0 min-w-0 bg-white/70">
                            <NoteReader content={content} onContentChange={onContentChange} />
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
}