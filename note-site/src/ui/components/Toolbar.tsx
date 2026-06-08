
interface ToolbarProps {
    onSave: () => void;
    onOpenColorPicker: () => void;
    onFormatText: () => void;
}

export function Toolbar({ onSave, onOpenColorPicker, onFormatText }: ToolbarProps) {
    return (
        // Равные кнопки делаются через сетку grid-cols-5
        <div className="h-12 bg-white border border-gray-200 rounded-xl shadow-sm px-4 flex items-center w-full">
            <div className="grid grid-cols-5 gap-2 w-full max-w-xl">
                <button
                    onClick={onSave}
                    className="py-1 px-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 text-center truncate"
                >
                    💾 Сохранить
                </button>

                <button
                    onClick={onOpenColorPicker}
                    className="py-1 px-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 text-center truncate"
                >
                    🎨 Цвет
                </button>

                <button
                    onClick={onFormatText}
                    className="py-1 px-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 text-xs font-medium text-gray-700 text-center truncate"
                >
                    ✍️ Формат
                </button>

                {/* Две пустые кнопки без функций (undefined) */}
                <button
                    onClick={undefined}
                    className="py-1 px-3 border border-gray-200 rounded-md bg-gray-100 text-xs font-medium text-gray-400 text-center truncate cursor-not-allowed"
                >
                    ⚙️ Настройки (—)
                </button>

                <button
                    onClick={undefined}
                    className="py-1 px-3 border border-gray-200 rounded-md bg-gray-100 text-xs font-medium text-gray-400 text-center truncate cursor-not-allowed"
                >
                    🔒 Приватность (—)
                </button>
            </div>
        </div>
    );
}