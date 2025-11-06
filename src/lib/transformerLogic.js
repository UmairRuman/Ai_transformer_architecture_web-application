import { CONFIG, VOCAB } from './constants';

/**
 * Get embedding vector for a token from our vocabulary
 * Returns the pre-computed embedding or null if token not found
 */
export function getEmbedding(token, vocab = VOCAB) {
  return vocab[token] || null;
}

/**
 * Generate positional encoding for a specific position
 */
export function getPositionalEncoding(pos, dModel) {
  const pe = new Array(dModel).fill(0);
  for (let i = 0; i < dModel; i++) {
    if (i % 2 === 0) {
      pe[i] = Math.sin(pos / Math.pow(10000, 2 * i / dModel));
    } else {
      pe[i] = Math.cos(pos / Math.pow(10000, 2 * (i - 1) / dModel));
    }
    // Scale down the values to be in a similar range as embeddings
    pe[i] *= 0.5;
  }
  return pe;
}

/**
 * Add two vectors element-wise
 */
export function addVectors(vec1, vec2) {
  return vec1.map((val, idx) => val + vec2[idx]);
}

/**
 * Generate random weight matrices for Q, K, V transformations
 * In a real transformer, these are learned during training
 */
function generateWeightMatrix(inputDim, outputDim) {
  const matrix = [];
  for (let i = 0; i < outputDim; i++) {
    const row = [];
    for (let j = 0; j < inputDim; j++) {
      // Random weights between -0.5 and 0.5
      row.push((Math.random() - 0.5));
    }
    matrix.push(row);
  }
  return matrix;
}

/**
 * Matrix-vector multiplication
 */
function matrixVectorMultiply(matrix, vector) {
  return matrix.map(row => {
    return row.reduce((sum, weight, idx) => sum + weight * vector[idx], 0);
  });
}

/**
 * Simple tokenizer that splits input into words and ensures max length
 * Returns array of tokens that exist in our vocabulary
 */
export function tokenize(input) {
  if (!input) return [];
  
  // Split into words and take only up to maxWords
  const words = input.trim().split(/\s+/).slice(0, CONFIG.maxWords);
  
  // Only return tokens that exist in our vocabulary
  return words.filter(word => VOCAB.hasOwnProperty(word));
}

/**
 * Create Q, K, V matrices from input vectors
 * Each input vector is transformed into Query, Key, and Value vectors
 */
export function createQKVMatrices(inputVectors) {
  const dModel = inputVectors[0].length;
  
  // Generate weight matrices (these would be learned in a real model)
  const Wq = generateWeightMatrix(dModel, dModel);
  const Wk = generateWeightMatrix(dModel, dModel);
  const Wv = generateWeightMatrix(dModel, dModel);
  
  // Transform each input vector
  const Q = inputVectors.map(vec => matrixVectorMultiply(Wq, vec));
  const K = inputVectors.map(vec => matrixVectorMultiply(Wk, vec));
  const V = inputVectors.map(vec => matrixVectorMultiply(Wv, vec));
  
  return { Q, K, V };
}

/**
 * Calculate dot product between two vectors
 */
function dotProduct(vec1, vec2) {
  return vec1.reduce((sum, val, idx) => sum + val * vec2[idx], 0);
}

/**
 * Calculate attention scores for one query against all keys
 * Returns raw attention scores (before softmax)
 */
export function calculateAttentionScores(queryVector, keyVectors) {
  const dk = queryVector.length;
  const scaleFactor = Math.sqrt(dk);
  
  // Calculate Q·K^T for each key, then scale
  const scores = keyVectors.map(keyVec => {
    const score = dotProduct(queryVector, keyVec);
    return score / scaleFactor;  // Scaled dot-product attention
  });
  
  return scores;
}

/**
 * Apply softmax function to convert scores to probabilities
 * Output values will sum to 1.0
 */
export function applySoftmax(scores) {
  // Find max for numerical stability
  const maxScore = Math.max(...scores);
  
  // Compute exp(score - max) for each score
  const expScores = scores.map(score => Math.exp(score - maxScore));
  
  // Sum of all exp scores
  const sumExpScores = expScores.reduce((sum, val) => sum + val, 0);
  
  // Normalize to get probabilities
  return expScores.map(expScore => expScore / sumExpScores);
}

/**
 * Calculate final attention output as weighted sum of value vectors
 * attention_output = sum(attention_weights[i] * value_vectors[i])
 */
export function calculateAttentionOutput(attentionWeights, valueVectors) {
  const dModel = valueVectors[0].length;
  const output = new Array(dModel).fill(0);
  
  // Weighted sum: multiply each value vector by its attention weight
  attentionWeights.forEach((weight, idx) => {
    const valueVec = valueVectors[idx];
    valueVec.forEach((val, dim) => {
      output[dim] += weight * val;
    });
  });
  
  return output;
}

/**
 * Complete attention mechanism for all tokens
 * Returns attention outputs for all input positions
 */
export function computeMultiHeadAttention(inputVectors, numHeads = 1) {
  const { Q, K, V } = createQKVMatrices(inputVectors);
  const outputs = [];
  
  // For each query (each position)
  for (let i = 0; i < Q.length; i++) {
    const scores = calculateAttentionScores(Q[i], K);
    const attentionWeights = applySoftmax(scores);
    const output = calculateAttentionOutput(attentionWeights, V);
    outputs.push(output);
  }
  
  return outputs;
}