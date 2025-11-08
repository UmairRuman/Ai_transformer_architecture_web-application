'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, Brain, Target, Settings } from 'lucide-react';
import HeroAnimation from '../components/landing/HeroAnimation';
import { CONFIG } from '../lib/constants';

export default function Home() {
  const router = useRouter();
  const [inputSentence, setInputSentence] = useState('');
  const [dimension, setDimension] = useState(6);
  const [numHeads, setNumHeads] = useState(2);
  const [targetLanguage, setTargetLanguage] = useState('french');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const languages = [
    { code: 'french', name: 'French', flag: '🇫🇷' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸' },
    { code: 'german', name: 'German', flag: '🇩🇪' },
    { code: 'italian', name: 'Italian', flag: '🇮🇹' },
    { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹' }
  ];

  const handleVisualize = () => {
    const cleanedSentence = inputSentence.trim().replace(/\s+/g, ' ');
    const words = cleanedSentence.split(' ').filter(w => w.length > 0);
    
    if (words.length === 0) {
      setError('Please enter a sentence');
      return;
    }
    
    if (words.length > CONFIG.maxWords) {
      setError(`Maximum ${CONFIG.maxWords} words allowed`);
      return;
    }
    
    // Validate dimension
    if (dimension < 2 || dimension > 12) {
      setError('Dimension must be between 2 and 12');
      return;
    }

    // Validate heads
    if (dimension % numHeads !== 0) {
      setError(`Dimension (${dimension}) must be divisible by number of heads (${numHeads})`);
      return;
    }
    
    const queryParams = new URLSearchParams({
      sentence: cleanedSentence,
      dim: dimension.toString(),
      heads: numHeads.toString()
    }).toString();
    
    router.push(`/visualize?${queryParams}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVisualize();
    }
  };

  const loadExample = () => {
    const exampleSentence = 'We are best';
    setInputSentence(exampleSentence);
    setDimension(6);
    setNumHeads(2);
    setError('');
    
    const queryParams = new URLSearchParams({
      sentence: exampleSentence,
      dim: '6',
      heads: '2'
    }).toString();
    router.push(`/visualize?${queryParams}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow" />
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-16">
        <div className="text-center mb-16 animate-float">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm text-white font-medium">Interactive Learning Experience</span>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            TransformerDryRun.ai
          </h1>
          
          <p className="text-xl md:text-2xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
            Watch how Transformers <span className="text-yellow-300 font-semibold">actually work</span> with beautiful, 
            step-by-step animations of every mathematical operation
          </p>
        </div>

        <div className="max-w-5xl mx-auto mb-16">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-sm text-purple-300 font-mono">live_demo.transformer</span>
            </div>
            
            <HeroAnimation />
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all hover:scale-105">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">See The Math</h3>
            <p className="text-purple-200 text-sm">Watch every vector operation, dot product, and matrix multiplication in real-time</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all hover:scale-105">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Parallel Processing</h3>
            <p className="text-purple-200 text-sm">See how multi-head attention processes multiple words simultaneously</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all hover:scale-105">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Customizable</h3>
            <p className="text-purple-200 text-sm">Adjust dimensions and attention heads to understand scalability</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              Try It Yourself
            </h2>
            <p className="text-purple-200 text-center mb-6">
              Enter your own sentence and watch it flow through the Transformer
            </p>
            
            <div className="space-y-4">
              {/* Sentence Input */}
              <div>
                <label className="text-sm text-purple-300 font-medium mb-2 block">
                  Your Sentence
                </label>
                <input
                  type="text"
                  value={inputSentence}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s+/g, ' ');
                    setInputSentence(value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a sentence (max 5 words)..."
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-lg backdrop-blur-sm"
                  maxLength={100}
                />
                <p className="text-purple-300 text-sm mt-2 ml-2">
                  {inputSentence.trim().split(/\s+/).filter(w => w.length > 0).length} / {CONFIG.maxWords} words
                </p>
              </div>

              {/* Advanced Settings Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
              </button>

              {/* Advanced Settings */}
              {showAdvanced && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
                  {/* Dimension Input */}
                  <div>
                    <label className="text-sm text-purple-300 font-medium mb-2 block">
                      Embedding Dimension (d_model)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="2"
                        value={dimension}
                        onChange={(e) => {
                          const newDim = parseInt(e.target.value);
                          setDimension(newDim);
                          // Auto-adjust heads if needed
                          if (newDim % numHeads !== 0) {
                            setNumHeads(2);
                          }
                          setError('');
                        }}
                        className="flex-1"
                      />
                      <span className="text-white font-mono font-bold text-lg w-12 text-center">
                        {dimension}
                      </span>
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                      Higher dimensions = more expressive but slower animations
                    </p>
                  </div>

                  {/* Number of Heads */}
                  <div>
                    <label className="text-sm text-purple-300 font-medium mb-2 block">
                      Number of Attention Heads
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 6].map((h) => (
                        <button
                          key={h}
                          disabled={dimension % h !== 0}
                          onClick={() => {
                            setNumHeads(h);
                            setError('');
                          }}
                          className={`
                            flex-1 py-2 rounded-lg font-medium transition-all
                            ${numHeads === h
                              ? 'bg-purple-500 text-white'
                              : dimension % h === 0
                              ? 'bg-white/10 text-purple-300 hover:bg-white/20'
                              : 'bg-white/5 text-slate-600 cursor-not-allowed'
                            }
                          `}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-purple-400 mt-1">
                      Dimension must be divisible by number of heads (current: {dimension} ÷ {numHeads} = {dimension / numHeads})
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-3">
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleVisualize}
                disabled={!inputSentence.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/50"
              >
                <span>Start Visualization</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={loadExample}
                className="w-full bg-white/10 backdrop-blur-sm text-purple-200 font-medium py-3 rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                Load Example: "We are best" (dim=6, heads=2)
              </button>
            </div>
          </div>

          <div className="mt-8 bg-blue-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-blue-200 text-sm text-center">
              💡 <strong>Pro Tip:</strong> Start with default settings (dim=6, heads=2) to see the full animation, 
              then experiment with different dimensions to understand how transformers scale!
            </p>
          </div>
        </div>

        <div className="text-center mt-16 text-purple-300 text-sm">
          <p>Built with Next.js, GSAP, and ❤️ for learning</p>
        </div>
      </div>
    </main>
  );
}