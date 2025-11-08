// Simple word-by-word translation dictionary
// In production, this would use a real translation API

export const TRANSLATIONS = {
  french: {
    'we': 'nous',
    'are': 'sommes',
    'best': 'meilleurs',
    'ai': 'ia',
    'is': 'est',
    'powerful': 'puissant',
    'learning': 'apprentissage',
    'deep': 'profond',
    'machine': 'machine',
    'neural': 'neural',
    'network': 'réseau',
    'model': 'modèle',
    'i': 'je',
    'you': 'tu',
    'he': 'il',
    'she': 'elle',
    'they': 'ils',
    'the': 'le',
    'a': 'un',
    'an': 'un',
    'my': 'mon',
    'your': 'ton',
    'good': 'bon',
    'bad': 'mauvais',
    'big': 'grand',
    'small': 'petit',
    'love': 'amour',
    'hate': 'haine',
    'want': 'veux',
    'need': 'besoin',
    'have': 'avoir',
    'can': 'peut',
    'will': 'sera'
  },
  spanish: {
    'we': 'nosotros',
    'are': 'somos',
    'best': 'mejores',
    'ai': 'ia',
    'is': 'es',
    'powerful': 'poderoso',
    'learning': 'aprendizaje',
    'deep': 'profundo',
    'machine': 'máquina',
    'neural': 'neural',
    'network': 'red',
    'model': 'modelo',
    'i': 'yo',
    'you': 'tú',
    'he': 'él',
    'she': 'ella',
    'they': 'ellos',
    'the': 'el',
    'a': 'un',
    'an': 'un',
    'my': 'mi',
    'your': 'tu',
    'good': 'bueno',
    'bad': 'malo',
    'big': 'grande',
    'small': 'pequeño',
    'love': 'amor',
    'hate': 'odio',
    'want': 'quiero',
    'need': 'necesito',
    'have': 'tener',
    'can': 'puede',
    'will': 'será'
  },
  german: {
    'we': 'wir',
    'are': 'sind',
    'best': 'beste',
    'ai': 'ki',
    'is': 'ist',
    'powerful': 'mächtig',
    'learning': 'lernen',
    'deep': 'tief',
    'machine': 'maschine',
    'neural': 'neural',
    'network': 'netzwerk',
    'model': 'modell',
    'i': 'ich',
    'you': 'du',
    'he': 'er',
    'she': 'sie',
    'they': 'sie',
    'the': 'der',
    'a': 'ein',
    'an': 'ein',
    'my': 'mein',
    'your': 'dein',
    'good': 'gut',
    'bad': 'schlecht',
    'big': 'groß',
    'small': 'klein',
    'love': 'liebe',
    'hate': 'hass',
    'want': 'wollen',
    'need': 'brauchen',
    'have': 'haben',
    'can': 'kann',
    'will': 'wird'
  },
  italian: {
    'we': 'noi',
    'are': 'siamo',
    'best': 'migliori',
    'ai': 'ia',
    'is': 'è',
    'powerful': 'potente',
    'learning': 'apprendimento',
    'deep': 'profondo',
    'machine': 'macchina',
    'neural': 'neurale',
    'network': 'rete',
    'model': 'modello',
    'i': 'io',
    'you': 'tu',
    'he': 'lui',
    'she': 'lei',
    'they': 'loro',
    'the': 'il',
    'a': 'un',
    'an': 'un',
    'my': 'mio',
    'your': 'tuo',
    'good': 'buono',
    'bad': 'cattivo',
    'big': 'grande',
    'small': 'piccolo',
    'love': 'amore',
    'hate': 'odio',
    'want': 'voglio',
    'need': 'bisogno',
    'have': 'avere',
    'can': 'può',
    'will': 'sarà'
  },
  portuguese: {
    'we': 'nós',
    'are': 'somos',
    'best': 'melhores',
    'ai': 'ia',
    'is': 'é',
    'powerful': 'poderoso',
    'learning': 'aprendizado',
    'deep': 'profundo',
    'machine': 'máquina',
    'neural': 'neural',
    'network': 'rede',
    'model': 'modelo',
    'i': 'eu',
    'you': 'você',
    'he': 'ele',
    'she': 'ela',
    'they': 'eles',
    'the': 'o',
    'a': 'um',
    'an': 'um',
    'my': 'meu',
    'your': 'seu',
    'good': 'bom',
    'bad': 'mau',
    'big': 'grande',
    'small': 'pequeno',
    'love': 'amor',
    'hate': 'ódio',
    'want': 'quero',
    'need': 'preciso',
    'have': 'ter',
    'can': 'pode',
    'will': 'será'
  }
};

// Special tokens
export const SPECIAL_TOKENS = {
  START: '<START>',
  END: '<END>',
  PAD: '<PAD>',
  UNK: '<UNK>'
};

// Translate a word to target language
export function translateWord(word, targetLanguage = 'french') {
  const lowerWord = word.toLowerCase();
  const dict = TRANSLATIONS[targetLanguage];
  
  if (!dict) {
    console.warn(`Language ${targetLanguage} not supported`);
    return word;
  }
  
  return dict[lowerWord] || word;
}

// Translate entire sentence
export function translateSentence(tokens, targetLanguage = 'french') {
  return tokens.map(token => translateWord(token, targetLanguage));
}

// Get target tokens with special tokens for decoder
export function getDecoderInputTokens(tokens, targetLanguage = 'french', mode = 'inference') {
  const translated = translateSentence(tokens, targetLanguage);
  
  if (mode === 'training') {
    // Training mode: <START> + translated tokens
    return [SPECIAL_TOKENS.START, ...translated];
  } else {
    // Inference mode: Start with <START> only
    return [SPECIAL_TOKENS.START];
  }
}

// Get target tokens for comparison (expected output)
export function getDecoderOutputTokens(tokens, targetLanguage = 'french') {
  const translated = translateSentence(tokens, targetLanguage);
  return [...translated, SPECIAL_TOKENS.END];
}

// Check if word is a special token
export function isSpecialToken(token) {
  return Object.values(SPECIAL_TOKENS).includes(token);
}