'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVisualizationStore } from '@/store/visualizationStore';
import { getPositionalEncoding, addVectors } from '@/lib/transformerLogic';
import { TIMINGS, CONFIG } from '@/lib/constants';
import Vector from '@/components/shared/Vector';

export default function PositionalEncoding() {
  const { 
    tokens, 
    embeddings, 
    positionEncodings, 
    setPositionEncodings,
    finalInputVectors,
    setFinalInputVectors,
    currentStep, 
    isPlaying, 
    animationSpeed 
  } = useVisualizationStore();
  
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (embeddings.length === 0 || currentStep !== 'positional') return;

    // Generate positional encodings
    const newPositionEncodings = embeddings.map((_, idx) => 
      getPositionalEncoding(idx, CONFIG.dModel)
    );
    setPositionEncodings(newPositionEncodings);

    // Calculate final vectors (embedding + positional encoding)
    const newFinalVectors = embeddings.map((embedding, idx) => 
      addVectors(embedding, newPositionEncodings[idx])
    );
    setFinalInputVectors(newFinalVectors);

    // Force a re-render to trigger animations
    setTimeout(() => {
      if (timelineRef.current) {
        timelineRef.current.restart();
      }
    }, 100);
  }, [embeddings, setPositionEncodings, setFinalInputVectors, currentStep]);

  useEffect(() => {
    if (!containerRef.current || positionEncodings.length === 0 || currentStep !== 'positional') return;

    // Create timeline
    const tl = gsap.timeline({ 
      paused: true,
      timeScale: animationSpeed 
    });
    timelineRef.current = tl;

    // Animate each positional encoding
    positionEncodings.forEach((_, idx) => {
      tl.fromTo(
        `.pos-encoding-${idx}`,
        { opacity: 0, y: -30, scale: 0.8 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: TIMINGS.positionalEncoding, 
          ease: 'back.out(1.7)' 
        }
      )
      .to(
        `.pos-encoding-${idx}`,
        {
          y: 10,
          duration: 0.3,
          ease: 'power2.inOut'
        }
      )
      .fromTo(
        `.plus-sign-${idx}`,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' },
        '-=0.2'
      )
      .to(
        [`.embedding-vis-${idx}`, `.pos-encoding-${idx}`],
        {
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out'
        }
      )
      .fromTo(
        `.final-vector-${idx}`,
        { opacity: 0, scale: 0.5, y: 20 },
        { 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          duration: TIMINGS.fadeInOut, 
          ease: 'back.out(1.7)' 
        }
      )
      .to(
        `.final-vector-${idx}`,
        {
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)',
          duration: 0.3,
          repeat: 1,
          yoyo: true
        }
      )
      .to(
        [`.embedding-vis-${idx}`, `.pos-encoding-${idx}`],
        {
          scale: 1,
          duration: 0.2,
          ease: 'power2.in'
        }
      );
    });

    // Play animation if in positional step
    if (currentStep === 'positional' && isPlaying) {
      tl.play();
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [positionEncodings, currentStep, isPlaying, animationSpeed]);

  // Update timeline speed
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(animationSpeed);
    }
  }, [animationSpeed]);

  if (positionEncodings.length === 0 || currentStep !== 'positional') return null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Step 3: Positional Encoding</h2>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm max-w-2xl">
        Since transformers have no inherent sense of order, we add positional information 
        to each embedding. This tells the model where each word appears in the sequence.
      </p>

      {/* Visualization Area */}
      <div className="bg-slate-700/30 rounded-xl p-8 border border-slate-600/50">
        <div className="space-y-12">
          {positionEncodings.map((posEncoding, idx) => (
            <div key={idx} className="space-y-4">
              {/* Token Label */}
              <div className="text-center">
                <span className="text-lg font-mono font-bold text-white">
                  "{tokens[idx]}" <span className="text-slate-500">at position {idx}</span>
                </span>
              </div>

              {/* Addition Visualization */}
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {/* Original Embedding */}
                <div className={`embedding-vis-${idx}`}>
                  <Vector 
                    values={embeddings[idx]} 
                    label="Embedding"
                    color="#A855F7"
                    showValues={false}
                    size="small"
                  />
                </div>

                {/* Plus Sign */}
                <div className={`plus-sign-${idx} text-4xl text-green-400 font-bold opacity-0`}>
                  +
                </div>

                {/* Positional Encoding */}
                <div className={`pos-encoding-${idx} opacity-0`}>
                  <Vector 
                    values={posEncoding} 
                    label={`PE(${idx})`}
                    color="#F59E0B"
                    showValues={false}
                    size="small"
                  />
                </div>

                {/* Equals Sign */}
                <div className="text-4xl text-slate-500 font-bold">
                  =
                </div>

                {/* Final Vector */}
                <div className={`final-vector-${idx} opacity-0`}>
                  <Vector 
                    values={finalInputVectors[idx]} 
                    label="Final Input"
                    color="#10B981"
                    showValues={true}
                    size="medium"
                  />
                </div>
              </div>

              {/* Separator */}
              {idx < positionEncodings.length - 1 && (
                <div className="border-t border-slate-600/50 mt-8" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-green-500/10 border border-green-400/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📍</div>
          <div>
            <div className="font-semibold text-green-300 mb-1">Why Positional Encoding?</div>
            <p className="text-green-200 text-sm mb-3">
              Without positional information, "dog bites man" and "man bites dog" would be 
              identical to the transformer! Positional encoding adds unique patterns for each position.
            </p>
            <div className="bg-slate-700/50 rounded px-3 py-2 space-y-2">
              <div className="text-xs font-mono text-slate-300">
                <strong>Formula:</strong> PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
              </div>
              <div className="text-xs text-slate-400">
                This creates a unique signature for each position that the model can learn to use.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Step Indicator */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 bg-slate-700/50 rounded-lg px-6 py-3 border border-slate-600">
          <span className="text-slate-300 font-medium">
            ✨ Ready for Attention Mechanism
          </span>
        </div>
      </div>
    </div>
  );
}