'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVisualizationStore } from '../../store/visualizationStore';
import { getPositionalEncoding, addVectors } from '../../lib/transformerLogic';
import { TIMINGS } from '../../lib/constants';
import Vector from '../shared/Vector';

export default function DecoderPositionalEncoding() {
  const { 
    decoderTokens = [],
    decoderEmbeddings = [],
    decoderPositionEncodings = [],
    setDecoderPositionEncodings,
    decoderFinalInputVectors = [],
    setDecoderFinalInputVectors,
    currentStep, 
    isPlaying, 
    animationSpeed,
    config,
    setCurrentStep
  } = useVisualizationStore();
  
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const dModel = config?.dModel || 6;

  // Generate positional encodings for decoder
  useEffect(() => {
    if (decoderEmbeddings.length === 0) return;

    const newPositionEncodings = decoderEmbeddings.map((_, idx) => 
      getPositionalEncoding(idx, dModel)
    );
    setDecoderPositionEncodings(newPositionEncodings);

    const newFinalVectors = decoderEmbeddings.map((embedding, idx) => 
      addVectors(embedding, newPositionEncodings[idx])
    );
    setDecoderFinalInputVectors(newFinalVectors);
  }, [decoderEmbeddings, dModel, setDecoderPositionEncodings, setDecoderFinalInputVectors]);

  // Create and manage animation timeline
  useEffect(() => {
    if (!containerRef.current || decoderPositionEncodings.length === 0 || currentStep !== 'decoder_positional') return;

    // Kill existing timeline
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline
    const tl = gsap.timeline({ 
      paused: true,
      timeScale: animationSpeed,
      onComplete: () => {
        console.log('Decoder PositionalEncoding complete. Advancing to masked attention.');
        setCurrentStep('decoder_masked_attention');
      }
    });
    timelineRef.current = tl;

    // Animate each positional encoding
    decoderPositionEncodings.forEach((_, idx) => {
      tl.fromTo(
        `.decoder-pos-encoding-${idx}`,
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
        `.decoder-pos-encoding-${idx}`,
        {
          y: 10,
          duration: 0.3,
          ease: 'power2.inOut'
        }
      )
      .fromTo(
        `.decoder-plus-sign-${idx}`,
        { opacity: 0, scale: 0 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' },
        '-=0.2'
      )
      .to(
        [`.decoder-embedding-vis-${idx}`, `.decoder-pos-encoding-${idx}`],
        {
          scale: 1.05,
          duration: 0.2,
          ease: 'power2.out'
        }
      )
      .fromTo(
        `.decoder-final-vector-${idx}`,
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
        `.decoder-final-vector-${idx}`,
        {
          boxShadow: '0 0 25px rgba(16, 185, 129, 0.6)',
          duration: 0.3,
          repeat: 1,
          yoyo: true
        }
      )
      .to(
        [`.decoder-embedding-vis-${idx}`, `.decoder-pos-encoding-${idx}`],
        {
          scale: 1,
          duration: 0.2,
          ease: 'power2.in'
        }
      );
    });

    // Play or pause based on state
    if (isPlaying) {
      tl.play();
    } else {
      tl.pause();
    }

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [decoderPositionEncodings, currentStep, animationSpeed, setCurrentStep]);

  // Handle play/pause toggle
  useEffect(() => {
    if (!timelineRef.current) return;

    if (currentStep === 'decoder_positional') {
      if (isPlaying) {
        timelineRef.current.play();
      } else {
        timelineRef.current.pause();
      }
    }
  }, [isPlaying, currentStep]);

  // Update timeline speed
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.timeScale(animationSpeed);
    }
  }, [animationSpeed]);

  if (decoderPositionEncodings.length === 0 || currentStep !== 'decoder_positional') return null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">
          🎯 Decoder Step 2: Positional Encoding (Target)
        </h2>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm max-w-2xl">
        Adding positional information to the <strong className="text-pink-300">target language</strong> embeddings. 
        Just like the encoder, the decoder needs to know word positions.
      </p>

      {/* Visualization Area */}
      <div className="bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-xl p-8 border border-pink-600/50">
        <div className="space-y-12">
          {decoderPositionEncodings.map((posEncoding, idx) => (
            <div key={idx} className="space-y-4">
              {/* Token Label */}
              <div className="text-center">
                <span className="text-lg font-mono font-bold text-white">
                  "{decoderTokens[idx]}" <span className="text-pink-400">at position {idx}</span>
                </span>
              </div>

              {/* Addition Visualization */}
              <div className="flex items-center justify-center gap-6 flex-wrap">
                {/* Original Embedding */}
                <div className={`decoder-embedding-vis-${idx}`}>
                  <Vector 
                    values={decoderEmbeddings[idx]} 
                    label="Target Embed"
                    color="#EC4899"
                    showValues={false}
                    size="small"
                  />
                </div>

                {/* Plus Sign */}
                <div className={`decoder-plus-sign-${idx} text-4xl text-pink-400 font-bold opacity-0`}>
                  +
                </div>

                {/* Positional Encoding */}
                <div className={`decoder-pos-encoding-${idx} opacity-0`}>
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
                <div className={`decoder-final-vector-${idx} opacity-0`}>
                  <Vector 
                    values={decoderFinalInputVectors[idx] || []} 
                    label="Decoder Input"
                    color="#10B981"
                    showValues={true}
                    size="medium"
                  />
                </div>
              </div>

              {/* Separator */}
              {idx < decoderPositionEncodings.length - 1 && (
                <div className="border-t border-pink-600/30 mt-8" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-pink-500/10 border border-pink-400/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <div className="font-semibold text-pink-300 mb-1">Decoder Positional Encoding</div>
            <p className="text-pink-200 text-sm mb-3">
              The decoder uses the <strong>same positional encoding formula</strong> as the encoder, 
              but applies it to the target language tokens.
            </p>
            <div className="bg-slate-700/50 rounded px-3 py-2 space-y-2">
              <div className="text-xs font-mono text-slate-300">
                <strong>Formula:</strong> PE(pos, 2i) = sin(pos / 10000^(2i/d_model))
              </div>
              <div className="text-xs text-pink-300">
                Key: Decoder positions are <strong>independent</strong> of encoder positions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Step Indicator */}
      <div className="text-center py-4">
        <div className="inline-flex items-center gap-2 bg-pink-700/50 rounded-lg px-6 py-3 border border-pink-600">
          <span className="text-pink-300 font-medium">
            ✨ Ready for Masked Self-Attention
          </span>
        </div>
      </div>
    </div>
  );
}