'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVisualizationStore } from '../../store/visualizationStore';
import { getEmbedding } from '../../lib/transformerLogic';
import { TIMINGS, CONFIG } from '../../lib/constants';
import Vector from '../shared/Vector';

export default function EmbeddingLayer() {
  const { 
    tokens, 
    embeddings, 
    setEmbeddings, 
    currentStep, 
    isPlaying, 
    animationSpeed,
    config , 
    setCurrentStep
  } = useVisualizationStore();
  
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const dModel = config?.dModel || 6;

  // Generate embeddings when tokens are available
  useEffect(() => {
    if (tokens.length === 0) return;

    const newEmbeddings = tokens.map(token => getEmbedding(token, dModel));
    setEmbeddings(newEmbeddings);
  }, [tokens, dModel, setEmbeddings ]);

  // Create and manage animation timeline
  useEffect(() => {
    if (!containerRef.current || embeddings.length === 0 || currentStep !== 'embedding') return;

    // Kill existing timeline if any
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // Create new timeline
    const tl = gsap.timeline({ 
      paused: true,
      timeScale: animationSpeed ,
         onComplete: () => {
      console.log('EmbeddingLayer animation complete. Advancing to positional.');
      setCurrentStep('positional');
    }
    });
    timelineRef.current = tl;

    // Animate each token -> embedding transformation
    embeddings.forEach((_, idx) => {
      tl.fromTo(
        `.token-${idx}`,
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, duration: TIMINGS.fadeInOut, ease: 'power2.out' }
      )
      .fromTo(
        `.arrow-${idx}`,
        { opacity: 0, scaleX: 0 },
        { opacity: 1, scaleX: 1, duration: 0.4, ease: 'power2.out' },
        '-=0.2'
      )
      .fromTo(
        `.embedding-${idx}`,
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
        `.embedding-${idx}`,
        {
          boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
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
  }, [embeddings, currentStep, animationSpeed ,setCurrentStep]);

  // Handle play/pause toggle
  useEffect(() => {
    if (!timelineRef.current) return;

    if (currentStep === 'embedding') {
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

  if (embeddings.length === 0 || currentStep !== 'embedding') return null;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
        <h2 className="text-2xl font-bold text-white">Step 2: Input Embedding</h2>
      </div>

      {/* Description */}
      <p className="text-slate-300 text-sm max-w-2xl">
        Each token is converted into a dense vector of dimension {dModel}. 
        These vectors represent the semantic meaning of each word in a continuous space.
      </p>

      {/* Visualization Area */}
      <div className="bg-slate-700/30 rounded-xl p-8 border border-slate-600/50">
        <div className="space-y-8">
          {embeddings.map((embedding, idx) => (
            <div key={idx} className="flex items-center gap-6 justify-center">
              {/* Token */}
              <div className={`token-${idx} opacity-0`}>
                <div className="bg-blue-500/20 px-6 py-3 rounded-lg border border-blue-400/50">
                  <div className="text-sm text-blue-300 font-semibold mb-1">Token</div>
                  <div className="text-xl font-mono font-bold text-white">
                    "{tokens[idx]}"
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className={`arrow-${idx} opacity-0 flex items-center gap-2`}>
                <div className="text-purple-400 text-sm font-medium">Embed</div>
                <svg width="60" height="30" className="text-purple-400">
                  <defs>
                    <marker 
                      id={`arrowhead-${idx}`} 
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
                    markerEnd={`url(#arrowhead-${idx})`} 
                  />
                </svg>
              </div>

              {/* Embedding Vector */}
              <div className={`embedding-${idx} opacity-0`}>
                <Vector 
                  values={embedding} 
                  label={`e(${tokens[idx]})`}
                  color="#A855F7"
                  showValues={true}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-2xl">🔢</div>
          <div>
            <div className="font-semibold text-purple-300 mb-1">Understanding Embeddings</div>
            <p className="text-purple-200 text-sm mb-2">
              Each word is now represented as a vector with {dModel} numbers. 
              Similar words will have similar vectors.
            </p>
            <div className="bg-slate-700/50 rounded px-3 py-2 font-mono text-xs text-slate-300">
              <div className="mb-1">In real transformers:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-400">
                <li>Embeddings are learned during training</li>
                <li>Typical dimension: 512 or 768</li>
                <li>Words with similar meanings cluster together</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}