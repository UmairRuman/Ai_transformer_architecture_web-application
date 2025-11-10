'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { COLORS } from '../../lib/constants';

export default function HeroAnimation() {
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const [currentPhase, setCurrentPhase] = useState('');

  useEffect(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({ 
      repeat: -1, 
      repeatDelay: 2,
      onUpdate: function() {
        const progress = this.progress();
        if (progress < 0.15) setCurrentPhase('Tokenizing...');
        else if (progress < 0.35) setCurrentPhase('Encoding...');
        else if (progress < 0.55) setCurrentPhase('Attention Applied');
        else if (progress < 0.75) setCurrentPhase('Decoding...');
        else if (progress < 0.95) setCurrentPhase('Translating...');
        else setCurrentPhase('Complete! ✨');
      }
    });
    timelineRef.current = tl;

    // Intro: Tokens appear
    tl.fromTo('.token-box',
      { opacity: 0, scale: 0.3, y: 30, rotateX: -90 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0,
        rotateX: 0,
        duration: 0.6, 
        stagger: 0.15,
        ease: 'back.out(2)'
      }
    )
    
    // Tokens pulse with glow
    .to('.token-box', {
      boxShadow: `0 0 20px ${COLORS.query}`,
      scale: 1.05,
      duration: 0.3,
      stagger: 0.1
    })
    
    // Tokens flow to encoder
    .to('.token-box', {
      x: -15,
      opacity: 0.7,
      duration: 0.4,
      stagger: 0.1
    })
    
    // Arrow appears
    .to('.arrow-encoder', {
      opacity: 1,
      scaleX: 1,
      duration: 0.5,
      ease: 'power2.inOut'
    }, '-=0.3')
    
    // Encoder activates with particles
    .to('.encoder-box', {
      scale: 1.15,
      boxShadow: `0 0 40px ${COLORS.query}, 0 0 80px ${COLORS.query}50`,
      duration: 0.4,
      ease: 'power2.out'
    })
    
    // Show attention heads activating
    .to('.attention-head', {
      opacity: 1,
      scale: 1,
      rotation: 360,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, '-=0.2')
    
    // Particles burst from encoder
    .to('.particle', {
      opacity: 1,
      scale: [0, 1.5, 1],
      duration: 0.3,
      stagger: 0.1
    })
    
    // Particles flow to decoder
    .to('.particle', {
      x: 250,
      y: (i) => (i - 1) * 8, // Spread vertically
      duration: 1,
      stagger: 0.15,
      ease: 'power1.inOut'
    })
    
    // Decoder activates
    .to('.decoder-box', {
      scale: 1.15,
      boxShadow: `0 0 40px ${COLORS.value}, 0 0 80px ${COLORS.value}50`,
      duration: 0.4,
      ease: 'power2.out'
    }, '-=0.5')
    
    // Decoder heads activate
    .to('.decoder-head', {
      opacity: 1,
      scale: 1,
      rotation: -360,
      duration: 0.5,
      stagger: 0.1,
      ease: 'back.out(1.7)'
    }, '-=0.3')
    
    // Reset encoder/decoder
    .to(['.encoder-box', '.decoder-box'], {
      scale: 1,
      boxShadow: 'none',
      duration: 0.3
    })
    
    // Output appears with typewriter effect
    .to('.output-word', {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.4,
      stagger: 0.2,
      ease: 'back.out(1.7)'
    })
    
    // Final celebration
    .to('.output-container', {
      boxShadow: `0 0 30px rgba(236, 72, 153, 0.6)`,
      duration: 0.3
    })
    
    // Confetti burst
    .to('.confetti', {
      opacity: 1,
      y: -30,
      x: (i) => (i - 1.5) * 20,
      rotation: (i) => i * 120,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.3')
    
    // Hold final state
    .to({}, { duration: 1.5 })
    
    // Fade out everything
    .to(['.token-box', '.encoder-box', '.decoder-box', '.output-word', '.arrow-encoder', '.particle', '.attention-head', '.decoder-head', '.confetti'], {
      opacity: 0,
      scale: 0.8,
      duration: 0.5
    });

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-96 flex items-center justify-center overflow-hidden">
      {/* Status Label */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-800/90 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/50 z-10">
        <span className="text-sm font-mono text-purple-300">{currentPhase}</span>
      </div>

      {/* Input Tokens */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <div className="text-xs text-purple-300 font-semibold mb-1">Input:</div>
        {['We', 'are', 'best'].map((word, idx) => (
          <div
            key={idx}
            className="token-box bg-blue-500/30 px-5 py-2 rounded-lg border-2 border-blue-400 font-mono text-white opacity-0 font-semibold"
          >
            {word}
          </div>
        ))}
      </div>

      {/* Arrow to Encoder */}
      <div className="arrow-encoder absolute left-36 top-1/2 -translate-y-1/2 opacity-0 origin-left scale-x-0">
        <svg width="70" height="30" className="text-blue-400">
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
              <polygon points="0 0, 10 3, 0 6" fill="currentColor" />
            </marker>
          </defs>
          <line x1="0" y1="15" x2="60" y2="15" stroke="currentColor" strokeWidth="3" markerEnd="url(#arrowhead)" strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" from="10" to="0" dur="1s" repeatCount="indefinite" />
          </line>
        </svg>
      </div>

      {/* Encoder */}
      <div className="encoder-box absolute left-56 top-1/2 -translate-y-1/2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm p-6 rounded-xl border-2 border-blue-400/50 shadow-lg">
        <div className="text-center relative">
          <div className="text-xs text-blue-300 font-semibold mb-2 uppercase tracking-wide">Encoder</div>
          <div className="w-24 h-24 bg-blue-500/30 rounded-lg border border-blue-400 flex items-center justify-center relative">
            <div className="text-3xl">🧠</div>
            
            {/* Attention Heads */}
            <div className="attention-head absolute -top-2 -left-2 w-5 h-5 bg-yellow-400 rounded-full opacity-0 scale-0" />
            <div className="attention-head absolute -top-2 -right-2 w-5 h-5 bg-orange-400 rounded-full opacity-0 scale-0" />
            <div className="attention-head absolute -bottom-2 -left-2 w-5 h-5 bg-cyan-400 rounded-full opacity-0 scale-0" />
            <div className="attention-head absolute -bottom-2 -right-2 w-5 h-5 bg-green-400 rounded-full opacity-0 scale-0" />
          </div>
        </div>
      </div>

      {/* Particles flowing from Encoder to Decoder */}
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="particle absolute left-[340px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full opacity-0"
          style={{
            backgroundColor: i === 0 ? '#A855F7' : i === 1 ? '#3B82F6' : '#EC4899',
            boxShadow: `0 0 10px ${i === 0 ? '#A855F7' : i === 1 ? '#3B82F6' : '#EC4899'}`
          }}
        />
      ))}

      {/* Decoder */}
      <div className="decoder-box absolute right-56 top-1/2 -translate-y-1/2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm p-6 rounded-xl border-2 border-purple-400/50 shadow-lg">
        <div className="text-center relative">
          <div className="text-xs text-purple-300 font-semibold mb-2 uppercase tracking-wide">Decoder</div>
          <div className="w-24 h-24 bg-purple-500/30 rounded-lg border border-purple-400 flex items-center justify-center relative">
            <div className="text-3xl">✨</div>
            
            {/* Decoder Heads */}
            <div className="decoder-head absolute -top-2 -left-2 w-5 h-5 bg-pink-400 rounded-full opacity-0 scale-0" />
            <div className="decoder-head absolute -top-2 -right-2 w-5 h-5 bg-purple-400 rounded-full opacity-0 scale-0" />
            <div className="decoder-head absolute -bottom-2 -left-2 w-5 h-5 bg-fuchsia-400 rounded-full opacity-0 scale-0" />
            <div className="decoder-head absolute -bottom-2 -right-2 w-5 h-5 bg-violet-400 rounded-full opacity-0 scale-0" />
          </div>
        </div>
      </div>

      {/* Output */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-3">
        <div className="text-xs text-purple-300 font-semibold mb-1">Output:</div>
        <div className="output-container bg-gradient-to-r from-purple-500/30 to-pink-500/30 px-6 py-4 rounded-lg border-2 border-purple-400 relative">
          <div className="flex flex-col gap-2">
            <div className="output-word font-mono text-white opacity-0 translate-y-2 scale-90 font-semibold text-lg">
              Nous
            </div>
            <div className="output-word font-mono text-white opacity-0 translate-y-2 scale-90 font-semibold text-lg">
              sommes
            </div>
            <div className="output-word font-mono text-white opacity-0 translate-y-2 scale-90 font-semibold text-lg">
              meilleurs
            </div>
          </div>
          
          {/* Confetti */}
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="confetti absolute w-2 h-2 opacity-0"
              style={{
                backgroundColor: ['#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4'][i],
                left: '50%',
                top: '50%'
              }}
            />
          ))}
        </div>
      </div>

      {/* Decorative animated background dots */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-1/4 w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        <div className="absolute bottom-8 right-1/4 w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-12 right-12 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
        <div className="absolute bottom-12 left-12 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.8s' }} />
      </div>

      {/* Grid background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: 'linear-gradient(rgba(147, 51, 234, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.3) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
      </div>
    </div>
  );
}