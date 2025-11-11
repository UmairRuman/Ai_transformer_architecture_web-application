import { useState } from 'react';
import EncoderStack from './EncoderStack';
import DecoderStack from './DecoderStack';
import { HorizontalArrow } from './ConnectionArrows';

/**
 * ArchitectureDiagram - Main container matching "Attention is All You Need" paper
 * Shows complete Transformer architecture with encoder-decoder connection
 */
export default function ArchitectureDiagram({ 
  currentStep, 
  completedSteps = [], 
  onBlockClick 
}) {
  const encoderSteps = ['tokenizing', 'embedding', 'positional', 'attention', 'addnorm', 'feedforward'];
  const encoderCompleted = encoderSteps.every(step => completedSteps.includes(step));

  const showEncoderDecoderConnection = encoderCompleted || currentStep.startsWith('decoder');

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 lg:p-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3">
          🤖 Transformer Architecture
        </h1>
        <p className="text-slate-400 text-sm lg:text-base mb-2">
          Interactive Visualization • "Attention is All You Need"
        </p>
        <a
          href="https://arxiv.org/abs/1706.03762"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Read Original Paper (Vaswani et al., 2017)
        </a>
      </div>

      {/* Main Architecture Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-8 lg:gap-12 items-start justify-items-center max-w-7xl mx-auto">
        
        {/* ENCODER - Left Side */}
        <div className="w-full flex justify-center">
          <EncoderStack
            currentStep={currentStep}
            completedSteps={completedSteps}
            onBlockClick={onBlockClick}
          />
        </div>

        {/* CENTER CONNECTION - Encoder to Decoder */}
        <div className="hidden lg:flex items-center justify-center" style={{ minHeight: '600px' }}>
          {showEncoderDecoderConnection && (
            <div className="relative flex flex-col items-center gap-4 py-32">
              {/* Top connection */}
              <div className="flex flex-col items-center gap-2">
                <HorizontalArrow 
                  isActive={currentStep === 'decoder_cross_attention'}
                  isCompleted={completedSteps.includes('decoder_cross_attention')}
                  width={80}
                />
                <div className="text-xs text-cyan-400 font-mono bg-slate-800 px-2 py-1 rounded border border-cyan-400/50">
                  K, V
                </div>
              </div>

              {/* Middle label */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="bg-gradient-to-br from-blue-500/10 to-pink-500/10 border-2 border-cyan-400/30 rounded-lg px-4 py-3 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-xs text-cyan-300 font-bold mb-1">
                      📡 Data Flow
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Encoder → Decoder
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual connection line */}
              <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-400 via-cyan-400 to-pink-400 opacity-30" />
            </div>
          )}

          {!showEncoderDecoderConnection && (
            <div className="text-center px-4 py-8 bg-slate-800/30 rounded-lg border border-slate-700">
              <div className="text-slate-500 text-sm mb-2">⏳</div>
              <div className="text-xs text-slate-500">
                Complete Encoder
                <br />
                to see connection
              </div>
            </div>
          )}
        </div>

        {/* DECODER - Right Side */}
        <div className="w-full flex justify-center">
          <DecoderStack
            currentStep={currentStep}
            completedSteps={completedSteps}
            onBlockClick={onBlockClick}
            encoderCompleted={encoderCompleted}
          />
        </div>
      </div>

      {/* Mobile connection indicator */}
      {showEncoderDecoderConnection && (
        <div className="lg:hidden mt-8 flex justify-center">
          <div className="bg-gradient-to-r from-blue-500/10 to-pink-500/10 border border-cyan-400/30 rounded-lg px-6 py-4 max-w-sm">
            <div className="text-center">
              <div className="text-sm text-cyan-300 font-bold mb-2">
                📡 Encoder → Decoder Connection
              </div>
              <div className="text-xs text-slate-400">
                Keys (K) and Values (V) from Encoder
                <br />
                flow to Decoder's Cross-Attention layer
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-12 max-w-4xl mx-auto bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to Use This Diagram
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded border-2 border-yellow-400 bg-yellow-400/20 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
              </div>
              <div>
                <div className="text-slate-200 font-semibold">Currently Active</div>
                <div className="text-slate-400 text-xs">The step being visualized now</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded border-2 border-green-400 bg-green-500/10 flex-shrink-0 flex items-center justify-center">
                <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <div className="text-slate-200 font-semibold">Completed</div>
                <div className="text-slate-400 text-xs">Click to review this step</div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded border-2 border-slate-600 bg-slate-800/50 flex-shrink-0" />
              <div>
                <div className="text-slate-200 font-semibold">Locked</div>
                <div className="text-slate-400 text-xs">Not yet reached in the process</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-cyan-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div>
                <div className="text-slate-200 font-semibold">Data Flow</div>
                <div className="text-slate-400 text-xs">Shows how information moves through layers</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-400 leading-relaxed">
            💡 <strong className="text-slate-300">Tip:</strong> Hover over any component (ℹ️) to see its function. 
            Click on completed (green ✓) steps to jump back and review. The animation plays automatically, 
            showing each mathematical operation in detail.
          </p>
        </div>
      </div>
    </div>
  );
}