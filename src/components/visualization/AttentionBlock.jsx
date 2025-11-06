'use client';

import { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import gsap from 'gsap';
import { useVisualizationStore } from '@/store/visualizationStore';
import { TIMINGS, CONFIG } from '@/lib/constants';
import Vector from '@/components/shared/Vector';
import IntuitionButton from '@/components/shared/IntuitionButton';
import {
  createQKVMatrices,
  calculateAttentionScores,
  applySoftmax,
  calculateAttentionOutput
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
        "Example: In 'We are best', 'We' and 'are' have high similarity"
      ]
    },
    softmax: {
      title: "Why Softmax?",
      explanation: "Softmax converts scores into probabilities:",
      points: [
        "Output values sum to 1.0 (100%)",
        "Higher scores become larger percentages",
        "This tells us how much attention to pay to each word",
        "Example: [0.5, 0.3, 0.2] means 50%, 30%, 20% attention"
      ]
    },
    weighted: {
      title: "Why Multiply with V?",
      explanation: "We create a new representation using attention weights:",
      points: [
        "Each Value vector is multiplied by its attention score",
        "High attention = More influence on output",
        "Low attention = Less influence on output",
        "The result is a context-aware representation of the word"
      ]
    }
  };

  const info = content[type] || content.qkv;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl border-2 border-yellow-400 max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex items-start gap-4 mb-4">
          <div className="text-4xl">💡</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-yellow-300 mb-2">{info.title}</h3>
            <p className="text-slate-300 mb-4">{info.explanation}</p>
            <ul className="space-y-2">
              {info.points.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-200">
                  <span className="text-yellow-400 font-bold">•</span>
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

// Main Component
export default function AttentionBlock() {
  const {
    tokens = [],
    finalInputVectors = [],
    currentStep,
    isPlaying,
    setIsPlaying,
    animationSpeed
  } = useVisualizationStore();

  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [step, setStep] = useState('qkv');

  // Refs for animations
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  // Animation state
  const [qkvMatrices, setQkvMatrices] = useState({ Q: [], K: [], V: [] });
  const [attentionScores, setAttentionScores] = useState([]);
  const [softmaxScores, setSoftmaxScores] = useState([]);
  const [outputVectors, setOutputVectors] = useState([]);

  // Initialize QKV matrices when input vectors are ready
  useEffect(() => {
    if (!finalInputVectors || finalInputVectors.length === 0) return;
    const { Q, K, V } = createQKVMatrices(finalInputVectors);
    setQkvMatrices({ Q, K, V });
    setCurrentTokenIdx(0);
    setOutputVectors([]);
  }, [finalInputVectors]);

  const calculateAttention = (tokenIdx) => {
    if (!qkvMatrices.Q || qkvMatrices.Q.length === 0) return;
    // Calculate scores using the centralized functions
    const scores = calculateAttentionScores(qkvMatrices.Q[tokenIdx], qkvMatrices.K);
    setAttentionScores(scores);

    // Apply softmax
    const softmax = applySoftmax(scores);
    setSoftmaxScores(softmax);

    // Calculate output
    const output = calculateAttentionOutput(softmax, qkvMatrices.V);
    setOutputVectors(prev => {
      const newOutputs = [...prev];
      newOutputs[tokenIdx] = output;
      return newOutputs;
    });
  };

  // Animation for current token
  useEffect(() => {
    if (!containerRef.current || qkvMatrices.Q.length === 0 || currentStep !== 'attention') return;

    const tl = gsap.timeline({
      paused: true,
      timeScale: animationSpeed,
      onComplete: () => {
        if (currentTokenIdx < tokens.length - 1) {
          setCurrentTokenIdx(prev => prev + 1);
        } else {
          setIsPlaying(false); // End of animation
        }
      }
    });
    timelineRef.current = tl;

    // Reset visibility first
    gsap.set([
      '.query-vector',
      '.key-vectors',
      '.value-vectors',
      '.attention-scores',
      '.softmax-scores',
      '.output-vector'
    ], { opacity: 0 });

    // Calculate attention for current token with smooth state updates
    const scores = calculateAttentionScores(qkvMatrices.Q[currentTokenIdx], qkvMatrices.K);
    const weights = applySoftmax(scores);
    const output = calculateAttentionOutput(weights, qkvMatrices.V);

    // Use separate timeouts for state updates to prevent React batching
    setTimeout(() => setAttentionScores(scores), 0);
    setTimeout(() => setSoftmaxScores(weights), 50);
    setTimeout(() => {
      setOutputVectors(prev => {
        const newOutputs = [...prev];
        newOutputs[currentTokenIdx] = output;
        return newOutputs;
      });
    }, 100);

    // Enhanced animation sequence with better transitions
    tl.fromTo(
      '.query-vector',
      { opacity: 0, x: -30, scale: 0.8 },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: TIMINGS.fadeInOut,
        ease: 'back.out(1.4)'
      }
    )
    .fromTo(
      '.key-vectors',
      {
        opacity: 0,
        y: -20,
        scale: 0.8,
        stagger: {
          each: 0.1,
          from: "center",
          grid: "auto"
        }
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: TIMINGS.fadeInOut * 1.2,
        stagger: {
          each: 0.1,
          from: "center",
          grid: "auto"
        },
        ease: 'power2.out'
      },
      '-=0.3'
    )
    .fromTo(
      '.value-vectors',
      {
        opacity: 0,
        y: 20,
        scale: 0.8,
        stagger: {
          each: 0.1,
          from: "center",
          grid: "auto"
        }
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: TIMINGS.fadeInOut * 1.2,
        stagger: {
          each: 0.1,
          from: "center",
          grid: "auto"
        },
        ease: 'power2.out'
      },
      '-=0.6'
    )
    .fromTo(
      '.attention-scores',
      {
        scale: 0,
        opacity: 0,
        transformOrigin: 'center'
      },
      {
        scale: 1,
        opacity: 1,
        duration: TIMINGS.fadeInOut * 1.5,
        stagger: {
          each: 0.15,
          from: "center",
          grid: "auto"
        },
        ease: 'elastic.out(1, 0.5)'
      }
    )
    .fromTo(
      '.softmax-scores',
      {
        scale: 0,
        opacity: 0,
        transformOrigin: 'center'
      },
      {
        scale: 1,
        opacity: 1,
        duration: TIMINGS.fadeInOut * 1.5,
        stagger: {
          each: 0.15,
          from: "center",
          grid: "auto"
        },
        ease: 'elastic.out(1, 0.5)'
      },
      '-=0.4'
    )
    .fromTo(
      '.output-vector',
      {
        opacity: 0,
        scale: 0.8,
        y: 20,
        rotateX: -30
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        rotateX: 0,
        duration: TIMINGS.fadeInOut * 1.2,
        ease: 'power3.out'
      }
    );

    if (isPlaying) {
      tl.play();
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [currentTokenIdx, qkvMatrices, currentStep, isPlaying, animationSpeed, tokens.length, setIsPlaying]);

  // Animation step observer
  useEffect(() => {
    const steps = ['qkv', 'scores', 'softmax', 'output', 'complete'];
    const currentStepIndex = steps.indexOf(step);

    if (isPlaying && currentStepIndex < steps.length - 1) {
      const stepDuration = {
        qkv: 2000,
        scores: 2500,
        softmax: 2000,
        output: 2500
      }[step];

      if (stepDuration) {
        const timer = setTimeout(() => {
          setStep(steps[currentStepIndex + 1]);
        }, stepDuration / animationSpeed);

        return () => clearTimeout(timer);
      }
    }
  }, [step, isPlaying, animationSpeed]);

  const handleReset = () => {
    setStep('qkv');
    setCurrentTokenIdx(0);
    setOutputVectors([]);
    setIsPlaying(false);
  };

  if (currentStep !== 'attention') return null;

  // Protect token access if tokens array is empty
  const currentToken = tokens && tokens.length > 0 ? tokens[currentTokenIdx] : '';

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Step 4: Self-Attention</h2>
      </div>

      <p className="text-slate-300 text-sm">
        Each token learns to look at other tokens, creating context-aware representations
        through a process called self-attention.
      </p>

      <div className="bg-slate-700/30 rounded-xl p-8 border border-slate-600/50 overflow-hidden">
        <div className="space-y-8 transition-all duration-500">
          {/* Step Sections */}
          {(step === 'qkv' || step === 'scores' || step === 'softmax' || step === 'output' || step === 'complete') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-blue-300">
                1: Q, K, V Vectors for "{currentToken}"
              </h3>
              <button
                onClick={() => setShowIntuition('qkv')}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 rounded-lg text-yellow-300 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Why this step?
              </button>
            </div>
            <div className="flex items-center justify-center gap-8 flex-wrap py-4">
              <div className="query-vector">
                <Vector
                  values={qkvMatrices.Q[currentTokenIdx] || []}
                  label="Query (Q)"
                  color="#3B82F6"
                  showValues={false}
                  size="medium"
                />
              </div>
              <div className="key-vectors flex items-center justify-center gap-8">
                <Vector
                  values={qkvMatrices.K[currentTokenIdx] || []}
                  label="Key (K)"
                  color="#F59E0B"
                  showValues={false}
                  size="medium"
                />
              </div>
              <div className="value-vectors flex items-center justify-center gap-8">
                <Vector
                  values={qkvMatrices.V[currentTokenIdx] || []}
                  label="Value (V)"
                  color="#A855F7"
                  showValues={false}
                  size="medium"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Attention Scores */}
        {(step === 'scores' || step === 'softmax' || step === 'output' || step === 'complete') && (
          <div className="space-y-4 border-t border-slate-700 pt-8 mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-orange-300">
                2: Attention Scores (Q · K)
              </h3>
              <button
                onClick={() => setShowIntuition('dotProduct')}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 rounded-lg text-yellow-300 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Why this step?
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {tokens.map((token, idx) => (
                <div key={idx} className="attention-scores bg-slate-700/50 rounded-lg p-4 border border-orange-400/50">
                  <div className="text-xs text-slate-400 mb-1">vs "{token}"</div>
                  <div className="text-2xl font-mono font-bold text-orange-300">
                    {attentionScores[idx]?.toFixed(3) || '0.000'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Softmax */}
        {(step === 'softmax' || step === 'output' || step === 'complete') && (
          <div className="space-y-4 border-t border-slate-700 pt-8 mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-green-300">
                3: Softmax (Attention Weights)
              </h3>
              <button
                onClick={() => setShowIntuition('softmax')}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 rounded-lg text-yellow-300 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Why this step?
              </button>
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              {tokens.map((token, idx) => {
                const percentage = (softmaxScores[idx] || 0) * 100;
                return (
                  <div key={idx} className="softmax-scores space-y-2">
                    <div className="bg-slate-700/50 rounded-lg p-4 border-2 border-green-400/50">
                      <div className="text-xs text-slate-400 mb-1">"{token}"</div>
                      <div className="text-2xl font-mono font-bold text-green-300">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                    <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
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

        {/* Step 4: Output */}
        {(step === 'output' || step === 'complete') && (
          <div className="space-y-4 border-t border-slate-700 pt-8 mt-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-purple-300">
                4: Attention Output
              </h3>
              <button
                onClick={() => setShowIntuition('weighted')}
                className="px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400 rounded-lg text-yellow-300 text-sm font-medium transition-colors flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Why this step?
              </button>
            </div>
            <div className="flex items-center justify-center">
              <div className="output-vector">
                <Vector
                  values={outputVectors[currentTokenIdx] || []}
                  label={`Attention(${currentToken})`}
                  color="#10B981"
                  showValues={true}
                  size="large"
                />
              </div>
            </div>
            <div className="text-center text-sm text-green-300">
              ✨ This vector now contains context from all other words!
            </div>
          </div>
        )}

        {/* Complete Message */}
        {step === 'complete' && tokens.length > 0 && (
          <div className="text-center py-8 border-t border-slate-700 mt-8">
            <div className="inline-flex flex-col items-center gap-4 bg-green-500/20 rounded-xl px-8 py-6 border-2 border-green-400">
              <div className="text-5xl">🎉</div>
              <div className="text-2xl font-bold text-green-300">
                Attention Complete!
              </div>
              <p className="text-green-200 text-sm max-w-md">
                All {tokens.length} tokens have been processed through the attention mechanism.
                Each word now has a context-aware representation!
              </p>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Formula Info */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🧮</div>
          <div className="flex-1">
            <h3 className="font-bold text-blue-300 mb-3 text-lg">Attention Formula</h3>
            <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-sm text-slate-200 mb-4">
              <div className="mb-2">Attention(Q, K, V) = softmax(Q·Kᵀ / √d_k) · V</div>
              <div className="text-xs text-slate-400 space-y-1 mt-3">
                <div>• Q·Kᵀ: Calculate similarity scores</div>
                <div>• ÷√d_k: Scale to prevent large values</div>
                <div>• softmax: Convert to probabilities</div>
                <div>• ·V: Weight the values by attention</div>
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