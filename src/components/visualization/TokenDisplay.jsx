'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVisualizationStore } from '@/store/visualizationStore';
import { TIMINGS } from '@/lib/constants';
import IntuitionButton from '@/components/shared/IntuitionButton';

export default function TokenDisplay() {
  const { inputSentence, tokens, currentStep, isPlaying, animationSpeed } = useVisualizationStore();
  const containerRef = useRef(null);
  const sentenceRef = useRef(null);
  const tokenRefs = useRef([]);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || tokens.length === 0) return;

    const tl = gsap.timeline({ 
      paused: true,
      timeScale: animationSpeed 
    });
    timelineRef.current = tl;

    tl.fromTo(sentenceRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: TIMINGS.fadeInOut, ease: 'power2.out' }
    )
    .to(sentenceRef.current, {
      scale: 1.05,
      duration: 0.3,
      repeat: 1,
      yoyo: true,
      ease: 'power2.inOut'
    })
    .to(sentenceRef.current, {
      opacity: 0,
      duration: TIMINGS.fadeInOut
    })
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
    .to(tokenRefs.current, {
      scale: 1.1,
      duration: 0.3,
      repeat: 1,
      yoyo: true,
      stagger: 0.1,
      ease: 'power2.inOut'
    });

    if (currentStep === 'tokenizing' && isPlaying) {
      tl.play();
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [tokens, currentStep, isPlaying, animationSpeed]);

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(animationSpeed);
    }
  }, [animationSpeed]);

  if (tokens.length === 0 || currentStep !== 'tokenizing') return null;

  const intuitionContent = (
    <>
      <p className="text-lg">
        <strong>What is tokenization?</strong>
      </p>
      <p>
        Transformers don't understand text directly. They need to break it down into smaller pieces called "tokens". 
        Think of it like breaking a sentence into individual words so we can process each one.
      </p>
      <div className="bg-slate-700/50 rounded-lg p-4">
        <p className="font-semibold text-yellow-300 mb-2">Simple analogy:</p>
        <p className="text-sm">
          Imagine you're learning a new language. Instead of trying to understand an entire paragraph at once, 
          you'd break it down word by word. That's exactly what tokenization does!
        </p>
      </div>
      <p className="text-sm text-slate-400">
        In production transformers (like GPT), tokenization is more sophisticated and can split words into subwords. 
        For example, "unhappiness" might become ["un", "happiness"]. But we're keeping it simple here!
      </p>
    </>
  );

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <h2 className="text-2xl font-bold text-white">Step 1: Tokenization</h2>
        </div>
        <IntuitionButton 
          title="Understanding Tokenization"
          content={intuitionContent}
        />
      </div>

      <p className="text-slate-300 text-sm max-w-2xl">
        The input sentence is broken down into individual tokens (words). 
        Each token will be processed separately through the transformer.
      </p>

      <div className="bg-slate-700/30 rounded-xl p-8 border border-slate-600/50 min-h-48 flex items-center justify-center">
        <div
          ref={sentenceRef}
          className="absolute text-3xl font-mono text-white font-semibold opacity-0"
        >
          {inputSentence}
        </div>

        <div className="flex gap-4 flex-wrap justify-center">
          {tokens.map((token, idx) => (
            <div
              key={idx}
              ref={(el) => (tokenRefs.current[idx] = el)}
              className="relative opacity-0"
            >
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
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-slate-800">
                {idx}
              </div>
            </div>
          ))}
        </div>
      </div>

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