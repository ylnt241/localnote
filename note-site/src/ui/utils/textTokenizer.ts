/**
 * Token types emitted by the tokenizer.
 * - `word`: a sequence of alphanumeric characters (including apostrophes).
 * - `punctuation`: any non‑word, non‑whitespace characters.
 * - `whitespace`: spaces, tabs, newlines.
 */
export interface Token {
  type: 'word' | 'punctuation' | 'whitespace';
  content: string;
  /**
   * Normalized version of the word without punctuation.
   * Present only for `word` tokens where a clean word exists.
   */
  cleanWord?: string;
}

// Regex matching punctuation characters (excluding letters, numbers, and whitespace).
const PUNCTUATION_REGEX = /[^\w\s]|_/g;

/**
 * Split a plain‑text string into an ordered list of tokens.
 * Mirrors the reference implementation from `code-reference/src/ui/utils/textTokenizer.ts`.
 */
export function tokenizeText(text: string): Token[] {
  const tokens: Token[] = [];
  let currentIndex = 0;

  while (currentIndex < text.length) {
    const remainingText = text.substring(currentIndex);

    // ---------- Whitespace ----------
    if (remainingText.match(/^\s+/)) {
      const match = remainingText.match(/^\s+/);
      if (match) {
        tokens.push({ type: 'whitespace', content: match[0] });
        currentIndex += match[0].length;
        continue;
      }
    }

    // ---------- Punctuation ----------
    if (remainingText.match(/^[^\w\s]/)) {
      const match = remainingText.match(/^[^\w\s]+/);
      if (match) {
        tokens.push({ type: 'punctuation', content: match[0] });
        currentIndex += match[0].length;
        continue;
      }
    }

    // ---------- Words ----------
    if (remainingText.match(/^[\w']+/)) {
      const match = remainingText.match(/^[\w']+/);
      if (match) {
        const word = match[0];
        const cleanWord = word.replace(PUNCTUATION_REGEX, '');
        tokens.push({
          type: 'word',
          content: word,
          cleanWord: cleanWord.length > 0 ? cleanWord : undefined,
        });
        currentIndex += word.length;
        continue;
      }
    }

    // ---------- Fallback (single punctuation char) ----------
    tokens.push({ type: 'punctuation', content: remainingText[0] });
    currentIndex++;
  }

  return tokens;
}

/** Type guard for word tokens that have a `cleanWord`. */
export function isWordToken(token: Token): token is Token & { type: 'word'; cleanWord: string } {
  return token.type === 'word' && token.cleanWord !== undefined && token.cleanWord.length > 0;
}

/** Normalize a word for dictionary look‑up (remove punctuation, trim, lower‑case). */
export function cleanWordForDictionary(word: string): string {
  return word.replace(PUNCTUATION_REGEX, '').trim().toLowerCase();
}
