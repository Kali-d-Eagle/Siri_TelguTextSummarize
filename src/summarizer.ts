/**
 * Telugu and English Extractive Summarization Logic
 */

const TELUGU_STOPWORDS = new Set([
  "మరియు", "కూడా", "ఒక", "ఈ", "ఆ", "అది", "ఇది", "వారు", "వీరు", "నేను", "మేము", "మీరు", "తన", "తనకు", "అతను", "ఆమె", "ఉంది", "ఉన్నాయి", "ఉన్నాడు", "వచ్చింది", "వెళ్ళింది", "చేయాలి", "చేసి", "అని", "అంటే", "కానీ", "లేదా", "యొక్క", "నుండి", "ద్వారా", "కోసం", "గురించి", "ముందు", "తరువాత", "క్రింద", "పైన", "లోపల", "బయట", "వద్ద", "దగ్గర", "వరకు", "ఎప్పుడు", "ఎక్కడ", "ఎలా", "ఎందుకు", "ఏమిటి", "ఎవరు", "ఏ", "కొన్ని", "చాలా", "కొద్దిగా", "ఎక్కువ", "తక్కువ", "మొదటి", "చివరి", "మధ్య", "మొత్తం", "ప్రతి", "అన్ని", "కొంత", "మాత్రమే", "కన్నా", "కంటే", "కలిగి", "ఉన్న", "అయిన", "అయినప్పటికీ", "కాబట్టి", "అందువలన", "అందుకే", "అయితే", "అందులో", "ఇందులో", "ఎందులో", "అక్కడ", "ఇక్కడ", "ఎక్కడ", "అప్పుడు", "ఇప్పుడు", "ఎప్పుడు"
]);

const ENGLISH_STOPWORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
]);

export type Language = 'telugu' | 'english' | 'mixed';

export interface SummarizationResult {
  summary: string;
  originalSentences: string[];
  summarySentences: string[];
  keywords: { word: string; count: number }[];
  wordFrequencies: { word: string; count: number }[];
  language: Language;
}

export function detectLanguage(text: string): Language {
  const teluguRegex = /[\u0C00-\u0C7F]/;
  const englishRegex = /[a-zA-Z]/;
  
  const hasTelugu = teluguRegex.test(text);
  const hasEnglish = englishRegex.test(text);
  
  if (hasTelugu && hasEnglish) return 'mixed';
  if (hasTelugu) return 'telugu';
  return 'english';
}

export function summarize(text: string, ratio: number = 0.3): SummarizationResult {
  if (!text.trim()) {
    return {
      summary: "",
      originalSentences: [],
      summarySentences: [],
      keywords: [],
      wordFrequencies: [],
      language: 'english'
    };
  }

  const language = detectLanguage(text);
  const stopwords = language === 'telugu' ? TELUGU_STOPWORDS : language === 'english' ? ENGLISH_STOPWORDS : new Set([...TELUGU_STOPWORDS, ...ENGLISH_STOPWORDS]);

  // 1. Sentence Tokenization
  // Split by . ! ? and Telugu full stop ।
  const sentences = text.split(/[.!?।\n]+/).map(s => s.trim()).filter(s => s.length > 5);

  // 2. Word Tokenization & Frequency
  const words = text.toLowerCase().match(/[\u0C00-\u0C7F\w]+/g) || [];
  const freqMap: Record<string, number> = {};
  
  words.forEach(word => {
    if (!stopwords.has(word) && word.length > 1) {
      freqMap[word] = (freqMap[word] || 0) + 1;
    }
  });

  // Normalize frequencies
  const maxFreq = Math.max(...Object.values(freqMap), 1);
  const normalizedFreq: Record<string, number> = {};
  for (const word in freqMap) {
    normalizedFreq[word] = freqMap[word] / maxFreq;
  }

  // 3. Sentence Scoring
  const sentenceScores: { index: number; score: number; text: string }[] = sentences.map((sentence, index) => {
    const sentenceWords = sentence.toLowerCase().match(/[\u0C00-\u0C7F\w]+/g) || [];
    let score = 0;
    sentenceWords.forEach(word => {
      if (normalizedFreq[word]) {
        score += normalizedFreq[word];
      }
    });
    return { index, score, text: sentence };
  });

  // 4. Ranking & Selection
  const numSentences = Math.max(1, Math.round(sentences.length * ratio));
  const rankedSentences = [...sentenceScores].sort((a, b) => b.score - a.score).slice(0, numSentences);
  
  // Re-order by original appearance
  const summarySentences = rankedSentences.sort((a, b) => a.index - b.index).map(s => s.text);
  const summary = summarySentences.join('. ') + (language === 'telugu' ? ' ।' : '.');

  // 5. Keywords & Frequencies for Visualization
  const wordFrequencies = Object.entries(freqMap)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  const keywords = wordFrequencies.slice(0, 10);

  return {
    summary,
    originalSentences: sentences,
    summarySentences,
    keywords,
    wordFrequencies,
    language
  };
}
