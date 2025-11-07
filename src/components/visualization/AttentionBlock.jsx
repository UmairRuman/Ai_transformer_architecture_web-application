'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { useVisualizationStore } from '@/store/visualizationStore';
import { TIMINGS } from '@/lib/constants';
import Vector from '@/components/shared/Vector';
import {
  createQKVMatrices,
  calculateAttentionScores,
  applySoftmax,
  calculateAttentionOutput,
  dotProduct
} from '@/lib/transformerLogic';

// Intuition Modal Component
const IntuitionModal = ({ type, onClose }) => {
  const content = {
    qkv: {
      title: "Why Q, K, V Matrices?",
      explanation: "We create three different 'views' of each word:",
      points: [
        "Query (Q): What am I looking for?",
        "Key (K): What do I contain?",
        "Value (V): What information do I have?",
        "Think of it like a database lookup: Queries search for Keys, and retrieve Values."
      ]
    },
    dotProduct: {
      title: "Why Dot Product (Q · K)?",
      explanation: "The dot product measures similarity between vectors:",
      points: [
        "High dot product = Words are related in meaning",
        "Low dot product = Words are not closely related",
        "This determines which words should 'attend' to each other",
        "Calculation: Q·K = q₀k₀ + q₁k₁ + q₂k₂ + ..."
      ]
    },
    scaling: {
      title: "Why Scale by √d_k?",
      explanation: "Scaling prevents the dot products from growing too large:",
      points: [
        "Larger dimensions → Larger dot products",
        "Large values make softmax produce very sharp distributions",
        "Scaling keeps gradients stable during training",
        "Formula: score / √d_k"
      ]
    },
    softmax: {
      title: "Why Softmax?",
      explanation: "Softmax converts scores into probabilities:",
      points: [
        "Output values sum to 1.0 (100%)",
        "Higher scores become larger percentages",
        "This tells us how much attention to pay to each word",
        "Formula: exp(x_i) / Σ exp(x_j)"
      ]
    },
    weighted: {
      title: "Why Multiply with V?",
      explanation: "We create a new representation using attention weights:",
      points: [
        "Each Value vector is multiplied by its attention score",
        "High attention = More influence on output",
        "Low attention = Less influence on output",
        "Final output = Σ (attention_weight_i × value_i)"
      ]
    }
  };

  const info = content[type] || content.qkv;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={onClose}>
      <div className="bg-slate-800 rounded-xl border-2 border-yellow-400 max-w-2xl w-full p-6 shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">💡</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-yellow-300 mb-2">{info.title}</h3>
            <p className="text-slate-300 mb-4">{info.explanation}</p>
            <ul className="space-y-2">
              {info.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-200">
                  <span className="text-yellow-400 font-bold mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-semibold py-3 rounded-lg transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

// Dot Product Visualization Component
const DotProductViz = ({ vec1, vec2, label1, label2 }) => {
  const result = dotProduct(vec1, vec2);
  
  return (
    <div className="bg-slate-700/30 rounded-lg p-4 border border-orange-400/30">
      <div className="text-xs text-slate-400 mb-2 font-mono">
        {label1} · {label2}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {vec1.map((v1, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <span className="text-xs text-blue-300">({v1.toFixed(2)}</span>
            <span className="text-xs text-slate-500">×</span>
            <span className="text-xs text-orange-300">{vec2[idx].toFixed(2)})</span>
            {idx < vec1.length - 1 && <span className="text-xs text-slate-500">+</span>}
          </div>
        ))}
      </div>
      <div className="mt-2 pt-2 border-t border-slate-600">
        <span className="text-sm text-orange-400 font-bold">= {result.toFixed(3)}</span>
      </div>
    </div>
  );
};

// Main Component
export default function AttentionBlock() {
  const {
    tokens = [],
    finalInputVectors = [],
    currentStep,
    isPlaying,
    setIsPlaying,
    animationSpeed,
    config,
    setAttentionOutputs
  } = useVisualizationStore();

  const [currentPhase, setCurrentPhase] = useState('qkv'); // qkv, scores, softmax, output, complete
  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [showCalculations, setShowCalculations] = useState(false);
  
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  const [qkvMatrices, setQkvMatrices] = useState({ Q: [], K: [], V: [] });
  const [attentionResults, setAttentionResults] = useState([]);

  const dModel = config?.dModel || 6;
  const numHeads = config?.numHeads || 2;
  const dK = dModel / numHeads;

  // Initialize QKV matrices
  useEffect(() => {
    if (!finalInputVectors || finalInputVectors.length === 0 || currentStep !== 'attention') return;
    
    const { Q, K, V } = createQKVMatrices(finalInputVectors, dModel);
    setQkvMatrices({ Q, K, V });
    
    // Pre-calculate all attention results
    const results = Q.map((query, idx) => {
      const scores = calculateAttentionScores(query, K);
      const weights = applySoftmax(scores, dK);
      const output = calculateAttentionOutput(weights, V);
      
      return {
        tokenIdx: idx,
        query,
        scores,
        scaledScores: scores.map(s => s / Math.sqrt(dK)),
        weights,
        output
      };
    });
    
    setAttentionResults(results);
    setCurrentTokenIdx(0);
    setCurrentPhase('qkv');
  }, [finalInputVectors, currentStep, dModel, dK]);

  // Animation logic
  useEffect(() => {
    if (!containerRef.current || attentionResults.length === 0 || !isPlaying) return;

    const phaseDurations = {
      qkv: 2000,
      scores: 2500,
      softmax: 2000,
      output: 1500
    };

    const timer = setTimeout(() => {
      const phases = ['qkv', 'scores', 'softmax', 'output'];
      const currentIdx = phases.indexOf(currentPhase);
      
      if (currentIdx < phases.length - 1) {
        setCurrentPhase(phases[currentIdx + 1]);
      } else {
        // Move to next token or complete
        if (currentTokenIdx < tokens.length - 1) {
          setCurrentTokenIdx(prev => prev + 1);
          setCurrentPhase('qkv');
        } else {
          setCurrentPhase('complete');
          setIsPlaying(false);
        }
      }
    }, phaseDurations[currentPhase] / animationSpeed);

    return () => clearTimeout(timer);
  }, [currentPhase, currentTokenIdx, tokens.length, isPlaying, animationSpeed, attentionResults.length, setIsPlaying]);

  if (currentStep !== 'attention' || attentionResults.length === 0) return null;

  const currentToken = tokens[currentTokenIdx];
  const currentResult = attentionResults[currentTokenIdx];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Step 4: Multi-Head Self-Attention</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 px-3 py-1 rounded border border-purple-400/50 text-sm">
            <span className="text-purple-300">Token: {currentTokenIdx + 1}/{tokens.length}</span>
          </div>
          <button
            onClick={() => setShowCalculations(!showCalculations)}
            className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded text-blue-300 text-sm hover:bg-blue-500/30 transition-colors"
          >
            {showCalculations ? 'Hide' : 'Show'} Math
          </button>
        </div>
      </div>

      <p className="text-slate-300 text-sm max-w-3xl">
        Processing token "<span className="font-mono font-bold text-purple-300">{currentToken}</span>" 
        with {numHeads} attention head{numHeads > 1 ? 's' : ''} (d_model={dModel}, d_k={dK})
      </p>

      {/* Main Visualization */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
        <div className="space-y-8">
          
          {/* Phase 1: Q, K, V Creation */}
          {(currentPhase === 'qkv' || currentPhase === 'scores' || currentPhase === 'softmax' || currentPhase === 'output' || currentPhase === 'complete') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                  <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">1</span>
                  Create Q, K, V Vectors for "{currentToken}"
                </h3>
                <button
                  onClick={() => setShowIntuition('qkv')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Why?
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-center text-xs font-semibold text-blue-300">Query (Q)</div>
                  <Vector 
                    values={currentResult.query} 
                    label={`Q_${currentTokenIdx}`}
                    color="#3B82F6"
                    showValues={true}
                    size="small"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-center text-xs font-semibold text-orange-300">Keys (K)</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {qkvMatrices.K.map((k, idx) => (
                      <Vector 
                        key={idx}
                        values={k} 
                        label={`K_${idx}`}
                        color="#F59E0B"
                        showValues={false}
                        size="small"
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-center text-xs font-semibold text-purple-300">Values (V)</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {qkvMatrices.V.map((v, idx) => (
                      <Vector 
                        key={idx}
                        values={v} 
                        label={`V_${idx}`}
                        color="#A855F7"
                        showValues={false}
                        size="small"
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase 2: Attention Scores */}
          {(currentPhase === 'scores' || currentPhase === 'softmax' || currentPhase === 'output' || currentPhase === 'complete') && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-orange-300 flex items-center gap-2">
                  <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">2</span>
                  Calculate Attention Scores (Q · K)
                </h3>
                <button
                  onClick={() => setShowIntuition('dotProduct')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Why?
                </button>
              </div>

              {showCalculations ? (
                <div className="grid grid-cols-1 gap-3">
                  {tokens.map((token, idx) => (
                    <DotProductViz
                      key={idx}
                      vec1={currentResult.query}
                      vec2={qkvMatrices.K[idx]}
                      label1={`Q_${currentTokenIdx}`}
                      label2={`K_${idx}(${token})`}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {tokens.map((token, idx) => (
                    <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border-2 border-orange-400/50 min-w-[120px]">
                      <div className="text-xs text-slate-400 mb-1 text-center">vs "{token}"</div>
                      <div className="text-2xl font-mono font-bold text-orange-300 text-center">
                        {currentResult.scores[idx]?.toFixed(3)}
                      </div>
                      <div className="text-xs text-slate-500 text-center mt-1">
                        ÷ √{dK.toFixed(0)} = {currentResult.scaledScores[idx]?.toFixed(3)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Phase 3: Softmax */}
          {(currentPhase === 'softmax' || currentPhase === 'output' || currentPhase === 'complete') && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-green-300 flex items-center gap-2">
                  <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">3</span>
                  Apply Softmax (Attention Weights)
                </h3>
                <button
                  onClick={() => setShowIntuition('softmax')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Why?
                </button>
              </div>

              <div className="flex items-center justify-center gap-4 flex-wrap">
                {tokens.map((token, idx) => {
                  const percentage = (currentResult.weights[idx] || 0) * 100;
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="bg-slate-700/50 rounded-lg p-4 border-2 border-green-400/50 min-w-[100px]">
                        <div className="text-xs text-slate-400 mb-1 text-center">"{token}"</div>
                        <div className="text-xl font-mono font-bold text-green-300 text-center">
                          {percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Phase 4: Weighted Sum Output */}
          {(currentPhase === 'output' || currentPhase === 'complete') && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                  <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">4</span>
                  Compute Weighted Sum (Attention Output)
                </h3>
                <button
                  onClick={() => setShowIntuition('weighted')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Why?
                </button>
              </div>

              <div className="flex flex-col items-center gap-4">
                {showCalculations && (
                  <div className="text-sm text-slate-300 font-mono bg-slate-800/50 rounded-lg p-4 w-full">
                    <div className="mb-2 text-purple-300">Output = Σ (weight_i × V_i)</div>
                    {tokens.map((token, idx) => (
                      <div key={idx} className="text-xs text-slate-400 ml-4">
                        + {(currentResult.weights[idx] * 100).toFixed(1)}% × V_{idx}({token})
                      </div>
                    ))}
                  </div>
                )}
                
                <Vector 
                  values={currentResult.output} 
                  label={`Attention(${currentToken})`}
                  color="#10B981"
                  showValues={true}
                  size="large"
                />
                
                <div className="text-center text-sm text-green-300 bg-green-500/10 rounded-lg px-4 py-2">
                  ✨ This vector now contains context from all {tokens.length} words!
                </div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {currentPhase !== 'complete' && (
            <div className="flex items-center justify-center gap-2 pt-4">
              {['qkv', 'scores', 'softmax', 'output'].map((phase, idx) => (
                <div key={phase} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full transition-colors ${
                    currentPhase === phase ? 'bg-purple-500 animate-pulse' :
                    ['qkv', 'scores', 'softmax', 'output'].indexOf(currentPhase) > idx ? 'bg-green-500' :
                    'bg-slate-600'
                  }`} />
                  {idx < 3 && <ChevronRight className="w-4 h-4 text-slate-500" />}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formula Reference */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🧮</div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-300 mb-2">Attention Formula</h3>
            <div className="bg-slate-800/50 rounded-lg p-3 font-mono text-sm text-slate-200">
              <div>Attention(Q, K, V) = softmax(Q·K<sup>T</sup> / √d_k) · V</div>
              <div className="text-xs text-slate-400 mt-2 space-y-1">
                <div>• d_k = {dK.toFixed(0)} (dimension per head)</div>
                <div>• Each token attends to all {tokens.length} tokens</div>
                <div>• Output dimension = {dModel}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Completion */}
      {currentPhase === 'complete' && (
        <div className="text-center py-8">
          <div className="inline-flex flex-col items-center gap-4 bg-green-500/20 rounded-xl px-8 py-6 border-2 border-green-400 animate-bounce-in">
            <div className="text-5xl">🎉</div>
            <div className="text-2xl font-bold text-green-300">
              All Tokens Processed!
            </div>
            <p className="text-green-200 text-sm max-w-md">
              Self-attention complete for all {tokens.length} tokens. Each word now has 
              a context-aware representation incorporating information from the entire sequence.
            </p>
          </div>
        </div>
      )}

      {/* Intuition Modal */}
      {showIntuition && (
        <IntuitionModal type={showIntuition} onClose={() => setShowIntuition('')} />
      )}
    </div>
  );
}