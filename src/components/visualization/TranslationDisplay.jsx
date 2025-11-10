'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, ArrowRight, Globe, Zap, RefreshCw } from 'lucide-react';
import { useVisualizationStore } from '../../store/visualizationStore';
import { translateSentence } from '../../lib/translation';

export default function TranslationDisplay() {
  const {
    tokens = [],
    decoderTokens = [],
    predictedTokens = [],
    targetLanguage = 'french',
    currentStep,
    inputSentence
  } = useVisualizationStore();

  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    if (currentStep === 'translation_complete') {
      setTimeout(() => setShowComparison(true), 500);
    }
  }, [currentStep]);

  if (currentStep !== 'translation_complete') return null;

  // Get expected translation
  const expectedTranslation = translateSentence(tokens, targetLanguage);
  
  // Remove special tokens from predictions
  const cleanedPredictions = predictedTokens.filter(t => 
    !['<START>', '<END>', '<PAD>'].includes(t)
  );

  // Calculate accuracy
  const correctPredictions = cleanedPredictions.filter((pred, idx) => 
    pred === expectedTranslation[idx]
  ).length;
  const accuracy = (correctPredictions / expectedTranslation.length) * 100;

  const languageFlags = {
    french: '🇫🇷',
    spanish: '🇪🇸',
    german: '🇩🇪',
    italian: '🇮🇹',
    portuguese: '🇵🇹'
  };

  const languageNames = {
    french: 'French',
    spanish: 'Spanish',
    german: 'German',
    italian: 'Italian',
    portuguese: 'Portuguese'
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-center gap-3">
        <CheckCircle className="w-8 h-8 text-green-400" />
        <h2 className="text-3xl font-bold text-white">
          🎉 Translation Complete!
        </h2>
      </div>

      {/* Main Translation Card */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl border-2 border-green-400 p-8 shadow-2xl">
        <div className="space-y-8">
          
          {/* Source Language */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-300 font-semibold">
              <Globe className="w-5 h-5" />
              <span>English (Source)</span>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-blue-400/50">
              <div className="text-3xl font-mono text-white text-center">
                "{inputSentence}"
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex items-center justify-center">
            <div className="bg-slate-700/50 rounded-full p-4">
              <ArrowRight className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Target Language */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-pink-300 font-semibold">
              <span className="text-2xl">{languageFlags[targetLanguage]}</span>
              <span>{languageNames[targetLanguage]} (Target)</span>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-6 border border-pink-400/50">
              <div className="text-3xl font-mono text-white text-center">
                "{cleanedPredictions.join(' ')}"
              </div>
            </div>
          </div>

          {/* Accuracy Badge */}
          <div className="text-center">
            <div className="inline-flex items-center gap-3 bg-green-500/20 rounded-full px-6 py-3 border border-green-400">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-lg font-bold text-green-300">
                {accuracy.toFixed(0)}% Match
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Comparison */}
      {showComparison && (
        <div className="bg-slate-700/30 rounded-xl border border-slate-600/50 overflow-hidden">
          <div className="bg-slate-800/50 px-6 py-3 border-b border-slate-600">
            <h3 className="font-bold text-white flex items-center gap-2">
              🔍 Word-by-Word Comparison
            </h3>
          </div>
          
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="px-4 py-3 text-left text-slate-400 font-semibold">Position</th>
                    <th className="px-4 py-3 text-left text-blue-300 font-semibold">English</th>
                    <th className="px-4 py-3 text-left text-green-300 font-semibold">Expected</th>
                    <th className="px-4 py-3 text-left text-pink-300 font-semibold">Predicted</th>
                    <th className="px-4 py-3 text-center text-slate-400 font-semibold">Match</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, idx) => {
                    const expected = expectedTranslation[idx];
                    const predicted = cleanedPredictions[idx];
                    const isMatch = expected === predicted;
                    
                    return (
                      <tr key={idx} className="border-b border-slate-700">
                        <td className="px-4 py-3 text-slate-400 font-mono">{idx + 1}</td>
                        <td className="px-4 py-3 text-blue-200 font-mono">{token}</td>
                        <td className="px-4 py-3 text-green-200 font-mono">{expected}</td>
                        <td className={`px-4 py-3 font-mono font-bold ${
                          isMatch ? 'text-green-300' : 'text-red-300'
                        }`}>
                          {predicted || '???'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isMatch ? (
                            <span className="text-green-400 text-xl">✓</span>
                          ) : (
                            <span className="text-red-400 text-xl">✗</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* How it Works */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🧠</div>
          <div className="flex-1 space-y-3">
            <h3 className="font-bold text-blue-300 text-lg">How the Translation Happened</h3>
            
            <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-200">
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="font-bold text-blue-300 mb-2">🔵 Encoder Side</div>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Tokenized English sentence</li>
                  <li>Created embeddings</li>
                  <li>Added positional encoding</li>
                  <li>Applied self-attention</li>
                  <li>Processed through FFN</li>
                  <li>Generated context vectors</li>
                </ol>
              </div>

              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="font-bold text-pink-300 mb-2">🎯 Decoder Side</div>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Started with &lt;START&gt; token</li>
                  <li>Generated embeddings</li>
                  <li>Applied masked self-attention</li>
                  <li>Used cross-attention with encoder</li>
                  <li>Processed through FFN</li>
                  <li>Projected to vocabulary</li>
                  <li>Selected highest probability words</li>
                </ol>
              </div>
            </div>

            <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-400/30">
              <div className="flex items-start gap-2">
                <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-200">
                  <strong>Note:</strong> This is a simplified demonstration. Real transformers have:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Multiple encoder/decoder layers (6-12+)</li>
                    <li>Larger vocabularies (30,000+ words)</li>
                    <li>Higher dimensions (512-1024)</li>
                    <li>More attention heads (8-16)</li>
                    <li>Billions of learned parameters</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => window.location.href = '/'}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl transition-all shadow-lg"
        >
          <RefreshCw className="w-5 h-5" />
          Try Another Translation
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600">
          <div className="text-2xl font-bold text-blue-300">{tokens.length}</div>
          <div className="text-xs text-slate-400 mt-1">Source Words</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600">
          <div className="text-2xl font-bold text-pink-300">{cleanedPredictions.length}</div>
          <div className="text-xs text-slate-400 mt-1">Target Words</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600">
          <div className="text-2xl font-bold text-green-300">{correctPredictions}</div>
          <div className="text-xs text-slate-400 mt-1">Correct Matches</div>
        </div>
        <div className="bg-slate-700/30 rounded-lg p-4 text-center border border-slate-600">
          <div className="text-2xl font-bold text-yellow-300">{accuracy.toFixed(0)}%</div>
          <div className="text-xs text-slate-400 mt-1">Accuracy</div>
        </div>
      </div>
    </div>
  );
}