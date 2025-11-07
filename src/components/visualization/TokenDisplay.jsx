'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVisualizationStore } from '@/store/visualizationStore';
import { TIMINGS } from '@/lib/constants';

export default function TokenDisplay() {
  const { inputSentence, tokens, currentStep, isPlaying, animationSpeed, hasStarted } = useVisualizationStore();
  const containerRef = useRef(null);
  const sentenceRef = useRef(null);
  const tokenRefs = useRef([]);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || tokens.length === 0) return;

    // Create timeline
    const tl = gsap.timeline({ 
      paused: true,
      timeScale: animationSpeed 
    });
    timelineRef.current = tl;

    // Animation: Sentence appears
    tl.fromTo(sentenceRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: TIMINGS.fadeInOut, ease: 'power2.out' }
    )
    // Sentence shakes/pulses before splitting
    .to(sentenceRef.current, {
      scale: 1.05,
      duration: 0.3,
      repeat: 1,
      yoyo: true,
      ease: 'power2.inOut'
    })
    // Sentence fades out
    .to(sentenceRef.current, {
      opacity: 0,
      duration: TIMINGS.fadeInOut
    })
    // Tokens appear with stagger
    .fromTo(tokenRefs.current,
      { opacity: 0, scale: 0.5, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: TIMINGS.tokenSplit,
        stagger: 0.15,
        ease: 'back.out(1.7)'
      }
    )
    // Tokens pulse to show they're active
    .to(tokenRefs.current, {
      scale: 1.1,
      duration: 0.3,
      repeat: 1,
      yoyo: true,
      stagger: 0.1,
      ease: 'power2.inOut'
    });

    // Play animation if in tokenizing step
    if (currentStep === 'tokenizing' && isPlaying) {
      tl.play();
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [tokens, currentStep, isPlaying, animationSpeed]);

  // Update timeline speed when animationSpeed changes
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(animationSpeed);
    }
  }, [animationSpeed]);

  if (tokens.length === 0) return null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Step 1: Tokenization</h2>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm max-w-2xl">
        The input sentence is broken down into individual tokens (words). 
        Each token will be processed separately through the transformer.
      </p>

      {/* Visualization Area */}
      <div className="bg-slate-700/30 rounded-xl p-8 border border-slate-600/50 min-h-48 flex items-center justify-center">
        {/* Original Sentence */}
        <div
          ref={sentenceRef}
          className="absolute text-3xl font-mono text-white font-semibold opacity-0"
        >
          {inputSentence}
        </div>

        {/* Tokenized Words */}
        <div className="flex gap-4 flex-wrap justify-center">
          {tokens.map((token, idx) => (
            <div
              key={idx}
              ref={(el) => (tokenRefs.current[idx] = el)}
              className="relative opacity-0"
            >
              {/* Token Box */}
              <div className="bg-gradient-to-br from-blue-500/30 to-blue-600/30 backdrop-blur-sm px-6 py-4 rounded-xl border-2 border-blue-400/50 shadow-lg hover:shadow-blue-400/50 transition-shadow">
                <div className="text-center">
                  <div className="text-xs text-blue-300 font-semibold mb-1">
                    Token {idx + 1}
                  </div>
                  <div className="text-2xl font-mono font-bold text-white">
                    "{token}"
                  </div>
                </div>
              </div>

              {/* Token Index Badge */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800">
                {idx}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">💡</div>
          <div>
            <div className="font-semibold text-blue-300 mb-1">What's happening?</div>
            <p className="text-blue-200 text-sm">
              Your sentence <span className="font-mono bg-slate-700/50 px-2 py-0.5 rounded">"{inputSentence}"</span> has 
              been split into <span className="font-bold">{tokens.length} token{tokens.length !== 1 ? 's' : ''}</span>. 
              In a real transformer, we'd use a tokenizer like WordPiece or BPE, but we're using simple word splitting for clarity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}