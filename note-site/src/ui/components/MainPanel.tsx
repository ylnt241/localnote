import { useState} from 'react';
import { useNotes } from '../hooks/useNotes';
import { ScrollArea } from '../shared/ScrollArea';

export function MainPanel({ showColorPicker, setShowColorPicker }) {
    const { activeNote, updateNote, saveStatus} = useNotes();
    const [tagInput, setTagInput] = useState('');
    const colors = ['#ffffff', '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#ddd6fe'];

    if (!activeNote) {
        return (
            <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex items-center justify-center text-gray-400 mt-4 mr-4">
                Выберите элемент или создайте новый
            </div>
        );
    }

    // Превращаем системную дату в красивую строчку (Дата и Время)
    // Если у заметки почему-то нет даты обновления, мы берем стабильный 0 вместо impure Date.now()
    const formattedDate = new Date(activeNote.updatedAt || 0).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Обработчики тегов
    const handleAddTag = () => {
        const newTag = tagInput.trim().toLowerCase();
        if (newTag && !activeNote.tags.includes(newTag)) {
            updateNote(activeNote.id, { tags: [...activeNote.tags, newTag] });
        }
        setTagInput('');
    };

    const handleRemoveTag = (tagToRemove) => {
        updateNote(activeNote.id, { tags: activeNote.tags.filter(t => t !== tagToRemove) });
    };

    // РАЗДЕЛЕНИЕ: Логика для Задач
    const lines = activeNote.content.split('\n');

    const handleToggleTask = (index) => {
        const updatedLines = [...lines];
        const line = updatedLines[index];
        if (line.includes('- [ ]')) updatedLines[index] = line.replace('- [ ]', '- [x]');
        else if (line.includes('- [x]')) updatedLines[index] = line.replace('- [x]', '- [ ]');
        updateNote(activeNote.id, { content: updatedLines.join('\n') });
    };

    return (
        // Панель смещена вниз на mt-4 и имеет скруглённые углы rounded-xl
        <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[calc(100vh-6rem)] overflow-hidden mr-4 relative" key={activeNote.id}>

            {/* ВЕРХНЯЯ СТРОКА: Название слева, Дата справа */}
            <div className="p-4 flex justify-between items-start border-b border-gray-50">
                <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    className="text-xl font-bold text-gray-800 outline-none flex-1"
                    placeholder="Без названия"
                />
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md shrink-0 ml-4">
                    📅 {formattedDate}
                </span>
            </div>

            {/* СТРОКА НИЖЕ: Теги заметки */}
            <div className="px-4 py-2 flex flex-wrap gap-1.5 items-center bg-gray-50/50 border-b border-gray-50">
                {activeNote.tags.map((tag) => (
                    <span key={tag} className="bg-gray-200/80 text-gray-700 px-2 py-0.5 rounded text-xs flex items-center gap-1 font-medium">
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)} className="text-red-500 font-bold hover:text-red-700">×</button>
                    </span>
                ))}
                <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder="+ тег..."
                    className="w-16 text-xs bg-transparent outline-none border-b border-transparent focus:border-gray-400"
                />
            </div>

            {/* Палитра цветов (показывается по команде из тулбара) */}
            {showColorPicker && (
                <div className="absolute left-4 top-14 bg-white border border-gray-200 rounded-lg shadow-lg z-30 p-2 flex gap-1.5">
                    {colors.map((color) => (
                        <button
                            key={color}
                            className="w-6 h-6 rounded-full border border-gray-300"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                                updateNote(activeNote.id, { color: color });
                                setShowColorPicker(false);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* ЦЕНТРАЛЬНЫЙ КОНТЕНТ ВВОДА */}
            <ScrollArea className="flex-1 p-4">
                {activeNote.type === 'todo' ? (
                    /* ИНТЕРФЕЙС ЗАДАЧ: Расстояние между строками больше (space-y-4) */
                    <div className="space-y-4 max-w-xl">
                        {lines.map((line, idx) => {
                            const isChecked = line.includes('- [x]');
                            const isUnchecked = line.includes('- [ ]');
                            if (!isChecked && !isUnchecked && line.trim() === '') return null;

                            const cleanText = line.replace('- [ ]', '').replace('- [x]', '').trim();

                            return (
                                <div key={idx} className="flex items-center gap-3">
                                    {/* Место под меняющуюся картинку чекбокса */}
                                    <button
                                        onClick={() => handleToggleTask(idx)}
                                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-sm shrink-0"
                                    >
                                        {isChecked ? '✅' : '⬜'}
                                    </button>
                                    <span className={`text-sm ${isChecked ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                                        {cleanText || <span className="text-gray-300 italic">Новое задание</span>}
                                    </span>
                                </div>
                            );
                        })}

                        {/* Быстрое добавление новой строки в список задач */}
                        <input
                            type="text"
                            placeholder="+ Новая задача (Нажмите Enter)..."
                            className="w-full text-sm p-1.5 border border-dashed rounded-md outline-none"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    const val = e.currentTarget.value.trim();
                                    const nextContent = activeNote.content ? `${activeNote.content}\n- [ ] ${val}` : `- [ ] ${val}`;
                                    updateNote(activeNote.id, { content: nextContent });
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                ) : (
                    /* ИНТЕРФЕЙС ОБЫЧНОЙ ЗАМЕТКИ */
                    <textarea
                        value={activeNote.content}
                        onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                        placeholder="Начните писать здесь..."
                        className="w-full h-full min-h-[400px] outline-none text-sm text-gray-700 leading-relaxed resize-none"
                    />
                )}
            </ScrollArea>

            {/* ВНИЗУ СЛЕВА: Прямоугольное место под сменяющиеся картинки статуса сохранения */}
            <div className="absolute left-4 bottom-4 w-28 h-8 border border-gray-200 rounded-md flex items-center justify-center bg-gray-50 text-xs font-medium text-gray-500 shadow-sm">
                {saveStatus === 'saving' || saveStatus === 'typing' ? (
                    <span className="flex items-center gap-1">⏳ Сохраняю...</span> // Картинка / Статус 1
                ) : (
                    <span className="flex items-center gap-1 text-green-600">✨ Сохранено</span> // Картинка / Статус 2
                )
                    // Кнопка сохранения в панели инструментов будет принудительно вызывать setSaveStatus('saving'),
                    // имитируя ручной и автоматический процесс записи!
                }
            </div>
        </div>
    );
}