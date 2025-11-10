'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Zap, Brain, Target, Settings, Globe, Play, Info, Shuffle, ChevronDown, ChevronUp } from 'lucide-react';
import HeroAnimation from '../components/landing/HeroAnimation';
import Footer from '../components/landing/Footer'; // IMPORT THE SEPARATE FOOTER
import { CONFIG } from '../lib/constants';

export default function Home() {
  const router = useRouter();
  const [inputSentence, setInputSentence] = useState('');
  const [dimension, setDimension] = useState(6);
  const [numHeads, setNumHeads] = useState(2);
  const [targetLanguage, setTargetLanguage] = useState('french');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showExamples, setShowExamples] = useState(false); // NEW: Control examples visibility

  const languages = [
    { code: 'french', name: 'French', flag: '🇫🇷', nativeName: 'Français', example: 'Bonjour' },
    { code: 'spanish', name: 'Spanish', flag: '🇪🇸', nativeName: 'Español', example: 'Hola' },
    { code: 'german', name: 'German', flag: '🇩🇪', nativeName: 'Deutsch', example: 'Hallo' },
    { code: 'italian', name: 'Italian', flag: '🇮🇹', nativeName: 'Italiano', example: 'Ciao' },
    { code: 'portuguese', name: 'Portuguese', flag: '🇵🇹', nativeName: 'Português', example: 'Olá' },
    { code: 'urdu', name: 'Urdu', flag: '🇵🇰', nativeName: 'اردو', example: 'سلام', popular: true },
    { code: 'hindi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिंदी', example: 'नमस्ते', popular: true }
  ];

  // EXPANDED: More example sentences organized by category
  const exampleSentences = {
    popular: [
      { text: 'We are best', lang: 'french', emoji: '🏆', category: 'Popular' },
      { text: 'AI is powerful', lang: 'urdu', emoji: '🚀', category: 'Popular' },
      { text: 'We love learning', lang: 'hindi', emoji: '📚', category: 'Popular' }
    ],
    tech: [
      { text: 'Code is beautiful', lang: 'french', emoji: '💻', category: 'Tech' },
      { text: 'Data is important', lang: 'spanish', emoji: '📊', category: 'Tech' },
      { text: 'Neural networks learn', lang: 'german', emoji: '🧠', category: 'Tech' },
      { text: 'AI helps people', lang: 'urdu', emoji: '🤖', category: 'Tech' }
    ],
    education: [
      { text: 'We learn fast', lang: 'french', emoji: '🎓', category: 'Education' },
      { text: 'Students work hard', lang: 'spanish', emoji: '📝', category: 'Education' },
      { text: 'Books are good', lang: 'hindi', emoji: '📖', category: 'Education' }
    ],
    emotion: [
      { text: 'You are amazing', lang: 'french', emoji: '✨', category: 'Emotion' },
      { text: 'I love you', lang: 'italian', emoji: '❤️', category: 'Emotion' },
      { text: 'Life is good', lang: 'portuguese', emoji: '🌟', category: 'Emotion' }
    ]
  };

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
    
    if (dimension < 2 || dimension > 12) {
      setError('Dimension must be between 2 and 12');
      return;
    }

    if (dimension % numHeads !== 0) {
      setError(`Dimension (${dimension}) must be divisible by number of heads (${numHeads})`);
      return;
    }
    
    const queryParams = new URLSearchParams({
      sentence: cleanedSentence,
      dim: dimension.toString(),
      heads: numHeads.toString(),
      lang: targetLanguage
    }).toString();
    
    router.push(`/visualize?${queryParams}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVisualize();
    }
  };

  const loadExample = (text, lang = null) => {
    setInputSentence(text);
    if (lang) setTargetLanguage(lang);
    setError('');
    setShowExamples(false); // Auto-collapse after selection
  };

  const loadRandomExample = () => {
    const allExamples = Object.values(exampleSentences).flat();
    const random = allExamples[Math.floor(Math.random() * allExamples.length)];
    loadExample(random.text, random.lang);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse-slow" />
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute w-64 h-64 bg-pink-500/20 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative container mx-auto px-4 py-12 md:py-16">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16 animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 mb-6 border border-white/20 hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span className="text-sm text-white font-medium">Interactive Learning Experience</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">
            TransformerDryRun.ai
          </h1>
          
          <p className="text-lg md:text-2xl text-purple-200 max-w-3xl mx-auto leading-relaxed">
            Watch how Transformers <span className="text-yellow-300 font-semibold">actually work</span> with beautiful, 
            step-by-step animations of every mathematical operation
          </p>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <Globe className="w-5 h-5 text-cyan-400" />
              <span className="text-white font-semibold">7 Languages</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">100+ Words</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/10">
              <Brain className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">Fully Animated</span>
            </div>
          </div>
        </div>

        {/* Hero Animation */}
        <div className="max-w-5xl mx-auto mb-12 md:mb-16">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 md:p-8 shadow-2xl hover:border-purple-400/30 transition-all">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400 animate-pulse" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
              <span className="ml-4 text-sm text-purple-300 font-mono">live_demo.transformer</span>
            </div>
            <HeroAnimation />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-blue-400/50 transition-all hover:scale-105 group">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Full Encoder-Decoder</h3>
            <p className="text-purple-200 text-sm">Complete translation pipeline with attention visualization</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all hover:scale-105 group">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Every Step Animated</h3>
            <p className="text-purple-200 text-sm">From tokenization to final translation with math details</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-pink-400/50 transition-all hover:scale-105 group">
            <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6 text-pink-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Interactive Learning</h3>
            <p className="text-purple-200 text-sm">Control speed, pause anytime, explore at your own pace</p>
          </div>
        </div>

        {/* Main Input Section */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-6 md:p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Try It Yourself
              </h2>
              <Play className="w-6 h-6 text-purple-400 animate-pulse" />
            </div>
            
            <div className="space-y-6">
              {/* Sentence Input */}
              <div>
                <label className="text-sm text-purple-300 font-medium mb-2 block flex items-center gap-2">
                  <span className="text-lg">✍️</span>
                  Your Sentence (English)
                </label>
                <input
                  type="text"
                  value={inputSentence}
                  onChange={(e) => {
                    setInputSentence(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter a sentence (max 5 words)..."
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all text-lg backdrop-blur-sm"
                  maxLength={100}
                />
                <div className="flex items-center justify-between mt-2 px-2">
                  <p className="text-purple-300 text-sm">
                    {inputSentence.trim().split(/\s+/).filter(w => w.length > 0).length} / {CONFIG.maxWords} words
                  </p>
                  <button
                    onClick={loadRandomExample}
                    className="text-xs bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 px-3 py-1.5 rounded-lg border border-purple-400/30 text-purple-300 hover:text-white transition-all flex items-center gap-1"
                  >
                    <Shuffle className="w-3 h-3" />
                    Random
                  </button>
                </div>
              </div>

              {/* COLLAPSIBLE: Example Sentences Section */}
              <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setShowExamples(!showExamples)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Quick Examples
                    </h3>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                      {Object.values(exampleSentences).flat().length} examples
                    </span>
                  </div>
                  {showExamples ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  )}
                </button>

                {showExamples && (
                  <div className="p-4 pt-0 space-y-3 animate-fadeIn">
                    {Object.entries(exampleSentences).map(([category, examples]) => (
                      <div key={category}>
                        <p className="text-xs text-purple-400 font-medium mb-2 uppercase">{category}</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {examples.map((ex, idx) => (
                            <button
                              key={idx}
                              onClick={() => loadExample(ex.text, ex.lang)}
                              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/10 hover:border-purple-400/50 text-left transition-all group"
                            >
                              <span className="text-lg group-hover:scale-110 transition-transform">{ex.emoji}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-purple-200 truncate">"{ex.text}"</p>
                                <p className="text-xs text-purple-400 flex items-center gap-1">
                                  → {languages.find(l => l.code === ex.lang)?.flag}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Language Selection - WITH FLAGS ONLY (NO SHORTCUTS) */}
              <div>
                <label className="text-sm text-purple-300 font-medium mb-3 block flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Target Language
                </label>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setTargetLanguage(lang.code)}
                      className={`
                        relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all group
                        ${targetLanguage === lang.code
                          ? 'border-pink-400 bg-gradient-to-br from-pink-500/20 to-purple-500/20 scale-105 shadow-lg shadow-pink-500/30'
                          : 'border-white/10 bg-white/5 hover:border-pink-400/50 hover:bg-white/10'
                        }
                      `}
                    >
                      {lang.popular && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                          NEW
                        </div>
                      )}
                      
                      {/* LARGE FLAG - Main Identifier */}
                      <span className="text-4xl group-hover:scale-110 transition-transform">
                        {lang.flag}
                      </span>
                      
                      <div className="text-center">
                        <span className={`text-sm font-semibold block ${
                          targetLanguage === lang.code ? 'text-pink-300' : 'text-slate-300'
                        }`}>
                          {lang.name}
                        </span>
                        <span className={`text-xs block mt-0.5 ${
                          targetLanguage === lang.code ? 'text-purple-300' : 'text-slate-500'
                        }`}>
                          {lang.nativeName}
                        </span>
                      </div>

                      {/* Example on Hover */}
                      <div className={`
                        absolute inset-x-0 -bottom-8 text-xs text-center font-mono
                        opacity-0 group-hover:opacity-100 transition-opacity
                        ${targetLanguage === lang.code ? 'text-pink-300' : 'text-purple-400'}
                      `}>
                        {lang.example}
                      </div>
                    </button>
                  ))}
                </div>

                {(targetLanguage === 'urdu' || targetLanguage === 'hindi') && (
                  <div className="mt-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-400/30 rounded-lg p-4 animate-fadeIn">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-cyan-300 flex-shrink-0 mt-0.5" />
                      <p className="text-cyan-200 text-sm">
                        <strong>Note:</strong> {targetLanguage === 'urdu' ? 'Urdu' : 'Hindi'} uses Roman script 
                        for better visualization. Technical terms remain in English.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Settings */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-purple-300 hover:text-purple-200 transition-colors text-sm group"
              >
                <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Settings</span>
              </button>

              {showAdvanced && (
                <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4 animate-fadeIn">
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
                          if (newDim % numHeads !== 0) {
                            setNumHeads(2);
                          }
                          setError('');
                        }}
                        className="flex-1 accent-purple-500"
                      />
                      <span className="text-white font-mono font-bold text-lg w-12 text-center bg-purple-500/20 rounded px-2 py-1">
                        {dimension}
                      </span>
                    </div>
                  </div>

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
                              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/50'
                              : dimension % h === 0
                              ? 'bg-white/10 text-purple-300 hover:bg-white/20'
                              : 'bg-white/5 text-slate-600 cursor-not-allowed opacity-50'
                            }
                          `}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 animate-shake">
                  <p className="text-red-300 text-sm">⚠️ {error}</p>
                </div>
              )}

              {/* Main CTA */}
              <button
                onClick={handleVisualize}
                disabled={!inputSentence.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 hover:scale-105"
              >
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Start Visualization</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Info Banner */}
          <div className="mt-8 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-400/30 rounded-xl p-4 backdrop-blur-sm animate-fadeIn">
            <p className="text-blue-200 text-sm text-center">
              💡 <strong>Enhanced!</strong> Now with 100+ words across 7 languages including 🇵🇰 Urdu & 🇮🇳 Hindi!
            </p>
          </div>
        </div>
      </div>

      {/* USE SEPARATE FOOTER COMPONENT */}
      <Footer />

      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </main>
  );
}