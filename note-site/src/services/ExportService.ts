import type { Note } from '../core/entities/Note';
import type { TaskItem } from '../core/utils/taskUtils';
import { parseTasksFromNote, buildAggregatedMarkdown } from '../core/utils/taskUtils';

export class ExportService {
    exportToAnki(notes: Note[]): string {
        const tasksByNote = new Map<string, TaskItem[]>();

        for (const note of notes) {
            tasksByNote.set(note.title, parseTasksFromNote(note));
        }
        return buildAggregatedMarkdown(tasksByNote);
    }
}