import { useState, useCallback, useMemo } from 'react';
import type { Note } from '../../core/entities/Note';
import { useAppContext } from '../context/AppContext';

export type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved';

export function useNotes() {
    const [bulkMode, setBulkMode] = useState(false);
    const { noteRepository, exportService } = useAppContext();
    const [notes, setNotes] = useState<Note[]>(() => noteRepository.getAll());
    const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
        const all = noteRepository.getAll();
        return all.length > 0 ? all[0].id : null;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'default' | 'priority' | 'updated'>('default');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'typing' | 'saving' | 'saved'>('idle');

    const activeNote = useMemo(() =>
        notes.find((n) => n.id === activeNoteId) || null,
        [notes, activeNoteId]
    );

    const filteredNotes = useMemo(() => {
        let result = [...notes];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(
                (n) =>
                    n.title.toLowerCase().includes(q) ||
                    n.content.toLowerCase().includes(q) ||
                    n.tags.some((t) => t.toLowerCase().includes(q)),
            );
        }
        if (selectedTags.length) {
            result = result.filter((n) => selectedTags.every((tag) => n.tags.includes(tag)));
        }
        const pinned = result.filter((n) => n.isPinned);
        const unpinned = result.filter((n) => !n.isPinned);
        const sortFn = (a: Note, b: Note) => {
            if (sortBy === 'priority') return (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
            if (sortBy === 'updated') return b.updatedAt - a.updatedAt;
            return a.order - b.order;
        };
        pinned.sort(sortFn);
        unpinned.sort(sortFn);
        const sorted = [...pinned, ...unpinned];
        return sortOrder === 'desc' ? sorted.reverse() : sorted;
    }, [notes, searchQuery, selectedTags, sortBy, sortOrder]);

    const createNote = useCallback((type: 'note' | 'todo' = 'note') => {

        let defaultTitle = 'Новая заметка';
        let defaultContent = '';

        if (type === 'todo') {
            defaultTitle = 'Новый список задач';
            defaultContent = '- [ ] ';
        }

        const newNote = noteRepository.create({
            title: defaultTitle,
            content: defaultContent,
            isPinned: false,
            tags: [],
            color: '#ffffff',
            order: Date.now(),
            type: type,
        });

        setNotes((prev) => [newNote, ...prev]);
        setActiveNoteId(newNote.id);
    }, [noteRepository]);

    const updateNote = useCallback((id: string, updates: Partial<Note>) => {
        setSaveStatus('saving');
        const updated = noteRepository.update(id, updates);
        if (updated) {
            setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
            setSaveStatus('saved');
        }
    }, [noteRepository]); // <-- ДОБАВЛЕНА ЗАВИСИМОСТЬ

    const deleteNote = useCallback(
        (id: string) => {
            noteRepository.delete(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
            if (activeNoteId === id) {
                const remaining = notes.filter((n) => n.id !== id);
                setActiveNoteId(remaining[0]?.id || null);
            }
        },
        [noteRepository, activeNoteId, notes],
    );

    const togglePin = useCallback(
        (id: string) => {
            const note = notes.find((n) => n.id === id);
            if (note) updateNote(id, { isPinned: !note.isPinned });
        },
        [notes, updateNote],
    );

    const exportToAnki = useCallback(() => {
        const selected = notes.filter((n) => selectedNotes.includes(n.id));
        const markdown = exportService.exportToAnki(selected.length ? selected : notes);
        navigator.clipboard.writeText(markdown);
        alert('Скопировано в буфер обмена');
    }, [notes, selectedNotes, exportService]);

    const bulkDelete = useCallback(() => {
        for (const id of selectedNotes) {
            noteRepository.delete(id);
        }
        setNotes((prev) => prev.filter((n) => !selectedNotes.includes(n.id)));
        setSelectedNotes([]);
        if (activeNoteId && selectedNotes.includes(activeNoteId)) {
            const remaining = notes.filter((n) => !selectedNotes.includes(n.id));
            setActiveNoteId(remaining[0]?.id || null);
        }
    }, [selectedNotes, noteRepository, activeNoteId, notes]);

    return {
        notes: filteredNotes,
        activeNote,
        activeNoteId,
        setActiveNoteId,
        searchQuery,
        setSearchQuery,
        selectedTags,
        setSelectedTags,
        sortBy,
        setSortBy,
        sortOrder,
        setSortOrder,
        selectedNotes,
        setSelectedNotes,
        saveStatus,
        setSaveStatus,
        createNote,
        updateNote,
        deleteNote,
        togglePin,
        exportToAnki,
        bulkDelete,
        bulkMode,
        setBulkMode,
    };
}