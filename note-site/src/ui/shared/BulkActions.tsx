import { Button } from './Button';

export function BulkActions({
    selectedCount,
    onDelete,
    onExport,
}: {
    selectedCount: number;
    onDelete: () => void;
    onExport: () => void;
}) {
    if (selectedCount === 0) return null;
    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-lg shadow-lg p-3 flex gap-4 z-50">
            <span>Выбрано: {selectedCount}</span>
            <Button variant="outline" onClick={onExport}>
                Экспорт
            </Button>
            <Button onClick={onDelete}>Удалить</Button>
        </div>
    );
}