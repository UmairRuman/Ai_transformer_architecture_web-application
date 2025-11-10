'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVisualizationStore } from '../../store/visualizationStore';
import { getEmbedding } from '../../lib/transformerLogic';
import { TIMINGS } from '../../lib/constants';
import Vector from '../shared/Vector';

export default function DecoderEmbedding() {
  const { 
    decoderTokens, 
    decoderEmbeddings, 
    setDecoderEmbeddings, 
    currentStep, 
    isPlaying, 
    animationSpeed,
    config,
    targetLanguage,
    setCurrentStep
  } = useVisualizationStore();
  
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const dModel = config?.dModel || 6;

  // Generate decoder embeddings when tokens are available
  useEffect(() => {
    if (decoderTokens.length === 0) return;

    const newEmbeddings = decoderTokens.map(token => getEmbedding(token, dModel));
    setDecoderEmbeddings(newEmbeddings);
  }, [decoderTokens, dModel, setDecoderEmbeddings]);

  // Create and manage animation timeline
  useEffect(() => {
    if (!containerRef.current || decoderEmbeddings.length === 0 || currentStep !== 'decoder_embedding') return;

    // Kill existing timeline if any
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline
    const tl = gsap.timeline({ 
      paused: true,
      timeScale: animationSpeed,
      onComplete: () => {
        console.log('DecoderEmbedding animation complete. Advancing to decoder_positional.');
        setCurrentStep('decoder_positional');
      }
    });
    timelineRef.current = tl;

    // Animate each token -> embedding transformation
    decoderEmbeddings.forEach((_, idx) => {
      tl.fromTo(
        `.decoder-token-${idx}`,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: TIMINGS.fadeInOut, ease: 'power2.out' }
      )
      .fromTo(
        `.decoder-arrow-${idx}`,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.2'
      )
      .fromTo(
        `.decoder-embedding-${idx}`,
        { opacity: 0, x: 30, scale: 0.8 },
        { 
          opacity: 1, 
          x: 0, 
          scale: 1, 
          duration: TIMINGS.embedding, 
          ease: 'back.out(1.7)' 
        },
        '-=0.3'
      )
      .to(
        `.decoder-embedding-${idx}`,
        {
          boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)',
          duration: 0.3,
          repeat: 1,
          yoyo: true
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
  }, [decoderEmbeddings, currentStep, animationSpeed, setCurrentStep]);

  // Handle play/pause toggle
  useEffect(() => {
    if (!timelineRef.current) return;

    if (currentStep === 'decoder_embedding') {
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

  if (decoderEmbeddings.length === 0 || currentStep !== 'decoder_embedding') return null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Decoder Step 2: Output Embedding</h2>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm max-w-2xl">
        Each target token (including <span className="font-mono bg-pink-500/20 px-2 py-0.5 rounded text-pink-300">&lt;START&gt;</span>) 
        is converted into a dense vector of dimension {dModel}. These embeddings will help generate the {targetLanguage} translation.
      </p>

      {/* Visualization Area */}
      <div className="bg-slate-700/30 rounded-xl p-8 border border-pink-600/30">
        <div className="space-y-8">
          {decoderEmbeddings.map((embedding, idx) => (
            <div key={idx} className="flex items-center gap-6 justify-center">
              {/* Token */}
              <div className={`decoder-token-${idx} opacity-0`}>
                <div className="bg-pink-500/20 px-6 py-3 rounded-lg border border-pink-400/50">
                  <div className="text-sm text-pink-300 font-semibold mb-1">
                    {decoderTokens[idx] === '<START>' ? 'Start Token' : 'Target Token'}
                  </div>
                  <div className="text-xl font-mono font-bold text-white">
                    {decoderTokens[idx] === '<START>' ? '⏵' : `"${decoderTokens[idx]}"`}
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className={`decoder-arrow-${idx} opacity-0 flex items-center gap-2`}>
                <div className="text-pink-400 text-sm font-medium">Embed</div>
                <svg width="60" height="30" className="text-pink-400">
                  <defs>
                    <marker 
                      id={`decoder-arrowhead-${idx}`} 
                      markerWidth="10" 
                      markerHeight="10" 
                      refX="9" 
                      refY="3" 
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
                    </marker>
                  </defs>
                  <line 
                    x1="0" 
                    y1="15" 
                    x2="50" 
                    y2="15" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    markerEnd={`url(#decoder-arrowhead-${idx})`} 
                  />
                </svg>
              </div>

              {/* Embedding Vector */}
              <div className={`decoder-embedding-${idx} opacity-0`}>
                <Vector 
                  values={embedding} 
                  label={`d(${decoderTokens[idx] === '<START>' ? 'START' : decoderTokens[idx]})`}
                  color="#EC4899"
                  showValues={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-pink-500/10 border border-pink-400/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🎯</div>
          <div>
            <div className="font-semibold text-pink-300 mb-1">Decoder Embeddings</div>
            <p className="text-pink-200 text-sm mb-2">
              The decoder uses the same embedding dimension ({dModel}) as the encoder but learns separate embeddings 
              for the {targetLanguage} vocabulary. Notice the special <span className="font-mono bg-pink-500/20 px-1 rounded">&lt;START&gt;</span> token 
              that signals the beginning of generation.
            </p>
            <div className="bg-slate-700/50 rounded px-3 py-2 font-mono text-xs text-slate-300">
              <div className="mb-1">Key Differences:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Decoder embeddings represent TARGET language vocabulary</li>
                <li>Special tokens like &lt;START&gt; and &lt;END&gt; guide generation</li>
                <li>These will be combined with positional encodings next</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 pt-4">
        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm text-green-300 font-medium">
          Decoder embeddings ready → Next: Positional Encoding
        </span>
      </div>
    </div>
  );
}