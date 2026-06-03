export class DictionaryService {
    async fetchDefinition(word: string): Promise<{
        word: string;
        phonetic?: string;
        partOfSpeech?: string;
        definition: string;
    } | null> {
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!response.ok) return null;

            const data = await response.json();
            const meaning = data[0]?.meanings?.[0];

            return {
                word: data[0]?.word || word,
                phonetic: data[0]?.phonetic,
                partOfSpeech: meaning?.partOfSpeech,
                definition: meaning?.definitions?.[0]?.definition || 'Определение не найдено',
            };
        } catch {
            return null;
        }
    }
}