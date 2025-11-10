'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import Vector from '../shared/Vector';
import { 
  matrixVectorMultiply, 
  reluVector, 
  generateWeightMatrix, 
  addVectors, 
  layerNorm 
} from '../../lib/transformerLogic';

// Intuition Modal (reuse from encoder)
const IntuitionModal = ({ type, onClose }) => {
  const content = {
    ffn: {
      title: "Decoder Feed-Forward Network",
      explanation: "Same architecture as encoder FFN:",
      points: [
        "Two linear transformations with ReLU",
        "FFN(x) = W2 · ReLU(W1 · x + b1) + b2",
        "Applied to each position independently",
        "Processes information after cross-attention",
        "Identical to encoder FFN (but different weights)"
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

export default function DecoderFFN() {
  const {
    decoderTokens = [],
    decoderAddNormOutputs2 = [],
    currentStep,
    isPlaying,
    animationSpeed,
    config,
    setDecoderFFNOutputs,
    setDecoderFinalOutputs
  } = useVisualizationStore();

  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [hiddenStates, setHiddenStates] = useState([]);
  const [ffOutputs, setFfOutputs] = useState([]);
  const [finalOutputs, setFinalOutputs] = useState([]);
  const [showCalculations, setShowCalculations] = useState(false);

  const containerRef = useRef(null);
  const dModel = config?.dModel || 6;
  const dFF = dModel * 4;

  const [W1] = useState(() => generateWeightMatrix(dFF, dModel));
  const [W2] = useState(() => generateWeightMatrix(dModel, dFF));

  // Calculate FFN outputs
  useEffect(() => {
    if (decoderAddNormOutputs2.length === 0) return;

    const hidden = [];
    const outputs = [];
    const finals = [];

    decoderAddNormOutputs2.forEach((input) => {
      const h = matrixVectorMultiply(W1, input);
      hidden.push(h);
      const hRelu = reluVector(h);
      const output = matrixVectorMultiply(W2, hRelu);
      outputs.push(output);
      
      // Third Add & Norm layer
      const residual = addVectors(input, output);
      const normalized = layerNorm(residual);
      finals.push(normalized);
    });

    setHiddenStates(hidden);
    setFfOutputs(outputs);
    setFinalOutputs(finals);
  }, [decoderAddNormOutputs2, W1, W2]);

  // Animation and completion
  useEffect(() => {
    if (!isPlaying || currentStep !== 'decoder_ffn' || decoderTokens.length === 0) return;

    const timer = setTimeout(() => {
      if (currentTokenIdx < decoderTokens.length - 1) {
        setCurrentTokenIdx(prev => prev + 1);
      } else {
        console.log('Decoder FFN complete. Setting final decoder outputs.');
        setDecoderFinalOutputs(finalOutputs);
      }
    }, 3000 / animationSpeed);

    return () => clearTimeout(timer);
  }, [
    isPlaying, 
    currentStep, 
    currentTokenIdx, 
    decoderTokens.length, 
    animationSpeed, 
    setDecoderFinalOutputs,
    finalOutputs
  ]);

  if (currentStep !== 'decoder_ffn' || ffOutputs.length === 0) return null;

  const currentToken = decoderTokens[currentTokenIdx];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">
            🎯 Decoder Step 5: Feed-Forward Network
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-orange-500/20 px-3 py-1 rounded border border-orange-400/50 text-sm">
            <span className="text-orange-300">Token: {currentTokenIdx + 1}/{decoderTokens.length}</span>
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
        Processing target token "<span className="font-mono font-bold text-pink-300">{currentToken}</span>" 
        through decoder FFN: {dModel} → {dFF} → {dModel}
      </p>

      {/* Main Visualization */}
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-600/50">
        <div className="space-y-8">
          
          {/* Network Architecture Diagram */}
          <div className="bg-slate-800/50 rounded-lg p-6 border border-orange-400/30">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/30 rounded-lg border-2 border-blue-400 flex items-center justify-center mb-2">
                  <div className="text-sm font-bold text-blue-300">{dModel}</div>
                </div>
                <div className="text-xs text-slate-400">Input</div>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-orange-400" />
                <div className="text-xs text-orange-300 mt-1">W1</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500/30 rounded-lg border-2 border-orange-400 flex items-center justify-center mb-2">
                  <div className="text-sm font-bold text-orange-300">{dFF}</div>
                </div>
                <div className="text-xs text-slate-400">Hidden + ReLU</div>
              </div>

              <div className="flex flex-col items-center">
                <ArrowRight className="w-6 h-6 text-green-400" />
                <div className="text-xs text-green-300 mt-1">W2</div>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/30 rounded-lg border-2 border-green-400 flex items-center justify-center mb-2">
                  <div className="text-sm font-bold text-green-300">{dModel}</div>
                </div>
                <div className="text-xs text-slate-400">Output</div>
              </div>
            </div>
          </div>

          {/* FFN Output */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-green-300">FFN Output</h3>
              <button
                onClick={() => setShowIntuition('ffn')}
                className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Zap className="w-3 h-3" />
                Why?
              </button>
            </div>

            <div className="flex items-center justify-center gap-6">
              <Vector 
                values={ffOutputs[currentTokenIdx]} 
                label="FFN(x)"
                color="#10B981"
                showValues={true}
                size="medium"
              />
            </div>
          </div>

          {/* Final Add & Norm */}
          <div className="space-y-4 border-t border-orange-700 pt-6">
            <h3 className="text-lg font-bold text-cyan-300">Add & Norm (Final)</h3>

            <div className="flex items-center justify-center gap-6 flex-wrap">
              <Vector 
                values={decoderAddNormOutputs2[currentTokenIdx]} 
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
                label="Decoder Output"
                color="#EC4899"
                showValues={true}
                size="large"
              />
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center py-4 bg-pink-500/10 rounded-lg border border-pink-400/30">
            <div className="text-sm text-pink-300">
              ✨ Target token "<span className="font-mono font-bold">{currentToken}</span>" 
              fully processed through decoder!
            </div>
            <div className="text-xs text-pink-400 mt-1">
              One complete Decoder block finished! Ready for output projection.
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-orange-500/10 border border-orange-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🧠</div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-300 mb-2">Decoder FFN</h3>
            <div className="text-sm text-orange-200 space-y-2">
              <p>
                Same architecture as encoder FFN, but with <strong>different learned weights</strong>
              </p>
              <p className="text-xs text-orange-300">
                This is the final transformation before output projection to vocabulary
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