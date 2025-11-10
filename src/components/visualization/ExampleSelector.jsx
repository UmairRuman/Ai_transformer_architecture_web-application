'use client';

import React, { useState } from 'react';
import { Sparkles, Shuffle, TrendingUp, Heart, GraduationCap, Cpu } from 'lucide-react';

export default function ExampleSelector({ onSelectExample, currentLanguage = 'french' }) {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const exampleCategories = {
    all: {
      icon: Sparkles,
      color: 'purple',
      examples: [
        { text: 'We are best', lang: 'french', emoji: '🏆' },
        { text: 'AI is powerful', lang: 'urdu', emoji: '🚀' },
        { text: 'We love learning', lang: 'hindi', emoji: '📚' },
        { text: 'Deep learning works', lang: 'spanish', emoji: '🧠' },
        { text: 'I am happy', lang: 'german', emoji: '😊' }
      ]
    },
    tech: {
      icon: Cpu,
      color: 'cyan',
      examples: [
        { text: 'Code is beautiful', lang: 'french', emoji: '💻' },
        { text: 'AI helps people', lang: 'urdu', emoji: '🤖' },
        { text: 'Data is important', lang: 'spanish', emoji: '📊' },
        { text: 'Neural networks learn', lang: 'hindi', emoji: '🧠' },
        { text: 'Technology is great', lang: 'german', emoji: '⚡' }
      ]
    },
    education: {
      icon: GraduationCap,
      color: 'pink',
      examples: [
        { text: 'We learn fast', lang: 'french', emoji: '🎓' },
        { text: 'Students work hard', lang: 'urdu', emoji: '📝' },
        { text: 'Books are good', lang: 'spanish', emoji: '📖' },
        { text: 'Knowledge is power', lang: 'hindi', emoji: '💡' },
        { text: 'Learning is fun', lang: 'german', emoji: '🎉' }
      ]
    },
    emotion: {
      icon: Heart,
      color: 'rose',
      examples: [
        { text: 'You are amazing', lang: 'french', emoji: '✨' },
        { text: 'I love you', lang: 'urdu', emoji: '❤️' },
        { text: 'We are friends', lang: 'spanish', emoji: '🤝' },
        { text: 'Life is good', lang: 'hindi', emoji: '🌟' },
        { text: 'Today is great', lang: 'german', emoji: '🎊' }
      ]
    }
  };

  const colorClasses = {
    purple: {
      bg: 'bg-purple-500/10',
      border: 'border-purple-400/30',
      hover: 'hover:border-purple-400',
      text: 'text-purple-400'
    },
    cyan: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-400/30',
      hover: 'hover:border-cyan-400',
      text: 'text-cyan-400'
    },
    pink: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-400/30',
      hover: 'hover:border-pink-400',
      text: 'text-pink-400'
    },
    rose: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-400/30',
      hover: 'hover:border-rose-400',
      text: 'text-rose-400'
    }
  };

  const currentCategory = exampleCategories[selectedCategory];
  const colors = colorClasses[currentCategory.color];

  const handleRandomExample = () => {
    const allExamples = Object.values(exampleCategories).flatMap(cat => cat.examples);
    const randomExample = allExamples[Math.floor(Math.random() * allExamples.length)];
    onSelectExample(randomExample.text, randomExample.lang);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          Quick Examples
        </h3>
        <button
          onClick={handleRandomExample}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 hover:border-purple-400 px-3 py-1.5 rounded-lg transition-all group"
        >
          <Shuffle className="w-4 h-4 text-purple-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-sm text-purple-300">Random</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {Object.entries(exampleCategories).map(([key, category]) => {
          const Icon = category.icon;
          const isActive = selectedCategory === key;
          const tabColors = colorClasses[category.color];
          
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap
                ${isActive 
                  ? `${tabColors.bg} ${tabColors.border} scale-105 shadow-lg` 
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? tabColors.text : 'text-purple-300'}`} />
              <span className={`text-sm font-medium ${isActive ? tabColors.text : 'text-purple-300'}`}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Example Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {currentCategory.examples.map((example, idx) => (
          <button
            key={idx}
            onClick={() => onSelectExample(example.text, example.lang)}
            className={`
              ${colors.bg} ${colors.border} ${colors.hover}
              border rounded-lg p-4 transition-all group
              hover:scale-105 hover:shadow-lg text-left
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl group-hover:scale-110 transition-transform">
                {example.emoji}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm group-hover:text-purple-200 transition-colors">
                  "{example.text}"
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-purple-400">→</span>
                  <span className="text-xs text-purple-300">
                    {example.lang.charAt(0).toUpperCase() + example.lang.slice(1)}
                  </span>
                  {/* Language flags */}
                  <span className="text-sm">
                    {example.lang === 'french' && '🇫🇷'}
                    {example.lang === 'spanish' && '🇪🇸'}
                    {example.lang === 'german' && '🇩🇪'}
                    {example.lang === 'urdu' && '🇵🇰'}
                    {example.lang === 'hindi' && '🇮🇳'}
                    {example.lang === 'italian' && '🇮🇹'}
                    {example.lang === 'portuguese' && '🇵🇹'}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Info Banner */}
      <div className="mt-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-lg p-3">
        <p className="text-blue-200 text-xs text-center">
          💡 Click any example to auto-fill and set the target language!
        </p>
      </div>
    </div>
  );
}