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
        <aside className="w-80 bg-white border border-gray-200 rounded-xl shadow-sm my-4 ml-4 flex flex-col h-[calc(100vh-2rem)] overflow-hidden">

            <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50">
                <span className="text-gray-400"></span> {/* перед span вписать изображение лупы */}
                <input
                    type="text"
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-sm outline-none bg-white border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 placeholder-gray-400 focus:border-blue-400"
                />
            </div>
            <div className="p-2 border-b border-gray-100 bg-gray-50 relative">

                {/* сортировка (список) */}
                {showSortMenu && (
                    <div className="absolute left-2 top-14 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-48 py-1 text-sm">
                        <button onClick={() => handleSortChange('default')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700">
                            По алфавиту (А-Я)
                        </button>
                        <button onClick={() => handleSortChange('updated')} className="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-700">
                            По дате обновления
                        </button>
                    </div>
                )}
            </div>
            <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2 relative">
                {/* сортировка */}
                <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="w-10 h-10 border border-gray-200 rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 text-lg shrink-0"
                    title="Выбрать сортировку"
                >
                    <img
                        src="/22.jpg"
                        alt="Добавить"
                        className="w-full h-full object-cover p-0"
                    />
                </button>

                {/* вид сортировки отображает */}
                <div className="flex-1 h-10 border border-gray-200 rounded-lg bg-white flex items-center px-3 text-xs font-medium text-gray-500">
                    {getSortLabel()}
                </div>

                {/* Выпадающий список сортировки (остаётся на своём месте) */}
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

            <div className="p-2 border-b border-gray-100 bg-gray-50 grid grid-cols-5 gap-1 relative">

                {bulkMode ? (
                    /* Кнопка Отмены (появляется вместо Добавить) */
                    <button
                        onClick={() => setBulkMode(false)}
                        className="w-15 h-15 p-0 border border-gray-200 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-sm mx-auto"
                        title="Отменить выделение"
                    >
                        <img
                            src="/2.jpg"
                            className="w-full h-full object-cover p-0"
                        />
                    </button>
                ) : (
                    /* добавить заметку или список задач (кнопка) */
                    <button
                        onClick={() => setShowAddMenu(!showAddMenu)}
                        className="w-15 h-15 p-0 border border-gray-200 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center overflow-hidden mx-auto"
                        title="Добавить"
                    >
                        <img
                            src="/11.jpg"
                            className="w-full h-full object-cover p-0"
                        />
                    </button>
                )}

                {/* удалить */}
                <button
                    onClick={() => {
                        if (bulkMode) {
                            if (selectedNotes && selectedNotes.length > 0) {
                                if (window.confirm(`Удалить выбранные элементы (${selectedNotes.length})?`)) {
                                    bulkDelete(); // Твоя функция массового удаления из хука
                                }
                            } else {
                                alert('Ничего не выбрано!');
                            }
                        } else {
                            if (activeNoteId) deleteNote(activeNoteId);
                        }
                    }}
                    className={`w-15 h-15 p-0 text-center border border-gray-200 rounded-md text-sm flex items-center justify-center mx-auto w-15 h-15 transition-colors ${bulkMode && selectedNotes && selectedNotes.length > 0
                        ? 'bg-red-500 border-red-300 text-white hover:bg-red-600' // Подсвечиваем красным, если есть что удалять в bulk-режиме
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    title={bulkMode ? "Удалить выбранные" : "Удалить"}
                >
                    <img
                        src="/30.jpg"
                        className="w-full h-full object-cover p-0"
                    />
                </button>

                {/* выделить несколько */}
                <button
                    onClick={() => setBulkMode(!bulkMode)}
                    className={`w-15 h-15 p-0 text-center border border-gray-200 rounded-md text-sm flex items-center justify-center mx-auto transition-colors ${bulkMode ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    title="Выбрать несколько"
                >
                    <img
                        src="/23.jpg"
                        className="w-full h-full object-cover p-0"
                    />
                </button>

                {/* экспорт */}
                <button
                    onClick={exportToAnki}
                    className="w-15 h-15 p-0 text-center border border-gray-200 rounded-md bg-gray-100 hover:bg-gray-200 text-sm flex items-center justify-center mx-auto w-15 h-15 text-gray-700"
                    title="Экспорт"
                >
                    <img
                        src="/12.jpg"
                        className="w-full h-full object-cover p-0"
                    />
                </button>

                {/* закрепить */}
                <button
                    onClick={() => {
                        if (!bulkMode && activeNoteId) togglePin(activeNoteId);
                    }}
                    className={`w-15 h-15 p-0 text-center border border-gray-200 rounded-md text-sm flex items-center justify-center mx-auto w-15 h-15 ${bulkMode ? 'opacity-30 cursor-not-allowed bg-gray-100' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                    disabled={bulkMode}
                    title="Закрепить"
                >
                    <img
                        src="/10.jpg"
                        alt="Добавить"
                        className="w-14 h-12 object-cover p-0"
                    />
                </button>

                {/* добавить заметку или список задач (список выбора) */}
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

            <div className="flex-1 overflow-y-auto p-2 space-y-1.5 bg-white">
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
        </aside>
    );
}