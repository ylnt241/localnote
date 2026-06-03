import type { Note } from '../entities/Note';
export interface TaskItem {
    noteId: string;
    noteTitle: string;
    taskText: string;
    checked: boolean;
    rawLine: string;
}
export function parseTasksFromNote(note: Note): TaskItem[] {
    const lines = note.content.split('\n');
    const tasks: TaskItem[] = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const match = line.match(/^(-|\*)\s+\[([ x])\]\s+(.*)$/);

        if (match) {
            tasks.push({
                noteId: note.id,
                noteTitle: note.title,
                taskText: match[3],
                checked: match[2] === 'x',
                rawLine: line,
            });
        }
    }
    return tasks;
}
export function toggleTaskInNote(content: string, taskText: string): string {
    const lines = content.split('\n');
    const newLines = lines.map((line) => {
        const match = line.match(/^(-|\*)\s+\[([ x])\]\s+(.*)$/);

        if (match && match[3] === taskText) {
            const newCheck = match[2] === 'x' ? ' ' : 'x';
            return `${match[1]} [${newCheck}] ${match[3]}`;
        }
        return line;
    });
    return newLines.join('\n');
}
export function buildAggregatedMarkdown(tasksByNote: Map<string, TaskItem[]>): string {
    let result = '';

    for (const [noteTitle, tasks] of Array.from(tasksByNote.entries())) {
        result += `## ${noteTitle}\n`;
        for (const task of tasks) {
            result += `- [${task.checked ? 'x' : ' '}] ${task.taskText}\n`;
        }
        result += '\n';
    }
    return result;
}

export function syncAggregatedChanges(
    notes: Note[],
    aggregatedMarkdown: string,
): Note[] {
    const updatedNotes = [...notes];
    const lines = aggregatedMarkdown.split('\n');
    const noteMap = new Map<string, string[]>();

    let currentTitle = '';
    for (const line of lines) {
        if (line.startsWith('## ')) {
            currentTitle = line.slice(3);
            noteMap.set(currentTitle, []);
        } else if (line.startsWith('- [') && currentTitle) {
            noteMap.get(currentTitle)?.push(line);
        }
    }

    for (const note of updatedNotes) {
        const tasks = noteMap.get(note.title);
        if (tasks) {
            const newContent = tasks.join('\n');
            if (note.content !== newContent) {
                note.content = newContent;
                note.updatedAt = 0;
            }
        }
    }
    return updatedNotes;
}