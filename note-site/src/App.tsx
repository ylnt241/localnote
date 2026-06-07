import { Sidebar } from './ui/components/Sidebar';
import { useNotes } from './ui/hooks/useNotes';

export default function App() {
    const { activeNote } = useNotes();

    return (
        <div className="w-full h-screen bg-gray-100 flex overflow-hidden font-sans antialiased">

            <Sidebar />

            <div className="flex-1 flex flex-col p-4">
                {activeNote ? (
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-y-auto">

                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            {activeNote.title || 'Без названия'}
                        </h1>

                        <div className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm">
                            {activeNote.content || 'Нет текста в заметке...'}
                        </div>
                    </div>
                ) : (

                    <div className="flex-1 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center text-gray-400 p-6">
                        <span className="text-4xl mb-2">📓</span>
                        <p className="text-sm font-medium">Выберите заметку в меню слева или создайте новую</p>
                    </div>
                )}
            </div>

        </div>
    );
}