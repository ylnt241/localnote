import { Sidebar } from './ui/components/Sidebar';
import { MainPanel } from './ui/components/MainPanel';
import { Toolbar } from './ui/components/Toolbar';
import { useNotes } from './ui/hooks/useNotes';

export default function App() {
    const {
        activeNote,
        updateNote,
        exportToAnki,
        saveStatus,
        setSaveStatus
    } = useNotes();

    const handleSave = async () => {
        if (!activeNote) return;
        setSaveStatus('saving');
        await new Promise(resolve => setTimeout(resolve, 100));
        updateNote(activeNote.id, {
            title: activeNote.title,
            content: activeNote.content,
            tags: activeNote.tags,
            color: activeNote.color
        });
    };

    const handleOpenColorPicker = () => {
        console.log('Open color picker');
    };

    const handleFormatText = () => {
        console.log('Format text');
    };

    if (!activeNote) {
        return (
            <div className="w-full h-screen bg-gray-100 flex overflow-hidden font-sans antialiased">
                <Sidebar />
                <div className="flex-1 flex flex-col p-4 min-w-0">
                    <Toolbar
                        onSave={handleSave}
                        onOpenColorPicker={handleOpenColorPicker}
                        onFormatText={handleFormatText}
                    />
                    <div className="flex-1 mt-4 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-400 p-6">
                        <span className="text-4xl mb-2">📓</span>
                        <p className="text-sm font-medium">Выберите заметку в меню слева или создайте новую</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleContentChange = (content: string) => {
        updateNote(activeNote.id, { content });
        setSaveStatus('typing');
    };

    const handleTitleChange = (title: string) => {
        updateNote(activeNote.id, { title });
        setSaveStatus('typing');
    };

    const handleExportToAnki = () => {
        exportToAnki();
    };

    const handleAddTag = (tag: string) => {
        const updatedTags = [...activeNote.tags, tag];
        updateNote(activeNote.id, { tags: updatedTags });
    };

    const handleRemoveTag = (tag: string) => {
        const updatedTags = activeNote.tags.filter(t => t !== tag);
        updateNote(activeNote.id, { tags: updatedTags });
    };

    const handleUpdateColor = (color: string) => {
        updateNote(activeNote.id, { color });
    };

    return (
        <div className="w-full h-screen bg-gray-100 flex overflow-hidden font-sans antialiased">
            <Sidebar />
            <div className="flex-1 flex flex-col p-4 min-w-0">
                <Toolbar
                    onSave={handleSave}
                    onOpenColorPicker={handleOpenColorPicker}
                    onFormatText={handleFormatText}
                />
                <div className="flex-1 mt-4">
                    <MainPanel
                        content={activeNote.content}
                        title={activeNote.title}
                        onContentChange={handleContentChange}
                        onTitleChange={handleTitleChange}
                        onSave={handleSave}
                        onExportToAnki={handleExportToAnki}
                        saveStatus={saveStatus}
                        onAddTag={handleAddTag}
                        onRemoveTag={handleRemoveTag}
                        onUpdateColor={handleUpdateColor}
                        currentTags={activeNote.tags}
                        currentColor={activeNote.color}
                    />
                </div>
            </div>
        </div>
    );
}