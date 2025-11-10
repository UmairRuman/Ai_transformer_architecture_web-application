'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { tokenize } from '../../lib/transformerLogic';
import { translateSentence } from '../../lib/translation';

// Sidebar
import TransformerArchitectureSidebar from '../../components/shared/TransformerArchitectureSidebar';

// Shared Components
import AnimationControls from '../../components/shared/AnimationControls';

// Encoder Components
import TokenDisplay from '../../components/visualization/TokenDisplay';
import EmbeddingLayer from '../../components/visualization/EmbeddingLayer';
import PositionalEncoding from '../../components/visualization/PositionalEncoding';
import AttentionBlock from '../../components/visualization/AttentionBlock';
import AddNorm from '../../components/visualization/AddNorm';
import FeedForward from '../../components/visualization/FeedForward';

// Decoder Components
import DecoderModeSelector from '../../components/visualization/DecoderModeSelector';
import DecoderEmbedding from '../../components/visualization/DecoderEmbedding';
import DecoderPositionalEncoding from '../../components/visualization/DecoderPositionalEncoding';
import MaskedAttention from '../../components/visualization/MaskedAttention';
import DecoderAddNorm from '../../components/visualization/DecoderAddNorm';
import CrossAttention from '../../components/visualization/CrossAttention';
import DecoderFFN from '../../components/visualization/DecoderFNN';
import OutputProjection from '../../components/visualization/OutputProjection';
import TranslationDisplay from '../../components/visualization/TranslationDisplay';

function VisualizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentence = searchParams.get('sentence') || '';
  const dimension = parseInt(searchParams.get('dim')) || 6;
  const numHeads = parseInt(searchParams.get('heads')) || 2;
  const targetLang = searchParams.get('lang') || 'french';

  const {
    inputSentence,
    setInputSentence,
    setTokens,
    currentStep,
    setCurrentStep,
    isPlaying,
    setIsPlaying,
    resetVisualization,
    setConfig,
    setTargetLanguage,
    setDecoderTokens,
  } = useVisualizationStore();

  // Initialize on mount
  useEffect(() => {
    if (sentence) {
      resetVisualization();
      
      setConfig({ dModel: dimension, numHeads });
      setTargetLanguage(targetLang);
      
      setInputSentence(sentence);
      const newTokens = tokenize(sentence);
      setTokens(newTokens);
      
      const translatedTokens = translateSentence(newTokens, targetLang);
      setDecoderTokens(['<START>', ...translatedTokens]);
      
      const startDelay = 800;
      setTimeout(() => {
        setCurrentStep('tokenizing');
        setTimeout(() => {
          setIsPlaying(true);
        }, 100);
      }, startDelay);
    }
  }, [sentence, dimension, numHeads, targetLang, setInputSentence, setTokens, setCurrentStep, setIsPlaying, resetVisualization, setConfig, setTargetLanguage, setDecoderTokens]);

  const handleReset = () => {
    resetVisualization();
    router.push('/');
  };

  const encoderSteps = ['tokenizing', 'embedding', 'positional', 'attention', 'addnorm', 'feedforward'];
  const decoderSteps = [
    'decoder_start', 'decoder_embedding', 'decoder_positional',
    'decoder_masked_attention', 'decoder_addnorm1',
    'decoder_cross_attention', 'decoder_addnorm2',
    'decoder_ffn', 'output_projection', 'translation_complete'
  ];
  
  const isEncoderPhase = encoderSteps.includes(currentStep);
  const isDecoderPhase = decoderSteps.includes(currentStep);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      {/* Architecture Sidebar - NEW! */}
      <TransformerArchitectureSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation Bar */}
        <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-10">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600 text-sm"
                >
                  <Home className="w-4 h-4 text-slate-300" />
                  <span className="text-slate-300 font-medium hidden sm:inline">Home</span>
                </button>

                <div className="h-6 w-px bg-slate-600 hidden sm:block" />

                <div className="text-slate-300 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-slate-500">Visualizing:</span>
                  <span className="text-sm font-mono font-semibold text-purple-400 truncate max-w-[200px]">
                    "{inputSentence}"
                  </span>
                </div>

                <div className="h-6 w-px bg-slate-600 hidden md:block" />

                <div className="flex items-center gap-2 text-xs flex-wrap">
                  <div className="bg-blue-500/20 px-2 py-1 rounded border border-blue-400/50">
                    <span className="text-blue-300">dim: {dimension}</span>
                  </div>
                  <div className="bg-purple-500/20 px-2 py-1 rounded border border-purple-400/50">
                    <span className="text-purple-300">heads: {numHeads}</span>
                  </div>
                  <div className="bg-pink-500/20 px-2 py-1 rounded border border-pink-400/50">
                    <span className="text-pink-300">lang: {targetLang}</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <AnimationControls />
              </div>
            </div>

            {/* Mobile Controls */}
            <div className="mt-3 lg:hidden">
              <AnimationControls />
            </div>
          </div>
        </div>

        {/* Phase Indicator - Simplified */}
        <div className="bg-slate-800/30 border-b border-slate-700/30">
          <div className="px-4 lg:px-6 py-3">
            <div className="flex items-center justify-center gap-2">
              <div className={`
                inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm
                ${isEncoderPhase 
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                  : 'bg-pink-500/20 border-pink-400 text-pink-300'
                }
              `}>
                <span className="font-semibold">
                  {isEncoderPhase ? '🔵 Encoder Phase' : '🎯 Decoder Phase'}
                </span>
                <span className="text-xs hidden sm:inline">
                  {isEncoderPhase && '(Processing English)'}
                  {isDecoderPhase && `(Generating ${targetLang})`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Visualization Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 lg:p-8 shadow-2xl min-h-[500px]">
              <div className="space-y-8 lg:space-y-12">
                {/* ENCODER COMPONENTS */}
                {currentStep === 'tokenizing' && <TokenDisplay />}
                {currentStep === 'embedding' && <EmbeddingLayer />}
                {currentStep === 'positional' && <PositionalEncoding />}
                {currentStep === 'attention' && <AttentionBlock />}
                {currentStep === 'addnorm' && <AddNorm />}
                {currentStep === 'feedforward' && <FeedForward />}
                
                {/* DECODER COMPONENTS */}
                {currentStep === 'decoder_start' && <DecoderModeSelector />}
                {currentStep === 'decoder_embedding' && <DecoderEmbedding />}
                {currentStep === 'decoder_positional' && <DecoderPositionalEncoding />}
                {currentStep === 'decoder_masked_attention' && <MaskedAttention />}
                {currentStep === 'decoder_addnorm1' && <DecoderAddNorm afterCrossAttention={false} />}
                {currentStep === 'decoder_cross_attention' && <CrossAttention />}
                {currentStep === 'decoder_addnorm2' && <DecoderAddNorm afterCrossAttention={true} />}
                {currentStep === 'decoder_ffn' && <DecoderFFN />}
                {currentStep === 'output_projection' && <OutputProjection />}
                {currentStep === 'translation_complete' && <TranslationDisplay />}
              </div>
            </div>

            {/* Info Panel */}
            <div className="mt-6 bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
              <p className="text-blue-200 text-sm">
                💡 <strong>Navigation:</strong> Use the sidebar to see the full transformer architecture. 
                Click on completed (green ✓) steps to review them. The animation plays automatically, 
                but you can pause and navigate manually using the controls.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VisualizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl animate-pulse">Loading Transformer Visualization...</div>
      </div>
    }>
      <VisualizeContent />
    </Suspense>
  );
}