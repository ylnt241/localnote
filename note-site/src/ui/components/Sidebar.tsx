import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';
import { NoteCard } from './NoteCard';

export function Sidebar() {
    const {
        notes,
        activeNoteId,
        setActiveNoteId,
        searchQuery,
        setSearchQuery,
        sortBy,
        setSortBy,
        createNote,
        togglePin,
        deleteNote,
        bulkMode,
        setBulkMode,
        selectedNotes,
        setSelectedNotes,
        bulkDelete,
        exportToAnki
    } = useNotes();

    const [showSortMenu, setShowSortMenu] = useState(false);
    const [showAddMenu, setShowAddMenu] = useState(false);

    const handleSortChange = (type: 'default' | 'priority' | 'updated') => {
        setSortBy(type);
        setShowSortMenu(false);
    };

    const getSortLabel = () => {
        if (sortBy === 'default') return 'Сортировка: По алфавиту';
        if (sortBy === 'updated') return 'Сортировка: По дате';
        return 'Сортировка по...';
    };

    return (
        <aside className="w-80 border border-gray-200 rounded-xl shadow-sm my-4 ml-4 flex flex-col h-[calc(100vh-2rem)] overflow-hidden relative">

            {/* Слой с фоновой плиткой */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: "url('/20.jpg')",
                    backgroundRepeat: "repeat",
                    backgroundSize: "100px 100px",
                    filter: "blur(2px)"
                }}
            />

            {/* Прозрачный слой для контента */}
            <div className="relative z-10 flex flex-col h-full">

                {/* Поиск */}
                <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-white/80">
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full text-sm outline-none bg-white/50 border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 placeholder-gray-400 focus:border-blue-400"
                    />
                </div>

                {/* Кнопка сортировки */}
                <div className="p-2 border-b border-gray-100 bg-white/80 flex items-center gap-2 relative">
                    <button
                        onClick={() => setShowSortMenu(!showSortMenu)}
                        className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white/50 hover:bg-white/80 text-lg shrink-0"
                        title="Выбрать сортировку"
                    >
                        <img
                            src="/22.jpg"
                            alt="Сортировка"
                            className="w-full h-full object-cover p-0"
                        />
                    </button>

                    <div className="flex-1 h-10 border border-gray-200 rounded-lg bg-white/50 flex items-center px-3 text-xs font-medium text-gray-500">
                        {getSortLabel()}
                    </div>

                    {showSortMenu && (
                        <div className="absolute left-2 top-14 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48 py-1 text-sm">
                            <button
                                onClick={() => handleSortChange('default')}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${sortBy === 'default' ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                            >
                                По алфавиту (А-Я)
                            </button>
                            <button
                                onClick={() => handleSortChange('updated')}
                                className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${sortBy === 'updated' ? 'font-bold text-blue-600' : 'text-gray-700'}`}
                            >
                                По дате обновления
                            </button>
                        </div>
                    )}
                </div>

                {/* Кнопки действий */}
                <div className="p-2 border-b border-gray-100 bg-white/80 grid grid-cols-5 gap-1 relative">

                    {bulkMode ? (
                        <button
                            onClick={() => setBulkMode(false)}
                            className="w-15 h-15 p-0 border border-gray-200 rounded-md bg-white/50 hover:bg-white/80 flex items-center justify-center text-sm mx-auto"
                            title="Отменить выделение"
                        >
                            <img src="/2.jpg" className="w-full h-full object-cover p-0" alt="Отмена" />
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowAddMenu(!showAddMenu)}
                            className="w-15 h-15 p-0 border border-gray-200 rounded-md bg-white/50 hover:bg-white/80 flex items-center justify-center overflow-hidden mx-auto"
                            title="Добавить"
                        >
                            <img src="/11.jpg" className="w-full h-full object-cover p-0" alt="Добавить" />
                        </button>
                    )}

                    <button
                        onClick={() => {
                            if (bulkMode) {
                                if (selectedNotes && selectedNotes.length > 0) {
                                    if (window.confirm(`Удалить выбранные элементы (${selectedNotes.length})?`)) {
                                        bulkDelete();
                                    }
                                } else {
                                    alert('Ничего не выбрано!');
                                }
                            } else {
                                if (activeNoteId) deleteNote(activeNoteId);
                            }
                        }}
                        className={`w-15 h-15 p-0 text-center border border-gray-200 rounded-md text-sm flex items-center justify-center mx-auto transition-colors ${bulkMode && selectedNotes && selectedNotes.length > 0
                            ? 'bg-red-500 border-red-300 text-white hover:bg-red-600'
                            : 'bg-white/50 hover:bg-white/80 text-gray-700'
                            }`}
                        title={bulkMode ? "Удалить выбранные" : "Удалить"}
                    >
                        <img src="/30.jpg" className="w-full h-full object-cover p-0" alt="Удалить" />
                    </button>

                    <button
                        onClick={() => setBulkMode(!bulkMode)}
                        className={`w-15 h-15 p-0 text-center border border-gray-200 rounded-md text-sm flex items-center justify-center mx-auto transition-colors ${bulkMode ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white/50 hover:bg-white/80 text-gray-700'
                            }`}
                        title="Выбрать несколько"
                    >
                        <img src="/23.jpg" className="w-full h-full object-cover p-0" alt="Выбрать" />
                    </button>

                    <button
                        onClick={exportToAnki}
                        className="w-15 h-15 p-0 text-center border border-gray-200 rounded-md bg-white/50 hover:bg-white/80 text-sm flex items-center justify-center mx-auto text-gray-700"
                        title="Экспорт"
                    >
                        <img src="/12.jpg" className="w-full h-full object-cover p-0" alt="Экспорт" />
                    </button>

                    <button
                        onClick={() => {
                            if (!bulkMode && activeNoteId) togglePin(activeNoteId);
                        }}
                        className={`w-15 h-15 p-0 text-center border border-gray-200 rounded-md text-sm flex items-center justify-center mx-auto ${bulkMode ? 'opacity-30 cursor-not-allowed bg-white/30' : 'bg-white/50 hover:bg-white/80 text-gray-700'
                            }`}
                        disabled={bulkMode}
                        title="Закрепить"
                    >
                        <img src="/10.jpg" alt="Закрепить" className="w-14 h-12 object-cover p-0" />
                    </button>

                    {!bulkMode && showAddMenu && (
                        <div className="absolute left-2 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-40 py-1 text-sm">
                            <button
                                onClick={() => { createNote('note'); setShowAddMenu(false); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700"
                            >
                                Заметка
                            </button>
                            <button
                                onClick={() => { createNote('todo'); setShowAddMenu(false); }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700"
                            >
                                Список задач
                            </button>
                        </div>
                    )}
                </div>

                {/* Список заметок */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-white/30">
                    {notes.map((note) => {
                        const isSelected = selectedNotes ? selectedNotes.includes(note.id) : false;

                        return (
                            <NoteCard
                                key={note.id}
                                note={note}
                                isActive={activeNoteId === note.id}
                                onSelect={() => setActiveNoteId(note.id)}
                                onTogglePin={() => togglePin(note.id)}
                                isBulkMode={bulkMode}
                                isSelected={isSelected}
                                onToggleSelect={() => {
                                    if (isSelected) {
                                        setSelectedNotes(selectedNotes.filter((id: string) => id !== note.id));
                                    } else {
                                        setSelectedNotes([...(selectedNotes || []), note.id]);
                                    }
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </aside>
    );
}