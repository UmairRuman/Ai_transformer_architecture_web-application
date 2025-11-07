'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Plus, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { useVisualizationStore } from '@/store/visualizationStore';
import { TIMINGS } from '@/lib/constants';
import Vector from '@/components/shared/Vector';
import { addVectors, layerNorm } from '@/lib/transformerLogic';

// Intuition Modal
const IntuitionModal = ({ type, onClose }) => {
  const content = {
    residual: {
      title: "Why Residual Connection (Add)?",
      explanation: "Residual connections help the network learn better:",
      points: [
        "Original Input + Attention Output = New Representation",
        "Prevents 'forgetting' the original information",
        "Makes training deep networks much easier",
        "Helps gradients flow during backpropagation",
        "Like keeping a 'backup' of the original data"
      ]
    },
    layernorm: {
      title: "Why Layer Normalization?",
      explanation: "Normalization keeps values stable and training smooth:",
      points: [
        "Standardizes values to have mean=0, std=1",
        "Prevents exploding or vanishing values",
        "Makes training faster and more stable",
        "Works independently for each token",
        "Formula: (x - mean) / sqrt(variance + ε)"
      ]
    }
  };

  const info = content[type] || content.residual;

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

export default function AddNorm() {
  const {
    tokens = [],
    finalInputVectors = [],
    currentStep,
    isPlaying,
    animationSpeed,
    config,
    hasStarted,
    attentionOutputs = [],
    setNormalizedOutputs
  } = useVisualizationStore();

  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [residualOutputs, setResidualOutputs] = useState([]);
  const [normalizedOutputs, setLocalNormalizedOutputs] = useState([]);
  const [showCalculations, setShowCalculations] = useState(false);

  const containerRef = useRef(null);
  const dModel = config?.dModel || 6;

  // Calculate residual and normalized outputs
  useEffect(() => {
    if (!finalInputVectors || finalInputVectors.length === 0 || !attentionOutputs || attentionOutputs.length === 0) return;

    // Residual: original input + attention output
    const residuals = finalInputVectors.map((input, idx) => 
      addVectors(input, attentionOutputs[idx] || input)
    );
    setResidualOutputs(residuals);

    // Layer Norm
    const normalized = residuals.map(vec => layerNorm(vec));
    setLocalNormalizedOutputs(normalized);
    setNormalizedOutputs(normalized);
  }, [finalInputVectors, attentionOutputs, setNormalizedOutputs]);

  // Animation progression
  useEffect(() => {
    if (!isPlaying || currentStep !== 'addnorm') return;

    const timer = setTimeout(() => {
      if (currentTokenIdx < tokens.length - 1) {
        setCurrentTokenIdx(prev => prev + 1);
      }
    }, 3000 / animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentTokenIdx, tokens.length, animationSpeed, currentStep]);

  if (currentStep !== 'addnorm' || residualOutputs.length === 0) return null;

  const currentToken = tokens[currentTokenIdx];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Step 5: Add & Norm</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/20 px-3 py-1 rounded border border-cyan-400/50 text-sm">
            <span className="text-cyan-300">Token: {currentTokenIdx + 1}/{tokens.length}</span>
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
        Processing token "<span className="font-mono font-bold text-cyan-300">{currentToken}</span>" 
        through residual connection and layer normalization to stabilize the network.
      </p>

      {/* Main Visualization */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
        <div className="space-y-8">
          
          {/* Phase 1: Residual Connection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-blue-300 flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">1</span>
                Residual Connection (Add)
              </h3>
              <button
                onClick={() => setShowIntuition('residual')}
                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Why?
              </button>
            </div>

            {/* Visual Addition */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              {/* Original Input */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-slate-400">Original Input</div>
                <Vector 
                  values={finalInputVectors[currentTokenIdx]} 
                  label="Input"
                  color="#6B7280"
                  showValues={showCalculations}
                  size="small"
                />
              </div>

              {/* Plus Sign */}
              <div className="flex flex-col items-center gap-2">
                <Plus className="w-8 h-8 text-green-400" />
                <span className="text-xs text-green-300 font-semibold">Residual</span>
              </div>

              {/* Attention Output */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-purple-400">Attention Output</div>
                <Vector 
                  values={attentionOutputs[currentTokenIdx] || finalInputVectors[currentTokenIdx]} 
                  label="Attn"
                  color="#A855F7"
                  showValues={showCalculations}
                  size="small"
                />
              </div>

              {/* Equals */}
              <div className="text-4xl text-slate-500 font-bold">=</div>

              {/* Residual Output */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-cyan-400">After Addition</div>
                <Vector 
                  values={residualOutputs[currentTokenIdx]} 
                  label="Sum"
                  color="#06B6D4"
                  showValues={true}
                  size="medium"
                />
              </div>
            </div>

            {showCalculations && (
              <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-xs">
                <div className="text-blue-300 mb-2">Element-wise Addition:</div>
                <div className="space-y-1 text-slate-400">
                  {finalInputVectors[currentTokenIdx].map((val, idx) => (
                    <div key={idx}>
                      [{idx}]: {val.toFixed(3)} + {(attentionOutputs[currentTokenIdx]?.[idx] || val).toFixed(3)} 
                      = {residualOutputs[currentTokenIdx][idx].toFixed(3)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Phase 2: Layer Normalization */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-green-300 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">2</span>
                Layer Normalization
              </h3>
              <button
                onClick={() => setShowIntuition('layernorm')}
                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Why?
              </button>
            </div>

            <div className="flex items-center justify-center gap-6">
              {/* Before Norm */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-cyan-400">Before Norm</div>
                <Vector 
                  values={residualOutputs[currentTokenIdx]} 
                  label="Residual"
                  color="#06B6D4"
                  showValues={false}
                  size="small"
                />
                {showCalculations && (
                  <div className="text-xs text-center text-slate-400">
                    <div>μ = {(residualOutputs[currentTokenIdx].reduce((a, b) => a + b, 0) / dModel).toFixed(3)}</div>
                    <div>σ = {Math.sqrt(residualOutputs[currentTokenIdx].reduce((sum, val) => {
                      const mean = residualOutputs[currentTokenIdx].reduce((a, b) => a + b, 0) / dModel;
                      return sum + Math.pow(val - mean, 2);
                    }, 0) / dModel).toFixed(3)}</div>
                  </div>
                )}
              </div>

              {/* Arrow with Formula */}
              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div className="text-xs text-green-300 font-mono bg-slate-800/50 px-2 py-1 rounded">
                  (x - μ) / σ
                </div>
              </div>

              {/* After Norm */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-green-400">After Norm</div>
                <Vector 
                  values={normalizedOutputs[currentTokenIdx]} 
                  label="Normalized"
                  color="#10B981"
                  showValues={true}
                  size="large"
                />
                {showCalculations && (
                  <div className="text-xs text-center text-slate-400">
                    <div>New μ ≈ 0.00</div>
                    <div>New σ ≈ 1.00</div>
                  </div>
                )}
              </div>
            </div>

            {showCalculations && (
              <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-xs">
                <div className="text-green-300 mb-2">Normalization Process:</div>
                <div className="space-y-2 text-slate-400">
                  <div>1. Calculate mean (μ) = Σx / n</div>
                  <div>2. Calculate variance (σ²) = Σ(x - μ)² / n</div>
                  <div>3. Normalize: x_norm = (x - μ) / √(σ² + ε)</div>
                  <div className="text-xs text-slate-500 mt-2">ε = 1e-5 (prevents division by zero)</div>
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="text-center py-4 bg-green-500/10 rounded-lg border border-green-400/30">
            <div className="text-sm text-green-300">
              ✨ Token "<span className="font-mono font-bold">{currentToken}</span>" successfully 
              processed through Add & Norm!
            </div>
            <div className="text-xs text-green-400 mt-1">
              Output is now stable and ready for the Feed-Forward Network
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔗</div>
          <div className="flex-1">
            <h3 className="font-bold text-cyan-300 mb-2">Add & Norm in Transformers</h3>
            <div className="text-sm text-cyan-200 space-y-2">
              <p>
                <strong>Residual Connection:</strong> Adds the original input back to prevent information loss
              </p>
              <p>
                <strong>Layer Normalization:</strong> Standardizes values to speed up training and improve stability
              </p>
              <p className="text-xs text-cyan-300 mt-2">
                This pattern appears after every major component (Attention, Feed-Forward) in the Transformer
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