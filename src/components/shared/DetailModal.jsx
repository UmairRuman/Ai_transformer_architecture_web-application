'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { tokenize } from '../../lib/transformerLogic';
import { translateSentence } from '../../lib/translation';

// NEW: Architecture Components
import ArchitectureDiagram from '../../components/architecture/ArchitectureDiagram';
import DetailModal from '../../components/shared/DetailModal';

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

  // NEW: Modal state for showing detail views
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [viewMode, setViewMode] = useState('architecture'); // 'architecture' | 'detail'

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
          setViewMode('architecture'); // Start with architecture view
        }, 100);
      }, startDelay);
    }
  }, [sentence, dimension, numHeads, targetLang]);

  // Auto-open detail modal when step becomes active (optional)
  useEffect(() => {
    if (currentStep && isPlaying) {
      // Give 1 second to see the architecture highlight, then open detail
      const timer = setTimeout(() => {
        setShowDetailModal(true);
        setViewMode('detail');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, isPlaying]);

  const handleReset = () => {
    resetVisualization();
    router.push('/');
  };

  // NEW: Handle block click from architecture diagram
  const handleBlockClick = (stepId) => {
    setCurrentStep(stepId);
    setShowDetailModal(true);
    setViewMode('detail');
    setIsPlaying(false); // Pause when manually navigating
  };

  // NEW: Handle modal close
  const handleCloseModal = () => {
    setShowDetailModal(false);
    setViewMode('architecture');
  };

  const encoderSteps = ['tokenizing', 'embedding', 'positional', 'attention', 'addnorm', 'feedforward'];
  const decoderSteps = [
    'decoder_start', 'decoder_embedding', 'decoder_positional',
    'decoder_masked_attention', 'decoder_addnorm1',
    'decoder_cross_attention', 'decoder_addnorm2',
    'decoder_ffn', 'output_projection', 'translation_complete'
  ];
  
  const allSteps = [...encoderSteps, ...decoderSteps];
  const currentIndex = allSteps.indexOf(currentStep);
  const completedSteps = currentIndex >= 0 ? allSteps.slice(0, currentIndex) : [];

  // Get current step title for modal
  const getStepTitle = (step) => {
    const titles = {
      tokenizing: 'Step 1: Tokenization',
      embedding: 'Step 2: Input Embedding',
      positional: 'Step 3: Positional Encoding',
      attention: 'Step 4: Multi-Head Self-Attention',
      addnorm: 'Step 5: Add & Norm',
      feedforward: 'Step 6: Feed Forward Network',
      decoder_start: 'Decoder: Starting Generation',
      decoder_embedding: 'Decoder: Output Embedding',
      decoder_positional: 'Decoder: Positional Encoding',
      decoder_masked_attention: 'Decoder: Masked Self-Attention',
      decoder_addnorm1: 'Decoder: Add & Norm (After Masked Attention)',
      decoder_cross_attention: 'Decoder: Cross-Attention',
      decoder_addnorm2: 'Decoder: Add & Norm (After Cross-Attention)',
      decoder_ffn: 'Decoder: Feed Forward Network',
      output_projection: 'Decoder: Output Projection',
      translation_complete: 'Translation Complete!'
    };
    return titles[step] || step;
  };

  // Render appropriate component based on current step
  const renderDetailComponent = () => {
    switch (currentStep) {
      case 'tokenizing': return <TokenDisplay />;
      case 'embedding': return <EmbeddingLayer />;
      case 'positional': return <PositionalEncoding />;
      case 'attention': return <AttentionBlock />;
      case 'addnorm': return <AddNorm />;
      case 'feedforward': return <FeedForward />;
      case 'decoder_start': return <DecoderModeSelector />;
      case 'decoder_embedding': return <DecoderEmbedding />;
      case 'decoder_positional': return <DecoderPositionalEncoding />;
      case 'decoder_masked_attention': return <MaskedAttention />;
      case 'decoder_addnorm1': return <DecoderAddNorm afterCrossAttention={false} />;
      case 'decoder_cross_attention': return <CrossAttention />;
      case 'decoder_addnorm2': return <DecoderAddNorm afterCrossAttention={true} />;
      case 'decoder_ffn': return <DecoderFFN />;
      case 'output_projection': return <OutputProjection />;
      case 'translation_complete': return <TranslationDisplay />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Top Navigation Bar */}
      <div className="bg-slate-800/50 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-30">
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

      {/* View Mode Toggle */}
      <div className="bg-slate-800/30 border-b border-slate-700/30 sticky top-[88px] z-20">
        <div className="px-4 lg:px-6 py-3">
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => {
                setViewMode('architecture');
                setShowDetailModal(false);
              }}
              className={`
                px-4 py-2 rounded-lg border text-sm font-semibold transition-all
                ${viewMode === 'architecture' 
                  ? 'bg-purple-500/20 border-purple-400 text-purple-300' 
                  : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }
              `}
            >
              🏗️ Architecture View
            </button>
            
            <button
              onClick={() => {
                setViewMode('detail');
                setShowDetailModal(true);
              }}
              disabled={!currentStep}
              className={`
                px-4 py-2 rounded-lg border text-sm font-semibold transition-all
                ${viewMode === 'detail' 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' 
                  : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:border-slate-500'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              🔬 Detail View
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Architecture Diagram (Always visible) */}
        {viewMode === 'architecture' && (
          <ArchitectureDiagram
            currentStep={currentStep}
            completedSteps={completedSteps}
            onBlockClick={handleBlockClick}
          />
        )}

        {/* Detail Modal */}
        <DetailModal
          isOpen={showDetailModal && viewMode === 'detail'}
          onClose={handleCloseModal}
          title={getStepTitle(currentStep)}
        >
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 lg:p-8">
            {renderDetailComponent()}
          </div>
        </DetailModal>
      </div>
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