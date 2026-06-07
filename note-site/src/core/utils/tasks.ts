import type { Note } from '../entities/Note';

export interface TaskItem {
  noteId: string;
  noteTitle: string;
  checked: boolean;
  text: string;
  lineIndex: number;
}

export function parseTasksFromNote(note: Note): TaskItem[] {
  const lines = note.content.split('\n');
  const tasks: TaskItem[] = [];
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^\s*[-*]\s+\[(.)\]\s+(.*)$/);
    if (match) {
      tasks.push({
        noteId: note.id,
        noteTitle: note.title,
        checked: match[1] === 'x',
        text: match[2].trim(),
        lineIndex: i,
      });
    }
  }
  return tasks;
}

export function parseAllTasks(notes: Note[]): TaskItem[] {
  const result: TaskItem[] = [];
  for (const note of notes) {
    const tasks = parseTasksFromNote(note);
    result.push(...tasks);
  }
  return result;
}

export function buildAggregatedMarkdown(notes: Note[]): string {
  const parts: string[] = [];
  for (const note of notes) {
    const tasks = parseTasksFromNote(note);
    if (tasks.length === 0) continue;
    parts.push(`## ${note.title}`);
    for (const task of tasks) {
      const checkbox = task.checked ? '[x]' : '[ ]';
      parts.push(`- ${checkbox} ${task.text}`);
    }
    parts.push('');
  }
  return parts.join('\n');
}

export function toggleTaskInNote(content: string, lineIndex: number): string {
  const lines = content.split('\n');
  const line = lines[lineIndex];
  if (!line) return content;
  const match = line.match(/^(\s*[-*]\s+)\[(.)\]/);
  if (!match) return content;
  const newCheck = match[2] === 'x' ? ' ' : 'x';
  lines[lineIndex] = `${match[1]}[${newCheck}]${line.slice(match[0].length)}`;
  return lines.join('\n');
}

export interface AggregatedSection {
  noteTitle: string;
  lines: string[];
}

function parseAggregatedSections(aggregatedContent: string): AggregatedSection[] {
  const sections: AggregatedSection[] = [];
  let currentSection: AggregatedSection | null = null;

  for (const line of aggregatedContent.split('\n')) {
    const headerMatch = line.match(/^##\s+(.+)$/);
    if (headerMatch) {
      currentSection = { noteTitle: headerMatch[1].trim(), lines: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      if (line.trim()) {
        currentSection.lines.push(line);
      }
    }
  }

  return sections;
}

export function syncAggregatedChanges(
  notes: Note[],
  aggregatedContent: string,
): Map<string, string> {
  const sections = parseAggregatedSections(aggregatedContent);
  const noteByTitle = new Map<string, Note>();
  for (const note of notes) {
    noteByTitle.set(note.title, note);
  }

  const result = new Map<string, string>();

  for (const section of sections) {
    const note = noteByTitle.get(section.noteTitle);
    if (!note) continue;

    const originalTasks = parseTasksFromNote(note);
    const originalTaskTexts = new Set(originalTasks.map((t) => t.text));

    const updatedContentLines = note.content.split('\n');
    const linesToAppend: string[] = [];

    for (const line of section.lines) {
      const taskMatch = line.match(/^\s*[-*]\s+\[(.)\]\s+(.*)$/);
      if (!taskMatch) continue;

      const taskText = taskMatch[2].trim();
      const isChecked = taskMatch[1] === 'x';

      if (originalTaskTexts.has(taskText)) {
        const original = originalTasks.find((t) => t.text === taskText);
        if (original) {
          const currentLine = updatedContentLines[original.lineIndex];
          const prefixMatch = currentLine.match(/^(\s*[-*]\s+)\[.\]/);
          if (prefixMatch) {
            updatedContentLines[original.lineIndex] = `${prefixMatch[1]}[${isChecked ? 'x' : ' '}] ${taskText}`;
          }
        }
      } else {
        linesToAppend.push(`- [${isChecked ? 'x' : ' '}] ${taskText}`);
      }
    }

    if (linesToAppend.length > 0) {
      updatedContentLines.push('', ...linesToAppend);
    }

    result.set(note.id, updatedContentLines.join('\n'));
  }

  return result;
}