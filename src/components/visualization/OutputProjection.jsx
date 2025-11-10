'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Zap, TrendingUp, Award } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { matrixVectorMultiply, softmax, generateWeightMatrix } from '../../lib/transformerLogic';
import { translateSentence } from '../../lib/translation';

const SPECIAL_TOKENS = {
  START: '<START>',
  END: '<END>',
  PAD: '<PAD>'
};

export default function OutputProjection() {
  const {
    tokens = [],                    // Source tokens
    decoderTokens = [],             // ✅ FIXED: Correct name
    decoderFinalOutputs = [],       // ✅ FIXED: Correct name
    targetLanguage = 'french',
    currentStep,
    isPlaying,
    animationSpeed,
    config,
    setOutputLogits,
    setOutputProbabilities,
    setPredictedTokens,
    setCurrentStep                  // ✅ ADDED: To advance to next step
  } = useVisualizationStore();

  const [currentTokenIdx, setCurrentTokenIdx] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [logits, setLogits] = useState([]);
  const [probabilities, setProbabilities] = useState([]);
  const [predictedWords, setPredictedWords] = useState([]);

  const containerRef = useRef(null);
  const dModel = config?.dModel || 6;

  // ✅ FIXED: Memoize vocabulary to prevent infinite loop
  const vocabulary = useMemo(() => {
    // Get translation for source tokens
    const translatedTokens = translateSentence(tokens, targetLanguage);
    
    return [
      SPECIAL_TOKENS.START,
      SPECIAL_TOKENS.END,
      SPECIAL_TOKENS.PAD,
      ...translatedTokens,
      // Add some common words
      'le', 'la', 'les', 'un', 'une', 'des',
      'est', 'sont', 'avoir', 'être',
      'je', 'tu', 'il', 'elle', 'nous', 'vous', 'ils', 'elles'
    ];
  }, [tokens, targetLanguage]);

  const vocabSize = vocabulary.length;

  // ✅ FIXED: Memoize output matrix
  const outputMatrix = useMemo(() => 
    generateWeightMatrix(vocabSize, dModel),
    [vocabSize, dModel]
  );

  console.log('OutputProjection - Current step:', currentStep);
  console.log('OutputProjection - decoderFinalOutputs:', decoderFinalOutputs);
  console.log('OutputProjection - decoderTokens:', decoderTokens);

  // Calculate logits and probabilities
  useEffect(() => {
    if (decoderFinalOutputs.length === 0 || currentStep !== 'output_projection') {
      console.log('OutputProjection - Waiting for decoder final outputs...');
      return;
    }

    console.log('OutputProjection - Calculating logits and probabilities');

    const newLogits = [];
    const newProbs = [];
    const newPredictions = [];

    decoderFinalOutputs.forEach((output, idx) => {
      // Project to vocabulary size
      const logit = matrixVectorMultiply(outputMatrix, output);
      newLogits.push(logit);

      // Apply softmax to get probabilities
      const prob = softmax(logit);
      newProbs.push(prob);

      // Get predicted word (highest probability)
      const maxIdx = prob.indexOf(Math.max(...prob));
      const predictedWord = vocabulary[maxIdx] || SPECIAL_TOKENS.END;
      newPredictions.push(predictedWord);
    });

    console.log('OutputProjection - Predictions:', newPredictions);

    setLogits(newLogits);
    setProbabilities(newProbs);
    setPredictedWords(newPredictions);

    // Update store (only once)
    setOutputLogits(newLogits);
    setOutputProbabilities(newProbs);
    setPredictedTokens(newPredictions);
  }, [
    decoderFinalOutputs,
    currentStep,
    outputMatrix,
    vocabulary,
    setOutputLogits,
    setOutputProbabilities,
    setPredictedTokens
  ]); // ✅ FIXED: vocabulary is now memoized, so safe to include

  // Animation
  useEffect(() => {
    if (!isPlaying || currentStep !== 'output_projection' || decoderTokens.length === 0) return;

    const timer = setTimeout(() => {
      if (currentTokenIdx < decoderTokens.length - 1) {
        setCurrentTokenIdx(prev => prev + 1);
      } else {
        // All tokens processed, advance to translation_complete
        console.log('OutputProjection complete. Advancing to translation_complete');
        setTimeout(() => {
          setCurrentStep('translation_complete');
        }, 1000);
      }
    }, 2500 / animationSpeed);

    return () => clearTimeout(timer);
  }, [
    isPlaying,
    currentStep,
    currentTokenIdx,
    decoderTokens.length,
    animationSpeed,
    setCurrentStep
  ]);

  // Reset token index when step changes
  useEffect(() => {
    if (currentStep === 'output_projection') {
      setCurrentTokenIdx(0);
    }
  }, [currentStep]);

  console.log('OutputProjection - Render check:', {
    currentStep,
    probabilitiesLength: probabilities.length,
    shouldRender: currentStep === 'output_projection' && probabilities.length > 0
  });

  if (currentStep !== 'output_projection' || probabilities.length === 0) {
    console.log('OutputProjection - Not rendering');
    return null;
  }

  console.log('OutputProjection - RENDERING!');

  const currentToken = decoderTokens[currentTokenIdx];
  const currentProb = probabilities[currentTokenIdx];
  const predictedWord = predictedWords[currentTokenIdx];

  // Get top 5 predictions
  const topPredictions = currentProb
    .map((prob, idx) => ({ word: vocabulary[idx], prob, idx }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 5);

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">
            Decoder Step 9: Output Projection
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 px-3 py-1 rounded border border-purple-400/50 text-sm">
            <span className="text-purple-300">Token: {currentTokenIdx + 1}/{decoderTokens.length}</span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-3 py-1 bg-blue-500/20 border border-blue-400/50 rounded text-blue-300 text-sm hover:bg-blue-500/30 transition-colors"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </button>
        </div>
      </div>

      <p className="text-slate-300 text-sm max-w-3xl">
        Converting decoder output for "<span className="font-mono font-bold text-pink-300">
          {currentToken === '<START>' ? '⏵' : currentToken}
        </span>" into vocabulary probabilities. Predicting corresponding word in {targetLanguage}.
      </p>

      {/* Main Visualization */}
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-8 border border-purple-600/50">
        <div className="space-y-8">
          
          {/* Step 1: Linear Projection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-purple-300 flex items-center gap-2">
                <span className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">1</span>
                Linear Projection: d_model → vocab_size
              </h3>
            </div>

            <div className="flex items-center justify-center gap-6">
              <div className="text-center">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-purple-400/50">
                  <div className="text-xs text-slate-400 mb-2">Decoder Output</div>
                  <div className="text-lg font-mono text-purple-300">{dModel}D vector</div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <TrendingUp className="w-8 h-8 text-purple-400" />
                <div className="text-xs text-purple-300 mt-1">W_out</div>
                <div className="text-xs text-slate-500 font-mono">{vocabSize}×{dModel}</div>
              </div>

              <div className="text-center">
                <div className="bg-slate-800/50 rounded-lg p-4 border border-orange-400/50">
                  <div className="text-xs text-slate-400 mb-2">Logits</div>
                  <div className="text-lg font-mono text-orange-300">{vocabSize} values</div>
                </div>
              </div>
            </div>

            {showDetails && (
              <div className="bg-slate-800/50 rounded-lg p-4 font-mono text-xs">
                <div className="text-orange-300 mb-2">Logits (raw scores) - first 5:</div>
                <div className="space-y-1 text-slate-400">
                  {logits[currentTokenIdx]?.slice(0, 5).map((logit, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>{vocabulary[idx]}</span>
                      <span className="text-orange-400">{logit.toFixed(3)}</span>
                    </div>
                  ))}
                  <div>...</div>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Softmax */}
          <div className="space-y-4 border-t border-purple-700 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-green-300 flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">2</span>
                Softmax: Convert to Probabilities
              </h3>
            </div>

            <div className="bg-slate-800/50 rounded-lg p-6">
              <div className="text-center mb-4 text-green-300 font-semibold">
                Top 5 Predictions for Position {currentTokenIdx + 1}:
              </div>
              
              <div className="space-y-3">
                {topPredictions.map((pred, idx) => {
                  const percentage = pred.prob * 100;
                  const isTopPick = idx === 0;
                  
                  return (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isTopPick && <Award className="w-4 h-4 text-yellow-400" />}
                          <span className={`font-mono font-bold ${isTopPick ? 'text-yellow-300 text-lg' : 'text-slate-300'}`}>
                            {pred.word}
                          </span>
                        </div>
                        <span className={`font-mono font-bold ${isTopPick ? 'text-yellow-300 text-lg' : 'text-green-300'}`}>
                          {percentage.toFixed(2)}%
                        </span>
                      </div>
                      
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            isTopPick 
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                              : 'bg-gradient-to-r from-green-400 to-green-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 text-xs text-center text-slate-400">
                All {vocabSize} vocabulary probabilities sum to 100%
              </div>
            </div>
          </div>

          {/* Step 3: Prediction */}
          <div className="space-y-4 border-t border-purple-700 pt-6">
            <h3 className="text-lg font-bold text-yellow-300 flex items-center gap-2">
              <span className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs">3</span>
              Selected Prediction (argmax)
            </h3>

            <div className="text-center py-6 bg-yellow-500/10 rounded-lg border-2 border-yellow-400">
              <div className="text-sm text-yellow-300 mb-2">Predicted Word for Position {currentTokenIdx + 1}:</div>
              <div className="text-4xl font-mono font-bold text-yellow-300">
                "{predictedWord}"
              </div>
              <div className="text-xs text-yellow-400 mt-2">
                Confidence: {(topPredictions[0]?.prob * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center py-4 bg-pink-500/10 rounded-lg border border-pink-400/30">
            <div className="text-sm text-pink-300">
              ✨ Output projection complete for position {currentTokenIdx + 1}/{decoderTokens.length}!
            </div>
            <div className="text-xs text-pink-400 mt-1">
              Model predicts "<span className="font-mono font-bold">{predictedWord}</span>" for this position
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-400/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📊</div>
          <div className="flex-1">
            <h3 className="font-bold text-purple-300 mb-2">Output Projection Explained</h3>
            <div className="text-sm text-purple-200 space-y-2">
              <p>
                The decoder output ({dModel} dimensions) is projected to vocabulary size ({vocabSize} words)
              </p>
              <p className="font-mono text-xs bg-slate-800/50 p-2 rounded">
                logits = W_out · decoder_output + b
              </p>
              <p className="font-mono text-xs bg-slate-800/50 p-2 rounded">
                probabilities = softmax(logits)
              </p>
              <p className="text-xs text-purple-300">
                In inference, we pick the highest probability word. In training, we compare against the true target.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Translation Progress */}
      <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-400/30 rounded-lg p-4">
        <div className="text-sm text-green-300 font-semibold mb-2">Translation Progress:</div>
        <div className="flex gap-2 flex-wrap">
          {predictedWords.slice(0, currentTokenIdx + 1).map((word, idx) => (
            <div key={idx} className="bg-green-500/20 px-3 py-1 rounded border border-green-400/50">
              <span className="text-green-300 font-mono">{word}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}