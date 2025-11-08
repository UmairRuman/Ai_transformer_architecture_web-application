'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { tokenize } from '../../lib/transformerLogic';
import AnimationControls from '../../components/shared/AnimationControls';
import TokenDisplay from '../../components/visualization/TokenDisplay';
import EmbeddingLayer from '../../components/visualization/EmbeddingLayer';
import PositionalEncoding from '../../components/visualization/PositionalEncoding';
import AttentionBlock from '../../components/visualization/AttentionBlock';
import AddNorm from '../../components/visualization/AddNorm';
import FeedForward from '../../components/visualization/FeedForward';

function VisualizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentence = searchParams.get('sentence') || '';
  const dimension = parseInt(searchParams.get('dim')) || 6;
  const numHeads = parseInt(searchParams.get('heads')) || 2;

  const {
    inputSentence,
    tokens,
    setInputSentence,
    setTokens,
    currentStep,
    setCurrentStep,
    isPlaying,
    setIsPlaying,
    resetVisualization,
   
    setConfig, 
    finalInputVectors,
  attentionOutputs,
  addNormOutputs1,
  feedForwardOutputs , 
  animationSpeed,
   encoderOutputs
  } = useVisualizationStore();

  useEffect(() => {
    if (sentence) {
      resetVisualization();
      
      // Set configuration
      setConfig({ dModel: dimension, numHeads });
      
      setInputSentence(sentence);
      const newTokens = tokenize(sentence);
      setTokens(newTokens);
      
      const startDelay = 800;
      setTimeout(() => {
        setCurrentStep('tokenizing');
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
      }, startDelay);
    }
  }, [sentence, dimension, numHeads, setInputSentence, setTokens, setCurrentStep, setIsPlaying, resetVisualization, setConfig]);

 // This effect is now responsible for advancing to the next step
useEffect(() => {
  // A function to advance to the next step
  const advanceStep = (nextStep) => {
    console.log(`Advancing from ${currentStep} to ${nextStep}`);
    setCurrentStep(nextStep);
    // Ensure play is active for the next component's animation
    if (!isPlaying) {
      setIsPlaying(true);
    }
  };

  // The first 3 steps ('tokenizing', 'embedding', 'positional') now handle their own advancement
  // via their animation's onComplete callback. This controller only handles the rest.
  switch (currentStep) {
    case 'attention':
      // Advance when the attention block has produced its output data
      if (attentionOutputs.length > 0) advanceStep('addnorm');
      break;
    case 'addnorm':
      // Advance when the Add & Norm block has produced its output data
      if (addNormOutputs1.length > 0) advanceStep('feedforward');
      break;
    case 'feedforward':
      // When the FFN has produced the final encoder output, the sequence is done
      // NOTE: We need to get encoderOutputs from the store for this to work
      if (encoderOutputs.length > 0) {
        console.log('All encoder steps complete.');
        setIsPlaying(false); // Stop the animation
      }
      break;
    default:
      // Do nothing for 'tokenizing', 'embedding', 'positional' as they handle themselves
      break;
  }
}, [
  currentStep, 
  attentionOutputs, 
  addNormOutputs1,
  encoderOutputs, // Make sure to add this
  isPlaying,
  setCurrentStep, 
  setIsPlaying
]);
  const handleReset = () => {
    resetVisualization();
    router.push('/');
  };

  const showCompletion = currentStep === 'feedforward' && !isPlaying;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600"
              >
                <Home className="w-4 h-4 text-slate-300" />
                <span className="text-slate-300 text-sm font-medium">Home</span>
              </button>

              <div className="h-8 w-px bg-slate-600" />

              <div className="text-slate-300">
                <span className="text-sm text-slate-500">Visualizing:</span>
                <span className="ml-2 font-mono font-semibold text-purple-400">
                  "{inputSentence}"
                </span>
              </div>

              <div className="h-8 w-px bg-slate-600" />

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-blue-500/20 px-3 py-1 rounded border border-blue-400/50">
                  <span className="text-blue-300">dim: {dimension}</span>
                </div>
                <div className="bg-purple-500/20 px-3 py-1 rounded border border-purple-400/50">
                  <span className="text-purple-300">heads: {numHeads}</span>
                </div>
              </div>
            </div>

            <AnimationControls />
          </div>
        </div>
      </div>

      <div className="bg-slate-800/30 border-b border-slate-700/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            {[
              { id: 'tokenizing', label: 'Tokenize' },
              { id: 'embedding', label: 'Embed' },
              { id: 'positional', label: 'Position' },
              { id: 'attention', label: 'Attention' },
              { id: 'addnorm', label: 'Add&Norm' },
              { id: 'feedforward', label: 'FFN' }
            ].map((step, idx) => {
              const steps = ['tokenizing', 'embedding', 'positional', 'attention', 'addnorm', 'feedforward'];
              const currentIndex = steps.indexOf(currentStep);
              const stepIndex = steps.indexOf(step.id);
              const isActive = currentStep === step.id;
              const isComplete = stepIndex < currentIndex || (stepIndex === currentIndex && showCompletion);
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg border transition-all
                    ${isActive
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 scale-105' 
                      : isComplete
                      ? 'bg-green-500/20 border-green-400 text-green-300'
                      : 'bg-slate-700/30 border-slate-600 text-slate-500'
                    }
                  `}>
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${isActive
                        ? 'bg-purple-500 text-white animate-pulse' 
                        : isComplete
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-600 text-slate-400'
                      }
                    `}>
                      {isComplete ? '✓' : idx + 1}
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {idx < 5 && (
                    <div className={`w-8 h-px mx-2 transition-colors ${
                      isComplete ? 'bg-green-400' : 'bg-slate-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="space-y-12">
             {/* Show Tokenization Step */}
  {currentStep === 'tokenizing' && <TokenDisplay />}
           {/* Show Embedding Step */}
  {currentStep === 'embedding' && <EmbeddingLayer />}

           {/* Show Positional Encoding Step */}
  {currentStep === 'positional' && <PositionalEncoding />}

            {/* Show Attention Step */}
  {currentStep === 'attention' && <AttentionBlock />}
            {/* Show Add & Norm Step */}
  {currentStep === 'addnorm' && <AddNorm />}
           {/* Show Feed Forward Step */}
  {currentStep === 'feedforward' && <FeedForward />}

            {showCompletion && (
              <div className="text-center py-12">
                <div className="inline-flex flex-col items-center gap-4 bg-green-500/20 rounded-xl px-8 py-6 border-2 border-green-400">
                  <div className="text-6xl">🎉</div>
                  <div className="text-3xl font-bold text-green-300 mb-2">
                    🎉 Complete Encoder Block Visualized!
                  </div>
                  <p className="text-green-200 text-base max-w-2xl leading-relaxed">
                    You've witnessed the complete Encoder block from raw text to final representation! 
                    You saw tokenization, embeddings, positional encoding, self-attention, 
                    residual connections, layer normalization, and the feed-forward network in action.
                  </p>
                  <div className="flex gap-4 mt-4">
                    <button
                      onClick={handleReset}
                      className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
                    >
                      Try Another Sentence
                    </button>
                    <button
                      onClick={() => {
                        resetVisualization();
                        setTimeout(() => {
                          setInputSentence(sentence);
                          const newTokens = tokenize(sentence);
                          setTokens(newTokens);
                          setConfig({ dModel: dimension, numHeads });
                          setTimeout(() => {
                            setCurrentStep('tokenizing');
                            setIsPlaying(true);
                          }, 500);
                        }, 100);
                      }}
                      className="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-colors shadow-lg"
                    >
                      Watch Again
                    </button>
                  </div>
                  <div className="mt-6 text-sm text-green-300/80">
                    💡 Coming in Phase 2: Feed-Forward Networks, Decoder, and Translation Output!
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
          <p className="text-blue-200 text-sm">
            💡 <strong>How to use:</strong> The animation plays automatically through each step. 
            Use the controls above to pause, adjust speed, or reset. Click the yellow "💡 Why this step?" 
            buttons to understand what's happening at each stage!
          </p>
        </div>
      </div>
    </main>
  );
}

export default function VisualizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading visualization...</div>
      </div>
    }>
      <VisualizeContent />
    </Suspense>
  );
}