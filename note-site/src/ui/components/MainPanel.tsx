import { NoteEditor } from './NoteEditor';
import { NoteReader } from './NoteReader';
import { SaveStatusIndicator } from '../shared/SaveStatusIndicator';
import type { SaveStatus } from '../hooks/useNotes.ts';
import { useState, KeyboardEvent, useRef, useEffect } from 'react';
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
  onUpdateColor?: (color: string) => void;
  currentTags?: string[];
  currentColor?: string;
}

const colorOptions = [
  { value: 'bg-transparent', label: 'Default', bgClass: 'bg-slate-800' },
  { value: 'bg-emerald-950/40', label: 'Emerald', bgClass: 'bg-emerald-950' },
  { value: 'bg-blue-950/40', label: 'Neon Blue', bgClass: 'bg-blue-950' },
  { value: 'bg-rose-950/40', label: 'Ruby Red', bgClass: 'bg-rose-950' },
  { value: 'bg-purple-950/40', label: 'Amethyst', bgClass: 'bg-purple-950' },
  { value: 'bg-amber-950/30', label: 'Amber', bgClass: 'bg-amber-950' },
];

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
  onUpdateColor,
  currentTags = [],
  currentColor = 'bg-transparent',
}: MainPanelProps) {
  const [tagInput, setTagInput] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColorPicker]);

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

  const handleColorClick = (color: string) => {
    if (onUpdateColor) {
      onUpdateColor(color);
    }
    setShowColorPicker(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header with Title and Actions */}
      <header className="border-b border-gray-200 bg-gray-50 px-5 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4 mb-3">
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="text-lg font-semibold bg-white border border-gray-300 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex-1 text-gray-800 placeholder-gray-400"
            placeholder="Note title..."
          />

          <div className="flex items-center gap-3 flex-shrink-0">
            <SaveStatusIndicator status={saveStatus} />

            <div className="h-5 w-px bg-gray-300" />

            <button
              onClick={onSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors active:scale-95"
            >
              <img src="/save-icon.jpg" alt="Save" className="w-4 h-4 inline mr-1" />
              Save
            </button>

            <button
              onClick={onExportToAnki}
              className="px-4 py-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            >
              <img src="/export-icon.jpg" alt="Export" className="w-4 h-4 inline mr-1" />
              Export
            </button>
          </div>
        </div>

        {/* Tags and Color Picker */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex-1 flex items-center gap-2">
              <img src="/tag-icon.jpg" alt="Tag" className="w-3.5 h-3.5 text-gray-500" />
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                {currentTags.map((tag) => (
                  <div
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 border border-blue-300 rounded-md text-xs text-blue-700"
                  >
                    <span>#{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-blue-600 transition-colors"
                    >
                      <img src="/remove-icon.jpg" alt="Remove" className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInputKeyDown}
                  placeholder="Add tag... (Enter)"
                  className="px-2 py-0.5 bg-white border border-gray-300 rounded-md text-xs text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:bg-gray-50 w-28"
                />
              </div>
            </div>

            {/* Color Picker Dropdown */}
            <div className="relative" ref={colorPickerRef}>
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                title="Change note color"
              >
                <img src="/palette-icon.jpg" alt="Color" className="w-3.5 h-3.5" />
                <span>Color</span>
              </button>

            {showColorPicker && (
              <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[200px]">
                <div className="grid grid-cols-3 gap-2 p-2">
                  {colorOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleColorClick(option.value)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-200 hover:bg-gray-50',
                        currentColor === option.value
                          ? 'bg-blue-100 border border-blue-300 ring-1 ring-blue-200'
                          : 'border border-gray-200'
                      )}
                      title={option.label}
                    >
                      <div className={cn(
                        'w-6 h-6 rounded-full border-2 transition-all',
                        currentColor === option.value
                          ? 'border-blue-500 scale-110'
                          : 'border-gray-300 hover:border-gray-400',
                        option.value === 'bg-transparent' ? 'bg-white border-gray-300' : option.value
                      )} />
                      <span className="text-xs text-gray-600">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Editor and Preview */}
      <main className="flex-1 flex overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="px-5 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
            Editor
          </div>
          <div className="flex-1 overflow-auto">
            <NoteEditor content={content} onChange={onContentChange} />
          </div>
        </div>

        <div className="w-1/2 flex flex-col">
          <div className="px-5 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500">
            Preview
          </div>
          <div className="flex-1 overflow-auto">
            <NoteReader content={content} onContentChange={onContentChange} />
          </div>
        </div>
      </main>
    </div>
  );
}
