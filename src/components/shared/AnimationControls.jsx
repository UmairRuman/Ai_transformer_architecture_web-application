'use client';

import { Play, Pause, RotateCcw, Gauge, ChevronLeft, ChevronRight } from 'lucide-react';
import { useVisualizationStore } from '@/store/visualizationStore';

export default function AnimationControls() {
  const {
    isPlaying,
    animationSpeed,
    currentStep,
    togglePlay,
    setAnimationSpeed,
    restartAnimation,
    nextStep,
    previousStep
  } = useVisualizationStore();

  const speeds = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
  ];

  const steps = ['tokenizing', 'embedding', 'positional', 'attention'];
  const currentIndex = steps.indexOf(currentStep);
  const isFirstStep = currentIndex === 0 || currentStep === 'idle';
  const isLastStep = currentIndex === steps.length - 1;

  return (
    <div className="flex items-center gap-3">
      {/* Previous Button */}
      <button
        onClick={previousStep}
        disabled={isFirstStep}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border
          ${isFirstStep
            ? 'bg-slate-700/30 border-slate-600/50 text-slate-500 cursor-not-allowed'
            : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-slate-300'
          }
        `}
        title="Previous step"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors shadow-lg shadow-purple-500/30"
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4 text-white fill-white" />
            <span className="text-white text-sm font-medium">Pause</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 text-white fill-white" />
            <span className="text-white text-sm font-medium">Play</span>
          </>
        )}
      </button>

      {/* Next Button */}
      <button
        onClick={nextStep}
        disabled={isLastStep}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-colors border
          ${isLastStep
            ? 'bg-slate-700/30 border-slate-600/50 text-slate-500 cursor-not-allowed'
            : 'bg-slate-700/50 hover:bg-slate-600/50 border-slate-600 text-slate-300'
          }
        `}
        title="Next step"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Divider */}
      <div className="h-8 w-px bg-slate-600" />

      {/* Speed Control */}
      <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-600">
        <Gauge className="w-4 h-4 text-slate-400" />
        <div className="flex gap-1">
          {speeds.map((speed) => (
            <button
              key={speed.value}
              onClick={() => setAnimationSpeed(speed.value)}
              className={`
                px-2 py-1 rounded text-xs font-medium transition-colors
                ${animationSpeed === speed.value
                  ? 'bg-purple-500 text-white'
                  : 'text-slate-400 hover:text-slate-300'
                }
              `}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Animation Button */}
      <button
        onClick={restartAnimation}
        className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600"
        title="Restart animation from beginning"
      >
        <RotateCcw className="w-4 h-4 text-slate-300" />
        <span className="text-slate-300 text-sm font-medium">Reset</span>
      </button>
    </div>
  );
}