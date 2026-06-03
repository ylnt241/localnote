import type { Note, NoteInput } from '../../core/entities/Note';
import { createNote, updateNote } from '../../core/entities/Note';

const STORAGE_KEY = 'localnote_notes';

export class LocalStorageNoteRepository {
    getAll(): Note[] {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data) as Note[];
        } catch {
            return [];
        }
    }

    getById(id: string): Note | undefined {
        return this.getAll().find((note) => note.id === id);
    }

    create(input: NoteInput): Note {
        const notes = this.getAll();
        const newNote = createNote(input);
        notes.push(newNote);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return newNote;
    }

    update(id: string, updates: Partial<Note>): Note | undefined {
        const notes = this.getAll();
        const index = notes.findIndex((note) => note.id === id);
        if (index === -1) return undefined;
        notes[index] = updateNote(notes[index], updates);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return notes[index];
    }

    bulkUpdate(updates: { id: string; updates: Partial<Note> }[]): Note[] {
        const notes = this.getAll();
        for (const { id, updates: upd } of updates) {
            const index = notes.findIndex((note) => note.id === id);
            if (index !== -1) {
                notes[index] = updateNote(notes[index], upd);
            }
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
        return notes;
    }

    delete(id: string): boolean {
        const notes = this.getAll();
        const filtered = notes.filter((note) => note.id !== id);
        if (filtered.length === notes.length) return false;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }
}