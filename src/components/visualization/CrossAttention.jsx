'use client';

import { useEffect, useRef, useState } from 'react';
import { Zap, ArrowRight, Link } from 'lucide-react';
import { useVisualizationStore } from '@/store/visualizationStore';
import Vector from '@/components/shared/Vector';
import {
  generateWeightMatrix,
  matrixVectorMultiply,
  calculateAttentionScores,
  applySoftmax,
  calculateAttentionOutput
} from '@/lib/transformerLogic';

// Intuition Modal
const IntuitionModal = ({ type, onClose }) => {
  const content = {
    cross: {
      title: "What is Cross-Attention?",
      explanation: "Cross-attention connects encoder and decoder:",
      points: [
        "Query (Q): Comes from decoder (what we're generating)",
        "Key (K) & Value (V): Come from encoder (source sentence)",
        "Decoder asks: 'Which source words are relevant for this target word?'",
        "This is how translation learns alignment",
        "Example: Generating 'meilleurs' → attends to 'best' in source"
      ]
    },
    alignment: {
      title: "Why Cross-Attention Creates Alignment?",
      explanation: "This mechanism learns which source words correspond to which target words:",
      points: [
        "Decoder generates one target word at a time",
        "For each target word, it 'looks' at ALL source words",
        "Attention weights show which source words are most relevant",
        "High attention = strong alignment/correspondence",
        "This is learned automatically during training!"
      ]
    }
  };

  const info = content[type] || content.cross;

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

export default function CrossAttention() {
  const {
    tokens = [],              // Source tokens (encoder)
    targetTokens = [],        // Target tokens (decoder)
    encoderOutputs = [],      // Encoder final outputs (K, V source)
    maskedAttentionOutputs = [], // Decoder masked attention (Q source)
    currentStep,
    isPlaying,
    animationSpeed,
    config,
    setCrossAttentionOutputs,
    setCurrentStep
  } = useVisualizationStore();

  const [currentPhase, setCurrentPhase] = useState('setup');
  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showIntuition, setShowIntuition] = useState('');
  const [showCalculations, setShowCalculations] = useState(false);
  
  const [queries, setQueries] = useState([]);
  const [keys, setKeys] = useState([]);
  const [values, setValues] = useState([]);
  const [crossAttentionResults, setCrossAttentionResults] = useState([]);

  const dModel = config?.dModel || 6;

  // Generate Q from decoder, K,V from encoder
  useEffect(() => {
    if (!maskedAttentionOutputs || maskedAttentionOutputs.length === 0 || 
        !encoderOutputs || encoderOutputs.length === 0 || 
        currentStep !== 'cross_attention') return;

    // Weight matrices
    const Wq = generateWeightMatrix(dModel, dModel);
    const Wk = generateWeightMatrix(dModel, dModel);
    const Wv = generateWeightMatrix(dModel, dModel);

    // Q from decoder (what we're generating)
    const Q = maskedAttentionOutputs.map(vec => matrixVectorMultiply(Wq, vec));
    
    // K, V from encoder (source sentence)
    const K = encoderOutputs.map(vec => matrixVectorMultiply(Wk, vec));
    const V = encoderOutputs.map(vec => matrixVectorMultiply(Wv, vec));

    setQueries(Q);
    setKeys(K);
    setValues(V);

    // Calculate cross-attention for each decoder position
    const results = Q.map((query, idx) => {
      const scores = calculateAttentionScores(query, K);
      const weights = applySoftmax(scores, dModel);
      const output = calculateAttentionOutput(weights, V);

      return {
        tokenIdx: idx,
        query,
        scores,
        weights,
        output
      };
    });

    setCrossAttentionResults(results);
    setCurrentTokenIdx(0);
    setCurrentPhase('setup');
  }, [maskedAttentionOutputs, encoderOutputs, currentStep, dModel]);

  // Save outputs when complete
  useEffect(() => {
    if (currentPhase === 'complete' && crossAttentionResults.length > 0) {
      console.log('Cross-Attention complete. Setting outputs.');
      const finalOutputs = crossAttentionResults.map(r => r.output);
      setCrossAttentionOutputs(finalOutputs);
      
      setTimeout(() => {
        setCurrentStep('decoder_addnorm');
      }, 1000);
    }
  }, [currentPhase, crossAttentionResults, setCrossAttentionOutputs, setCurrentStep]);

  // Animation logic
  useEffect(() => {
    if (!isPlaying || currentStep !== 'cross_attention' || crossAttentionResults.length === 0) return;

    const phaseDurations = {
      setup: 2000,
      scores: 2500,
      softmax: 2000,
      output: 1500
    };

    const timer = setTimeout(() => {
      if (!useVisualizationStore.getState().isPlaying) return;

      const phases = ['setup', 'scores', 'softmax', 'output'];
      const currentPhaseIndex = phases.indexOf(currentPhase);

      if (currentPhaseIndex < phases.length - 1) {
        setCurrentPhase(phases[currentPhaseIndex + 1]);
      } else {
        if (currentTokenIdx < targetTokens.length - 1) {
          setCurrentTokenIdx(prev => prev + 1);
          setCurrentPhase('setup');
        } else {
          setCurrentPhase('complete');
        }
      }
    }, phaseDurations[currentPhase] / animationSpeed);

    return () => clearTimeout(timer);
  }, [currentStep, currentPhase, currentTokenIdx, isPlaying, animationSpeed, crossAttentionResults, targetTokens.length]);

  if (currentStep !== 'cross_attention' || crossAttentionResults.length === 0) return null;

  const currentResult = crossAttentionResults[currentTokenIdx];
  const currentTargetToken = targetTokens[currentTokenIdx];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Decoder Step 2: Cross-Attention (Encoder↔Decoder)</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-cyan-500/20 px-3 py-1 rounded border border-cyan-400/50 text-sm">
            <span className="text-cyan-300">Target: {currentTokenIdx + 1}/{targetTokens.length}</span>
          </div>
          <button
            onClick={() => setShowCalculations(!showCalculations)}
            className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded text-blue-300 text-sm hover:bg-blue-500/30 transition-colors"
          >
            {showCalculations ? 'Hide' : 'Show'} Math
          </button>
        </div>
      </div>

      {/* Key Concept Banner */}
      <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-l-4 border-cyan-400 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl">🔗</div>
          <div>
            <div className="font-bold text-cyan-300 text-lg mb-1">Encoder-Decoder Information Flow</div>
            <p className="text-cyan-200 text-sm">
              Generating target token "<span className="font-mono font-bold">{currentTargetToken}</span>". 
              Query from decoder, Keys & Values from <strong>encoder</strong> (source: {tokens.join(', ')}).
              This determines which source words are relevant!
            </p>
          </div>
        </div>
      </div>

      {/* Main Visualization */}
      <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
        <div className="space-y-8">
          
          {/* Architecture Diagram */}
          <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-cyan-400/30">
            <div className="flex items-center justify-center gap-8">
              {/* Decoder Side */}
              <div className="text-center space-y-2">
                <div className="text-sm text-cyan-300 font-semibold">DECODER</div>
                <div className="bg-cyan-500/30 rounded-lg p-4 border-2 border-cyan-400">
                  <div className="font-mono text-white font-bold">{currentTargetToken}</div>
                  <div className="text-xs text-cyan-200 mt-1">(Current Target)</div>
                </div>
                <ArrowRight className="w-6 h-6 text-cyan-400 mx-auto" />
                <div className="text-xs text-cyan-300">Query (Q)</div>
              </div>

              {/* Cross-Attention Block */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-6 border-2 border-purple-400">
                <div className="text-center">
                  <Link className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                  <div className="font-bold text-purple-300">Cross</div>
                  <div className="font-bold text-purple-300">Attention</div>
                </div>
              </div>

              {/* Encoder Side */}
              <div className="text-center space-y-2">
                <div className="text-sm text-blue-300 font-semibold">ENCODER</div>
                <div className="flex gap-2">
                  {tokens.map((token, idx) => (
                    <div key={idx} className="bg-blue-500/30 rounded-lg p-2 border border-blue-400 min-w-[60px]">
                      <div className="font-mono text-white text-sm">{token}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 justify-center">
                  <div className="text-xs text-orange-300">Keys (K)</div>
                  <div className="text-xs text-purple-300">Values (V)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Q, K, V Display */}
          {(currentPhase === 'setup' || currentPhase === 'scores' || currentPhase === 'softmax' || currentPhase === 'output') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-cyan-300">Cross-Attention Components</h3>
                <button
                  onClick={() => setShowIntuition('cross')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  What is this?
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {/* Query from Decoder */}
                <div className="space-y-2 bg-cyan-500/10 rounded-lg p-4 border border-cyan-400/30">
                  <div className="text-center text-sm font-semibold text-cyan-300">Query (from Decoder)</div>
                  <Vector 
                    values={currentResult.query} 
                    label={`Q_dec`}
                    color="#06B6D4"
                    showValues={false}
                    size="small"
                  />
                  <div className="text-xs text-cyan-200 text-center">What am I looking for?</div>
                </div>

                {/* Keys from Encoder */}
                <div className="space-y-2 bg-orange-500/10 rounded-lg p-4 border border-orange-400/30">
                  <div className="text-center text-sm font-semibold text-orange-300">Keys (from Encoder)</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {keys.map((k, idx) => (
                      <Vector 
                        key={idx}
                        values={k} 
                        label={tokens[idx]}
                        color="#F59E0B"
                        showValues={false}
                        size="small"
                      />
                    ))}
                  </div>
                  <div className="text-xs text-orange-200 text-center">What do I contain?</div>
                </div>

                {/* Values from Encoder */}
                <div className="space-y-2 bg-purple-500/10 rounded-lg p-4 border border-purple-400/30">
                  <div className="text-center text-sm font-semibold text-purple-300">Values (from Encoder)</div>
                  <div className="flex gap-2 justify-center flex-wrap">
                    {values.map((v, idx) => (
                      <Vector 
                        key={idx}
                        values={v} 
                        label={tokens[idx]}
                        color="#A855F7"
                        showValues={false}
                        size="small"
                      />
                    ))}
                  </div>
                  <div className="text-xs text-purple-200 text-center">What info do I have?</div>
                </div>
              </div>
            </div>
          )}

          {/* Attention Scores */}
          {(currentPhase === 'scores' || currentPhase === 'softmax' || currentPhase === 'output') && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-orange-300">Cross-Attention Scores</h3>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {tokens.map((token, idx) => (
                  <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border border-orange-400/50 min-w-[100px]">
                    <div className="text-xs text-slate-400 mb-1 text-center">Source: "{token}"</div>
                    <div className="text-xl font-mono font-bold text-orange-300 text-center">
                      {currentResult.scores[idx]?.toFixed(3)}
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center text-xs text-orange-400">
                Higher score = more relevant for generating "{currentTargetToken}"
              </div>
            </div>
          )}

          {/* Softmax Weights (Alignment) */}
          {(currentPhase === 'softmax' || currentPhase === 'output') && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-green-300">Alignment Weights (Softmax)</h3>
                <button
                  onClick={() => setShowIntuition('alignment')}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg text-yellow-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3" />
                  Why Important?
                </button>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-6">
                <div className="text-center text-sm text-green-300 mb-4">
                  When generating "<span className="font-mono font-bold">{currentTargetToken}</span>", 
                  attention to source words:
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {tokens.map((token, idx) => {
                    const percentage = (currentResult.weights[idx] || 0) * 100;
                    return (
                      <div key={idx} className="space-y-2">
                        <div className={`
                          rounded-lg p-4 border-2 min-w-[100px]
                          ${percentage > 30 
                            ? 'bg-green-500/30 border-green-400' 
                            : 'bg-slate-700/50 border-green-400/30'
                          }
                        `}>
                          <div className="text-xs text-slate-300 mb-1 text-center font-mono">"{token}"</div>
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
            </div>
          )}

          {/* Output */}
          {currentPhase === 'output' && (
            <div className="space-y-4 border-t border-slate-700 pt-6">
              <h3 className="text-lg font-bold text-purple-300">Cross-Attention Output</h3>
              <div className="flex flex-col items-center gap-4">
                <Vector 
                  values={currentResult.output} 
                  label={`CrossAttn(${currentTargetToken})`}
                  color="#10B981"
                  showValues={true}
                  size="large"
                />
                <div className="text-center text-sm text-green-300 bg-green-500/10 rounded-lg px-4 py-2 max-w-2xl">
                  ✨ This vector contains information from the source sentence, 
                  weighted by relevance to generating "{currentTargetToken}"!
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🌉</div>
          <div className="flex-1">
            <h3 className="font-bold text-cyan-300 mb-2">Cross-Attention: The Bridge</h3>
            <div className="text-sm text-cyan-200 space-y-2">
              <p>
                This is THE key mechanism that allows the decoder to access encoder information
              </p>
              <div className="bg-slate-800/50 rounded px-3 py-2 font-mono text-xs space-y-1">
                <div>Q = decoder output (what we're generating)</div>
                <div>K, V = encoder output (source sentence)</div>
                <div>Output = weighted combination of source</div>
              </div>
              <p className="text-xs text-cyan-300 mt-2">
                💡 This learned alignment is how neural translation works!
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