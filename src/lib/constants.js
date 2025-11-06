// Animation Timings (in seconds)
export const TIMINGS = {
  matrixMultiply: 1.2,
  dotProduct: 0.8,
  softmax: 1.0,
  vectorMove: 0.6,
  fadeInOut: 0.3,
  tokenSplit: 0.5,
  embedding: 1.0,
  positionalEncoding: 0.8
};

// Visual Design System
export const COLORS = {
  query: '#3B82F6',      // Blue
  key: '#F59E0B',        // Orange
  value: '#A855F7',      // Purple
  attention: '#10B981',  // Green
  residual: '#6B7280',   // Gray
  weight: '#EF4444',     // Red
  background: '#F8FAFC',
  token: '#8B5CF6'
};

// Transformer Configuration
export const CONFIG = {
  maxWords: 5,           // Maximum sentence length
  dModel: 6,             // Embedding dimension
  vocabSize: 1000,       // Vocabulary size
  numHeads: 2,           // Number of attention heads
  dff: 12,               // Feed-forward dimension
  dK: 3                  // Key/Query dimension per head
};

// Example sentences for demo
export const EXAMPLES = {
  input: "We are best",
  output: "Nous sommes meilleurs",
  tokens: ["We", "are", "best"]
};

// Pre-computed embeddings for demo (normally these would be learned)
export const VOCAB = {
  "We": [0.2, 0.8, 0.1, 0.9, 0.3, 0.7],
  "are": [0.5, 0.4, 0.6, 0.2, 0.8, 0.3],
  "best": [0.9, 0.1, 0.7, 0.4, 0.2, 0.6],
  "AI": [0.7, 0.3, 0.8, 0.5, 0.1, 0.9],
  "is": [0.4, 0.6, 0.3, 0.7, 0.5, 0.2],
  "powerful": [0.8, 0.2, 0.9, 0.3, 0.6, 0.4]
};