'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { useVisualizationStore } from '@/store/visualizationStore';
import { tokenize } from '@/lib/transformerLogic';
import AnimationControls from '@/components/shared/AnimationControls';
import TokenDisplay from '@/components/visualization/TokenDisplay';
import EmbeddingLayer from '@/components/visualization/EmbeddingLayer';
import PositionalEncoding from '@/components/visualization/PositionalEncoding';
import AttentionBlock from '@/components/visualization/AttentionBlock';

function VisualizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentence = searchParams.get('sentence') || '';
  const dimension = parseInt(searchParams.get('dim')) || 6;
  const numHeads = parseInt(searchParams.get('heads')) || 2;

  const {
    inputSentence,
    // --- THE FIX IS HERE ---
    // Default 'tokens' to an empty array `[]` to prevent errors on the initial render.
    tokens = [],
    setInputSentence,
    setTokens,
    currentStep,
    setCurrentStep,
    isPlaying,
    setIsPlaying,
    resetVisualization,
    setConfig
  } = useVisualizationStore();

  // Effect to initialize the visualization when the page loads or URL changes
  useEffect(() => {
    if (sentence) {
      resetVisualization();
      
      // Set configuration from URL
      setConfig({ dModel: dimension, numHeads });
      
      // Set up the initial state
      setInputSentence(sentence);
      const newTokens = tokenize(sentence);
      setTokens(newTokens);
      
      // Start the animation process after a brief delay
      const startDelay = 800;
      setTimeout(() => {
        setCurrentStep('tokenizing');
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
      }, startDelay);
    }
    // We only want this effect to run when the URL params change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sentence, dimension, numHeads]);

  // Effect to automatically progress through the animation steps
  useEffect(() => {
    // Don't do anything if the animation isn't playing or if there are no tokens
    if (!isPlaying || tokens.length === 0) return;

    const tokensCount = tokens.length;
    // Define how long each step should take, based on the number of tokens
    const stepDurations = {
      tokenizing: 1000 + (tokensCount * 200),
      embedding: 1500 + (tokensCount * 300),
      positional: 1500 + (tokensCount * 300),
      // Attention is more complex, so give it more time
      attention: 4000 + (tokensCount * 1000) 
    };

    const duration = stepDurations[currentStep];
    
    const timer = setTimeout(() => {
      const steps = ['tokenizing', 'embedding', 'positional', 'attention'];
      const currentIndex = steps.indexOf(currentStep);
      
      if (currentIndex < steps.length - 1) {
        // Move to the next step
        setCurrentStep(steps[currentIndex + 1]);
      } else {
        // We've reached the end of the animation
        setIsPlaying(false);
      }
    }, duration);

    // Cleanup function to clear the timer if the component unmounts or dependencies change
    return () => clearTimeout(timer);
    
  }, [currentStep, isPlaying, tokens, setCurrentStep, setIsPlaying]);

  const handleReset = () => {
    router.push('/');
  };

  const showCompletion = currentStep === 'attention' && !isPlaying && tokens.length > 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Controls Header */}
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

      {/* Step Progress Bar */}
      <div className="bg-slate-800/30 border-b border-slate-700/30">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-3">
            {[
              { id: 'tokenizing', label: 'Tokenize' },
              { id: 'embedding', label: 'Embed' },
              { id: 'positional', label: 'Position' },
              { id: 'attention', label: 'Attention' }
            ].map((step, idx, arr) => {
              const steps = arr.map(s => s.id);
              const currentIndex = steps.indexOf(currentStep);
              const stepIndex = steps.indexOf(step.id);
              const isActive = currentStep === step.id;
              const isComplete = stepIndex < currentIndex || showCompletion;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${isActive ? 'bg-purple-500/20 border-purple-400 text-purple-300 scale-105' : isComplete ? 'bg-green-500/20 border-green-400 text-green-300' : 'bg-slate-700/30 border-slate-600 text-slate-500'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-purple-500 text-white animate-pulse' : isComplete ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-400'}`}>
                      {isComplete ? '✓' : idx + 1}
                    </div>
                    <span className="text-sm font-medium">{step.label}</span>
                  </div>
                  {idx < arr.length - 1 && <div className={`w-8 h-px mx-2 transition-colors ${stepIndex < currentIndex ? 'bg-green-400' : 'bg-slate-600'}`} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 shadow-2xl min-h-[500px]">
          <div className="space-y-12">
            <TokenDisplay />
            <EmbeddingLayer />
            <PositionalEncoding />
            <AttentionBlock />

            {showCompletion && (
              <div className="text-center py-12">
                <div className="inline-flex flex-col items-center gap-4 bg-green-500/20 rounded-xl px-8 py-6 border-2 border-green-400">
                  <div className="text-6xl">🎉</div>
                  <div className="text-3xl font-bold text-green-300 mb-2">Phase 1 Complete!</div>
                  <p className="text-green-200 text-base max-w-2xl leading-relaxed">You've witnessed the complete flow from raw text to context-aware representations! You saw tokenization, embeddings, positional encoding, and the powerful self-attention mechanism in action.</p>
                  <div className="flex gap-4 mt-4">
                    <button onClick={handleReset} className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors shadow-lg">
                      Try Another Sentence
                    </button>
                  </div>
                  <div className="mt-6 text-sm text-green-300/80">💡 Coming in Phase 2: Feed-Forward Networks & Final Output!</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

// Suspense wrapper for the main content
export default function VisualizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Visualization...</div>
      </div>
    }>
      <VisualizeContent />
    </Suspense>
  );
}