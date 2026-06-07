import type { FC } from 'react';
import { useState, useCallback, useMemo } from 'react';
import { buildAggregatedMarkdown, syncAggregatedChanges, parseTasksFromNote } from '@/core/utils/tasks';
import { ChevronDown, ChevronRight, ListTodo, ArrowLeft } from 'lucide-react';
import type { Note } from '@/core/entities/Note';

interface TasksPageProps {
  notes: Note[];
  updateNote: (id: string, updates: Partial<{ content: string }>) => Promise<void>;
  onClose: () => void;
}

export const TasksPage: FC<TasksPageProps> = ({ notes, updateNote, onClose }) => {
  const countTotalTasks = useCallback((notes: Note[]): { total: number; done: number } => {
    let total = 0;
    let done = 0;
    for (const note of notes) {
      const tasks = parseTasksFromNote(note);
      total += tasks.length;
      done += tasks.filter((t) => t.checked).length;
    }
    return { total, done };
  }, []);
  const [mode, setMode] = useState<'editor' | 'preview'>('preview');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [editorContent, setEditorContent] = useState('');

  const notesWithTasks = useMemo(() => notes.filter((n) => parseTasksFromNote(n).length > 0), [notes]);
  const aggregatedMd = useMemo(() => buildAggregatedMarkdown(notesWithTasks), [notesWithTasks]);
  const { total, done } = useMemo(() => countTotalTasks(notes), [notes]);

  const toggleSection = useCallback((title: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  }, []);

  const handleSwitchToEditor = useCallback(() => {
    setEditorContent(aggregatedMd);
    setMode('editor');
  }, [aggregatedMd]);

  const handleSaveAggregated = useCallback(async () => {
    const changes = syncAggregatedChanges(notesWithTasks, editorContent);
    for (const [noteId, content] of changes.entries()) {
      await updateNote(noteId, { content });
    }
    setMode('preview');
  }, [notesWithTasks, editorContent, updateNote]);

  const handleCancelEdit = useCallback(() => {
    setMode('preview');
  }, []);

  const handlePreviewToggle = useCallback((lineIndex: number) => {
    const sectionMap: { title: string; offset: number }[] = [];
    const lines = aggregatedMd.split('\n');
    let currentTitle = '';
    let relativeLine = 0;

    for (let i = 0; i < lines.length; i++) {
      const headerMatch = lines[i].match(/^##\s+(.+)$/);
      if (headerMatch) {
        currentTitle = headerMatch[1].trim();
        relativeLine = 0;
      }
      sectionMap.push({ title: currentTitle, offset: relativeLine });
      relativeLine++;
    }

    const info = sectionMap[lineIndex];
    if (!info || !info.title) return;

    const note = notesWithTasks.find((n) => n.title === info.title);
    if (!note) return;

    const tasks = parseTasksFromNote(note);
    const task = tasks[info.offset - 1];
    if (!task) return;

    const noteLines = note.content.split('\n');
    const taskLine = noteLines[task.lineIndex];
    const match = taskLine.match(/^(\s*[-*]\s+)\[(.)\]/);
    if (!match) return;

    const newCheck = match[2] === 'x' ? ' ' : 'x';
    noteLines[task.lineIndex] = `${match[1]}[${newCheck}]${taskLine.slice(match[0].length)}`;
    updateNote(note.id, { content: noteLines.join('\n') });
  }, [aggregatedMd, notesWithTasks, updateNote]);

  if (notesWithTasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-full min-h-0">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <div className="text-sm text-gray-400">Задачи</div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ListTodo className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Задачи не найдены</p>
            <p className="text-gray-500 text-xs mt-1">
              Создайте чекбоксы как <code className="text-blue-500">- [ ] задача</code> в ваших заметках
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-full min-h-0">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Назад
          </button>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Задачи</h2>
            <p className="text-xs text-gray-500">
              {done}/{total} выполнено
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {mode === 'preview' ? (
            <button
              onClick={handleSwitchToEditor}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
            >
              Редактировать все
            </button>
          ) : (
            <>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-sm transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveAggregated}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg text-sm transition-colors"
              >
                Сохранить
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-gray-200 bg-white text-xs font-medium text-gray-500 flex-shrink-0">
          {mode === 'editor' ? 'Редактор' : 'Просмотр'}
        </div>

        <div className="flex-1 overflow-auto">
          {mode === 'editor' ? (
            <textarea
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              className="w-full h-full min-h-[300px] p-4 text-sm resize-none border-0 focus:outline-none text-gray-700 bg-white"
              placeholder="Начните писать здесь..."
            />
          ) : (
            <TasksPreview
              aggregatedMd={aggregatedMd}
              collapsedSections={collapsedSections}
              onToggleSection={toggleSection}
              onToggleCheckbox={handlePreviewToggle}
            />
          )}
        </div>
      </div>
    </div>
  );
}

interface TasksPreviewProps {
  aggregatedMd: string;
  collapsedSections: Set<string>;
  onToggleSection: (title: string) => void;
  onToggleCheckbox: (lineIndex: number) => void;
}

const TasksPreview: FC<TasksPreviewProps> = ({ aggregatedMd, collapsedSections, onToggleSection, onToggleCheckbox }) => {
  const sections = useMemo(() => {
    const result: { title: string; lines: string[]; startLine: number }[] = [];
    const lines = aggregatedMd.split('\n');
    let current: { title: string; lines: string[]; startLine: number } | null = null;

    for (let i = 0; i < lines.length; i++) {
      const headerMatch = lines[i].match(/^##\s+(.+)$/);
      if (headerMatch) {
        if (current) result.push(current);
        current = { title: headerMatch[1].trim(), lines: [], startLine: i };
      } else if (current) {
        current.lines.push(lines[i]);
      }
    }
    if (current) result.push(current);

    return result;
  }, [aggregatedMd]);

  return (
    <div className="p-4 space-y-2">
      {sections.map((section) => {
        const isCollapsed = collapsedSections.has(section.title);
        return (
          <div key={section.title} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => onToggleSection(section.title)}
              className="w-full flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-sm font-semibold text-gray-800">{section.title}</span>
              <span className="text-xs text-gray-500 ml-auto">
                {section.lines.filter((l) => /^\s*[-*]\s+\[x\]/.test(l)).length}/{section.lines.filter((l) => /^\s*[-*]\s+\[.\]/.test(l)).length}
              </span>
            </button>

            {!isCollapsed && (
              <div className="px-4 py-2 bg-white">
                {section.lines.map((line, i) => {
                  const taskMatch = line.match(/^\s*[-*]\s+\[(.)\]\s+(.*)$/);
                  if (!taskMatch) return null;
                  const checked = taskMatch[1] === 'x';
                  const text = taskMatch[2];
                  const lineIndex = section.startLine + i + 1;

                  return (
                    <label
                      key={i}
                      className="flex items-start gap-3 py-1.5 group cursor-pointer hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => onToggleCheckbox(lineIndex)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 bg-white checked:bg-blue-500 cursor-pointer flex-shrink-0 focus:ring-2 focus:ring-blue-500"
                      />
                      <span
                        className={`flex-1 text-sm ${
                          checked ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}
                      >
                        {text}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}