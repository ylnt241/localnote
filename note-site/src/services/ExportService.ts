import type { Note } from '../core/entities/Note';
import type { TaskItem } from '../core/utils/tasks';
import { parseTasksFromNote, buildAggregatedMarkdown } from '../core/utils/tasks';

export class ExportService {
    exportToAnki(notes: Note[]): string {
        const tasksByNote = new Map<string, TaskItem[]>();

        for (const note of notes) {
            const tasks = parseTasksFromNote(note);
            if (tasks.length > 0) {
                tasksByNote.set(note.title, tasks);
            }
        }
        
        // Build aggregated markdown using notes that have tasks
        const notesWithTasks = notes.filter(note => parseTasksFromNote(note).length > 0);
        return buildAggregatedMarkdown(notesWithTasks);
    }
}