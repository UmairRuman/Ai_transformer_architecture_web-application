'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function HeroAnimation() {
  const containerRef = useRef(null);
  const isAnimatingRef = useRef(false);

  useEffect(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const container = containerRef.current;
    if (!container) return;

    // Demo sentence
    const demoSentence = "AI is powerful";
    const tokens = demoSentence.split(' ');
    
    // Timeline for continuous animation
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 });

    // Phase 1: Show sentence
    tl.fromTo('.demo-sentence',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
    );

    // Phase 2: Tokenize
    tl.to('.demo-sentence', {
      opacity: 0,
      duration: 0.4,
      delay: 1
    });

    tl.fromTo('.demo-token',
      { opacity: 0, scale: 0.8, y: 20 },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.5,
        stagger: 0.15,
        ease: 'back.out(1.7)'
      }
    );

    // Phase 3: Convert to vectors
    tl.to('.demo-token', {
      scale: 0.9,
      opacity: 0.6,
      duration: 0.3,
      delay: 0.8
    });

    tl.fromTo('.demo-vector',
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: 'power2.out'
      }
    );

    // Phase 4: Flow through encoder
    tl.to('.demo-vector', {
      x: 100,
      opacity: 0.8,
      duration: 1.2,
      stagger: 0.1,
      ease: 'power1.inOut',
      delay: 0.8
    });

    // Phase 5: Output
    tl.fromTo('.demo-output',
      { opacity: 0, scale: 0.8, y: 20 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: 0.8,
        ease: 'back.out(1.7)'
      }
    );

    // Fade out everything for loop
    tl.to('.demo-sentence, .demo-token, .demo-vector, .demo-output', {
      opacity: 0,
      duration: 0.6,
      delay: 1.5
    });

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative h-64 flex items-center justify-center overflow-hidden">
      {/* Sentence Display */}
      <div className="demo-sentence absolute text-2xl font-bold text-white">
        "AI is powerful"
      </div>

      {/* Tokens */}
      <div className="absolute flex gap-4 opacity-0">
        {["AI", "is", "powerful"].map((token, i) => (
          <div
            key={i}
            className="demo-token px-4 py-2 bg-purple-500/30 backdrop-blur-sm rounded-lg border border-purple-400/50 text-white font-mono"
          >
            {token}
          </div>
        ))}
      </div>

      {/* Vectors */}
      <div className="absolute flex gap-3 opacity-0">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="demo-vector flex flex-col gap-1"
          >
            {[0, 1, 2, 3, 4, 5].map((j) => (
              <div
                key={j}
                className="w-12 h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                style={{ 
                  opacity: 0.7 + (j * 0.05),
                  width: `${30 + Math.random() * 20}px`
                }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Output */}
      <div className="demo-output absolute opacity-0">
        <div className="flex items-center gap-3 bg-green-500/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-green-400/50">
          <span className="text-green-300 text-lg">✓</span>
          <span className="text-white font-semibold">Processed Successfully</span>
        </div>
      </div>

      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
    </div>
  );
}