export interface Note {
    id: string;
    title: string;
    content: string;
    isPinned: boolean;
    tags: string[];
    color: string;
    order: number;
    updatedAt: number;
    type?: 'note' | 'todo';
}
export type NoteInput = Omit<Note, 'id' | 'updatedAt'>;

export function createNote(input: NoteInput): Note {
    return {
        type: 'note',
        ...input,
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
        updatedAt: Date.now(),
    };
}
export function updateNote(note: Note, updates: Partial<Note>): Note {
    return {
        ...note,
        ...updates,
        updatedAt: Date.now(),
    };
}