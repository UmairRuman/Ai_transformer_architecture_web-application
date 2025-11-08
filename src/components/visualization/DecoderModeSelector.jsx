'use client';

import { useState } from 'react';
import { Zap, BookOpen, Rocket, AlertCircle } from 'lucide-react';
import { useVisualizationStore } from '@/store/visualizationStore';

export default function DecoderModeSelector() {
  const { currentStep, setCurrentStep } = useVisualizationStore();
  const [selectedMode, setSelectedMode] = useState('inference');
  const [showExplanation, setShowExplanation] = useState(true);

  if (currentStep !== 'decoder_start') return null;

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    // Advance to decoder embedding after selection
    setTimeout(() => {
      setCurrentStep('decoder_embedding');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
        <h2 className="text-3xl font-bold text-white">🎯 Decoder: Training vs Inference</h2>
      </div>

      {/* Critical Explanation */}
      {showExplanation && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-400 rounded-xl p-6 relative">
          <button
            onClick={() => setShowExplanation(false)}
            className="absolute top-4 right-4 text-yellow-300 hover:text-yellow-100"
          >
            ✕
          </button>
          
          <div className="flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-yellow-300 flex-shrink-0 mt-1" />
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-yellow-200">
                🔑 Most Important Concept in Transformers!
              </h3>
              <p className="text-yellow-100 text-lg leading-relaxed">
                The decoder behaves <strong>completely differently</strong> during training vs inference. 
                This is what makes autoregressive generation possible!
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-400/30">
                  <div className="font-bold text-green-300 mb-2">✅ Training Mode</div>
                  <ul className="text-sm text-yellow-100 space-y-1">
                    <li>• Has access to <strong>full target sentence</strong></li>
                    <li>• Processes all tokens in <strong>parallel</strong></li>
                    <li>• Uses <strong>masking</strong> to prevent cheating</li>
                    <li>• Learns to predict next word</li>
                    <li>• Much faster (parallelized)</li>
                  </ul>
                </div>
                <div className="bg-black/20 rounded-lg p-4 border border-yellow-400/30">
                  <div className="font-bold text-blue-300 mb-2">🎯 Inference Mode</div>
                  <ul className="text-sm text-yellow-100 space-y-1">
                    <li>• Starts with only <strong>&lt;START&gt;</strong> token</li>
                    <li>• Generates <strong>one word at a time</strong></li>
                    <li>• Each word depends on previous words</li>
                    <li>• Stops at &lt;END&gt; token</li>
                    <li>• Slower (sequential generation)</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode Selection Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Training Mode */}
        <button
          onClick={() => handleModeSelect('training')}
          className={`
            group relative overflow-hidden rounded-2xl border-4 transition-all duration-300
            ${selectedMode === 'training' 
              ? 'border-green-400 scale-105 shadow-2xl shadow-green-500/50' 
              : 'border-slate-600 hover:border-green-400/50 hover:scale-102'
            }
          `}
        >
          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-green-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white text-left">Training Mode</h3>
                  <p className="text-sm text-green-300">Teacher Forcing</p>
                </div>
              </div>
              {selectedMode === 'training' && (
                <div className="text-4xl">✓</div>
              )}
            </div>

            <div className="space-y-3 text-left">
              <div className="bg-black/20 rounded-lg p-4 border border-green-400/30">
                <div className="font-semibold text-green-200 mb-2">Input Sequence:</div>
                <div className="font-mono text-sm text-white bg-slate-800/50 rounded px-3 py-2">
                  &lt;START&gt; Nous sommes meilleurs
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-green-400/30">
                <div className="font-semibold text-green-200 mb-2">Expected Output:</div>
                <div className="font-mono text-sm text-white bg-slate-800/50 rounded px-3 py-2">
                  Nous sommes meilleurs &lt;END&gt;
                </div>
              </div>

              <div className="text-sm text-green-200 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Parallel processing with masking</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Learns from correct answers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span>Efficient batch training</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-green-300 bg-green-500/10 rounded-lg p-2 text-center">
              Used during model training phase
            </div>
          </div>
        </button>

        {/* Inference Mode */}
        <button
          onClick={() => handleModeSelect('inference')}
          className={`
            group relative overflow-hidden rounded-2xl border-4 transition-all duration-300
            ${selectedMode === 'inference' 
              ? 'border-blue-400 scale-105 shadow-2xl shadow-blue-500/50' 
              : 'border-slate-600 hover:border-blue-400/50 hover:scale-102'
            }
          `}
        >
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-blue-300" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white text-left">Inference Mode</h3>
                  <p className="text-sm text-blue-300">Autoregressive</p>
                </div>
              </div>
              {selectedMode === 'inference' && (
                <div className="text-4xl">✓</div>
              )}
            </div>

            <div className="space-y-3 text-left">
              <div className="bg-black/20 rounded-lg p-4 border border-blue-400/30">
                <div className="font-semibold text-blue-200 mb-2">Starting Point:</div>
                <div className="font-mono text-sm text-white bg-slate-800/50 rounded px-3 py-2">
                  &lt;START&gt;
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4 border border-blue-400/30">
                <div className="font-semibold text-blue-200 mb-2">Generation Steps:</div>
                <div className="space-y-1 font-mono text-xs text-white">
                  <div className="bg-slate-800/50 rounded px-3 py-1.5">1. &lt;START&gt; → Nous</div>
                  <div className="bg-slate-800/50 rounded px-3 py-1.5">2. &lt;START&gt; Nous → sommes</div>
                  <div className="bg-slate-800/50 rounded px-3 py-1.5">3. &lt;START&gt; Nous sommes → meilleurs</div>
                  <div className="bg-slate-800/50 rounded px-3 py-1.5">4. ... → &lt;END&gt;</div>
                </div>
              </div>

              <div className="text-sm text-blue-200 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>Sequential, one token at a time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>Each word depends on previous</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span>Real-world usage (ChatGPT!)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs text-blue-300 bg-blue-500/10 rounded-lg p-2 text-center">
              Used when generating actual translations
            </div>
          </div>
        </button>
      </div>

      {/* Comparison Table */}
      <div className="bg-slate-700/30 rounded-xl border border-slate-600 overflow-hidden">
        <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-600">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Key Differences
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="px-6 py-3 text-left text-slate-400 font-semibold">Aspect</th>
                <th className="px-6 py-3 text-left text-green-300 font-semibold">Training</th>
                <th className="px-6 py-3 text-left text-blue-300 font-semibold">Inference</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              <tr className="border-b border-slate-700">
                <td className="px-6 py-3 font-medium">Input</td>
                <td className="px-6 py-3 text-green-200">Full target sequence</td>
                <td className="px-6 py-3 text-blue-200">Only &lt;START&gt; token</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="px-6 py-3 font-medium">Processing</td>
                <td className="px-6 py-3 text-green-200">Parallel (all at once)</td>
                <td className="px-6 py-3 text-blue-200">Sequential (step-by-step)</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="px-6 py-3 font-medium">Masking</td>
                <td className="px-6 py-3 text-green-200">Triangular mask prevents future</td>
                <td className="px-6 py-3 text-blue-200">No future tokens exist yet</td>
              </tr>
              <tr className="border-b border-slate-700">
                <td className="px-6 py-3 font-medium">Speed</td>
                <td className="px-6 py-3 text-green-200">Fast (GPU parallelization)</td>
                <td className="px-6 py-3 text-blue-200">Slower (must wait for each token)</td>
              </tr>
              <tr>
                <td className="px-6 py-3 font-medium">Purpose</td>
                <td className="px-6 py-3 text-green-200">Learning weights</td>
                <td className="px-6 py-3 text-blue-200">Generating translations</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Selection Status */}
      {selectedMode && (
        <div className="text-center py-4 bg-purple-500/20 rounded-lg border border-purple-400">
          <div className="text-lg text-purple-200">
            Selected: <span className="font-bold text-purple-300">
              {selectedMode === 'training' ? '📚 Training Mode' : '🚀 Inference Mode'}
            </span>
          </div>
          <div className="text-sm text-purple-400 mt-1">
            Decoder visualization will proceed in {selectedMode} mode
          </div>
        </div>
      )}
    </div>
  );
}