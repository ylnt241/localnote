import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { LocalStorageNoteRepository } from '../../infrastructure/repositories/LocalStorageNoteRepository';
import { ExportService } from '../../services/ExportService';
import { DictionaryService } from '../../services/DictionaryService';

const noteRepository = new LocalStorageNoteRepository();
const exportService = new ExportService();
const dictionaryService = new DictionaryService();

interface AppContextValue {
    noteRepository: LocalStorageNoteRepository;
    exportService: ExportService;
    dictionaryService: DictionaryService;
}

const AppContext = createContext<AppContextValue>({
    noteRepository,
    exportService,
    dictionaryService,
});

export function AppProvider({ children }: { children: ReactNode }) {
    return (
        <AppContext.Provider value={{ noteRepository, exportService, dictionaryService }}>
            {children}
        </AppContext.Provider>
    );
}

export function useAppContext() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useAppContext must be used inside AppProvider');
    return ctx;
}