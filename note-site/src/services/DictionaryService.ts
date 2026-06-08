import type { DefinitionData } from '../ui/hooks/useWordHover';

export class DictionaryService {
  private static instance: DictionaryService;
  private cache: Map<string, DefinitionData> = new Map();

  private constructor() { }

  static getInstance(): DictionaryService {
    if (!DictionaryService.instance) {
      DictionaryService.instance = new DictionaryService();
    }
    return DictionaryService.instance;
  }

  async fetchDefinition(word: string): Promise<DefinitionData | null> {
    const cleanWord = word.toLowerCase().trim();

    // Check cache first
    if (this.cache.has(cleanWord)) {
      return this.cache.get(cleanWord)!;
    }

    try {
      // Using free dictionary API
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${cleanWord}`);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        return null;
      }

      const entry = data[0];
      const wordData = entry.word || cleanWord;
      const phonetic = entry.phonetic || entry.phonetics?.find((p: any) => p.text)?.text;
      const meanings = entry.meanings || [];
      const firstMeaning = meanings[0];

      const definitionData: DefinitionData = {
        word: wordData,
        phonetic: phonetic,
        partOfSpeech: firstMeaning?.partOfSpeech,
        definition: firstMeaning?.definitions?.[0]?.definition || 'No definition available'
      };

      // Cache the result
      this.cache.set(cleanWord, definitionData);

      return definitionData;
    } catch (error) {
      console.error('Dictionary service error:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const dictionaryService = DictionaryService.getInstance();
