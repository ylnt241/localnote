import { Sidebar } from './ui/components/Sidebar';
import { MainPanel } from './ui/components/MainPanel';
import { useNotes } from './ui/hooks/useNotes';

export default function App() {
    const { 
        activeNote, 
        updateNote, 
        saveNote, 
        exportToAnki 
    } = useNotes();

    if (!activeNote) {
        return (
            <div className="w-full h-screen bg-gray-100 flex overflow-hidden font-sans antialiased">
                <Sidebar />
                <div className="flex-1 flex flex-col p-4">
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-400 p-6">
                        <span className="text-4xl mb-2">📓</span>
                        <p className="text-sm font-medium">Выберите заметку в меню слева или создайте новую</p>
                    </div>
                </div>
            </div>
        );
    }

    const handleContentChange = (content: string) => {
        updateNote(activeNote.id, { content });
    };

    const handleTitleChange = (title: string) => {
        updateNote(activeNote.id, { title });
    };

    const handleSave = async () => {
        // The updateNote method already handles saving and updates saveStatus
        // We can trigger a save by calling updateNote with current values
        updateNote(activeNote.id, { 
            title: activeNote.title, 
            content: activeNote.content,
            tags: activeNote.tags,
            color: activeNote.color
        });
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
            <div className="flex-1 flex flex-col p-4">
                <MainPanel
                    content={activeNote.content}
                    title={activeNote.title}
                    onContentChange={handleContentChange}
                    onTitleChange={handleTitleChange}
                    onSave={handleSave}
                    onExportToAnki={handleExportToAnki}
                    saveStatus="saved"
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                    onUpdateColor={handleUpdateColor}
                    currentTags={activeNote.tags}
                    currentColor={activeNote.color}
                />
            </div>
        </div>
    );
}