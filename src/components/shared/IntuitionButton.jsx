'use client';

import { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

export default function IntuitionButton({ title, content, examples }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border-2 border-yellow-400/50 hover:border-yellow-400 rounded-lg transition-all group"
      >
        <Lightbulb className="w-4 h-4 text-yellow-400 group-hover:animate-pulse" />
        <span className="text-yellow-300 font-semibold text-sm">Why does this work?</span>
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={() => setIsOpen(false)}
        >
          {/* Modal Content */}
          <div 
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border-2 border-yellow-400/50 shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-b border-yellow-400/30 p-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500/30 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{title}</h3>
                  <p className="text-sm text-yellow-300">Understanding the concept</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Main Content */}
              <div className="prose prose-invert">
                <div className="text-slate-200 leading-relaxed space-y-3">
                  {content.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>

              {/* Examples Section */}
              {examples && examples.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-700" />
                    <span className="text-sm font-semibold text-slate-400">Examples</span>
                    <div className="h-px flex-1 bg-slate-700" />
                  </div>
                  
                  <div className="space-y-3">
                    {examples.map((example, idx) => (
                      <div key={idx} className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                        <div className="text-sm text-blue-300 font-semibold mb-2">
                          {example.label}
                        </div>
                        <div className="text-sm text-slate-300">
                          {example.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="w-full py-3 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/50 rounded-lg transition-colors text-yellow-300 font-semibold"
              >
                Got it! ✨
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}