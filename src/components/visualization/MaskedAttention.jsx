'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';
import { useVisualizationStore } from '@/store/visualizationStore';
import { TIMINGS } from '@/lib/constants';
import Vector from '@/components/shared/Vector';
import {
  createQKVMatrices,
  calculateAttentionScores,
  applySoftmax,
  calculateAttentionOutput
} from '@/lib/transformerLogic';

// Intuition Modal
const IntuitionModal = ({ type, onClose }) => {
  const content = {
    masking: {
      title: "Why Mask Future Positions?",
      explanation: "Masking prevents the decoder from 'cheating' during training:",
      points: [
        "When predicting word 2, model shouldn't see words 3, 4, 5",
        "This simulates real inference where future doesn't exist yet",
        "Makes training match actual generation behavior",
        "Triangular mask: position i can only see positions ≤ i",
        "Implemented by setting future scores to -∞ before softmax"
      ]
    },
    autoregressive: {
      title: "What is Autoregressive Generation?",
      explanation: "Each token generation depends only on previous tokens:",
      points: [
        "Token 1 sees: <START> only",
        "Token 2 sees: <START>, Token 1",
        "Token 3 sees: <START>, Token 1, Token 2",
        "This creates the left-to-right generation we see in ChatGPT",
        "Masking during training teaches this behavior"
      ]
    }
  };

  const info = content[type] || content.masking;

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

// Attention Matrix Visualization
const AttentionMatrix = ({ tokens, currentTokenIdx, attentionWeights, showMask }) => {
  return (
    <div className="bg-slate-800/50 rounded-lg p-4 overflow-x-auto">
      <div className="text-sm text-slate-300 mb-3 text-center font-semibold">
        Attention Matrix {showMask && '(with Masking)'}
      </div>
      <table className="mx-auto border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-xs text-slate-500"></th>
            {tokens.map((token, idx) => (
              <th key={idx} className="p-2 text-xs text-slate-300 font-mono">
                {token}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tokens.map((rowToken, rowIdx) => (
            <tr key={rowIdx}>
              <td className="p-2 text-xs text-slate-300 font-mono font-semibold">
                {rowToken}
              </td>
              {tokens.map((colToken, colIdx) => {
                const isMasked = showMask && colIdx > rowIdx;
                const isCurrentAttention = rowIdx === currentTokenIdx;
                const weight = isCurrentAttention ? (attentionWeights[colIdx] || 0) : 0;
                const percentage = weight * 100;
                
                return (
                  <td
                    key={colIdx}
                    className={`
                      p-2 text-center text-xs font-mono relative
                      ${isMasked 
                        ? 'bg-red-500/20 text-red-400' 
                        : isCurrentAttention
                        ? 'bg-green-500/20 text-green-300 font-bold'
                        : 'bg-slate-700/30 text-slate-500'
                      }
                    `}
                  >
                    {isMasked ? (
                      <div className="flex items-center justify-center">
                        <EyeOff className="w-3 h-3" />
                      </div>
                    ) : isCurrentAttention ? (
                      <div>
                        {percentage.toFixed(0)}%
                      </div>
                    ) : (
                      <div className="text-slate-600">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className="mt-3 flex items-center justify-center gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500/30 rounded" />
          <span className="text-slate-400">Current token attention</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500/30 rounded" />
          <span className="text-slate-400">Masked (future)</span>
        </div>
      </div>
    </div>
  );
};

export default function MaskedAttention() {
  const {
    targetTokens = [],
    targetFinalInputVectors = [],
    currentStep,
    isPlaying,
    animationSpeed,
    config,
    setMaskedAttentionOutputs,
    setCurrentStep
  } = useVisualizationStore();

  const [currentPhase, setCurrentPhase] = useState('qkv');
  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [showCalculations, setShowCalculations] = useState(false);
  const [showMaskVisualization, setShowMaskVisualization] = useState(true);
  
  const containerRef = useRef(null);
  const [qkvMatrices, setQkvMatrices] = useState({ Q: [], K: [], V: [] });
  const [attentionResults, setAttentionResults] = useState([]);

  const dModel = config?.dModel || 6;
  const numHeads = config?.numHeads || 2;
  const dK = dModel / numHeads;

  // Apply masking to attention scores
  const applyMask = (scores, currentPos) => {
    return scores.map((score, idx) => 
      idx > currentPos ? -Infinity : score
    );
  };

  // Initialize QKV and calculate masked attention
  useEffect(() => {
    if (!targetFinalInputVectors || targetFinalInputVectors.length === 0 || currentStep !== 'masked_attention') return;
    
    const { Q, K, V } = createQKVMatrices(targetFinalInputVectors, dModel);
    setQkvMatrices({ Q, K, V });
    
    // Calculate attention with masking for each position
    const results = Q.map((query, idx) => {
      const scores = calculateAttentionScores(query, K);
      
      // CRITICAL: Apply causal mask
      const maskedScores = applyMask(scores, idx);
      
      const weights = applySoftmax(maskedScores, dK);
      const output = calculateAttentionOutput(weights, V);
      
      return {
        tokenIdx: idx,
        query,
        scores,
        maskedScores,
        scaledScores: maskedScores.map(s => s === -Infinity ? s : s / Math.sqrt(dK)),
        weights,
        output
      };
    });
    
    setAttentionResults(results);
    setCurrentTokenIdx(0);
    setCurrentPhase('qkv');
  }, [targetFinalInputVectors, currentStep, dModel, dK]);

  // Save outputs when complete
  useEffect(() => {
    if (currentPhase === 'complete' && attentionResults.length > 0) {
      console.log('Masked Attention complete. Setting outputs.');
      const finalOutputs = attentionResults.map(r => r.output);
      setMaskedAttentionOutputs(finalOutputs);
      
      // Auto-advance to cross attention
      setTimeout(() => {
        setCurrentStep('cross_attention');
      }, 1000);
    }
  }, [currentPhase, attentionResults, setMaskedAttentionOutputs, setCurrentStep]);

  // Animation logic
  useEffect(() => {
    if (!isPlaying || currentStep !== 'masked_attention' || attentionResults.length === 0) return;

    const phaseDurations = {
      qkv: 2000,
      scores: 2500,
      softmax: 2000,
      output: 1500
    };

    const timer = setTimeout(() => {
      if (!useVisualizationStore.getState().isPlaying) return;

      const phases = ['qkv', 'scores', 'softmax', 'output'];
      const currentPhaseIndex = phases.indexOf(currentPhase);

      if (currentPhaseIndex < phases.length - 1) {
        setCurrentPhase(phases[currentPhaseIndex + 1]);
      } else {
        if (currentTokenIdx < targetTokens.length - 1) {
          setCurrentTokenIdx(prev => prev + 1);
          setCurrentPhase('qkv');
        } else {
          setCurrentPhase('complete');
        }
      }
    }, phaseDurations[currentPhase] / animationSpeed);

    return () => clearTimeout(timer);
  }, [currentStep, currentPhase, currentTokenIdx, isPlaying, animationSpeed, attentionResults, targetTokens.length]);

  if (currentStep !== 'masked_attention' || attentionResults.length === 0) return null;

  const currentToken = targetTokens[currentTokenIdx];
  const currentResult = attentionResults[currentTokenIdx];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Decoder Step 1: Masked Self-Attention</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-red-500/20 px-3 py-1 rounded border border-red-400/50 text-sm">
            <span className="text-red-300">Token: {currentTokenIdx + 1}/{targetTokens.length}</span>
          </div>
          <button
            onClick={() => setShowMaskVisualization(!showMaskVisualization)}
            className="px-3 py-1 bg-orange-500/20 border border-orange-400/50 rounded text-orange-300 text-sm hover:bg-orange-500/30 transition-colors flex items-center gap-1"
          >
            {showMaskVisualization ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            Mask
          </button>
          <button
            onClick={() => setShowCalculations(!showCalculations)}
            className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded text-blue-300 text-sm hover:bg-blue-500/30 transition-colors"
          >
            {showCalculations ? 'Hide' : 'Show'} Math
          </button>
        </div>
      </div>

      {/* Key Concept Banner */}
      <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-l-4 border-red-400 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🚫</div>
          <div>
            <div className="font-bold text-red-300 text-lg mb-1">Causal Masking Active</div>
            <p className="text-red-200 text-sm">
              Token "<span className="font-mono font-bold">{currentToken}</span>" at position {currentTokenIdx} can only attend to positions 0-{currentTokenIdx}. 
              Future tokens ({currentTokenIdx + 1}-{targetTokens.length - 1}) are <strong>masked out</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
        <div className="space-y-8">
          
          {/* Attention Matrix Visualization */}
          {showMaskVisualization && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-orange-300">Masked Attention Pattern</h3>
                <button
                  onClick={() => setShowIntuition('masking')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Why Mask?
                </button>
              </div>
              <AttentionMatrix 
                tokens={targetTokens}
                currentTokenIdx={currentTokenIdx}
                attentionWeights={currentResult.weights}
                showMask={true}
              />
            </div>
          )}

          {/* Q, K, V Vectors */}
          {(currentPhase === 'qkv' || currentPhase === 'scores' || currentPhase === 'softmax' || currentPhase === 'output') && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-blue-300">Query, Key, Value Vectors</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-center text-xs font-semibold text-blue-300">Query</div>
                  <Vector 
                    values={currentResult.query} 
                    label={`Q_${currentTokenIdx}`}
                    color="#3B82F6"
                    showValues={false}
                    size="small"
                  />
                </div>
                <div className="space-y-2">
                  <div className="text-center text-xs font-semibold text-orange-300">Keys (visible only)</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {qkvMatrices.K.slice(0, currentTokenIdx + 1).map((k, idx) => (
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
                  {currentTokenIdx < targetTokens.length - 1 && (
                    <div className="text-center text-xs text-red-400 mt-2">
                      🚫 Future keys masked ({targetTokens.length - currentTokenIdx - 1} hidden)
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="text-center text-xs font-semibold text-purple-300">Values (visible only)</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {qkvMatrices.V.slice(0, currentTokenIdx + 1).map((v, idx) => (
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

          {/* Attention Scores with Masking */}
          {(currentPhase === 'scores' || currentPhase === 'softmax' || currentPhase === 'output') && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-orange-300">Attention Scores (Before Masking → After Masking)</h3>
                <button
                  onClick={() => setShowIntuition('autoregressive')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Why?
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Masking */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-600">
                  <div className="text-sm font-semibold text-slate-300 mb-3 text-center">Before Masking</div>
                  <div className="space-y-2">
                    {targetTokens.map((token, idx) => (
                      <div key={idx} className={`
                        flex items-center justify-between p-2 rounded
                        ${idx > currentTokenIdx ? 'bg-red-500/10 border border-red-500/30' : 'bg-slate-700/30'}
                      `}>
                        <span className="text-sm text-slate-300 font-mono">{token}</span>
                        <span className="text-sm font-mono text-orange-300">
                          {currentResult.scores[idx]?.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* After Masking */}
                <div className="bg-slate-800/50 rounded-lg p-4 border border-red-600">
                  <div className="text-sm font-semibold text-red-300 mb-3 text-center">After Masking</div>
                  <div className="space-y-2">
                    {targetTokens.map((token, idx) => (
                      <div key={idx} className={`
                        flex items-center justify-between p-2 rounded
                        ${idx > currentTokenIdx ? 'bg-red-500/20 border border-red-500/50' : 'bg-green-500/10 border border-green-500/30'}
                      `}>
                        <span className="text-sm text-slate-300 font-mono">{token}</span>
                        <span className={`text-sm font-mono ${idx > currentTokenIdx ? 'text-red-400' : 'text-green-300'}`}>
                          {idx > currentTokenIdx ? '-∞' : currentResult.maskedScores[idx]?.toFixed(3)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Softmax with Visible Positions Only */}
          {(currentPhase === 'softmax' || currentPhase === 'output') && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-green-300">Softmax (Only Over Visible Positions)</h3>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {targetTokens.slice(0, currentTokenIdx + 1).map((token, idx) => {
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
              <div className="text-center text-xs text-green-400">
                ✓ Probabilities sum to 100% across visible positions only
              </div>
            </div>
          )}

          {/* Output */}
          {currentPhase === 'output' && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-purple-300">Masked Attention Output</h3>
              <div className="flex flex-col items-center gap-4">
                <Vector 
                  values={currentResult.output} 
                  label={`MaskedAttn(${currentToken})`}
                  color="#10B981"
                  showValues={true}
                  size="large"
                />
                <div className="text-center text-sm text-green-300 bg-green-500/10 rounded-lg px-4 py-2">
                  ✨ Context from positions 0-{currentTokenIdx} only!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎭</div>
          <div className="flex-1">
            <h3 className="font-bold text-red-300 mb-2">Masked Self-Attention in Decoder</h3>
            <div className="text-sm text-red-200 space-y-2">
              <p>
                Unlike encoder self-attention, decoder uses <strong>causal masking</strong> to prevent seeing future tokens
              </p>
              <div className="bg-slate-800/50 rounded px-3 py-2 font-mono text-xs">
                <div>mask[i][j] = -∞ if j &gt; i else 0</div>
              </div>
              <p className="text-xs text-red-300">
                This ensures autoregressive property: each position depends only on previous positions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Intuition Modal */}
      {showIntuition && (
        <IntuitionModal type={showIntuition} onClose={() => setShowIntuition('')} />
      )}
    </div>
  );
}