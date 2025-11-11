import { Info } from 'lucide-react';
import { useState } from 'react';

/**
 * ComponentBlock - Reusable block for architecture diagram
 * Represents each layer/component in the Transformer
 */
export default function ComponentBlock({ 
  id,
  label, 
  sublabel = '',
  state = 'locked', // 'locked' | 'active' | 'completed'
  onClick,
  tooltip = '',
  color = 'blue',
  width = 'w-40',
  height = 'h-16'
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Color schemes matching your existing design
  const colorSchemes = {
    blue: {
      active: 'border-blue-400 bg-blue-500/20 shadow-[0_0_25px_rgba(96,165,250,0.6)]',
      completed: 'border-green-400 bg-green-500/10 hover:bg-green-500/20',
      locked: 'border-slate-600 bg-slate-800/50'
    },
    orange: {
      active: 'border-orange-400 bg-orange-500/20 shadow-[0_0_25px_rgba(251,146,60,0.6)]',
      completed: 'border-green-400 bg-green-500/10 hover:bg-green-500/20',
      locked: 'border-slate-600 bg-slate-800/50'
    },
    purple: {
      active: 'border-purple-400 bg-purple-500/20 shadow-[0_0_25px_rgba(192,132,252,0.6)]',
      completed: 'border-green-400 bg-green-500/10 hover:bg-green-500/20',
      locked: 'border-slate-600 bg-slate-800/50'
    },
    cyan: {
      active: 'border-cyan-400 bg-cyan-500/20 shadow-[0_0_25px_rgba(34,211,238,0.6)]',
      completed: 'border-green-400 bg-green-500/10 hover:bg-green-500/20',
      locked: 'border-slate-600 bg-slate-800/50'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;
  const stateClass = scheme[state];
  
  const isClickable = state === 'completed' || state === 'active';
  const isActive = state === 'active';

  return (
    <div className="relative">
      {/* Main Block */}
      <div
        onClick={isClickable ? onClick : undefined}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`
          relative ${width} ${height}
          border-2 rounded-lg
          flex flex-col items-center justify-center
          transition-all duration-300
          ${stateClass}
          ${isActive ? 'scale-105 animate-pulse' : ''}
          ${isClickable ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed'}
        `}
      >
        {/* Animated glow for active state */}
        {isActive && (
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute inset-0 animate-ping opacity-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-lg" />
          </div>
        )}

        {/* Content */}
        <div className="relative z-10 text-center px-2">
          <div className={`
            font-mono font-semibold
            ${isActive ? 'text-white' : 'text-slate-300'}
            text-xs leading-tight
          `}>
            {label}
          </div>
          {sublabel && (
            <div className="text-[10px] text-slate-400 mt-0.5">
              {sublabel}
            </div>
          )}
        </div>

        {/* Status indicator */}
        {state === 'completed' && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {state === 'active' && (
          <div className="absolute -top-2 -right-2 w-5 h-5 bg-yellow-400 rounded-full animate-pulse border-2 border-slate-900" />
        )}

        {/* Info icon for tooltip */}
        {tooltip && state !== 'locked' && (
          <div className="absolute -top-1 -left-1">
            <Info className="w-3 h-3 text-slate-400" />
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && tooltip && state !== 'locked' && (
        <div className="absolute z-50 -top-20 left-1/2 transform -translate-x-1/2 w-56 p-3 bg-slate-800 border-2 border-purple-400 rounded-lg shadow-2xl text-xs text-slate-200 animate-fadeIn">
          {tooltip}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-800 border-b-2 border-r-2 border-purple-400 rotate-45" />
        </div>
      )}
    </div>
  );
}