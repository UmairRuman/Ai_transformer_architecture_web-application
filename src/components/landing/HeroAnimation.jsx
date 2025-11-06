'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { COLORS, TIMINGS } from '@/lib/constants';

export default function HeroAnimation() {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the animation timeline
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    timelineRef.current = tl;

    // Animation sequence
    tl.fromTo('.token-box',
      { opacity: 0, scale: 0.5, y: 20 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.2,
        ease: 'back.out(1.7)'
      }
    )
    .to('.token-box', {
      y: -10,
      duration: 0.3,
      stagger: 0.1,
      ease: 'power2.out'
    })
    .to('.token-box', {
      backgroundColor: COLORS.query,
      scale: 1.1,
      duration: 0.4,
      stagger: 0.1
    }, '+=0.3')
    .to('.arrow-encoder', {
      opacity: 1,
      x: 0,
      duration: 0.5,
      ease: 'power2.inOut'
    })
    .to('.encoder-box', {
      scale: 1.1,
      boxShadow: `0 0 30px ${COLORS.query}`,
      duration: 0.3
    })
    .to('.encoder-box', {
      scale: 1,
      duration: 0.3
    })
    .to('.particle', {
      opacity: 1,
      x: 150,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power2.inOut'
    })
    .to('.decoder-box', {
      scale: 1.1,
      boxShadow: `0 0 30px ${COLORS.value}`,
      duration: 0.3
    })
    .to('.decoder-box', {
      scale: 1,
      duration: 0.3
    })
    .to('.output-text', {
      opacity: 1,
      y: 0,
      duration: 0.5,
      ease: 'back.out(1.7)'
    })
    .to({}, { duration: 1.5 }) // Pause at the end
    .to(['.token-box', '.encoder-box', '.decoder-box', '.output-text', '.arrow-encoder', '.particle'], {
      opacity: 0,
      duration: 0.5
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-80 flex items-center justify-center">
      {/* Input Tokens */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <div className="text-sm text-purple-300 font-semibold mb-1">Input:</div>
        <div className="token-box bg-blue-500/30 px-4 py-2 rounded-lg border-2 border-blue-400 font-mono text-white opacity-0">
          We
        </div>
        <div className="token-box bg-blue-500/30 px-4 py-2 rounded-lg border-2 border-blue-400 font-mono text-white opacity-0">
          are
        </div>
        <div className="token-box bg-blue-500/30 px-4 py-2 rounded-lg border-2 border-blue-400 font-mono text-white opacity-0">
          best
        </div>
      </div>

      {/* Arrow to Encoder */}
      <div className="arrow-encoder absolute left-32 top-1/2 -translate-y-1/2 opacity-0 -translate-x-5">
        <svg width="60" height="30" className="text-blue-400">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
            </marker>
          </defs>
          <line x1="0" y1="15" x2="50" y2="15" stroke="currentColor" strokeWidth="2" markerEnd="url(#arrowhead)" />
        </svg>
      </div>

      {/* Encoder */}
      <div className="encoder-box absolute left-52 top-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm p-6 rounded-xl border-2 border-blue-400/50 shadow-lg">
        <div className="text-center">
          <div className="text-xs text-blue-300 font-semibold mb-2">ENCODER</div>
          <div className="w-20 h-20 bg-blue-500/30 rounded-lg border border-blue-400 flex items-center justify-center">
            <div className="text-2xl">🧠</div>
          </div>
        </div>
      </div>

      {/* Particles flowing from Encoder to Decoder */}
      <div className="particle absolute left-80 top-[45%] w-3 h-3 bg-purple-400 rounded-full opacity-0" />
      <div className="particle absolute left-80 top-1/2 w-3 h-3 bg-blue-400 rounded-full opacity-0" />
      <div className="particle absolute left-80 top-[55%] w-3 h-3 bg-pink-400 rounded-full opacity-0" />

      {/* Decoder */}
      <div className="decoder-box absolute right-52 top-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-6 rounded-xl border-2 border-purple-400/50 shadow-lg">
        <div className="text-center">
          <div className="text-xs text-purple-300 font-semibold mb-2">DECODER</div>
          <div className="w-20 h-20 bg-purple-500/30 rounded-lg border border-purple-400 flex items-center justify-center">
            <div className="text-2xl">✨</div>
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <div className="text-sm text-purple-300 font-semibold mb-1">Output:</div>
        <div className="output-text bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-6 py-3 rounded-lg border-2 border-purple-400 font-mono text-white opacity-0 translate-y-5 text-center">
          Nous sommes<br/>meilleurs
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute bottom-4 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}