'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { useVisualizationStore } from '../../store/visualizationStore';
import { TIMINGS } from '../shared/Vector';
import Vector from '../shared/Vector';
import { matrixVectorMultiply, reluVector, generateWeightMatrix, addVectors, layerNorm } from '../../lib/transformerLogic';

// Intuition Modal
const IntuitionModal = ({ type, onClose }) => {
  const content = {
    expansion: {
      title: "Why Expand Dimension?",
      explanation: "The Feed-Forward Network expands then contracts:",
      points: [
        "Input: d_model dimensions (e.g., 6)",
        "Hidden: d_ff dimensions (typically 4× larger, e.g., 24)",
        "Output: back to d_model (6)",
        "Allows network to learn complex non-linear transformations",
        "Like giving the network more 'thinking space'"
      ]
    },
    relu: {
      title: "Why ReLU Activation?",
      explanation: "ReLU introduces non-linearity:",
      points: [
        "Formula: ReLU(x) = max(0, x)",
        "Negative values become 0, positive stay unchanged",
        "Makes network capable of learning complex patterns",
        "Without activation, network would be just linear algebra",
        "Fast to compute and works well in practice"
      ]
    },
    ffn: {
      title: "What is Feed-Forward Network?",
      explanation: "A two-layer neural network applied to each position:",
      points: [
        "Two linear transformations with ReLU in between",
        "FFN(x) = W2 · ReLU(W1 · x + b1) + b2",
        "Applied identically and independently to each token",
        "Processes information after attention",
        "Adds capacity to learn complex representations"
      ]
    }
  };

  const info = content[type] || content.ffn;

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

export default function FeedForward() {
  const {
    tokens = [],
     addNormOutputs1: normalizedOutputs = [], 
    currentStep,
    isPlaying,
    animationSpeed,
    config,
    hasStarted,
    setFeedForwardOutputs , 
    setEncoderOutputs 
  } = useVisualizationStore();

 const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [hiddenStates, setHiddenStates] = useState([]);
  const [ffOutputs, setFfOutputs] = useState([]);
  const [finalOutputs, setFinalOutputs] = useState([]); // Renamed for clarity
  const [showCalculations, setShowCalculations] = useState(false);

  const containerRef = useRef(null);
  const dModel = config?.dModel || 6;
  const dFF = dModel * 4;

  const [W1] = useState(() => generateWeightMatrix(dFF, dModel));
  const [W2] = useState(() => generateWeightMatrix(dModel, dFF));

  // --- FIX #3: Calculation Only ---
  // This effect now ONLY calculates and sets LOCAL state.
  useEffect(() => {
    if (normalizedOutputs.length === 0) return;

    const hidden = [];
    const outputs = [];
    const finals = [];

    normalizedOutputs.forEach((input) => {
      const h = matrixVectorMultiply(W1, input);
      hidden.push(h);
      const hRelu = reluVector(h);
      const output = matrixVectorMultiply(W2, hRelu);
      outputs.push(output);
      
      // The second Add & Norm layer
      const residual = addVectors(input, output);
      const normalized = layerNorm(residual);
      finals.push(normalized);
    });

    setHiddenStates(hidden);
    setFfOutputs(outputs);
    setFinalOutputs(finals);
    
    // We REMOVED the call to the global setter from here.

  }, [normalizedOutputs, W1, W2]);


  // --- FIX #4: Animation and Completion Signal ---
  // This effect now controls the animation AND signals completion at the end.
  useEffect(() => {
    if (!isPlaying || currentStep !== 'feedforward' || tokens.length === 0) return;

    const timer = setTimeout(() => {
      if (currentTokenIdx < tokens.length - 1) {
        setCurrentTokenIdx(prev => prev + 1);
      } else {
        console.log('✅ FeedForward complete. Encoder finished! Moving to Decoder...');
        setEncoderOutputs(finalOutputs);
        
        // ✨ AUTO-ADVANCE: Move to Decoder phase (encoder is complete!)
        setTimeout(() => {
          const { setCurrentStep, setIsPlaying } = useVisualizationStore.getState();
          setCurrentStep('decoder_start');
          setIsPlaying(true);
        }, 2000); // Longer delay to celebrate encoder completion
      }
    }, 3000 / animationSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, currentTokenIdx, tokens.length, animationSpeed, setEncoderOutputs, finalOutputs]);

  if (currentStep !== 'feedforward' || ffOutputs.length === 0) return null;

  const currentToken = tokens[currentTokenIdx];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Step 6: Feed-Forward Network</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/20 px-3 py-1 rounded border border-orange-400/50 text-sm">
            <span className="text-orange-300">Token: {currentTokenIdx + 1}/{tokens.length}</span>
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
        Processing token "<span className="font-mono font-bold text-orange-300">{currentToken}</span>" 
        through a two-layer neural network: {dModel} → {dFF} → {dModel}
      </p>

      {/* Main Visualization */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
        <div className="space-y-8">
          
          {/* Network Architecture Diagram */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-orange-400/30">
            <div className="flex items-center justify-center gap-8">
              {/* Input */}
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/30 rounded-lg border-2 border-blue-400 flex items-center justify-center mb-2">
                  <div className="text-sm font-bold text-blue-300">{dModel}</div>
                </div>
                <div className="text-xs text-slate-400">Input</div>
              </div>

              {/* Arrow 1 */}
              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-orange-400" />
                <div className="text-xs text-orange-300 mt-1">W1</div>
              </div>

              {/* Hidden */}
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/30 rounded-lg border-2 border-orange-400 flex items-center justify-center mb-2">
                  <div className="text-sm font-bold text-orange-300">{dFF}</div>
                </div>
                <div className="text-xs text-slate-400">Hidden + ReLU</div>
              </div>

              {/* Arrow 2 */}
              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-green-400" />
                <div className="text-xs text-green-300 mt-1">W2</div>
              </div>

              {/* Output */}
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/30 rounded-lg border-2 border-green-400 flex items-center justify-center mb-2">
                  <div className="text-sm font-bold text-green-300">{dModel}</div>
                </div>
                <div className="text-xs text-slate-400">Output</div>
              </div>
            </div>
          </div>

          {/* Phase 1: First Linear + ReLU */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-orange-300 flex items-center gap-2">
                <span className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs">1</span>
                Expand & Activate: W1 · x + ReLU
              </h3>
              <button
                onClick={() => setShowIntuition('expansion')}
                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Why?
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Input */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-blue-400">Input ({dModel}D)</div>
                <Vector 
                  values={normalizedOutputs[currentTokenIdx]} 
                  label="x"
                  color="#3B82F6"
                  showValues={false}
                  size="small"
                />
              </div>

              {/* Hidden (before ReLU) */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-orange-400">Hidden ({dFF}D)</div>
                <div className="bg-slate-800/50 rounded p-2 text-center">
                  <div className="text-xs text-slate-400 mb-1">Expanded to {dFF} dims</div>
                  <div className="text-lg font-mono text-orange-300">
                    [{hiddenStates[currentTokenIdx]?.slice(0, 3).map(v => v.toFixed(1)).join(', ')}...]
                  </div>
                </div>
              </div>

              {/* After ReLU */}
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-orange-400">After ReLU</div>
                <div className="bg-slate-800/50 rounded p-2">
                  <div className="text-xs text-slate-400 mb-1">Negatives → 0</div>
                  <div className="text-xs text-orange-200 space-y-1">
                    {hiddenStates[currentTokenIdx]?.slice(0, 4).map((v, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{v.toFixed(2)}</span>
                        <span>→</span>
                        <span className={v < 0 ? 'text-red-400' : 'text-green-400'}>
                          {Math.max(0, v).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {hiddenStates[currentTokenIdx]?.length > 4 && <div>...</div>}
                  </div>
                </div>
              </div>
            </div>

            {showCalculations && (
              <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-xs">
                <div className="text-orange-300 mb-2">Matrix Multiplication:</div>
                <div className="text-slate-400">
                  W1 ({dFF}×{dModel}) × x ({dModel}×1) = h ({dFF}×1)
                </div>
                <div className="text-slate-400 mt-2">
                  ReLU: h[i] = max(0, h[i]) for all i
                </div>
              </div>
            )}
          </div>

          {/* Phase 2: Second Linear */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-green-300 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">2</span>
                Contract: W2 · ReLU(h)
              </h3>
              <button
                onClick={() => setShowIntuition('ffn')}
                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Why?
              </button>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-green-400">FFN Output</div>
                <Vector 
                  values={ffOutputs[currentTokenIdx]} 
                  label="FFN(x)"
                  color="#10B981"
                  showValues={true}
                  size="medium"
                />
              </div>
            </div>

            {showCalculations && (
              <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-xs">
                <div className="text-green-300 mb-2">Output Calculation:</div>
                <div className="text-slate-400">
                  W2 ({dModel}×{dFF}) × ReLU(h) ({dFF}×1) = output ({dModel}×1)
                </div>
              </div>
            )}
          </div>

          {/* Phase 3: Residual + Norm */}
          <div className="space-y-4 border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
              <span className="w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs">3</span>
              Add & Norm (Again)
            </h3>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Vector 
                values={normalizedOutputs[currentTokenIdx]} 
                label="Input"
                color="#6B7280"
                showValues={false}
                size="small"
              />
              <div className="text-2xl text-green-400">+</div>
              <Vector 
                values={ffOutputs[currentTokenIdx]} 
                label="FFN"
                color="#10B981"
                showValues={false}
                size="small"
              />
              <div className="text-2xl text-slate-500">=</div>
              <Vector 
                values={finalOutputs[currentTokenIdx]} 
                label="Final"
                color="#06B6D4"
                showValues={true}
                size="large"
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center py-4 bg-green-500/10 rounded-lg border border-green-400/30">
            <div className="text-sm text-green-300">
              ✨ Token "<span className="font-mono font-bold">{currentToken}</span>" processed through Feed-Forward Network!
            </div>
            <div className="text-xs text-green-400 mt-1">
              One complete Encoder block finished!
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🧠</div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-300 mb-2">Feed-Forward Network Purpose</h3>
            <div className="text-sm text-orange-200 space-y-2">
              <p>
                After attention gathers context, the FFN processes each position independently 
                to learn complex transformations
              </p>
              <p className="font-mono text-xs bg-slate-800/50 p-2 rounded">
                FFN(x) = W2 · ReLU(W1 · x + b1) + b2
              </p>
              <p className="text-xs text-orange-300">
                This adds significant learning capacity without increasing sequence length
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