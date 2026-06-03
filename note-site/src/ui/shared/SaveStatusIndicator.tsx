import { useState } from 'react';

type SaveStatus = 'idle' | 'typing' | 'saving' | 'saved';

export function SaveStatusIndicator({ status }: { status: SaveStatus }) {
    const [showSaved, setShowSaved] = useState(false);

    // Исправление: проверяем, нужно ли показывать "Сохранено"
    if (status === 'saved' && !showSaved) {
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
    }

    if (status === 'idle') return null;
    if (status === 'saved' && !showSaved) return null;

    const config = {
        typing: { text: 'Печать...', color: 'text-yellow-600' },
        saving: { text: 'Сохранение...', color: 'text-blue-600' },
        saved: { text: 'Сохранено', color: 'text-green-600' },
    };

    return <div className={`text-sm ${config[status]?.color}`}>{config[status]?.text}</div>;
}