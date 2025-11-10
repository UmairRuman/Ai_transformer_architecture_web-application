'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, Plus, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { useVisualizationStore } from '../../store/visualizationStore';
import Vector from '../shared/Vector';
import { addVectors, layerNorm } from '../../lib/transformerLogic';

// Intuition Modal (same as encoder)
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
        "Formula: (x - μ) / sqrt(variance + ε)"
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

export default function DecoderAddNorm({ afterCrossAttention = false }) {
  const {
    decoderTokens = [],
    decoderFinalInputVectors = [],
    decoderMaskedAttentionOutputs = [],
    decoderAddNormOutputs1 = [],           // ✅ FIXED: Added state value
    decoderCrossAttentionOutputs = [],
    currentStep,
    isPlaying,
    animationSpeed,
    config,
    setDecoderAddNormOutputs1,             // Setter function
    setDecoderAddNormOutputs2,             // Setter function
    setCurrentStep,                        // ✅ ADDED: Need to advance to next step
  } = useVisualizationStore();

  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [residualOutputs, setResidualOutputs] = useState([]);
  const [normalizedOutputs, setLocalNormalizedOutputs] = useState([]);
  const [showCalculations, setShowCalculations] = useState(false);

  const containerRef = useRef(null);
  const dModel = config?.dModel || 6;

  // Determine which attention outputs to use
  const inputVectors = afterCrossAttention ? decoderAddNormOutputs1 : decoderFinalInputVectors;
  const attentionOutputs = afterCrossAttention ? decoderCrossAttentionOutputs : decoderMaskedAttentionOutputs;
  const stepName = afterCrossAttention ? 'decoder_addnorm2' : 'decoder_addnorm1';
  const stepNumber = afterCrossAttention ? 7 : 5; // ✅ FIXED: Correct step numbers
  const stepTitle = afterCrossAttention ? "After Cross-Attention" : "After Masked Attention";
  const nextStep = afterCrossAttention ? 'decoder_ffn' : 'decoder_cross_attention';

  console.log(`DecoderAddNorm - afterCrossAttention: ${afterCrossAttention}`);
  console.log(`DecoderAddNorm - Step: ${stepName}`);
  console.log(`DecoderAddNorm - inputVectors length:`, inputVectors.length);
  console.log(`DecoderAddNorm - attentionOutputs length:`, attentionOutputs.length);

  // Calculate residual and normalized outputs
  useEffect(() => {
    if (inputVectors.length === 0 || attentionOutputs.length === 0) {
      console.log('DecoderAddNorm - Waiting for inputs...');
      return;
    }

    console.log('DecoderAddNorm - Calculating residuals and normalization');
    const residuals = inputVectors.map((input, idx) =>
      addVectors(input, attentionOutputs[idx] || Array(dModel).fill(0))
    );
    setResidualOutputs(residuals);

    const normalized = residuals.map(vec => layerNorm(vec));
    setLocalNormalizedOutputs(normalized);
  }, [inputVectors, attentionOutputs, dModel]);

  // Animation and completion
  useEffect(() => {
    if (!isPlaying || currentStep !== stepName || decoderTokens.length === 0) return;

    const timer = setTimeout(() => {
      if (currentTokenIdx < decoderTokens.length - 1) {
        setCurrentTokenIdx(prev => prev + 1);
      } else {
        console.log(`${stepName} animation complete. Setting outputs and advancing to ${nextStep}`);
        
        // Save outputs
        if (afterCrossAttention) {
          setDecoderAddNormOutputs2(normalizedOutputs);
        } else {
          setDecoderAddNormOutputs1(normalizedOutputs);
        }

        // Advance to next step
        setTimeout(() => {
          setCurrentStep(nextStep);
        }, 500);
      }
    }, 2000 / animationSpeed);

    return () => clearTimeout(timer);
  }, [
    isPlaying, 
    currentStep, 
    currentTokenIdx, 
    decoderTokens.length, 
    animationSpeed, 
    setDecoderAddNormOutputs1,
    setDecoderAddNormOutputs2,
    normalizedOutputs,
    afterCrossAttention,
    stepName,
    nextStep,
    setCurrentStep
  ]);

  // Reset token index when step changes
  useEffect(() => {
    if (currentStep === stepName) {
      setCurrentTokenIdx(0);
    }
  }, [currentStep, stepName]);

  console.log('DecoderAddNorm - Render check:', {
    currentStep,
    stepName,
    residualOutputsLength: residualOutputs.length,
    shouldRender: currentStep === stepName && residualOutputs.length > 0
  });

  if (currentStep !== stepName || residualOutputs.length === 0) {
    console.log('DecoderAddNorm - Not rendering');
    return null;
  }

  console.log('DecoderAddNorm - RENDERING!');

  const currentToken = decoderTokens[currentTokenIdx];

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">
            Decoder Step {stepNumber}: Add & Norm {stepTitle}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/20 px-3 py-1 rounded border border-cyan-400/50 text-sm">
            <span className="text-cyan-300">Token: {currentTokenIdx + 1}/{decoderTokens.length}</span>
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
        Processing target token "<span className="font-mono font-bold text-pink-300">
          {currentToken === '<START>' ? '⏵' : currentToken}
        </span>" through residual connection and layer normalization.
      </p>

      {/* Main Visualization */}
      <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-600/50">
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
                <div className="text-center text-xs font-semibold text-slate-400">
                  {afterCrossAttention ? 'From 1st Add&Norm' : 'Original Input'}
                </div>
                <Vector 
                  values={inputVectors[currentTokenIdx]} 
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
                <div className="text-center text-xs font-semibold text-purple-400">
                  {afterCrossAttention ? 'Cross-Attn Output' : 'Masked-Attn Output'}
                </div>
                <Vector 
                  values={attentionOutputs[currentTokenIdx] || inputVectors[currentTokenIdx]} 
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
          </div>

          {/* Phase 2: Layer Normalization */}
          <div className="space-y-4 border-t border-cyan-700 pt-6">
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
              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-cyan-400">Before Norm</div>
                <Vector 
                  values={residualOutputs[currentTokenIdx]} 
                  label="Residual"
                  color="#06B6D4"
                  showValues={false}
                  size="small"
                />
              </div>

              <div className="flex flex-col items-center gap-2">
                <TrendingUp className="w-8 h-8 text-green-400" />
                <div className="text-xs text-green-300 font-mono bg-slate-800/50 px-2 py-1 rounded">
                  (x - μ) / σ
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-center text-xs font-semibold text-green-400">After Norm</div>
                <Vector 
                  values={normalizedOutputs[currentTokenIdx]} 
                  label="Normalized"
                  color="#10B981"
                  showValues={true}
                  size="large"
                />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center py-4 bg-green-500/10 rounded-lg border border-green-400/30">
            <div className="text-sm text-green-300">
              ✨ Target token "<span className="font-mono font-bold">
                {currentToken === '<START>' ? '⏵' : currentToken}
              </span>" processed!
            </div>
            <div className="text-xs text-green-400 mt-1">
              {afterCrossAttention 
                ? "Ready for Decoder Feed-Forward Network" 
                : "Ready for Cross-Attention with Encoder"}
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔄</div>
          <div className="flex-1">
            <h3 className="font-bold text-cyan-300 mb-2">Add & Norm {stepTitle}</h3>
            <div className="text-sm text-cyan-200 space-y-2">
              <p>
                This is the {afterCrossAttention ? 'second' : 'first'} Add & Norm in the decoder. 
                It stabilizes the output from {afterCrossAttention ? 'cross-attention' : 'masked self-attention'}.
              </p>
              <div className="bg-slate-800/50 rounded px-3 py-2 font-mono text-xs space-y-1">
                <div>1. Add: input + attention_output</div>
                <div>2. Norm: (sum - mean) / std</div>
              </div>
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