import gsap from 'gsap';
import { TIMINGS } from './constants';

// Utility function to animate vector movement
export const animateVectorMove = (element, x, y, duration = TIMINGS.vectorMove) => {
  return gsap.to(element, {
    x,
    y,
    duration,
    ease: 'power2.inOut'
  });
};

// Utility function to fade in elements
export const fadeIn = (element, duration = TIMINGS.fadeInOut) => {
  return gsap.fromTo(
    element,
    { opacity: 0, scale: 0.8 },
    { opacity: 1, scale: 1, duration, ease: 'back.out(1.7)' }
  );
};

// Utility function to fade out elements
export const fadeOut = (element, duration = TIMINGS.fadeInOut) => {
  return gsap.to(element, {
    opacity: 0,
    scale: 0.8,
    duration,
    ease: 'power2.in'
  });
};

// Pulse animation
export const pulse = (element, scale = 1.1, duration = 0.5) => {
  return gsap.to(element, {
    scale,
    duration,
    yoyo: true,
    repeat: 1,
    ease: 'power2.inOut'
  });
};

// Utility function for matrix multiplication animation
export const animateMatrixMultiply = (matrixEl, vectorEl, resultEl) => {
  const tl = gsap.timeline();
  
  tl.to(matrixEl, { scale: 1.05, duration: 0.2, ease: 'power2.out' })
    .to(vectorEl, { x: 20, duration: TIMINGS.matrixMultiply / 2, ease: 'power2.inOut' }, '<')
    .to(resultEl, { opacity: 1, scale: 1, duration: TIMINGS.fadeInOut }, '-=0.3')
    .to(matrixEl, { scale: 1, duration: 0.2, ease: 'power2.in' });
  
  return tl;
};

// Create timeline for attention mechanism
export const createAttentionTimeline = () => {
  return gsap.timeline({ paused: true });
};

// Animate dot product calculation
export const animateDotProduct = (vec1El, vec2El, resultEl) => {
  const tl = gsap.timeline();
  
  tl.to([vec1El, vec2El], {
    scale: 1.1,
    duration: 0.3,
    ease: 'power2.out'
  })
  .to(resultEl, {
    opacity: 1,
    scale: 1,
    duration: TIMINGS.dotProduct,
    ease: 'back.out(1.7)'
  })
  .to([vec1El, vec2El], {
    scale: 1,
    duration: 0.3,
    ease: 'power2.in'
  });
  
  return tl;
};

// Animate softmax transformation
export const animateSoftmax = (elements) => {
  const tl = gsap.timeline();
  
  elements.forEach((el, idx) => {
    tl.to(el, {
      scale: 1.1,
      backgroundColor: '#10B981',
      duration: 0.2,
      ease: 'power2.out'
    }, idx * 0.1)
    .to(el, {
      scale: 1,
      duration: 0.2,
      ease: 'power2.in'
    });
  });
  
  return tl;
};

// Flow animation (for data flowing between components)
export const animateFlow = (startEl, endEl, particleColor = '#3B82F6') => {
  // This would create a particle that flows from start to end
  // Implementation depends on DOM structure
  const tl = gsap.timeline();
  
  // Get positions
  const startRect = startEl.getBoundingClientRect();
  const endRect = endEl.getBoundingClientRect();
  
  // Create particle (you'd need to create this element)
  const particle = document.createElement('div');
  particle.style.cssText = `
    position: fixed;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${particleColor};
    pointer-events: none;
    z-index: 1000;
  `;
  document.body.appendChild(particle);
  
  tl.set(particle, {
    left: startRect.left + startRect.width / 2,
    top: startRect.top + startRect.height / 2
  })
  .to(particle, {
    left: endRect.left + endRect.width / 2,
    top: endRect.top + endRect.height / 2,
    duration: TIMINGS.vectorMove,
    ease: 'power2.inOut',
    onComplete: () => particle.remove()
  });
  
  return tl;
};