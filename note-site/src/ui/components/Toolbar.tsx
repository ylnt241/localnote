import { useState } from 'react';
import { useNotes } from '../hooks/useNotes';

interface ToolbarProps {
    isTranslateActive: boolean;
    setIsTranslateActive: (active: boolean) => void;
}

export function Toolbar({ isTranslateActive, setIsTranslateActive }: ToolbarProps) {
    const { activeNote, updateNote, setSaveStatus } = useNotes();
    const [showColorMenu, setShowColorMenu] = useState(false);
    const [showIconMenu, setShowIconMenu] = useState(false);
    const [isFixing, setIsFixing] = useState(false);

    if (!activeNote) {
        return (
            <div className="h-36 bg-white/80 border border-gray-200 rounded-xl px-4 flex items-center justify-center text-xs text-gray-400 font-medium relative">
                <div className="absolute inset-0 rounded-xl" style={{ backgroundImage: "url('/toolbar-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(2px)" }} />
                <div className="relative z-10">Выберите заметку, чтобы воспользоваться инструментами панели</div>
            </div>
        );
    }

    const colors = ['#ffffff', '#fecaca', '#fed7aa', '#fef08a', '#bbf7d0', '#bfdbfe', '#ddd6fe'];
    const availableIcons = ['📝', '☑️', '⭐', '🚀', '💡', '🔥', '🎨', '💻', '🔮'];

    const handleManualSave = () => {
        setSaveStatus('saving');
        updateNote(activeNote.id, { content: activeNote.content });
        setTimeout(() => {
            setSaveStatus('saved');
        }, 500);
    };

    const handleFormatMarkdown = () => {
        let currentContent = activeNote.content || '';

        if (!currentContent.startsWith('# ')) {
            currentContent = '# ' + currentContent;
        }

        currentContent = currentContent
            .replace(/^###### (.*?)$/gm, '###### $1')
            .replace(/^##### (.*?)$/gm, '##### $1')
            .replace(/^#### (.*?)$/gm, '#### $1')
            .replace(/^### (.*?)$/gm, '### $1')
            .replace(/^## (.*?)$/gm, '## $1')
            .replace(/^# (.*?)$/gm, '# $1');

        if (!/\*\*.*?\*\*/.test(currentContent)) {
            currentContent = currentContent.replace(/(\b\w+\b)/g, '**$1**');
        }

        updateNote(activeNote.id, { content: currentContent });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1000);
    };

    const handleAiFixErrors = async () => {
        if (!activeNote.content || isFixing) return;

        setIsFixing(true);
        setSaveStatus('typing');

        try {
            const text = activeNote.content;

            const response = await fetch('https://speller.yandex.net/services/spellservice.json/checkText', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `text=${encodeURIComponent(text)}&lang=ru&options=4`,
            });

            if (!response.ok) throw new Error('Speller API error');

            const corrections = await response.json();
            let fixedText = text;

            for (let i = corrections.length - 1; i >= 0; i--) {
                const correction = corrections[i];
                if (correction.s && correction.s.length > 0) {
                    const wrongWord = correction.word;
                    const correctWord = correction.s[0];
                    const regex = new RegExp(`\\b${wrongWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                    fixedText = fixedText.replace(regex, correctWord);
                }
            }

            updateNote(activeNote.id, { content: fixedText });
            setSaveStatus('saved');

        } catch (error) {
            console.error('AI fix error:', error);

            let fixedText = activeNote.content;
            const corrections: [RegExp, string][] = [
                [/здраствуйте/gi, 'здравствуйте'],
                [/вобще/gi, 'вообще'],
                [/каторый/gi, 'который'],
                [/типо/gi, 'типа'],
                [/сдесь/gi, 'здесь'],
            ];
            for (const [pattern, replacement] of corrections) {
                fixedText = fixedText.replace(pattern, replacement);
            }
            updateNote(activeNote.id, { content: fixedText });
            setSaveStatus('saved');
        }

        setTimeout(() => {
            setSaveStatus('idle');
            setIsFixing(false);
        }, 1500);
    };

    return (
        <div className="h-36 border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col justify-between w-full relative shrink-0">
            <img
                src="/1.jpg"
                alt=""
                className="absolute top-4 right-4 w-24 h-24 object-cover mix-blend-multiply z-20 pointer-events-none"
            />

            {/* Фоновый слой с изображением */}
            <div
                className="absolute inset-0 rounded-xl"
                style={{
                    backgroundImage: "url('/21.jpg')",
                    backgroundSize: "500px",
                    backgroundPosition: "center",
                    backgroundRepeat: "repeat",
                    filter: "blur(2px)"
                }}
            />

            {/* Контент поверх фона */}
            <div className="relative z-10 flex flex-col justify-between h-full">
                <div className="grid grid-cols-6 gap-2 w-full max-w-md">
                    <button
                        onClick={handleManualSave}
                        className="w-12 h-12 border border-gray-200 rounded-lg bg-white/90 hover:bg-gray-100 text-xl flex items-center justify-center transition-colors"
                        title="Сохранить (Ctrl+S)"
                    >
                        <img
                            src="/1.jpg"
                            className="w-full h-full object-cover p-0 mix-blend-multiply"
                        />
                    </button>

                    <div className="relative">
                        <button
                            onClick={() => { setShowColorMenu(!showColorMenu); setShowIconMenu(false); }}
                            className="w-12 h-12 border border-gray-200 rounded-lg bg-white/90 hover:bg-gray-100 text-xl flex items-center justify-center transition-colors"
                            title="Цвет заметки"
                        >
                            <img
                                src="/7.jpg"
                                className="w-full h-full object-cover p-0 mix-blend-multiply"
                            />
                        </button>
                        {showColorMenu && (
                            <div className="absolute left-0 top-14 bg-white/90 border border-gray-200 rounded-xl shadow-xl z-30 p-2 flex gap-1.5">
                                {colors.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            updateNote(activeNote.id, { color: c });
                                            setShowColorMenu(false);
                                        }}
                                        className="w-5 h-5 rounded-full border border-gray-300 transition hover:scale-110"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => { setShowIconMenu(!showIconMenu); setShowColorMenu(false); }}
                            className="w-12 h-12 border border-gray-200 rounded-lg bg-white/90 hover:bg-gray-100 flex items-center justify-center overflow-hidden"
                            title="Иконка заметки"
                        >
                            <img
                                src="/26.jpg"
                                className="w-full h-full object-cover scale-2000 mix-blend-multiply"
                            />
                        </button>
                        {showIconMenu && (
                            <div className="absolute left-0 top-14 bg-white/90 border border-gray-200 rounded-xl shadow-xl z-30 p-2 grid grid-cols-5 gap-1.5 w-44">
                                {availableIcons.map((icon) => (
                                    <button
                                        key={icon}
                                        onClick={() => {
                                            updateNote(activeNote.id, { icon: icon });
                                            setShowIconMenu(false);
                                        }}
                                        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 text-base"
                                    >
                                        {icon}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => setIsTranslateActive(!isTranslateActive)}
                        className={`w-12 h-12 border rounded-lg text-xl flex items-center justify-center transition-colors ${isTranslateActive
                            ? 'bg-blue-500 border-blue-600 text-white'
                            : 'bg-white/90 border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                        title="Перевод слов"
                    >
                        <img
                            src="/14.jpg"
                            className="w-full h-full object-cover p-0 mix-blend-multiply"
                        />
                    </button>

                    <button
                        onClick={handleFormatMarkdown}
                        className="w-12 h-12 border border-gray-200 rounded-lg bg-white/90 hover:bg-gray-100 text-xl flex items-center justify-center transition-colors"
                        title="Формат Markdown (Ctrl+M)"
                    >
                        <img
                            src="/16.jpg"
                            className="w-full h-full object-cover p-0 mix-blend-multiply"
                        />
                    </button>

                    <button
                        onClick={handleAiFixErrors}
                        disabled={isFixing}
                        className={`w-12 h-12 border rounded-lg text-xl flex items-center justify-center transition-colors ${isFixing
                            ? 'bg-gray-300 border-gray-300 cursor-not-allowed'
                            : 'bg-white/90 hover:bg-gray-100 border-gray-200'
                            }`}
                        title="Исправить ошибки (ИИ)"
                    >
                        {isFixing ? '⏳' : '✨'}
                    </button>
                </div>

                <div className="text-[11px] text-gray-500 font-medium bg-white/30 rounded-md px-2 py-1 self-start">
                    {isTranslateActive ? "🌐 Режим перевода активен" : "🔧 Панель инструментов"}
                    {isFixing && " 🔄 Исправление ошибок..."}
                </div>
            </div>
        </div>
    );
}