import { CONFIG } from './constants';

// Tokenize a sentence into words
export function tokenize(sentence) {
  return sentence
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0)
    .slice(0, CONFIG.maxWords);
}

// Get embedding vector for a token
export function getEmbedding(token, dModel = 6) {
  // Use deterministic random generation based on word
  const seed = token.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const random = (index) => {
    const x = Math.sin(seed + index) * 10000;
    return x - Math.floor(x);
  };
  
  // Generate embedding
  return Array.from({ length: dModel }, (_, i) => random(i));
}

// Generate positional encoding for a position
export function getPositionalEncoding(position, dModel = 6) {
  const encoding = [];
  
  for (let i = 0; i < dModel; i++) {
    if (i % 2 === 0) {
      encoding.push(Math.sin(position / Math.pow(10000, i / dModel)));
    } else {
      encoding.push(Math.cos(position / Math.pow(10000, (i - 1) / dModel)));
    }
  }
  
  return encoding;
}

// Add two vectors element-wise
export function addVectors(vec1, vec2) {
  return vec1.map((val, idx) => val + vec2[idx]);
}

// Matrix multiplication: matrix × vector
export function matrixVectorMultiply(matrix, vector) {
  return matrix.map(row => 
    row.reduce((sum, val, idx) => sum + val * vector[idx], 0)
  );
}

// Dot product of two vectors
export function dotProduct(vec1, vec2) {
  if (!vec1 || !vec2 || vec1.length === 0 || vec2.length === 0) {
    return 0;
  }
  if (vec1.length !== vec2.length) {
    console.error('Vector length mismatch:', vec1.length, vec2.length);
    return 0;
  }
  return vec1.reduce((sum, val, idx) => sum + (val * vec2[idx]), 0);
}

// Softmax function
export function softmax(values) {
  if (!values || values.length === 0) {
    return [];
  }
  
  const maxVal = Math.max(...values);
  const exps = values.map(v => Math.exp(v - maxVal));
  const sumExps = exps.reduce((a, b) => a + b, 0);
  
  if (sumExps === 0) {
    // Return uniform distribution if sum is zero
    return values.map(() => 1 / values.length);
  }
  
  return exps.map(exp => exp / sumExps);
}

// Scale a vector by a scalar
export function scaleVector(vector, scalar) {
  return vector.map(v => v * scalar);
}

// Generate random weight matrix
export function generateWeightMatrix(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.5)
  );
}

// Create Q, K, V matrices from input vectors
export function createQKVMatrices(inputVectors, dModel = 6) {
  const numTokens = inputVectors.length;
  
  // Generate weight matrices for Q, K, V
  const Wq = generateWeightMatrix(dModel, dModel);
  const Wk = generateWeightMatrix(dModel, dModel);
  const Wv = generateWeightMatrix(dModel, dModel);
  
  // Transform each input vector
  const Q = inputVectors.map(vec => matrixVectorMultiply(Wq, vec));
  const K = inputVectors.map(vec => matrixVectorMultiply(Wk, vec));
  const V = inputVectors.map(vec => matrixVectorMultiply(Wv, vec));
  
  return { Q, K, V, Wq, Wk, Wv };
}

// Calculate attention scores (Q · K^T)
export function calculateAttentionScores(query, keys) {
  return keys.map(key => dotProduct(query, key));
}

// Apply softmax to get attention weights
export function applySoftmax(scores, dK = 6) {
  if (!scores || scores.length === 0) {
    return [];
  }
  
  // Scale by sqrt(d_k)
  const sqrtDk = Math.sqrt(dK);
  if (sqrtDk === 0) {
    console.error('Invalid dK value:', dK);
    return scores.map(() => 1 / scores.length);
  }
  
  const scaledScores = scores.map(score => score / sqrtDk);
  return softmax(scaledScores);
}

// Calculate attention output (weighted sum of values)
export function calculateAttentionOutput(attentionWeights, values) {
  if (!attentionWeights || !values || attentionWeights.length === 0 || values.length === 0) {
    return Array(values[0]?.length || 6).fill(0);
  }
  
  const dModel = values[0].length;
  const output = Array(dModel).fill(0);
  
  for (let i = 0; i < attentionWeights.length; i++) {
    const weight = attentionWeights[i] || 0;
    for (let j = 0; j < dModel; j++) {
      output[j] += weight * (values[i][j] || 0);
    }
  }
  
  return output;
}

// Multi-head attention calculation
export function multiHeadAttention(inputVectors, numHeads = 2, dModel = 6) {
  const dK = dModel / numHeads; // Dimension per head
  const numTokens = inputVectors.length;
  
  const heads = [];
  
  for (let h = 0; h < numHeads; h++) {
    // Create Q, K, V for this head (simplified - in reality would split dimensions)
    const { Q, K, V } = createQKVMatrices(inputVectors, dModel);
    
    // Calculate attention for each token
    const headOutputs = [];
    const headScores = [];
    const headWeights = [];
    
    for (let i = 0; i < numTokens; i++) {
      const scores = calculateAttentionScores(Q[i], K);
      const weights = applySoftmax(scores, dK);
      const output = calculateAttentionOutput(weights, V);
      
      headOutputs.push(output);
      headScores.push(scores);
      headWeights.push(weights);
    }
    
    heads.push({
      Q, K, V,
      outputs: headOutputs,
      scores: headScores,
      weights: headWeights
    });
  }
  
  // Concatenate and project (simplified - just average the heads)
  const finalOutputs = [];
  for (let i = 0; i < numTokens; i++) {
    const avgOutput = Array(dModel).fill(0);
    for (let h = 0; h < numHeads; h++) {
      for (let j = 0; j < dModel; j++) {
        avgOutput[j] += heads[h].outputs[i][j];
      }
    }
    finalOutputs.push(avgOutput.map(v => v / numHeads));
  }
  
  return {
    heads,
    finalOutputs
  };
}

// Self-attention calculation for a single query (legacy - for compatibility)
export function calculateAttention(query, keys, values) {
  const scores = calculateAttentionScores(query, keys);
  const scaledScores = scores.map(score => score / Math.sqrt(query.length));
  const attentionWeights = softmax(scaledScores);
  const output = calculateAttentionOutput(attentionWeights, values);
  
  return {
    scores,
    scaledScores,
    attentionWeights,
    output
  };
}

// Layer Normalization
export function layerNorm(vector, epsilon = 1e-5) {
  if (!vector || vector.length === 0) {
    return vector;
  }
  
  // Calculate mean
  const mean = vector.reduce((sum, val) => sum + val, 0) / vector.length;
  
  // Calculate variance
  const variance = vector.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / vector.length;
  
  // Normalize
  const std = Math.sqrt(variance + epsilon);
  return vector.map(val => (val - mean) / std);
}

// ReLU activation
export function relu(x) {
  return Math.max(0, x);
}

// Apply ReLU to vector
export function reluVector(vector) {
  return vector.map(v => relu(v));
}     