'use client';

import { Play, Pause, RotateCcw, Gauge, SkipBack, SkipForward } from 'lucide-react';
import { useVisualizationStore } from '@/store/visualizationStore';

export default function AnimationControls() {
  const {
    isPlaying,
    animationSpeed,
    togglePlay,
    setAnimationSpeed,
    resetVisualization,
    nextStep,
    previousStep,
    currentStep
  } = useVisualizationStore();

  const speeds = [
    { value: 0.5, label: '0.5x' },
    { value: 1, label: '1x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' }
  ];

  const steps = ['idle', 'tokenizing', 'embedding', 'positional', 'attention'];
  const currentIndex = steps.indexOf(currentStep);
  const canGoBack = currentIndex > 1;
  const canGoForward = currentIndex < steps.length - 1;

  return (
    <div className="flex items-center gap-2">
      {/* Step Back */}
      <button
        onClick={previousStep}
        disabled={!canGoBack}
        className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Previous step"
      >
        <SkipBack className="w-4 h-4 text-slate-300" />
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

      {/* Step Forward */}
      <button
        onClick={nextStep}
        disabled={!canGoForward}
        className="p-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg transition-colors border border-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
        title="Next step"
      >
        <SkipForward className="w-4 h-4 text-slate-300" />
      </button>

      <div className="h-8 w-px bg-slate-600 mx-1" />

      {/* Speed Control */}
      <div className="flex items-center gap-2 bg-slate-700/50 rounded-lg px-3 py-2 border border-slate-600">
        <Gauge className="w-4 h-4 text-slate-400" />
        <div className="flex gap-1">
          {speeds.map((speed) => (
            <button
              key={speed.value}
              onClick={() => setAnimationSpeed(speed.value)}
              className={`
                px-2 py-1 rounded text-xs font-medium transition-all
                ${animationSpeed === speed.value
                  ? 'bg-purple-500 text-white shadow-lg scale-110'
                  : 'text-slate-400 hover:text-slate-300 hover:bg-slate-600/50'
                }
              `}
            >
              {speed.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-8 w-px bg-slate-600 mx-1" />

      {/* Reset Button */}
      <button
        onClick={resetVisualization}
        className="flex items-center gap-2 px-3 py-2 bg-slate-700/50 hover:bg-red-500/20 hover:border-red-400/50 rounded-lg transition-colors border border-slate-600 group"
        title="Reset visualization"
      >
        <RotateCcw className="w-4 h-4 text-slate-300 group-hover:text-red-400 group-hover:rotate-180 transition-all duration-500" />
      </button>
    </div>
  );
}