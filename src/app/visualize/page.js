'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Home, Eye, Code } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { tokenize } from '../../lib/transformerLogic';
import { translateSentence } from '../../lib/translation';

// Architecture Components
import ArchitectureDiagram from '../../components/architecture/ArchitectureDiagram';

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

  // View state: 'architecture' or 'detail'
  const [currentView, setCurrentView] = useState('architecture');
  // Key to force remount of detail components
  const [detailKey, setDetailKey] = useState(0);

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
    if (sentence && !inputSentence) {
      console.log('🚀 Initializing visualization...');
      
      resetVisualization();
      setConfig({ dModel: dimension, numHeads });
      setTargetLanguage(targetLang);
      setInputSentence(sentence);
      
      const newTokens = tokenize(sentence);
      setTokens(newTokens);
      
      const translatedTokens = translateSentence(newTokens, targetLang);
      setDecoderTokens(['<START>', ...translatedTokens]);
      
      // Start with architecture view
      setTimeout(() => {
        setCurrentStep('tokenizing');
        setCurrentView('architecture');
        
        // After 2 seconds, auto-switch to detail view
        setTimeout(() => {
          setDetailKey(prev => prev + 1); // Force remount
          setCurrentView('detail');
          // Small delay before starting animation to ensure component is mounted
          setTimeout(() => {
            setIsPlaying(true);
          }, 100);
        }, 2000);
      }, 800);
    }
  }, [sentence]);

  // Auto-switch between views when step changes during animation
  useEffect(() => {
    if (currentStep && isPlaying) {
      // Show architecture for 1.5 seconds (with highlighted block)
      setCurrentView('architecture');
      
      const switchTimer = setTimeout(() => {
        // Force remount of detail component
        setDetailKey(prev => prev + 1);
        // Then switch to detail view for the computation
        setCurrentView('detail');
      }, 1500);

      return () => clearTimeout(switchTimer);
    }
  }, [currentStep, isPlaying]);

  const handleReset = () => {
    resetVisualization();
    router.push('/');
  };

  // Handle manual block click from architecture
  const handleBlockClick = (stepId) => {
    setCurrentStep(stepId);
    setIsPlaying(false);
    // Show architecture briefly, then switch to detail
    setCurrentView('architecture');
    setTimeout(() => {
      setDetailKey(prev => prev + 1); // Force remount
      setCurrentView('detail');
    }, 1000);
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

  const isEncoderPhase = encoderSteps.includes(currentStep);

  // Render current step component - WITH KEY for forced remount
  const renderDetailComponent = () => {
    if (!currentStep) return null;

    // Add key prop to force remount when detailKey changes
    const componentProps = { key: detailKey };

    switch (currentStep) {
      case 'tokenizing': return <TokenDisplay {...componentProps} />;
      case 'embedding': return <EmbeddingLayer {...componentProps} />;
      case 'positional': return <PositionalEncoding {...componentProps} />;
      case 'attention': return <AttentionBlock {...componentProps} />;
      case 'addnorm': return <AddNorm {...componentProps} />;
      case 'feedforward': return <FeedForward {...componentProps} />;
      case 'decoder_start': return <DecoderModeSelector {...componentProps} />;
      case 'decoder_embedding': return <DecoderEmbedding {...componentProps} />;
      case 'decoder_positional': return <DecoderPositionalEncoding {...componentProps} />;
      case 'decoder_masked_attention': return <MaskedAttention {...componentProps} />;
      case 'decoder_addnorm1': return <DecoderAddNorm afterCrossAttention={false} {...componentProps} />;
      case 'decoder_cross_attention': return <CrossAttention {...componentProps} />;
      case 'decoder_addnorm2': return <DecoderAddNorm afterCrossAttention={true} {...componentProps} />;
      case 'decoder_ffn': return <DecoderFFN {...componentProps} />;
      case 'output_projection': return <OutputProjection {...componentProps} />;
      case 'translation_complete': return <TranslationDisplay {...componentProps} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
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

            <div className="hidden lg:flex items-center gap-3">
              {/* View Indicator */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 rounded-lg border border-slate-600">
                {currentView === 'architecture' ? (
                  <>
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300 font-semibold">Architecture</span>
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-300 font-semibold">Math Details</span>
                  </>
                )}
              </div>
              
              <div className="h-6 w-px bg-slate-600" />
              
              <AnimationControls />
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="mt-3 lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/30 rounded-lg border border-slate-600">
                {currentView === 'architecture' ? (
                  <>
                    <Eye className="w-4 h-4 text-purple-400" />
                    <span className="text-xs text-purple-300">Architecture</span>
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-cyan-300">Details</span>
                  </>
                )}
              </div>
              <AnimationControls />
            </div>
          </div>
        </div>
      </div>

      {/* Phase Indicator */}
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
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area - Switches between Architecture and Detail */}
      <div className="flex-1 overflow-hidden relative">
        {/* SCREEN A: Architecture Diagram */}
        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-in-out
            ${currentView === 'architecture' 
              ? 'opacity-100 translate-x-0 pointer-events-auto' 
              : 'opacity-0 translate-x-full pointer-events-none'
            }
          `}
        >
          <div className="h-full overflow-y-auto">
            <ArchitectureDiagram
              currentStep={currentStep}
              completedSteps={completedSteps}
              onBlockClick={handleBlockClick}
            />
          </div>
        </div>

        {/* SCREEN B: Detail View (Math Operations) */}
        <div
          className={`
            absolute inset-0 transition-all duration-500 ease-in-out
            ${currentView === 'detail' 
              ? 'opacity-100 translate-x-0 pointer-events-auto' 
              : 'opacity-0 -translate-x-full pointer-events-none'
            }
          `}
        >
          {currentView === 'detail' && (
            <div className="h-full overflow-y-auto">
              <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-4 lg:p-8 shadow-2xl min-h-[500px]">
                  {/* Breadcrumb */}
                  <div className="flex items-center gap-2 mb-6 text-sm">
                    <button
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentView('architecture');
                      }}
                      className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Architecture
                    </button>
                    <span className="text-slate-600">/</span>
                    <span className="text-slate-300 font-semibold">{currentStep}</span>
                  </div>

                  {/* Component Content - Will remount when detailKey changes */}
                  <div className="space-y-8 lg:space-y-12">
                    {renderDetailComponent()}
                  </div>
                </div>

                {/* Back to Architecture Button */}
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentView('architecture');
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-400/50 rounded-xl text-purple-300 hover:text-white transition-all"
                  >
                    <Eye className="w-5 h-5" />
                    <span>Back to Architecture View</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* View Switch Animation Overlay */}
        {currentView === 'architecture' && isPlaying && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-fadeIn">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/50 rounded-lg px-4 py-2 backdrop-blur-sm">
              <p className="text-cyan-300 text-sm font-semibold animate-pulse">
                ⏳ Switching to Math Details...
              </p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function VisualizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4 animate-pulse">Loading Transformer Visualization...</div>
          <div className="text-slate-400 text-sm">Preparing architecture components</div>
        </div>
      </div>
    }>
      <VisualizeContent />
    </Suspense>
  );
}