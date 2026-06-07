export function NoteCard({
    note,
    isActive,
    onSelect,
    onTogglePin,
    isBulkMode,
    isSelected,
    onToggleSelect
}) {
    const handleCardClick = () => {
        if (isBulkMode) {
            onToggleSelect();
        } else {
            onSelect();
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className={`flex items-center p-2.5 rounded-lg border cursor-pointer transition-all ${isBulkMode
                    ? isSelected
                        ? 'bg-blue-50 border-blue-400 ring-1 ring-blue-400'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    : isActive
                        ? 'bg-blue-50 border-blue-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
        >
            <div className="w-8 h-8 flex items-center justify-center text-lg bg-gray-100 rounded-md shrink-0 mr-2.5">
                {note.type === 'todo' ? '☑️' : '📝'}
            </div>

            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-700 truncate">
                    {note.title || 'Без названия'}
                </h4>
            </div>

            {!isBulkMode && (
                <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePin();
                        }}
                        className={`w-6 h-6 flex items-center justify-center text-xs rounded hover:bg-gray-200 transition ${note.isPinned ? 'opacity-100' : 'opacity-30 hover:opacity-100'
                            }`}
                    >
                        📌
                    </button>

                    <div
                        className="w-6 h-6 rounded border border-gray-300"
                        style={{ backgroundColor: note.color || '#ffffff' }}
                        title="Цвет заметки"
                    />
                </div>
            )}
        </div>
    );
}