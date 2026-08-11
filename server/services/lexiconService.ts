import fs from 'fs';
import path from 'path';

export interface LexiconData {
  builtin_positive: string[];
  builtin_negative: string[];
  custom_positive: string[];
  custom_negative: string[];
}

export const BUILTIN_POSITIVE: string[] = [
  'profit', 'growth', 'record', 'expansion', 'approval', 'success', 'partnership',
  'investment', 'gain', 'increase', 'surge', 'bullish', 'dividend', 'upgrade',
  'revenue', 'beat', 'outperform', 'order', 'deal', 'soar', 'all-time high', 'rally',
  'positive', 'strong', 'boom', 'breakthrough', 'acquisition', 'buyback'
];

export const BUILTIN_NEGATIVE: string[] = [
  'arrested', 'fraud', 'loss', 'decline', 'crash', 'investigation', 'bankruptcy',
  'fall', 'lawsuit', 'corruption', 'bearish', 'probe', 'slump', 'downgrade',
  'fine', 'penalty', 'missed', 'debt', 'default', 'plunge', 'drop',
  'weak', 'layoff', 'resignation', 'sanction', 'crisis', 'deficit', 'warning'
];

const DATA_FILE = path.join(process.cwd(), 'server', 'data', 'customLexicon.json');

let customPositiveWords: string[] = [];
let customNegativeWords: string[] = [];

// Load custom lexicon from file on boot
function loadCustomLexicon() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.custom_positive)) customPositiveWords = parsed.custom_positive;
      if (Array.isArray(parsed.custom_negative)) customNegativeWords = parsed.custom_negative;
    }
  } catch (e) {
    console.error('Failed to load custom lexicon from file:', e);
  }
}

function saveCustomLexicon() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify({
      custom_positive: customPositiveWords,
      custom_negative: customNegativeWords
    }, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save custom lexicon to file:', e);
  }
}

loadCustomLexicon();

export function getLexicon(): LexiconData {
  return {
    builtin_positive: BUILTIN_POSITIVE,
    builtin_negative: BUILTIN_NEGATIVE,
    custom_positive: customPositiveWords,
    custom_negative: customNegativeWords,
  };
}

export function getCombinedLexicon(): { positive: string[]; negative: string[] } {
  const positive = Array.from(new Set([...BUILTIN_POSITIVE, ...customPositiveWords]));
  const negative = Array.from(new Set([...BUILTIN_NEGATIVE, ...customNegativeWords]));
  return { positive, negative };
}

export function addCustomWord(word: string, category: 'POSITIVE' | 'NEGATIVE'): { success: boolean; message: string } {
  const cleanWord = word.trim().toLowerCase();
  if (!cleanWord) {
    return { success: false, message: 'Word cannot be empty' };
  }

  // Check if already present in builtin or custom
  if (BUILTIN_POSITIVE.includes(cleanWord) || BUILTIN_NEGATIVE.includes(cleanWord)) {
    return { success: false, message: `"${cleanWord}" is already part of the built-in dictionary.` };
  }

  if (category === 'POSITIVE') {
    if (customPositiveWords.includes(cleanWord)) {
      return { success: false, message: `"${cleanWord}" is already in user positive words.` };
    }
    customNegativeWords = customNegativeWords.filter(w => w !== cleanWord);
    customPositiveWords.push(cleanWord);
  } else {
    if (customNegativeWords.includes(cleanWord)) {
      return { success: false, message: `"${cleanWord}" is already in user negative words.` };
    }
    customPositiveWords = customPositiveWords.filter(w => w !== cleanWord);
    customNegativeWords.push(cleanWord);
  }

  saveCustomLexicon();
  return { success: true, message: `Added "${cleanWord}" to custom ${category.toLowerCase()} words.` };
}

export function deleteCustomWord(word: string): { success: boolean; message: string } {
  const cleanWord = word.trim().toLowerCase();
  if (BUILTIN_POSITIVE.includes(cleanWord) || BUILTIN_NEGATIVE.includes(cleanWord)) {
    return { success: false, message: `Cannot delete built-in word "${cleanWord}". Built-in dictionaries are preserved.` };
  }

  const initialPosLen = customPositiveWords.length;
  const initialNegLen = customNegativeWords.length;

  customPositiveWords = customPositiveWords.filter(w => w !== cleanWord);
  customNegativeWords = customNegativeWords.filter(w => w !== cleanWord);

  if (customPositiveWords.length < initialPosLen || customNegativeWords.length < initialNegLen) {
    saveCustomLexicon();
    return { success: true, message: `Deleted custom word "${cleanWord}".` };
  }

  return { success: false, message: `Word "${cleanWord}" not found in custom user dictionary.` };
}
